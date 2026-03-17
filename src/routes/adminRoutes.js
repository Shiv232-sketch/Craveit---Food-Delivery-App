const express = require('express');
const router = express.Router();
const { getDashboard, getAllOrders, getAllUsers } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/dashboard',   protect, adminOnly, getDashboard);
router.get('/orders',      protect, adminOnly, getAllOrders);
router.get('/users',       protect, adminOnly, getAllUsers);

module.exports = router;
