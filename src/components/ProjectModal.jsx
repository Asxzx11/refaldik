import React, { useEffect } from 'react';
import './ProjectModal.css';

export default function ProjectModal({ project, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!project) return null;

  return (
    <div className="project-modal-backdrop" onClick={onClose}>
      <div
        className="project-modal-container glass-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <span className="modal-category">{project.category}</span>
            <h3 className="modal-title">{project.title}</h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Tutup Modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="modal-body">
          {/* Cover Image */}
          <div className="modal-image-wrapper">
            <img
              src={project.image}
              alt={project.title}
              className="modal-project-img"
            />
          </div>

          {/* Tagline */}
          <p className="modal-tagline">{project.tagline}</p>

          {/* Problem & Solution Grid */}
          <div className="modal-problem-solution-grid">
            <div className="problem-box">
              <div className="box-title">
                <span>⚠️</span>
                <h4>Tantangan & Masalah</h4>
              </div>
              <p>{project.problem}</p>
            </div>

            <div className="solution-box">
              <div className="box-title">
                <span>💡</span>
                <h4>Solusi & Implementasi</h4>
              </div>
              <p>{project.solution}</p>
            </div>
          </div>

          {/* Key Features */}
          {project.keyFeatures && (
            <div className="modal-section-box">
              <h4 className="box-heading">✨ Fitur Utama</h4>
              <ul className="modal-features-list">
                {project.keyFeatures.map((feat, idx) => (
                  <li key={idx} className="feature-item">
                    <span className="feature-check">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Metrics & Impact */}
          {project.metrics && (
            <div className="modal-metrics-box">
              <span className="metrics-icon">📈</span>
              <div>
                <strong>Dampak & Metrik Performa:</strong>
                <p>{project.metrics}</p>
              </div>
            </div>
          )}

          {/* Tech Stack Badges */}
          <div className="modal-section-box">
            <h4 className="box-heading">🛠️ Tech Stack yang Digunakan</h4>
            <div className="modal-tech-tags">
              {project.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="modal-footer">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <span>Buka Live Preview</span>
              <span>🚀</span>
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <span>Source Code</span>
              <span>🐙</span>
            </a>
          )}
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
