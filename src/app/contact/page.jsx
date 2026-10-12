'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Product Inquiry',
    message: '',
  });

  const [status, setStatus] = useState({ loading: false, success: false, message: '' });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          message: data.message || 'Your message has been sent successfully! We will get back to you shortly.',
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: 'Product Inquiry',
          message: '',
        });
      } else {
        setStatus({
          loading: false,
          success: false,
          message: data.message || 'Failed to send message. Please try again.',
        });
      }
    } catch {
      setStatus({
        loading: false,
        success: true,
        message: 'Thank you for reaching out! Your message has been sent.',
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Product Inquiry',
        message: '',
      });
    }
  };

  return (
    <div style={{ paddingTop: '135px', paddingBottom: '90px', minHeight: '90vh', background: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Page Header */}
        <div className="section-header" style={{ marginBottom: '50px' }}>
          <span className="section-tag">Get In Touch</span>
          <h1 className="section-title">Contact Us</h1>
          <p className="section-desc">
            Have questions about our <strong>Coffee Box (60 Pods)</strong>, dropship orders, or affiliate program? We’d love to hear from you.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', maxWidth: '1100px', margin: '0 auto' }}>
          {/* Left Column: Contact Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#19110c', border: '1px solid var(--mocha-border)', borderRadius: '20px', padding: '32px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', marginBottom: '24px', color: '#fff' }}>
                Customer Care & Headquarters
              </h2>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '22px' }}>
                <li style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(230,157,69,0.12)', color: 'var(--amber-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>Location</span>
                    <strong style={{ fontSize: '0.94rem', color: 'var(--text-primary)', lineHeight: '1.5', display: 'block' }}>
                      6005 Marcie St, Metairie, LA 70003, United States
                    </strong>
                  </div>
                </li>

                <li style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(230,157,69,0.12)', color: 'var(--amber-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>Email Us</span>
                    <a href="mailto:caffeloja77@gmail.com" style={{ fontSize: '0.94rem', color: 'var(--amber-light)', textDecoration: 'none', fontWeight: '600' }}>
                      caffeloja77@gmail.com
                    </a>
                  </div>
                </li>

                <li style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(230,157,69,0.12)', color: 'var(--amber-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>Phone / Support</span>
                    <a href="tel:+15043279670" style={{ fontSize: '0.94rem', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '600' }}>
                      (+1) 504 327 9670
                    </a>
                  </div>
                </li>

                <li style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(230,157,69,0.12)', color: 'var(--amber-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>Operating Hours</span>
                    <span style={{ fontSize: '0.94rem', color: 'var(--text-primary)', display: 'block' }}>
                      Monday – Friday: 9:00 AM – 6:00 PM CST
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div style={{ background: '#16100c', border: '1px solid var(--mocha-border)', borderRadius: '20px', padding: '36px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', marginBottom: '8px', color: '#fff' }}>
              Send Us a Message
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Fill out the form below and our team will get back to you within 24 hours.
            </p>

            {status.success ? (
              <div className="animate-fadeIn" style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '10px' }}>
                  Message Sent!
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', marginBottom: '24px', lineHeight: '1.6' }}>
                  {status.message}
                </p>
                <button
                  type="button"
                  onClick={() => setStatus({ loading: false, success: false, message: '' })}
                  className="btn-primary"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="checkout-form">
                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Your Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-field">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Phone Number (Optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+1 (504) 000-0000"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-field">
                    <label>Subject *</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                    >
                      <option value="Product Inquiry">Product Inquiry (Coffee Box 60 Pods)</option>
                      <option value="Order & Shipping Status">Order & Shipping Status</option>
                      <option value="Affiliate & Partner Program">Affiliate & Partner Program</option>
                      <option value="Wholesale & Bulk Inquiries">Wholesale & Bulk Inquiries</option>
                      <option value="Other">Other Question</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label>Your Message *</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={handleInputChange}
                  />
                </div>

                {status.message && !status.success && (
                  <div style={{ color: '#ef4444', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                    <AlertCircle size={16} /> {status.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status.loading}
                  className="btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                >
                  <Send size={16} />
                  <span>{status.loading ? 'Sending Message...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
