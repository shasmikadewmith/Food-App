const Dish = require('../models/Dish');

// @desc    Get all dishes
// @route   GET /api/dishes
// @access  Public
const getDishes = async (req, res) => {
  try {
    const { category, search, available } = req.query;
    const query = {};

    if (category) query.category = category;
    if (available !== undefined) query.isAvailable = available === 'true';
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const dishes = await Dish.find(query).sort({ createdAt: -1 });
    res.json(dishes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single dish
// @route   GET /api/dishes/:id
// @access  Public
const getDish = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }
    res.json(dish);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//create a dish
// @desc    Create a dish
// @route   POST /api/dishes
// @access  Private/Admin
const createDish = async (req, res) => {
  try {
    const dish = await Dish.create(req.body);
    res.status(201).json(dish);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//update a dish
// @desc    Update a dish
// @route   PUT /api/dishes/:id
// @access  Private/Admin
const updateDish = async (req, res) => {
  try {
    const dish = await Dish.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }
    res.json(dish);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete a dish
// @desc    Delete a dish
// @route   DELETE /api/dishes/:id
// @access  Private/Admin
const deleteDish = async (req, res) => {
  try {
    const dish = await Dish.findByIdAndDelete(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }
    res.json({ message: 'Dish removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDishes, getDish, createDish, updateDish, deleteDish };
