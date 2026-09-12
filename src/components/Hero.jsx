import React from 'react';
import { portfolioData } from '../data/portfolioData';
import { usePortfolio } from '../context/PortfolioContext';
import SocialLinks from './SocialLinks';
import './Hero.css';

// Helper: Bersihkan path foto profil
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

export default function Hero() {
  const { personal } = portfolioData;
  const { aboutMe, profilePhoto, contacts, setIsAdminOpen, setAdminTab } = usePortfolio();

  const hasAnySocial = Boolean(
    contacts?.instagram || contacts?.tiktok || contacts?.youtube || contacts?.whatsapp
  );

  const handleOpenAdminPhoto = () => {
    setAdminTab('about');
    setIsAdminOpen(true);
  };

  return (
    <section id="home" className="hero-pop-section">
      {/* Background Ambient Glow & Dot Pattern */}
      <div className="hero-ambient-glow" />
      <div className="hero-pop-pattern-bg" />

      {/* STRUKTUR UTAMA: Grid 2 Kolom Seimbang */}
      <div className="hero-pop-container">
        {/* =================================================================
            1. KOLOM KIRI: SATU FOTO POLOS 1:1 (SQUARE ROUNDED BOX)
            ================================================================= */}
        <div className="hero-visual-column">
          <div className="hero-photo-frame pop-card">
            {profilePhoto ? (
              <img
                src={cleanPath(profilePhoto)}
                alt={personal?.name || 'Foto Profil'}
                className="hero-photo-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div
                className="hero-photo-empty-box"
                onClick={handleOpenAdminPhoto}
                title="Klik untuk mengatur Foto Profil di Admin Panel (Ctrl + Shift + B)"
              >
                <div className="empty-avatar-circle">
                  <span className="empty-avatar-icon">👤</span>
                </div>
                <div className="empty-avatar-text">
                  <span className="empty-title">Foto Profil (1:1)</span>
                  <span className="empty-sub">Atur via Admin Panel</span>
                  <kbd className="empty-shortcut-kbd">Ctrl+Shift+B</kbd>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =================================================================
            2. KOLOM KANAN: TEKS & TOMBOL
            ================================================================= */}
        <div className="hero-info-column">
          {/* Top Big Name Typography */}
          <div className="hero-headline-box">
            <div className="headline-ambient-flare" />
            <h1 className="name-line name-first">{personal?.nameLine1 || 'PORTOFOLIO'}</h1>
            <h1 className="name-line name-last">{personal?.nameLine2 || 'KREATIF'}</h1>
          </div>

          {/* Section: ABOUT ME (Real-time synced from Context & LocalStorage) */}
          <div className="hero-about-box">
            <h3 className="about-title">{personal?.aboutHeading || 'ABOUT ME'}</h3>
            <p className="about-paragraph">{aboutMe || personal?.aboutDescription}</p>
          </div>

          {/* Action Buttons */}
          <div className="hero-cta-row">
            <a href="#karya" className="btn btn-primary">
              <span>Lihat Karya</span>
            </a>
            <a href="#contact" className="btn btn-outline">
              <span>Hubungi Saya</span>
            </a>
          </div>

          {/* Social Media Links (Dynamic & Real-time) */}
          {hasAnySocial && (
            <div className="hero-social-row">
              <span className="social-label">Media Sosial:</span>
              <SocialLinks />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
