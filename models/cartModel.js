const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const Customer = require('./customerModel');

const Cart = sequelize.define(
  'carts',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'carts',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
);

Customer.hasOne(Cart, { foreignKey: 'customer_id', onDelete: 'CASCADE' });
Cart.belongsTo(Customer, { foreignKey: 'customer_id' });

module.exports = Cart;
