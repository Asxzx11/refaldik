import React, { useState } from 'react';
import { portfolioData } from '../data/portfolioData';
import { usePortfolio } from '../context/PortfolioContext';
import SocialLinks from './SocialLinks';
import './Hero.css';

// Real Transparent Assets
import halftoneTextureImg from '../assets/halftone-texture.png';
import dreamTextImg from '../assets/dream-text.png';
import profileCutoutImg from '../assets/profile-cutout.png';
import stickersTextImg from '../assets/stickers-text.png';

export default function Hero() {
  const { personal } = portfolioData;
  const { aboutMe } = usePortfolio();

  // Mouse move parallax interaction state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <section id="home" className="hero-pop-section">
      {/* Background Ambient Glow & Dot Pattern */}
      <div className="hero-ambient-glow" />
      <div className="hero-pop-pattern-bg" />

      {/* STRUKTUR UTAMA: Grid 2 Kolom Seimbang */}
      <div className="hero-pop-container">
        {/* =================================================================
            1. KOLOM KIRI: FLAT TRANSPARENT ASSET STACK (STIKER PALING DEPAN)
            ================================================================= */}
        <div className="hero-visual-column">
          <div
            className="hero-flat-artwork-box"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Layer 1: Background Texture (z-index 1) */}
            <img
              src={halftoneTextureImg}
              alt="Halftone Background"
              className="hero-flat-layer layer-texture"
              style={{
                transform: isHovered
                  ? `translate3d(${mousePos.x * -5}px, ${mousePos.y * -5}px, 0)`
                  : 'translate3d(0, 0, 0)',
              }}
            />

            {/* Layer 2: Typography DREAM (z-index 10) */}
            <img
              src={dreamTextImg}
              alt="DREAM Typography"
              className="hero-flat-layer layer-dream animate-dream-float"
              style={{
                transform: isHovered
                  ? `translate3d(${mousePos.x * 8}px, ${mousePos.y * 8}px, 0)`
                  : 'translate3d(0, 0, 0)',
              }}
            />

            {/* Layer 3: Profile Cutout Foto (z-index 20) */}
            <img
              src={profileCutoutImg}
              alt={personal.name}
              className="hero-flat-layer layer-profile"
              style={{
                transform: isHovered
                  ? `translate3d(${mousePos.x * -12}px, ${mousePos.y * -12}px, 0) scale(1.02)`
                  : 'translate3d(0, 0, 0) scale(1)',
              }}
            />

            {/* Layer 4: Stickers Text - WAJIB PALING DEPAN (z-index 30) */}
            <img
              src={stickersTextImg}
              alt="Stickers Text"
              className="hero-flat-layer layer-stickers animate-sticker-wobble"
              style={{
                transform: isHovered
                  ? `translate3d(${mousePos.x * 6}px, ${mousePos.y * 6}px, 0)`
                  : 'translate3d(0, 0, 0)',
              }}
            />
          </div>
        </div>

        {/* =================================================================
            2. KOLOM KANAN: TEKS & TOMBOL (HTML MURNI)
            ================================================================= */}
        <div className="hero-info-column">
          {/* Top Big Name Typography */}
          <div className="hero-headline-box">
            <div className="headline-ambient-flare" />
            <h1 className="name-line name-first">{personal.nameLine1 || 'REFALDI'}</h1>
            <h1 className="name-line name-last">{personal.nameLine2 || 'KURNIAWAN'}</h1>
          </div>

          {/* Section: ABOUT ME (Real-time synced from Context & LocalStorage) */}
          <div className="hero-about-box">
            <h3 className="about-title">{personal.aboutHeading || 'ABOUT ME'}</h3>
            <p className="about-paragraph">{aboutMe || personal.aboutDescription}</p>
          </div>

          {/* Action Buttons */}
          <div className="hero-cta-row">
            <a href="#karya" className="btn btn-primary">
              <span>Lihat Karya</span>
            </a>
            <a
              href="/images/CV.png"
              target="_blank"
              rel="noopener noreferrer"
              download="CV_Refaldi_Kurniawan.png"
              className="btn btn-outline"
              title="Unduh Curriculum Vitae (CV) Refaldi"
            >
              <span>Unduh CV</span>
            </a>
          </div>

          {/* Social Media Links with Instagram Dropdown */}
          <div className="hero-social-row">
            <span className="social-label">Media Sosial:</span>
            <SocialLinks />
          </div>
        </div>
      </div>
    </section>
  );
}
