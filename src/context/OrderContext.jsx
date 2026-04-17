import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const OrderContext = createContext();

<<<<<<< HEAD
const API = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:5000/api';
=======
const API        = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:5000/api';
const STORAGE_KEY = 'craveit_orders';
>>>>>>> parent of f6c5583 (orderproblem fix)    

const getToken      = () => localStorage.getItem('craveit_token');
const getAdminToken = () => localStorage.getItem('craveit_admin');
const isAdminPage   = () => window.location.pathname.startsWith('/admin');

// ── Separate localStorage keys for admin vs user ──
// This prevents cross-tab contamination between admin (all orders) and user (my orders)
const STORAGE_KEY_USER  = 'craveit_orders_user';
const STORAGE_KEY_ADMIN = 'craveit_orders_admin';
const getStorageKey = () => isAdminPage() ? STORAGE_KEY_ADMIN : STORAGE_KEY_USER;

// ── Strip heavy data before saving to localStorage ──
const stripForStorage = (orders) => {
  return orders.map(order => ({
    ...order,
    items: (order.items || []).map(item => ({
      id:    item.id || item._id,
      name:  item.name,
      price: item.price,
      qty:   item.qty,
      emoji: item.emoji,
    }))
  }));
};

<<<<<<< HEAD
const loadOrders = () => {
  try {
    return JSON.parse(localStorage.getItem(getStorageKey()) || '[]');
  } catch { return []; }
};

const saveOrders = (orders) => {
  try {
    const stripped = stripForStorage(orders);
    const trimmed  = stripped.slice(0, 100);
    localStorage.setItem(getStorageKey(), JSON.stringify(trimmed));
  } catch {
    try {
      localStorage.removeItem(getStorageKey());
      const minimal = stripForStorage(orders.slice(0, 5));
      localStorage.setItem(getStorageKey(), JSON.stringify(minimal));
    } catch {
      console.log('localStorage full — orders only in memory');
    }
  }
};

export function OrderProvider({ children }) {
  const [orders, setOrders]    = useState(loadOrders);
  const lastFetchRef           = useRef(0);
  const isFetchingRef          = useRef(false);
  const ordersRef              = useRef(orders);
  // Track optimistic status updates — protects them from being overwritten
  // by stale backend data that arrives before the DB has committed
  const pendingUpdatesRef      = useRef(new Map());

  // Keep ref in sync with state
  useEffect(() => { ordersRef.current = orders; }, [orders]);

  // ── Core sync function — fetches from backend ──
  const syncOrders = useCallback(async (force = false) => {
    if (isFetchingRef.current) return;
    const now = Date.now();
    if (!force && (now - lastFetchRef.current) < 10000) return;

    const adminToken = getAdminToken();
    const userToken  = getToken();

    isFetchingRef.current = true;

    try {
      let backendOrders = null;

      if (isAdminPage() && adminToken) {
        const res  = await fetch(`${API}/orders`, { headers: { 'x-admin-token': adminToken } });
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          backendOrders = data.orders;
        } else if (data.message?.includes('invalid')) {
          localStorage.removeItem('craveit_admin');
        }
      } else if (!isAdminPage() && userToken) {
        const res  = await fetch(`${API}/orders/my`, { headers: { Authorization: `Bearer ${userToken}` } });
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          backendOrders = data.orders;
        }
      }

      if (backendOrders !== null) {
        lastFetchRef.current = now;

        // Clean expired pending updates
        for (const [id, entry] of pendingUpdatesRef.current.entries()) {
          if (now - entry.time > 15000) pendingUpdatesRef.current.delete(id);
        }

        // Build final order list: backend is source of truth,
        // but respect pending optimistic updates for 15s
        const merged = backendOrders.map(order => {
          const pending = pendingUpdatesRef.current.get(order._id);
          if (pending && Date.now() - pending.time < 15000) {
            return { ...order, status: pending.status };
          }
          return order;
        });

        // Add any local-only orders (temp IDs not yet synced to backend)
        ordersRef.current.forEach(local => {
          const localId = local._id || local.id;
          if (localId?.startsWith('CRAVEIT-') && !backendOrders.some(b => b._id === localId)) {
            merged.push(local);
          }
        });

        // Sort newest first
        merged.sort((a, b) => {
          const dateA = new Date(a.placedAt || a.createdAt || 0).getTime();
          const dateB = new Date(b.placedAt || b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        // Only update if data actually changed — prevents unnecessary re-renders (flickering)
        if (hasOrdersChanged(ordersRef.current, merged)) {
          saveOrders(merged);
          setOrders(merged);
        }
      }
    } catch (err) {
      console.log('Order sync failed:', err.message);
      // On error, keep existing orders — don't clear anything
    }
    finally { isFetchingRef.current = false; }
  }, []);

  // ── Compare two order arrays to avoid unnecessary re-renders ──
  function hasOrdersChanged(prev, next) {
    if (prev.length !== next.length) return true;
    for (let i = 0; i < prev.length; i++) {
      if ((prev[i]._id || prev[i].id) !== (next[i]._id || next[i].id)) return true;
      if (prev[i].status !== next[i].status) return true;
    }
    return false;
  }

  // ── Polling: sync on mount + every 10 seconds ──
  useEffect(() => { syncOrders(true); }, []);
  useEffect(() => {
    const interval = setInterval(() => syncOrders(), 10000);
    return () => clearInterval(interval);
  }, [syncOrders]);

  // ── Place a new order ──
=======
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
>>>>>>> parent of f6c5583 (orderproblem fix)
  const placeOrder = useCallback(async (orderData) => {
    const token = getToken();

    // Build local order immediately (shows instantly)
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
      }))
    };

<<<<<<< HEAD
    // Optimistic: show order immediately
    const updated = [localOrder, ...ordersRef.current];
    saveOrders(updated);
    setOrders(updated);

    if (token) {
=======
    // Save to localStorage immediately so both tabs see it
    const current = loadOrders();
    const updated = [localOrder, ...current];
    saveOrders(updated);
    setOrders(updated);

    // Also try to save to backend if logged in
    if (token && token !== 'demo_token') {
>>>>>>> parent of f6c5583 (orderproblem fix)
      try {
        const res  = await fetch(`${API}/orders`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body:    JSON.stringify(orderData),
        });
        const data = await res.json();
        if (data.success) {
<<<<<<< HEAD
          const backendOrder = { ...data.order, id: data.order._id };
          // Replace temp order with real backend order
          const refreshed = ordersRef.current.map(o => o.id === localOrder.id ? backendOrder : o);
          saveOrders(refreshed);
          setOrders(refreshed);
          return backendOrder;
        }
      } catch (err) {
        console.log('Place order API failed:', err.message);
=======
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
>>>>>>> parent of f6c5583 (orderproblem fix)
      }
    }
    return localOrder;
  }, []);

  // ── Update order status (admin action) ──
  const updateOrderStatus = useCallback(async (orderId, status) => {
<<<<<<< HEAD
    // 1. Record pending update — protects from stale backend overwrites for 15s
    pendingUpdatesRef.current.set(orderId, { status, time: Date.now() });

    // 2. Optimistic update — show immediately in UI
    const updated = ordersRef.current.map(o =>
=======
    // Update localStorage immediately
    const current = loadOrders();
    const updated = current.map(o =>
>>>>>>> parent of f6c5583 (orderproblem fix)
      (o._id === orderId || o.id === orderId) ? { ...o, status } : o
    );
    saveOrders(updated);
    setOrders(updated);

<<<<<<< HEAD
    // 3. Persist to backend
=======
    // Also update backend if admin token exists
>>>>>>> parent of f6c5583 (orderproblem fix)
    const adminToken = getAdminToken();
    if (adminToken) {
      try {
        const res = await fetch(`${API}/orders/${orderId}/status`, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
          body:    JSON.stringify({ status }),
        });
<<<<<<< HEAD
        const data = await res.json();
        if (data.success && data.order) {
          // Backend confirmed — clear pending, use authoritative data
          pendingUpdatesRef.current.delete(orderId);
          const confirmed = ordersRef.current.map(o =>
            (o._id === orderId || o.id === orderId) ? { ...data.order, id: data.order._id } : o
          );
          saveOrders(confirmed);
          setOrders(confirmed);
        }
      } catch (err) {
        console.log('Update order status failed:', err.message);
        // Pending update stays protected for 15s
      }
    }
  }, []);

  const getOrder       = useCallback((orderId) => orders.find(o => o._id === orderId || o.id === orderId) || null, [orders]);
  const fetchMyOrders  = useCallback(() => syncOrders(true), [syncOrders]);
  const fetchAllOrders = useCallback(() => syncOrders(true), [syncOrders]);
=======
      } catch {}
    }
  }, []);

  // ── Get single order ──────────────────────────────
  const getOrder = useCallback((orderId) => {
    return orders.find(o => o._id === orderId || o.id === orderId) || null;
  }, [orders]);

  const fetchMyOrders  = useCallback(() => {}, []);
  const fetchAllOrders = useCallback(() => {}, []);
>>>>>>> parent of f6c5583 (orderproblem fix)

  return (
    <OrderContext.Provider value={{ orders, placeOrder, updateOrderStatus, getOrder, fetchMyOrders, fetchAllOrders }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => useContext(OrderContext);
