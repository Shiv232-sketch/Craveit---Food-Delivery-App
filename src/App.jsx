import React, { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Cart from './components/Cart';
import Home from './pages/Home';
import Menu from './pages/Menu';
import OrderTracking from './pages/OrderTracking';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  const [page, setPage] = useState('home');
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem('craveit_admin'));

  const navigate = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (orderId) => {
    setActiveOrderId(orderId);
    navigate('tracking');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('craveit_admin');
    setIsAdmin(false);
    setPage('home');
  };

  if (page === 'admin') {
    if (!isAdmin) return <OrderProvider><AdminLogin onLogin={() => setIsAdmin(true)} /></OrderProvider>;
    return <OrderProvider><AdminPanel onLogout={handleAdminLogout} /></OrderProvider>;
  }

  if (page === 'login')  return <AuthProvider><Login  navigate={navigate} /></AuthProvider>;
  if (page === 'signup') return <AuthProvider><Signup navigate={navigate} /></AuthProvider>;

  const renderPage = () => {
    switch (page) {
      case 'menu':     return <Menu />;
      case 'tracking': return <OrderTracking activeOrderId={activeOrderId} />;
      case 'about':    return <About />;
      default:         return <Home navigate={navigate} />;
    }
  };

  return (
    <OrderProvider>
      <AuthProvider>
        <CartProvider>
          <div className="app">
            <Navbar navigate={navigate} activePage={page} />
            <Cart onOrderSuccess={handleOrderSuccess} />
            <main>{renderPage()}</main>
            <Footer navigate={navigate} />
          </div>
        </CartProvider>
      </AuthProvider>
    </OrderProvider>
  );
}
