const Menu = require('../models/Menu');

// @desc    Get all menus
// @route   GET /api/menus
// @access  Public
const getMenus = async (req, res) => {
  try {
    const menus = await Menu.find().populate('dishes').sort({ createdAt: -1 });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single menu
// @route   GET /api/menus/:id
// @access  Public
const getMenu = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id).populate('dishes');
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a menu
// @route   POST /api/menus
// @access  Private/Admin
const createMenu = async (req, res) => {
  try {
    const menu = await Menu.create(req.body);
    res.status(201).json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a menu
// @route   PUT /api/menus/:id
// @access  Private/Admin
const updateMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('dishes');
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a menu
// @route   DELETE /api/menus/:id
// @access  Private/Admin
const deleteMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndDelete(req.params.id);
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    res.json({ message: 'Menu removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMenus, getMenu, createMenu, updateMenu, deleteMenu };
