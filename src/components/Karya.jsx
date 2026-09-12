import React, { useState, useMemo, useRef } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { karyaCategories } from '../data/karyaData';
import './Karya.css';

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

export default function Karya() {
  const {
    karyaList,
    updateKaryaList,
    editKarya,
    setIsAdminOpen,
    setAdminTab,
    toastMessage,
    showToast,
  } = usePortfolio();

  const [activeCat, setActiveCat] = useState('Semua Karya');
  const [selectedKarya, setSelectedKarya] = useState(null);

  // State untuk Quick Edit Deskripsi pada Modal Detail Publik
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
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

  // Filtering Logic Galeri Utama
  const filteredKarya = useMemo(() => {
    if (activeCat === 'Semua Karya' || activeCat === 'All') return karyaList;
    return karyaList.filter((k) => k.category === activeCat);
  }, [karyaList, activeCat]);

  // Buka Modal Detail / Preview Publik
  const handleOpenModal = (item, startInEditMode = false) => {
    setSelectedKarya(item);
    setIsEditing(startInEditMode);
    setEditFormData({
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'Edit',
      tags: item.tags ? item.tags.join(', ') : '',
    });
  };

  // Simpan Quick Edit dari Modal Detail Publik
  const handleSaveEdit = (e) => {
    if (e) e.preventDefault();
    if (!selectedKarya) return;

    const updatedTags = editFormData.tags
      ? editFormData.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : selectedKarya.tags || [];

    const updatedItem = {
      ...selectedKarya,
      title: editFormData.title.trim() || selectedKarya.title,
      description: editFormData.description.trim() || selectedKarya.description,
      category: editFormData.category || selectedKarya.category,
      tags: updatedTags,
    };

    editKarya(updatedItem);
    setSelectedKarya(updatedItem);
    setIsEditing(false);
  };

  // Export Backup Data JSON
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
        if (Array.isArray(parsed)) {
          updateKaryaList(parsed, `Berhasil memulihkan ${parsed.length} karya dari file backup!`);
          setSelectedKarya(null);
          setIsEditing(false);
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

  const handleOpenAdminPanel = () => {
    setAdminTab('karya');
    setIsAdminOpen(true);
  };

  return (
    <section id="karya" className="section pop-karya-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-badge">
            <span>Galeri Karya & Portofolio</span>
          </div>
          <h2 className="section-title">
            Hasil Karya & <span className="section-title-cream">Portofolio</span>
          </h2>
          <p className="section-subtitle">
            Kumpulan video kreatif, editing video, motion graphic, desain grafis, dan materi visual yang telah saya kerjakan.
          </p>

          {/* Backup & Secret Admin Quick Toolbar */}
          <div className="karya-backup-toolbar">
            <button
              type="button"
              className="btn-backup-admin-trigger"
              onClick={handleOpenAdminPanel}
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
              title="Unduh file backup data karya Anda"
            >
              <span>Export Data JSON</span>
            </button>

            <button
              type="button"
              className="btn-backup-import"
              onClick={() => fileInputRef.current?.click()}
              title="Unggah file JSON backup untuk memulihkan karya"
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

        {/* Karya Grid */}
        {filteredKarya.length > 0 ? (
          <div className="pop-karya-grid">
            {filteredKarya.map((item) => {
              const hasVideo = Boolean(item.videoUrl);
              const hasEmbed = Boolean(item.embedUrl);
              const imgSrc = item.image || (Array.isArray(item.images) ? item.images[0] : '');

              return (
                <div
                  key={item.id}
                  className="karya-pop-card pop-card"
                  onClick={() => handleOpenModal(item, false)}
                >
                  {/* Thumbnail Container */}
                  <div className="karya-thumb-box">
                    {hasVideo ? (
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
                        {hasVideo ? 'Putar Video' : hasEmbed ? 'Buka Embed' : 'Lihat Detail'}
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
                      <span>{hasVideo ? 'Buka Video' : hasEmbed ? 'Buka Embed' : 'Buka Preview'}</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="karya-empty-state pop-card">
            <h3 className="empty-title">
              {activeCat === 'Semua Karya' ? 'Galeri Karya Masih Kosong' : `Kategori ${activeCat}`}
            </h3>
            <p className="empty-desc">
              {karyaList.length === 0
                ? 'Belum ada karya yang diunggah. Gunakan Secret Admin Panel untuk menambahkan video, gambar, atau embed karya baru Anda.'
                : `Belum ada karya untuk kategori "${activeCat}". Silakan pilih kategori lain atau tambah karya baru.`}
            </p>
            <div className="empty-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleOpenAdminPanel}
              >
                <span>+ Tambah Karya (Admin Panel)</span>
              </button>
              {activeCat !== 'Semua Karya' && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setActiveCat('Semua Karya')}
                >
                  Lihat Semua Karya
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* MODAL DETAIL / LIGHTBOX PUBLIK */}
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
                <span className="lightbox-cat">{selectedKarya.category}</span>
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
                      });
                      setIsEditing(true);
                    }}
                    title="Edit judul dan deskripsi karya ini"
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
              {/* Media Player Container */}
              <div className="lightbox-img-wrap">
                {selectedKarya.videoUrl ? (
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
                    className="lightbox-embed-player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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
                    File Video: <code>{cleanPath(selectedKarya.videoUrl)}</code>
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
                  <h4 className="edit-form-heading">Edit Judul & Deskripsi Karya</h4>

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
