const { db } = require('../../../models');
const Util = require("../../../helpers/Util");
const config = require("../../../config");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const deleteFileFromS3 = async (imgUrl) => {
  try {
    const lastItem = imgUrl.substring(imgUrl.lastIndexOf("/") + 1);
    var params = {
      Bucket: "tilitsobucket",
      Key: lastItem,
    };
    s3.deleteObject(params, (error, data) => {
      if (error) {
        console.log(error, error.stack);
      }
      return data;
    });
  } catch (error) {
    // assert.isNotOk(error, "Promise error");
    // done();
  }
};

const convertToSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

module.exports = {

  async create(req, res, next) {
    const { title, desc, content, status } = req.body;

    console.log("blog-Data", req.body)
    console.log("blog-Image", req.file.location)

    const slug = convertToSlug(title)
    db.Blog
      .create({
        title: title,
        desc: desc,
        slug: slug,
        status: status,
        banner: req.file.location ? req.file.location : "",
        content: content
      })
      .then((success) => {
        let response = Util.getFormatedResponse(false, {
          message: "Successfully created",
        });
        res.status(response.code).json(response);
      })
      .catch(function (err) {
        let response = Util.getFormatedResponse(true, {
          message: err,
        });
        res.status(response.code).json(response);
      });
  },

  async getList(req, res, next) {
    db.Blog
      .findAll()
      .then((blogs) => {
        let response = Util.getFormatedResponse(false, {
          message: "Successfully fetched",
          data: blogs
        });
        res.status(response.code).json(response);
      })
      .catch(function (err) {
        let response = Util.getFormatedResponse(true, {
          message: err,
        });
        res.status(response.code).json(response);
      });
  },

  async update(req, res, next) {
    const { id, title, desc, content, status } = req.body;
    console.log("first", req.body)
    db.Blog
      .findOne({ where: { id: id } })
      .then((blog) => {
        if (!blog) {
          throw new RequestError("No blog found with this id", 404);
        } else {
          return blog.update({
            title: title,
            desc: desc,
            status: status,
            image: req.file.location ? req.file.location : "",
            content: content
          });
        }
      })
      .then((updatedBlog) => {
        res.status(200).json({ success: true, updatedBlog })
      })
      .catch(function (err) {
        next(err);
      });
  },

  async getById(req, res, next) {
    const { id } = req.body;
    console.log("first", id)
    db.Blog
      .findOne({ where: { id: id } })
      .then((blog) => {
        if (!blog) {
          throw new RequestError("No blog found with this id", 404);
        } else {
          res.status(200).json({ success: true, blog })
        }
      })
      .catch(function (err) {
        next(err);
      });
  },

  async deleteBlog(req, res, next) {
    const { id, banner } = req.body;
    deleteFileFromS3(banner)
      .then((data) => {
        if (!data) {
          return db.Blog.destroy({ where: { id: id } });
        }
        throw new RequestError("error");
      })
      .then((success) => {
        let response = Util.getFormatedResponse(false, {
          message: "Successfully deleted blog",
        });
        res.status(response.code).json(response);
      })
      .catch(function (err) {
        let response = Util.getFormatedResponse(true, {
          message: err,
        });
        res.status(response.code).json(response);
      });
  }

};
