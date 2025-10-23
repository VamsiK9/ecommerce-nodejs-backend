const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const Store = require('./storeModel');
const Product = require('./productModel');

const StoreProduct = sequelize.define('store_products', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  stock_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  price_override: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
});

Store.belongsToMany(Product, {
  through: StoreProduct,
  foreignKey: 'store_id',
});
Product.belongsToMany(Store, {
  through: StoreProduct,
  foreignKey: 'product_id',
});

module.exports = StoreProduct;
