const express = require("express");
const authController = require("./auth.controller");
const {
  sellerStrategy,
  localStrategy,

} = require("../../../middleware/strategy");

const authRouter = express.Router();

authRouter.route("/register").post(authController.addUser);

authRouter.route("/user/getAllUserList").get(authController.getAllUserList);

authRouter.route("/user/update").post(authController.userUpdate);

authRouter.route("/user/sendReset").post(authController.sendReset);

authRouter.route("/user/delete").post(authController.deleteUserList);

authRouter.route("/getUserByEmailId").get(authController.findUser);

authRouter.route("/rootLogin").post(localStrategy, authController.login);

authRouter.route("/seller/login").post(sellerStrategy, authController.sellerLogin);

authRouter.route("/seller/profile-details").get(authController.getSellerUser);

authRouter.route("/seller/profile-update").post(authController.sellerProfileUpdate);

module.exports = authRouter;
