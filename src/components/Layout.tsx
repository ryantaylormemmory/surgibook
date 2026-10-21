import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import Footer from './Footer';
import ScreenLock from './ScreenLock';
import ToastContainer from './ToastContainer';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-6">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <ScreenLock />
      <ToastContainer />
    </div>
  );
}