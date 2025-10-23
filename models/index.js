const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.MYSQL_DB,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
    logging: false,

    define: {
      timestamps: true,             
      createdAt: 'createdAt',       
      updatedAt: 'updatedAt',       
      freezeTableName: true,        
    },
  }
);

module.exports = sequelize;
