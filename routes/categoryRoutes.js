const express = require('express');
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getCategoryById,
} = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createCategory);

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

module.exports = router;
