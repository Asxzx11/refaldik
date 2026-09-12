import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import SocialLinks from './SocialLinks';
import './Contact.css';

export default function Contact() {
  const { contacts, setIsAdminOpen, setAdminTab } = usePortfolio();

  const [formData, setFormData] = useState({
    name: '',
    serviceType: 'Video Editing & Motion',
    message: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [noWaWarning, setNoWaWarning] = useState(false);

  const cleanWaNumber = contacts?.whatsapp ? contacts.whatsapp.replace(/[^0-9]/g, '') : '';
  const hasWhatsapp = Boolean(cleanWaNumber);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Nama lengkap wajib diisi.';
    if (!formData.message.trim()) errors.message = 'Pesan wajib diisi.';
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    if (!hasWhatsapp) {
      setNoWaWarning(true);
      setTimeout(() => setNoWaWarning(false), 5000);
      return;
    }

    setIsSubmitting(true);

    const waText = encodeURIComponent(
      `Halo! Nama saya ${formData.name}. Saya tertarik untuk berdiskusi mengenai ${formData.serviceType}.\n\nPesan: ${formData.message}`
    );
    const waUrl = `https://wa.me/${cleanWaNumber}?text=${waText}`;

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      setFormData({
        name: '',
        serviceType: 'Video Editing & Motion',
        message: '',
      });
      setTimeout(() => setSubmitSuccess(false), 6000);
    }, 500);
  };

  const handleOpenAdminContacts = () => {
    setAdminTab('contacts');
    setIsAdminOpen(true);
  };

  return (
    <section id="contact" className="section pop-contact-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-badge">
            <span>HUBUNGI SAYA</span>
          </div>
          <h2 className="section-title">
            Mari Terhubung & <span className="section-title-cream">Berkolaborasi</span>
          </h2>
          <p className="section-subtitle">
            Pintu komunikasi selalu terbuka untuk tawaran proyek kreatif, kolaborasi visual, atau sekadar berdiskusi.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="pop-contact-grid">
          {/* Left Column: Direct Contacts */}
          <div className="contact-info-col">
            <div className="pop-card contact-info-card">
              <h3 className="contact-card-title">Kontak Langsung</h3>
              <p className="contact-card-sub">
                Hubungi saya secara langsung untuk respon cepat seputar proyek, komisi desain, atau peluang kerja sama.
              </p>

              <div className="contact-pill-list">
                {/* WhatsApp Item */}
                {hasWhatsapp ? (
                  <div className="contact-pill-item">
                    <div className="pill-text">
                      <span className="pill-label">WhatsApp / Telepon</span>
                      <span className="pill-value">{contacts.whatsapp}</span>
                    </div>
                    <a
                      href={`https://wa.me/${cleanWaNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-pill-action wa-action"
                      title="Chat langsung di WhatsApp"
                    >
                      Chat WhatsApp ↗
                    </a>
                  </div>
                ) : (
                  <div className="contact-empty-item" onClick={handleOpenAdminContacts}>
                    <div className="empty-contact-icon">📱</div>
                    <div className="empty-contact-text">
                      <span className="empty-contact-title">WhatsApp Belum Diatur</span>
                      <span className="empty-contact-hint">Klik untuk menambahkan nomor di Admin Panel</span>
                    </div>
                  </div>
                )}

                {/* Location Item */}
                {contacts?.location ? (
                  <div className="contact-pill-item">
                    <div className="pill-text">
                      <span className="pill-label">Domisili</span>
                      <span className="pill-value">{contacts.location}</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Social Media Links */}
              <div className="contact-social-section">
                <span className="social-sec-label">Media Sosial:</span>
                <div className="contact-social-pills-row">
                  <SocialLinks showEmpty={true} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="contact-form-col">
            <div className="pop-card contact-form-card">
              <h3 className="contact-card-title">Kirimkan Pesan</h3>
              <p className="contact-card-sub">
                Isi formulir singkat di bawah ini untuk langsung mengirimkan pesan kepada saya.
              </p>

              {submitSuccess && (
                <div className="pop-success-toast animate-pop-in">
                  <div>
                    <strong>Pesan Disiapkan!</strong>
                    <p>Membuka chat WhatsApp untuk mengirimkan pesan Anda...</p>
                  </div>
                </div>
              )}

              {noWaWarning && (
                <div className="pop-warning-toast animate-pop-in">
                  <div>
                    <strong>Nomor WhatsApp Belum Diatur</strong>
                    <p>
                      Silakan atur nomor WhatsApp di{' '}
                      <button
                        type="button"
                        className="btn-inline-admin-trigger"
                        onClick={handleOpenAdminContacts}
                      >
                        Admin Panel (Ctrl+Shift+B)
                      </button>{' '}
                      agar pesan dapat terkirim via WhatsApp.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="pop-contact-form">
                <div className="pop-form-group">
                  <label htmlFor="contact-name">
                    Nama Lengkap <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="contact-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama Anda..."
                    className={`pop-input ${formErrors.name ? 'error' : ''}`}
                  />
                  {formErrors.name && (
                    <span className="form-err-msg">{formErrors.name}</span>
                  )}
                </div>

                <div className="pop-form-group">
                  <label htmlFor="contact-serviceType">Kategori Kebutuhan</label>
                  <select
                    id="contact-serviceType"
                    value={formData.serviceType}
                    onChange={(e) =>
                      setFormData({ ...formData, serviceType: e.target.value })
                    }
                    className="pop-input"
                  >
                    <option value="Video Editing & Motion">Video Editing & Motion</option>
                    <option value="Desain Visual & Pop-Art">Desain Grafis & Poster</option>
                    <option value="Branding & Konten Medsos">Branding & Konten Media Sosial</option>
                    <option value="Iklan & Merchandise">Video Iklan / Merchandise</option>
                    <option value="Diskusi & Kolaborasi Proyek">Diskusi & Proyek Lainnya</option>
                  </select>
                </div>

                <div className="pop-form-group">
                  <label htmlFor="contact-message">
                    Deskripsi Pesan <span className="req">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows="4"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Tuliskan ide konsep, pertanyaan, atau rincian kebutuhan Anda..."
                    className={`pop-textarea ${formErrors.message ? 'error' : ''}`}
                  />
                  {formErrors.message && (
                    <span className="form-err-msg">{formErrors.message}</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary full-width form-submit-pop-btn"
                >
                  {isSubmitting
                    ? 'Membuka WhatsApp...'
                    : hasWhatsapp
                    ? 'Kirim Pesan ke WhatsApp ↗'
                    : 'Kirim Pesan'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
