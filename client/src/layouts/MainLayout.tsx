import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';

const MainLayout = () => (
  <div className="flex min-h-screen flex-col bg-ivory">
    <ScrollToTop />
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: '#3B2C1F',
          color: '#FBF6EE',
          fontSize: '13px',
          borderRadius: '999px',
          padding: '10px 18px',
        },
        success: { iconTheme: { primary: '#C9A86A', secondary: '#3B2C1F' } },
      }}
    />
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default MainLayout;
