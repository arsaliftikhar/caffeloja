'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home, AlertCircle } from 'lucide-react';

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error('Next.js Page Error caught by ErrorBoundary:', error);

    const errorMessage = String(error?.message || '').toLowerCase();
    const isChunkOrNetworkError =
      errorMessage.includes('loading chunk') ||
      errorMessage.includes('failed to load chunk') ||
      errorMessage.includes('chunkloaderror') ||
      errorMessage.includes('dynamically imported module') ||
      errorMessage.includes('failed to fetch');

    // Auto-reload once if this is caused by a new Vercel deployment (chunk hash mismatch)
    if (isChunkOrNetworkError && typeof window !== 'undefined') {
      const reloadKey = 'caffeloja_chunk_reload_lock';
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();

      // If we haven't auto-reloaded in the last 15 seconds, trigger a hard reload to get latest deployment assets
      if (!lastReload || now - Number(lastReload) > 15000) {
        sessionStorage.setItem(reloadKey, String(now));
        window.location.reload();
      }
    }
  }, [error]);

  const handleReload = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('caffeloja_chunk_reload_lock');
      window.location.reload();
    } else {
      reset();
    }
  };

  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        background: 'var(--bg-primary, #0d0907)',
        color: '#f5ebe1',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          background: '#150e0a',
          border: '1px solid rgba(212, 163, 115, 0.25)',
          borderRadius: '20px',
          padding: '40px 28px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(230, 157, 69, 0.15)',
            border: '1px solid var(--amber-primary, #e69d45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: 'var(--amber-light, #fbbf24)',
          }}
        >
          <AlertCircle size={28} />
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-serif, serif)',
            fontSize: '1.6rem',
            margin: '0 0 10px',
            color: '#fff',
          }}
        >
          Fresh Update Available
        </h1>

        <p
          style={{
            fontSize: '0.92rem',
            color: 'var(--text-secondary, #a89a8c)',
            lineHeight: '1.6',
            margin: '0 0 26px',
          }}
        >
          A new version of Caffeloja was deployed. Click reload to refresh your browser and load the latest updates.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            onClick={handleReload}
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '12px 20px',
              fontSize: '0.92rem',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={16} />
            <span>Reload Page</span>
          </button>

          <Link
            href="/"
            className="btn-secondary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '12px 20px',
              fontSize: '0.92rem',
              textDecoration: 'none',
              boxSizing: 'border-box',
            }}
          >
            <Home size={16} />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
