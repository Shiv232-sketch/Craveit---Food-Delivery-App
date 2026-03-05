import React, { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Cart from './components/Cart';
import Home from './pages/Home';
import Menu from './pages/Menu';
import OrderTracking from './pages/OrderTracking';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';

export default function App() {
  const [page, setPage] = useState('home');
  const [orderData, setOrderData] = useState(null);

  const navigate = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (data) => {
    setOrderData(data);
    navigate('tracking');
  };

  // Auth pages get full screen (no navbar/footer)
  if (page === 'login')  return <AuthProvider><Login  navigate={navigate} /></AuthProvider>;
  if (page === 'signup') return <AuthProvider><Signup navigate={navigate} /></AuthProvider>;

  const renderPage = () => {
    switch (page) {
      case 'menu':     return <Menu />;
      case 'tracking': return <OrderTracking orderData={orderData} />;
      case 'about':    return <About />;
      default:         return <Home navigate={navigate} />;
    }
  };

  return (
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
  );
}


