import React, { createContext, useContext, useState, useEffect } from 'react';
import { portfolioData } from '../data/portfolioData';
import { karyaData as defaultKaryaData } from '../data/karyaData';

const PortfolioContext = createContext(null);

export const STORAGE_KEYS = {
  ABOUT_ME: 'portfolio_about_me',
  KARYA_DATA: 'portfolio_karya_data',
  PROFILE_PHOTO: 'portfolio_profile_photo',
  CONTACTS: 'portfolio_contacts',
};

const defaultContacts = {
  whatsapp: '',
  location: '',
  instagram: '',
  tiktok: '',
  youtube: '',
};

export function PortfolioProvider({ children }) {
  // 1. State About Me dengan sinkronisasi localStorage
  const [aboutMe, setAboutMeState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ABOUT_ME);
      if (saved !== null && saved !== undefined && saved.trim() !== '') {
        if (saved.includes('(Ctrl + Shift + B)') || saved.includes('Secret Admin Panel')) {
          const cleaned = saved
            .replace(/\s*Silakan sesuaikan deskripsi ini melalui Secret Admin Panel \(Ctrl \+ Shift \+ B\)\./g, '')
            .replace(/\s*\(Ctrl\s*\+\s*Shift\s*\+\s*[BP]\)/gi, '');
          localStorage.setItem(STORAGE_KEYS.ABOUT_ME, cleaned);
          return cleaned;
        }
        return saved;
      }
    } catch (e) {
      console.warn('Gagal membaca portfolio_about_me dari localStorage:', e);
    }
    return portfolioData.personal?.aboutDescription || '';
  });

  // 2. State Foto Profil (Square 1:1) dengan sinkronisasi localStorage
  const [profilePhoto, setProfilePhotoState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE_PHOTO);
      if (saved !== null && saved !== undefined) {
        return saved;
      }
    } catch (e) {
      console.warn('Gagal membaca portfolio_profile_photo dari localStorage:', e);
    }
    return '';
  });

  // 3. State Kontak & Sosial Media dengan sinkronisasi localStorage
  const [contacts, setContactsState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      if (saved !== null && saved !== undefined) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...defaultContacts, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Gagal membaca portfolio_contacts dari localStorage:', e);
    }
    return defaultContacts;
  });

  // 4. State Karya dengan sinkronisasi localStorage
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

  // 5. State Modal Secret Admin Panel & Tab Aktif ('about' | 'contacts' | 'karya')
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminTab, setAdminTab] = useState('about');

  // 6. State Notifikasi Toast
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

  // Updaters Foto Profil
  const updateProfilePhoto = (newPhotoUrl) => {
    const trimmed = typeof newPhotoUrl === 'string' ? newPhotoUrl.trim() : '';
    setProfilePhotoState(trimmed);
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE_PHOTO, trimmed);
    } catch (e) {
      console.error('Gagal menyimpan foto profil ke localStorage:', e);
    }
    showToast('🖼️ Foto Profil berhasil diperbarui!');
  };

  const removeProfilePhoto = () => {
    setProfilePhotoState('');
    try {
      localStorage.removeItem(STORAGE_KEYS.PROFILE_PHOTO);
    } catch (e) {
      console.error('Gagal menghapus foto profil dari localStorage:', e);
    }
    showToast('🗑️ Foto Profil berhasil dikosongkan!');
  };

  // Updaters Kontak & Sosial Media
  const updateContacts = (newContacts) => {
    const merged = { ...contacts, ...newContacts };
    setContactsState(merged);
    try {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(merged));
    } catch (e) {
      console.error('Gagal menyimpan kontak ke localStorage:', e);
    }
    showToast('📱 Data Kontak & Sosial Media berhasil diperbarui!');
  };

  const resetContacts = () => {
    setContactsState(defaultContacts);
    try {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(defaultContacts));
    } catch (e) {
      console.error('Gagal reset kontak ke localStorage:', e);
    }
    showToast('🔄 Kontak & Sosial Media berhasil dikosongkan!');
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

  // 7. Global Keyboard Shortcut Listener (Ctrl + Shift + B & Ctrl + Shift + P / Cmd + Shift + B / P)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isKeyB = e.key === 'b' || e.key === 'B' || e.code === 'KeyB';
      const isKeyP = e.key === 'p' || e.key === 'P' || e.code === 'KeyP';

      if (isCmdOrCtrl && isShift && (isKeyB || isKeyP)) {
        e.preventDefault();
        e.stopPropagation();
        setIsAdminOpen((prev) => {
          const next = !prev;
          if (next) {
            showToast('🔐 Secret Admin Panel terbuka! (Ctrl + Shift + B)');
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
        profilePhoto,
        updateProfilePhoto,
        removeProfilePhoto,
        contacts,
        updateContacts,
        resetContacts,
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
