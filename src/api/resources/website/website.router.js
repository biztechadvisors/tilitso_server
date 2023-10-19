const express = require("express");
const websiteController = require("./website.controller");
const { jwtCustomerStrategy } = require("../../../middleware/strategy");

const websiteRouter = express.Router();

websiteRouter.route("/category/list").get(websiteController.getCategoryList);

// collection list
websiteRouter.route("/collection/list").post(websiteController.collectionList);

websiteRouter.route("/search/searchProducts").get(websiteController.searchProducts);

websiteRouter.route("/catalog/product/search").get(websiteController.getFilterAllProduct);

websiteRouter.route("/product/collection-Product").get(websiteController.getCollectionProducts);

websiteRouter.route("/getAllProductLists").get(websiteController.getAllProductList);

websiteRouter.route("/product/detail").get(websiteController.getProductDetail);

websiteRouter.route("/relatedProduct").get(websiteController.relatedProduct);

websiteRouter.route("/reveiw-list").post(websiteController.getReviewList);

websiteRouter.route("/image/banner").get(websiteController.getBannerList);

websiteRouter.route("/popular/category-list").get(websiteController.getPopularCategory);

websiteRouter.route("/category/getAllProduct").post(websiteController.getCategoryByProduct);

websiteRouter.route("/catalog/category/search").get(websiteController.getFilterAllCategoryBrand);

websiteRouter.route("/autosuggest/search").get(websiteController.getAutoSuggestList);

websiteRouter.route("/address/create").post( websiteController.createAddress);

websiteRouter.route("/customization").post(websiteController.customizationPage);

websiteRouter.route("/customization-List").get(websiteController.customizationList);

// Order
websiteRouter.route("/order/product_list").post( websiteController.orderProductList);

websiteRouter.route("/order/history").get( websiteController.orderHistory);

websiteRouter.route("/order/product_detail").post( websiteController.orderProductDetail);

websiteRouter.route("/order/cancel-by-product").post( websiteController.orderdProductCancel);

websiteRouter.route("/allEvent").get(websiteController.allEvent);

module.exports = websiteRouter;
