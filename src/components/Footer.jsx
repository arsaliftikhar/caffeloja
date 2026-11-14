'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, success: false, message: '' });

  // Hide public store footer inside user and admin dashboards
  if (pathname?.startsWith('/user') || pathname?.startsWith('/admin')) {
    return null;
  }
  const [contactInfo, setContactInfo] = useState({
    email: 'caffeloja77@gmail.com',
    phone: '(+1) 504 327 9670',
  });

  const loadContactInfo = () => {
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
  };

  useEffect(() => {
    loadContactInfo();
    window.addEventListener('caffeloja_settings_updated', loadContactInfo);
    return () => {
      window.removeEventListener('caffeloja_settings_updated', loadContactInfo);
    };
  }, []);

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
        message: 'Thank you for subscribing to Caffeloja!',
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
                alt="Caffeloja"
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
              <li><Link href="/earn-an-income">Earn An Income</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/terms-and-conditions">Terms and Conditions</Link></li>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
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
                <a
                  href={`tel:${contactInfo.phone.replace(/[^+\d]/g, '')}`}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {contactInfo.phone}
                </a>
              </li>
              <li>
                <Mail size={18} className="contact-icon" />
                <a
                  href={`mailto:${contactInfo.email}`}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {contactInfo.email}
                </a>
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
          <p>© {new Date().getFullYear()} Caffeloja. All rights reserved.</p>
          <div className="footer-tech-stack">
            <Link href="/terms-and-conditions" style={{ color: 'inherit', textDecoration: 'none' }}>Terms and Conditions</Link>
            <span>•</span>
            <Link href="/privacy-policy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link>
            <span>•</span>
            <Link href="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Affiliate Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
