import React from 'react';
import { portfolioData } from '../data/portfolioData';
import './VideoIntro.css';

export default function VideoIntro() {
  const { videoIntro } = portfolioData;

  const embedSrc =
    videoIntro.videoUrl ||
    "https://drive.google.com/file/d/1uyTbjMO7UH4Sr0JSPGzaSej086WtjQ4c/preview";

  return (
    <section id="video-intro" className="section pop-video-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-badge">
            <span>{videoIntro.badge || 'VIDEO PERKENALAN'}</span>
          </div>
          <h2 className="section-title">
            Tonton Video <span className="section-title-cream">Perkenalan</span>
          </h2>
          <p className="section-subtitle">
            {videoIntro.subtitle}
          </p>
        </div>

        {/* Video Player Frame */}
        <div className="pop-video-wrapper pop-card">
          <div className="pop-video-topbar">
            <div className="pop-video-dots">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <span className="pop-video-title">Video Perkenalan (Google Drive)</span>
            <span className="pop-video-badge">DRIVE STREAM HD</span>
          </div>

          {/* Responsive 16:9 Aspect-Video Screen */}
          <div className="pop-video-screen">
            <iframe
              src={embedSrc}
              title="Video Perkenalan Refaldi Kurniawan"
              className="pop-video-iframe w-full aspect-video rounded-2xl border-0 shadow-md"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
            />
          </div>

          <div className="pop-video-footer">
            <p>
              Video ini adalah video perkenalan PKKMB saya
            </p>
            {embedSrc && embedSrc.includes('drive.google.com') && (
              <a
                href={embedSrc.replace('/preview', '/view')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-drive-intro-link"
                title="Buka video di Google Drive pada tab baru"
              >
                <span>Buka di Google Drive ↗</span>
              </a>
            )}
          </div>
        </div>

        {/* Highlights Cards */}
        {videoIntro.highlights && (
          <div className="video-highlights-row">
            {videoIntro.highlights.map((item, idx) => (
              <div key={idx} className="video-highlight-card pop-card">
                <div className="highlight-number-badge">
                  <span>{item.number}</span>
                </div>
                <h4 className="highlight-card-title">{item.title}</h4>
                <p className="highlight-card-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
