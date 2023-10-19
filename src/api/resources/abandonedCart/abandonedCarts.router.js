const express = require("express");
const abandonedCartsController = require("./abandonedCarts.controller");

const abandonedCartsRouter = express.Router();

abandonedCartsRouter.route("/insertCart").post(
  abandonedCartsController.abandonedCartInsert
);

abandonedCartsRouter.route("/getCart").get(
  abandonedCartsController.getAbandonedCartCount
);

abandonedCartsRouter.route("/removeCart/:itemId").delete(
  abandonedCartsController.removeProductFromCart
);

abandonedCartsRouter.route("/insertWishList").post(
  abandonedCartsController.abandonedWishListInsert
);

abandonedCartsRouter.route("/getWishList").get(
  abandonedCartsController.getAbandonedWishListCount
);

abandonedCartsRouter.route("/removeWishList/:itemId").delete(
  abandonedCartsController.removeProductFromWishList
);

abandonedCartsRouter.route("/clearCart").put(
  abandonedCartsController.clearCart
);

abandonedCartsRouter.route("/clearWishlist").put(
  abandonedCartsController.clearWishlist
);

module.exports = abandonedCartsRouter;
