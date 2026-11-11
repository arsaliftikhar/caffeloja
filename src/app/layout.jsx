import './globals.css';
import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ReferralTracker from '@/components/ReferralTracker';
import CookieConsent from '@/components/CookieConsent';

export const metadata = {
  title: 'Caffeloja | Artisan Coffee Roasters & 4-Level MLM Network',
  description:
    'Experience rare single-origin coffees, small-batch roasted blends, Portuguese delicacies, and our 4-Level MLM affiliate program. Direct dropshipping via oldchicagocoffee.com.',
  keywords: [
    'Specialty Coffee Lisbon',
    'Artisan Coffee Roasters',
    'Coffee MLM 4 Levels',
    'Dropshipping Coffee oldchicagocoffee',
    'Single Origin Beans',
    'Caffeloja',
  ],
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#18110c',
              color: '#f5ebe1',
              border: '1px solid rgba(200, 125, 40, 0.35)',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '0.88rem',
              boxShadow: '0 14px 34px rgba(0, 0, 0, 0.55)',
            },
            success: {
              iconTheme: {
                primary: '#e69d45',
                secondary: '#140e0a',
              },
            },
            error: {
              iconTheme: {
                primary: '#f87171',
                secondary: '#140e0a',
              },
            },
          }}
        />
        <CartProvider>
          <Navbar />
          <Suspense fallback={null}>
            <ReferralTracker />
          </Suspense>
          <main>{children}</main>
          <Footer />
          <CookieConsent />
        </CartProvider>
      </body>
    </html>
  );
}
