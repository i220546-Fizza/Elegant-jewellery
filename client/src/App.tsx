import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { Spinner } from './components/ui/Feedback';
import Home from './pages/Home';

// Every page beyond the home page is code-split so first load stays light.
const Collections = lazy(() => import('./pages/Collections'));
const Fragrances = lazy(() => import('./pages/Fragrances'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderPage = lazy(() => import('./pages/OrderPage'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const OurStory = lazy(() => import('./pages/OurStory'));
const Contact = lazy(() => import('./pages/Contact'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AccountLayout = lazy(() => import('./pages/account/AccountLayout'));
const Profile = lazy(() => import('./pages/account/Profile'));
const Orders = lazy(() => import('./pages/account/Orders'));
const OrderDetail = lazy(() => import('./pages/account/OrderDetail'));
const AccountWishlist = lazy(() => import('./pages/account/AccountWishlist'));
const Addresses = lazy(() => import('./pages/account/Addresses'));
const Security = lazy(() => import('./pages/account/Security'));
const FAQ = lazy(() => import('./pages/info/InfoPage').then((m) => ({ default: m.FAQ })));
const Shipping = lazy(() => import('./pages/info/InfoPage').then((m) => ({ default: m.Shipping })));
const Returns = lazy(() => import('./pages/info/InfoPage').then((m) => ({ default: m.Returns })));
const Privacy = lazy(() => import('./pages/info/InfoPage').then((m) => ({ default: m.Privacy })));
const Terms = lazy(() => import('./pages/info/InfoPage').then((m) => ({ default: m.Terms })));

const AdminApp = lazy(() => import('./admin/AdminApp'));
const StudioRender = lazy(() => import('./pages/StudioRender'));

const PageFallback = () => (
  <div className="min-h-[70vh] pt-32">
    <Spinner />
  </div>
);

function App() {
  return (
    <>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {import.meta.env.DEV && <Route path="/__studio" element={<StudioRender />} />}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute adminOnly>
                <AdminApp />
              </ProtectedRoute>
            }
          />
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/fragrances" element={<Fragrances />} />
            <Route path="/fragrance/:slug" element={<ProductPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:id" element={<OrderPage />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/our-story" element={<OurStory />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <AccountLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Profile />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="wishlist" element={<AccountWishlist />} />
              <Route path="addresses" element={<Addresses />} />
              <Route path="security" element={<Security />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3200,
          style: { background: '#0D0E10', color: '#F8F7F3', borderRadius: 0, fontFamily: 'Jost, sans-serif', fontSize: '13px', fontWeight: 300, letterSpacing: '0.02em', padding: '14px 18px' },
          success: { iconTheme: { primary: '#C9B27C', secondary: '#0D0E10' } },
          error: { iconTheme: { primary: '#F8F7F3', secondary: '#0D0E10' } },
        }}
      />
    </>
  );
}

export default App;
