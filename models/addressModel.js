const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const Customer = require('./customerModel');

const Address = sequelize.define('addresses', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  address_line: {
    type: DataTypes.STRING,
    defaultValue: 'Default Address',
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
  },
});

Customer.hasOne(Address, { foreignKey: 'customer_id', onDelete: 'CASCADE' });
Address.belongsTo(Customer, { foreignKey: 'customer_id' });

module.exports = Address;
