const express = require("express");
const customerController = require("./customer.controller");
const { sanitize } = require("../../../middleware/sanitizer");
const {
  localCustomerStrategy,
  jwtCustomerStrategy,
  googleLoginStrategy,
  googleLoginWithIdTokenStrategy,
  googleLoginCallbackStrategy,
  firebaseLoginWithIdTokenStrategy,
} = require("../../../middleware/strategy");

const customerRouter = express.Router();

// User registration
customerRouter.route("/register").post(customerController.addUser);

// Get user by email ID
customerRouter.route("/getUserByEmailId").get(customerController.findUser);

// User login using local strategy
customerRouter.route("/rootLogin").post(localCustomerStrategy, customerController.login);

// User check
customerRouter.route("/rootCheck").post(customerController.rootUserCheck);

// Password reset routes
customerRouter.route("/sendReset").post(customerController.sendReset);
customerRouter.route("/forget-password").post(customerController.forgetPassword);
customerRouter.route("/reset").post(customerController.resetPassword);
customerRouter.route("/reset-password").post(customerController.customerPasswordReset);

// Email verification route
customerRouter.route("/email-verify").post(customerController.emailVerify);

// Google login routes
customerRouter.get("/google", googleLoginStrategy);
customerRouter.get("/google/callback", googleLoginCallbackStrategy, customerController.googleLogin);
customerRouter.post("/googleLoginIdToken", googleLoginWithIdTokenStrategy, customerController.login);

// Phone login using Firebase
customerRouter.post("/phoneLogin", firebaseLoginWithIdTokenStrategy, customerController.login);

// User list, update, delete routes
customerRouter.route("/list").post(customerController.getAllCustomer);
customerRouter.route("/update").post(jwtCustomerStrategy, customerController.getCustomerUpdate);
customerRouter.route("/delete").delete(customerController.deleteCustomer);

// Address related routes
customerRouter.route("/add-new-address").post(jwtCustomerStrategy, customerController.addNewAddress);
customerRouter.route("/delete-address").post(jwtCustomerStrategy, customerController.deleteAddress);

module.exports = customerRouter;
