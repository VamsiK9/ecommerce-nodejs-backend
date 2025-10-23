const Brand = require('../models/brandModel');

exports.createBrand = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Brand name is required' });
    }

    const existing = await Brand.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({ message: 'Brand already exists' });
    }

    const brand = await Brand.create({
      name,
      created_by: req.user ? req.user.email : 'system',
    });

    res.status(201).json({
      message: 'Brand created successfully',
      brand,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllBrands = async (req, res, next) => {
  try {
    const brands = await Brand.findAll();
    res.status(200).json(brands);
  } catch (error) {
    next(error);
  }
};

exports.getBrandById = async (req, res, next) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.status(200).json(brand);
  } catch (error) {
    next(error);
  }
};
