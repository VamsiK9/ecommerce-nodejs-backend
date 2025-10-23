const Store = require('../models/storeModel');
const Product = require('../models/productModel');
const StoreProduct = require('../models/storeProductModel');

exports.assignProductsToStore = async (req, res, next) => {
  try {
    const { store_id, product_ids, stock_quantity } = req.body;

    if (!store_id || !product_ids)
      return res.status(400).json({ message: 'store_id and product_ids required' });

    const store = await Store.findByPk(store_id);
    if (!store) return res.status(404).json({ message: 'Store not found' });

    let productArray = product_ids;
    if (typeof product_ids === 'string') productArray = JSON.parse(product_ids);

    const products = await Product.findAll({ where: { id: productArray } });
    if (products.length !== productArray.length)
      return res.status(400).json({ message: 'One or more invalid product IDs' });

    await store.addProducts(productArray, {
      through: { stock_quantity: stock_quantity || 0 },
    });

    res.status(200).json({ message: '✅ Products assigned successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getProductsByStore = async (req, res, next) => {
  try {
    const store = await Store.findByPk(req.params.id, {
      include: [
        {
          model: Product,
          through: { attributes: ['stock_quantity', 'price_override'] },
        },
      ],
    });
    if (!store) return res.status(404).json({ message: 'Store not found' });
    res.status(200).json(store);
  } catch (err) {
    next(err);
  }
};

exports.getStoresByProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Store,
          through: { attributes: ['stock_quantity', 'price_override'] },
        },
      ],
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};
