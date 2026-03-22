import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const OrderContext = createContext();

const API         = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:5000/api';
const STORAGE_KEY = 'craveit_orders';

const getToken      = () => localStorage.getItem('craveit_token');
const getAdminToken = () => localStorage.getItem('craveit_admin');

const loadOrders = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
};
const saveOrders = (orders) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

export function OrderProvider({ children }) {
  const [orders,  setOrders]  = useState(loadOrders);
  const [loading, setLoading] = useState(false);
  const lastFetchRef          = useRef(0); // track last fetch time

  // ── Smart sync — only fetch when needed ──────────
  const syncOrders = useCallback(async (force = false) => {
    const now       = Date.now();
    const timeSince = now - lastFetchRef.current;

    // Don't fetch if last fetch was less than 5 seconds ago (unless forced)
    if (!force && timeSince < 5000) return;

    const adminToken = getAdminToken();
    const userToken  = getToken();

    try {
      if (adminToken && adminToken !== 'demo_admin' && adminToken !== 'true') {
        const res  = await fetch(`${API}/orders`, {
          headers: { 'x-admin-token': adminToken }
        });
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        if (data.success && data.orders) {
          lastFetchRef.current = now;
          saveOrders(data.orders);
          setOrders(data.orders);
          return;
        }
      } else if (userToken && userToken !== 'demo_token') {
        const res  = await fetch(`${API}/orders/my`, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        if (data.success && data.orders) {
          lastFetchRef.current = now;
          const local  = loadOrders();
          const merged = [
            ...data.orders,
            ...local.filter(l => !data.orders.find(b => b._id === l._id || b.id === l.id))
          ];
          saveOrders(merged);
          setOrders(merged);
          return;
        }
      }
    } catch {}

    // Fallback — read localStorage only
    const latest = loadOrders();
    setOrders(prev => JSON.stringify(prev) !== JSON.stringify(latest) ? latest : prev);
  }, []);

  // ── Initial load ──────────────────────────────────
  useEffect(() => {
    syncOrders(true); // force fetch on mount
  }, []);

  // ── Poll every 8 seconds (not 2!) ─────────────────
  useEffect(() => {
    const interval = setInterval(() => syncOrders(), 8000);
    return () => clearInterval(interval);
  }, [syncOrders]);

  // ── Listen for localStorage changes (cross-tab) ───
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        const latest = loadOrders();
        setOrders(latest);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // ── Place order ───────────────────────────────────
  const placeOrder = useCallback(async (orderData) => {
    const token = getToken();

    const localOrder = {
      ...orderData,
      id:       'CRAVEIT-' + Date.now().toString().slice(-6),
      _id:      'CRAVEIT-' + Date.now().toString().slice(-6),
      status:   'placed',
      placedAt: new Date().toISOString(),
    };

    // Save to localStorage immediately
    const current = loadOrders();
    const updated = [localOrder, ...current];
    saveOrders(updated);
    setOrders(updated);

    // Also save to backend if logged in
    if (token && token !== 'demo_token') {
      try {
        const res  = await fetch(`${API}/orders`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body:    JSON.stringify(orderData),
        });
        const data = await res.json();
        if (data.success) {
          const backendOrder = { ...data.order, id: data.order._id };
          const refreshed    = loadOrders().map(o => o.id === localOrder.id ? backendOrder : o);
          saveOrders(refreshed);
          setOrders(refreshed);
          // Force sync after placing
          lastFetchRef.current = 0;
          setTimeout(() => syncOrders(true), 500);
          return backendOrder;
        }
      } catch (err) {
        console.log('Backend save failed, using local order');
      }
    }

    return localOrder;
  }, [syncOrders]);

  // ── Update order status (admin) ───────────────────
  const updateOrderStatus = useCallback(async (orderId, status) => {
    // Update locally first — instant UI response
    const current = loadOrders();
    const updated = current.map(o =>
      (o._id === orderId || o.id === orderId) ? { ...o, status } : o
    );
    saveOrders(updated);
    setOrders(updated);

    // Update backend
    const adminToken = getAdminToken();
    if (adminToken && adminToken !== 'demo_admin' && adminToken !== 'true') {
      try {
        await fetch(`${API}/orders/${orderId}/status`, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
          body:    JSON.stringify({ status }),
        });
        // Force sync after status update
        lastFetchRef.current = 0;
        setTimeout(() => syncOrders(true), 500);
      } catch {}
    }
  }, [syncOrders]);

  const getOrder = useCallback((orderId) => {
    return orders.find(o => o._id === orderId || o.id === orderId) || null;
  }, [orders]);

  const fetchMyOrders  = useCallback(() => syncOrders(true), [syncOrders]);
  const fetchAllOrders = useCallback(() => syncOrders(true), [syncOrders]);

  return (
    <OrderContext.Provider value={{
      orders, loading,
      placeOrder, updateOrderStatus, getOrder,
      fetchMyOrders, fetchAllOrders
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => useContext(OrderContext);