const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
} = require('../controllers/cartController');

router.post('/add', authMiddleware, addToCart);
router.get('/', authMiddleware, getCart);
router.put('/update/:id', authMiddleware, updateCartItem);
router.delete('/remove/:id', authMiddleware, removeCartItem);

module.exports = router;
