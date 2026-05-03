const express = require('express');
const router = express.Router();
const { getDishes, getDish, createDish, updateDish, deleteDish } = require('../controllers/dishController');
const { protect, admin } = require('../middleware/auth');

router.route('/').get(getDishes).post(protect, admin, createDish);
router.route('/:id').get(getDish).put(protect, admin, updateDish).delete(protect, admin, deleteDish);

module.exports = router;
