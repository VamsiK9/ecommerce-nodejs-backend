const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Customer = require('../models/customerModel');
const Address = require('../models/addressModel');
require('dotenv').config();

exports.registerCustomer = async (req, res, next) => {
  try {
    const { name, email, password, latitude, longitude } = req.body;

    if (!name || !email || !password || !latitude || !longitude) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await Customer.findOne({ where: { email } });
    if (existing)
      return res.status(400).json({ message: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);

    const customer = await Customer.create({ name, email, password: hashed });

    await Address.create({
      customer_id: customer.id,
      address_line: 'Default Address',
      latitude,
      longitude,
    });

    res.status(201).json({
      message: 'Customer registered successfully',
      customer: { id: customer.id, name: customer.name, email: customer.email },
    });
  } catch (error) {
    next(error);
  }
};

exports.loginCustomer = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const customer = await Customer.findOne({ where: { email } });
    if (!customer)
      return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: customer.id, email: customer.email, type: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      customer: { id: customer.id, name: customer.name, email: customer.email },
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.user.id, {
      include: { model: Address },
      attributes: ['id', 'name', 'email', 'created_at'],
    });

    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    res.status(200).json(customer);
  } catch (error) {
    next(error);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const { address_line, latitude, longitude } = req.body;

    const address = await Address.findOne({
      where: { customer_id: req.user.id },
    });

    if (!address) return res.status(404).json({ message: 'Address not found' });

    await address.update({ address_line, latitude, longitude });

    res.status(200).json({ message: 'Address updated successfully' });
  } catch (error) {
    next(error);
  }
};
