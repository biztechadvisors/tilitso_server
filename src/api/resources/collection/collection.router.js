const express = require("express");
const collectionController = require("./collection.controller");
const upload = require("../../../awsbucket");

const collectionRouter = express.Router();

collectionRouter.route("/create").post( collectionController.create);
collectionRouter.route("/list").get( collectionController.getList);
collectionRouter.route("/update").put( collectionController.update);

collectionRouter.route("/item").post( upload.single("thumbnail"), collectionController.itemCreate);
collectionRouter.route("/item/list").get(collectionController.getItem);
collectionRouter.route("/item/delete").post( collectionController.deleteItem);

collectionRouter.route("/flash-sale").post( upload.single("thumbnail"), collectionController.flashSaleCreate);
collectionRouter.route("/flash-sale-list").get( collectionController.getFlashSaleList);
collectionRouter.route("/flash-sale-delete").delete( collectionController.deleteProductFromFlash);
collectionRouter.route("/flash-sale-update").put( upload.single("thumbnail"), collectionController.flashSaleUpdate);
collectionRouter.route("/flash-sale-status-update").put( collectionController.flashSaleStatusUpdate);

module.exports = collectionRouter;
