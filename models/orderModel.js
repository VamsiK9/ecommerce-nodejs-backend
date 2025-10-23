const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const User = require('./userModel');
const Store = require('./storeModel');

const Order = sequelize.define(
  'orders',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    total_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
      defaultValue: 'pending',
    },
    order_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    razorpay_order_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    razorpay_payment_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    razorpay_signature: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
);

User.hasMany(Order, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'user_id' });

Store.hasMany(Order, { foreignKey: 'store_id', onDelete: 'SET NULL' });
Order.belongsTo(Store, { foreignKey: 'store_id' });

module.exports = Order;
