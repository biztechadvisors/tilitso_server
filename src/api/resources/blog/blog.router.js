const express = require("express");
const blogController = require("./blog.controller");
const upload = require("../../../awsbucket");

const blogRouter = express.Router();

blogRouter.route("/create").post(upload.single('image'), blogController.create);
blogRouter.route("/list").get(blogController.getList);
blogRouter.route("/update").put(upload.single('image'), blogController.update);
blogRouter.route("/getById").get(blogController.getById);
blogRouter.route("/delete").post(blogController.deleteBlog);

module.exports = blogRouter;
