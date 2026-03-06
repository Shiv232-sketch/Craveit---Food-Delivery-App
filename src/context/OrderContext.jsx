import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const OrderContext = createContext();

const STORAGE_KEY = 'craveit_orders';

// Load orders from localStorage
const loadOrders = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

// Save orders to localStorage
const saveOrders = (orders) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(loadOrders);

  // Sync to localStorage whenever orders change
  useEffect(() => {
    saveOrders(orders);
  }, [orders]);

  // Poll localStorage every 2 seconds to catch updates from admin panel
  useEffect(() => {
    const interval = setInterval(() => {
      const latest = loadOrders();
      setOrders(prev => {
        // Only update if data has actually changed
        if (JSON.stringify(prev) !== JSON.stringify(latest)) return latest;
        return prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Place a new order
  const placeOrder = useCallback((orderData) => {
    const newOrder = {
      ...orderData,
      id: 'CRAVEIT-' + Date.now().toString().slice(-6),
      status: 'placed',
      placedAt: new Date().toISOString(),
      statusHistory: [{ status: 'placed', time: new Date().toISOString() }],
    };
    setOrders(prev => {
      const updated = [newOrder, ...prev];
      saveOrders(updated);
      return updated;
    });
    return newOrder;
  }, []);

  // Update order status (used by admin)
  const updateOrderStatus = useCallback((orderId, status) => {
    setOrders(prev => {
      const updated = prev.map(o =>
        o.id === orderId
          ? {
              ...o,
              status,
              statusHistory: [
                ...(o.statusHistory || []),
                { status, time: new Date().toISOString() }
              ],
              ...(status === 'delivered' ? { deliveredAt: new Date().toISOString() } : {})
            }
          : o
      );
      saveOrders(updated);
      return updated;
    });
  }, []);

  // Get a single order by ID
  const getOrder = useCallback((orderId) => {
    return loadOrders().find(o => o.id === orderId) || null;
  }, []);

  return (
    <OrderContext.Provider value={{ orders, placeOrder, updateOrderStatus, getOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => useContext(OrderContext);
