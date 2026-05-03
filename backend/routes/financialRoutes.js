const express = require('express');
const router = express.Router();
const { getRecords, getRecord, createRecord, updateRecord, deleteRecord, getSummary } = require('../controllers/financialController');
const { protect, admin } = require('../middleware/auth');

router.route('/').get(protect, admin, getRecords).post(protect, admin, createRecord);
router.get('/summary', protect, admin, getSummary);
router.route('/:id').get(protect, admin, getRecord).put(protect, admin, updateRecord).delete(protect, admin, deleteRecord);

module.exports = router;
