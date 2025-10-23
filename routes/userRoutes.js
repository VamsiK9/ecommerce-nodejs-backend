const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getAllUsers,
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/', authMiddleware, getAllUsers);

module.exports = router;
