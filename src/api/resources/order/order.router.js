const express = require('express');
const orderController = require('./order.controller');
const { jwtCustomerStrategy } = require('../../../middleware/strategy');

const orderRouter = express.Router();

// Track order route
orderRouter.route('/track-order').get(orderController.getOrderTracking);

// Calculate shipping cost route
orderRouter.route('/calculateShippingCost').get(orderController.calculateShippingCost);

// Shiprocket update address route
orderRouter.route('/shiprocket-updateAddress').post(orderController.getupdateOrederAddress);

// Create order route
orderRouter.route('/create').post(orderController.index);

// List all orders route
orderRouter.route('/list').post(orderController.getAllOrderList);

// List total dash orders route
orderRouter.route('/totalDash-list').get(orderController.getDetailAdmin);

// Update order status route
orderRouter.route('/status/update').post(orderController.statusUpdate);

// List orders by customer route
orderRouter.route('/list-by-customer').post(orderController.getAllOrderListById);

// Get all order statuses route
orderRouter.route('/status').post(orderController.getAllOrderStatus);

// Get order count route
orderRouter.route('/count').get(orderController.getAllOrderCount);

// Get order notifications route
orderRouter.route('/notifications').get(orderController.getOrderNotifications);

// Get order details by ID route
orderRouter.route('/details-by-id').post(orderController.getOrderDetailsById);

// Delete order by product route
orderRouter.route('/delete-by-product').post(orderController.getOrderDeleteByProduct);

// Delete order list route
orderRouter.route('/delete-list').post(orderController.deleteOrderList);

// Order status issue route
orderRouter.route('/status-issue').post(orderController.orderStatusIssue);

// Cancel order by product route
orderRouter.route('/cancel-by-product').post(orderController.getOrderCancel);

// Get return orders route
orderRouter.route('/getReturn-allOrder').post(orderController.getreturnAllOrder);

orderRouter.route('/OrderMatrix').post(orderController.getAllOrderGraph)

orderRouter.route('/getAllOrderInfo').get(orderController.getAllOrderInfo)


module.exports = orderRouter;
