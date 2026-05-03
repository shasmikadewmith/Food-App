const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    address: {
      type: String,
      required: [true, 'Please add a delivery address'],
    },
    phone: {
      type: String,
      required: [true, 'Please add a contact number'],
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'picked-up', 'in-transit', 'delivered', 'cancelled'],
      default: 'pending',
    },
    deliveryFee: {
      type: Number,
      default: 200,
      min: 0,
    },
    estimatedTime: {
      type: Number,
      default: 30,
    },
    notes: {
      type: String,
      default: '',
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    pickedUpAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Delivery', deliverySchema);
