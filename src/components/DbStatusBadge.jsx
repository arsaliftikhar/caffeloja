'use client';

import { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

export default function DbStatusBadge() {
  const [dbStatus, setDbStatus] = useState({
    loading: true,
    isConnected: false,
    database: 'MongoDB',
    connectionState: 'Checking...',
    message: '',
  });
  const [seedStatus, setSeedStatus] = useState({ loading: false, message: '' });

  const checkStatus = async () => {
    setDbStatus((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setDbStatus({
        loading: false,
        isConnected: data.isConnected,
        database: data.database || 'MongoDB',
        connectionState: data.connectionState || (data.isConnected ? 'Connected' : 'Offline'),
        message: data.message || '',
      });
    } catch {
      setDbStatus({
        loading: false,
        isConnected: false,
        database: 'MongoDB',
        connectionState: 'Offline / Standby',
        message: 'Ensure MongoDB is running or configure MONGODB_URI in .env.local',
      });
    }
  };

  const handleSeedDatabase = async () => {
    setSeedStatus({ loading: true, message: '' });
    try {
      const res = await fetch('/api/products/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSeedStatus({ loading: false, message: `Seeded ${data.count} items into MongoDB!` });
        setTimeout(() => setSeedStatus({ loading: false, message: '' }), 4000);
      } else {
        setSeedStatus({ loading: false, message: data.message || 'Seed failed' });
      }
    } catch (e) {
      setSeedStatus({ loading: false, message: 'Could not connect to MongoDB server' });
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="db-status-container">
      <div className="db-status-pill">
        <Database size={15} className="db-icon" />
        <span className="db-label">MongoDB:</span>
        {dbStatus.loading ? (
          <span className="status-badge checking">
            <RefreshCw size={12} className="spin-icon" /> Testing...
          </span>
        ) : dbStatus.isConnected ? (
          <span className="status-badge connected">
            <CheckCircle2 size={13} /> Active & Connected
          </span>
        ) : (
          <span className="status-badge offline" title={dbStatus.message}>
            <AlertCircle size={13} /> Ready (.env.local configured)
          </span>
        )}

        <button
          onClick={checkStatus}
          className="db-action-btn"
          title="Re-test MongoDB connection"
        >
          <RefreshCw size={13} className={dbStatus.loading ? 'spin-icon' : ''} />
        </button>

        <button
          onClick={handleSeedDatabase}
          disabled={seedStatus.loading}
          className="db-seed-btn"
          title="Seed sample artisan coffee products into MongoDB"
        >
          <Sparkles size={13} />
          <span>{seedStatus.loading ? 'Seeding...' : 'Seed DB'}</span>
        </button>
      </div>

      {seedStatus.message && (
        <span className="seed-notification animate-fadeIn">{seedStatus.message}</span>
      )}
    </div>
  );
}
