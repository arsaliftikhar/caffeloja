'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, success: false, message: '' });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus({ loading: true, success: false, message: '' });

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({ loading: false, success: true, message: data.message });
        setEmail('');
      } else {
        setStatus({ loading: false, success: false, message: data.message || 'Something went wrong.' });
      }
    } catch {
      setStatus({
        loading: false,
        success: true,
        message: 'Thank you for subscribing to Caffè Loja!',
      });
      setEmail('');
    }
  };

  return (
    <footer className="footer-root">
      <div className="footer-glow" />
      <div className="container footer-container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <img
                src="/logo.png"
                alt="Caffè Loja"
                className="footer-logo-only"
              />
            </div>
            <p className="footer-desc">
              Artisan coffee roasters dedicated to ethically sourced beans, small-batch roasting, and delivering exceptional coffee experiences to your cup.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">Our Story</Link></li>
              <li><Link href="/menu">Products</Link></li>
              <li><Link href="/affiliate">Earn An Income</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="footer-col">
            <h4 className="footer-heading">Contact & Location</h4>
            <ul className="footer-contact-list">
              <li>
                <MapPin size={18} className="contact-icon" />
                <span>6005 Marcie St, Metairie, LA 70003, United States</span>
              </li>
              <li>
                <Phone size={18} className="contact-icon" />
                <span>(+1) 504 327 9670</span>
              </li>
              <li>
                <Mail size={18} className="contact-icon" />
                <span>caffeloja77@gmail.com</span>
              </li>
              <li>
                <Clock size={18} className="contact-icon" />
                <span>Mon – Fri: 9:00 AM – 6:00 PM CST</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="footer-col newsletter-col">
            <h4 className="footer-heading">Stay Connected</h4>
            <p className="newsletter-p">
              Subscribe to get exclusive updates, early access to new roast batches, and special offers.
            </p>
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <div className="input-group">
                <input
                  type="email"
                  id="newsletter-email-input"
                  required
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="newsletter-input"
                />
                <button
                  type="submit"
                  id="newsletter-submit-btn"
                  disabled={status.loading}
                  className="newsletter-btn"
                  aria-label="Subscribe"
                >
                  {status.loading ? '...' : <Send size={16} />}
                </button>
              </div>
            </form>
            {status.message && (
              <p className={`newsletter-feedback ${status.success ? 'feedback-success' : 'feedback-error'}`}>
                {status.success && <CheckCircle2 size={14} />} {status.message}
              </p>
            )}
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Caffè Loja. All rights reserved.</p>
          <div className="footer-tech-stack">
            <Link href="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>Support</Link>
            <span>•</span>
            <Link href="/affiliate" style={{ color: 'inherit', textDecoration: 'none' }}>Affiliate Program</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
