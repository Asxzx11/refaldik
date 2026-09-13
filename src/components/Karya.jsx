import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
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
  const { karyaList } = usePortfolio();
  const [selectedKarya, setSelectedKarya] = useState(null);

  // Buka Modal Detail / Preview Publik
  const handleOpenModal = (item) => {
    setSelectedKarya(item);
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
            Kumpulan desain visual, scrapbook digital, materi kreatif, dan karya visual yang telah saya kerjakan.
          </p>
        </div>

        {/* Karya Grid - Menampilkan seluruh karya secara langsung */}
        {karyaList && karyaList.length > 0 ? (
          <div className="pop-karya-grid">
            {karyaList.map((item) => {
              const hasVideo = Boolean(item.videoUrl);
              const hasEmbed = Boolean(item.embedUrl);
              const imgSrc = item.image || (Array.isArray(item.images) ? item.images[0] : '');

              return (
                <div
                  key={item.id}
                  className="karya-pop-card pop-card"
                  onClick={() => handleOpenModal(item)}
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
                    {item.description ? (
                      <p className="karya-pop-desc">{item.description}</p>
                    ) : null}

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
                      className="btn-karya-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(item);
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
            <h3 className="empty-title">Galeri Karya</h3>
            <p className="empty-desc">Karya akan segera diunggah.</p>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* MODAL DETAIL / LIGHTBOX PUBLIK */}
      {/* ===================================================================== */}
      {selectedKarya && (
        <div
          className="karya-lightbox-backdrop"
          onClick={() => setSelectedKarya(null)}
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
                <button
                  type="button"
                  className="lightbox-close-btn"
                  onClick={() => setSelectedKarya(null)}
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

              {selectedKarya.description ? (
                <div className="lightbox-desc-box">
                  <h4>Deskripsi & Konsep Karya:</h4>
                  <p>{selectedKarya.description}</p>
                </div>
              ) : null}

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
            </div>

            {/* Footer Modal */}
            <div className="lightbox-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setSelectedKarya(null)}
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
