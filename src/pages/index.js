import { useState, useEffect } from 'react';
import { getItemsFromDatabase, saveItemToDatabase, deleteItemFromDatabase, listenToItems } from '../utils/storage';
import { Coffee, Wine, Beer, GlassWater, Search, Plus, Minus, Copy, Send, Settings, Trash2, X, ShoppingCart, ArrowLeft, Check } from 'lucide-react';

export default function TrebovanjeApp() {
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState({});
  const [variants, setVariants] = useState({});
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  // Učitavanje stavki iz baze
  useEffect(() => {
    const loadItems = async () => {
      try {
        const databaseItems = await getItemsFromDatabase();
        setItems(databaseItems);
      } catch (error) {
        console.error('Greška pri učitavanju:', error);
      } finally {
        setLoading(false);
      }
    };

    loadItems();

    const unsubscribe = listenToItems((newItems) => {
      setItems(newItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getCategoryIcon = (category) => {
    const iconClass = "w-5 h-5";
    switch(category) {
      case 'TOPLI NAPICI': return <Coffee className={`${iconClass} text-amber-500`} />;
      case 'BEZALKOHOLNA PIĆA':
      case 'CEDEVITA I ENERGETSKA PIĆA':
      case 'NEXT SOKOVI': return <GlassWater className={`${iconClass} text-blue-500`} />;
      case 'PIVA':
      case 'SOMERSBY': return <Beer className={`${iconClass} text-yellow-500`} />;
      case 'BELA VINA':
      case 'CRVENA VINA':
      case 'ROZE VINA':
      case 'VINA 0,187L': return <Wine className={`${iconClass} text-purple-500`} />;
      case 'ŽESTOKA PIĆA':
      case 'VISKI':
      case 'BRENDI I KONJACI':
      case 'LIKERI':
      case 'DOMAĆA ALKOHOLNA PIĆA': return <GlassWater className={`${iconClass} text-red-500`} />;
      default: return null;
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'TOPLI NAPICI': return 'from-amber-100 to-orange-100 border-amber-300 hover:from-amber-200 hover:to-orange-200';
      case 'BEZALKOHOLNA PIĆA': return 'from-blue-100 to-cyan-100 border-blue-300 hover:from-blue-200 hover:to-cyan-200';
      case 'CEDEVITA I ENERGETSKA PIĆA': return 'from-green-100 to-emerald-100 border-green-300 hover:from-green-200 hover:to-emerald-200';
      case 'NEXT SOKOVI': return 'from-purple-100 to-violet-100 border-purple-300 hover:from-purple-200 hover:to-violet-200';
      case 'PIVA': return 'from-yellow-100 to-amber-100 border-yellow-300 hover:from-yellow-200 hover:to-amber-200';
      case 'SOMERSBY': return 'from-pink-100 to-rose-100 border-pink-300 hover:from-pink-200 hover:to-rose-200';
      case 'ŽESTOKA PIĆA': return 'from-red-100 to-pink-100 border-red-300 hover:from-red-200 hover:to-pink-200';
      case 'VISKI': return 'from-orange-100 to-red-100 border-orange-300 hover:from-orange-200 hover:to-red-200';
      case 'BRENDI I KONJACI': return 'from-amber-100 to-yellow-100 border-amber-300 hover:from-amber-200 hover:to-yellow-200';
      case 'LIKERI': return 'from-purple-100 to-pink-100 border-purple-300 hover:from-purple-200 hover:to-pink-200';
      case 'DOMAĆA ALKOHOLNA PIĆA': return 'from-gray-100 to-slate-100 border-gray-300 hover:from-gray-200 hover:to-slate-200';
      case 'BELA VINA': return 'from-emerald-100 to-teal-100 border-emerald-300 hover:from-emerald-200 hover:to-teal-200';
      case 'CRVENA VINA': return 'from-rose-100 to-red-100 border-rose-300 hover:from-rose-200 hover:to-red-200';
      case 'ROZE VINA': return 'from-pink-100 to-rose-100 border-pink-300 hover:from-pink-200 hover:to-rose-200';
      case 'VINA 0,187L': return 'from-indigo-100 to-purple-100 border-indigo-300 hover:from-indigo-200 hover:to-purple-200';
      default: return 'from-gray-100 to-slate-100 border-gray-300 hover:from-gray-200 hover:to-slate-200';
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const categoryOrder = [
    'TOPLI NAPICI', 'BEZALKOHOLNA PIĆA', 'CEDEVITA I ENERGETSKA PIĆA', 'NEXT SOKOVI',
    'PIVA', 'SOMERSBY', 'ŽESTOKA PIĆA', 'VISKI', 'BRENDI I KONJACI', 'LIKERI',
    'DOMAĆA ALKOHOLNA PIĆA', 'BELA VINA', 'CRVENA VINA', 'ROZE VINA', 'VINA 0,187L'
  ];

  // Dodaj sve kategorije iz groupedItems koje nisu u categoryOrder
  const allCategories = [...categoryOrder];
  Object.keys(groupedItems).forEach(category => {
    if (!allCategories.includes(category)) {
      allCategories.push(category);
    }
  });

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

  const getTotalItems = () => {
    return Object.keys(orders).length;
  };

  const generateOrder = () => {
    let message = `🍷 TREBOVANJE ${new Date().toLocaleDateString('sr-RS')}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    categoryOrder.forEach(category => {
      const categoryItems = groupedItems[category] || [];
      const categoryOrders = categoryItems.filter(item => orders[item.id]);
      
      if (categoryOrders.length > 0) {
        message += `📂 ${category}\n`;
        message += `${'─'.repeat(30)}\n`;
        categoryOrders.forEach(item => {
          let orderLine = `${orders[item.id]} × ${item.name}`;
          if (variants[item.id]) {
            orderLine += ` (${variants[item.id]})`;
          }
          message += `• ${orderLine}\n`;
        });
        message += '\n';
      }
    });

    // Dodaj sve ostale kategorije koje nisu u categoryOrder
    allCategories.forEach(category => {
      if (!categoryOrder.includes(category)) {
        const categoryItems = groupedItems[category] || [];
        const categoryOrders = categoryItems.filter(item => orders[item.id]);
        
        if (categoryOrders.length > 0) {
          message += `📂 ${category}\n`;
          message += `${'─'.repeat(30)}\n`;
          categoryOrders.forEach(item => {
            let orderLine = `${orders[item.id]} × ${item.name}`;
            if (variants[item.id]) {
              orderLine += ` (${variants[item.id]})`;
            }
            message += `• ${orderLine}\n`;
          });
          message += '\n';
        }
      }
    });

    if (notes.trim()) {
      message += `📝 NAPOMENE:\n`;
      message += `${'─'.repeat(30)}\n`;
      message += `${notes}\n\n`;
    }

    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `Ukupno stavki: ${getTotalItems()}\n`;
    message += `Vreme kreiranja: ${new Date().toLocaleString('sr-RS')}`;

    return message;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateOrder());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      alert('Greška pri kopiranju');
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Učitavam artikle...</p>
        </div>
      </div>
    );
  }

  // Ako je izabrana kategorija, prikaži artikle te kategorije
  if (selectedCategory) {
    const categoryItems = searchTerm ? 
      filteredGroupedItems[selectedCategory] || [] :
      groupedItems[selectedCategory] || [];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header sa back dugmetom */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3 flex-1">
                {getCategoryIcon(selectedCategory)}
                <h1 className="text-lg sm:text-xl font-bold text-gray-800">
                  {selectedCategory}
                </h1>
                <span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-medium text-gray-600">
                  {categoryItems.length}
                </span>
              </div>
              
              {getTotalItems() > 0 && (
                <button
                  onClick={() => setShowOrderSummary(true)}
                  className="bg-green-500 hover:bg-green-600 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-white flex items-center gap-2 transition-all shadow-lg"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {getTotalItems()}
                  </span>
                </button>
              )}
            </div>
            
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder={`Pretraži u kategoriji ${selectedCategory}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-sm bg-white/80 backdrop-blur-sm"
              />
              <Search className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Artikli u kategoriji */}
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-3">
          {categoryItems.map(item => (
            <div key={item.id} className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:bg-white transition-all shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 text-sm sm:text-base mb-2">
                    {item.name}
                  </div>
                  {item.variants?.length > 0 && (
                    <select
                      value={variants[item.id] || ''}
                      onChange={(e) => updateVariant(item.id, e.target.value)}
                      className="text-sm bg-white border border-gray-200 rounded-lg p-2 w-full max-w-48"
                    >
                      <option value="">Izaberi varijantu</option>
                      {item.variants.map(variant => (
                        <option key={variant} value={variant}>{variant}</option>
                      ))}
                    </select>
                  )}
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {orders[item.id] > 0 && (
                    <button
                      onClick={() => updateOrder(item, (orders[item.id] || 0) - 1)}
                      className="h-10 w-10 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-all shadow-md active:scale-95"
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
                    className="w-16 sm:w-20 text-center rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 p-2 text-sm bg-white"
                    placeholder="0"
                  />
                  <span className="text-sm text-gray-500 w-8 text-center">
                    {item.unit}
                  </span>
                  <button
                    onClick={() => updateOrder(item, (orders[item.id] || 0) + 1)}
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition-all shadow-md active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {categoryItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nema artikala u ovoj kategoriji</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-blue-500 hover:text-blue-600"
                >
                  Obriši pretragu
                </button>
              )}
            </div>
          )}
        </div>

        {/* Floating back button - mobile */}
        <div className="sm:hidden fixed bottom-4 left-4 z-30">
          <button
            onClick={() => setSelectedCategory(null)}
            className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full shadow-xl transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Floating cart button - mobile */}
        {getTotalItems() > 0 && (
          <div className="sm:hidden fixed bottom-4 right-4 z-30">
            <button
              onClick={() => setShowOrderSummary(true)}
              className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-xl flex items-center justify-center relative"
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                {getTotalItems()}
              </span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Glavni ekran sa kategorijama
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Wine className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Trebovanje pića
                </h1>
                <p className="text-xs text-gray-500">
                  {allCategories.filter(cat => groupedItems[cat]?.length > 0).length} kategorija • {items.length} artikala
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              {getTotalItems() > 0 && (
                <button
                  onClick={() => setShowOrderSummary(true)}
                  className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">Pregled</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {getTotalItems()}
                  </span>
                </button>
              )}
              <button
                onClick={() => setShowAddModal(true)}
                className="flex-1 sm:flex-none bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Dodaj</span>
              </button>
              <button
                onClick={() => setShowManageModal(true)}
                className="flex-1 sm:flex-none bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Upravljaj</span>
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative mt-4">
            <input
              type="text"
              placeholder="Pretraži sve artikle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-sm bg-white/80 backdrop-blur-sm"
            />
            <Search className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kategorije kao kartice */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6">
        {searchTerm ? (
          /* Rezultati pretrage */
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Rezultati pretrage za &ldquo;{searchTerm}&rdquo;
            </h2>
            {Object.entries(filteredGroupedItems).map(([category, categoryItems]) => (
              <div key={category} className={`bg-gradient-to-r ${getCategoryColor(category)} rounded-xl border-2 p-4 shadow-lg`}>
                <div className="flex items-center gap-3 mb-3">
                  {getCategoryIcon(category)}
                  <h3 className="font-bold text-gray-800">{category}</h3>
                  <span className="bg-white/60 px-2 py-1 rounded-full text-xs font-medium">
                    {categoryItems.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {categoryItems.slice(0, 3).map(item => (
                    <div key={item.id} className="bg-white/80 rounded-lg p-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.name}</span>
                        <button
                          onClick={() => {
                            setSelectedCategory(category);
                            setSearchTerm('');
                          }}
                          className="text-blue-500 hover:text-blue-700 text-xs"
                        >
                          Otvori
                        </button>
                      </div>
                    </div>
                  ))}
                  {categoryItems.length > 3 && (
                    <button
                      onClick={() => {
                        setSelectedCategory(category);
                        setSearchTerm('');
                      }}
                      className="w-full bg-white/60 hover:bg-white/80 rounded-lg p-2 text-sm text-gray-600 transition-all"
                    >
                      +{categoryItems.length - 3} još artikala...
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Kategorije grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allCategories.map(category => {
              const categoryItems = groupedItems[category] || [];
              if (categoryItems.length === 0) return null;
              
              const orderedItemsInCategory = categoryItems.filter(item => orders[item.id]).length;
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`bg-gradient-to-br ${getCategoryColor(category)} rounded-xl border-2 p-4 sm:p-6 text-left hover:shadow-lg transition-all duration-200 relative group`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {getCategoryIcon(category)}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-sm sm:text-base leading-tight mb-1">
                        {category}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {categoryItems.length} artikala
                      </p>
                    </div>
                    {orderedItemsInCategory > 0 && (
                      <div className="bg-green-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                        {orderedItemsInCategory}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Klikni za pregled artikala
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Napomene */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg">
          <div className="p-4 sm:p-6">
            <h2 className="font-bold mb-4 text-sm sm:text-lg text-gray-800 flex items-center gap-2">
              📝 Napomene za trebovanje
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-20 sm:h-24 p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-sm resize-none bg-white/90"
              placeholder="Dodatne napomene koje će biti uključene u trebovanje..."
            />
          </div>
        </div>

        {/* Quick copy section */}
        {getTotalItems() > 0 && (
          <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Trebovanje spremno!</h3>
                <p className="text-sm text-gray-600">{getTotalItems()} stavki u trebovanju</p>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                    copySuccess 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {copySuccess ? (
                    <>
                      <Check className="h-4 w-4" />
                      Kopirano!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Kopiraj tekst
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    const order = generateOrder();
                    const encodedOrder = encodeURIComponent(order);
                    window.open(`https://wa.me/?text=${encodedOrder}`);
                  }}
                  className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="h-4 w-4" />
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating cart button - samo mobile na glavnom ekranu */}
      {getTotalItems() > 0 && (
        <div className="sm:hidden fixed bottom-4 right-4 z-30">
          <button
            onClick={() => setShowOrderSummary(true)}
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-xl flex items-center justify-center relative"
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
              {getTotalItems()}
            </span>
          </button>
        </div>
      )}

      {/* Order Summary Modal */}
      <OrderSummaryModal 
        show={showOrderSummary} 
        onClose={() => setShowOrderSummary(false)}
        orders={orders}
        variants={variants}
        items={items}
        notes={notes}
        generateOrder={generateOrder}
        copyToClipboard={copyToClipboard}
        copySuccess={copySuccess}
      />

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

// Order Summary Modal
function OrderSummaryModal({ show, onClose, orders, variants, items, notes, generateOrder, copyToClipboard, copySuccess }) {
  if (!show) return null;

  const orderedItems = items.filter(item => orders[item.id]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-4 border-b bg-gradient-to-r from-green-500 to-blue-500 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">🛒 Pregled trebovanja</h2>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-96">
          {orderedItems.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nema stavki u trebovanju</p>
          ) : (
            <div className="space-y-3">
              {orderedItems.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.name}</div>
                    {variants[item.id] && (
                      <div className="text-xs text-gray-500">({variants[item.id]})</div>
                    )}
                  </div>
                  <div className="font-bold text-green-600">
                    {orders[item.id]} {item.unit}
                  </div>
                </div>
              ))}
            </div>
          )}

          {notes && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="font-medium text-sm text-blue-800 mb-1">Napomene:</div>
              <div className="text-sm text-blue-700">{notes}</div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="text-center mb-3">
            <p className="text-sm text-gray-600">Ukupno stavki: {orderedItems.length}</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                copySuccess 
                  ? 'bg-green-500 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              disabled={orderedItems.length === 0}
            >
              {copySuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  Kopirano!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Kopiraj
                </>
              )}
            </button>
            
            <button
              onClick={() => {
                const order = generateOrder();
                const encodedOrder = encodeURIComponent(order);
                window.open(`https://wa.me/?text=${encodedOrder}`);
              }}
              className="flex-1 bg-green-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-600 transition-all"
              disabled={orderedItems.length === 0}
            >
              <Send className="h-4 w-4" />
              WhatsApp
            </button>
          </div>
        </div>
      </div>
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

      await saveItemToDatabase(itemData);
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">➕ Dodaj novi artikal</h2>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block mb-2 font-medium text-sm">Naziv artikla:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-sm"
              placeholder="Naziv artikla"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-sm">Kategorija:</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-sm"
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
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all mt-2 text-sm"
              placeholder="Ili unesite novu kategoriju"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-sm">Jedinica mere:</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({...formData, unit: e.target.value})}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-sm"
            >
              <option value="kom">kom</option>
              <option value="ml">ml</option>
              <option value="lit">lit</option>
              <option value="gr">gr</option>
              <option value="kg">kg</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium text-sm">Varijante (opciono):</label>
            <input
              type="text"
              value={formData.variants}
              onChange={(e) => setFormData({...formData, variants: e.target.value})}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-sm"
              placeholder="Nana, Kamilica, Zeleni (odvojeno zarezima)"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-3 rounded-xl hover:bg-gray-600 transition-all text-sm font-medium"
            >
              Otkaži
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 disabled:bg-blue-300 transition-all text-sm font-medium"
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
      await deleteItemFromDatabase(itemId);
      alert('Stavka je obrisana!');
    } catch (error) {
      alert('Greška pri brisanju: ' + error.message);
    } finally {
      setDeleting(null);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-4 border-b bg-gradient-to-r from-gray-500 to-slate-600 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">🛠️ Upravljaj artiklima</h2>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Pretraži artikle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-sm"
            />
            <Search className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
          </div>

          <div className="overflow-y-auto max-h-96 space-y-2">
            {filteredItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.category} • {item.unit}</div>
                </div>
                <button
                  onClick={() => handleDelete(item.id, item.name)}
                  disabled={deleting === item.id}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs disabled:bg-red-300 transition-all flex items-center gap-2"
                >
                  {deleting === item.id ? (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs text-gray-500 text-center">
            Prikazano: {filteredItems.length} / {items.length} artikala
          </div>
        </div>
      </div>
    </div>
  );
}