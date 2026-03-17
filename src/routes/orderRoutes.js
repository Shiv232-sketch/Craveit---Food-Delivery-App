const express = require('express');
const router = express.Router();
const {
  placeOrder, getMyOrders, getOrderById,
  updateOrderStatus, verifyOTP, refreshOTP
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/place',                  protect, placeOrder);
router.get('/my-orders',               protect, getMyOrders);
router.get('/:id',                     protect, getOrderById);
router.put('/:id/status',              protect, adminOnly, updateOrderStatus);
router.post('/:id/verify-otp',         protect, verifyOTP);
router.get('/refresh-otp/:id',         protect, refreshOTP);

module.exports = router;
