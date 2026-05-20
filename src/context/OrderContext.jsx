import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const OrderContext = createContext();

const API = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:5000/api';
const SOCKET_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

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
    // Preserve all order-level fields needed by OrderTracking & OrderHistory
    items: (order.items || []).map(item => ({
      id:    item.id || item._id,
      name:  item.name,
      price: item.price,
      qty:   item.qty,
      emoji: item.emoji,
      image: item.image || '',
    }))
  }));
};

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
  const [socketConnected, setSocketConnected] = useState(false);
  const lastFetchRef           = useRef(0);
  const isFetchingRef          = useRef(false);
  const ordersRef              = useRef(orders);
  // Track optimistic status updates — protects them from being overwritten
  // by stale backend data that arrives before the DB has committed
  const pendingUpdatesRef      = useRef(new Map());
  const socketRef              = useRef(null);

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
        if (res.status === 401 || res.status === 403) {
          // Token expired or invalid — clear it and notify the UI to redirect to login
          localStorage.removeItem('craveit_admin');
          localStorage.removeItem(STORAGE_KEY_ADMIN);
          window.dispatchEvent(new Event('craveit_admin_expired'));
          isFetchingRef.current = false;
          return;
        }
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          backendOrders = data.orders;
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
          if (now - entry.time > 30000) pendingUpdatesRef.current.delete(id);
        }

        // Build final order list: backend is source of truth,
        // but respect pending optimistic updates for 30s
        const merged = backendOrders.map(order => {
          // Normalize _id → id so frontend components can use order.id consistently
          const normalized = { ...order, id: order._id || order.id };
          const pending = pendingUpdatesRef.current.get(order._id);
          if (pending && Date.now() - pending.time < 30000) {
            return { ...normalized, status: pending.status };
          }
          return normalized;
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
      // Detect when backend has richer data than stripped localStorage
      if (!prev[i].customer && next[i].customer) return true;
      if (!prev[i].address && next[i].address) return true;
      if (!prev[i].pricing && next[i].pricing) return true;
    }
    return false;
  }

  // ── Socket.io: real-time updates ──
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[CraveIt] Socket connected:', socket.id);
      setSocketConnected(true);
      // Admin joins admin_room for new-order notifications
      if (isAdminPage()) {
        socket.emit('joinAdmin');
      }
      // Customer joins rooms for each of their orders
      ordersRef.current.forEach(o => {
        const oid = o._id || o.id;
        if (oid && !oid.startsWith('CRAVEIT-')) {
          socket.emit('joinOrder', oid);
        }
      });
    });

    // ── Customer: instant status update from admin action ──
    socket.on('orderStatusUpdate', ({ orderId, status }) => {
      console.log('[CraveIt] Real-time status update:', orderId, '→', status);
      const updated = ordersRef.current.map(o =>
        (o._id === orderId || o.id === orderId) ? { ...o, status } : o
      );
      saveOrders(updated);
      setOrders(updated);
    });

    // ── Admin: new order notification → refresh list ──
    socket.on('newOrder', () => {
      console.log('[CraveIt] New order received via socket');
      syncOrders(true);
    });

    // ── Admin: order status changed by another admin tab ──
    socket.on('orderUpdated', ({ orderId, status }) => {
      console.log('[CraveIt] Order updated via socket:', orderId, '→', status);
      const updated = ordersRef.current.map(o =>
        (o._id === orderId || o.id === orderId) ? { ...o, status } : o
      );
      saveOrders(updated);
      setOrders(updated);
    });

    socket.on('disconnect', () => {
      console.log('[CraveIt] Socket disconnected');
      setSocketConnected(false);
    });

    socket.on('connect_error', () => {
      setSocketConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Join order rooms when new orders are added ──
  useEffect(() => {
    if (!socketRef.current?.connected) return;
    orders.forEach(o => {
      const oid = o._id || o.id;
      if (oid && !oid.startsWith('CRAVEIT-')) {
        socketRef.current.emit('joinOrder', oid);
      }
    });
  }, [orders]);

  // ── Polling: sync on mount + every 10 seconds ──
  useEffect(() => { syncOrders(true); }, []);
  useEffect(() => {
    const interval = setInterval(() => syncOrders(), 10000);
    return () => clearInterval(interval);
  }, [syncOrders]);

  // ── Place a new order ──
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
      image: item.image || '',
    }))
  };

  // Optimistic: show order immediately
  const updated = [localOrder, ...ordersRef.current];
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
        // Replace temp order with real backend order
        const refreshed = ordersRef.current.map(o => o.id === localOrder.id ? backendOrder : o);
        saveOrders(refreshed);
        setOrders(refreshed);

        // Join the socket room for this new order so we get real-time updates
        if (socketRef.current?.connected) {
          socketRef.current.emit('joinOrder', data.order._id);
        }

        return backendOrder;
      }
    } catch (err) {
      console.log('Place order API failed:', err.message);
    }
  }
  return localOrder;
}, []);

// ── Update order status (admin action) ──
const updateOrderStatus = useCallback(async (orderId, status) => {
  // 1. Record pending update — protects from stale backend overwrites for 30s
  pendingUpdatesRef.current.set(orderId, { status, time: Date.now() });

  // 2. Optimistic update — show immediately in UI
  const updated = ordersRef.current.map(o =>
    (o._id === orderId || o.id === orderId) ? { ...o, status } : o
  );
  saveOrders(updated);
  setOrders(updated);

  // 3. Persist to backend (with retry)
  const adminToken = getAdminToken();
  if (adminToken) {
    let success = false;
    for (let attempt = 0; attempt < 2 && !success; attempt++) {
      try {
        const res = await fetch(`${API}/orders/${orderId}/status`, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
          body:    JSON.stringify({ status }),
        });
        if (res.status === 401 || res.status === 403) {
          // Token expired — redirect to login immediately
          localStorage.removeItem('craveit_admin');
          window.dispatchEvent(new Event('craveit_admin_expired'));
          pendingUpdatesRef.current.delete(orderId);
          break;
        }
        const data = await res.json();
        if (data.success && data.order) {
          // Backend confirmed — clear pending, use authoritative data
          pendingUpdatesRef.current.delete(orderId);
          const confirmed = ordersRef.current.map(o =>
            (o._id === orderId || o.id === orderId) ? { ...data.order, id: data.order._id } : o
          );
          saveOrders(confirmed);
          setOrders(confirmed);
          success = true;
        } else {
          console.warn(`[CraveIt] Status update rejected by server (attempt ${attempt + 1}):`, data.message);
        }
      } catch (err) {
        console.warn(`[CraveIt] Status update network error (attempt ${attempt + 1}):`, err.message);
        if (attempt === 0) {
          // Wait 1s before retry
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }
    if (!success) {
      // Keep pending protection active — extend time so it doesn't revert
      pendingUpdatesRef.current.set(orderId, { status, time: Date.now() });
      console.error('[CraveIt] Failed to update order status after 2 attempts. Status will be protected for 30s.');
    }
  }
}, []);

const getOrder       = useCallback((orderId) => orders.find(o => o._id === orderId || o.id === orderId) || null, [orders]);
const fetchMyOrders  = useCallback(() => syncOrders(true), [syncOrders]);
const fetchAllOrders = useCallback(() => syncOrders(true), [syncOrders]);

  return (
    <OrderContext.Provider value={{ orders, placeOrder, updateOrderStatus, getOrder, fetchMyOrders, fetchAllOrders, socketConnected }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => useContext(OrderContext);
