const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  createOrder,
  getOrdersByUser,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  getSalesByStore,
  getSalesByBrand,
  getDashboardSummary,
  createPaymentOrder,
  verifyPayment
} = require("../controllers/orderController");

router.post("/", authMiddleware, createOrder);

router.get("/user", authMiddleware, getOrdersByUser);

router.get("/all", authMiddleware, getAllOrders);

router.get("/:id", authMiddleware, getOrderById);
router.put("/:id/status", authMiddleware, updateOrderStatus);

router.get("/analytics/store", authMiddleware, getSalesByStore);
router.get("/analytics/brand", authMiddleware, getSalesByBrand);
router.get("/analytics/dashboard", authMiddleware, getDashboardSummary);

router.post("/create-payment", authMiddleware, createPaymentOrder);
router.post("/verify-payment", authMiddleware, verifyPayment);

module.exports = router;
