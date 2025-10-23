const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const User = require('./userModel');
const Product = require('./productModel');

const Wishlist = sequelize.define(
  'wishlist',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'wishlist',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
);

User.hasMany(Wishlist, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Wishlist.belongsTo(User, { foreignKey: 'user_id' });

Product.hasMany(Wishlist, { foreignKey: 'product_id', onDelete: 'CASCADE' });
Wishlist.belongsTo(Product, { foreignKey: 'product_id' });

module.exports = Wishlist;
