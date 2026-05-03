const Delivery = require('../models/Delivery');
const User = require('../models/User');
const Order = require('../models/Order');

// ==================== DELIVERY CRUD ====================

// @desc    Create a delivery (from an order)
// @route   POST /api/deliveries
// @access  Private
const createDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.create({ ...req.body, user: req.user._id });
    res.status(201).json(delivery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all deliveries (with optional filters)
// @route   GET /api/deliveries
// @access  Private/Admin
const getDeliveries = async (req, res) => {
  try {
    const { status, rider } = req.query;
    const query = {};
    if (status) query.status = status;
    if (rider) query.rider = rider;

    const deliveries = await Delivery.find(query)
      .populate('order')
      .populate('user', 'name email phone')
      .populate('rider', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single delivery
// @route   GET /api/deliveries/:id
// @access  Private
const getDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('order')
      .populate('user', 'name email phone')
      .populate('rider', 'name email phone');
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update delivery status
// @route   PUT /api/deliveries/:id
// @access  Private/Admin
const updateDeliveryStatus = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });

    if (req.body.status) {
      delivery.status = req.body.status;
      if (req.body.status === 'delivered') delivery.deliveredAt = new Date();
      if (req.body.status === 'picked-up') delivery.pickedUpAt = new Date();
      if (req.body.status === 'assigned') delivery.assignedAt = new Date();
    }
    if (req.body.notes !== undefined) delivery.notes = req.body.notes;
    if (req.body.deliveryFee !== undefined) delivery.deliveryFee = req.body.deliveryFee;
    if (req.body.estimatedTime !== undefined) delivery.estimatedTime = req.body.estimatedTime;

    const updatedDelivery = await delivery.save();
    const populated = await Delivery.findById(updatedDelivery._id)
      .populate('order')
      .populate('user', 'name email phone')
      .populate('rider', 'name email phone');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a delivery
// @route   DELETE /api/deliveries/:id
// @access  Private/Admin
const deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndDelete(req.params.id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    res.json({ message: 'Delivery removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== RIDER MANAGEMENT ====================

// @desc    Get all riders
// @route   GET /api/deliveries/riders
// @access  Private/Admin
const getRiders = async (req, res) => {
  try {
    const riders = await User.find({ role: 'rider' }).select('-password');
    // Count active deliveries for each rider
    const ridersWithStats = await Promise.all(
      riders.map(async (rider) => {
        const activeDeliveries = await Delivery.countDocuments({
          rider: rider._id,
          status: { $in: ['assigned', 'picked-up', 'in-transit'] },
        });
        const completedDeliveries = await Delivery.countDocuments({
          rider: rider._id,
          status: 'delivered',
        });
        return {
          ...rider.toObject(),
          activeDeliveries,
          completedDeliveries,
        };
      })
    );
    res.json(ridersWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a rider (register new rider)
// @route   POST /api/deliveries/riders
// @access  Private/Admin
const createRider = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists with this email' });

    const rider = await User.create({
      name,
      email,
      password: password || 'rider123',
      phone,
      role: 'rider',
    });

    res.status(201).json({
      _id: rider._id,
      name: rider.name,
      email: rider.email,
      phone: rider.phone,
      role: rider.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a rider
// @route   DELETE /api/deliveries/riders/:id
// @access  Private/Admin
const deleteRider = async (req, res) => {
  try {
    const rider = await User.findById(req.params.id);
    if (!rider || rider.role !== 'rider') {
      return res.status(404).json({ message: 'Rider not found' });
    }
    // Unassign any active deliveries
    await Delivery.updateMany(
      { rider: rider._id, status: { $in: ['assigned', 'picked-up', 'in-transit'] } },
      { rider: null, status: 'pending' }
    );
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rider removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== RIDER ASSIGNMENT ====================

// @desc    Assign a rider to a delivery
// @route   PUT /api/deliveries/:id/assign
// @access  Private/Admin
const assignRider = async (req, res) => {
  try {
    const { riderId } = req.body;
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });

    const rider = await User.findById(riderId);
    if (!rider || rider.role !== 'rider') {
      return res.status(400).json({ message: 'Invalid rider' });
    }

    delivery.rider = riderId;
    delivery.status = 'assigned';
    delivery.assignedAt = new Date();

    const updated = await delivery.save();
    const populated = await Delivery.findById(updated._id)
      .populate('order')
      .populate('user', 'name email phone')
      .populate('rider', 'name email phone');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== DELIVERY STATS ====================

// @desc    Get delivery statistics
// @route   GET /api/deliveries/stats
// @access  Private/Admin
const getDeliveryStats = async (req, res) => {
  try {
    const total = await Delivery.countDocuments();
    const pending = await Delivery.countDocuments({ status: 'pending' });
    const assigned = await Delivery.countDocuments({ status: 'assigned' });
    const inTransit = await Delivery.countDocuments({ status: { $in: ['picked-up', 'in-transit'] } });
    const delivered = await Delivery.countDocuments({ status: 'delivered' });
    const cancelled = await Delivery.countDocuments({ status: 'cancelled' });

    // Total delivery fees earned
    const feeResult = await Delivery.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, totalFees: { $sum: '$deliveryFee' } } },
    ]);
    const totalFees = feeResult.length > 0 ? feeResult[0].totalFees : 0;

    // Average delivery time
    const timeResult = await Delivery.aggregate([
      { $match: { status: 'delivered', deliveredAt: { $ne: null } } },
      {
        $project: {
          deliveryTime: { $divide: [{ $subtract: ['$deliveredAt', '$createdAt'] }, 60000] },
        },
      },
      { $group: { _id: null, avgTime: { $avg: '$deliveryTime' } } },
    ]);
    const avgDeliveryTime = timeResult.length > 0 ? Math.round(timeResult[0].avgTime) : 0;

    const riderCount = await User.countDocuments({ role: 'rider' });

    res.json({
      total,
      pending,
      assigned,
      inTransit,
      delivered,
      cancelled,
      totalFees,
      avgDeliveryTime,
      riderCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== RIDER ENDPOINTS ====================

// @desc    Get my deliveries (for logged-in rider)
// @route   GET /api/deliveries/my
// @access  Private (rider)
const getMyDeliveries = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { rider: req.user._id };
    if (status) query.status = status;

    const deliveries = await Delivery.find(query)
      .populate('order')
      .populate('user', 'name email phone address')
      .sort({ createdAt: -1 });
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rider updates their own delivery status
// @route   PUT /api/deliveries/my/:id
// @access  Private (rider)
const updateMyDeliveryStatus = async (req, res) => {
  try {
    const delivery = await Delivery.findOne({ _id: req.params.id, rider: req.user._id });
    if (!delivery) return res.status(404).json({ message: 'Delivery not found or not assigned to you' });

    const allowedTransitions = {
      assigned: 'picked-up',
      'picked-up': 'in-transit',
      'in-transit': 'delivered',
    };

    const nextStatus = allowedTransitions[delivery.status];
    if (!nextStatus) return res.status(400).json({ message: 'Cannot update status further' });

    delivery.status = nextStatus;
    if (nextStatus === 'picked-up') delivery.pickedUpAt = new Date();
    if (nextStatus === 'delivered') delivery.deliveredAt = new Date();

    const updated = await delivery.save();
    const populated = await Delivery.findById(updated._id)
      .populate('order')
      .populate('user', 'name email phone address');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDelivery,
  getDeliveries,
  getDelivery,
  updateDeliveryStatus,
  deleteDelivery,
  getRiders,
  createRider,
  deleteRider,
  assignRider,
  getDeliveryStats,
  getMyDeliveries,
  updateMyDeliveryStatus,
};
