const express = require("express");
const seoController = require("./seo.controller");
const { sanitize } = require("../../../middleware/sanitizer");

const seoRouter = express.Router();
seoRouter.route("/list").post( seoController.seoList);
seoRouter.route("/update").post( seoController.seoUpdate);
seoRouter.route("/delete").post( seoController.seoDelete);

module.exports = seoRouter;
