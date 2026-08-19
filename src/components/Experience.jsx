import React, { useState } from 'react';
import { portfolioData } from '../data/portfolioData';
import './Experience.css';

export default function Experience() {
  const { experience, education } = portfolioData;
  const [viewMode, setViewMode] = useState('experience');

  return (
    <section id="experience" className="section experience-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-badge">
            <span>🚀</span>
            <span>Jejak Langkah & Karir</span>
          </div>
          <h2 className="section-title">
            Pengalaman Kerja & <span className="gradient-text">Pendidikan</span>
          </h2>
          <p className="section-subtitle">
            Rekam jejak profesional, kontribusi tim, dan fondasi akademis yang membentuk kapabilitas rekayasa perangkat lunak saya.
          </p>
        </div>

        {/* View Switcher */}
        <div className="experience-switch-wrapper">
          <div className="experience-switcher glass-card">
            <button
              type="button"
              className={`exp-switch-btn ${viewMode === 'experience' ? 'active' : ''}`}
              onClick={() => setViewMode('experience')}
            >
              <span>💼 Pengalaman Profesional ({experience.length})</span>
            </button>
            <button
              type="button"
              className={`exp-switch-btn ${viewMode === 'education' ? 'active' : ''}`}
              onClick={() => setViewMode('education')}
            >
              <span>🎓 Riwayat Pendidikan ({education.length})</span>
            </button>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="timeline-container">
          {viewMode === 'experience' ? (
            <div className="timeline-track">
              {experience.map((item, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker">
                    <div className="timeline-dot" />
                    <div className="timeline-line" />
                  </div>

                  <div className="timeline-content glass-card glass-card-interactive">
                    <div className="timeline-header">
                      <div>
                        <h3 className="timeline-role">{item.role}</h3>
                        <h4 className="timeline-company">{item.company}</h4>
                      </div>
                      <div className="timeline-meta">
                        <span className="timeline-period">{item.period}</span>
                        <span className="timeline-location">📍 {item.location}</span>
                      </div>
                    </div>

                    <p className="timeline-desc">{item.description}</p>

                    {/* Bullet Achievements */}
                    {item.achievements && (
                      <div className="timeline-achievements">
                        <h5 className="achievements-title">Pencapaian Utama:</h5>
                        <ul>
                          {item.achievements.map((ach, idx) => (
                            <li key={idx} className="achievement-item">
                              <span className="ach-bullet">✦</span>
                              <span>{ach}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tech Stack Used */}
                    {item.skills && (
                      <div className="timeline-tags">
                        {item.skills.map((skill) => (
                          <span key={skill} className="tag">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="timeline-track">
              {education.map((item, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker">
                    <div className="timeline-dot dot-edu" />
                    <div className="timeline-line" />
                  </div>

                  <div className="timeline-content glass-card glass-card-interactive">
                    <div className="timeline-header">
                      <div>
                        <h3 className="timeline-role">{item.degree}</h3>
                        <h4 className="timeline-company">{item.institution}</h4>
                      </div>
                      <div className="timeline-meta">
                        <span className="timeline-period">{item.period}</span>
                        <span className="timeline-grade">🏆 {item.grade}</span>
                      </div>
                    </div>

                    <p className="timeline-desc">{item.highlights}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
