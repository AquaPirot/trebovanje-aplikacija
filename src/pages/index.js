import { useState, useEffect } from 'react';
import { getItemsFromFirebase, saveItemToFirebase, deleteItemFromFirebase, listenToItems } from '../utils/firebase';
import { initialCategories } from '../utils/initialData';
import { Coffee, Wine, Beer, GlassWater, Search, Plus, Minus, Copy, Send, Download, Settings, Trash2 } from 'lucide-react';

export default function TrebovanjeApp() {
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState({});
  const [variants, setVariants] = useState({});
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Učitavanje stavki iz Firebase
  useEffect(() => {
    const loadItems = async () => {
      try {
        const firebaseItems = await getItemsFromFirebase();
        if (firebaseItems.length === 0) {
          // Ako nema stavki u Firebase, učitaj početne podatke
          await initializeItems();
        } else {
          setItems(firebaseItems);
        }
      } catch (error) {
        console.error('Greška pri učitavanju:', error);
      } finally {
        setLoading(false);
      }
    };

    loadItems();

    // Real-time listener
    const unsubscribe = listenToItems((newItems) => {
      setItems(newItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const initializeItems = async () => {
    try {
      const allItems = [];
      for (const [category, categoryItems] of Object.entries(initialCategories)) {
        for (const item of categoryItems) {
          const itemData = {
            name: item.name,
            category: category,
            unit: item.unit,
            variants: item.variants || []
          };
          allItems.push(itemData);
        }
      }
      
      // Sačuvaj sve u Firebase
      for (const item of allItems) {
        await saveItemToFirebase(item);
      }
    } catch (error) {
      console.error('Greška pri inicijalizaciji:', error);
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'TOPLI NAPICI': return <Coffee className="w-5 h-5 text-amber-600" />;
      case 'BEZALKOHOLNA PIĆA':
      case 'CEDEVITA I ENERGETSKA PIĆA':
      case 'NEXT SOKOVI': return <GlassWater className="w-5 h-5 text-blue-600" />;
      case 'PIVA':
      case 'SOMERSBY': return <Beer className="w-5 h-5 text-yellow-600" />;
      case 'BELA VINA':
      case 'CRVENA VINA':
      case 'ROZE VINA':
      case 'VINA 0,187L': return <Wine className="w-5 h-5 text-rose-600" />;
      case 'ŽESTOKA PIĆA':
      case 'VISKI':
      case 'BRENDI I KONJACI':
      case 'LIKERI':
      case 'DOMAĆA ALKOHOLNA PIĆA': return <GlassWater className="w-5 h-5 text-purple-600" />;
      default: return null;
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const filteredItems = searchTerm ? 
    items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())) :
    items;

  const filteredGroupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const updateOrder = (item, value) => {
    const quantity = parseFloat(parseFloat(value).toFixed(2));
    
    if (quantity > 0) {
      setOrders({...orders, [item.id]: quantity});
    } else {
      const newOrders = {...orders};
      delete newOrders[item.id];
      setVariants(prev => {
        const newVariants = {...prev};
        delete newVariants[item.id];
        return newVariants;
      });
      setOrders(newOrders);
    }
  };

  const updateVariant = (itemId, variant) => {
    setVariants({...variants, [itemId]: variant});
  };

  const generateOrder = () => {
    let message = `📋 TREBOVANJE ${new Date().toLocaleDateString('sr-RS')}\n\n`;
    
    Object.entries(groupedItems).forEach(([category, categoryItems]) => {
      const categoryOrders = categoryItems.filter(item => orders[item.id]);
      if (categoryOrders.length > 0) {
        message += `${category}\n`;
        categoryOrders.forEach(item => {
          let orderLine = `${orders[item.id]} × ${item.name}`;
          if (variants[item.id]) {
            orderLine += ` (${variants[item.id]})`;
          }
          message += `${orderLine}\n`;
        });
        message += '\n';
      }
    });

    if (notes.trim()) {
      message += `NAPOMENE:\n${notes}\n`;
    }

    return message;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">⏳</div>
          <p className="text-gray-500">Učitavam artikle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">🍷 Trebovanje pića</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-green-500 hover:bg-green-600 px-3 py-2 rounded-lg text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Dodaj
              </button>
              <button
                onClick={() => setShowManageModal(true)}
                className="bg-gray-500 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm flex items-center gap-1"
              >
                <Settings className="w-4 h-4" />
                Upravljaj
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Pretraži pića..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <Search className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-b-2xl shadow-xl p-6 space-y-6">
          {/* Kategorije */}
          {Object.entries(filteredGroupedItems)
  .sort(([a], [b]) => {
    const categoryOrder = [
      'TOPLI NAPICI',
      'BEZALKOHOLNA PIĆA', 
      'CEDEVITA I ENERGETSKA PIĆA',
      'NEXT SOKOVI',
      'PIVA',
      'SOMERSBY',
      'ŽESTOKA PIĆA',
      'VISKI',
      'BRENDI I KONJACI',
      'LIKERI',
      'DOMAĆA ALKOHOLNA PIĆA',
      'BELA VINA',
      'CRVENA VINA',
      'ROZE VINA',
      'VINA 0,187L'
    ];
    
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    
    return indexA - indexB;
  })
  .map(([category, categoryItems]) => (
            <div key={category} className="border-2 border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-all">
              <div className="flex items-center gap-3 mb-4">
                {getCategoryIcon(category)}
                <h2 className="font-bold text-lg text-gray-800">{category}</h2>
                <span className="text-sm text-gray-500">({categoryItems.length})</span>
              </div>
              
              <div className="space-y-3">
                {categoryItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all">
                    <div className="flex-1 space-y-1">
                      <div className="font-medium text-gray-800">{item.name}</div>
                      {item.variants?.length > 0 && (
                        <select
                          value={variants[item.id] || ''}
                          onChange={(e) => updateVariant(item.id, e.target.value)}
                          className="text-sm text-gray-600 border rounded p-1"
                        >
                          <option value="">Izaberi varijantu</option>
                          {item.variants.map(variant => (
                            <option key={variant} value={variant}>{variant}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {orders[item.id] > 0 && (
                        <button
                          onClick={() => updateOrder(item, (orders[item.id] || 0) - 1)}
                          className="h-8 w-8 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-all"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={orders[item.id] || ''}
                        onChange={(e) => updateOrder(item, parseFloat(e.target.value) || 0)}
                        className="w-16 text-center rounded border-2 border-gray-200 focus:border-blue-500 p-1"
                        placeholder="0"
                      />
                      <span className="text-xs text-gray-500 w-8">{item.unit}</span>
                      <button
                        onClick={() => updateOrder(item, (orders[item.id] || 0) + 1)}
                        className="h-8 w-8 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition-all"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Napomene */}
          <div className="border-2 border-gray-100 rounded-xl p-4">
            <h2 className="font-bold mb-3 text-lg text-gray-800">📝 Napomene</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-20 p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Dodatne napomene..."
            />
          </div>

          {/* Akcije */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(generateOrder());
                alert('Trebovanje kopirano!');
              }}
              className="flex-1 bg-blue-500 text-white rounded-xl px-4 py-3 hover:bg-blue-600 transition-all flex items-center justify-center gap-2 font-medium"
              disabled={Object.keys(orders).length === 0}
            >
              <Copy className="h-4 w-4" />
              Kopiraj
            </button>
            
            <button
              onClick={() => {
                const order = generateOrder();
                const encodedOrder = encodeURIComponent(order);
                window.open(`https://wa.me/?text=${encodedOrder}`);
              }}
              className="flex-1 bg-green-500 text-white rounded-xl px-4 py-3 hover:bg-green-600 transition-all flex items-center justify-center gap-2 font-medium"
              disabled={Object.keys(orders).length === 0}
            >
              <Send className="h-4 w-4" />
              WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <AddItemModal 
        show={showAddModal} 
        onClose={() => setShowAddModal(false)}
        categories={Object.keys(groupedItems)}
      />

      {/* Manage Modal */}
      <ManageItemsModal 
        show={showManageModal} 
        onClose={() => setShowManageModal(false)}
        items={items}
      />
    </div>
  );
}

// Modal za dodavanje nove stavke
function AddItemModal({ show, onClose, categories }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    newCategory: '',
    unit: 'kom',
    variants: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      const itemData = {
        name: formData.name.trim().toUpperCase(),
        category: formData.newCategory.trim() || formData.category,
        unit: formData.unit,
        variants: formData.variants ? formData.variants.split(',').map(v => v.trim()) : []
      };

      await saveItemToFirebase(itemData);
      alert('Stavka je dodana!');
      setFormData({ name: '', category: '', newCategory: '', unit: 'kom', variants: '' });
      onClose();
    } catch (error) {
      alert('Greška pri dodavanju: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">➕ Dodaj novi artikal</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">Naziv artikla:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200"
              placeholder="Naziv artikla"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Kategorija:</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Izaberi postojeću kategoriju</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <input
              type="text"
              value={formData.newCategory}
              onChange={(e) => setFormData({...formData, newCategory: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200 mt-2"
              placeholder="Ili unesite novu kategoriju"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Jedinica mere:</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({...formData, unit: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200"
            >
              <option value="kom">kom</option>
              <option value="ml">ml</option>
              <option value="lit">lit</option>
              <option value="gr">gr</option>
              <option value="kg">kg</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Varijante (opciono):</label>
            <input
              type="text"
              value={formData.variants}
              onChange={(e) => setFormData({...formData, variants: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200"
              placeholder="Nana, Kamilica, Zeleni (odvojeno zarezima)"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600"
            >
              Otkaži
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
            >
              {saving ? 'Čuvam...' : 'Dodaj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal za upravljanje stavkama
function ManageItemsModal({ show, onClose, items }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState(null);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (itemId, itemName) => {
    if (!confirm(`Da li ste sigurni da želite da obrišete "${itemName}"?`)) return;
    
    setDeleting(itemId);
    try {
      await deleteItemFromFirebase(itemId);
      alert('Stavka je obrisana!');
    } catch (error) {
      alert('Greška pri brisanju: ' + error.message);
    } finally {
      setDeleting(null);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-96 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">🛠️ Upravljaj artiklima</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Pretraži artikle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="overflow-y-auto max-h-64 space-y-2">
          {filteredItems.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-500">{item.category} • {item.unit}</div>
              </div>
              <button
                onClick={() => handleDelete(item.id, item.name)}
                disabled={deleting === item.id}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm disabled:bg-red-300"
              >
                {deleting === item.id ? '...' : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Ukupno: {items.length} artikala
        </div>
      </div>
    </div>
  );
}