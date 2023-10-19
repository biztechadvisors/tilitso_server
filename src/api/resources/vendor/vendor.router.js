const express = require('express');
const vendorController = require('./vendor.controller');
const { jwtStrategy } = require('../../../middleware/strategy');

const vendorRouter = express.Router();

// Admin panel
vendorRouter.route('/list').get(jwtStrategy, vendorController.getAllvendor);

// Seller dashboard API
vendorRouter.route('/shop-create').post(
  jwtStrategy,
  vendorController.sellerShopCreate
);

vendorRouter.route('/shop-detail').get(
  jwtStrategy,
  vendorController.sellerShopDetail
);

vendorRouter.route('/shop-delete').delete(
  jwtStrategy,
  vendorController.sellerShopDelete
);

// Website vendor
vendorRouter.route('/contact-create').post(
  vendorController.websiteVendorContactCreate
);

vendorRouter.route('/sellar/website-list').get(
  jwtStrategy,
  vendorController.websiteVendorContactList
);

vendorRouter.route('/product/getAllProductById').get(
  jwtStrategy,
  vendorController.sellerProductList
);

module.exports = vendorRouter;
