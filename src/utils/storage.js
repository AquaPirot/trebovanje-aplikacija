// src/utils/storage.js
// Bez baze: osnovna lista artikala dolazi sa /api/items, a korisničke izmene
// (dodavanje / brisanje / izmena) čuvaju se lokalno u localStorage i spajaju
// se sa osnovnom listom. Osnovna lista se kešira radi offline rada.

const API_BASE =
  typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

const CUSTOM_KEY = 'trebovanje_custom_items_v1';
const DELETED_KEY = 'trebovanje_deleted_ids_v1';
const OVERRIDES_KEY = 'trebovanje_overrides_v1';
const BASE_CACHE_KEY = 'trebovanje_base_cache_v1';

const hasWindow = () => typeof window !== 'undefined';

function read(key, fallback) {
  if (!hasWindow()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

const getCustom = () => read(CUSTOM_KEY, []);
const getDeleted = () => read(DELETED_KEY, []);
const getOverrides = () => read(OVERRIDES_KEY, {});

// Spaja osnovnu listu sa lokalnim izmenama.
function mergeItems(base) {
  const deleted = getDeleted();
  const overrides = getOverrides();
  const custom = getCustom();

  const merged = [...base, ...custom]
    .filter((item) => !deleted.includes(item.id))
    .map((item) =>
      overrides[item.id] ? { ...item, ...overrides[item.id] } : item
    );

  return merged;
}

export const getItemsFromDatabase = async () => {
  let base = [];
  try {
    const response = await fetch(`${API_BASE}/api/items`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to fetch items');
    base = result.data || [];
    write(BASE_CACHE_KEY, base); // keš za offline
  } catch (error) {
    console.error('⚠️ Mreža nedostupna, koristim keš:', error);
    base = read(BASE_CACHE_KEY, []);
  }
  return mergeItems(base);
};

export const saveItemToDatabase = async (itemData) => {
  const custom = getCustom();
  const item = {
    id: `c_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: (itemData.name || '').toUpperCase(),
    category: itemData.category,
    unit: itemData.unit || 'kom',
    variants: itemData.variants || [],
  };
  if (!item.name || !item.category) {
    throw new Error('Naziv i kategorija su obavezni');
  }
  write(CUSTOM_KEY, [...custom, item]);
  return item;
};

export const updateItemInDatabase = async (itemId, updates) => {
  const custom = getCustom();
  const idx = custom.findIndex((i) => i.id === itemId);
  if (idx !== -1) {
    // korisnički artikal — menjamo direktno
    const next = [...custom];
    next[idx] = { ...next[idx], ...updates };
    write(CUSTOM_KEY, next);
    return next[idx];
  }
  // osnovni artikal — čuvamo override
  const overrides = getOverrides();
  overrides[itemId] = { ...(overrides[itemId] || {}), ...updates };
  write(OVERRIDES_KEY, overrides);
  return { id: itemId, ...updates };
};

export const deleteItemFromDatabase = async (itemId) => {
  const custom = getCustom();
  const isCustom = custom.some((i) => i.id === itemId);
  if (isCustom) {
    write(CUSTOM_KEY, custom.filter((i) => i.id !== itemId));
  } else {
    const deleted = getDeleted();
    if (!deleted.includes(itemId)) write(DELETED_KEY, [...deleted, itemId]);
    // očistimo eventualni override
    const overrides = getOverrides();
    if (overrides[itemId]) {
      delete overrides[itemId];
      write(OVERRIDES_KEY, overrides);
    }
  }
  return true;
};

export const listenToItems = (callback) => {
  let intervalId;
  const fetchItems = async () => {
    try {
      callback(await getItemsFromDatabase());
    } catch (error) {
      console.error('Polling error:', error);
    }
  };
  fetchItems();
  intervalId = setInterval(fetchItems, 30000);
  return () => intervalId && clearInterval(intervalId);
};
