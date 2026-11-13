'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Sliders,
  ShoppingBag,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authChecking, setAuthChecking] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  const checkAdminAuth = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('caffeloja_token') : null;
    if (!token) {
      router.replace('/login?redirect=/admin/dashboard');
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        if (data.user.role !== 'admin') {
          router.replace('/user/dashboard');
          return;
        }
        localStorage.setItem('caffeloja_user', JSON.stringify(data.user));
        setAdminUser(data.user);
        setAuthChecking(false);
      } else {
        localStorage.removeItem('caffeloja_token');
        localStorage.removeItem('caffeloja_user');
        router.replace('/login?redirect=/admin/dashboard');
      }
    } catch {
      try {
        const cached = JSON.parse(localStorage.getItem('caffeloja_user') || '{}');
        if (cached?.role === 'admin') {
          setAdminUser(cached);
          setAuthChecking(false);
          return;
        }
      } catch {}
      router.replace('/login?redirect=/admin/dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('caffeloja_token');
    localStorage.removeItem('caffeloja_user');
    window.dispatchEvent(new Event('caffeloja_auth_change'));
    router.replace('/login');
  };

  if (authChecking) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
        }}
      >
        <RefreshCw size={32} className="spin-icon" style={{ color: 'var(--amber-primary)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Verifying administrative credentials...</p>
      </div>
    );
  }

  const isDashboard = pathname === '/admin/dashboard' || pathname === '/admin';
  const isUsers = pathname?.startsWith('/admin/users');
  const isCommissions = pathname?.startsWith('/admin/commissions') || pathname?.startsWith('/admin/commission');
  const isOrders = pathname?.startsWith('/admin/orders');

  const getPageHeader = () => {
    if (isUsers) {
      return {
        title: 'Registered Users Directory',
        subtitle: 'Inspect and manage all platform accounts and verified subscriptions',
      };
    }
    if (isCommissions) {
      return {
        title: '4-Level Fixed Commission Rates ($/Box)',
        subtitle: 'Configure exact cash rewards distributed to upstream sponsors on coffee box sales',
      };
    }
    if (isOrders) {
      return {
        title: 'Dropship Orders & API Logs',
        subtitle: 'Inspect raw Stripe payment events and WooCommerce fulfillment responses',
      };
    }
    return {
      title: 'Executive Control Center',
      subtitle: 'Live overview of sales, subscriptions, revenue, and store operations',
    };
  };

  const pageHeader = getPageHeader();

  return (
    <div
      className="affiliate-dashboard-wrap"
      style={{
        paddingTop: '32px',
        minHeight: '100vh',
        paddingBottom: '80px',
        position: 'relative',
      }}
    >
      {/* Background with low opacity matching User Portal */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage:
            'url("https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1920&q=85")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.07,
          filter: 'blur(1px) saturate(0.85)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="affiliate-layout animate-fadeIn">
          {/* Responsive CSS for mobile sidebar & cards */}
          <style>{`
            .user-sidebar-toggle-btn {
              display: none;
              width: 40px;
              height: 40px;
              border-radius: 10px;
              background: #1c130e;
              border: 1px solid var(--mocha-border);
              color: var(--amber-light);
              align-items: center;
              justify-content: center;
              cursor: pointer;
              flex-shrink: 0;
            }
            .user-sidebar-close-btn {
              display: none;
              margin-left: auto;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.06);
              border: 1px solid var(--mocha-border);
              color: var(--text-secondary);
              align-items: center;
              justify-content: center;
              cursor: pointer;
              flex-shrink: 0;
            }
            .user-sidebar-backdrop {
              display: none;
            }
            .user-kpi-grid {
              display: grid;
              grid-template-columns: repeat(4, minmax(0, 1fr));
              gap: 16px;
              margin-bottom: 24px;
            }
            .user-kpi-card {
              background: #1a120d;
              border: 1px solid var(--mocha-border);
              border-radius: 14px;
              padding: 18px 16px;
              min-width: 0;
            }
            .user-cards-grid-2 {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 20px;
            }
            @media (max-width: 1024px) {
              .user-sidebar-toggle-btn {
                display: inline-flex !important;
              }
              .user-sidebar-close-btn {
                display: inline-flex !important;
              }
              .user-sidebar-backdrop.open {
                display: block !important;
                position: fixed;
                inset: 0;
                z-index: 1240;
                background: rgba(10, 7, 5, 0.78);
                backdrop-filter: blur(5px);
              }
              .affiliate-sidebar {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                bottom: 0 !important;
                width: 280px !important;
                max-width: 84vw !important;
                z-index: 1250 !important;
                border-radius: 0 20px 20px 0 !important;
                padding: 24px 18px !important;
                overflow-y: auto !important;
                transform: translateX(-105%);
                transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
              }
              .affiliate-sidebar.sidebar-open {
                transform: translateX(0) !important;
              }
              .affiliate-sidebar .affiliate-nav-menu {
                display: flex !important;
                flex-direction: column !important;
                gap: 6px !important;
              }
              .user-kpi-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                gap: 12px !important;
              }
              .user-cards-grid-2 {
                grid-template-columns: minmax(0, 1fr) !important;
              }
            }
            @media (max-width: 600px) {
              .affiliate-main-content {
                padding: 18px 14px !important;
                border-radius: 16px !important;
                min-height: auto !important;
              }
              .user-kpi-card {
                padding: 14px 12px !important;
              }
              .affiliate-top-bar {
                flex-direction: row !important;
                align-items: center !important;
                justify-content: space-between !important;
              }
            }
          `}</style>

          {/* Mobile Backdrop */}
          <div
            className={`user-sidebar-backdrop ${mobileSidebarOpen ? 'open' : ''}`}
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* LEFT SIDEBAR NAVIGATION */}
          <aside className={`affiliate-sidebar ${mobileSidebarOpen ? 'sidebar-open' : ''}`}>
            {/* Profile Card */}
            <div className="affiliate-profile-card">
              <div
                className="affiliate-avatar"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #b45309)',
                  color: '#0d0907',
                }}
              >
                {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <h3
                  style={{
                    fontSize: '0.98rem',
                    fontWeight: '700',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    color: 'var(--text-primary)',
                    margin: '0 0 4px',
                  }}
                >
                  {adminUser?.name || 'Admin'}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--amber-light)' }}>
                    Executive Access
                  </span>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.68rem',
                      fontWeight: '800',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(239, 68, 68, 0.25))',
                      border: '1px solid rgba(245, 158, 11, 0.6)',
                      color: '#fbbf24',
                    }}
                  >
                    ADMIN
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="user-sidebar-close-btn"
                onClick={() => setMobileSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <X size={16} />
              </button>
            </div>

            {/* Sidebar Navigation Menu */}
            <nav className="affiliate-nav-menu">
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileSidebarOpen(false)}
                className={`affiliate-nav-btn ${isDashboard ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <div className="affiliate-nav-btn-left">
                  <LayoutDashboard size={18} />
                  <span>Overview</span>
                </div>
                <ChevronRight size={14} style={{ opacity: isDashboard ? 1 : 0.4 }} />
              </Link>

              <Link
                href="/admin/users"
                onClick={() => setMobileSidebarOpen(false)}
                className={`affiliate-nav-btn ${isUsers ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <div className="affiliate-nav-btn-left">
                  <Users size={18} />
                  <span>Registered Users</span>
                </div>
                <ChevronRight size={14} style={{ opacity: isUsers ? 1 : 0.4 }} />
              </Link>

              <Link
                href="/admin/commissions"
                onClick={() => setMobileSidebarOpen(false)}
                className={`affiliate-nav-btn ${isCommissions ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <div className="affiliate-nav-btn-left">
                  <Sliders size={18} />
                  <span>Commission Rates</span>
                </div>
                <ChevronRight size={14} style={{ opacity: isCommissions ? 1 : 0.4 }} />
              </Link>

              <Link
                href="/admin/orders"
                onClick={() => setMobileSidebarOpen(false)}
                className={`affiliate-nav-btn ${isOrders ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <div className="affiliate-nav-btn-left">
                  <ShoppingBag size={18} />
                  <span>Orders & Logs</span>
                </div>
                <ChevronRight size={14} style={{ opacity: isOrders ? 1 : 0.4 }} />
              </Link>
            </nav>

            {/* Bottom Actions: Visit Store & Log Out */}
            <div
              style={{
                marginTop: 'auto',
                paddingTop: '14px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'grid',
                gap: '8px',
              }}
            >
              <Link
                href="/"
                className="btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem', textDecoration: 'none' }}
              >
                <span>Visit Store</span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn-outline btn-sm"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  borderColor: 'rgba(239, 68, 68, 0.35)',
                  color: '#f87171',
                  fontSize: '0.82rem',
                }}
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="affiliate-main-content">
            {/* Clean Top Header Bar */}
            <div className="affiliate-top-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <button
                  type="button"
                  className="user-sidebar-toggle-btn"
                  onClick={() => setMobileSidebarOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu size={20} />
                </button>
                <div>
                  <h1
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 'clamp(1.15rem, 2.5vw, 1.45rem)',
                      fontWeight: '700',
                      color: 'var(--text-primary)',
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {pageHeader.title}
                  </h1>
                  <p
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      margin: '2px 0 0',
                    }}
                  >
                    {pageHeader.subtitle}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'rgba(245, 158, 11, 0.16)',
                    border: '1px solid rgba(245, 158, 11, 0.5)',
                    color: '#fbbf24',
                    fontSize: '0.74rem',
                    fontWeight: '800',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    letterSpacing: '0.5px',
                  }}
                >
                  <ShieldCheck size={14} />
                  ADMIN
                </span>
              </div>
            </div>

            {/* Injected Page Content */}
            <div style={{ marginTop: '20px' }}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

