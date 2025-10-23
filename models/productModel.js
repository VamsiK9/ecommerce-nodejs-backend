const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const Brand = require('./brandModel');
const Category = require('./categoryModel');
const Store = require('./storeModel');

const Product = sequelize.define(
  'products',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    brand_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: 'products',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
);

Brand.hasMany(Product, {
  foreignKey: 'brand_id',
  onDelete: 'SET NULL',
});
Product.belongsTo(Brand, {
  foreignKey: 'brand_id',
});

Product.belongsToMany(Category, {
  through: {
    model: 'product_categories',
    unique: false,
  },
  foreignKey: 'product_id',
  timestamps: false, 
});
Category.belongsToMany(Product, {
  through: {
    model: 'product_categories',
    unique: false,
  },
  foreignKey: 'category_id',
  timestamps: false,
});

Store.hasMany(Product, { foreignKey: 'store_id', onDelete: 'SET NULL' });
Product.belongsTo(Store, { foreignKey: 'store_id' });

module.exports = Product;
