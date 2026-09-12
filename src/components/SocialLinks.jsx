import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import './SocialLinks.css';

// Helper: Ubah input handle / username menjadi URL lengkap
const formatSocialUrl = (type, val) => {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const cleanUsername = trimmed.replace(/^@/, '');
  switch (type) {
    case 'instagram':
      return `https://www.instagram.com/${cleanUsername}/`;
    case 'tiktok':
      return `https://www.tiktok.com/@${cleanUsername}`;
    case 'youtube':
      return trimmed.startsWith('@')
        ? `https://www.youtube.com/${trimmed}`
        : `https://www.youtube.com/@${cleanUsername}`;
    case 'whatsapp': {
      const cleanNumber = trimmed.replace(/[^0-9]/g, '');
      return `https://wa.me/${cleanNumber}`;
    }
    default:
      return trimmed;
  }
};

export default function SocialLinks({ className = '', showEmpty = false }) {
  const { contacts } = usePortfolio();

  const igUrl = formatSocialUrl('instagram', contacts?.instagram);
  const tiktokUrl = formatSocialUrl('tiktok', contacts?.tiktok);
  const ytUrl = formatSocialUrl('youtube', contacts?.youtube);
  const waUrl = formatSocialUrl('whatsapp', contacts?.whatsapp);

  const hasAnySocial = Boolean(igUrl || tiktokUrl || ytUrl || waUrl);

  if (!hasAnySocial) {
    if (showEmpty) {
      return (
        <div className={`social-links-wrapper social-links-empty ${className}`}>
          <span className="social-empty-badge">Sosial media belum diatur (Ctrl + Shift + B)</span>
        </div>
      );
    }
    return null;
  }

  return (
    <div className={`social-links-wrapper ${className}`}>
      {/* 1. Instagram */}
      {igUrl && (
        <a
          href={igUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="social-pill-btn"
          title="Kunjungi Profil Instagram"
        >
          <span>Instagram</span>
          <span className="social-arrow-icon">↗</span>
        </a>
      )}

      {/* 2. TikTok */}
      {tiktokUrl && (
        <a
          href={tiktokUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="social-pill-btn"
          title="Kunjungi Profil TikTok"
        >
          <span>TikTok</span>
          <span className="social-arrow-icon">↗</span>
        </a>
      )}

      {/* 3. YouTube */}
      {ytUrl && (
        <a
          href={ytUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="social-pill-btn"
          title="Kunjungi Channel YouTube"
        >
          <span>YouTube</span>
          <span className="social-arrow-icon">↗</span>
        </a>
      )}

      {/* 4. WhatsApp */}
      {waUrl && (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="social-pill-btn wa-social-pill"
          title="Chat langsung di WhatsApp"
        >
          <span>WhatsApp</span>
          <span className="social-arrow-icon">↗</span>
        </a>
      )}
    </div>
  );
}
