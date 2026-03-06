import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

// ── Admin area — has its own layout (no Navbar/Footer) ──
function AdminArea() {
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem('craveit_admin'));

  const handleLogout = () => {
    localStorage.removeItem('craveit_admin');
    setIsAdmin(false);
  };

  return (
    <OrderProvider>
      {isAdmin
        ? <AdminPanel onLogout={handleLogout} />
        : <AdminLogin onLogin={() => setIsAdmin(true)} />}
    </OrderProvider>
  );
}

// ── Main site — shared Navbar + Footer ──
function MainSite() {
  const [activeOrderId, setActiveOrderId] = useState(null);

  return (
    <OrderProvider>
      <AuthProvider>
        <CartProvider>
          <div className="app">
            <Navbar />
            <Cart onOrderSuccess={(id) => setActiveOrderId(id)} />
            <main>
              <Routes>
                <Route path="/"         element={<Home />} />
                <Route path="/menu"     element={<Menu />} />
                <Route path="/tracking" element={<OrderTracking activeOrderId={activeOrderId} />} />
                <Route path="/about"    element={<About />} />
                <Route path="/login"    element={<Login />} />
                <Route path="/signup"   element={<Signup />} />
                <Route path="*"         element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </OrderProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminArea />} />
      <Route path="/*"     element={<MainSite />} />
    </Routes>
  );
}
