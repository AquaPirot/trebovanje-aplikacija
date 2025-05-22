import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { initialCategories } from './initialData';

const firebaseConfig = {
  apiKey: "AIzaSyAFKmB111lpF-bYI5o_hlmt2f--zPNh4Io",
  authDomain: "trebovanje-aplikacija.firebaseapp.com",
  projectId: "trebovanje-aplikacija",
  storageBucket: "trebovanje-aplikacija.firebasestorage.app",
  messagingSenderId: "840642827188",
  appId: "1:840642827188:web:cc6f5f8635dbf69e8a58e1",
  measurementId: "G-HYL90T0SP6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Funkcija za sortiranje artikala po originalnom redosledu
const sortItemsByOriginalOrder = (items) => {
  return items.sort((a, b) => {
    // Prvo po kategoriji
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    
    // Zatim po originalnom redosledu unutar kategorije
    const categoryItems = initialCategories[a.category] || [];
    const indexA = categoryItems.findIndex(item => item.name === a.name);
    const indexB = categoryItems.findIndex(item => item.name === b.name);
    
    // Ako artikal nije u originalnoj listi, stavi ga na kraj
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    
    return indexA - indexB;
  });
};

export const saveItemToFirebase = async (itemData) => {
  try {
    const docRef = await addDoc(collection(db, 'items'), {
      ...itemData,
      timestamp: new Date().toISOString()
    });
    console.log('✅ Stavka sačuvana:', docRef.id);
    return { id: docRef.id, ...itemData };
  } catch (error) {
    console.error('❌ Greška pri čuvanju stavke:', error);
    throw error;
  }
};

export const getItemsFromFirebase = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'items'));
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    
    const sortedItems = sortItemsByOriginalOrder(items);
    console.log('✅ Učitano', sortedItems.length, 'stavki');
    return sortedItems;
  } catch (error) {
    console.error('❌ Greška pri učitavanju:', error);
    return [];
  }
};

export const deleteItemFromFirebase = async (itemId) => {
  try {
    await deleteDoc(doc(db, 'items', itemId));
    console.log('✅ Stavka obrisana:', itemId);
    return true;
  } catch (error) {
    console.error('❌ Greška pri brisanju:', error);
    throw error;
  }
};

export const listenToItems = (callback) => {
  return onSnapshot(collection(db, 'items'), (querySnapshot) => {
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    
    const sortedItems = sortItemsByOriginalOrder(items);
    callback(sortedItems);
  });
};