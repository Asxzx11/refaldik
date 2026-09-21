import React from 'react';
import { portfolioData } from '../data/portfolioData';
import './VideoIntro.css';

export default function VideoIntro() {
  const { videoIntro } = portfolioData;

  return (
    <section id="video-intro" className="section pop-video-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-badge">
            <span>{videoIntro.badge}</span>
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
            <span className="pop-video-title">intro.mp4</span>
            <span className="pop-video-badge">CREATIVE HD</span>
          </div>

          <div className="pop-video-screen">
            {videoIntro.videoType === 'embed' || videoIntro.videoUrl?.includes('drive.google.com') ? (
              <iframe
                src={videoIntro.videoUrl}
                title="Video Perkenalan Refaldi Kurniawan"
                className="w-full h-full rounded-xl border-0 pop-video-iframe"
                allow="autoplay"
                allowFullScreen
              />
            ) : (
              <video
                controls
                className="pop-video-native"
                src={videoIntro.videoFileUrl || "/introvid/intro.mp4"}
                playsInline
                preload="metadata"
              >
                <source src={videoIntro.videoFileUrl || "/introvid/intro.mp4"} type="video/mp4" />
                Browser Anda tidak mendukung pemutar video HTML5.
              </video>
            )}
          </div>

          <div className="pop-video-footer">
            <p>
              Video ini adalah video perkenalan PKKMB saya
            </p>
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
