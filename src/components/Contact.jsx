import React, { useState } from 'react';
import { portfolioData } from '../data/portfolioData';
import SocialLinks from './SocialLinks';
import './Contact.css';

export default function Contact() {
  const { personal, contact } = portfolioData;

  const [formData, setFormData] = useState({
    name: '',
    serviceType: 'Video Editing',
    message: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Nama lengkap wajib diisi.';
    if (!formData.message.trim()) {
      errors.message = 'Pesan wajib diisi.';
    }
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
    setIsSubmitting(true);

    // Format text for WhatsApp direct redirect
    const waText = encodeURIComponent(
      `Halo Refaldi! Nama saya ${formData.name}. Saya tertarik untuk berdiskusi mengenai ${formData.serviceType}.\n\nPesan: ${formData.message}`
    );
    const waUrl = `https://wa.me/6281378825542?text=${waText}`;

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      setFormData({
        name: '',
        serviceType: 'Video Editing',
        message: '',
      });
      setTimeout(() => setSubmitSuccess(false), 6000);
    }, 600);
  };

  return (
    <section id="contact" className="section pop-contact-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-badge">
            <span>{contact.badge}</span>
          </div>
          <h2 className="section-title">
            Mari Terhubung & <span className="section-title-cream">Berkolaborasi</span>
          </h2>
          <p className="section-subtitle">
            {contact.subtitle}
          </p>
        </div>

        {/* Contact Grid */}
        <div className="pop-contact-grid">
          {/* Left Column: Direct Contacts */}
          <div className="contact-info-col">
            <div className="pop-card contact-info-card">
              <h3 className="contact-card-title">Kontak Langsung</h3>
              <p className="contact-card-sub">
                Hubungi saya secara langsung melalui WhatsApp untuk respon cepat seputar proyek video editing, motion design, atau kolaborasi kreatif.
              </p>

              <div className="contact-pill-list">
                {/* WhatsApp Item */}
                <div className="contact-pill-item">
                  <div className="pill-text">
                    <span className="pill-label">WhatsApp / Telepon</span>
                    <span className="pill-value">{personal.whatsapp}</span>
                  </div>
                  <a
                    href="https://wa.me/6281378825542"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-pill-action wa-action"
                    title="Chat langsung di WhatsApp"
                  >
                    Chat WhatsApp
                  </a>
                </div>

                {/* Location Item */}
                <div className="contact-pill-item">
                  <div className="pill-text">
                    <span className="pill-label">Domisili</span>
                    <span className="pill-value">{personal.location}</span>
                  </div>
                </div>
              </div>

              {/* Social Media Links with Instagram Dropdown */}
              <div className="contact-social-section">
                <span className="social-sec-label">Media Sosial:</span>
                <div className="contact-social-pills-row">
                  <SocialLinks />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="contact-form-col">
            <div className="pop-card contact-form-card">
              <h3 className="contact-card-title">Kirimkan Pesan Instan</h3>
              <p className="contact-card-sub">
                Isi formulir singkat di bawah ini untuk langsung terhubung ke WhatsApp saya.
              </p>

              {submitSuccess && (
                <div className="pop-success-toast">
                  <div>
                    <strong>Pesan Disiapkan!</strong>
                    <p>Membuka chat WhatsApp untuk mengirimkan pesan Anda langsung ke Refaldi...</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="pop-contact-form">
                <div className="pop-form-group">
                  <label htmlFor="name">
                    Nama Lengkap <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Masukkan nama Anda..."
                    className={`pop-input ${formErrors.name ? 'error' : ''}`}
                  />
                  {formErrors.name && (
                    <span className="form-err-msg">{formErrors.name}</span>
                  )}
                </div>

                <div className="pop-form-group">
                  <label htmlFor="serviceType">Kategori Kebutuhan</label>
                  <select
                    id="serviceType"
                    value={formData.serviceType}
                    onChange={(e) =>
                      setFormData({ ...formData, serviceType: e.target.value })
                    }
                    className="pop-input"
                  >
                    <option value="Video Editing">Video Editing & Motion</option>
                    <option value="Desain Visual">Desain Grafis & Poster</option>
                    <option value="Branding Medsos">Branding & Konten Media Sosial</option>
                    <option value="Iklan & Merch">Video Iklan / Merchandise</option>
                    <option value="Lainnya">Diskusi / Proyek Lainnya</option>
                  </select>
                </div>

                <div className="pop-form-group">
                  <label htmlFor="message">
                    Deskripsi Pesan <span className="req">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows="4"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Tuliskan ide konsep video, durasi, atau pertanyaan Anda di sini..."
                    className={`pop-textarea ${formErrors.message ? 'error' : ''}`}
                  />
                  {formErrors.message && (
                    <span className="form-err-msg">{formErrors.message}</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-secondary full-width form-submit-pop-btn"
                >
                  {isSubmitting ? 'Membuka WhatsApp...' : 'Kirim Pesan ke WhatsApp'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
