import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Cek apakah konfigurasi Firebase telah diisi dengan valid
export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.apiKey !== 'your_api_key_here' &&
      firebaseConfig.projectId &&
      firebaseConfig.projectId !== 'your_project_id'
  );
};

let app = null;
let db = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.info('🔥 Firebase Firestore berhasil diinisialisasi untuk Cloud Database!');
  } catch (error) {
    console.warn('⚠️ Gagal menginisialisasi Firebase:', error);
  }
} else {
  console.info('ℹ️ Firebase belum dikonfigurasi di .env. Berjalan dalam mode fallback offline (LocalStorage).');
}

export { app, db };

export const PORTFOLIO_COLLECTION = 'portfolio';
export const PORTFOLIO_DOC_ID = 'main';

/**
 * Mendengarkan perubahan data portfolio secara real-time dari Firestore
 * @param {Function} onDataCallback - Callback saat ada data baru dari Firestore
 * @param {Function} onErrorCallback - Callback jika terjadi error
 * @returns {Function|null} Unsubscribe function
 */
export const subscribePortfolioData = (onDataCallback, onErrorCallback) => {
  if (!db || !isFirebaseConfigured()) {
    return null;
  }

  try {
    const docRef = doc(db, PORTFOLIO_COLLECTION, PORTFOLIO_DOC_ID);
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onDataCallback(snapshot.data());
        } else {
          onDataCallback(null);
        }
      },
      (error) => {
        console.error('Error saat mendengarkan perubahan real-time Firestore:', error);
        if (onErrorCallback) onErrorCallback(error);
      }
    );
  } catch (err) {
    console.error('Gagal setup Firestore onSnapshot:', err);
    if (onErrorCallback) onErrorCallback(err);
    return null;
  }
};

/**
 * Mengambil data portfolio satu kali dari Firestore
 */
export const fetchPortfolioDataOnce = async () => {
  if (!db || !isFirebaseConfigured()) return null;
  try {
    const docRef = doc(db, PORTFOLIO_COLLECTION, PORTFOLIO_DOC_ID);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error('Gagal mengambil data portfolio dari Firestore:', error);
    return null;
  }
};

/**
 * Menyimpan sebagian field atau seluruh dokumen ke Firestore
 * @param {Object} dataToMerge - Objek data yang ingin disimpan/digabungkan
 */
export const savePortfolioDataToCloud = async (dataToMerge) => {
  if (!db || !isFirebaseConfigured()) {
    return { success: false, isCloud: false, error: 'Firebase not configured' };
  }

  try {
    const docRef = doc(db, PORTFOLIO_COLLECTION, PORTFOLIO_DOC_ID);
    await setDoc(
      docRef,
      {
        ...dataToMerge,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return { success: true, isCloud: true };
  } catch (error) {
    console.error('Gagal menyimpan data ke Firestore:', error);
    return { success: false, isCloud: true, error };
  }
};
