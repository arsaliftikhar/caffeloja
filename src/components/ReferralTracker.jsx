'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Users, CheckCircle2, X } from 'lucide-react';

export default function ReferralTracker() {
  const searchParams = useSearchParams();
  const [activeReferral, setActiveReferral] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const refCode = searchParams?.get('ref');
    if (refCode) {
      const cleanCode = refCode.toUpperCase().trim();
      localStorage.setItem('caffeloja_ref', cleanCode);
      document.cookie = `caffeloja_ref=${cleanCode}; path=/; max-age=2592000`; // 30 days
      setActiveReferral(cleanCode);
      setShowBanner(true);
    } else {
      const stored = localStorage.getItem('caffeloja_ref');
      if (stored) {
        setActiveReferral(stored);
      }
    }
  }, [searchParams]);

  if (!showBanner || !activeReferral) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 1500,
        background: 'rgba(26, 18, 13, 0.95)',
        border: '1px solid var(--amber-primary)',
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backdropFilter: 'blur(10px)',
      }}
      className="animate-fadeIn"
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'rgba(230, 157, 69, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--amber-light)',
        }}
      >
        <Users size={16} />
      </div>
      <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Referred by Partner</div>
        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--amber-light)' }}>
          {activeReferral}
        </div>
      </div>
      <button
        onClick={() => setShowBanner(false)}
        style={{ color: 'var(--text-muted)', marginLeft: '8px', padding: '4px' }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
