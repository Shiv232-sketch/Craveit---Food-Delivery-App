import React, { useState } from 'react';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Cart from './components/Cart';
import Home from './pages/Home';
import Menu from './pages/Menu';
import OrderTracking from './pages/OrderTracking';
import About from './pages/About';

export default function App() {
  const [page, setPage] = useState('home');

  const navigate = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (page) {
      case 'menu':        return <Menu />;
      case 'tracking':    return <OrderTracking />;
      case 'about':       return <About />;
      default:            return <Home navigate={navigate} />;
    }
  };

  return (
    <CartProvider>
      <div className="app">
        <Navbar navigate={navigate} activePage={page} />
        <Cart />
        <main>{renderPage()}</main>
        <Footer navigate={navigate} />
      </div>
    </CartProvider>
  );
}
