const Cart = require('../models/cartModel');
const CartItem = require('../models/cartItemModel');
const Product = require('../models/productModel');

exports.addToCart = async (req, res) => {
  try {
    const customer_id = req.user.id; 
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity)
      return res.status(400).json({ message: 'Product ID and quantity are required' });

    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let cart = await Cart.findOne({ where: { customer_id } });
    if (!cart) {
      cart = await Cart.create({ customer_id, total_price: 0 });
    }

    let item = await CartItem.findOne({
      where: { cart_id: cart.id, product_id },
    });

    if (item) {
      item.quantity += quantity;
      item.price = product.price * item.quantity;
      await item.save();
    } else {
      item = await CartItem.create({
        cart_id: cart.id,
        product_id,
        quantity,
        price: product.price * quantity,
      });
    }

    const items = await CartItem.findAll({ where: { cart_id: cart.id } });
    const total_price = items.reduce((sum, i) => sum + i.price, 0);
    await cart.update({ total_price });

    res.status(200).json({
      success: true,
      message: 'Product added to cart successfully',
      cart,
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, message: 'Error adding to cart' });
  }
};

exports.getCart = async (req, res) => {
  try {
    const customer_id = req.user.id;
    const cart = await Cart.findOne({
      where: { customer_id },
      include: {
        model: CartItem,
        include: { model: Product, attributes: ['id', 'name', 'price', 'images'] },
      },
    });

    if (!cart) return res.status(404).json({ message: 'Cart is empty' });

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ success: false, message: 'Error fetching cart' });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const item = await CartItem.findByPk(id);
    if (!item) return res.status(404).json({ message: 'Cart item not found' });

    const product = await Product.findByPk(item.product_id);
    item.quantity = quantity;
    item.price = product.price * quantity;
    await item.save();

    const cart = await Cart.findByPk(item.cart_id);
    const items = await CartItem.findAll({ where: { cart_id: cart.id } });
    const total_price = items.reduce((sum, i) => sum + i.price, 0);
    await cart.update({ total_price });

    res.status(200).json({ success: true, message: 'Cart updated', cart });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ success: false, message: 'Error updating cart' });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await CartItem.findByPk(id);
    if (!item) return res.status(404).json({ message: 'Cart item not found' });

    const cart = await Cart.findByPk(item.cart_id);
    await item.destroy();

    const items = await CartItem.findAll({ where: { cart_id: cart.id } });
    const total_price = items.reduce((sum, i) => sum + i.price, 0);
    await cart.update({ total_price });

    res.status(200).json({ success: true, message: 'Cart item removed' });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ success: false, message: 'Error removing cart item' });
  }
};
