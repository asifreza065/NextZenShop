import { Outlet } from 'react-router';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
