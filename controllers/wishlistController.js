const Wishlist = require('../models/wishlistModel');
const Product = require('../models/productModel');

exports.addToWishlist = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: 'Product ID required' });
    }

    const exists = await Wishlist.findOne({ where: { user_id, product_id } });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }

    await Wishlist.create({ user_id, product_id });

    res.status(201).json({ success: true, message: 'Product added to wishlist' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ success: false, message: 'Error adding to wishlist' });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params; 

    const item = await Wishlist.findOne({ where: { id, user_id } });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Wishlist item not found' });
    }

    await item.destroy();
    res.status(200).json({ success: true, message: 'Product removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ success: false, message: 'Error removing from wishlist' });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const user_id = req.user.id;
    const wishlist = await Wishlist.findAll({
      where: { user_id },
      include: [{ model: Product, attributes: ['id', 'name', 'price', 'images'] }],
      order: [['id', 'DESC']],
    });

    res.status(200).json({ success: true, wishlist });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ success: false, message: 'Error fetching wishlist' });
  }
};
