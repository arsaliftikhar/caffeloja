import './globals.css';
import { Suspense } from 'react';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import ReferralTracker from '@/components/ReferralTracker';

export const metadata = {
  title: 'Caffè Loja | Artisan Coffee Roasters & 4-Level MLM Network',
  description:
    'Experience rare single-origin coffees, small-batch roasted blends, Portuguese delicacies, and our 4-Level MLM affiliate program. Direct dropshipping via oldchicagocoffee.com.',
  keywords: [
    'Specialty Coffee Lisbon',
    'Artisan Coffee Roasters',
    'Coffee MLM 4 Levels',
    'Dropshipping Coffee oldchicagocoffee',
    'Single Origin Beans',
    'Caffè Loja',
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
        <CartProvider>
          <Navbar />
          <Suspense fallback={null}>
            <ReferralTracker />
          </Suspense>
          <main>{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
