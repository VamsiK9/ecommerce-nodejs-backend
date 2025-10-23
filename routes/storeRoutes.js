const express = require('express');
const { getNearbyStores } = require('../controllers/storeController');

const router = express.Router();
const {
  createStore,
  getAllStores,
  getStoreById,
} = require('../controllers/storeController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createStore);
router.get('/nearby/:customerId', getNearbyStores);

router.get('/', getAllStores);
router.get('/:id', getStoreById);

module.exports = router;
