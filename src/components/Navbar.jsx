import React, { useState, useEffect } from 'react';
import { portfolioData } from '../data/portfolioData';
import { usePortfolio } from '../context/PortfolioContext';
import './Navbar.css';

export default function Navbar() {
  const { contacts } = usePortfolio();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeSec, setActiveSec] = useState('home');

  const cleanWaNumber = contacts?.whatsapp ? contacts.whatsapp.replace(/[^0-9]/g, '') : '';
  const waUrl = cleanWaNumber ? `https://wa.me/${cleanWaNumber}` : '#home';

  const navLinks = [
    { name: 'Beranda', href: '#home' },
    { name: 'Skill & Keahlian', href: '#skills' },
    { name: 'Karya', href: '#karya' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      const sections = navLinks.map((l) => l.href.substring(1));
      const pos = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= pos) {
          setActiveSec(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`pop-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container pop-nav-container">
        {/* Logo */}
        <a href="#home" className="pop-nav-logo">
          <div className="logo-bubble-badge">
            <span>P</span>
          </div>
          <span className="logo-bubble-text">
            {portfolioData.personal.firstName || 'Phebe'}
            <span className="logo-bubble-accent">.</span>
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="desktop-pop-nav">
          <ul className="pop-nav-menu">
            {navLinks.map((link) => {
              const id = link.href.substring(1);
              const isActive = activeSec === id;
              return (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className={`pop-nav-link ${isActive ? 'active' : ''}`}
                  >
                    {link.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* CTA Right */}
        <div className="pop-nav-actions">
          <a
            href={waUrl}
            target={cleanWaNumber ? '_blank' : '_self'}
            rel={cleanWaNumber ? 'noopener noreferrer' : ''}
            className="btn btn-primary pop-nav-cta"
            title="Hubungi Saya"
          >
            <span>Hubungi Saya</span>
          </a>

          {/* Mobile Hamburger */}
          <button
            type="button"
            className={`pop-mobile-btn ${isMobileOpen ? 'open' : ''}`}
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`pop-mobile-drawer ${isMobileOpen ? 'open' : ''}`}>
        <ul className="mobile-drawer-list">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a
                href={link.href}
                className="mobile-drawer-link"
                onClick={() => setIsMobileOpen(false)}
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>
        <a
          href={waUrl}
          target={cleanWaNumber ? '_blank' : '_self'}
          rel={cleanWaNumber ? 'noopener noreferrer' : ''}
          className="btn btn-primary full-width"
          onClick={() => setIsMobileOpen(false)}
        >
          Hubungi Saya
        </a>
      </div>
    </header>
  );
}
