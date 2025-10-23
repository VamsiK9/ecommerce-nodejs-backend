const Store = require('../models/storeModel');
const { QueryTypes } = require('sequelize');
const sequelize = require('../models/index');
const Address = require('../models/addressModel');

exports.getNearbyStores = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const distanceLimit = parseFloat(req.query.distance) || 5; // default 5 km

    const address = await Address.findOne({ where: { customer_id: customerId } });

    if (!address) {
      return res.status(404).json({ message: 'Customer address not found' });
    }

    const { latitude, longitude } = address;

    const query = `
      SELECT id, name, city, address, latitude, longitude,
      (6371 * acos(
          cos(radians(:lat)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(:lng)) +
          sin(radians(:lat)) * sin(radians(latitude))
      )) AS distance
      FROM stores
      HAVING distance <= :distance
      ORDER BY distance ASC;
    `;

    const nearbyStores = await sequelize.query(query, {
      replacements: { lat: latitude, lng: longitude, distance: distanceLimit },
      type: QueryTypes.SELECT,
    });

    res.status(200).json({
      message: `✅ Stores within ${distanceLimit} km of customer ${customerId}`,
      total: nearbyStores.length,
      stores: nearbyStores,
    });
  } catch (error) {
    console.error('Error fetching nearby stores:', error);
    next(error);
  }
};

exports.createStore = async (req, res, next) => {
  try {
    const { name, code, contact, address, city, latitude, longitude } = req.body;

    if (!name || !code || !latitude || !longitude) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await Store.findOne({ where: { code } });
    if (existing) {
      return res.status(400).json({ message: 'Store code already exists' });
    }

    const store = await Store.create({
      name,
      code,
      contact,
      address,
      city,
      latitude,
      longitude,
    });

    res.status(201).json({
      message: '✅ Store created successfully',
      store,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllStores = async (req, res, next) => {
  try {
    const stores = await Store.findAll();
    res.status(200).json(stores);
  } catch (error) {
    next(error);
  }
};

exports.getStoreById = async (req, res, next) => {
  try {
    const store = await Store.findByPk(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    res.status(200).json(store);
  } catch (error) {
    next(error);
  }
};
