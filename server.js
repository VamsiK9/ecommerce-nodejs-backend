const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const sequelize = require('./models');
const errorHandler = require('./middleware/errorHandler');

const userRoutes = require('./routes/userRoutes');
const customerRoutes = require('./routes/customerRoutes');
const storeRoutes = require('./routes/storeRoutes');
const storeProductRoutes = require('./routes/storeProductRoutes');
const brandRoutes = require('./routes/brandRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

require('./models/userModel');
require('./models/storeModel');
require('./models/customerModel');
require('./models/addressModel');
require('./models/brandModel');
require('./models/categoryModel');
require('./models/productModel');
require('./models/storeProductModel');
require('./models/orderModel');
require('./models/orderItemModel');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/store-products', storeProductRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);

app.get('/', (req, res) => res.send('API is running...'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

sequelize
  .sync()
  .then(() => {
    console.log('Database connected & models synced');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('DB connection failed:', err));
