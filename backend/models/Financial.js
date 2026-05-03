const mongoose = require('mongoose');

const financialSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['revenue', 'expense'],
      required: [true, 'Please specify transaction type'],
    },
    amount: {
      type: Number,
      required: [true, 'Please add an amount'],
      min: 0,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    category: {
      type: String,
      enum: ['food-sales', 'drinks', 'delivery-fees', 'tips', 'salaries', 'rent', 'utilities', 'supplies', 'maintenance', 'other'],
      default: 'other',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Financial', financialSchema);
