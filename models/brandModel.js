const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Brand = sequelize.define(
  'brands',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'brands',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
);

module.exports = Brand;
