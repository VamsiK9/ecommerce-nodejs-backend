const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} = require('../controllers/wishlistController');

router.post('/add', authMiddleware, addToWishlist);
router.delete('/remove/:id', authMiddleware, removeFromWishlist);
router.get('/', authMiddleware, getWishlist);

module.exports = router;
