import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Toast from './Toast';

/**
 * Shared layout wrapper — Navbar + page content + Footer.
 * Scrolls to top on every route change.
 */
export default function Layout() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (hash) {
      window.setTimeout(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 0);
      return;
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [hash, pathname]);

  return (
    <div className="min-h-screen flex flex-col text-stone-900">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toast />
    </div>
  );
}
