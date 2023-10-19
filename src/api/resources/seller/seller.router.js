const express = require("express");
const sellerController = require("./seller.controller");
// const { jwtStrategy } = require("../../../middleware/strategy");
const upload = require("../../../awsbucket");

const sellerRouter = express.Router();

sellerRouter.route("/product/create").post(

  sellerController.createProduct
);

sellerRouter.route("/product/update").put(

  sellerController.updateProduct
);

sellerRouter.route("/product/list").post(

  sellerController.getAllProduct
);

sellerRouter.route("/product/list-by-id").post(

  sellerController.getPrductById
);

sellerRouter.route("/admin/product/search").get(
  sellerController.sellerImageDetailByid
);

sellerRouter.route("/image/single-upload").put(

  upload.single("thumbnail"),
  sellerController.uploadSingleImage
);

sellerRouter.route("/image/main-upload").put(
  upload.single("thumbnail"),
  sellerController.uploadMainProdImage
);

sellerRouter.route("/image/delete").put(

  sellerController.deleteThumbnail
);

sellerRouter.route("/image/main-delete").put(

  sellerController.deleteMainProdImage
);

sellerRouter.route("/product/getAllList").get(

  sellerController.getAllList
);

sellerRouter.route("/coupon/create").post(

  sellerController.couponCreate
);

sellerRouter.route("/coupon/list").get(

  sellerController.couponList
);

sellerRouter.route("/coupon").delete(

  sellerController.couponDelete
);

sellerRouter.route("/brand/list").get(

  sellerController.getAllBrandList
);

sellerRouter.route("/all-product-list").get(
  sellerController.getAllProductList
);

sellerRouter.route("/history-product").get(
  sellerController.historyProduct
);

sellerRouter.route("/common-name").put(

  sellerController.CommonName
);

module.exports = sellerRouter;
