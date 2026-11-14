'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [contactInfo, setContactInfo] = useState({
    email: 'caffeloja77@gmail.com',
    phone: '(+1) 504 327 9670',
  });

  const [status, setStatus] = useState({ loading: false, success: false, message: '' });

  useEffect(() => {
    fetch('/api/contact')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setContactInfo({
            email: data.contactEmail || 'caffeloja77@gmail.com',
            phone: data.supportPhone || '(+1) 504 327 9670',
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in your name, email, and message before sending.');
      return;
    }
    setStatus({ loading: true, success: false, message: '' });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({
          loading: false,
          success: true,
          message: data.message || 'Thank you for reaching out. We will get back to you shortly.',
        });
        toast.success('Message sent successfully!');
        setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
      } else {
        const msg = data.message || 'Unable to send message. Please try again.';
        setStatus({
          loading: false,
          success: false,
          message: msg,
        });
        toast.error(msg);
      }
    } catch {
      const msg = 'Network error: Unable to connect to server. Please try again shortly.';
      setStatus({
        loading: false,
        success: false,
        message: msg,
      });
      toast.error(msg);
    }
  };

  return (
    <div style={{ paddingTop: '130px', paddingBottom: '90px', minHeight: '90vh', background: 'var(--bg-primary)', overflowX: 'hidden' }}>
      <style>{`
        .contact-split-grid {
          display: grid;
          grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
          gap: 36px;
          align-items: start;
        }
        .contact-card {
          background: #140e0a;
          border: 1px solid var(--mocha-border);
          border-radius: 20px;
          padding: 36px;
          min-width: 0;
          width: 100%;
        }
        .contact-card .form-grid-2 {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 14px;
        }
        .contact-card .form-field {
          min-width: 0;
          width: 100%;
        }
        .contact-card .form-field input,
        .contact-card .form-field textarea {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }
        @media (max-width: 820px) {
          .contact-split-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 24px !important;
          }
          .contact-card {
            padding: 26px 20px !important;
          }
        }
        @media (max-width: 600px) {
          .contact-card {
            padding: 22px 16px !important;
          }
          .contact-card .form-grid-2 {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
      `}</style>

      <div className="container" style={{ maxWidth: '940px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '580px', margin: '0 auto 50px' }}>
          <img
            src="https://caffeloja.com/wp-content/uploads/2018/04/title-separator.png"
            alt="separator"
            style={{ margin: '0 auto 14px', display: 'block' }}
          />
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 4vw, 2.7rem)',
              fontWeight: '700',
              lineHeight: '1.2',
              marginBottom: '12px',
            }}
          >
            Contact Us
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.02rem', lineHeight: '1.7' }}>
            Have a question about our Coffee Box or member program? Send us a note and we will get right back to you.
          </p>
        </div>

        <div className="contact-split-grid">
          {/* Left: Clean Contact Info */}
          <div className="contact-card">
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', marginBottom: '24px' }}>
              Get in Touch
            </h2>

            <div style={{ display: 'grid', gap: '22px' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '4px' }}>
                  Address
                </span>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.96rem', lineHeight: '1.6', margin: 0 }}>
                  6005 Marcie St<br />
                  Metairie, LA 70003, United States
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--mocha-border)', paddingTop: '18px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '4px' }}>
                  Email
                </span>
                <a
                  href={`mailto:${contactInfo.email}`}
                  style={{ color: 'var(--amber-light)', fontSize: '0.98rem', fontWeight: '600', textDecoration: 'none' }}
                >
                  {contactInfo.email}
                </a>
              </div>

              <div style={{ borderTop: '1px solid var(--mocha-border)', paddingTop: '18px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '4px' }}>
                  Phone
                </span>
                <a
                  href={`tel:${contactInfo.phone.replace(/[^+\d]/g, '')}`}
                  style={{ color: 'var(--text-primary)', fontSize: '0.98rem', fontWeight: '600', textDecoration: 'none' }}
                >
                  {contactInfo.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Right: Simple Message Form */}
          <div className="contact-card">
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', marginBottom: '20px' }}>
              Send a Message
            </h2>

            {status.success ? (
              <div className="animate-fadeIn" style={{ textAlign: 'center', padding: '24px 10px' }}>
                <CheckCircle2 size={38} style={{ color: 'var(--amber-light)', margin: '0 auto 14px' }} />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', marginBottom: '8px' }}>
                  Message Received
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', marginBottom: '24px', lineHeight: '1.6' }}>
                  {status.message}
                </p>
                <button
                  type="button"
                  onClick={() => setStatus({ loading: false, success: false, message: '' })}
                  className="btn-secondary btn-sm"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="checkout-form">
                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-field">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginTop: '12px' }}>
                  <div className="form-field">
                    <label>Phone (Optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-field">
                    <label>Subject</label>
                    <input
                      type="text"
                      name="subject"
                      placeholder="e.g. Order Inquiry / Subscription"
                      value={formData.subject}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-field" style={{ marginTop: '12px' }}>
                  <label>Message *</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Write your message here..."
                    value={formData.message}
                    onChange={handleInputChange}
                  />
                </div>

                {status.message && !status.success && (
                  <div style={{ color: '#ef4444', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={16} /> {status.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status.loading}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
                >
                  <span>{status.loading ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
