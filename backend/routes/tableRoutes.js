const express = require('express');
const router = express.Router();
const { getTables, getTable, createTable, updateTable, deleteTable, reserveTable, releaseTable } = require('../controllers/tableController');
const { protect, admin } = require('../middleware/auth');

router.route('/').get(getTables).post(protect, admin, createTable);
router.route('/:id').get(getTable).put(protect, admin, updateTable).delete(protect, admin, deleteTable);
router.put('/:id/reserve', protect, reserveTable);
router.put('/:id/release', protect, admin, releaseTable);

module.exports = router;
