import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isLoggedIn, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const activePage = location.pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const links = [
    { label: 'Home',        path: '/' },
    { label: 'Menu',        path: '/menu' },
    { label: 'Track Order', path: '/tracking' },
    { label: 'About',       path: '/about' },
  ];

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const go = (path) => { navigate(path); setMenuOpen(false); };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <div className="logo" onClick={() => go('/')}>
          <span className="logo-icon">🔥</span>
          <span className="logo-text">CraveIt</span>
        </div>

        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {links.map(l => (
            <li key={l.path}>
              <button
                className={`nav-link ${activePage === l.path ? 'active' : ''}`}
                onClick={() => go(l.path)}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
            🛒 Cart {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>

          {isLoggedIn ? (
            <div className="user-menu-wrap" ref={userMenuRef}>
              <button className="user-avatar-btn" onClick={() => setUserMenuOpen(o => !o)}>
                <span className="user-initials">{initials}</span>
                <span className="user-name-nav">{user.name.split(' ')[0]}</span>
                <span className="user-caret">{userMenuOpen ? '▲' : '▼'}</span>
              </button>
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <div className="user-dropdown-avatar">{initials}</div>
                    <div>
                      <p className="user-dropdown-name">{user.name}</p>
                      <p className="user-dropdown-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="user-dropdown-divider" />
                  <button className="user-dropdown-item" onClick={() => { go('/orders'); setUserMenuOpen(false); }}>📦 My Orders</button>
                  <button className="user-dropdown-item" onClick={() => { go('/menu'); setUserMenuOpen(false); }}>🍔 Browse Menu</button>
                  <div className="user-dropdown-divider" />
                  <button className="user-dropdown-item logout" onClick={handleLogout}>🚪 Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-nav-btns">
              <button className="nav-login-btn"  onClick={() => go('/login')}>Sign In</button>
              <button className="nav-signup-btn" onClick={() => go('/signup')}>Sign Up</button>
            </div>
          )}

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </nav>
  );
}
