import { useState, useEffect, useCallback } from 'react';
import {
  getItemsFromDatabase,
  saveItemToDatabase,
  updateItemInDatabase,
  deleteItemFromDatabase,
  listenToItems,
} from '../utils/storage';
import { CATEGORY_ORDER, getCategoryMeta } from '../utils/categories';
import {
  generateOrderText,
  copyText,
  shareWhatsApp,
  shareTelegram,
  shareViber,
  shareNative,
  canShareNative,
  printOrder,
} from '../utils/share';
import {
  loadDraft,
  saveDraft,
  clearDraft,
  loadHistory,
  addToHistory,
  deleteHistory,
  loadTheme,
  saveTheme,
  applyTheme,
} from '../utils/localState';
import {
  Search, Plus, Minus, Copy, Send, Settings, Trash2, X, ShoppingCart,
  ArrowLeft, Moon, Sun, Monitor, History, Pencil, RotateCcw, Wine, Printer,
} from 'lucide-react';

/* ============================ Glavna komponenta ============================ */

export default function TrebovanjeApp() {
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState({});
  const [variants, setVariants] = useState({});
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [theme, setTheme] = useState('system');
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2200);
  }, []);

  /* ---- Učitavanje artikala + polling ---- */
  const refresh = useCallback(async () => {
    const data = await getItemsFromDatabase();
    setItems(data);
    return data;
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
    const unsubscribe = listenToItems((newItems) => {
      setItems(newItems);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [refresh]);

  /* ---- Tema ---- */
  useEffect(() => {
    const t = loadTheme();
    setTheme(t);
    applyTheme(t);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => loadTheme() === 'system' && applyTheme('system');
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const cycleTheme = () => {
    const next = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    setTheme(next);
    saveTheme(next);
    applyTheme(next);
  };

  /* ---- Draft (čuvanje trebovanja) ---- */
  useEffect(() => {
    const d = loadDraft();
    if (d) {
      setOrders(d.orders);
      setVariants(d.variants);
      setNotes(d.notes);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveDraft(orders, variants, notes);
  }, [orders, variants, notes, hydrated]);

  /* ---- Grupisanje ---- */
  const groupedItems = items.reduce((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});

  const allCategories = [...CATEGORY_ORDER];
  Object.keys(groupedItems).forEach((c) => {
    if (!allCategories.includes(c)) allCategories.push(c);
  });

  const filteredItems = searchTerm
    ? items.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : items;

  const filteredGroupedItems = filteredItems.reduce((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});

  /* ---- Trebovanje (orders) ---- */
  const updateOrder = (item, value) => {
    const quantity = parseFloat(parseFloat(value).toFixed(2));
    if (quantity > 0) {
      setOrders({ ...orders, [item.id]: quantity });
    } else {
      const newOrders = { ...orders };
      delete newOrders[item.id];
      setVariants((prev) => {
        const nv = { ...prev };
        delete nv[item.id];
        return nv;
      });
      setOrders(newOrders);
    }
  };

  const updateVariant = (itemId, variant) =>
    setVariants({ ...variants, [itemId]: variant });

  const totalItems = Object.keys(orders).length;

  const clearOrder = () => {
    if (totalItems === 0) return;
    if (!confirm('Obrisati celo trenutno trebovanje?')) return;
    setOrders({});
    setVariants({});
    setNotes('');
    clearDraft();
    showToast('Trebovanje obrisano', 'info');
  };

  /* ---- Deljenje / slanje ---- */
  const recordHistory = (text) => {
    const hist = loadHistory();
    if (hist[0] && hist[0].text === text) return; // izbegni duplikat
    addToHistory({ text, count: totalItems, orders, variants, notes });
  };

  const doShare = async (kind) => {
    if (totalItems === 0) {
      showToast('Trebovanje je prazno', 'error');
      return;
    }
    const text = generateOrderText(items, orders, variants, notes);
    if (kind === 'copy') {
      const ok = await copyText(text);
      showToast(ok ? 'Kopirano u clipboard!' : 'Greška pri kopiranju', ok ? 'success' : 'error');
    } else if (kind === 'whatsapp') {
      shareWhatsApp(text);
    } else if (kind === 'telegram') {
      shareTelegram(text);
    } else if (kind === 'viber') {
      shareViber(text);
    } else if (kind === 'native') {
      await shareNative(text);
    }
    recordHistory(text);
  };

  /* ---- Učitavanje iz istorije ---- */
  const loadFromHistory = (entry) => {
    setOrders(entry.orders || {});
    setVariants(entry.variants || {});
    setNotes(entry.notes || '');
    setShowHistory(false);
    setSelectedCategory(null);
    showToast('Trebovanje učitano', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Učitavam artikle...</p>
        </div>
      </div>
    );
  }

  const headerActions = (
    <div className="flex items-center gap-2">
      <IconButton title="Istorija" onClick={() => setShowHistory(true)}>
        <History className="w-5 h-5" />
      </IconButton>
      <IconButton title="Tema" onClick={cycleTheme}>
        {theme === 'system' ? <Monitor className="w-5 h-5" />
          : theme === 'light' ? <Sun className="w-5 h-5" />
          : <Moon className="w-5 h-5" />}
      </IconButton>
    </div>
  );

  /* =================== Ekran: detalji kategorije =================== */
  if (selectedCategory) {
    const meta = getCategoryMeta(selectedCategory);
    const categoryItems = searchTerm
      ? filteredGroupedItems[selectedCategory] || []
      : groupedItems[selectedCategory] || [];

    return (
      <Shell toast={toast}>
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3">
            <div className="flex items-center gap-3 mb-3">
              <IconButton title="Nazad" onClick={() => setSelectedCategory(null)}>
                <ArrowLeft className="w-5 h-5" />
              </IconButton>
              <span className={`grid place-items-center h-10 w-10 rounded-xl ${meta.tint}`}>
                <meta.Icon className={`w-5 h-5 ${meta.text}`} />
              </span>
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-lg font-bold truncate">{selectedCategory}</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">{categoryItems.length} artikala</p>
              </div>
              {headerActions}
            </div>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={`Pretraži u: ${selectedCategory}`}
            />
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-2.5 pb-28">
          {categoryItems.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              qty={orders[item.id]}
              variant={variants[item.id]}
              onQty={(v) => updateOrder(item, v)}
              onVariant={(v) => updateVariant(item.id, v)}
            />
          ))}
          {categoryItems.length === 0 && (
            <EmptyState
              text="Nema artikala u ovoj kategoriji"
              action={searchTerm ? { label: 'Obriši pretragu', onClick: () => setSearchTerm('') } : null}
            />
          )}
        </main>

        <CartBar total={totalItems} onOpen={() => setShowOrderSummary(true)} />
        <Modals
          {...{ showOrderSummary, setShowOrderSummary, showAddModal, setShowAddModal,
            showManageModal, setShowManageModal, showHistory, setShowHistory,
            editItem, setEditItem, orders, variants, items, notes, doShare,
            allCategories, refresh, showToast, loadFromHistory }}
        />
      </Shell>
    );
  }

  /* =================== Glavni ekran =================== */
  return (
    <Shell toast={toast}>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="grid place-items-center h-10 w-10 rounded-xl bg-sky-600 shrink-0">
                <Wine className="w-5 h-5 text-white" />
              </span>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold truncate">Trebovanje pića</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {allCategories.filter((c) => groupedItems[c]?.length > 0).length} kategorija • {items.length} artikala
                </p>
              </div>
            </div>
            {headerActions}
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => { setEditItem(null); setShowAddModal(true); }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-sky-600 hover:bg-sky-700 text-white transition"
            >
              <Plus className="w-4 h-4" /> Dodaj artikal
            </button>
            <button
              onClick={() => setShowManageModal(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
            >
              <Settings className="w-4 h-4" /> Upravljaj
            </button>
            {totalItems > 0 && (
              <button
                onClick={clearOrder}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition"
                title="Obriši trebovanje"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Očisti</span>
              </button>
            )}
          </div>

          <div className="mt-3">
            <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Pretraži sve artikle..." />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-6 py-5 pb-28">
        {searchTerm ? (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Rezultati za &ldquo;{searchTerm}&rdquo;
            </h2>
            {Object.keys(filteredGroupedItems).length === 0 && (
              <EmptyState text="Nema rezultata" action={{ label: 'Obriši pretragu', onClick: () => setSearchTerm('') }} />
            )}
            {Object.entries(filteredGroupedItems).map(([category, catItems]) => {
              const meta = getCategoryMeta(category);
              return (
                <button
                  key={category}
                  onClick={() => { setSelectedCategory(category); setSearchTerm(''); }}
                  className="w-full flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-left hover:border-sky-300 dark:hover:border-sky-700 transition"
                >
                  <span className={`grid place-items-center h-10 w-10 rounded-xl ${meta.tint}`}>
                    <meta.Icon className={`w-5 h-5 ${meta.text}`} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{category}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {catItems.map((i) => i.name).slice(0, 4).join(', ')}
                      {catItems.length > 4 ? '…' : ''}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{catItems.length}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {allCategories.map((category) => {
              const catItems = groupedItems[category] || [];
              if (catItems.length === 0) return null;
              const meta = getCategoryMeta(category);
              const orderedCount = catItems.filter((i) => orders[i.id]).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-left hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-md transition"
                >
                  <div className="flex items-start gap-3">
                    <span className={`grid place-items-center h-11 w-11 rounded-xl ${meta.tint} shrink-0`}>
                      <meta.Icon className={`w-5 h-5 ${meta.text}`} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm leading-tight mb-0.5 line-clamp-2">{category}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{catItems.length} artikala</p>
                    </div>
                  </div>
                  {orderedCount > 0 && (
                    <span className="absolute top-3 right-3 grid place-items-center min-w-6 h-6 px-1.5 rounded-full bg-sky-600 text-white text-xs font-bold">
                      {orderedCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Napomene */}
        <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5">
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">📝 Napomene za trebovanje</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-20 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 outline-none transition text-sm resize-none"
            placeholder="Dodatne napomene koje će biti uključene u trebovanje..."
          />
        </div>
      </main>

      <CartBar total={totalItems} onOpen={() => setShowOrderSummary(true)} />
      <Modals
        {...{ showOrderSummary, setShowOrderSummary, showAddModal, setShowAddModal,
          showManageModal, setShowManageModal, showHistory, setShowHistory,
          editItem, setEditItem, orders, variants, items, notes, doShare,
          allCategories, refresh, showToast, loadFromHistory }}
      />
    </Shell>
  );
}

/* ============================ Pomoćne komponente ============================ */

function Shell({ children, toast }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {children}
      {toast && (
        <div className="fixed top-4 inset-x-0 z-[60] flex justify-center px-4 pointer-events-none">
          <div className={`px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium text-white ${
            toast.type === 'error' ? 'bg-red-600' : toast.type === 'success' ? 'bg-emerald-600' : 'bg-slate-800 dark:bg-slate-700'
          }`}>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

function IconButton({ children, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className="grid place-items-center h-10 w-10 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
    >
      {children}
    </button>
  );
}

function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 outline-none transition text-sm"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          aria-label="Obriši pretragu"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

function ItemRow({ item, qty, variant, onQty, onVariant }) {
  const active = qty > 0;
  return (
    <div className={`rounded-2xl border bg-white dark:bg-slate-900 p-3 transition ${
      active ? 'border-sky-400 dark:border-sky-600 ring-1 ring-sky-500/20' : 'border-slate-200 dark:border-slate-800'
    }`}>
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{item.name}</div>
          {item.variants?.length > 0 && (
            <select
              value={variant || ''}
              onChange={(e) => onVariant(e.target.value)}
              className="mt-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2 w-full max-w-56 outline-none focus:border-sky-400"
            >
              <option value="">Izaberi varijantu</option>
              {item.variants.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          )}
          <div className="mt-2 flex gap-1.5">
            {[5, 10].map((n) => (
              <button
                key={n}
                onClick={() => onQty((qty || 0) + n)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-100 dark:hover:bg-sky-500/20 hover:text-sky-700 dark:hover:text-sky-300 transition"
              >
                +{n}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onQty((qty || 0) - 1)}
            disabled={!active}
            className="h-10 w-10 grid place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition active:scale-95"
            aria-label="Smanji"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={qty || ''}
            onChange={(e) => onQty(parseFloat(e.target.value) || 0)}
            className="w-14 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 outline-none p-2 text-sm"
            placeholder="0"
          />
          <span className="text-xs text-slate-400 w-7 text-center">{item.unit}</span>
          <button
            onClick={() => onQty((qty || 0) + 1)}
            className="h-10 w-10 grid place-items-center rounded-full bg-sky-600 text-white hover:bg-sky-700 transition active:scale-95 shadow-sm"
            aria-label="Povećaj"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text, action }) {
  return (
    <div className="text-center py-12">
      <p className="text-slate-500 dark:text-slate-400">{text}</p>
      {action && (
        <button onClick={action.onClick} className="mt-2 text-sky-600 hover:text-sky-700 font-medium text-sm">
          {action.label}
        </button>
      )}
    </div>
  );
}

function CartBar({ total, onOpen }) {
  if (total === 0) return null;
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="grid place-items-center h-9 w-9 rounded-xl bg-sky-600 text-white">
            <ShoppingCart className="h-4 w-4" />
          </span>
          <span className="font-semibold">{total}</span>
          <span className="text-slate-500 dark:text-slate-400">stavki u trebovanju</span>
        </div>
        <button
          onClick={onOpen}
          className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition"
        >
          <Send className="h-4 w-4" /> Pregled i slanje
        </button>
      </div>
    </div>
  );
}

/* Dugmad za deljenje — WhatsApp / Telegram / Viber / Kopiraj */
function ShareButtons({ doShare, disabled }) {
  const Btn = ({ onClick, className, children }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
  return (
    <div className="grid grid-cols-2 gap-2">
      <Btn onClick={() => doShare('whatsapp')} className="bg-[#25D366] hover:brightness-95">
        <Send className="h-4 w-4" /> WhatsApp
      </Btn>
      <Btn onClick={() => doShare('telegram')} className="bg-[#229ED9] hover:brightness-95">
        <Send className="h-4 w-4" /> Telegram
      </Btn>
      <Btn onClick={() => doShare('viber')} className="bg-[#7360F2] hover:brightness-95">
        <Send className="h-4 w-4" /> Viber
      </Btn>
      <Btn onClick={() => doShare('copy')} className="bg-slate-700 hover:bg-slate-800">
        <Copy className="h-4 w-4" /> Kopiraj
      </Btn>
      {canShareNative() && (
        <Btn onClick={() => doShare('native')} className="col-span-2 bg-sky-600 hover:bg-sky-700">
          <Send className="h-4 w-4" /> Podeli (sistemski meni)
        </Btn>
      )}
    </div>
  );
}

/* Skup svih modala — da bi se delili između oba ekrana */
function Modals(props) {
  const {
    showOrderSummary, setShowOrderSummary, showAddModal, setShowAddModal,
    showManageModal, setShowManageModal, showHistory, setShowHistory,
    editItem, setEditItem, orders, variants, items, notes, doShare,
    allCategories, refresh, showToast, loadFromHistory,
  } = props;

  return (
    <>
      <OrderSummaryModal
        show={showOrderSummary}
        onClose={() => setShowOrderSummary(false)}
        orders={orders}
        variants={variants}
        items={items}
        notes={notes}
        doShare={doShare}
      />
      <ItemFormModal
        show={showAddModal}
        onClose={() => { setShowAddModal(false); setEditItem(null); }}
        editItem={editItem}
        categories={allCategories}
        refresh={refresh}
        showToast={showToast}
      />
      <ManageItemsModal
        show={showManageModal}
        onClose={() => setShowManageModal(false)}
        items={items}
        refresh={refresh}
        showToast={showToast}
        onEdit={(item) => { setEditItem(item); setShowManageModal(false); setShowAddModal(true); }}
      />
      <HistoryModal
        show={showHistory}
        onClose={() => setShowHistory(false)}
        doShare={doShare}
        onLoad={loadFromHistory}
        showToast={showToast}
      />
    </>
  );
}

/* ============================ Modali ============================ */

function ModalShell({ title, gradient, onClose, children, maxW = 'max-w-md' }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className={`bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full ${maxW} max-h-[92vh] overflow-hidden rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col`}>
        <div className={`p-4 flex items-center justify-between text-white ${gradient}`}>
          <h2 className="text-base font-bold">{title}</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white" aria-label="Zatvori">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function OrderSummaryModal({ show, onClose, orders, variants, items, notes, doShare }) {
  if (!show) return null;
  const orderedItems = items.filter((item) => orders[item.id]);

  return (
    <ModalShell title="🛒 Pregled trebovanja" gradient="bg-emerald-600" onClose={onClose}>
      <div className="p-4 overflow-y-auto flex-1">
        {orderedItems.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">Nema stavki u trebovanju</p>
        ) : (
          <div className="space-y-2">
            {orderedItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="min-w-0">
                  <div className="font-medium text-sm">{item.name}</div>
                  {variants[item.id] && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">({variants[item.id]})</div>
                  )}
                </div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                  {orders[item.id]} {item.unit}
                </div>
              </div>
            ))}
          </div>
        )}
        {notes && (
          <div className="mt-4 p-3 bg-sky-50 dark:bg-sky-500/10 rounded-xl">
            <div className="font-medium text-sm text-sky-700 dark:text-sky-300 mb-1">Napomena:</div>
            <div className="text-sm text-sky-700 dark:text-sky-300 whitespace-pre-wrap">{notes}</div>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-3">
          Ukupno stavki: {orderedItems.length}
        </p>
        <ShareButtons doShare={doShare} disabled={orderedItems.length === 0} />
        <button
          onClick={() => printOrder(items, orders, variants, notes)}
          disabled={orderedItems.length === 0}
          className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition"
        >
          <Printer className="h-4 w-4" /> Štampaj / Sačuvaj PDF
        </button>
      </div>
    </ModalShell>
  );
}

function ItemFormModal({ show, onClose, editItem, categories, refresh, showToast }) {
  const isEdit = !!editItem;
  const [form, setForm] = useState({ name: '', category: '', newCategory: '', unit: 'kom', variants: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show) {
      setForm(isEdit
        ? {
            name: editItem.name || '',
            category: editItem.category || '',
            newCategory: '',
            unit: editItem.unit || 'kom',
            variants: (editItem.variants || []).join(', '),
          }
        : { name: '', category: '', newCategory: '', unit: 'kom', variants: '' });
    }
  }, [show, isEdit, editItem]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const category = form.newCategory.trim() || form.category;
    if (!category) {
      showToast('Izaberi ili unesi kategoriju', 'error');
      return;
    }
    setSaving(true);
    try {
      const data = {
        name: form.name.trim().toUpperCase(),
        category,
        unit: form.unit,
        variants: form.variants ? form.variants.split(',').map((v) => v.trim()).filter(Boolean) : [],
      };
      if (isEdit) {
        await updateItemInDatabase(editItem.id, data);
        showToast('Artikal izmenjen', 'success');
      } else {
        await saveItemToDatabase(data);
        showToast('Artikal dodat', 'success');
      }
      await refresh();
      onClose();
    } catch (error) {
      showToast('Greška: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 outline-none transition text-sm';

  return (
    <ModalShell title={isEdit ? '✏️ Izmeni artikal' : '➕ Dodaj artikal'} gradient="bg-sky-600" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto">
        <div>
          <label className="block mb-1.5 font-medium text-sm">Naziv</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputCls} placeholder="Naziv artikla" required />
        </div>
        <div>
          <label className="block mb-1.5 font-medium text-sm">Kategorija</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
            <option value="">Izaberi postojeću</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="text" value={form.newCategory} onChange={(e) => setForm({ ...form, newCategory: e.target.value })}
            className={`${inputCls} mt-2`} placeholder="…ili nova kategorija" />
        </div>
        <div>
          <label className="block mb-1.5 font-medium text-sm">Jedinica mere</label>
          <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className={inputCls}>
            {['kom', 'ml', 'lit', 'gr', 'kg'].map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className="block mb-1.5 font-medium text-sm">Varijante (opciono)</label>
          <input type="text" value={form.variants} onChange={(e) => setForm({ ...form, variants: e.target.value })}
            className={inputCls} placeholder="Nana, Kamilica, Zeleni (zarezom)" />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition">
            Otkaži
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-medium bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50 transition">
            {saving ? 'Čuvam...' : isEdit ? 'Sačuvaj' : 'Dodaj'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function ManageItemsModal({ show, onClose, items, refresh, showToast, onEdit }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState(null);
  if (!show) return null;

  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (item) => {
    if (!confirm(`Obrisati "${item.name}"?`)) return;
    setDeleting(item.id);
    try {
      await deleteItemFromDatabase(item.id);
      await refresh();
      showToast('Artikal obrisan', 'success');
    } catch (error) {
      showToast('Greška: ' + error.message, 'error');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <ModalShell title="🛠️ Upravljaj artiklima" gradient="bg-slate-700" onClose={onClose} maxW="max-w-2xl">
      <div className="p-4 flex flex-col overflow-hidden">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Pretraži artikle..." />
        <div className="overflow-y-auto max-h-[60vh] space-y-2 mt-3">
          {filtered.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm truncate">{item.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{item.category} • {item.unit}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => onEdit(item)}
                  className="grid place-items-center h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition" aria-label="Izmeni">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item)} disabled={deleting === item.id}
                  className="grid place-items-center h-9 w-9 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-50 transition" aria-label="Obriši">
                  {deleting === item.id
                    ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 text-center">
          Prikazano: {filtered.length} / {items.length}
        </div>
      </div>
    </ModalShell>
  );
}

function HistoryModal({ show, onClose, doShare, onLoad, showToast }) {
  const [history, setHistory] = useState([]);
  useEffect(() => {
    if (show) setHistory(loadHistory());
  }, [show]);
  if (!show) return null;

  const remove = (id) => {
    setHistory(deleteHistory(id));
    showToast('Obrisano iz istorije', 'info');
  };

  return (
    <ModalShell title="🕘 Istorija trebovanja" gradient="bg-indigo-600" onClose={onClose} maxW="max-w-lg">
      <div className="p-4 overflow-y-auto flex-1">
        {history.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">
            Nema sačuvanih trebovanja.<br />Čuvaju se 14 dana nakon slanja.
          </p>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">
                    {new Date(entry.createdAt).toLocaleString('sr-RS')}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{entry.count} stavki</span>
                </div>
                <pre className="text-xs text-slate-500 dark:text-slate-400 whitespace-pre-wrap line-clamp-3 mb-3 font-sans">
                  {entry.text}
                </pre>
                <div className="flex gap-2">
                  <button onClick={() => onLoad(entry)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-sky-600 hover:bg-sky-700 text-white transition">
                    <RotateCcw className="w-3.5 h-3.5" /> Učitaj ponovo
                  </button>
                  <button onClick={async () => { const ok = await copyTextEntry(entry.text); showToast(ok ? 'Kopirano!' : 'Greška', ok ? 'success' : 'error'); }}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition">
                    <Copy className="w-3.5 h-3.5" /> Kopiraj
                  </button>
                  <button onClick={() => remove(entry.id)}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-xs bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition" aria-label="Obriši">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalShell>
  );
}

// Pomoćno: kopiranje teksta iz istorije (reuse copyText iz share modula)
async function copyTextEntry(text) {
  return copyText(text);
}
