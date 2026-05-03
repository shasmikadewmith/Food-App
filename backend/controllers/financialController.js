const Financial = require('../models/Financial');

const getRecords = async (req, res) => {
  try {
    const { type, category } = req.query;
    const query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    const records = await Financial.find(query).populate('order').sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRecord = async (req, res) => {
  try {
    const record = await Financial.findById(req.params.id).populate('order');
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createRecord = async (req, res) => {
  try {
    const record = await Financial.create(req.body);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRecord = async (req, res) => {
  try {
    const record = await Financial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const record = await Financial.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Record removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSummary = async (req, res) => {
  try {
    const revenue = await Financial.aggregate([
      { $match: { type: 'revenue' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const expenses = await Financial.aggregate([
      { $match: { type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenue[0]?.total || 0;
    const totalExpenses = expenses[0]?.total || 0;
    res.json({ totalRevenue, totalExpenses, profit: totalRevenue - totalExpenses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRecords, getRecord, createRecord, updateRecord, deleteRecord, getSummary };
