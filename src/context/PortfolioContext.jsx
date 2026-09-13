import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { portfolioData } from '../data/portfolioData';
import { karyaData as defaultKaryaData } from '../data/karyaData';
import {
  subscribePortfolioData,
  savePortfolioDataToCloud,
  isFirebaseConfigured,
} from '../lib/firebase';

const PortfolioContext = createContext(null);

export const STORAGE_KEYS = {
  ABOUT_ME: 'portfolio_about_me',
  KARYA_DATA: 'portfolio_karya_data',
  PROFILE_PHOTO: 'portfolio_profile_photo',
  CONTACTS: 'portfolio_contacts',
};

const defaultContacts = {
  whatsapp: '088271083335',
  location: '',
  instagram: 'https://www.instagram.com/pibifabulla',
  tiktok: '',
  youtube: '',
};

export function PortfolioProvider({ children }) {
  const isCloudActive = isFirebaseConfigured();
  const [isCloudConnected, setIsCloudConnected] = useState(isCloudActive);
  const [isSavingToCloud, setIsSavingToCloud] = useState(false);

  // 1. State About Me dengan sinkronisasi localStorage
  const [aboutMe, setAboutMeState] = useState(() => {
    const currentDefault = portfolioData.personal?.aboutDescription || '';
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ABOUT_ME);
      if (saved !== null && saved !== undefined && saved.trim() !== '') {
        if (
          saved.includes('(Ctrl + Shift + B)') ||
          saved.includes('Secret Admin Panel') ||
          saved.includes('editing video dinamis, motion graphic')
        ) {
          localStorage.setItem(STORAGE_KEYS.ABOUT_ME, currentDefault);
          return currentDefault;
        }
        return saved;
      }
    } catch (e) {
      console.warn('Gagal membaca portfolio_about_me dari localStorage:', e);
    }
    return currentDefault;
  });

  // 2. State Foto Profil (Square 1:1) dengan sinkronisasi localStorage
  const [profilePhoto, setProfilePhotoState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE_PHOTO);
      if (saved !== null && saved !== undefined && saved.trim() !== '') {
        return saved;
      }
    } catch (e) {
      console.warn('Gagal membaca portfolio_profile_photo dari localStorage:', e);
    }
    return portfolioData.personal?.profilePhoto || '/images/mypibi.png';
  });

  // 3. State Kontak & Sosial Media dengan sinkronisasi localStorage
  const [contacts, setContactsState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      if (saved !== null && saved !== undefined) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const merged = { ...defaultContacts, ...parsed };
          if (!merged.whatsapp) merged.whatsapp = defaultContacts.whatsapp;
          if (!merged.instagram) merged.instagram = defaultContacts.instagram;
          return merged;
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
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasOldPlaceholder = parsed.some(
            (item) =>
              item.title === 'Karya 1' ||
              item.title === 'Karya 2' ||
              (item.description && item.description.includes('Karya desain visual dan digital scrapbook kreatif')) ||
              (item.tags && item.tags.includes('Pop-Art') && item.id === 'karya-1')
          );
          if (hasOldPlaceholder) {
            localStorage.setItem(STORAGE_KEYS.KARYA_DATA, JSON.stringify(defaultKaryaData));
            return defaultKaryaData;
          }
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

  // Flag untuk mencegah loop sync
  const isIncomingCloudUpdate = useRef(false);

  // 7. Real-Time Cloud Firestore Sync Listener
  useEffect(() => {
    if (!isCloudActive) return;

    const unsubscribe = subscribePortfolioData(
      (cloudData) => {
        if (!cloudData) {
          console.info('Dokumen Firestore "portfolio/main" belum dibuat. Menggunakan data lokal default.');
          return;
        }

        setIsCloudConnected(true);
        isIncomingCloudUpdate.current = true;

        if (typeof cloudData.aboutMe === 'string' && cloudData.aboutMe.trim() !== '') {
          setAboutMeState(cloudData.aboutMe);
          try {
            localStorage.setItem(STORAGE_KEYS.ABOUT_ME, cloudData.aboutMe);
          } catch (e) {
            console.warn(e);
          }
        }

        if (typeof cloudData.profilePhoto === 'string') {
          setProfilePhotoState(cloudData.profilePhoto || '/images/mypibi.png');
          try {
            localStorage.setItem(STORAGE_KEYS.PROFILE_PHOTO, cloudData.profilePhoto);
          } catch (e) {
            console.warn(e);
          }
        }

        if (cloudData.contacts && typeof cloudData.contacts === 'object') {
          const mergedContacts = { ...defaultContacts, ...cloudData.contacts };
          setContactsState(mergedContacts);
          try {
            localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(mergedContacts));
          } catch (e) {
            console.warn(e);
          }
        }

        if (Array.isArray(cloudData.karyaList) && cloudData.karyaList.length > 0) {
          setKaryaListState(cloudData.karyaList);
          try {
            localStorage.setItem(STORAGE_KEYS.KARYA_DATA, JSON.stringify(cloudData.karyaList));
          } catch (e) {
            console.warn(e);
          }
        }

        setTimeout(() => {
          isIncomingCloudUpdate.current = false;
        }, 100);
      },
      (error) => {
        console.warn('Tidak dapat terhubung ke Firestore:', error);
        setIsCloudConnected(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isCloudActive]);

  // Updaters About Me (Async ke Cloud Firestore)
  const updateAboutMe = async (newText) => {
    const trimmed = typeof newText === 'string' ? newText : '';
    setAboutMeState(trimmed);
    try {
      localStorage.setItem(STORAGE_KEYS.ABOUT_ME, trimmed);
    } catch (e) {
      console.error('Gagal menyimpan About Me ke localStorage:', e);
    }

    if (isCloudActive) {
      setIsSavingToCloud(true);
      const res = await savePortfolioDataToCloud({ aboutMe: trimmed });
      setIsSavingToCloud(false);
      if (res.success) {
        showToast('☁️ Deskripsi "About Me" berhasil disinkronkan ke Cloud Database!');
        return;
      }
    }
    showToast('✨ Deskripsi "About Me" berhasil diperbarui!');
  };

  const resetAboutMe = async () => {
    const defaultText = portfolioData.personal?.aboutDescription || '';
    setAboutMeState(defaultText);
    try {
      localStorage.setItem(STORAGE_KEYS.ABOUT_ME, defaultText);
    } catch (e) {
      console.error('Gagal reset About Me di localStorage:', e);
    }

    if (isCloudActive) {
      setIsSavingToCloud(true);
      await savePortfolioDataToCloud({ aboutMe: defaultText });
      setIsSavingToCloud(false);
    }
    showToast('🔄 Deskripsi "About Me" telah dikembalikan ke teks bawaan!');
  };

  // Updaters Foto Profil (Async ke Cloud Firestore)
  const updateProfilePhoto = async (newPhotoUrl) => {
    const trimmed = typeof newPhotoUrl === 'string' ? newPhotoUrl.trim() : '';
    setProfilePhotoState(trimmed);
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE_PHOTO, trimmed);
    } catch (e) {
      console.error('Gagal menyimpan foto profil ke localStorage:', e);
    }

    if (isCloudActive) {
      setIsSavingToCloud(true);
      const res = await savePortfolioDataToCloud({ profilePhoto: trimmed });
      setIsSavingToCloud(false);
      if (res.success) {
        showToast('☁️ Foto Profil berhasil disinkronkan ke Cloud Database!');
        return;
      }
    }
    showToast('🖼️ Foto Profil berhasil diperbarui!');
  };

  const removeProfilePhoto = async () => {
    const defaultPhoto = '/images/mypibi.png';
    setProfilePhotoState(defaultPhoto);
    try {
      localStorage.removeItem(STORAGE_KEYS.PROFILE_PHOTO);
    } catch (e) {
      console.error('Gagal menghapus foto profil dari localStorage:', e);
    }

    if (isCloudActive) {
      setIsSavingToCloud(true);
      await savePortfolioDataToCloud({ profilePhoto: defaultPhoto });
      setIsSavingToCloud(false);
    }
    showToast('🗑️ Foto Profil berhasil dikosongkan!');
  };

  // Updaters Kontak & Sosial Media (Async ke Cloud Firestore)
  const updateContacts = async (newContacts) => {
    const merged = { ...contacts, ...newContacts };
    setContactsState(merged);
    try {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(merged));
    } catch (e) {
      console.error('Gagal menyimpan kontak ke localStorage:', e);
    }

    if (isCloudActive) {
      setIsSavingToCloud(true);
      const res = await savePortfolioDataToCloud({ contacts: merged });
      setIsSavingToCloud(false);
      if (res.success) {
        showToast('☁️ Data Kontak & Sosial Media berhasil disimpan ke Cloud Database!');
        return;
      }
    }
    showToast('📱 Data Kontak & Sosial Media berhasil diperbarui!');
  };

  const resetContacts = async () => {
    setContactsState(defaultContacts);
    try {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(defaultContacts));
    } catch (e) {
      console.error('Gagal reset kontak ke localStorage:', e);
    }

    if (isCloudActive) {
      setIsSavingToCloud(true);
      await savePortfolioDataToCloud({ contacts: defaultContacts });
      setIsSavingToCloud(false);
    }
    showToast('🔄 Kontak & Sosial Media berhasil dikosongkan!');
  };

  // Updaters Karya (Async ke Cloud Firestore)
  const updateKaryaList = async (newItems, message = null) => {
    const validItems = Array.isArray(newItems) ? newItems : [];
    setKaryaListState(validItems);
    try {
      localStorage.setItem(STORAGE_KEYS.KARYA_DATA, JSON.stringify(validItems));
    } catch (e) {
      console.error('Gagal menyimpan Karya ke localStorage:', e);
    }

    if (isCloudActive) {
      setIsSavingToCloud(true);
      const res = await savePortfolioDataToCloud({ karyaList: validItems });
      setIsSavingToCloud(false);
      if (res.success) {
        showToast(message ? `☁️ ${message}` : '☁️ Data Karya berhasil disinkronkan ke Cloud Database!');
        return;
      }
    }

    if (message) {
      showToast(message);
    }
  };

  const addKarya = async (item) => {
    const newItem = {
      ...item,
      id: item.id || `karya-${Date.now()}`,
    };
    const updated = [newItem, ...karyaList];
    await updateKaryaList(updated, `✨ Karya "${newItem.title}" berhasil ditambahkan!`);
  };

  const editKarya = async (item) => {
    const updated = karyaList.map((k) => (k.id === item.id ? { ...k, ...item } : k));
    await updateKaryaList(updated, `💾 Perubahan pada "${item.title}" berhasil disimpan!`);
  };

  const deleteKarya = async (id, title) => {
    const updated = karyaList.filter((k) => k.id !== id);
    await updateKaryaList(updated, `🗑️ Karya "${title}" berhasil dihapus.`);
  };

  const resetKarya = async () => {
    await updateKaryaList(defaultKaryaData, '🔄 Data karya berhasil direset ke template default!');
  };

  // 8. Global Keyboard Shortcut Listener (Ctrl + Shift + B & Ctrl + Shift + P / Cmd + Shift + B / P)
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
        isCloudConnected,
        isSavingToCloud,
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
