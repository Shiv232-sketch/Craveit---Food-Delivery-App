const { MenuItem, Category } = require('../models/Menu');

// ── CATEGORIES ──

// @GET /api/menu/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/menu/categories  (admin)
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, message: 'Category created!', category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── MENU ITEMS ──

// @GET /api/menu/items
exports.getMenuItems = async (req, res) => {
  try {
    const { category, isVeg, search, featured } = req.query;
    const filter = { isAvailable: true };
    if (category)  filter.category = category;
    if (isVeg !== undefined) filter.isVeg = isVeg === 'true';
    if (featured === 'true') filter.isFeatured = true;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const items = await MenuItem.find(filter).populate('category', 'name');
    res.json({ success: true, count: items.length, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/menu/items/:id
exports.getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('category');
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/menu/items  (admin)
exports.createMenuItem = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = req.file.path; // Cloudinary URL
    const item = await MenuItem.create(data);
    res.status(201).json({ success: true, message: 'Menu item created!', item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/menu/items/:id  (admin)
exports.updateMenuItem = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = req.file.path;
    const item = await MenuItem.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Menu item updated!', item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/menu/items/:id  (admin)
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Menu item deleted!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/menu/items/:id/toggle  (admin) - toggle availability
exports.toggleAvailability = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json({ success: true, message: `Item is now ${item.isAvailable ? 'available' : 'unavailable'}`, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
