const express = require('express');
const businessController = require('./business.controller');
const { sanitize } = require('../../../middleware/sanitizer');
const { jwtStrategy } = require('../../../middleware/strategy');

const businessRouter = express.Router();

businessRouter.route('/getAllProductProfit').get( 
  businessController.getAllBill
);

module.exports = businessRouter;
