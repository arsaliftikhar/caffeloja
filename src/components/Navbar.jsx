'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu as MenuIcon, X, LogIn, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { totalItems, setIsDrawerOpen } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track authentication status dynamically
  useEffect(() => {
    const checkAuthStatus = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('caffeloja_token');
        setIsLoggedIn(Boolean(token));
        try {
          const userStr = localStorage.getItem('caffeloja_user');
          const user = userStr ? JSON.parse(userStr) : null;
          setIsAdmin(user?.role === 'admin');
        } catch {
          setIsAdmin(false);
        }
      }
    };

    checkAuthStatus();

    // Listen for custom login/logout events & storage events
    window.addEventListener('caffeloja_auth_change', checkAuthStatus);
    window.addEventListener('storage', checkAuthStatus);

    return () => {
      window.removeEventListener('caffeloja_auth_change', checkAuthStatus);
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  // Navigation Menu
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Our Story', href: '/about' },
    { name: 'Product', href: '/menu' },
    { name: 'Earn An Income', href: '/earn-an-income' },
    { name: 'Contact', href: '/contact' },
  ];

  if (pathname?.startsWith('/user') || pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <header className={`navbar-root ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Pure Official Logo (No Background, No Text) */}
          <Link href="/" className="navbar-logo-link" onClick={() => setMobileMenuOpen(false)} aria-label="Caffeloja">
            <img
              src="/logo.png"
              alt="Caffeloja"
              className="brand-logo-only"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="navbar-links" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                >
                  {link.name}
                  {isActive && <span className="nav-indicator" />}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="navbar-actions">
            <Link
              href={isLoggedIn ? (isAdmin ? '/admin/dashboard' : '/user/dashboard') : '/login'}
              className="btn-reserve-nav"
              style={{
                borderColor: isAdmin ? 'rgba(245, 158, 11, 0.6)' : 'var(--amber-primary)',
                color: isAdmin ? '#fbbf24' : 'var(--amber-light)',
                background: isLoggedIn ? (isAdmin ? 'rgba(245, 158, 11, 0.16)' : 'rgba(230, 157, 69, 0.12)') : 'transparent',
              }}
            >
              {isLoggedIn ? (
                isAdmin ? (
                  <>
                    <ShieldCheck size={15} />
                    <span>Admin Portal</span>
                  </>
                ) : (
                  <>
                    <LayoutDashboard size={15} />
                    <span>Dashboard</span>
                  </>
                )
              ) : (
                <>
                  <LogIn size={15} />
                  <span>Login</span>
                </>
              )}
            </Link>

            <Link
              href="/checkout"
              id="cart-drawer-toggle"
              aria-label="Shopping Cart"
              className="cart-btn"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>

            {/* Mobile Hamburger */}
            <button
              id="mobile-nav-toggle"
              aria-label="Toggle navigation menu"
              className="mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="mobile-menu-overlay animate-fadeIn">
            <div className="mobile-menu-content">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`mobile-nav-link ${pathname === link.href ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="mobile-menu-divider" />
              <Link
                href={isLoggedIn ? (isAdmin ? '/admin/dashboard' : '/user/dashboard') : '/login'}
                className="btn-primary mobile-menu-reserve"
                onClick={() => setMobileMenuOpen(false)}
              >
                {isLoggedIn ? (
                  isAdmin ? (
                    <>
                      <ShieldCheck size={18} />
                      <span>Admin Executive Portal</span>
                    </>
                  ) : (
                    <>
                      <LayoutDashboard size={18} />
                      <span>Dashboard</span>
                    </>
                  )
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Login</span>
                  </>
                )}
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
