const express = require('express');
const router = express.Router();
const { getReviews, getReviewsByDish, getMyReviews, createReview, updateReview, deleteReview } = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/auth');

router.route('/').get(getReviews).post(protect, createReview);
router.get('/my', protect, getMyReviews);
router.get('/dish/:dishId', getReviewsByDish);
router.route('/:id').put(protect, updateReview).delete(protect, admin, deleteReview);

module.exports = router;
