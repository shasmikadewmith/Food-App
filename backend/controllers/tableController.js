const Table = require('../models/Table');

//API fetches all tables and allows filtering by status and location
const getTables = async (req, res) => {
  try {
    const { status, location } = req.query;
    const query = {};
    if (status) query.status = status;
    if (location) query.location = location;

    const tables = await Table.find(query)
      .populate('reservedBy', 'name email phone')
      .sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//This API retrieves a specific table using its ID.
const getTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id).populate(
      'reservedBy',
      'name email phone'
    );
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//create table
const createTable = async (req, res) => {
  try {
    const table = await Table.create(req.body);
    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//update table
const updateTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete table
const deleteTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json({ message: 'Table removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reserve a table(user)
const reserveTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    if (table.status !== 'available') {
      return res.status(400).json({ message: 'Table is not available' });
    }

    table.status = 'reserved';
    table.reservedBy = req.user._id;
    table.reservationDate = req.body.reservationDate || new Date();
    table.reservationNotes = req.body.notes || '';

    const updatedTable = await table.save();
    res.json(updatedTable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Release a table
const releaseTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    table.status = 'available';
    table.reservedBy = null;
    table.reservationDate = null;
    table.reservationNotes = '';

    const updatedTable = await table.save();
    res.json(updatedTable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//make contoller function access to routers
module.exports = {
  getTables,
  getTable,
  createTable,
  updateTable,
  deleteTable,
  reserveTable,
  releaseTable,
};
