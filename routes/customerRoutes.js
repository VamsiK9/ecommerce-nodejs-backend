const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  loginCustomer,
  getProfile,
  updateAddress,
} = require('../controllers/customerController');

const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);

router.get('/profile', authMiddleware, getProfile);
router.put('/address', authMiddleware, updateAddress);

module.exports = router;
