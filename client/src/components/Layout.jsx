import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Shared layout wrapper — Navbar + page content + Footer.
 * Used in the router as a layout route.
 */
export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col text-stone-900">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
