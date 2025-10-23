const Order = require('../models/orderModel');
const OrderItem = require('../models/orderItemModel');
const Product = require('../models/productModel');
const Store = require('../models/storeModel');
const Brand = require('../models/brandModel');
const { Sequelize } = require('sequelize');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');

exports.createOrder = async (req, res) => {
  try {
    console.log("Incoming Order Request:", req.body);

    const { store_id, items } = req.body;
    const user_id = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: 'No items provided for order' });

    let total = 0;
    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      if (!product)
        return res.status(400).json({ message: `Invalid product ID: ${item.product_id}` });
      total += product.price * item.quantity;
    }

    const order = await Order.create({
      user_id,
      store_id: store_id || null,
      total_amount: total,
      status: 'pending',
    });

    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      await OrderItem.create({
        order_id: order.id,
        product_id: product.id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order_id: order.id,
      total,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Error placing order' });
  }
};

exports.getOrdersByUser = async (req, res) => {
  try {
    const user_id = req.user.id;

    const orders = await Order.findAll({
      where: { user_id },
      include: [
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ['name', 'price', 'images'] }],
        },
        { model: Store, attributes: ['id', 'name'] },
      ],
      order: [['id', 'DESC']],
    });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ success: false, message: 'Error fetching user orders' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ['name', 'price', 'images'] }],
        },
        { model: Store, attributes: ['id', 'name'] },
      ],
    });

    if (!order)
      return res.status(404).json({ success: false, message: 'Order not found' });

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ success: false, message: 'Error fetching order details' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'paid', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Error updating order status' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { status, store_id, page = 1, limit = 10 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (store_id) where.store_id = store_id;

    const offset = (page - 1) * limit;

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ['id', 'name', 'price', 'images'] }],
        },
        { model: Store, attributes: ['id', 'name', 'city'] },
      ],
      limit: parseInt(limit),
      offset,
      order: [['id', 'DESC']],
      distinct: true,
    });

    res.status(200).json({
      success: true,
      totalOrders: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      orders,
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ success: false, message: 'Error fetching all orders' });
  }
};

exports.getSalesByStore = async (req, res) => {
  try {
    const sales = await Order.findAll({
      attributes: [
        'store_id',
        [Sequelize.fn('COUNT', Sequelize.col('orders.id')), 'total_orders'],
        [Sequelize.fn('SUM', Sequelize.col('orders.total_amount')), 'total_revenue'],
      ],
      include: [{ model: Store, attributes: ['id', 'name', 'city'] }],
      group: ['store_id', 'Store.id'],
      order: [[Sequelize.literal('total_revenue'), 'DESC']],
    });

    res.status(200).json({ success: true, sales });
  } catch (err) {
    console.error('Error fetching sales by store:', err);
    res.status(500).json({ success: false, message: 'Error fetching sales by store' });
  }
};

exports.getSalesByBrand = async (req, res) => {
  try {
    const sales = await OrderItem.findAll({
      attributes: [
        [Sequelize.col('Product.brand_id'), 'brand_id'],
        [Sequelize.fn('SUM', Sequelize.col('order_items.price')), 'total_revenue'],
        [Sequelize.fn('SUM', Sequelize.col('order_items.quantity')), 'total_quantity'],
      ],
      include: [
        {
          model: Product,
          attributes: [],
          include: [{ model: Brand, attributes: ['id', 'name'] }],
        },
      ],
      group: ['Product.brand_id', 'Product.Brand.id', 'Product.Brand.name'],
      raw: true,
      order: [[Sequelize.literal('total_revenue'), 'DESC']],
    });

    const formattedSales = sales.map((s) => ({
      brand_id: s['brand_id'],
      brand_name: s['Product.Brand.name'],
      total_revenue: parseFloat(s['total_revenue']),
      total_quantity: parseInt(s['total_quantity'], 10),
    }));

    res.status(200).json({ success: true, sales: formattedSales });
  } catch (err) {
    console.error('Error fetching sales by brand:', err);
    res.status(500).json({ success: false, message: 'Error fetching sales by brand' });
  }
};

exports.getDashboardSummary = async (req, res) => {
  try {
    const totalProducts = await Product.count();
    const activeProducts = await Product.count({ where: { status: 'active' } });
    const inactiveProducts = await Product.count({ where: { status: 'inactive' } });
    const totalOrders = await Order.count();
    const totalRevenue = await Order.sum('total_amount');

    const bestSelling = await OrderItem.findAll({
      attributes: [
        'product_id',
        [Sequelize.fn('SUM', Sequelize.col('order_items.quantity')), 'totalSold'],
        [Sequelize.fn('SUM', Sequelize.col('order_items.price')), 'totalRevenue'],
      ],
      include: [{ model: Product, attributes: ['name', 'price', 'images'] }],
      group: ['order_items.product_id', 'Product.id'],
      order: [[Sequelize.literal('totalSold'), 'DESC']],
      limit: 5,
    });

    res.status(200).json({
      success: true,
      message: 'Dashboard Summary Retrieved Successfully',
      data: {
        totals: {
          products: totalProducts,
          orders: totalOrders,
          revenue: totalRevenue || 0,
        },
        productsStatus: {
          active: activeProducts,
          inactive: inactiveProducts,
        },
        bestSelling,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ success: false, message: 'Error fetching dashboard summary' });
  }
};

exports.createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt, orderId } = req.body;

    if (!amount)
      return res.status(400).json({ success: false, message: "Amount required" });

    const options = {
      amount: amount * 100,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    await Order.update(
      { razorpay_order_id: razorpayOrder.id },
      { where: { id: orderId } }
    );

    res.status(200).json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ success: false, message: "Payment order creation failed" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      await Order.update(
        {
          status: "paid",
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        },
        { where: { id: orderId } }
      );

      return res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};
