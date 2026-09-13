import React, { useState, useRef, useMemo, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { karyaCategories } from '../data/karyaData';
import './AdminModal.css';

// Helper: Bersihkan path media
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

export default function AdminModal() {
  const {
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
    showToast,
    isCloudConnected,
    isSavingToCloud,
  } = usePortfolio();

  // State Form Edit Profil & About Me
  const [aboutInput, setAboutInput] = useState(aboutMe);
  const [photoInput, setPhotoInput] = useState(profilePhoto || '');

  // State Form Edit Kontak & Sosmed
  const [contactInputs, setContactInputs] = useState({
    whatsapp: '',
    location: '',
    instagram: '',
    tiktok: '',
    youtube: '',
  });

  // Sync state saat modal dibuka atau saat context berubah
  useEffect(() => {
    setAboutInput(aboutMe);
    setPhotoInput(profilePhoto || '');
    setContactInputs({
      whatsapp: contacts?.whatsapp || '',
      location: contacts?.location || '',
      instagram: contacts?.instagram || '',
      tiktok: contacts?.tiktok || '',
      youtube: contacts?.youtube || '',
    });
  }, [aboutMe, profilePhoto, contacts, isAdminOpen]);

  // State Tab Kelola Karya: Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Semua');

  // State Sub-Modal CRUD Karya (Create / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(true);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    category: 'Edit',
    mediaType: 'video', // 'video' | 'image' | 'embed'
    videoUrl: '',
    image: '',
    embedUrl: '',
    description: '',
    tags: '',
  });

  const fileInputRef = useRef(null);

  const categories = karyaCategories || [
    'Semua Karya',
    'Design',
    'Edit',
    'Collaboration Project',
    'Movie',
    'Photographic',
    'Iklan / Merch',
  ];

  // Filter list karya di admin table
  const filteredList = useMemo(() => {
    return karyaList.filter((item) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.videoUrl && item.videoUrl.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.image && item.image.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.embedUrl && item.embedUrl.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchCat =
        selectedCategoryFilter === 'Semua' || item.category === selectedCategoryFilter;

      return matchSearch && matchCat;
    });
  }, [karyaList, searchQuery, selectedCategoryFilter]);

  // Handle Simpan Profil & About Me
  const handleSaveProfileAbout = async (e) => {
    e.preventDefault();
    await updateAboutMe(aboutInput);
    await updateProfilePhoto(photoInput);
  };

  // Handle Reset About Me
  const handleResetAbout = async () => {
    const confirmReset = window.confirm(
      'Apakah Anda yakin ingin mereset teks "About Me" ke bawaan default?'
    );
    if (confirmReset) {
      await resetAboutMe();
    }
  };

  // Handle Simpan Kontak & Sosmed
  const handleSaveContacts = async (e) => {
    e.preventDefault();
    await updateContacts(contactInputs);
  };

  // Handle Kosongkan Kontak
  const handleResetContacts = async () => {
    const confirmReset = window.confirm(
      'Apakah Anda yakin ingin mengosongkan seluruh data kontak & sosial media?'
    );
    if (confirmReset) {
      await resetContacts();
      setContactInputs({
        whatsapp: '',
        location: '',
        instagram: '',
        tiktok: '',
        youtube: '',
      });
    }
  };

  // Buka Form Tambah Karya Baru
  const handleOpenAddForm = () => {
    setIsCreateMode(true);
    setFormData({
      id: `karya-${Date.now()}`,
      title: '',
      category: 'Edit',
      mediaType: 'video',
      videoUrl: '',
      image: '',
      embedUrl: '',
      description: '',
      tags: '',
    });
    setIsFormOpen(true);
  };

  // Buka Form Edit Karya
  const handleOpenEditForm = (item) => {
    setIsCreateMode(false);
    let detectedType = 'image';
    if (item.videoUrl) detectedType = 'video';
    else if (item.embedUrl) detectedType = 'embed';

    setFormData({
      id: item.id || `karya-${Date.now()}`,
      title: item.title || '',
      category: item.category || 'Edit',
      mediaType: detectedType,
      videoUrl: item.videoUrl || '',
      image: item.image || (Array.isArray(item.images) ? item.images[0] : '') || '',
      embedUrl: item.embedUrl || '',
      description: item.description || '',
      tags: item.tags ? item.tags.join(', ') : '',
    });
    setIsFormOpen(true);
  };

  // Simpan Form CRUD Karya
  const handleSaveKaryaForm = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Mohon masukkan judul karya.');
      return;
    }

    const tagsArr = formData.tags
      ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const itemPayload = {
      id: formData.id || `karya-${Date.now()}`,
      title: formData.title.trim(),
      category: formData.category || 'Edit',
      description: formData.description.trim(),
      tags: tagsArr,
    };

    if (formData.mediaType === 'video') {
      itemPayload.videoUrl = formData.videoUrl.trim();
    } else if (formData.mediaType === 'embed') {
      itemPayload.embedUrl = formData.embedUrl.trim();
    } else {
      itemPayload.image = formData.image.trim();
    }

    if (isCreateMode) {
      await addKarya(itemPayload);
    } else {
      await editKarya(itemPayload);
    }

    setIsFormOpen(false);
  };

  // Handle Hapus Karya
  const handleDeleteItem = async (id, title) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus karya:\n"${title}"?\n\nTindakan ini akan menghapus karya dari daftar dan Cloud Database secara permanen.`
    );
    if (!confirmDelete) return;
    await deleteKarya(id, title);
  };

  // Handle Reset Data Karya
  const handleResetKarya = async () => {
    const confirmReset = window.confirm(
      '⚠️ PERINGATAN: Apakah Anda yakin ingin mereset seluruh data karya ke bawaan template default?\n\nSemua karya akan dikembalikan ke template awal.'
    );
    if (!confirmReset) return;
    await resetKarya();
  };

  // Export Data Karya JSON
  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify(karyaList, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `backup_karya_portfolio_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('File backup JSON data karya berhasil diunduh!');
    } catch (e) {
      console.error('Gagal export JSON:', e);
      showToast('Gagal mengekspor data JSON.');
    }
  };

  // Import Data Karya JSON
  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed)) {
          updateKaryaList(parsed, `Berhasil memulihkan ${parsed.length} karya dari file backup!`);
        } else {
          alert('Format file JSON tidak valid (harus berupa array data karya).');
        }
      } catch (err) {
        alert('Gagal membaca file JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isAdminOpen) return null;

  return (
    <div
      className="admin-modal-backdrop"
      onClick={() => setIsAdminOpen(false)}
    >
      <div
        className="admin-modal-window pop-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===================================================================
            HEADER ADMIN PANEL
            =================================================================== */}
        <div className="admin-modal-header">
          <div className="admin-header-title-box">
            <div className="admin-badge-row">
              <span className="admin-badge-pulse">● LIVE ADMIN</span>
              <span className={`admin-cloud-badge ${isCloudConnected ? 'cloud-online' : 'cloud-offline'}`}>
                {isCloudConnected ? '☁️ Cloud Firestore: Terhubung' : '💾 Mode Offline (LocalStorage)'}
              </span>
              <span className="admin-shortcut-pill">Shortcut: Ctrl + Shift + B</span>
            </div>
            <h3 className="admin-modal-title">🔐 Secret Admin Panel</h3>
            <p className="admin-modal-subtitle">
              Kelola Foto Profil (1:1), Teks About Me, Kontak WhatsApp & Sosmed, serta Manajemen Karya secara real-time.
            </p>
          </div>

          <div className="admin-header-actions">
            {adminTab === 'karya' && (
              <button
                type="button"
                className="btn-admin-add"
                onClick={handleOpenAddForm}
                title="Tambah item karya baru"
              >
                <span>+ Tambah Karya Baru</span>
              </button>
            )}
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

        {/* ===================================================================
            TAB SELECTOR: TAB 1 (PROFIL & ABOUT), TAB 2 (KONTAK & SOSMED), TAB 3 (KARYA)
            =================================================================== */}
        <div className="admin-main-tabs">
          <button
            type="button"
            className={`admin-main-tab-btn ${adminTab === 'about' ? 'active' : ''}`}
            onClick={() => setAdminTab('about')}
          >
            <span className="tab-icon">👤</span>
            <span>Profil & About Me</span>
          </button>
          <button
            type="button"
            className={`admin-main-tab-btn ${adminTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setAdminTab('contacts')}
          >
            <span className="tab-icon">📱</span>
            <span>Kontak & Sosial Media</span>
          </button>
          <button
            type="button"
            className={`admin-main-tab-btn ${adminTab === 'karya' ? 'active' : ''}`}
            onClick={() => setAdminTab('karya')}
          >
            <span className="tab-icon">🎨</span>
            <span>Kelola Karya ({karyaList.length})</span>
          </button>
        </div>

        {/* ===================================================================
            TAB CONTENT 1: EDIT PROFIL & ABOUT ME
            =================================================================== */}
        {adminTab === 'about' && (
          <div className="admin-tab-content-about">
            <div className="admin-about-layout">
              {/* Kolom Form Input */}
              <div className="admin-about-form-col">
                <form onSubmit={handleSaveProfileAbout} className="admin-about-form">
                  {/* Foto Profil Input */}
                  <div className="admin-form-group">
                    <label htmlFor="admin-photo-input" className="admin-field-label">
                      Path / URL Foto Profil (Rasio 1:1):
                    </label>
                    <div className="admin-photo-input-row">
                      <input
                        type="text"
                        id="admin-photo-input"
                        className="pop-input font-mono-input"
                        value={photoInput}
                        onChange={(e) => setPhotoInput(e.target.value)}
                        placeholder="/images/foto.png atau https://..."
                      />
                      {photoInput && (
                        <button
                          type="button"
                          className="btn-clear-photo"
                          onClick={() => setPhotoInput('')}
                          title="Hapus / Kosongkan foto"
                        >
                          ✕ Kosongkan
                        </button>
                      )}
                    </div>
                    <span className="admin-field-hint">
                      💡 Masukkan path file dari folder <code>public/images/</code> (misal: <code>/images/profile.png</code>) atau link gambar online.
                    </span>
                  </div>

                  {/* Deskripsi About Me Input */}
                  <div className="admin-form-group">
                    <label htmlFor="admin-about-text" className="admin-field-label">
                      Teks Deskripsi "About Me":
                    </label>
                    <textarea
                      id="admin-about-text"
                      className="pop-textarea admin-about-textarea"
                      rows="7"
                      value={aboutInput}
                      onChange={(e) => setAboutInput(e.target.value)}
                      placeholder="Tuliskan perkenalan diri, keahlian, dan minat Anda..."
                      required
                    />
                    <div className="admin-textarea-meta">
                      <span>{aboutInput.length} karakter</span>
                      <span>💾 Tersimpan otomatis ke <code>localStorage</code></span>
                    </div>
                  </div>

                  <div className="admin-about-actions">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handleResetAbout}
                      disabled={isSavingToCloud}
                      title="Kembalikan teks About Me ke teks bawaan"
                    >
                      🔄 Reset About Me
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isSavingToCloud}>
                      {isSavingToCloud ? '☁️ Menyimpan...' : '💾 Simpan Profil & About Me'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Kolom Live Preview */}
              <div className="admin-about-preview-col">
                <div className="admin-preview-header-label">
                  <span>👁️ Live Preview Hero Section:</span>
                </div>

                <div className="admin-hero-live-preview-wrap">
                  {/* Preview Foto 1:1 */}
                  <div className="admin-preview-photo-box">
                    <label className="admin-sub-preview-label">Foto Profil (1:1):</label>
                    <div className="admin-preview-avatar-frame pop-card">
                      {photoInput ? (
                        <img
                          src={cleanPath(photoInput)}
                          alt="Preview Foto Profil"
                          className="admin-preview-avatar-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                      ) : (
                        <div className="admin-preview-avatar-empty">
                          <span className="empty-icon-sm">👤</span>
                          <span className="empty-label-sm">Placeholder Avatar</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preview About Me Card */}
                  <div className="admin-hero-preview-card pop-card">
                    <h4 className="preview-hero-title">ABOUT ME</h4>
                    <p className="preview-hero-desc">
                      {aboutInput.trim() ? aboutInput : '(Deskripsi About Me masih kosong)'}
                    </p>
                  </div>
                </div>

                <div className="admin-preview-note">
                  ✨ Perubahan foto profil dan deskripsi About Me akan langsung tampil di Hero Section secara instan.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB CONTENT 2: EDIT KONTAK & SOSIAL MEDIA
            =================================================================== */}
        {adminTab === 'contacts' && (
          <div className="admin-tab-content-about">
            <div className="admin-about-layout">
              {/* Kolom Form Kontak & Sosmed */}
              <div className="admin-about-form-col">
                <form onSubmit={handleSaveContacts} className="admin-about-form">
                  {/* WhatsApp */}
                  <div className="admin-form-group">
                    <label htmlFor="admin-input-wa" className="admin-field-label">
                      📱 Nomor WhatsApp:
                    </label>
                    <input
                      type="text"
                      id="admin-input-wa"
                      className="pop-input"
                      value={contactInputs.whatsapp}
                      onChange={(e) =>
                        setContactInputs({ ...contactInputs, whatsapp: e.target.value })
                      }
                      placeholder="Contoh: +628123456789 atau 08123456789"
                    />
                    <span className="admin-field-hint">
                      💡 Digunakan untuk tombol WhatsApp di Kontak, Navbar, dan tombol kirim pesan instan.
                    </span>
                  </div>

                  {/* Domisili / Lokasi */}
                  <div className="admin-form-group">
                    <label htmlFor="admin-input-loc" className="admin-field-label">
                      📍 Domisili / Lokasi:
                    </label>
                    <input
                      type="text"
                      id="admin-input-loc"
                      className="pop-input"
                      value={contactInputs.location}
                      onChange={(e) =>
                        setContactInputs({ ...contactInputs, location: e.target.value })
                      }
                      placeholder="Contoh: Indonesia / Jakarta / Surabaya"
                    />
                  </div>

                  {/* Instagram */}
                  <div className="admin-form-group">
                    <label htmlFor="admin-input-ig" className="admin-field-label">
                      📸 Instagram (Link / Username):
                    </label>
                    <input
                      type="text"
                      id="admin-input-ig"
                      className="pop-input"
                      value={contactInputs.instagram}
                      onChange={(e) =>
                        setContactInputs({ ...contactInputs, instagram: e.target.value })
                      }
                      placeholder="Contoh: https://instagram.com/username atau @username"
                    />
                  </div>

                  {/* TikTok */}
                  <div className="admin-form-group">
                    <label htmlFor="admin-input-tiktok" className="admin-field-label">
                      🎵 TikTok (Link / Username):
                    </label>
                    <input
                      type="text"
                      id="admin-input-tiktok"
                      className="pop-input"
                      value={contactInputs.tiktok}
                      onChange={(e) =>
                        setContactInputs({ ...contactInputs, tiktok: e.target.value })
                      }
                      placeholder="Contoh: https://tiktok.com/@username atau @username"
                    />
                  </div>

                  {/* YouTube */}
                  <div className="admin-form-group">
                    <label htmlFor="admin-input-yt" className="admin-field-label">
                      ▶️ YouTube (Link Channel / Handle):
                    </label>
                    <input
                      type="text"
                      id="admin-input-yt"
                      className="pop-input"
                      value={contactInputs.youtube}
                      onChange={(e) =>
                        setContactInputs({ ...contactInputs, youtube: e.target.value })
                      }
                      placeholder="Contoh: https://youtube.com/@channel atau @channel"
                    />
                  </div>

                  <div className="admin-about-actions">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handleResetContacts}
                      disabled={isSavingToCloud}
                      title="Kosongkan seluruh kontak dan media sosial"
                    >
                      🗑️ Kosongkan Kontak
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isSavingToCloud}>
                      {isSavingToCloud ? '☁️ Menyimpan...' : '💾 Simpan Kontak & Sosial Media'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Kolom Preview Kontak */}
              <div className="admin-about-preview-col">
                <div className="admin-preview-header-label">
                  <span>👁️ Live Preview Data Kontak:</span>
                </div>

                <div className="admin-contacts-preview-box pop-card">
                  <h4 className="preview-hero-title">STATUS KONTAK</h4>

                  <div className="admin-preview-contact-item">
                    <strong>WhatsApp:</strong>
                    <span>{contactInputs.whatsapp || '(Belum diatur / Kosong)'}</span>
                  </div>

                  <div className="admin-preview-contact-item">
                    <strong>Domisili:</strong>
                    <span>{contactInputs.location || '(Belum diatur / Kosong)'}</span>
                  </div>

                  <div className="admin-preview-contact-item">
                    <strong>Instagram:</strong>
                    <span>{contactInputs.instagram || '(Kosong)'}</span>
                  </div>

                  <div className="admin-preview-contact-item">
                    <strong>TikTok:</strong>
                    <span>{contactInputs.tiktok || '(Kosong)'}</span>
                  </div>

                  <div className="admin-preview-contact-item">
                    <strong>YouTube:</strong>
                    <span>{contactInputs.youtube || '(Kosong)'}</span>
                  </div>
                </div>

                <div className="admin-preview-note">
                  💡 Jika link dikosongkan, tombol media sosial yang bersangkutan akan otomatis disembunyikan dari halaman web.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB CONTENT 3: KELOLA KARYA (CRUD)
            =================================================================== */}
        {adminTab === 'karya' && (
          <div className="admin-tab-content-karya">
            {/* Toolbar Search, Filter, Export/Import */}
            <div className="admin-modal-toolbar">
              <div className="admin-search-box">
                <span className="admin-search-icon">🔍</span>
                <input
                  type="text"
                  className="admin-search-input pop-input"
                  placeholder="Cari judul, tags, path media..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="admin-search-clear"
                    onClick={() => setSearchQuery('')}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="admin-filter-group">
                <select
                  className="admin-cat-select pop-input"
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                >
                  <option value="Semua">Semua Kategori ({karyaList.length})</option>
                  {categories
                    .filter((c) => c !== 'Semua Karya')
                    .map((c) => (
                      <option key={c} value={c}>
                        {c} ({karyaList.filter((i) => i.category === c).length})
                      </option>
                    ))}
                </select>

                <button
                  type="button"
                  className="btn-admin-export"
                  onClick={handleExportJSON}
                  title="Unduh backup data karya dalam format JSON"
                >
                  <span>Export JSON</span>
                </button>

                <button
                  type="button"
                  className="btn-admin-import"
                  onClick={() => fileInputRef.current?.click()}
                  title="Import data karya dari file JSON backup"
                >
                  <span>Import JSON</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={handleImportJSON}
                />

                <button
                  type="button"
                  className="btn-admin-reset"
                  onClick={handleResetKarya}
                  title="Kosongkan/kembalikan data karya ke template awal"
                >
                  <span>🔄 Reset Default</span>
                </button>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="admin-stats-bar">
              <span className="admin-stat-tag">
                Menampilkan <strong>{filteredList.length}</strong> dari <strong>{karyaList.length}</strong> karya
              </span>
              <span className="admin-stat-tag">
                🎥 <strong>{karyaList.filter((i) => i.videoUrl).length}</strong> Video
              </span>
              <span className="admin-stat-tag">
                🖼️ <strong>{karyaList.filter((i) => i.image || i.images).length}</strong> Gambar
              </span>
              <span className="admin-stat-tag">
                🌐 <strong>{karyaList.filter((i) => i.embedUrl).length}</strong> Embed
              </span>
            </div>

            {/* Table Daftar Karya */}
            <div className="admin-table-container">
              {filteredList.length > 0 ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>No</th>
                      <th style={{ width: '80px' }}>Media</th>
                      <th>Judul & Kategori</th>
                      <th>Path / URL Media</th>
                      <th>Tags</th>
                      <th style={{ width: '160px', textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map((item, idx) => {
                      const hasVideo = Boolean(item.videoUrl);
                      const hasEmbed = Boolean(item.embedUrl);
                      const mediaPath = item.videoUrl || item.image || item.embedUrl || '-';

                      return (
                        <tr key={item.id || idx} className="admin-table-row">
                          <td className="admin-cell-num">{idx + 1}</td>
                          <td className="admin-cell-thumb">
                            <div className="admin-row-thumb">
                              {hasVideo ? (
                                <div className="admin-thumb-video-badge">🎥 Video</div>
                              ) : hasEmbed ? (
                                <div className="admin-thumb-embed-badge">🌐 Embed</div>
                              ) : (
                                <img
                                  src={cleanPath(
                                    item.image || (Array.isArray(item.images) ? item.images[0] : '')
                                  )}
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
                          <td className="admin-cell-path">
                            <div className="admin-path-box" title={mediaPath}>
                              <span className="admin-path-type">
                                {hasVideo ? 'MP4:' : hasEmbed ? 'EMBED:' : 'IMG:'}
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
                                className="btn-admin-row-delete"
                                onClick={() => handleDeleteItem(item.id, item.title)}
                                title="Hapus karya ini"
                              >
                                🗑️ Hapus
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
                  {karyaList.length === 0 ? (
                    <>
                      <div className="admin-empty-icon">🎨</div>
                      <h4>Data Karya Masih Kosong (Template Baru)</h4>
                      <p>Silakan klik tombol <strong>"+ Tambah Karya Baru"</strong> untuk mulai menambahkan karya pertama Anda!</p>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleOpenAddForm}
                      >
                        + Tambah Karya Baru Sekarang
                      </button>
                    </>
                  ) : (
                    <>
                      <p>Tidak ada karya yang sesuai dengan pencarian "{searchQuery}".</p>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategoryFilter('Semua');
                        }}
                      >
                        Bersihkan Filter
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================
            FOOTER ADMIN MODAL
            =================================================================== */}
        <div className="admin-modal-footer">
          <div className="admin-footer-tip">
            💡 <strong>Shortcut:</strong> Tekan <code>Ctrl + Shift + B</code> (atau <code>Cmd + Shift + B</code> di Mac) untuk membuka/menutup panel admin ini kapan saja.
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

      {/* ===================================================================
          SUB-MODAL: FORM TAMBAH / EDIT KARYA
          =================================================================== */}
      {isFormOpen && (
        <div
          className="admin-form-backdrop"
          onClick={() => setIsFormOpen(false)}
        >
          <div
            className="admin-form-window pop-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-form-header">
              <h3 className="admin-form-title">
                {isCreateMode
                  ? '✨ Tambah Karya Baru'
                  : `✏️ Edit Karya: ${formData.title || 'Portofolio'}`}
              </h3>
              <button
                type="button"
                className="lightbox-close-btn"
                onClick={() => setIsFormOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveKaryaForm} className="admin-crud-form">
              <div className="admin-form-grid">
                {/* Kolom Kiri: Form Inputs */}
                <div className="admin-form-col-inputs">
                  {/* Judul */}
                  <div className="edit-form-field">
                    <label htmlFor="admin-form-title">
                      Judul Karya <span className="req-star">*</span>:
                    </label>
                    <input
                      type="text"
                      id="admin-form-title"
                      className="pop-input"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Contoh: Video Cinematic Bazzar 2024"
                      required
                    />
                  </div>

                  {/* Kategori */}
                  <div className="edit-form-field">
                    <label htmlFor="admin-form-cat">Kategori:</label>
                    <select
                      id="admin-form-cat"
                      className="pop-input"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                        className={`admin-type-tab ${formData.mediaType === 'video' ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, mediaType: 'video' })}
                      >
                        🎥 Video MP4
                      </button>
                      <button
                        type="button"
                        className={`admin-type-tab ${formData.mediaType === 'image' ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, mediaType: 'image' })}
                      >
                        🖼️ Gambar / Foto
                      </button>
                      <button
                        type="button"
                        className={`admin-type-tab ${formData.mediaType === 'embed' ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, mediaType: 'embed' })}
                      >
                        🌐 Embed / YouTube
                      </button>
                    </div>
                  </div>

                  {/* Input Path Sesuai Tipe Media */}
                  {formData.mediaType === 'video' && (
                    <div className="edit-form-field">
                      <label htmlFor="admin-form-video">
                        Path File Video / URL Video MP4:
                      </label>
                      <input
                        type="text"
                        id="admin-form-video"
                        className="pop-input font-mono-input"
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                        placeholder="/videos/nama_video.mp4 atau https://..."
                      />
                      <span className="admin-field-hint">
                        💡 Letakkan file di folder <code>public/videos/</code> lalu masukkan <code>/videos/nama_file.mp4</code> atau link video online.
                      </span>
                    </div>
                  )}

                  {formData.mediaType === 'image' && (
                    <div className="edit-form-field">
                      <label htmlFor="admin-form-image">
                        Path File Gambar / URL Foto:
                      </label>
                      <input
                        type="text"
                        id="admin-form-image"
                        className="pop-input font-mono-input"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="/images/nama_gambar.png atau https://..."
                      />
                      <span className="admin-field-hint">
                        💡 Letakkan file di folder <code>public/images/</code> lalu masukkan <code>/images/nama_file.png</code> atau link URL gambar.
                      </span>
                    </div>
                  )}

                  {formData.mediaType === 'embed' && (
                    <div className="edit-form-field">
                      <label htmlFor="admin-form-embed">
                        URL Embed Video / Iframe:
                      </label>
                      <input
                        type="text"
                        id="admin-form-embed"
                        className="pop-input font-mono-input"
                        value={formData.embedUrl}
                        onChange={(e) => setFormData({ ...formData, embedUrl: e.target.value })}
                        placeholder="https://www.youtube.com/embed/XXXXX"
                      />
                      <span className="admin-field-hint">
                        💡 Masukkan URL embed (misal YouTube Embed <code>https://www.youtube.com/embed/...</code>).
                      </span>
                    </div>
                  )}

                  {/* Deskripsi */}
                  <div className="edit-form-field">
                    <label htmlFor="admin-form-desc">Deskripsi Karya:</label>
                    <textarea
                      id="admin-form-desc"
                      rows="4"
                      className="pop-textarea"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Ceritakan proses pembuatan, konsep, atau software yang digunakan..."
                    />
                  </div>

                  {/* Tags */}
                  <div className="edit-form-field">
                    <label htmlFor="admin-form-tags">
                      Tags (pisahkan dengan koma):
                    </label>
                    <input
                      type="text"
                      id="admin-form-tags"
                      className="pop-input"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="Video Edit, Premiere Pro, Motion, Cinematic"
                    />
                  </div>
                </div>

                {/* Kolom Kanan: Live Preview Media */}
                <div className="admin-form-col-preview">
                  <label className="admin-preview-title">Live Preview Media:</label>
                  <div className="admin-live-preview-box">
                    {formData.mediaType === 'video' && formData.videoUrl ? (
                      <video
                        key={formData.videoUrl}
                        src={cleanPath(formData.videoUrl)}
                        controls
                        playsInline
                        className="admin-preview-media"
                      >
                        Format video tidak didukung atau path salah.
                      </video>
                    ) : formData.mediaType === 'embed' && formData.embedUrl ? (
                      <iframe
                        src={formData.embedUrl}
                        title="Live Embed Preview"
                        className="admin-preview-iframe"
                        allowFullScreen
                      />
                    ) : formData.mediaType === 'image' && formData.image ? (
                      <img
                        src={cleanPath(formData.image)}
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
                    <h4>{formData.title || '(Judul Karya)'}</h4>
                    <span className="admin-cat-chip">{formData.category}</span>
                    <p>{formData.description || 'Deskripsi karya akan tampil di sini.'}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="admin-crud-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSavingToCloud}
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSavingToCloud}>
                  {isSavingToCloud
                    ? '☁️ Menyimpan...'
                    : isCreateMode
                    ? '✨ Tambahkan Karya'
                    : '💾 Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
