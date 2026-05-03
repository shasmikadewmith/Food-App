const Review = require('../models/Review');
const Dish = require('../models/Dish');

const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name avatar').populate('dish', 'name image')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReviewsByDish = async (req, res) => {
  try {
    const reviews = await Review.find({ dish: req.params.dishId, isApproved: true })
      .populate('user', 'name avatar').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('dish', 'name image')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const { dish, rating, comment } = req.body;
    const existing = await Review.findOne({ user: req.user._id, dish });
    if (existing) return res.status(400).json({ message: 'You already reviewed this dish' });

    const review = await Review.create({ user: req.user._id, dish, rating, comment });

    // Update dish rating
    const reviews = await Review.find({ dish, isApproved: true });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Dish.findByIdAndUpdate(dish, { rating: avgRating.toFixed(1), numReviews: reviews.length });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    review.isApproved = req.body.isApproved !== undefined ? req.body.isApproved : review.isApproved;

    const updated = await review.save();

    // Recalculate dish rating
    const reviews = await Review.find({ dish: review.dish, isApproved: true });
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    await Dish.findByIdAndUpdate(review.dish, { rating: avgRating.toFixed(1), numReviews: reviews.length });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    // Recalculate dish rating
    const reviews = await Review.find({ dish: review.dish, isApproved: true });
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    await Dish.findByIdAndUpdate(review.dish, { rating: avgRating.toFixed(1), numReviews: reviews.length });

    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getReviews, getReviewsByDish, getMyReviews, createReview, updateReview, deleteReview };
