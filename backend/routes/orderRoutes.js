const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getMyOrders, getOrder, updateOrderStatus, deleteOrder } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.route('/').get(protect, admin, getOrders).post(protect, createOrder);
router.get('/my', protect, getMyOrders);
router.route('/:id').get(protect, getOrder);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.delete('/:id', protect, admin, deleteOrder);

module.exports = router;
