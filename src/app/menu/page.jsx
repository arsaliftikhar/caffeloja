'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Check, Minus, Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { initialProducts } from '@/data/coffeeData';

export default function MenuPage() {
  const [products, setProducts] = useState(initialProducts);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          setProducts(data.data);
        }
      } catch (e) {
        // Keep initialProducts fallback
      }
    };
    fetchProducts();
  }, []);

  const product = products[0] || initialProducts[0];

  return (
    <div className="menu-page-root" style={{ paddingTop: '120px', paddingBottom: '70px', minHeight: '90vh', overflowX: 'hidden' }}>
      <style>{`
        .product-showcase-card {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
          gap: 48px;
          align-items: center;
          background: #140e0a;
          border: 1px solid var(--mocha-border);
          border-radius: 20px;
          padding: 44px;
        }
        .product-showcase-img-box {
          background: #0d0907;
          border: 1px solid rgba(197, 157, 95, 0.14);
          border-radius: 16px;
          padding: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-width: 0;
        }
        .product-showcase-img {
          width: 100%;
          max-width: 320px;
          height: auto;
          object-fit: contain;
          display: block;
        }
        @media (max-width: 900px) {
          .product-showcase-card {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 24px !important;
            padding: 24px 18px !important;
          }
          .product-showcase-img-box {
            padding: 20px 14px !important;
          }
          .product-showcase-img {
            max-width: 220px !important;
          }
        }
        @media (max-width: 480px) {
          .product-showcase-card {
            padding: 18px 14px !important;
          }
          .product-showcase-img {
            max-width: 185px !important;
          }
        }
      `}</style>
      <div className="container" style={{ maxWidth: '980px' }}>
        <div className="product-showcase-card">
          {/* Product Image */}
          <div className="product-showcase-img-box">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="product-showcase-img"
            />
          </div>

          {/* Product Details */}
          <div style={{ minWidth: 0, width: '100%' }}>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 3.5vw, 2.6rem)',
                lineHeight: '1.2',
                marginBottom: '12px',
                fontWeight: '700',
              }}
            >
              {product.name}
            </h1>

            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2rem',
                fontWeight: '700',
                color: 'var(--amber-light)',
                marginBottom: '20px',
              }}
            >
              ${product.price.toFixed(2)}{' '}
              <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontWeight: '400' }}>
                USD
              </span>
            </div>

            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '1.02rem',
                lineHeight: '1.75',
                marginBottom: '24px',
              }}
            >
              Experience true freshly roasted coffee in an instant. Our gourmet single-serve pods are crafted from 100% organically grown Arabica beans and packaged fresh with zero artificial colors or preservatives.
            </p>

            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 32px 0',
                display: 'grid',
                gap: '10px',
              }}
            >
              {[
                '20 Single-Serve Gourmet Coffee Pods per Box',
                '100% Organically Grown Arabica Beans',
                'No Artificial Colors, Additives, or Preservatives',
                'Compatible with Standard Keurig K-Cup Brewers',
              ].map((item) => (
                <li
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                  }}
                >
                  <Check size={16} style={{ color: 'var(--amber-light)', flexShrink: 0 }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Quantity & Add to Cart */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: '#0d0907',
                  border: '1px solid var(--mocha-border)',
                  borderRadius: '9999px',
                  padding: '6px 12px',
                  gap: '14px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                  }}
                >
                  <Minus size={16} />
                </button>
                <span style={{ fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  addToCart(product, quantity, 'Coffee Box (20 Pods)');
                  router.push('/checkout');
                }}
                className="btn-primary"
                style={{ flex: '1', minWidth: '200px', justifyContent: 'center' }}
              >
                <ShoppingBag size={18} />
                <span>Add to Cart &mdash; ${(product.price * quantity).toFixed(2)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
