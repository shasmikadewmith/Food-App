const Order = require('../models/Order');
const Financial = require('../models/Financial');
const Delivery = require('../models/Delivery');
const User = require('../models/User');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { items, orderType, table, deliveryAddress, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const DELIVERY_FEE = 200;

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const totalPrice = orderType === 'delivery' ? subtotal + DELIVERY_FEE : subtotal;

    const order = await Order.create({
      user: req.user._id,
      items,
      totalPrice,
      orderType,
      table: orderType === 'dine-in' ? table : null,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : '',
      notes,
    });

    // Auto-create financial record for revenue
    await Financial.create({
      type: 'revenue',
      amount: totalPrice,
      description: `Order #${order._id.toString().slice(-6)}`,
      category: 'food-sales',
      order: order._id,
    });

    // Auto-create a Delivery record for delivery orders
    if (orderType === 'delivery') {
      const customer = await User.findById(req.user._id);
      await Delivery.create({
        order: order._id,
        user: req.user._id,
        address: deliveryAddress || customer?.address || 'No address provided',
        phone: customer?.phone || '',
        status: 'pending',
        deliveryFee: DELIVERY_FEE,
        estimatedTime: 30,
        notes: notes || '',
      });
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.dish', 'name image');

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const { status, orderType } = req.query;
    const query = {};
    if (status) query.status = status;
    if (orderType) query.orderType = orderType;

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('table', 'tableNumber')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('table', 'tableNumber')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('table', 'tableNumber capacity');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = req.body.status || order.status;
    order.paymentStatus = req.body.paymentStatus || order.paymentStatus;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  deleteOrder,
};
