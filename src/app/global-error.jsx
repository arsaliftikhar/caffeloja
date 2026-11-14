'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Root Layout Global Error caught:', error);

    const errorMessage = String(error?.message || '').toLowerCase();
    const isChunkOrNetworkError =
      errorMessage.includes('loading chunk') ||
      errorMessage.includes('failed to load chunk') ||
      errorMessage.includes('chunkloaderror') ||
      errorMessage.includes('dynamically imported module') ||
      errorMessage.includes('failed to fetch');

    if (isChunkOrNetworkError && typeof window !== 'undefined') {
      const reloadKey = 'caffeloja_chunk_reload_lock';
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();

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
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: '#0d0907',
          color: '#f5ebe1',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '460px',
            width: '90%',
            textAlign: 'center',
            background: '#150e0a',
            border: '1px solid rgba(212, 163, 115, 0.3)',
            borderRadius: '20px',
            padding: '40px 24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(230, 157, 69, 0.15)',
              border: '1px solid #e69d45',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '24px',
            }}
          >
            ☕
          </div>

          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              margin: '0 0 10px',
              color: '#ffffff',
            }}
          >
            Fresh Update Ready
          </h1>

          <p
            style={{
              fontSize: '0.92rem',
              color: '#a89a8c',
              lineHeight: '1.6',
              margin: '0 0 24px',
            }}
          >
            A new version of Caffeloja was just published. Click below to refresh and load the latest updates.
          </p>

          <button
            onClick={handleReload}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #e69d45 0%, #b86e26 100%)',
              color: '#1a0f07',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(230, 157, 69, 0.35)',
            }}
          >
            Refresh Page
          </button>
        </div>
      </body>
    </html>
  );
}
