const express = require('express');
const router = express.Router();
const {
  getCategories, createCategory,
  getMenuItems, getMenuItemById,
  createMenuItem, updateMenuItem,
  deleteMenuItem, toggleAvailability
} = require('../controllers/menuController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// Categories
router.get('/categories',              getCategories);
router.post('/categories',             protect, adminOnly, createCategory);

// Menu Items
router.get('/items',                   getMenuItems);
router.get('/items/:id',               getMenuItemById);
router.post('/items',                  protect, adminOnly, upload.single('image'), createMenuItem);
router.put('/items/:id',               protect, adminOnly, upload.single('image'), updateMenuItem);
router.delete('/items/:id',            protect, adminOnly, deleteMenuItem);
router.put('/items/:id/toggle',        protect, adminOnly, toggleAvailability);

module.exports = router;
