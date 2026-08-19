import React from 'react';
import { portfolioData } from '../data/portfolioData';
import './Certificates.css';

export default function Certificates() {
  const { certificates, testimonials } = portfolioData;

  return (
    <section id="certificates" className="section certificates-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-badge">
            <span>🏆</span>
            <span>Kredensial & Pengakuan</span>
          </div>
          <h2 className="section-title">
            Sertifikasi Profesional & <span className="gradient-text">Testimoni</span>
          </h2>
          <p className="section-subtitle">
            Validasi kompetensi teknis dari institusi global terkemuka serta ulasan langsung dari klien dan mitra kolaborasi.
          </p>
        </div>

        {/* Certificates Grid */}
        <div className="certificates-grid">
          {certificates.map((cert, index) => (
            <div
              key={index}
              className="certificate-card glass-card glass-card-interactive"
            >
              <div className="cert-top">
                <div
                  className="cert-badge-glow"
                  style={{
                    backgroundColor: `${cert.badgeColor}20`,
                    borderColor: `${cert.badgeColor}60`,
                    color: cert.badgeColor,
                  }}
                >
                  <span>📜</span>
                </div>
                <span className="cert-year">{cert.date}</span>
              </div>

              <h4 className="cert-title">{cert.title}</h4>
              <p className="cert-issuer">Diterbitkan oleh: <strong>{cert.issuer}</strong></p>

              <div className="cert-footer">
                <span className="cert-id">ID: {cert.credentialId}</span>
                {cert.url && (
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cert-verify-btn"
                  >
                    <span>Verifikasi</span>
                    <span>↗</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials Block */}
        <div className="testimonials-block">
          <div className="testimonials-header">
            <h3 className="testimonials-title">Apa Kata Mereka Tentang Kerjasama?</h3>
            <p className="testimonials-subtitle">Ulasan nyata dari rekan kerja dan klien proyek sebelumnya.</p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((testi, idx) => (
              <div key={idx} className="testimonial-card glass-card glass-card-interactive">
                {/* Rating Stars */}
                <div className="rating-stars">
                  {'★'.repeat(testi.rating)}
                </div>

                <p className="testimonial-content">"{testi.content}"</p>

                <div className="testimonial-author">
                  <img
                    src={testi.avatar}
                    alt={testi.name}
                    className="author-avatar"
                  />
                  <div className="author-meta">
                    <h5 className="author-name">{testi.name}</h5>
                    <p className="author-role">
                      {testi.role}, <span className="author-company">{testi.company}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
