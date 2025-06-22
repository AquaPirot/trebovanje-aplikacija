// src/pages/api/items.js
// KOMPLETNA LISTA SVIH ARTIKALA

// Redosled kategorija
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

// Tačan redosled artikala
const EXACT_ITEMS_ORDER = [
  'ESPRESSO', 'NES KAFA', 'ČAJ', 'TOPLA ČOKOLADA', 'MLEKO BARISTA',
  'ROSA 0.33', 'ROSA 0.7', 'ROSA GAZ 0.33', 'ROSA GAZ 0.7', 'ROMERQUELLE', 'KOKA KOLA', 'KOKA KOLA zero', 'KOKA KOLA limeta', 'FANTA', 'SPRITE', 'BITTER', 'SCHWEEPS purple', 'TONIK',
  'CEDEVITA NARANDŽA', 'CEDEVITA 9 VITAMINA', 'CEDEVITA LIMUN', 'CEDEVITA LIMETA', 'KOKTA', 'ULTRA ENERGY', 'RED BULL', 'GUARANA',
  'NEXT JABUKA', 'NEXT NARANDŽA', 'NEXT JAGODA', 'NEXT ŠUMSKO VOĆE', 'NEXT BRESKVA', 'NEXT LIMUNADA JAGODA', 'NEXT LIMUNADA ANANAS',
  'TUBORG 0.3', 'LAV PREMIUM 0.3', 'TOČENO LAV PREMIUM 30l', 'CARLSBERG 0.25', 'ERDINGER', 'BLANC - KRONENBURG', 'TUBORG ICE', 'BUDWEISER TAMNO', 'BUDWEISER SVETLO',
  'SOMERSBY MANGO', 'SOMERSBY JABUKA', 'SOMERSBY BOROVNICA', 'SOMERSBY MALINA', 'SOMERSBY JAGODA',
  'VOTKA', 'SMIRNOFF', 'DŽIN', 'DŽIN BEEFEATER', 'DŽIN BEEFEATER PINK', 'TEQUILA', 'VINJAK', 'GORKI LIST', 'VERMUT',
  'JOHNNIE WALKER RED', 'JOHNNIE WALKER BLACK', 'JAMESON', 'CHIVAS', 'TULLAMORE DEW', 'JACK DANIELS', 'BALLANTINES',
  'COURVOISIER', 'HENNESSY',
  'JEGER', 'BAILEYS', 'APEROL', 'CAMPARI', 'MARTINI', 'RAMAZZOTTI', 'OUZO', 'HAVANA RUM',
  'MEGDAN DUNJA 1l', 'MEGDAN ŠLJIVA 1l', 'MEGDAN VILJAMOVKA', 'MEGDAN KAJSIJA', 'MEGDAN GROŽĐE', 'STOMAKLIJA',
  'FILIGRAN CHARDONNAY', 'KOVAČEVIĆ CHARDONNAY', 'RADOVANOVIĆ CHARDONNAY', 'MATALJ SOUVIGNON', 'MATALJ CHARDONNAY', 'ALEKSANDROVIĆ TEMA', 'CILIĆ ONYX BELI', 'DEURIĆ AKSIOM BELI', 'SPASIĆ LEKCIJA TAMJANIKA', 'RUBIN SOV BLANC', 'RUBIN CHARDONAY', 'RUBIN MUSCAT', 'LA SASTRERIA BELO', 'SAVIĆ RIZLING', 'JOVIĆ CHARDONNAY',
  'RUBIN MERLOT', 'FILIGRAN CABERNET', 'IZBA JOVAN MERLOT', 'RADOVANOVIĆ CABERNET', 'RADOVANOVIĆ SUVIGNON', 'CILIĆ ONYX CRVENO', 'DEURIĆ AKSIOM CRVENI', 'SPASIĆ DESPOT', 'MATALJ KREMEN', 'ALEKSANDROVIĆ PROKUPAC', 'RUBIN CABERNET', 'RUBIN DOB.BAR. SUV', 'RUBIN DOB.BAR. CAB', 'RUBIN AMANTE CARMEN', 'JOVIĆ CABERNET', 'JOVIĆ VRANAC', 'PROCORDE VRANAC', 'LA SASTRERIA CRVENO', 'CILIĆ MORAVA', 'CILIĆ cabernet & merlot', 'VINUM FRANCOVKA', 'TEMET BURGUNDAC', 'IVANOVIĆ PROKUPAC', 'CRNA OVCA',
  'RUBIN ROSE 0,7', 'DESPOTIKA NEMIR', 'MATALJ DUSICA', 'RUBIN VRONSKY 0,7',
  'RUBIN CHARDONNAY 0,187', 'RUBIN VRANAC 0,187', 'RUBIN ROSE 0,187'
];

// Kompletan spisak svih artikala sa detaljima
let items = [
  // TOPLI NAPICI
  { id: 1, name: 'ESPRESSO', category: 'TOPLI NAPICI', unit: 'gr', variants: [] },
  { id: 2, name: 'NES KAFA', category: 'TOPLI NAPICI', unit: 'gr', variants: [] },
  { id: 3, name: 'ČAJ', category: 'TOPLI NAPICI', unit: 'kom', variants: ['Nana', 'Kamilica', 'Zeleni', 'Jagoda & Jogurt', 'Voćni MIX', 'Jabuka & Cimet', 'Ostalo'] },
  { id: 4, name: 'TOPLA ČOKOLADA', category: 'TOPLI NAPICI', unit: 'kom', variants: ['Bela', 'Crna'] },
  { id: 5, name: 'MLEKO BARISTA', category: 'TOPLI NAPICI', unit: 'lit', variants: [] },

  // BEZALKOHOLNA PIĆA
  { id: 6, name: 'ROSA 0.33', category: 'BEZALKOHOLNA PIĆA', unit: 'kom', variants: [] },
  { id: 7, name: 'ROSA 0.7', category: 'BEZALKOHOLNA PIĆA', unit: 'kom', variants: [] },
  { id: 8, name: 'ROSA GAZ 0.33', category: 'BEZALKOHOLNA PIĆA', unit: 'kom', variants: [] },
  { id: 9, name: 'ROSA GAZ 0.7', category: 'BEZALKOHOLNA PIĆA', unit: 'kom', variants: [] },
  { id: 10, name: 'ROMERQUELLE', category: 'BEZALKOHOLNA PIĆA', unit: 'kom', variants: [] },
  { id: 11, name: 'KOKA KOLA', category: 'BEZALKOHOLNA PIĆA', unit: 'kom', variants: [] },
  { id: 12, name: 'KOKA KOLA zero', category: 'BEZALKOHOLNA PIĆA', unit: 'kom', variants: [] },
  { id: 13, name: 'KOKA KOLA limeta', category: 'BEZALKOHOLNA PIĆA', unit: 'kom', variants: [] },
  { id: 14, name: 'FANTA', category: 'BEZALKOHOLNA PIĆA', unit: 'kom', variants: [] },
  { id: 15, name: 'SPRITE', category: 'BEZALKOHOLNA PIĆA', unit: 'kom', variants: [] },
  { id: 16, name: 'BITTER', category: 'BEZALKOHOLNA PIĆA', unit: 'kom', variants: [] },
  { id: 17, name: 'SCHWEEPS purple', category: 'BEZALKOHOLNA PIĆA', unit: 'kom', variants: [] },
  { id: 18, name: 'TONIK', category: 'BEZALKOHOLNA PIĆA', unit: 'kom', variants: [] },

  // CEDEVITA I ENERGETSKA PIĆA
  { id: 19, name: 'CEDEVITA NARANDŽA', category: 'CEDEVITA I ENERGETSKA PIĆA', unit: 'kom', variants: [] },
  { id: 20, name: 'CEDEVITA 9 VITAMINA', category: 'CEDEVITA I ENERGETSKA PIĆA', unit: 'kom', variants: [] },
  { id: 21, name: 'CEDEVITA LIMUN', category: 'CEDEVITA I ENERGETSKA PIĆA', unit: 'kom', variants: [] },
  { id: 22, name: 'CEDEVITA LIMETA', category: 'CEDEVITA I ENERGETSKA PIĆA', unit: 'kom', variants: [] },
  { id: 23, name: 'KOKTA', category: 'CEDEVITA I ENERGETSKA PIĆA', unit: 'kom', variants: [] },
  { id: 24, name: 'ULTRA ENERGY', category: 'CEDEVITA I ENERGETSKA PIĆA', unit: 'kom', variants: [] },
  { id: 25, name: 'RED BULL', category: 'CEDEVITA I ENERGETSKA PIĆA', unit: 'kom', variants: [] },
  { id: 26, name: 'GUARANA', category: 'CEDEVITA I ENERGETSKA PIĆA', unit: 'kom', variants: [] },

  // NEXT SOKOVI
  { id: 27, name: 'NEXT JABUKA', category: 'NEXT SOKOVI', unit: 'kom', variants: [] },
  { id: 28, name: 'NEXT NARANDŽA', category: 'NEXT SOKOVI', unit: 'kom', variants: [] },
  { id: 29, name: 'NEXT JAGODA', category: 'NEXT SOKOVI', unit: 'kom', variants: [] },
  { id: 30, name: 'NEXT ŠUMSKO VOĆE', category: 'NEXT SOKOVI', unit: 'kom', variants: [] },
  { id: 31, name: 'NEXT BRESKVA', category: 'NEXT SOKOVI', unit: 'kom', variants: [] },
  { id: 32, name: 'NEXT LIMUNADA JAGODA', category: 'NEXT SOKOVI', unit: 'kom', variants: [] },
  { id: 33, name: 'NEXT LIMUNADA ANANAS', category: 'NEXT SOKOVI', unit: 'kom', variants: [] },

  // PIVA
  { id: 34, name: 'TUBORG 0.3', category: 'PIVA', unit: 'kom', variants: [] },
  { id: 35, name: 'LAV PREMIUM 0.3', category: 'PIVA', unit: 'kom', variants: [] },
  { id: 36, name: 'TOČENO LAV PREMIUM 30l', category: 'PIVA', unit: 'kom', variants: [] },
  { id: 37, name: 'CARLSBERG 0.25', category: 'PIVA', unit: 'kom', variants: [] },
  { id: 38, name: 'ERDINGER', category: 'PIVA', unit: 'kom', variants: [] },
  { id: 39, name: 'BLANC - KRONENBURG', category: 'PIVA', unit: 'kom', variants: [] },
  { id: 40, name: 'TUBORG ICE', category: 'PIVA', unit: 'kom', variants: [] },
  { id: 41, name: 'BUDWEISER TAMNO', category: 'PIVA', unit: 'kom', variants: [] },
  { id: 42, name: 'BUDWEISER SVETLO', category: 'PIVA', unit: 'kom', variants: [] },

  // SOMERSBY
  { id: 43, name: 'SOMERSBY MANGO', category: 'SOMERSBY', unit: 'kom', variants: [] },
  { id: 44, name: 'SOMERSBY JABUKA', category: 'SOMERSBY', unit: 'kom', variants: [] },
  { id: 45, name: 'SOMERSBY BOROVNICA', category: 'SOMERSBY', unit: 'kom', variants: [] },
  { id: 46, name: 'SOMERSBY MALINA', category: 'SOMERSBY', unit: 'kom', variants: [] },
  { id: 47, name: 'SOMERSBY JAGODA', category: 'SOMERSBY', unit: 'kom', variants: [] },

  // ŽESTOKA PIĆA
  { id: 48, name: 'VOTKA', category: 'ŽESTOKA PIĆA', unit: 'ml', variants: [] },
  { id: 49, name: 'SMIRNOFF', category: 'ŽESTOKA PIĆA', unit: 'ml', variants: [] },
  { id: 50, name: 'DŽIN', category: 'ŽESTOKA PIĆA', unit: 'ml', variants: [] },
  { id: 51, name: 'DŽIN BEEFEATER', category: 'ŽESTOKA PIĆA', unit: 'ml', variants: [] },
  { id: 52, name: 'DŽIN BEEFEATER PINK', category: 'ŽESTOKA PIĆA', unit: 'ml', variants: [] },
  { id: 53, name: 'TEQUILA', category: 'ŽESTOKA PIĆA', unit: 'ml', variants: [] },
  { id: 54, name: 'VINJAK', category: 'ŽESTOKA PIĆA', unit: 'ml', variants: [] },
  { id: 55, name: 'GORKI LIST', category: 'ŽESTOKA PIĆA', unit: 'ml', variants: [] },
  { id: 56, name: 'VERMUT', category: 'ŽESTOKA PIĆA', unit: 'ml', variants: [] },

  // VISKI
  { id: 57, name: 'JOHNNIE WALKER RED', category: 'VISKI', unit: 'ml', variants: [] },
  { id: 58, name: 'JOHNNIE WALKER BLACK', category: 'VISKI', unit: 'ml', variants: [] },
  { id: 59, name: 'JAMESON', category: 'VISKI', unit: 'ml', variants: [] },
  { id: 60, name: 'CHIVAS', category: 'VISKI', unit: 'ml', variants: [] },
  { id: 61, name: 'TULLAMORE DEW', category: 'VISKI', unit: 'ml', variants: [] },
  { id: 62, name: 'JACK DANIELS', category: 'VISKI', unit: 'ml', variants: [] },
  { id: 63, name: 'BALLANTINES', category: 'VISKI', unit: 'ml', variants: [] },

  // BRENDI I KONJACI
  { id: 64, name: 'COURVOISIER', category: 'BRENDI I KONJACI', unit: 'ml', variants: [] },
  { id: 65, name: 'HENNESSY', category: 'BRENDI I KONJACI', unit: 'ml', variants: [] },

  // LIKERI
  { id: 66, name: 'JEGER', category: 'LIKERI', unit: 'ml', variants: [] },
  { id: 67, name: 'BAILEYS', category: 'LIKERI', unit: 'ml', variants: [] },
  { id: 68, name: 'APEROL', category: 'LIKERI', unit: 'ml', variants: [] },
  { id: 69, name: 'CAMPARI', category: 'LIKERI', unit: 'ml', variants: [] },
  { id: 70, name: 'MARTINI', category: 'LIKERI', unit: 'ml', variants: [] },
  { id: 71, name: 'RAMAZZOTTI', category: 'LIKERI', unit: 'ml', variants: [] },
  { id: 72, name: 'OUZO', category: 'LIKERI', unit: 'ml', variants: [] },
  { id: 73, name: 'HAVANA RUM', category: 'LIKERI', unit: 'ml', variants: [] },

  // DOMAĆA ALKOHOLNA PIĆA
  { id: 74, name: 'MEGDAN DUNJA 1l', category: 'DOMAĆA ALKOHOLNA PIĆA', unit: 'ml', variants: [] },
  { id: 75, name: 'MEGDAN ŠLJIVA 1l', category: 'DOMAĆA ALKOHOLNA PIĆA', unit: 'ml', variants: [] },
  { id: 76, name: 'MEGDAN VILJAMOVKA', category: 'DOMAĆA ALKOHOLNA PIĆA', unit: 'ml', variants: [] },
  { id: 77, name: 'MEGDAN KAJSIJA', category: 'DOMAĆA ALKOHOLNA PIĆA', unit: 'ml', variants: [] },
  { id: 78, name: 'MEGDAN GROŽĐE', category: 'DOMAĆA ALKOHOLNA PIĆA', unit: 'ml', variants: [] },
  { id: 79, name: 'STOMAKLIJA', category: 'DOMAĆA ALKOHOLNA PIĆA', unit: 'ml', variants: [] },

  // BELA VINA
  { id: 80, name: 'FILIGRAN CHARDONNAY', category: 'BELA VINA', unit: 'kom', variants: [] },
  { id: 81, name: 'KOVAČEVIĆ CHARDONNAY', category: 'BELA VINA', unit: 'kom', variants: [] },
  { id: 82, name: 'RADOVANOVIĆ CHARDONNAY', category: 'BELA VINA', unit: 'kom', variants: [] },
  { id: 83, name: 'MATALJ SOUVIGNON', category: 'BELA VINA', unit: 'kom', variants: [] },
  { id: 84, name: 'MATALJ CHARDONNAY', category: 'BELA VINA', unit: 'kom', variants: [] },
  { id: 85, name: 'ALEKSANDROVIĆ TEMA', category: 'BELA VINA', unit: 'kom', variants: [] },
  { id: 86, name: 'CILIĆ ONYX BELI', category: 'BELA VINA', unit: 'kom', variants: [] },
  { id: 87, name: 'DEURIĆ AKSIOM BELI', category: 'BELA VINA', unit: 'kom', variants: [] },
  { id: 88, name: 'SPASIĆ LEKCIJA TAMJANIKA', category: 'BELA VINA', unit: 'kom', variants: [] },
  { id: 89, name: 'RUBIN SOV BLANC', category: 'BELA VINA', unit: 'kom', variants: [] },
  { id: 90, name: 'RUBIN CHARDONAY', category: 'BELA VINA', unit: 'kom', variants: [] },
  { id: 91, name: 'RUBIN MUSCAT', category: 'BELA VINA', unit: 'kom', variants: [] },
  { id: 92, name: 'LA SASTRERIA BELO', category: 'BELA VINA', unit: 'kom', variants: [] },
  { id: 93, name: 'SAVIĆ RIZLING', category: 'BELA VINA', unit: 'kom', variants: [] },
  { id: 94, name: 'JOVIĆ CHARDONNAY', category: 'BELA VINA', unit: 'kom', variants: [] },

  // CRVENA VINA
  { id: 95, name: 'RUBIN MERLOT', category: 'CRVENA VINA', unit: 'kom', variants: [] },
  { id: 96, name: 'FILIGRAN CABERNET', category: 'CRVENA VINA', unit: 'kom', variants: [] },
  { id: 97, name: 'IZBA JOVAN MERLOT', category: 'CRVENA VINA', unit: 'kom', variants: [] },
  { id: 98, name: 'RADOVANOVIĆ CABERNET', category: 'CRVENA VINA', unit: 'kom', variants: [] },
  { id: 99, name: 'RADOVANOVIĆ SUVIGNON', category: 'CRVENA VINA', unit: 'kom', variants: [] },
  { id: 100, name: 'CILIĆ ONYX CRVENO', category: 'CRVENA VINA', unit: 'kom', variants: [] },
  { id: 101, name: 'DEURIĆ AKSIOM CRVENI', category: 'CRVENA VINA', unit: 'kom', variants: [] },
  { id: 102, name: 'SPASIĆ DESPOT', category: 'CRVENA VINA', unit: 'kom', variants: [] },
  { id: 103, name: 'MATALJ KREMEN', category: 'CRVENA VINA', unit: 'kom', variants: [] },
  { id: 104, name: 'ALEKSANDROVIĆ PROKUPAC', category: 'CRVENA VINA', unit: 'kom', variants: [] },
  { id: 105, name: 'RUBIN CABERNET', category: 'CRVENA VINA', unit: 'kom', variants: [] },
  { id: 106, name: 'RUBIN DOB.BAR. SUV', category: 'CRVENA VINA', unit: 'kom', variants: [] },
  { id: 107, name: 'RUBIN DOB.BAR. CAB', category: 'CRVENA VINA', unit: 'kom', variants: [] },
  { id: 108, name: 'RUBIN AMANTE CARMEN', category: 'CRVENA VINA', unit: 'kom', variants: [] },
  { id: 109, name: 'JOVIĆ CABERNET', category: 'CRVENA VINA', unit: 'kom', variants: [] },
  { id: 110, name: 'JOVIĆ VRANAC', category: 'CRVENA VINA', unit: 'kom', variants: [] },
  { id: 111, name: 'PROCORDE VRANAC', category: 'CRVENA VINA', unit: 'kom', variants: [] },
  { id: 112, name: 'LA SASTRERIA CRVENO', category: 'CRVENA VINA', unit: 'kom', variants: [] },
  { id: 113, name: 'CILIĆ MORAVA', category: 'CRVENA VINA', unit: 'kom', variants: [] },
  { id: 114, name: 'CILIĆ cabernet & merlot', category: 'CRVENA VINA', unit: 'kom', variants: [] },
  { id: 115, name: 'VINUM FRANCOVKA', category: 'CRVENA VINA', unit: 'kom', variants: [] },
  { id: 116, name: 'TEMET BURGUNDAC', category: 'CRVENA VINA', unit: 'kom', variants: [] },
  { id: 117, name: 'IVANOVIĆ PROKUPAC', category: 'CRVENA VINA', unit: 'kom', variants: [] },
  { id: 118, name: 'CRNA OVCA', category: 'CRVENA VINA', unit: 'kom', variants: [] },

  // ROZE VINA
  { id: 119, name: 'RUBIN ROSE 0,7', category: 'ROZE VINA', unit: 'kom', variants: [] },
  { id: 120, name: 'DESPOTIKA NEMIR', category: 'ROZE VINA', unit: 'kom', variants: [] },
  { id: 121, name: 'MATALJ DUSICA', category: 'ROZE VINA', unit: 'kom', variants: [] },
  { id: 122, name: 'RUBIN VRONSKY 0,7', category: 'ROZE VINA', unit: 'kom', variants: [] },

  // VINA 0,187L
  { id: 123, name: 'RUBIN CHARDONNAY 0,187', category: 'VINA 0,187L', unit: 'kom', variants: [] },
  { id: 124, name: 'RUBIN VRANAC 0,187', category: 'VINA 0,187L', unit: 'kom', variants: [] },
  { id: 125, name: 'RUBIN ROSE 0,187', category: 'VINA 0,187L', unit: 'kom', variants: [] }
];

let nextId = 126;

// Funkcija za sortiranje po tačnom redosledu
function sortItems(items) {
  return items.sort((a, b) => {
    // Prvo po redosledu kategorija
    const categoryIndexA = categoryOrder.indexOf(a.category);
    const categoryIndexB = categoryOrder.indexOf(b.category);
    
    if (categoryIndexA !== categoryIndexB) {
      return categoryIndexA - categoryIndexB;
    }
    
    // Zatim po redosledu artikala unutar kategorije
    const itemIndexA = EXACT_ITEMS_ORDER.indexOf(a.name);
    const itemIndexB = EXACT_ITEMS_ORDER.indexOf(b.name);
    
    if (itemIndexA === -1) return 1;
    if (itemIndexB === -1) return -1;
    
    return itemIndexA - itemIndexB;
  });
}

export default function handler(req, res) {
  console.log('🔥 API poziv:', req.method, req.url);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        return listItems(req, res);
      case 'POST':
        return saveItem(req, res);
      case 'DELETE':
        return deleteItem(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      details: error.message 
    });
  }
}

// GET - Lista svih stavki
function listItems(req, res) {
  console.log('📋 GET /api/items - vraćam', items.length, 'stavki');
  
  const sortedItems = sortItems([...items]);
  
  return res.status(200).json({ 
    success: true, 
    data: sortedItems 
  });
}

// POST - Dodavanje nove stavke
function saveItem(req, res) {
  const { name, category, unit = 'kom', variants = [] } = req.body;

  console.log('➕ POST /api/items - dodajem:', { name, category, unit, variants });

  if (!name || !category) {
    return res.status(400).json({ 
      error: 'Name and category are required' 
    });
  }

  // Proveri da li stavka već postoji
  const existing = items.find(item => 
    item.name.toUpperCase() === name.toUpperCase() && 
    item.category === category
  );

  if (existing) {
    return res.status(409).json({ 
      error: 'Item already exists' 
    });
  }

  // Dodaj novu stavku
  const newItem = {
    id: nextId++,
    name: name.toUpperCase(),
    category,
    unit,
    variants
  };

  items.push(newItem);

  console.log('✅ Stavka dodana:', newItem);

  return res.status(201).json({ 
    success: true, 
    data: newItem 
  });
}

// DELETE - Brisanje stavke
function deleteItem(req, res) {
  const { id } = req.query;

  console.log('🗑️ DELETE /api/items - brišem ID:', id);

  if (!id) {
    return res.status(400).json({ 
      error: 'Item ID is required' 
    });
  }

  const itemIndex = items.findIndex(item => item.id == id);

  if (itemIndex === -1) {
    return res.status(404).json({ 
      error: 'Item not found' 
    });
  }

  const deletedItem = items.splice(itemIndex, 1)[0];
  
  console.log('✅ Stavka obrisana:', deletedItem.name);

  return res.status(200).json({ 
    success: true, 
    message: 'Item deleted successfully' 
  });
}