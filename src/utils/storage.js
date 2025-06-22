// src/utils/storage.js
// SIGURNA VERZIJA

const API_BASE = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

export const saveItemToDatabase = async (itemData) => {
  try {
    const response = await fetch(`${API_BASE}/api/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to save item');
    }

    return result.data;
  } catch (error) {
    console.error('❌ Greška pri čuvanju:', error);
    throw error;
  }
};

export const getItemsFromDatabase = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/items`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch items');
    }

    return result.data || [];
  } catch (error) {
    console.error('❌ Greška pri učitavanju:', error);
    return [];
  }
};

export const deleteItemFromDatabase = async (itemId) => {
  try {
    const response = await fetch(`${API_BASE}/api/items?id=${itemId}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete item');
    }

    return true;
  } catch (error) {
    console.error('❌ Greška pri brisanju:', error);
    throw error;
  }
};

export const listenToItems = (callback) => {
  let intervalId;
  
  const fetchItems = async () => {
    try {
      const items = await getItemsFromDatabase();
      callback(items);
    } catch (error) {
      console.error('Polling error:', error);
    }
  };

  fetchItems();
  intervalId = setInterval(fetchItems, 30000);

  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
};