import React, { createContext, useContext, useState, useEffect } from 'react';
import { portfolioData } from '../data/portfolioData';
import { karyaData as defaultKaryaData } from '../data/karyaData';

const PortfolioContext = createContext(null);

export const STORAGE_KEYS = {
  ABOUT_ME: 'portfolio_about_me',
  KARYA_DATA: 'portfolio_karya_data',
};

export function PortfolioProvider({ children }) {
  // 1. State About Me dengan sinkronisasi localStorage
  const [aboutMe, setAboutMeState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ABOUT_ME);
      if (saved !== null && saved !== undefined && saved.trim() !== '') {
        return saved;
      }
    } catch (e) {
      console.warn('Gagal membaca portfolio_about_me dari localStorage:', e);
    }
    return portfolioData.personal?.aboutDescription || '';
  });

  // 2. State Karya dengan sinkronisasi localStorage
  const [karyaList, setKaryaListState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.KARYA_DATA);
      if (saved !== null && saved !== undefined) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Gagal membaca portfolio_karya_data dari localStorage:', e);
    }
    return defaultKaryaData || [];
  });

  // 3. State Modal Secret Admin Panel & Tab Aktif
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminTab, setAdminTab] = useState('about'); // 'about' | 'karya'

  // 4. State Notifikasi Toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  // Updaters About Me
  const updateAboutMe = (newText) => {
    const trimmed = typeof newText === 'string' ? newText : '';
    setAboutMeState(trimmed);
    try {
      localStorage.setItem(STORAGE_KEYS.ABOUT_ME, trimmed);
    } catch (e) {
      console.error('Gagal menyimpan About Me ke localStorage:', e);
    }
    showToast('✨ Deskripsi "About Me" berhasil diperbarui!');
  };

  const resetAboutMe = () => {
    const defaultText = portfolioData.personal?.aboutDescription || '';
    setAboutMeState(defaultText);
    try {
      localStorage.setItem(STORAGE_KEYS.ABOUT_ME, defaultText);
    } catch (e) {
      console.error('Gagal reset About Me di localStorage:', e);
    }
    showToast('🔄 Deskripsi "About Me" telah dikembalikan ke teks bawaan!');
  };

  // Updaters Karya
  const updateKaryaList = (newItems, message = null) => {
    const validItems = Array.isArray(newItems) ? newItems : [];
    setKaryaListState(validItems);
    try {
      localStorage.setItem(STORAGE_KEYS.KARYA_DATA, JSON.stringify(validItems));
    } catch (e) {
      console.error('Gagal menyimpan Karya ke localStorage:', e);
    }
    if (message) {
      showToast(message);
    }
  };

  const addKarya = (item) => {
    const newItem = {
      ...item,
      id: item.id || `karya-${Date.now()}`,
    };
    const updated = [newItem, ...karyaList];
    updateKaryaList(updated, `✨ Karya "${newItem.title}" berhasil ditambahkan!`);
  };

  const editKarya = (item) => {
    const updated = karyaList.map((k) => (k.id === item.id ? { ...k, ...item } : k));
    updateKaryaList(updated, `💾 Perubahan pada "${item.title}" berhasil disimpan!`);
  };

  const deleteKarya = (id, title) => {
    const updated = karyaList.filter((k) => k.id !== id);
    updateKaryaList(updated, `🗑️ Karya "${title}" berhasil dihapus.`);
  };

  const resetKarya = () => {
    updateKaryaList(defaultKaryaData, '🔄 Data karya berhasil direset ke template kosong (default)!');
  };

  // 5. Global Keyboard Shortcut Listener (Ctrl + Shift + P / Cmd + Shift + P)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isKeyP = e.key === 'p' || e.key === 'P' || e.code === 'KeyP';

      if (isCmdOrCtrl && isShift && isKeyP) {
        e.preventDefault();
        e.stopPropagation();
        setIsAdminOpen((prev) => {
          const next = !prev;
          if (next) {
            showToast('🔐 Secret Admin Panel terbuka! (Ctrl + Shift + P)');
          }
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  return (
    <PortfolioContext.Provider
      value={{
        aboutMe,
        updateAboutMe,
        resetAboutMe,
        karyaList,
        updateKaryaList,
        addKarya,
        editKarya,
        deleteKarya,
        resetKarya,
        isAdminOpen,
        setIsAdminOpen,
        adminTab,
        setAdminTab,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}
