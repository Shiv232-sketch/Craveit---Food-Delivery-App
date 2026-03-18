import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const OrderContext = createContext();

const API        = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:5000/api';
const STORAGE_KEY = 'craveit_orders';

const getToken      = () => localStorage.getItem('craveit_token');
const getAdminToken = () => localStorage.getItem('craveit_admin');

// ── localStorage helpers ──────────────────────────
const loadOrders  = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
};
const saveOrders  = (orders) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(loadOrders);
  const [loading, setLoading] = useState(false);

  // ── Sync with backend & localStorage every 2 seconds ──
  useEffect(() => {
    const sync = async () => {
      const adminToken = getAdminToken();
      const userToken  = getToken();

      // Try backend sync
      try {
        if (adminToken && adminToken !== 'demo_admin' && adminToken !== 'true') {
          const res  = await fetch(`${API}/orders`, {
            headers: { 'x-admin-token': adminToken }
          });
          const data = await res.json();
          if (data.success && data.orders) {
            // Merge backend orders into localStorage
            const backendOrders = data.orders;
            saveOrders(backendOrders);
            setOrders(backendOrders);
            return;
          }
        } else if (userToken && userToken !== 'demo_token') {
          const res  = await fetch(`${API}/orders/my`, {
            headers: { Authorization: `Bearer ${userToken}` }
          });
          const data = await res.json();
          if (data.success && data.orders) {
            // Merge — keep any local orders not yet on backend
            const local   = loadOrders();
            const backend = data.orders;
            const merged  = [
              ...backend,
              ...local.filter(l => l.id && !backend.find(b => b._id === l._id || b.id === l.id))
            ];
            saveOrders(merged);
            setOrders(merged);
            return;
          }
        }
      } catch {}

      // Fallback — just read localStorage
      const latest = loadOrders();
      setOrders(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(latest)) return latest;
        return prev;
      });
    };

    sync(); // run immediately
    const interval = setInterval(sync, 2000);
    return () => clearInterval(interval);
  }, []);

  // ── Place new order ───────────────────────────────
  const placeOrder = useCallback(async (orderData) => {
    const token = getToken();

    // Build local order immediately (shows instantly)
    const localOrder = {
      ...orderData,
      id:       'CRAVEIT-' + Date.now().toString().slice(-6),
      _id:      'CRAVEIT-' + Date.now().toString().slice(-6),
      status:   'placed',
      placedAt: new Date().toISOString(),
    };

    // Save to localStorage immediately so both tabs see it
    const current = loadOrders();
    const updated = [localOrder, ...current];
    saveOrders(updated);
    setOrders(updated);

    // Also try to save to backend if logged in
    if (token && token !== 'demo_token') {
      try {
        const res  = await fetch(`${API}/orders`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body:    JSON.stringify(orderData),
        });
        const data = await res.json();
        if (data.success) {
          // Replace local order with real backend order
          const backendOrder = data.order;
          const refreshed = loadOrders().map(o =>
            o.id === localOrder.id ? { ...backendOrder, id: backendOrder._id } : o
          );
          saveOrders(refreshed);
          setOrders(refreshed);
          return { ...backendOrder, id: backendOrder._id };
        }
      } catch (err) {
        console.log('Backend order failed, using local:', err.message);
      }
    }

    return localOrder;
  }, []);

  // ── Update order status (admin) ───────────────────
  const updateOrderStatus = useCallback(async (orderId, status) => {
    // Update localStorage immediately
    const current = loadOrders();
    const updated = current.map(o =>
      (o._id === orderId || o.id === orderId) ? { ...o, status } : o
    );
    saveOrders(updated);
    setOrders(updated);

    // Also update backend if admin token exists
    const adminToken = getAdminToken();
    if (adminToken && adminToken !== 'demo_admin' && adminToken !== 'true') {
      try {
        await fetch(`${API}/orders/${orderId}/status`, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
          body:    JSON.stringify({ status }),
        });
      } catch {}
    }
  }, []);

  // ── Get single order ──────────────────────────────
  const getOrder = useCallback((orderId) => {
    return orders.find(o => o._id === orderId || o.id === orderId) || null;
  }, [orders]);

  const fetchMyOrders  = useCallback(() => {}, []);
  const fetchAllOrders = useCallback(() => {}, []);

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
