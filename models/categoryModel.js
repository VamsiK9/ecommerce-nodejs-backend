const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Category = sequelize.define(
  'categories',
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
  },
  {
    tableName: 'categories',
    timestamps: false, 
  }
);

module.exports = Category;
