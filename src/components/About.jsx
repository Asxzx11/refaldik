import React, { useState } from 'react';
import { portfolioData } from '../data/portfolioData';
import './About.css';

export default function About() {
  const { about } = portfolioData;
  const [activeTab, setActiveTab] = useState(about.tabs[0].id);

  const selectedTab = about.tabs.find((t) => t.id === activeTab) || about.tabs[0];

  return (
    <section id="about" className="section about-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-badge">
            <span>👤</span>
            <span>Tentang Saya</span>
          </div>
          <h2 className="section-title">
            Membangun Solusi Digital dengan <span className="gradient-text">Presisi & Passion</span>
          </h2>
          <p className="section-subtitle">
            Kombinasi antara logika rekayasa perangkat lunak dan kepekaan visual untuk menciptakan produk web yang bernilai tinggi.
          </p>
        </div>

        {/* About Main Grid */}
        <div className="about-main-grid">
          {/* Left: Interactive Tabs Container */}
          <div className="about-tabs-container glass-card">
            {/* Tab Navigation Buttons */}
            <div className="about-tab-nav">
              {about.tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content Box */}
            <div className="about-tab-body">
              <div className="tab-content-text">
                {selectedTab.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="about-paragraph">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Key Highlights Cards Grid */}
          <div className="about-highlights-grid">
            {about.highlights.map((item, idx) => (
              <div key={idx} className="highlight-card glass-card glass-card-interactive">
                <div className="highlight-icon-box">
                  <span className="highlight-icon">{item.icon}</span>
                </div>
                <h4 className="highlight-title">{item.title}</h4>
                <p className="highlight-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
