import React, { useState, useMemo, useRef, useEffect } from 'react';
import { karyaCategories, karyaData as defaultKaryaData } from '../data/karyaData';
import './Karya.css';

// Key LocalStorage untuk data karya kustom
const PRIMARY_STORAGE_KEY = 'custom_karya_data_v5';
const LEGACY_STORAGE_KEYS = [
  'custom_karya_data_v5',
  'custom_karya_data_v4',
  'custom_karya_data',
  'refaldi_portfolio_karya_v3',
  'refaldi_portfolio_karya_v2',
  'refaldi_portfolio_karya_data',
  'refaldi_karya_data',
];

// Helper: Memeriksa apakah URL merupakan link Google Drive preview atau link embed
const isEmbedUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return (
    url.includes('drive.google.com') ||
    url.includes('/preview') ||
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('vimeo.com') ||
    url.includes('/embed/')
  );
};

// Helper: Membersihkan path agar tidak ada prefix 'public/' ganda dan mendukung URL eksternal
const cleanPath = (url) => {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  if (url.startsWith('public/')) return '/' + url.slice(7);
  if (url.startsWith('/public/')) return url.slice(7);
  if (!url.startsWith('/')) return '/' + url;
  return url;
};

// Helper: Memuat data karya dengan memastikan DATA VIDEO SELALU DIBACA LANGSUNG DARI FILE KODE (karyaData.js)
// tanpa tertimpa atau terdistorsi oleh data lama di LocalStorage.
const loadKaryaDataWithoutLocalStorageForVideos = () => {
  let saved = null;

  for (const key of LEGACY_STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          saved = parsed;
          break;
        }
      }
    } catch (e) {
      console.warn(`Gagal membaca key ${key}`, e);
    }
  }

  // Peta data default dari file kode (sumber utama videoUrl)
  const defaultById = new Map();
  defaultKaryaData.forEach((item) => {
    defaultById.set(item.id, item);
  });

  if (!saved || saved.length === 0) {
    return defaultKaryaData.map((item) => ({
      ...item,
      hidden: item.hidden ?? false,
    }));
  }

  const savedById = new Map();
  saved.forEach((item) => {
    if (item.id) savedById.set(item.id, item);
  });

  // Gabungkan: Untuk seluruh karya default, videoUrl SELALU murni diambil dari karyaData.js (kode)
  const merged = defaultKaryaData.map((defItem) => {
    const savedItem = savedById.get(defItem.id);
    if (!savedItem) {
      return {
        ...defItem,
        hidden: defItem.hidden ?? false,
      };
    }

    return {
      ...savedItem,
      videoUrl: defItem.videoUrl, // Menjamin videoUrl selalu dari file kode
      hidden: savedItem.hidden ?? defItem.hidden ?? false,
    };
  });

  // Tambahkan karya kustom baru yang mungkin ditambahkan manual oleh admin
  saved.forEach((savedItem) => {
    if (savedItem.id && !defaultById.has(savedItem.id)) {
      merged.push({
        ...savedItem,
        hidden: savedItem.hidden ?? false,
      });
    }
  });

  return merged;
};

export default function Karya() {
  const [activeCat, setActiveCat] = useState('Semua Karya');
  const [selectedKarya, setSelectedKarya] = useState(null);

  // State Data Karya - Video selalu dibaca langsung dari file kode karyaData.js
  const [items, setItems] = useState(() => loadKaryaDataWithoutLocalStorageForVideos());

  // State Notifikasi Toast
  const [toastMessage, setToastMessage] = useState(null);

  // State untuk Quick Edit Deskripsi pada Modal Detail
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    hidden: false,
  });

  // =========================================================================
  // SECRET ADMIN PANEL STATES (Ctrl + Shift + B)
  // =========================================================================
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState('Semua');
  const [adminStatusFilter, setAdminStatusFilter] = useState('Semua'); // 'Semua' | 'Tampil' | 'Hidden'

  // Form CRUD Modal di dalam Admin Panel
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(true);
  const [adminFormData, setAdminFormData] = useState({
    id: '',
    title: '',
    category: 'Edit',
    mediaType: 'video', // 'video' | 'image' | 'embed'
    videoUrl: '',
    image: '',
    embedUrl: '',
    description: '',
    tags: '',
    hidden: false,
  });

  const fileInputRef = useRef(null);

  // Daftar Kategori
  const categories = karyaCategories || [
    'Semua Karya',
    'Design',
    'Edit',
    'Collaboration Project',
    'Movie',
    'Photographic',
    'Iklan / Merch',
  ];

  // Helper trigger notifikasi toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper simpan data ke state dan localStorage
  const persistKaryaData = (newItems) => {
    setItems(newItems);
    try {
      localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(newItems));
    } catch (e) {
      console.error('Gagal menyimpan ke localStorage:', e);
      showToast('Gagal menyimpan ke LocalStorage (kuota penuh).');
    }
  };

  // =========================================================================
  // 1. KEYBOARD SHORTCUT LISTENER (Ctrl + Shift + B / Cmd + Shift + B)
  // =========================================================================
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      if (isCmdOrCtrl && e.shiftKey && (e.key === 'b' || e.key === 'B' || e.code === 'KeyB')) {
        e.preventDefault();
        setIsAdminOpen((prev) => {
          const nextState = !prev;
          if (nextState) {
            showToast('🔐 Secret Admin Panel terbuka! (Ctrl + Shift + B)');
          }
          return nextState;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // =========================================================================
  // LOGIKA TAMPILAN PENGUNJUNG BIASA:
  // HANYA menampilkan karya yang berstatus hidden: false (atau !karya.hidden)
  // =========================================================================
  const filteredKarya = useMemo(() => {
    const visibleItems = items.filter((k) => !k.hidden);

    if (activeCat === 'Semua Karya' || activeCat === 'All') return visibleItems;
    return visibleItems.filter((k) => k.category === activeCat);
  }, [items, activeCat]);

  // Filtering Logic Daftar Karya di Admin Panel
  const filteredAdminKarya = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        adminSearch.trim() === '' ||
        (item.title && item.title.toLowerCase().includes(adminSearch.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(adminSearch.toLowerCase())) ||
        (item.videoUrl && item.videoUrl.toLowerCase().includes(adminSearch.toLowerCase())) ||
        (item.image && item.image.toLowerCase().includes(adminSearch.toLowerCase())) ||
        (item.embedUrl && item.embedUrl.toLowerCase().includes(adminSearch.toLowerCase())) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(adminSearch.toLowerCase())));

      const matchCat =
        adminCategoryFilter === 'Semua' || item.category === adminCategoryFilter;

      const matchStatus =
        adminStatusFilter === 'Semua' ||
        (adminStatusFilter === 'Tampil' && !item.hidden) ||
        (adminStatusFilter === 'Hidden' && item.hidden);

      return matchSearch && matchCat && matchStatus;
    });
  }, [items, adminSearch, adminCategoryFilter, adminStatusFilter]);

  // Buka Modal Detail / Preview Publik
  const handleOpenModal = (item, startInEditMode = false) => {
    setSelectedKarya(item);
    setIsEditing(startInEditMode);
    setEditFormData({
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'Edit',
      tags: item.tags ? item.tags.join(', ') : '',
      hidden: Boolean(item.hidden),
    });
  };

  // Quick Toggle Hide/Unhide Status untuk Admin
  const handleToggleHide = (id) => {
    let updatedTitle = '';
    let nextHiddenState = false;

    const updatedItems = items.map((item) => {
      if (item.id === id) {
        nextHiddenState = !item.hidden;
        updatedTitle = item.title;
        return {
          ...item,
          hidden: nextHiddenState,
        };
      }
      return item;
    });

    persistKaryaData(updatedItems);

    if (selectedKarya && selectedKarya.id === id) {
      setSelectedKarya((prev) => (prev ? { ...prev, hidden: nextHiddenState } : null));
    }

    if (nextHiddenState) {
      showToast(`🙈 Karya "${updatedTitle}" sekarang DISEMBUNYIKAN dari pengunjung.`);
    } else {
      showToast(`👁️ Karya "${updatedTitle}" sekarang DITAMPILKAN ke pengunjung.`);
    }
  };

  // Simpan Quick Edit dari Modal Detail Publik
  const handleSaveEdit = (e) => {
    if (e) e.preventDefault();
    if (!selectedKarya) return;

    const updatedTags = editFormData.tags
      ? editFormData.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : selectedKarya.tags || [];

    const updatedItems = items.map((item) => {
      if (item.id === selectedKarya.id) {
        return {
          ...item,
          title: editFormData.title.trim() || item.title,
          description: editFormData.description.trim() || item.description,
          category: editFormData.category || item.category,
          tags: updatedTags,
          hidden: editFormData.hidden !== undefined ? Boolean(editFormData.hidden) : Boolean(item.hidden),
        };
      }
      return item;
    });

    persistKaryaData(updatedItems);

    const currentUpdated = updatedItems.find((i) => i.id === selectedKarya.id);
    setSelectedKarya(currentUpdated || null);
    setIsEditing(false);

    showToast('Perubahan judul, deskripsi & status visibilitas berhasil disimpan!');
  };

  // =========================================================================
  // 2. FITUR CRUD ADMIN PANEL
  // =========================================================================

  // Buka Form Tambah Karya Baru
  const handleOpenAddForm = () => {
    setIsCreateMode(true);
    setAdminFormData({
      id: `karya-${Date.now()}`,
      title: '',
      category: 'Edit',
      mediaType: 'video',
      videoUrl: '',
      image: '',
      embedUrl: '',
      description: '',
      tags: '',
      hidden: false,
    });
    setIsFormModalOpen(true);
  };

  // Buka Form Edit Karya
  const handleOpenEditForm = (item) => {
    setIsCreateMode(false);
    let detectedType = 'image';
    if (item.videoUrl) detectedType = 'video';
    else if (item.embedUrl) detectedType = 'embed';

    setAdminFormData({
      id: item.id || `karya-${Date.now()}`,
      title: item.title || '',
      category: item.category || 'Edit',
      mediaType: detectedType,
      videoUrl: item.videoUrl || '',
      image: item.image || (Array.isArray(item.images) ? item.images[0] : '') || '',
      embedUrl: item.embedUrl || '',
      description: item.description || '',
      tags: item.tags ? item.tags.join(', ') : '',
      hidden: Boolean(item.hidden),
    });
    setIsFormModalOpen(true);
  };

  // Simpan Form CRUD Admin (Tambah atau Edit)
  const handleSaveAdminForm = (e) => {
    if (e) e.preventDefault();

    if (!adminFormData.title.trim()) {
      alert('Mohon masukkan judul karya.');
      return;
    }

    const tagsArr = adminFormData.tags
      ? adminFormData.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const newItemData = {
      id: adminFormData.id || `karya-${Date.now()}`,
      title: adminFormData.title.trim(),
      category: adminFormData.category || 'Edit',
      description: adminFormData.description.trim(),
      tags: tagsArr,
      hidden: Boolean(adminFormData.hidden),
    };

    // Pasang media sesuai tipe yang dipilih
    if (adminFormData.mediaType === 'video') {
      newItemData.videoUrl = adminFormData.videoUrl.trim();
      delete newItemData.image;
      delete newItemData.images;
      delete newItemData.embedUrl;
    } else if (adminFormData.mediaType === 'embed') {
      newItemData.embedUrl = adminFormData.embedUrl.trim();
      delete newItemData.videoUrl;
      delete newItemData.image;
      delete newItemData.images;
    } else {
      newItemData.image = adminFormData.image.trim();
      delete newItemData.videoUrl;
      delete newItemData.embedUrl;
    }

    let updatedItems;
    if (isCreateMode) {
      updatedItems = [newItemData, ...items];
      showToast(`✨ Karya baru "${newItemData.title}" berhasil ditambahkan!`);
    } else {
      updatedItems = items.map((item) =>
        item.id === newItemData.id ? { ...item, ...newItemData } : item
      );
      showToast(`💾 Perubahan pada "${newItemData.title}" berhasil disimpan!`);
    }

    persistKaryaData(updatedItems);
    setIsFormModalOpen(false);

    if (selectedKarya && selectedKarya.id === newItemData.id) {
      setSelectedKarya(newItemData);
    }
  };

  // Hapus Karya
  const handleDeleteItem = (id, title) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus karya:\n"${title}"?\n\nTindakan ini akan menghapus karya dari daftar dan LocalStorage.`
    );
    if (!confirmDelete) return;

    const updatedItems = items.filter((item) => item.id !== id);
    persistKaryaData(updatedItems);

    if (selectedKarya && selectedKarya.id === id) {
      setSelectedKarya(null);
    }

    showToast(`🗑️ Karya "${title}" berhasil dihapus.`);
  };

  // Reset Data ke Default karyaData.js
  const handleResetToDefault = () => {
    const confirmReset = window.confirm(
      '⚠️ PERINGATAN: Apakah Anda yakin ingin mereset seluruh data karya ke bawaan asli (default)?\n\nSemua karya baru, editan lokal, atau status hide akan dikembalikan ke data default.'
    );
    if (!confirmReset) return;

    try {
      localStorage.removeItem(PRIMARY_STORAGE_KEY);
    } catch (e) {
      console.warn('Gagal membersihkan localStorage', e);
    }

    persistKaryaData(defaultKaryaData);
    setSelectedKarya(null);
    setIsEditing(false);
    showToast('🔄 Seluruh data karya telah dikembalikan ke bawaan default!');
  };

  // Export Backup Data JSON
  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify(items, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `backup_karya_refaldi_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('File backup JSON berhasil diunduh!');
    } catch (e) {
      console.error('Gagal mengekspor data', e);
      showToast('Gagal mengekspor data JSON.');
    }
  };

  // Import Backup Data JSON
  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.map((item) => ({
            ...item,
            hidden: item.hidden ?? false,
          }));
          persistKaryaData(sanitized);
          setSelectedKarya(null);
          setIsEditing(false);
          showToast(`Berhasil memulihkan ${sanitized.length} karya dari file backup!`);
        } else {
          alert('Format file JSON tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const totalVisible = items.filter((i) => !i.hidden).length;
  const totalHidden = items.filter((i) => i.hidden).length;

  return (
    <section id="karya" className="section pop-karya-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-badge">
            <span>Galeri Karya & Video Proyek</span>
          </div>
          <h2 className="section-title">
            Hasil Karya & <span className="section-title-cream">Portofolio</span>
          </h2>
          <p className="section-subtitle">
            Kumpulan video kreatif, editing video, motion graphic, film berita, dan materi promosi iklan yang telah saya kerjakan.
          </p>

          {/* Backup & Secret Admin Quick Toolbar */}
          <div className="karya-backup-toolbar">
            <button
              type="button"
              className="btn-backup-admin-trigger"
              onClick={() => {
                setIsAdminOpen(true);
                showToast('🔐 Secret Admin Panel terbuka! (Ctrl + Shift + B)');
              }}
              title="Buka Secret Admin Panel (Shortcut: Ctrl + Shift + B)"
            >
              <span className="admin-key-icon">🔐</span>
              <span>Admin Panel</span>
              <kbd className="admin-shortcut-kbd">Ctrl+Shift+B</kbd>
            </button>

            <button
              type="button"
              className="btn-backup-export"
              onClick={handleExportJSON}
              title="Unduh file backup teks deskripsi karya Anda"
            >
              <span>Export Data JSON</span>
            </button>

            <button
              type="button"
              className="btn-backup-import"
              onClick={() => fileInputRef.current?.click()}
              title="Unggah file JSON backup untuk memulihkan deskripsi"
            >
              <span>Import Backup</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImportJSON}
            />
          </div>
        </div>

        {/* Notifikasi Toast */}
        {toastMessage && (
          <div className="karya-save-toast animate-pop-in">
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Category Filter Pills */}
        <div className="karya-filter-row">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`karya-filter-btn ${activeCat === cat ? 'active' : ''}`}
              onClick={() => setActiveCat(cat)}
            >
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Karya Grid - HANYA MENAMPILKAN KARYA VISIBLE (hidden: false) */}
        {filteredKarya.length > 0 ? (
          <div className="pop-karya-grid">
            {filteredKarya.map((item) => {
              const videoSrc = item.videoUrl || item.embedUrl || '';
              const isDrive = Boolean(videoSrc && videoSrc.includes('drive.google.com'));
              const isEmbed = isDrive || isEmbedUrl(videoSrc);
              const hasVideo = Boolean(item.videoUrl) && !isEmbed;
              const hasEmbed = Boolean(item.embedUrl) || isEmbed;
              const imgSrc = item.image || (Array.isArray(item.images) ? item.images[0] : '');

              return (
                <div
                  key={item.id}
                  className="karya-pop-card pop-card"
                  onClick={() => handleOpenModal(item, false)}
                >
                  {/* Thumbnail Container */}
                  <div className="karya-thumb-box">
                    {isEmbed ? (
                      <div className="karya-thumb-embed-wrap karya-thumb-drive-wrap">
                        <div className="karya-embed-placeholder karya-drive-placeholder">
                          <div className="karya-drive-play-badge">
                            <span className="karya-drive-play-icon">▶</span>
                          </div>
                          <span className="karya-drive-badge-title">
                            {isDrive ? 'Google Drive Video' : 'Video Player'}
                          </span>
                          <span className="karya-drive-badge-sub">Klik untuk memutar</span>
                        </div>
                      </div>
                    ) : hasVideo ? (
                      <video
                        src={cleanPath(item.videoUrl)}
                        preload="metadata"
                        muted
                        playsInline
                        className="karya-thumb-img karya-thumb-video"
                      />
                    ) : hasEmbed ? (
                      <div className="karya-thumb-embed-wrap">
                        <div className="karya-embed-placeholder">
                          <span>🌐 Video Embed / Web Player</span>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={cleanPath(imgSrc)}
                        alt={item.title}
                        className="karya-thumb-img"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                    )}

                    <div className="karya-thumb-overlay">
                      <span className="karya-zoom-badge">
                        {isDrive ? '▶ Putar Video (Drive)' : isEmbed ? '▶ Buka Embed' : hasVideo ? 'Putar Video' : 'Lihat Detail'}
                      </span>
                    </div>
                    <div className="karya-cat-sticker">{item.category}</div>
                  </div>

                  {/* Card Body */}
                  <div className="karya-pop-body">
                    <div className="karya-title-row">
                      <h3 className="karya-pop-title">{item.title}</h3>
                    </div>
                    <p className="karya-pop-desc">{item.description}</p>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="karya-pop-tags">
                        {item.tags.map((tag) => (
                          <span key={tag} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="karya-pop-footer">
                    <button
                      type="button"
                      className="btn-card-edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(item, true);
                      }}
                      title="Quick edit judul dan deskripsi"
                    >
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      className="btn-karya-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(item, false);
                      }}
                    >
                      <span>{isEmbed ? 'Putar Video' : hasVideo ? 'Buka Video' : hasEmbed ? 'Buka Embed' : 'Buka Preview'}</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="karya-empty-state pop-card">
            <h3 className="empty-title">Kategori {activeCat}</h3>
            <p className="empty-desc">
              Belum ada karya yang ditampilkan untuk kategori ini. Tekan <kbd className="admin-shortcut-kbd">Ctrl + Shift + B</kbd> untuk mengelola atau menampilkan karya!
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setActiveCat('Semua Karya')}
            >
              Lihat Semua Karya
            </button>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 3. MODAL DETAIL / LIGHTBOX PUBLIK (PEMUTAR VIDEO) */}
      {/* ===================================================================== */}
      {selectedKarya && (
        <div
          className="karya-lightbox-backdrop"
          onClick={() => {
            setSelectedKarya(null);
            setIsEditing(false);
          }}
        >
          <div
            className="karya-lightbox-content pop-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="lightbox-header">
              <div className="lightbox-header-left">
                <div className="lightbox-header-meta">
                  <span className="lightbox-cat">{selectedKarya.category}</span>
                  {selectedKarya.hidden && (
                    <span className="lightbox-hidden-badge" title="Karya ini sedang disembunyikan dari halaman utama">
                      🙈 Hidden dari Galeri
                    </span>
                  )}
                </div>
                <h3 className="lightbox-title">{selectedKarya.title}</h3>
              </div>
              <div className="lightbox-header-actions">
                {!isEditing && (
                  <button
                    type="button"
                    className="btn-lightbox-edit"
                    onClick={() => {
                      setEditFormData({
                        title: selectedKarya.title || '',
                        description: selectedKarya.description || '',
                        category: selectedKarya.category || 'Edit',
                        tags: selectedKarya.tags ? selectedKarya.tags.join(', ') : '',
                        hidden: Boolean(selectedKarya.hidden),
                      });
                      setIsEditing(true);
                    }}
                    title="Edit judul, deskripsi, atau visibilitas karya ini"
                  >
                    <span>Edit Deskripsi</span>
                  </button>
                )}
                <button
                  type="button"
                  className="lightbox-close-btn"
                  onClick={() => {
                    setSelectedKarya(null);
                    setIsEditing(false);
                  }}
                  aria-label="Tutup"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body Modal */}
            <div className="lightbox-body">
              {/* Media Player Container: Render iframe jika mengandung drive.google.com atau link embed */}
              <div className="lightbox-img-wrap">
                {((selectedKarya.videoUrl && selectedKarya.videoUrl.includes('drive.google.com')) ||
                  (selectedKarya.embedUrl && selectedKarya.embedUrl.includes('drive.google.com')) ||
                  isEmbedUrl(selectedKarya.videoUrl || selectedKarya.embedUrl)) ? (
                  <iframe
                    src={cleanPath(selectedKarya.videoUrl || selectedKarya.embedUrl)}
                    title={selectedKarya.title}
                    className="w-full h-full rounded-xl border-0 lightbox-embed-player lightbox-drive-iframe"
                    allow="autoplay"
                    allowFullScreen
                  />
                ) : selectedKarya.videoUrl ? (
                  <video
                    key={selectedKarya.id + selectedKarya.videoUrl}
                    src={cleanPath(selectedKarya.videoUrl)}
                    controls
                    autoPlay
                    playsInline
                    className="lightbox-video-player"
                  >
                    Browser Anda tidak mendukung tag video HTML5.
                  </video>
                ) : selectedKarya.embedUrl ? (
                  <iframe
                    src={selectedKarya.embedUrl}
                    title={selectedKarya.title}
                    className="w-full h-full rounded-xl border-0 lightbox-embed-player"
                    allow="autoplay"
                    allowFullScreen
                  />
                ) : (
                  <img
                    src={cleanPath(
                      selectedKarya.image ||
                        (Array.isArray(selectedKarya.images) ? selectedKarya.images[0] : '')
                    )}
                    alt={selectedKarya.title}
                    className="lightbox-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                )}
              </div>

              {/* Tombol Buka Gambar Resolusi Penuh */}
              {!selectedKarya.videoUrl && !selectedKarya.embedUrl && (selectedKarya.image || selectedKarya.images) && (
                <div className="lightbox-full-img-action">
                  <a
                    href={cleanPath(
                      selectedKarya.image ||
                        (Array.isArray(selectedKarya.images) ? selectedKarya.images[0] : '')
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-full-res-img"
                    title="Buka gambar resolusi asli di tab baru"
                  >
                    <span>🔍 Buka Gambar Resolusi Penuh</span>
                  </a>
                </div>
              )}

              {selectedKarya.videoUrl && (
                <div className="lightbox-video-path-note">
                  <span>
                    {selectedKarya.videoUrl.includes('drive.google.com') ? 'Google Drive Embed URL:' : 'File Video:'}{' '}
                    <code>{cleanPath(selectedKarya.videoUrl)}</code>
                  </span>
                </div>
              )}

              {selectedKarya.embedUrl && (
                <div className="lightbox-video-path-note">
                  <span>
                    Embed URL: <code>{selectedKarya.embedUrl}</code>
                  </span>
                </div>
              )}

              {/* Form Inline Edit ATAU Tampilan Normal */}
              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="karya-edit-form pop-card">
                  <h4 className="edit-form-heading">Edit Judul, Deskripsi & Visibilitas Karya</h4>

                  <div className="edit-form-field">
                    <label htmlFor="edit-title">Judul Karya:</label>
                    <input
                      type="text"
                      id="edit-title"
                      className="pop-input"
                      value={editFormData.title}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, title: e.target.value })
                      }
                      placeholder="Masukkan judul karya..."
                      required
                    />
                  </div>

                  <div className="edit-form-field">
                    <label htmlFor="edit-desc">Deskripsi Karya:</label>
                    <textarea
                      id="edit-desc"
                      rows="4"
                      className="pop-textarea"
                      value={editFormData.description}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Masukkan deskripsi mengenai karya ini..."
                      required
                    />
                  </div>

                  <div className="edit-form-row">
                    <div className="edit-form-field">
                      <label htmlFor="edit-cat">Kategori:</label>
                      <select
                        id="edit-cat"
                        className="pop-input"
                        value={editFormData.category}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            category: e.target.value,
                          })
                        }
                      >
                        {categories
                          .filter((c) => c !== 'Semua Karya')
                          .map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="edit-form-field">
                      <label htmlFor="edit-tags">Tags (pisahkan koma):</label>
                      <input
                        type="text"
                        id="edit-tags"
                        className="pop-input"
                        value={editFormData.tags}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, tags: e.target.value })
                        }
                        placeholder="Video Edit, Reels, Content"
                      />
                    </div>
                  </div>

                  {/* Toggle Hide Option */}
                  <div className="edit-form-field admin-hide-toggle-card">
                    <label className="admin-checkbox-label" htmlFor="lightbox-edit-hidden">
                      <input
                        type="checkbox"
                        id="lightbox-edit-hidden"
                        className="admin-pop-checkbox"
                        checked={Boolean(editFormData.hidden)}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, hidden: e.target.checked })
                        }
                      />
                      <div className="admin-checkbox-content">
                        <span className="admin-checkbox-title">
                          🙈 Sembunyikan Karya (Hide Work)
                        </span>
                        <span className="admin-checkbox-desc">
                          Jika dicentang, karya ini tidak akan tampil di galeri publik untuk pengunjung biasa.
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="edit-form-buttons">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Batal
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="lightbox-desc-box">
                    <h4>Deskripsi & Konsep Karya:</h4>
                    <p>{selectedKarya.description}</p>
                  </div>

                  {selectedKarya.tags && selectedKarya.tags.length > 0 && (
                    <div className="lightbox-tools-box">
                      <strong>Tags / Kategori:</strong>
                      <div className="lightbox-tools-tags">
                        {selectedKarya.tags.map((t) => (
                          <span key={t} className="tag">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer Modal */}
            <div className="lightbox-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setSelectedKarya(null);
                  setIsEditing(false);
                }}
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. SECRET ADMIN PANEL MODAL (Ctrl + Shift + B) */}
      {/* ===================================================================== */}
      {isAdminOpen && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setIsAdminOpen(false)}
        >
          <div
            className="admin-modal-window pop-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Admin Panel */}
            <div className="admin-modal-header">
              <div className="admin-header-title-box">
                <div className="admin-badge-row">
                  <span className="admin-badge-pulse">● LIVE ADMIN</span>
                  <span className="admin-shortcut-pill">Shortcut: Ctrl + Shift + B</span>
                </div>
                <h3 className="admin-modal-title">🔐 Secret Admin Panel</h3>
                <p className="admin-modal-subtitle">
                  Kelola daftar karya, kontrol tampil/sembunyikan (Hide/Unhide), edit link Google Drive / embed / media, dan sinkronisasi ke LocalStorage.
                </p>
              </div>

              <div className="admin-header-actions">
                <button
                  type="button"
                  className="btn-admin-add"
                  onClick={handleOpenAddForm}
                  title="Tambah item karya baru"
                >
                  <span>+ Tambah Karya Baru</span>
                </button>
                <button
                  type="button"
                  className="admin-close-btn"
                  onClick={() => setIsAdminOpen(false)}
                  title="Tutup Secret Admin Panel (Esc)"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Stats & Search Toolbar */}
            <div className="admin-modal-toolbar">
              <div className="admin-search-box">
                <span className="admin-search-icon">🔍</span>
                <input
                  type="text"
                  className="admin-search-input pop-input"
                  placeholder="Cari judul, link drive, tag..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                />
                {adminSearch && (
                  <button
                    type="button"
                    className="admin-search-clear"
                    onClick={() => setAdminSearch('')}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="admin-filter-group">
                {/* Filter Kategori */}
                <select
                  className="admin-cat-select pop-input"
                  value={adminCategoryFilter}
                  onChange={(e) => setAdminCategoryFilter(e.target.value)}
                >
                  <option value="Semua">Semua Kategori ({items.length})</option>
                  {categories
                    .filter((c) => c !== 'Semua Karya')
                    .map((c) => (
                      <option key={c} value={c}>
                        {c} ({items.filter((i) => i.category === c).length})
                      </option>
                    ))}
                </select>

                {/* Filter Status Tampil / Hidden */}
                <select
                  className="admin-cat-select pop-input admin-status-select"
                  value={adminStatusFilter}
                  onChange={(e) => setAdminStatusFilter(e.target.value)}
                  title="Filter berdasarkan status tampil / disembunyikan"
                >
                  <option value="Semua">Semua Status ({items.length})</option>
                  <option value="Tampil">👁️ Tampil ({totalVisible})</option>
                  <option value="Hidden">🙈 Disembunyikan ({totalHidden})</option>
                </select>

                <button
                  type="button"
                  className="btn-admin-reset"
                  onClick={handleResetToDefault}
                  title="Kembalikan semua karya ke data awal default"
                >
                  <span>🔄 Reset Default</span>
                </button>
              </div>
            </div>

            {/* Admin Stats Bar */}
            <div className="admin-stats-bar">
              <span className="admin-stat-tag">
                Menampilkan <strong>{filteredAdminKarya.length}</strong> dari <strong>{items.length}</strong> karya
              </span>
              <span className="admin-stat-tag admin-stat-visible">
                👁️ <strong>{totalVisible}</strong> Tampil di Galeri
              </span>
              <span className={`admin-stat-tag ${totalHidden > 0 ? 'admin-stat-hidden' : ''}`}>
                🙈 <strong>{totalHidden}</strong> Disembunyikan
              </span>
              <span className="admin-stat-tag">
                🎥 <strong>{items.filter((i) => i.videoUrl && !i.videoUrl.includes('drive.google.com')).length}</strong> MP4 Lokal
              </span>
              <span className="admin-stat-tag">
                📁 <strong>{items.filter((i) => i.videoUrl && i.videoUrl.includes('drive.google.com')).length}</strong> G-Drive
              </span>
              <span className="admin-stat-tag">
                🖼️ <strong>{items.filter((i) => i.image || i.images).length}</strong> Gambar
              </span>
            </div>

            {/* Admin Table / Item List */}
            <div className="admin-table-container">
              {filteredAdminKarya.length > 0 ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>No</th>
                      <th style={{ width: '70px' }}>Media</th>
                      <th>Judul & Kategori</th>
                      <th style={{ width: '130px', textAlign: 'center' }}>Status Galeri</th>
                      <th>Path File / URL Media</th>
                      <th>Tags</th>
                      <th style={{ width: '170px', textAlign: 'center' }}>Aksi Admin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdminKarya.map((item, idx) => {
                      const videoSrc = item.videoUrl || item.embedUrl || '';
                      const isDrive = Boolean(videoSrc && videoSrc.includes('drive.google.com'));
                      const isEmbed = isDrive || isEmbedUrl(videoSrc);
                      const hasVideo = Boolean(item.videoUrl) && !isEmbed;
                      const mediaPath = item.videoUrl || item.image || item.embedUrl || '-';
                      const isHidden = Boolean(item.hidden);

                      return (
                        <tr
                          key={item.id || idx}
                          className={`admin-table-row ${isHidden ? 'is-row-hidden' : ''}`}
                        >
                          <td className="admin-cell-num">{idx + 1}</td>
                          <td className="admin-cell-thumb">
                            <div className="admin-row-thumb">
                              {isDrive ? (
                                <div className="admin-thumb-drive-badge">📁 Drive</div>
                              ) : isEmbed ? (
                                <div className="admin-thumb-embed-badge">🌐 Embed</div>
                              ) : hasVideo ? (
                                <div className="admin-thumb-video-badge">🎥 Video</div>
                              ) : (
                                <img
                                  src={cleanPath(item.image || (Array.isArray(item.images) ? item.images[0] : ''))}
                                  alt=""
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=80';
                                  }}
                                />
                              )}
                            </div>
                          </td>
                          <td className="admin-cell-title">
                            <div className="admin-title-strong">{item.title}</div>
                            <span className="admin-cat-chip">{item.category}</span>
                          </td>
                          <td className="admin-cell-status">
                            <button
                              type="button"
                              className={`admin-status-toggle-pill ${isHidden ? 'status-pill-hidden' : 'status-pill-visible'}`}
                              onClick={() => handleToggleHide(item.id)}
                              title={isHidden ? 'Klik untuk MENAMPILKAN karya ini' : 'Klik untuk MENYEMBUNYIKAN karya ini'}
                            >
                              <span className="status-pill-icon">{isHidden ? '🙈' : '👁️'}</span>
                              <span className="status-pill-text">
                                {isHidden ? 'Disembunyikan' : 'Tampil'}
                              </span>
                            </button>
                          </td>
                          <td className="admin-cell-path">
                            <div className="admin-path-box" title={mediaPath}>
                              <span className="admin-path-type">
                                {isDrive ? 'DRIVE:' : isEmbed ? 'EMBED:' : hasVideo ? 'MP4:' : 'IMG:'}
                              </span>
                              <code>{cleanPath(mediaPath)}</code>
                            </div>
                          </td>
                          <td className="admin-cell-tags">
                            <div className="admin-tags-list">
                              {item.tags && item.tags.length > 0 ? (
                                item.tags.slice(0, 3).map((t) => (
                                  <span key={t} className="admin-mini-tag">
                                    {t}
                                  </span>
                                ))
                              ) : (
                                <span className="admin-no-tag">-</span>
                              )}
                            </div>
                          </td>
                          <td className="admin-cell-actions">
                            <div className="admin-actions-flex">
                              <button
                                type="button"
                                className="btn-admin-row-edit"
                                onClick={() => handleOpenEditForm(item)}
                                title="Edit karya ini"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                type="button"
                                className={`btn-admin-row-toggle ${isHidden ? 'btn-unhide' : 'btn-hide'}`}
                                onClick={() => handleToggleHide(item.id)}
                                title={isHidden ? 'Tampilkan karya ke pengunjung' : 'Sembunyikan karya dari pengunjung'}
                              >
                                {isHidden ? '👁️ Unhide' : '🙈 Hide'}
                              </button>
                              <button
                                type="button"
                                className="btn-admin-row-delete"
                                onClick={() => handleDeleteItem(item.id, item.title)}
                                title="Hapus karya ini"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="admin-empty-results">
                  <p>Tidak ada karya yang sesuai dengan filter atau pencarian "{adminSearch}".</p>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setAdminSearch('');
                      setAdminCategoryFilter('Semua');
                      setAdminStatusFilter('Semua');
                    }}
                  >
                    Bersihkan Filter
                  </button>
                </div>
              )}
            </div>

            {/* Footer Admin Modal */}
            <div className="admin-modal-footer">
              <div className="admin-footer-tip">
                💡 <strong>Tips:</strong> Klik tombol <code>Hide / Unhide</code> atau <code>Status</code> untuk mengubah visibilitas karya secara instan.
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsAdminOpen(false)}
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. MODAL FORM CRUD ADMIN (TAMBAH / EDIT KARYA DENGAN LIVE PREVIEW) */}
      {/* ===================================================================== */}
      {isFormModalOpen && (
        <div
          className="admin-form-backdrop"
          onClick={() => setIsFormModalOpen(false)}
        >
          <div
            className="admin-form-window pop-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-form-header">
              <h3 className="admin-form-title">
                {isCreateMode ? '✨ Tambah Karya Baru' : `✏️ Edit Karya: ${adminFormData.title || 'Portofolio'}`}
              </h3>
              <button
                type="button"
                className="lightbox-close-btn"
                onClick={() => setIsFormModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAdminForm} className="admin-crud-form">
              <div className="admin-form-grid">
                {/* Kolom Kiri: Input Data */}
                <div className="admin-form-col-inputs">
                  {/* Judul Karya */}
                  <div className="edit-form-field">
                    <label htmlFor="admin-input-title">
                      Judul Karya <span className="req-star">*</span>:
                    </label>
                    <input
                      type="text"
                      id="admin-input-title"
                      className="pop-input"
                      value={adminFormData.title}
                      onChange={(e) =>
                        setAdminFormData({ ...adminFormData, title: e.target.value })
                      }
                      placeholder="Contoh: Video Cinematic Bazzar 2024"
                      required
                    />
                  </div>

                  {/* Kategori */}
                  <div className="edit-form-field">
                    <label htmlFor="admin-input-cat">Kategori:</label>
                    <select
                      id="admin-input-cat"
                      className="pop-input"
                      value={adminFormData.category}
                      onChange={(e) =>
                        setAdminFormData({ ...adminFormData, category: e.target.value })
                      }
                    >
                      {categories
                        .filter((c) => c !== 'Semua Karya')
                        .map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Selector Tipe Media */}
                  <div className="edit-form-field">
                    <label>Pilih Tipe Media:</label>
                    <div className="admin-media-type-selector">
                      <button
                        type="button"
                        className={`admin-type-tab ${adminFormData.mediaType === 'video' ? 'active' : ''}`}
                        onClick={() =>
                          setAdminFormData({ ...adminFormData, mediaType: 'video' })
                        }
                      >
                        🎥 Video (Drive / MP4)
                      </button>
                      <button
                        type="button"
                        className={`admin-type-tab ${adminFormData.mediaType === 'image' ? 'active' : ''}`}
                        onClick={() =>
                          setAdminFormData({ ...adminFormData, mediaType: 'image' })
                        }
                      >
                        🖼️ Gambar / Foto
                      </button>
                      <button
                        type="button"
                        className={`admin-type-tab ${adminFormData.mediaType === 'embed' ? 'active' : ''}`}
                        onClick={() =>
                          setAdminFormData({ ...adminFormData, mediaType: 'embed' })
                        }
                      >
                        🌐 Embed / YouTube
                      </button>
                    </div>
                  </div>

                  {/* Input Path Sesuai Tipe Media */}
                  {adminFormData.mediaType === 'video' && (
                    <div className="edit-form-field">
                      <label htmlFor="admin-input-video">
                        URL Embed Google Drive / Path Video MP4:
                      </label>
                      <input
                        type="text"
                        id="admin-input-video"
                        className="pop-input font-mono-input"
                        value={adminFormData.videoUrl}
                        onChange={(e) =>
                          setAdminFormData({ ...adminFormData, videoUrl: e.target.value })
                        }
                        placeholder="https://drive.google.com/file/d/.../preview atau /videos/nama_video.mp4"
                      />
                      <span className="admin-field-hint">
                        💡 Bisa berupa link Google Drive <code>https://drive.google.com/file/d/ID/preview</code> atau path file <code>/videos/nama_file.mp4</code>.
                      </span>
                    </div>
                  )}

                  {adminFormData.mediaType === 'image' && (
                    <div className="edit-form-field">
                      <label htmlFor="admin-input-image">
                        Path File Gambar / URL Foto:
                      </label>
                      <input
                        type="text"
                        id="admin-input-image"
                        className="pop-input font-mono-input"
                        value={adminFormData.image}
                        onChange={(e) =>
                          setAdminFormData({ ...adminFormData, image: e.target.value })
                        }
                        placeholder="/images/nama_gambar.png atau https://..."
                      />
                      <span className="admin-field-hint">
                        💡 Letakkan file di folder <code>public/images/</code> lalu masukkan <code>/images/nama_file.png</code> atau link URL gambar.
                      </span>
                    </div>
                  )}

                  {adminFormData.mediaType === 'embed' && (
                    <div className="edit-form-field">
                      <label htmlFor="admin-input-embed">
                        URL Embed Video / Iframe:
                      </label>
                      <input
                        type="text"
                        id="admin-input-embed"
                        className="pop-input font-mono-input"
                        value={adminFormData.embedUrl}
                        onChange={(e) =>
                          setAdminFormData({ ...adminFormData, embedUrl: e.target.value })
                        }
                        placeholder="https://www.youtube.com/embed/XXXXX atau Google Drive preview"
                      />
                      <span className="admin-field-hint">
                        💡 Masukkan URL embed (misal YouTube Embed <code>https://www.youtube.com/embed/...</code> atau Google Drive <code>https://drive.google.com/file/d/.../preview</code>).
                      </span>
                    </div>
                  )}

                  {/* Deskripsi Karya */}
                  <div className="edit-form-field">
                    <label htmlFor="admin-input-desc">Deskripsi Karya:</label>
                    <textarea
                      id="admin-input-desc"
                      rows="4"
                      className="pop-textarea"
                      value={adminFormData.description}
                      onChange={(e) =>
                        setAdminFormData({
                          ...adminFormData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Ceritakan proses pembuatan, konsep, atau software yang digunakan..."
                    />
                  </div>

                  {/* Tags */}
                  <div className="edit-form-field">
                    <label htmlFor="admin-input-tags">
                      Tags (pisahkan dengan koma):
                    </label>
                    <input
                      type="text"
                      id="admin-input-tags"
                      className="pop-input"
                      value={adminFormData.tags}
                      onChange={(e) =>
                        setAdminFormData({ ...adminFormData, tags: e.target.value })
                      }
                      placeholder="Video Edit, Premiere Pro, Motion, Cinematic"
                    />
                  </div>

                  {/* Checkbox / Toggle Hide Work */}
                  <div className="edit-form-field admin-hide-toggle-card">
                    <label className="admin-checkbox-label" htmlFor="admin-input-hidden">
                      <input
                        type="checkbox"
                        id="admin-input-hidden"
                        className="admin-pop-checkbox"
                        checked={Boolean(adminFormData.hidden)}
                        onChange={(e) =>
                          setAdminFormData({ ...adminFormData, hidden: e.target.checked })
                        }
                      />
                      <div className="admin-checkbox-content">
                        <span className="admin-checkbox-title">
                          🙈 Sembunyikan Karya (Hide Work)
                        </span>
                        <span className="admin-checkbox-desc">
                          Jika dicentang, status karya menjadi <code>hidden: true</code> dan tidak akan ditampilkan pada galeri pengunjung biasa.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Kolom Kanan: Live Preview Media */}
                <div className="admin-form-col-preview">
                  <label className="admin-preview-title">Live Preview Media:</label>
                  <div className="admin-live-preview-box">
                    {adminFormData.mediaType === 'video' && adminFormData.videoUrl ? (
                      (adminFormData.videoUrl.includes('drive.google.com') || isEmbedUrl(adminFormData.videoUrl)) ? (
                        <iframe
                          key={adminFormData.videoUrl}
                          src={cleanPath(adminFormData.videoUrl)}
                          title="Live Drive Video Preview"
                          allow="autoplay"
                          allowFullScreen
                          className="w-full h-full rounded-xl border-0 admin-preview-iframe"
                        />
                      ) : (
                        <video
                          key={adminFormData.videoUrl}
                          src={cleanPath(adminFormData.videoUrl)}
                          controls
                          playsInline
                          className="admin-preview-media"
                        >
                          Format video tidak didukung atau path salah.
                        </video>
                      )
                    ) : adminFormData.mediaType === 'embed' && adminFormData.embedUrl ? (
                      <iframe
                        src={adminFormData.embedUrl}
                        title="Live Embed Preview"
                        allow="autoplay"
                        allowFullScreen
                        className="w-full h-full rounded-xl border-0 admin-preview-iframe"
                      />
                    ) : adminFormData.mediaType === 'image' && adminFormData.image ? (
                      <img
                        src={cleanPath(adminFormData.image)}
                        alt="Preview"
                        className="admin-preview-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                    ) : (
                      <div className="admin-preview-placeholder">
                        <span>Masukkan Path / URL untuk melihat preview langsung</span>
                      </div>
                    )}
                  </div>

                  <div className="admin-preview-info-card">
                    <div className="admin-preview-card-header">
                      <h4>{adminFormData.title || '(Judul Karya)'}</h4>
                      <div className="admin-preview-badges">
                        <span className="admin-cat-chip">{adminFormData.category}</span>
                        {adminFormData.hidden ? (
                          <span className="admin-status-pill pill-hidden">🙈 Status: Hidden</span>
                        ) : (
                          <span className="admin-status-pill pill-visible">👁️ Status: Tampil</span>
                        )}
                      </div>
                    </div>
                    <p>{adminFormData.description || 'Deskripsi karya akan tampil di sini.'}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="admin-crud-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsFormModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  {isCreateMode ? '✨ Tambahkan Karya' : '💾 Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
