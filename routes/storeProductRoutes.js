const express = require('express');
const router = express.Router();
const {
  assignProductsToStore,
  getProductsByStore,
  getStoresByProduct,
} = require('../controllers/storeProductController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/assign', authMiddleware, assignProductsToStore);

router.get('/store/:id', getProductsByStore);
router.get('/product/:id', getStoresByProduct);

module.exports = router;
