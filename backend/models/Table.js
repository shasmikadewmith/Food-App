const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: [true, 'Please add a table number'],
      unique: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Please add table capacity'],
      min: 1,
      max: 20,
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'occupied'],
      default: 'available',
    },
    reservedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reservationDate: {
      type: Date,
      default: null,
    },
    reservationNotes: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      enum: ['indoor', 'outdoor', 'vip'],
      default: 'indoor',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Table', tableSchema);
