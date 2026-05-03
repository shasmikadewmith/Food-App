const express = require('express');
const router = express.Router();
const {
  createDelivery, getDeliveries, getDelivery,
  updateDeliveryStatus, deleteDelivery,
  getRiders, createRider, deleteRider,
  assignRider, getDeliveryStats,
  getMyDeliveries, updateMyDeliveryStatus,
} = require('../controllers/deliveryController');
const { protect, admin } = require('../middleware/auth');

// Delivery stats (admin)
router.get('/stats', protect, admin, getDeliveryStats);

// Rider management (admin)
router.route('/riders').get(protect, admin, getRiders).post(protect, admin, createRider);
router.delete('/riders/:id', protect, admin, deleteRider);

// Rider's own deliveries
router.get('/my', protect, getMyDeliveries);
router.put('/my/:id', protect, updateMyDeliveryStatus);

// Delivery CRUD
router.route('/').get(protect, admin, getDeliveries).post(protect, createDelivery);
router.route('/:id').get(protect, getDelivery).put(protect, admin, updateDeliveryStatus).delete(protect, admin, deleteDelivery);

// Assign rider (admin)
router.put('/:id/assign', protect, admin, assignRider);

module.exports = router;
