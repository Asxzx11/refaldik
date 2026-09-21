import React, { useState, useRef, useEffect } from 'react';
import './SocialLinks.css';

export default function SocialLinks({ className = '' }) {
  const [isIgOpen, setIsIgOpen] = useState(false);
  const igDropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (igDropdownRef.current && !igDropdownRef.current.contains(e.target)) {
        setIsIgOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`social-links-wrapper ${className}`}>
      {/* 1. Instagram Dropdown Popover */}
      <div className="social-dropdown-container" ref={igDropdownRef}>
        <button
          type="button"
          className={`social-pill-btn ig-toggle-btn ${isIgOpen ? 'active' : ''}`}
          onClick={() => setIsIgOpen(!isIgOpen)}
          aria-expanded={isIgOpen}
          title="Pilih Akun Instagram Refaldi"
        >
          <span>Instagram</span>
          <span className="dropdown-caret">{isIgOpen ? '▴' : '▾'}</span>
        </button>

        {isIgOpen && (
          <div className="social-popover-menu pop-card animate-pop-in">
            <a
              href="https://www.instagram.com/popchalant.id/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-popover-item"
              onClick={() => setIsIgOpen(false)}
            >
              <div className="popover-item-text">
                <span className="popover-title">Akun Utama</span>
                <span className="popover-handle">@popchalant.id</span>
              </div>
              <span className="popover-arrow">↗</span>
            </a>

            <div className="social-popover-divider" />

            <a
              href="https://www.instagram.com/refall.burger/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-popover-item"
              onClick={() => setIsIgOpen(false)}
            >
              <div className="popover-item-text">
                <span className="popover-title">Akun Pribadi</span>
                <span className="popover-handle">@refall.burger</span>
              </div>
              <span className="popover-arrow">↗</span>
            </a>
          </div>
        )}
      </div>

      {/* 2. YouTube */}
      <a
        href="https://www.youtube.com/@whoisgonnathingkingabtdiz"
        target="_blank"
        rel="noopener noreferrer"
        className="social-pill-btn"
        title="Kunjungi YouTube Channel Refaldi"
      >
        <span>YouTube</span>
      </a>

      {/* 3. TikTok */}
      <a
        href="https://www.tiktok.com/@popchalant"
        target="_blank"
        rel="noopener noreferrer"
        className="social-pill-btn"
        title="Kunjungi TikTok Refaldi"
      >
        <span>TikTok</span>
      </a>
    </div>
  );
}
