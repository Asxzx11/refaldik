import React, { useState, useMemo, useRef } from 'react';
import { karyaCategories, karyaData as defaultKaryaData } from '../data/karyaData';
import './Karya.css';

const PRIMARY_STORAGE_KEY = 'refaldi_portfolio_karya_v3';
const LEGACY_STORAGE_KEYS = [
  'refaldi_portfolio_karya_v3',
  'refaldi_portfolio_karya_v2',
  'refaldi_portfolio_karya_data',
  'refaldi_karya_data',
];

// Pilihan kategori default untuk formulir tambah karya
const DEFAULT_FORM_CATEGORIES = [
  'Iklan / Merch',
  'Video',
  'Desain Visual',
  'Design',
  'Edit',
  'Collaboration Project',
  'Movie',
  'Photographic',
];

// Helper: Membersihkan path agar tidak ada prefix 'public/' ganda
const cleanPath = (url) => {
  if (!url) return '';
  if (url.startsWith('public/')) return '/' + url.slice(7);
  if (url.startsWith('/public/')) return url.slice(7);
  return url;
};

// Helper: Format URL media agar dapat di-embed / ditampilkan dengan benar (Google Drive, YouTube, dll)
const formatMediaUrl = (type, rawUrl) => {
  if (!rawUrl) return '';
  let url = rawUrl.trim();

  // Jika pengguna menempelkan tag <iframe> lengkap, ekstrak atribut src
  if (url.includes('<iframe') && url.includes('src=')) {
    const match = url.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) {
      url = match[1];
    }
  }

  if (type === 'drive') {
    // Pola Google Drive: /file/d/FILE_ID/...
    const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
    if (driveFileMatch && driveFileMatch[1]) {
      return `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`;
    }

    // Pola Google Drive open?id=FILE_ID atau uc?id=FILE_ID
    const driveIdMatch = url.match(/drive\.google\.com\/(?:open|uc)\?id=([a-zA-Z0-9_-]+)/i);
    if (driveIdMatch && driveIdMatch[1]) {
      return `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`;
    }

    // Pola YouTube jika dimasukkan ke embed
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/i);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }

    // Jika sudah berupa link preview atau URL langsung
    return url;
  }

  return cleanPath(url);
};

// Helper: Memeriksa apakah suatu item bertipe Google Drive / Iframe Embed
const isDriveEmbed = (item) => {
  if (!item) return false;
  if (item.mediaType === 'drive' || Boolean(item.embedUrl)) return true;
  const url = item.videoUrl || '';
  return url.includes('drive.google.com') || url.includes('youtube.com') || url.includes('/preview');
};

// Helper: Menggabungkan data localStorage dengan data default tanpa menghapus karya buatan pengguna
const loadAndMergeKaryaData = () => {
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

  if (!saved || saved.length === 0) {
    return defaultKaryaData;
  }

  // Peta data tersimpan berdasarkan ID dan Path Media
  const savedById = new Map();
  const savedByUrl = new Map();

  saved.forEach((item) => {
    if (item.id) savedById.set(item.id, item);
    const url = item.videoUrl || item.image || item.embedUrl;
    if (url) savedByUrl.set(url, item);
  });

  // Salin semua item yang tersimpan di localStorage (termasuk karya custom buatan pengguna)
  const merged = [...saved];

  // Tambahkan karya baru dari defaultKaryaData jika belum ada di localStorage
  defaultKaryaData.forEach((defItem) => {
    const hasId = savedById.has(defItem.id);
    const defUrl = defItem.videoUrl || defItem.image || defItem.embedUrl;
    const hasUrl = defUrl && savedByUrl.has(defUrl);

    if (!hasId && !hasUrl) {
      merged.push(defItem);
    }
  });

  // Simpan hasil gabungan ke primary key
  try {
    localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {
    console.warn('Gagal menyimpan hasil merge ke localStorage', e);
  }

  return merged;
};

export default function Karya() {
  const [activeCat, setActiveCat] = useState('Semua Karya');
  const [selectedKarya, setSelectedKarya] = useState(null);

  // State Data Karya dengan proteksi memori browser
  const [items, setItems] = useState(() => loadAndMergeKaryaData());

  // State Modal Tambah Karya
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const initialAddFormState = {
    title: '',
    category: 'Iklan / Merch',
    mediaType: 'drive', // 'drive' | 'video' | 'image'
    mediaUrl: '',
    description: '',
    tags: '',
  };
  const [addFormData, setAddFormData] = useState(initialAddFormState);

  // State untuk Quick Edit Deskripsi
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    mediaType: 'video',
    mediaUrl: '',
  });
  const [toastMessage, setToastMessage] = useState(null);

  const fileInputRef = useRef(null);

  // Daftar Kategori Dinamis (Semua Kategori default + Kategori karya pengguna)
  const categories = useMemo(() => {
    const defaultCats = karyaCategories || [
      'Semua Karya',
      'Design',
      'Edit',
      'Collaboration Project',
      'Movie',
      'Photographic',
      'Iklan / Merch',
    ];
    const itemCats = items.map((i) => i.category).filter(Boolean);
    const set = new Set([...defaultCats.filter((c) => c !== 'Semua Karya'), ...itemCats]);
    return ['Semua Karya', ...Array.from(set)];
  }, [items]);

  // Filtering Logic
  const filteredKarya = useMemo(() => {
    if (activeCat === 'Semua Karya' || activeCat === 'All') return items;
    return items.filter((k) => k.category === activeCat);
  }, [items, activeCat]);

  // Trigger notifikasi toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Submit Handler: Tambah Karya Baru ke State dan LocalStorage
  const handleAddNewKarya = (e) => {
    e.preventDefault();

    if (!addFormData.title.trim()) {
      showToast('⚠️ Judul karya wajib diisi!');
      return;
    }

    if (!addFormData.mediaUrl.trim()) {
      showToast('⚠️ Link media / path wajib diisi!');
      return;
    }

    const formattedUrl = formatMediaUrl(addFormData.mediaType, addFormData.mediaUrl.trim());
    const parsedTags = addFormData.tags
      ? addFormData.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [addFormData.category];

    const newKaryaItem = {
      id: `karya-user-${Date.now()}`,
      title: addFormData.title.trim(),
      category: addFormData.category,
      description: addFormData.description.trim() || 'Karya portofolio baru.',
      mediaType: addFormData.mediaType,
      tags: parsedTags,
      isUserAdded: true,
      createdAt: new Date().toISOString(),
    };

    if (addFormData.mediaType === 'drive') {
      newKaryaItem.embedUrl = formattedUrl;
      newKaryaItem.videoUrl = formattedUrl; // Fallback kompatibilitas
    } else if (addFormData.mediaType === 'video') {
      newKaryaItem.videoUrl = formattedUrl;
    } else {
      newKaryaItem.image = formattedUrl;
    }

    // Masukkan karya baru ke urutan paling awal
    const updatedItems = [newKaryaItem, ...items];
    setItems(updatedItems);

    try {
      localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(updatedItems));
    } catch (err) {
      console.error('Gagal menyimpan karya baru ke localStorage', err);
    }

    // Reset Form & Tutup Modal
    setAddFormData(initialAddFormState);
    setIsAddModalOpen(false);
    showToast(`✨ Karya "${newKaryaItem.title}" berhasil ditambahkan!`);
  };

  // Buka Modal Detail / Preview
  const handleOpenModal = (item, startInEditMode = false) => {
    setSelectedKarya(item);
    setIsEditing(startInEditMode);

    let currentMediaType = 'video';
    let currentMediaUrl = item.videoUrl || '';
    if (isDriveEmbed(item)) {
      currentMediaType = 'drive';
      currentMediaUrl = item.embedUrl || item.videoUrl || '';
    } else if (item.image && !item.videoUrl) {
      currentMediaType = 'image';
      currentMediaUrl = item.image || '';
    }

    setEditFormData({
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'Edit',
      tags: item.tags ? item.tags.join(', ') : '',
      mediaType: currentMediaType,
      mediaUrl: currentMediaUrl,
    });
  };

  // Simpan Perubahan Edit ke state & localStorage
  const handleSaveEdit = (e) => {
    if (e) e.preventDefault();
    if (!selectedKarya) return;

    const updatedTags = editFormData.tags
      ? editFormData.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : selectedKarya.tags;

    const formattedUrl = editFormData.mediaUrl
      ? formatMediaUrl(editFormData.mediaType, editFormData.mediaUrl.trim())
      : null;

    const updatedItems = items.map((item) => {
      if (item.id === selectedKarya.id) {
        const updated = {
          ...item,
          title: editFormData.title.trim() || item.title,
          description: editFormData.description.trim() || item.description,
          category: editFormData.category || item.category,
          tags: updatedTags,
          mediaType: editFormData.mediaType || item.mediaType,
        };

        if (formattedUrl) {
          if (editFormData.mediaType === 'drive') {
            updated.embedUrl = formattedUrl;
            updated.videoUrl = formattedUrl;
          } else if (editFormData.mediaType === 'video') {
            updated.videoUrl = formattedUrl;
            delete updated.embedUrl;
          } else {
            updated.image = formattedUrl;
            delete updated.videoUrl;
            delete updated.embedUrl;
          }
        }

        return updated;
      }
      return item;
    });

    setItems(updatedItems);
    try {
      localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(updatedItems));
    } catch (err) {
      console.error('Gagal menyimpan edit ke localStorage', err);
    }

    // Update item yang sedang aktif di modal
    const currentUpdated = updatedItems.find((i) => i.id === selectedKarya.id);
    setSelectedKarya(currentUpdated || null);
    setIsEditing(false);

    showToast('Perubahan karya berhasil disimpan!');
  };

  // Hapus Karya
  const handleDeleteKarya = (karyaId, e) => {
    if (e) e.stopPropagation();
    const itemToDelete = items.find((i) => i.id === karyaId);
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus karya "${itemToDelete?.title || 'ini'}"?`
    );
    if (!confirmDelete) return;

    const updatedItems = items.filter((i) => i.id !== karyaId);
    setItems(updatedItems);
    try {
      localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(updatedItems));
    } catch (err) {
      console.error('Gagal menyimpan hapus ke localStorage', err);
    }

    if (selectedKarya && selectedKarya.id === karyaId) {
      setSelectedKarya(null);
      setIsEditing(false);
    }

    showToast('Karya berhasil dihapus.');
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
          setItems(parsed);
          localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(parsed));
          setSelectedKarya(null);
          setIsEditing(false);
          showToast(`Berhasil memulihkan ${parsed.length} karya dari file backup!`);
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

          {/* Backup & Data Protection Toolbar */}
          <div className="karya-backup-toolbar">
            <button
              type="button"
              className="btn-backup-export"
              onClick={handleExportJSON}
              title="Unduh file backup karya Anda dalam format JSON"
            >
              <span>Export Data JSON</span>
            </button>

            <button
              type="button"
              className="btn-backup-import"
              onClick={() => fileInputRef.current?.click()}
              title="Unggah file JSON backup untuk memulihkan seluruh karya"
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

        {/* Notifikasi Toast Berhasil */}
        {toastMessage && (
          <div className="karya-save-toast animate-pop-in">
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Category Filter Pills & Tombol Tambah Karya Baru */}
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

          {/* Tombol Aksi Tambah Karya Baru */}
          <button
            type="button"
            className="karya-filter-btn btn-add-karya-highlight"
            onClick={() => setIsAddModalOpen(true)}
            title="Tambah karya atau proyek baru langsung dari web"
          >
            <span className="add-btn-icon">+</span>
            <span>Tambah Karya Baru</span>
          </button>
        </div>

        {/* Karya Grid */}
        {filteredKarya.length > 0 ? (
          <div className="pop-karya-grid">
            {filteredKarya.map((item) => {
              const hasDrive = isDriveEmbed(item);
              const hasVideo = Boolean(item.videoUrl) && !hasDrive;
              const hasImage = Boolean(item.image) && !hasDrive && !hasVideo;

              return (
                <div
                  key={item.id}
                  className="karya-pop-card pop-card"
                  onClick={() => handleOpenModal(item, false)}
                >
                  {/* Thumbnail Container */}
                  <div className="karya-thumb-box">
                    {hasDrive ? (
                      <div className="karya-thumb-drive-wrap">
                        <iframe
                          src={item.embedUrl || item.videoUrl}
                          title={item.title}
                          className="karya-thumb-drive-frame"
                          loading="lazy"
                          tabIndex={-1}
                        />
                        <div className="karya-drive-thumb-badge">
                          <span className="drive-icon">📁</span> Google Drive Embed
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
                    ) : (
                      <img
                        src={cleanPath(item.image)}
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
                        {hasDrive ? 'Buka Player Drive' : hasVideo ? 'Putar Video' : 'Lihat Detail'}
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
                    {item.tags && (
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
                    <div className="karya-footer-left-actions">
                      <button
                        type="button"
                        className="btn-card-edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(item, true);
                        }}
                        title="Edit judul dan deskripsi karya ini"
                      >
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        className="btn-card-delete"
                        onClick={(e) => handleDeleteKarya(item.id, e)}
                        title="Hapus karya ini"
                      >
                        <span>Hapus</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn-karya-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(item, false);
                      }}
                    >
                      <span>{hasDrive ? 'Buka Embed' : hasVideo ? 'Buka Video' : 'Buka Preview'}</span>
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
              Belum ada karya yang diunggah untuk kategori ini. Tambahkan karya baru sekarang atau lihat semua karya!
            </p>
            <div className="empty-state-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsAddModalOpen(true)}
              >
                + Tambah Karya di Kategori Ini
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setActiveCat('Semua Karya')}
              >
                Lihat Semua Karya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL FORM TAMBAH KARYA BARU                                              */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div
          className="karya-lightbox-backdrop"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="karya-lightbox-content karya-form-modal pop-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="lightbox-header">
              <div className="lightbox-header-left">
                <span className="lightbox-cat">Fitur Manajemen Galeri</span>
                <h3 className="lightbox-title">+ Tambah Karya Baru</h3>
              </div>
              <button
                type="button"
                className="lightbox-close-btn"
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Tutup Modal"
              >
                ✕
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleAddNewKarya} className="add-karya-form-container">
              <div className="form-modal-body">
                {/* 1. Judul Karya */}
                <div className="form-group-pop">
                  <label htmlFor="add-karya-title" className="form-label-pop">
                    Judul Karya <span className="req-accent">*</span>
                  </label>
                  <input
                    type="text"
                    id="add-karya-title"
                    className="pop-input"
                    value={addFormData.title}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, title: e.target.value })
                    }
                    placeholder="Contoh: Iklan Komersial Bazzar 2025"
                    required
                  />
                </div>

                {/* 2. Kategori Karya */}
                <div className="form-group-pop">
                  <label htmlFor="add-karya-cat" className="form-label-pop">
                    Kategori <span className="req-accent">*</span>
                  </label>
                  <select
                    id="add-karya-cat"
                    className="pop-input pop-select"
                    value={addFormData.category}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, category: e.target.value })
                    }
                  >
                    {DEFAULT_FORM_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Tipe Media (Selector Pills) */}
                <div className="form-group-pop">
                  <label className="form-label-pop">
                    Tipe Media <span className="req-accent">*</span>
                  </label>
                  <div className="media-type-selector">
                    <button
                      type="button"
                      className={`media-type-pill ${addFormData.mediaType === 'drive' ? 'active' : ''}`}
                      onClick={() => setAddFormData({ ...addFormData, mediaType: 'drive' })}
                    >
                      <span className="type-icon">📁</span>
                      <span>Google Drive Embed</span>
                    </button>
                    <button
                      type="button"
                      className={`media-type-pill ${addFormData.mediaType === 'video' ? 'active' : ''}`}
                      onClick={() => setAddFormData({ ...addFormData, mediaType: 'video' })}
                    >
                      <span className="type-icon">🎬</span>
                      <span>Video Lokal</span>
                    </button>
                    <button
                      type="button"
                      className={`media-type-pill ${addFormData.mediaType === 'image' ? 'active' : ''}`}
                      onClick={() => setAddFormData({ ...addFormData, mediaType: 'image' })}
                    >
                      <span className="type-icon">🖼️</span>
                      <span>Gambar</span>
                    </button>
                  </div>
                </div>

                {/* 4. Link Embed / Path Media */}
                <div className="form-group-pop">
                  <label htmlFor="add-karya-url" className="form-label-pop">
                    {addFormData.mediaType === 'drive'
                      ? 'Link Google Drive / URL Embed'
                      : addFormData.mediaType === 'video'
                      ? 'Path File Video Lokal (.mp4)'
                      : 'Path File atau URL Gambar'}
                    <span className="req-accent">*</span>
                  </label>
                  <input
                    type="text"
                    id="add-karya-url"
                    className="pop-input"
                    value={addFormData.mediaUrl}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, mediaUrl: e.target.value })
                    }
                    placeholder={
                      addFormData.mediaType === 'drive'
                        ? 'https://drive.google.com/file/d/.../preview atau link share'
                        : addFormData.mediaType === 'video'
                        ? '/videos/nama_video.mp4'
                        : '/images/nama_foto.png atau https://...'
                    }
                    required
                  />
                  <span className="form-note-hint">
                    {addFormData.mediaType === 'drive'
                      ? '💡 Tips: Link Google Drive akan otomatis diformat menjadi link preview embed yang siap diputar di web.'
                      : addFormData.mediaType === 'video'
                      ? '💡 Tips: Tempatkan file video di folder public/videos/ lalu ketik path seperti /videos/file.mp4'
                      : '💡 Tips: Tempatkan gambar di folder public/images/ atau masukkan URL gambar web.'}
                  </span>
                </div>

                {/* 5. Deskripsi */}
                <div className="form-group-pop">
                  <label htmlFor="add-karya-desc" className="form-label-pop">
                    Deskripsi Karya
                  </label>
                  <textarea
                    id="add-karya-desc"
                    rows="3"
                    className="pop-textarea"
                    value={addFormData.description}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, description: e.target.value })
                    }
                    placeholder="Tuliskan deskripsi, konsep visual, peran, atau tujuan dari karya ini..."
                  />
                </div>

                {/* 6. Tags */}
                <div className="form-group-pop">
                  <label htmlFor="add-karya-tags" className="form-label-pop">
                    Tags (pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    id="add-karya-tags"
                    className="pop-input"
                    value={addFormData.tags}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, tags: e.target.value })
                    }
                    placeholder="Contoh: Iklan, Commercial, Motion Graphic, Premiere Pro"
                  />
                </div>
              </div>

              {/* Form Footer Buttons */}
              <div className="form-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary btn-submit-pop">
                  <span>+ Simpan Karya ke Galeri</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DETAIL & PREVIEW KARYA (DENGAN PLAYER EMBED / VIDEO / EDIT)         */}
      {/* ========================================================================= */}
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
                <span className="lightbox-cat">{selectedKarya.category}</span>
                <h3 className="lightbox-title">{selectedKarya.title}</h3>
              </div>
              <div className="lightbox-header-actions">
                {!isEditing && (
                  <>
                    <button
                      type="button"
                      className="btn-lightbox-edit"
                      onClick={() => {
                        let currentMediaType = 'video';
                        let currentMediaUrl = selectedKarya.videoUrl || '';
                        if (isDriveEmbed(selectedKarya)) {
                          currentMediaType = 'drive';
                          currentMediaUrl = selectedKarya.embedUrl || selectedKarya.videoUrl || '';
                        } else if (selectedKarya.image && !selectedKarya.videoUrl) {
                          currentMediaType = 'image';
                          currentMediaUrl = selectedKarya.image || '';
                        }

                        setEditFormData({
                          title: selectedKarya.title || '',
                          description: selectedKarya.description || '',
                          category: selectedKarya.category || 'Edit',
                          tags: selectedKarya.tags ? selectedKarya.tags.join(', ') : '',
                          mediaType: currentMediaType,
                          mediaUrl: currentMediaUrl,
                        });
                        setIsEditing(true);
                      }}
                      title="Edit judul, deskripsi, dan link karya ini"
                    >
                      <span>Edit Karya</span>
                    </button>
                    <button
                      type="button"
                      className="btn-lightbox-delete"
                      onClick={(e) => handleDeleteKarya(selectedKarya.id, e)}
                      title="Hapus karya ini"
                    >
                      <span>Hapus</span>
                    </button>
                  </>
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
              {/* Media Player Container */}
              <div className="lightbox-img-wrap">
                {isDriveEmbed(selectedKarya) ? (
                  <div className="lightbox-drive-embed-container">
                    <iframe
                      src={selectedKarya.embedUrl || selectedKarya.videoUrl}
                      title={selectedKarya.title}
                      className="lightbox-drive-iframe"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
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
                ) : (
                  <img
                    src={cleanPath(selectedKarya.image)}
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

              {/* Action Bar Khusus Drive Embed */}
              {isDriveEmbed(selectedKarya) && (
                <div className="lightbox-media-action-row">
                  <span className="drive-info-tag">📁 Google Drive Stream</span>
                  <a
                    href={(selectedKarya.embedUrl || selectedKarya.videoUrl || '').replace('/preview', '/view')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-open-external"
                    title="Buka link asli di tab baru"
                  >
                    <span>Buka di Google Drive ↗</span>
                  </a>
                </div>
              )}

              {/* Tombol Buka Gambar Resolusi Penuh (Khusus Media Gambar) */}
              {!isDriveEmbed(selectedKarya) && !selectedKarya.videoUrl && (selectedKarya.image || selectedKarya.images) && (
                <div className="lightbox-full-img-action">
                  <a
                    href={cleanPath(selectedKarya.image || (Array.isArray(selectedKarya.images) ? selectedKarya.images[0] : ''))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-full-res-img"
                    title="Buka gambar resolusi asli di tab baru"
                  >
                    <span>🔍 Buka Gambar Resolusi Penuh</span>
                  </a>
                </div>
              )}

              {!isDriveEmbed(selectedKarya) && selectedKarya.videoUrl && (
                <div className="lightbox-video-path-note">
                  <span>
                    File Video: <code>{cleanPath(selectedKarya.videoUrl)}</code>
                  </span>
                </div>
              )}

              {/* Form Inline Edit ATAU Tampilan Normal */}
              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="karya-edit-form pop-card">
                  <h4 className="edit-form-heading">Edit Informasi Karya</h4>

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

                  <div className="edit-form-field">
                    <label htmlFor="edit-media-url">Link Media / Path:</label>
                    <input
                      type="text"
                      id="edit-media-url"
                      className="pop-input"
                      value={editFormData.mediaUrl}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, mediaUrl: e.target.value })
                      }
                      placeholder="https://drive.google.com/... atau /videos/..."
                    />
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
    </section>
  );
}
