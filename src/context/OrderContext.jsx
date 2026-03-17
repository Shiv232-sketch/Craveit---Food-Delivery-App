import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const OrderContext = createContext();

const API        = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:5000/api';
const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getToken      = () => localStorage.getItem('craveit_token');
const getAdminToken = () => localStorage.getItem('craveit_admin');

export function OrderProvider({ children }) {
  const [orders, setOrders]   = useState([]);
  const [socket, setSocket]   = useState(null);
  const [loading, setLoading] = useState(false);

  // ── Socket.io connection ──────────────────────────
  useEffect(() => {
    const newSocket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    newSocket.on('connect', () => {
      if (getAdminToken()) newSocket.emit('joinAdmin');
    });

    // Real-time status update from admin → user sees it instantly
    newSocket.on('orderStatusUpdate', ({ orderId, status }) => {
      setOrders(prev =>
        prev.map(o => (o._id === orderId || o.id === orderId) ? { ...o, status } : o)
      );
    });

    // New order placed → refresh admin orders
    newSocket.on('newOrder', () => {
      if (getAdminToken()) fetchAllOrders();
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  // ── Fetch user orders ─────────────────────────────
  const fetchMyOrders = useCallback(async () => {
    const token = getToken();
    if (!token || token === 'demo_token') {
      try {
        const saved = localStorage.getItem('craveit_orders');
        if (saved) setOrders(JSON.parse(saved));
      } catch {}
      return;
    }
    try {
      setLoading(true);
      const res  = await fetch(`${API}/orders/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch {
      try {
        const saved = localStorage.getItem('craveit_orders');
        if (saved) setOrders(JSON.parse(saved));
      } catch {}
    } finally { setLoading(false); }
  }, []);

  // ── Fetch all orders (admin) ──────────────────────
  const fetchAllOrders = useCallback(async () => {
    const adminToken = getAdminToken();
    if (!adminToken) return;
    try {
      setLoading(true);
      const res  = await fetch(`${API}/orders`, {
        headers: { 'x-admin-token': adminToken }
      });
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch {
      try {
        const saved = localStorage.getItem('craveit_orders');
        if (saved) setOrders(JSON.parse(saved));
      } catch {}
    } finally { setLoading(false); }
  }, []);

  // ── Load on mount ─────────────────────────────────
  useEffect(() => {
    if (getAdminToken()) { fetchAllOrders(); }
    else { fetchMyOrders(); }
  }, []);

  // ── Poll every 4 seconds as backup (in case socket misses) ──
  useEffect(() => {
    const interval = setInterval(() => {
      if (getAdminToken()) fetchAllOrders();
      else fetchMyOrders();
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchMyOrders, fetchAllOrders]);

  // ── Place order ───────────────────────────────────
  const placeOrder = useCallback(async (orderData) => {
    const token = getToken();

    // Demo mode fallback
    if (!token || token === 'demo_token') {
      const newOrder = {
        ...orderData,
        id: 'CRAVEIT-' + Date.now().toString().slice(-6),
        _id: 'CRAVEIT-' + Date.now().toString().slice(-6),
        status: 'placed',
        placedAt: new Date().toISOString(),
      };
      setOrders(prev => {
        const updated = [newOrder, ...prev];
        localStorage.setItem('craveit_orders', JSON.stringify(updated));
        return updated;
      });
      return newOrder;
    }

    // Real backend
    try {
      const res  = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (data.success) {
        const newOrder = data.order;
        if (socket) socket.emit('joinOrder', newOrder._id);
        setOrders(prev => [newOrder, ...prev]);
        return newOrder;
      }
      throw new Error(data.message);
    } catch {
      // Backend offline fallback
      const newOrder = {
        ...orderData,
        id: 'CRAVEIT-' + Date.now().toString().slice(-6),
        _id: 'CRAVEIT-' + Date.now().toString().slice(-6),
        status: 'placed',
        placedAt: new Date().toISOString(),
      };
      setOrders(prev => {
        const updated = [newOrder, ...prev];
        localStorage.setItem('craveit_orders', JSON.stringify(updated));
        return updated;
      });
      return newOrder;
    }
  }, [socket]);

  // ── Update order status (admin) ───────────────────
  const updateOrderStatus = useCallback(async (orderId, status) => {
    const adminToken = getAdminToken();

    // No admin token — localStorage fallback
    if (!adminToken) {
      setOrders(prev => {
        const updated = prev.map(o =>
          (o._id === orderId || o.id === orderId) ? { ...o, status } : o
        );
        localStorage.setItem('craveit_orders', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    try {
      const res  = await fetch(`${API}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev =>
          prev.map(o => (o._id === orderId || o.id === orderId) ? { ...o, status } : o)
        );
      }
    } catch {
      setOrders(prev => {
        const updated = prev.map(o =>
          (o._id === orderId || o.id === orderId) ? { ...o, status } : o
        );
        localStorage.setItem('craveit_orders', JSON.stringify(updated));
        return updated;
      });
    }
  }, []);

  // ── Get single order ──────────────────────────────
  const getOrder = useCallback((orderId) => {
    return orders.find(o => o._id === orderId || o.id === orderId) || null;
  }, [orders]);

  return (
    <OrderContext.Provider value={{
      orders, loading, socket,
      placeOrder, updateOrderStatus, getOrder,
      fetchMyOrders, fetchAllOrders
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => useContext(OrderContext);
