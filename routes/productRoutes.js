const express = require('express');
const router = express.Router();
const uploadMemory = require('../middleware/uploadMemory');
const authMiddleware = require('../middleware/authMiddleware');
const {
  createProduct,
  getAllProducts,
  getProductById,
  getPublicProducts,
  getProductsByCategory,
  getProductsByStore,
  searchProducts,
  updateProduct,
  updateProductImages,
  deleteProduct
} = require('../controllers/productController');

router.post('/', authMiddleware, uploadMemory.array('images'), createProduct);
router.put('/:id', authMiddleware, uploadMemory.array('images'), updateProduct);
router.put('/:id/images', authMiddleware, uploadMemory.array('images'), updateProductImages);

router.delete('/:id', authMiddleware, deleteProduct);

router.get('/public/all', getPublicProducts);
router.get('/public/category/:categoryId', getProductsByCategory);
router.get('/public/store/:storeId', getProductsByStore);
router.get('/public/search', searchProducts);
router.get('/', getAllProducts);
router.get('/:id', getProductById);

module.exports = router;
