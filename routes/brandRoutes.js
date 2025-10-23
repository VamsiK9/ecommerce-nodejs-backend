const express = require('express');
const router = express.Router();
const {
  createBrand,
  getAllBrands,
  getBrandById,
} = require('../controllers/brandController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createBrand);

router.get('/', getAllBrands);
router.get('/:id', getBrandById);

module.exports = router;
