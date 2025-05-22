import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

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
    console.log('✅ Učitano', items.length, 'stavki');
    return items;
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
    callback(items);
  });
};