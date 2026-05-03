const express = require('express');
const router = express.Router();
const { getMenus, getMenu, createMenu, updateMenu, deleteMenu } = require('../controllers/menuController');
const { protect, admin } = require('../middleware/auth');

router.route('/').get(getMenus).post(protect, admin, createMenu);
router.route('/:id').get(getMenu).put(protect, admin, updateMenu).delete(protect, admin, deleteMenu);

module.exports = router;
