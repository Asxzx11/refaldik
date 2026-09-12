import React, { useState, useEffect } from 'react';
import { portfolioData } from '../data/portfolioData';
import SocialLinks from './SocialLinks';
import './Footer.css';

export default function Footer() {
  const { personal } = portfolioData;
  const currentYear = new Date().getFullYear();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="pop-footer">
      <div className="container">
        <div className="pop-footer-grid">
          {/* Brand */}
          <div className="footer-brand-side">
            <a href="#home" className="footer-pop-logo">
              <span>{personal.name}</span>
            </a>
            <p className="footer-pop-tagline">{personal.tagline}</p>
            <div className="footer-wa-badge">
              <a
                href="https://wa.me/6281378825542"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-wa-link"
              >
                <span>WhatsApp: {personal.whatsapp}</span>
              </a>
            </div>
          </div>

          {/* Nav Links */}
          <div className="footer-links-side">
            <h4 className="footer-heading">Navigasi Halaman</h4>
            <ul className="footer-menu">
              <li><a href="#home">Beranda</a></li>
              <li><a href="#skills">Skill & Keahlian</a></li>
              <li><a href="#karya">Galeri Karya</a></li>
              <li><a href="#contact">Kontak Langsung</a></li>
            </ul>
          </div>

          {/* Social */}
          <div className="footer-social-side">
            <h4 className="footer-heading">Media Sosial</h4>
            <div className="footer-social-row-wrap">
              <SocialLinks />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pop-footer-bottom">
          <div className="footer-copy-text">
            © {currentYear} <strong>{personal.name}</strong>. Personal Portfolio.
          </div>
          <div className="footer-pill-tag">
            <span>fun things are fun!</span>
          </div>
        </div>
      </div>

      {/* Floating Scroll To Top Sticker */}
      {showScrollTop && (
        <button
          type="button"
          className="pop-scroll-top-btn"
          onClick={scrollToTop}
          title="Kembali ke atas"
          aria-label="Scroll to top"
        >
          <span>↑</span>
        </button>
      )}
    </footer>
  );
}
