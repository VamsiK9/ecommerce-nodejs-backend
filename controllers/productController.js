const uploadBufferToCloudinary = require('../utils/cloudinaryUpload');
const Product = require('../models/productModel');
const Brand = require('../models/brandModel');
const Category = require('../models/categoryModel');
const Store = require('../models/storeModel');
const { Op } = require('sequelize');
const cloudinary = require('../config/cloudinary');

exports.createProduct = async (req, res, next) => {
  try {
    const { name, sku, description, price, status, brand_id, category_ids, store_id } = req.body;

    if (!name || !sku || !price || !brand_id || !category_ids) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const validStatuses = ['active', 'inactive'];
    const cleanStatus = validStatuses.includes(status) ? status : 'active';

    let categoryArray = category_ids;
    if (typeof category_ids === 'string') {
      try {
        categoryArray = JSON.parse(category_ids);
      } catch {
        categoryArray = category_ids.split(',').map((v) => parseInt(v.trim(), 10));
      }
    }

    const brand = await Brand.findByPk(brand_id);
    if (!brand) return res.status(400).json({ message: 'Invalid brand_id' });

    const categories = await Category.findAll({ where: { id: categoryArray } });
    if (categories.length !== categoryArray.length) {
      return res.status(400).json({ message: 'One or more invalid category IDs' });
    }

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadBufferToCloudinary(file.buffer, 'products');
        imageUrls.push({
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
        });
      }
    }

    const product = await Product.create({
      name,
      sku,
      description,
      price,
      status: cleanStatus,
      brand_id,
      store_id: store_id || null,
      images: imageUrls.length > 0 ? imageUrls : null,
    });

    await product.setCategories(categoryArray);

    res.status(201).json({
      success: true,
      message: '✅ Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'SKU already exists — please use a unique SKU',
      });
    }
    res.status(500).json({ success: false, message: 'Error creating product' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, brand_id, category_ids, status } = req.body;

    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const validStatuses = ['active', 'inactive'];
    const cleanStatus = validStatuses.includes(status) ? status : product.status;

    Object.assign(product, {
      name: name ?? product.name,
      description: description ?? product.description,
      price: price ?? product.price,
      brand_id: brand_id ?? product.brand_id,
      status: cleanStatus,
    });

    if (req.files && req.files.length > 0) {
      const uploadedImages = await Promise.all(
        req.files.map(async (file) => {
          const result = await uploadBufferToCloudinary(file.buffer, 'products');
          return {
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
          };
        })
      );

      if (product.images && Array.isArray(product.images)) {
        for (const img of product.images) {
          if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
        }
      }

      product.images = uploadedImages;
    }

    await product.save();

    if (category_ids) {
      let categoryArray = category_ids;
      if (typeof category_ids === 'string') {
        try {
          categoryArray = JSON.parse(category_ids);
        } catch {
          categoryArray = category_ids.split(',').map((v) => parseInt(v.trim(), 10));
        }
      }
      const categories = await Category.findAll({ where: { id: categoryArray } });
      await product.setCategories(categories);
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Error updating product' });
  }
};

exports.updateProductImages = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    let imageUrls = product.images || [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadBufferToCloudinary(file.buffer, 'products');
        imageUrls.push({
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
        });
      }
    }

    await product.update({ images: imageUrls });

    res.status(200).json({
      success: true,
      message: 'Product images updated successfully',
      images: imageUrls,
    });
  } catch (err) {
    console.error('Error updating images:', err);
    res.status(500).json({ success: false, message: 'Error updating product images' });
  }
};

exports.getPublicProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { status: 'active' },
      include: [
        { model: Brand, attributes: ['id', 'name'] },
        { model: Category, attributes: ['id', 'name'], through: { attributes: [] } },
        { model: Store, attributes: ['id', 'name', 'city'] },
      ],
      order: [['id', 'DESC']],
    });

    res.status(200).json({ success: true, products });
  } catch (err) {
    console.error('Error fetching public products:', err);
    res.status(500).json({ success: false, message: 'Error fetching public products' });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findByPk(categoryId);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const products = await Product.findAll({
      include: [
        { model: Category, where: { id: categoryId }, attributes: ['id', 'name'], through: { attributes: [] } },
        { model: Brand, attributes: ['id', 'name'] },
      ],
      where: { status: 'active' },
    });

    res.status(200).json({ success: true, category: category.name, products });
  } catch (err) {
    console.error('Error fetching products by category:', err);
    res.status(500).json({ success: false, message: 'Error fetching products by category' });
  }
};

exports.getProductsByStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const store = await Store.findByPk(storeId);
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });

    const products = await Product.findAll({
      where: { store_id: storeId, status: 'active' },
      include: [
        { model: Brand, attributes: ['id', 'name'] },
        { model: Category, attributes: ['id', 'name'], through: { attributes: [] } },
      ],
    });

    res.status(200).json({ success: true, store: store.name, products });
  } catch (err) {
    console.error('Error fetching products by store:', err);
    res.status(500).json({ success: false, message: 'Error fetching products by store' });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { search, brand_id, category_id, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

    const where = { status: 'active' };
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }
    if (minPrice) where.price = { [Op.gte]: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...(where.price || {}), [Op.lte]: parseFloat(maxPrice) };
    if (brand_id) where.brand_id = brand_id;

    const include = [
      { model: Brand, attributes: ['id', 'name'] },
      { model: Category, attributes: ['id', 'name'], through: { attributes: [] } },
    ];
    if (category_id) include[1].where = { id: category_id };

    const offset = (page - 1) * limit;
    const { count, rows } = await Product.findAndCountAll({
      where,
      include,
      offset,
      limit: parseInt(limit),
      distinct: true,
      order: [['id', 'DESC']],
    });

    res.status(200).json({
      success: true,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      products: rows,
    });
  } catch (err) {
    console.error('Error searching products:', err);
    res.status(500).json({ success: false, message: 'Error searching products' });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Brand, attributes: ['id', 'name'] },
        { model: Category, attributes: ['id', 'name'], through: { attributes: [] } },
        { model: Store, attributes: ['id', 'name', 'city'] },
      ],
      order: [['id', 'DESC']],
    });

    res.status(200).json({ success: true, products });
  } catch (err) {
    console.error('Error fetching all products:', err);
    res.status(500).json({ success: false, message: 'Error fetching all products' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, {
      include: [
        { model: Brand, attributes: ['id', 'name'] },
        { model: Category, attributes: ['id', 'name'], through: { attributes: [] } },
        { model: Store, attributes: ['id', 'name', 'city'] },
      ],
    });

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    res.status(200).json({ success: true, product });
  } catch (err) {
    console.error('Error fetching product by ID:', err);
    res.status(500).json({ success: false, message: 'Error fetching product by ID' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [{ model: Category, attributes: ['id', 'name'] }],
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.setCategories([]);

    if (product.images && Array.isArray(product.images)) {
      for (const img of product.images) {
        if (img.public_id) {
          await require('../config/cloudinary').uploader.destroy(img.public_id);
        }
      }
    }

    await product.destroy();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully (images and relations cleaned up)',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Error deleting product' });
  }
};

