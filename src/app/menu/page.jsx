'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import CoffeeCard from '@/components/CoffeeCard';
import { initialProducts } from '@/data/coffeeData';

export default function MenuPage() {
  const [products, setProducts] = useState(initialProducts);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        setProducts(data.data);
      } else {
        setProducts(initialProducts);
      }
    } catch (e) {
      setProducts(initialProducts);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="menu-page-root" style={{ paddingTop: '135px', paddingBottom: '80px', minHeight: '90vh' }}>
      <div className="container">
        {/* Page Header */}
        <div className="section-header" style={{ marginBottom: '45px' }}>
          <span className="section-tag">Flagship Product</span>
          <h1 className="section-title">Coffee Box (60 Pods)</h1>
          <p className="section-desc">
            60 premium single-serve artisan coffee pods roasted to perfection. Compatible with all Keurig K-Cup brewers with direct door dropshipping.
          </p>
        </div>

        {/* Product Showcase */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
            <RefreshCw size={32} className="spin-icon text-amber" style={{ margin: '0 auto 16px' }} />
            <p>Loading flagship coffee collection...</p>
          </div>
        ) : (
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            {products.map((product) => (
              <CoffeeCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
