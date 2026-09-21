import React, { useEffect } from 'react';
import { portfolioData } from '../data/portfolioData';
import './ResumeModal.css';

export default function ResumeModal({ onClose }) {
  const { personal, experience, education, skills } = portfolioData;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="resume-backdrop" onClick={onClose}>
      <div
        className="resume-modal-container glass-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="resume-topbar">
          <div className="resume-topbar-title">
            <span>📄 Curriculum Vitae Preview</span>
          </div>
          <div className="resume-topbar-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handlePrint}
            >
              <span>Cetak / Simpan PDF</span>
              <span>🖨️</span>
            </button>
            <button
              type="button"
              className="resume-close-btn"
              onClick={onClose}
              aria-label="Tutup"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Resume Document Paper View */}
        <div className="resume-paper" id="printable-resume">
          {/* Header */}
          <div className="resume-header">
            <div>
              <h2 className="resume-name">{personal.name}</h2>
              <p className="resume-role">{personal.role}</p>
            </div>
            <div className="resume-contacts">
              <span>📧 {personal.email}</span>
              <span>💬 {personal.whatsapp}</span>
              <span>📍 {personal.location}</span>
            </div>
          </div>

          <hr className="resume-divider" />

          {/* Summary */}
          <div className="resume-section">
            <h4 className="resume-sec-title">Ringkasan Profesional</h4>
            <p className="resume-text">{personal.tagline} {portfolioData.hero.bio}</p>
          </div>

          {/* Key Skills */}
          <div className="resume-section">
            <h4 className="resume-sec-title">Keahlian Teknis & Tools</h4>
            <div className="resume-skills-list">
              {skills.items.map((s) => (
                <span key={s.name} className="resume-skill-tag">
                  {s.name}
                </span>
              ))}
            </div>
          </div>

          {/* Work Experience */}
          <div className="resume-section">
            <h4 className="resume-sec-title">Pengalaman Kerja</h4>
            <div className="resume-exp-list">
              {experience.map((exp, idx) => (
                <div key={idx} className="resume-exp-item">
                  <div className="resume-exp-head">
                    <strong>{exp.role}</strong> — {exp.company}
                    <span className="resume-date">{exp.period}</span>
                  </div>
                  <p className="resume-exp-desc">{exp.description}</p>
                  {exp.achievements && (
                    <ul className="resume-bullets">
                      {exp.achievements.map((ach, i) => (
                        <li key={i}>{ach}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="resume-section">
            <h4 className="resume-sec-title">Pendidikan</h4>
            {education.map((edu, idx) => (
              <div key={idx} className="resume-edu-item">
                <div className="resume-exp-head">
                  <strong>{edu.degree}</strong> — {edu.institution}
                  <span className="resume-date">{edu.period}</span>
                </div>
                <p className="resume-exp-desc">{edu.grade} • {edu.highlights}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
