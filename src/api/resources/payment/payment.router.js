const express = require('express');
const paymentController = require('./payment.controller');
const { jwtStrategy } = require('../../../middleware/strategy');

const paymentRouter = express.Router();

paymentRouter.route('/orders').post(paymentController.orderDetails);
paymentRouter.route('/card-detail').post(paymentController.findOrderList);
paymentRouter.route('/getKey').get(paymentController.getKey);
paymentRouter.route('/getAllPayment').get(jwtStrategy, paymentController.getAllPayment);

// Uncomment the following lines if needed
// paymentRouter.route('/verification').post(paymentController.paymentVerification);
// paymentRouter.route('/verification').post(paymentController.paymentSuccess);

module.exports = paymentRouter;
