import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const OrderContext = createContext();

const API         = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:5000/api';
const STORAGE_KEY = 'craveit_orders';

const getToken      = () => localStorage.getItem('craveit_token');
const getAdminToken = () => localStorage.getItem('craveit_admin');
const isAdminPage   = () => window.location.pathname.startsWith('/admin');

// ── Strip heavy data before saving to localStorage ──
// Base64 images are huge — remove them from order items before saving
const stripForStorage = (orders) => {
  return orders.map(order => ({
    ...order,
    items: (order.items || []).map(item => ({
      id:    item.id || item._id,
      name:  item.name,
      price: item.price,
      qty:   item.qty,
      emoji: item.emoji,
      // Don't save image — it's huge and causes quota error
    }))
  }));
};

const loadOrders = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
};

const saveOrders = (orders) => {
  try {
    const stripped = stripForStorage(orders);
    // Keep only last 20 orders to avoid quota issues
    const trimmed  = stripped.slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    // If still quota error — clear old orders and try again
    try {
      localStorage.removeItem(STORAGE_KEY);
      const minimal = stripForStorage(orders.slice(0, 5));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
    } catch {
      console.log('localStorage full — orders only in memory');
    }
  }
};

const STATUS_PRIORITY = {
  placed: 1, confirmed: 2, preparing: 3,
  pickup: 4, delivered: 5, cancelled: 5
};

const mergeOrders = (localOrders, backendOrders) => {
  const result = [...backendOrders];
  backendOrders.forEach((backendOrder, idx) => {
    const localMatch = localOrders.find(l => l._id === backendOrder._id || l.id === backendOrder._id);
    if (localMatch) {
      const localPriority   = STATUS_PRIORITY[localMatch.status]  || 0;
      const backendPriority = STATUS_PRIORITY[backendOrder.status] || 0;
      if (localPriority > backendPriority) {
        result[idx] = { ...backendOrder, status: localMatch.status };
      }
    }
  });
  localOrders.forEach(local => {
    const existsInBackend = backendOrders.find(b => b._id === local._id || b._id === local.id);
    if (!existsInBackend && local.id?.startsWith('CRAVEIT-')) {
      result.push(local);
    }
  });
  
  const uniqueResult = [];
  const seenIds = new Set();
  result.forEach(r => {
    const rId = r._id || r.id;
    if (!seenIds.has(rId)) {
      seenIds.add(rId);
      uniqueResult.push(r);
    }
  });

  uniqueResult.sort((a, b) => {
    const dateA = (a.placedAt || a.createdAt) ? new Date(a.placedAt || a.createdAt).getTime() : 0;
    const dateB = (b.placedAt || b.createdAt) ? new Date(b.placedAt || b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  return uniqueResult;
};

export function OrderProvider({ children }) {
  const [orders,  setOrders]  = useState(loadOrders);
  const lastFetchRef           = useRef(0);
  const isFetchingRef          = useRef(false);

  const syncOrders = useCallback(async (force = false) => {
    if (isFetchingRef.current) return;
    const now       = Date.now();
    const timeSince = now - lastFetchRef.current;
    if (!force && timeSince < 10000) return;

    const adminToken = getAdminToken();
    const userToken  = getToken();

    isFetchingRef.current = true;

    try {
      if (isAdminPage() && adminToken) {
        const res  = await fetch(`${API}/orders`, { headers: { 'x-admin-token': adminToken } });
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          lastFetchRef.current = now;
          const merged = mergeOrders(loadOrders(), data.orders);
          saveOrders(merged);
          setOrders(merged);
        } else if (data.message?.includes('invalid')) {
          localStorage.removeItem('craveit_admin');
        }
      } else if (!isAdminPage() && userToken) {
        const res  = await fetch(`${API}/orders/my`, { headers: { Authorization: `Bearer ${userToken}` } });
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          lastFetchRef.current = now;
          const merged = mergeOrders(loadOrders(), data.orders);
          saveOrders(merged);
          setOrders(merged);
        }
      }
    } catch {}
    finally { isFetchingRef.current = false; }
  }, []);

  useEffect(() => { syncOrders(true); }, []);
  useEffect(() => {
    const interval = setInterval(() => syncOrders(), 10000);
    return () => clearInterval(interval);
  }, [syncOrders]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newOrders = JSON.parse(e.newValue);
          setOrders(prev => newOrders.map(newOrder => {
            const existing = prev.find(p => p._id === newOrder._id || p.id === newOrder.id);
            if (!existing) return newOrder;
            const ep = STATUS_PRIORITY[existing.status] || 0;
            const np = STATUS_PRIORITY[newOrder.status]  || 0;
            return np >= ep ? newOrder : existing;
          }));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const placeOrder = useCallback(async (orderData) => {
    const token = getToken();

    // Strip images before creating local order
    const localOrder = {
      ...orderData,
      id:       'CRAVEIT-' + Date.now().toString().slice(-6),
      _id:      'CRAVEIT-' + Date.now().toString().slice(-6),
      status:   'placed',
      placedAt: new Date().toISOString(),
      items:    (orderData.items || []).map(item => ({
        id:    item.id,
        name:  item.name,
        price: item.price,
        qty:   item.qty,
        emoji: item.emoji,
        // No image saved to localStorage
      }))
    };

    const current = loadOrders();
    const updated = [localOrder, ...current];
    saveOrders(updated);
    setOrders(updated);

    if (token) {
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
          lastFetchRef.current = 0;
          return backendOrder;
        }
      } catch {}
    }
    return localOrder;
  }, []);

  const updateOrderStatus = useCallback(async (orderId, status) => {
    const current = loadOrders();
    const updated = current.map(o =>
      (o._id === orderId || o.id === orderId) ? { ...o, status } : o
    );
    saveOrders(updated);
    setOrders(updated);

    const adminToken = getAdminToken();
    if (adminToken) {
      try {
        await fetch(`${API}/orders/${orderId}/status`, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
          body:    JSON.stringify({ status }),
        });
        lastFetchRef.current = 0;
      } catch {}
    }
  }, []);

  const getOrder       = useCallback((orderId) => orders.find(o => o._id === orderId || o.id === orderId) || null, [orders]);
  const fetchMyOrders  = useCallback(() => syncOrders(true), [syncOrders]);
  const fetchAllOrders = useCallback(() => syncOrders(true), [syncOrders]);

  return (
    <OrderContext.Provider value={{ orders, placeOrder, updateOrderStatus, getOrder, fetchMyOrders, fetchAllOrders }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => useContext(OrderContext);