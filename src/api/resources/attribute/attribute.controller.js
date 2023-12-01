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

  // Attributes of the Product******************

  async createAttribute(req, res, next) {
    try {
      const { name, id } = req.body;
      const slug = convertToSlug(name);

      const attribute = await db.Attribute.findOne({ where: { id: id } });

      if (attribute) {
        // Update the existing attribute
        await attribute.update({
          name: name,
          slug: slug,
        });
      } else {
        // Create a new attribute
        await db.Attribute.create({
          name: name,
          slug: slug,
        });
      }

      res.status(200).json({ status: 200, message: "Successfully added to the Attribute list" });
    } catch (err) {
      next(err);
    }
  },

  async createAttributeValues(req, res, next) {
    try {
      console.log("Body", req.body)
      const { value, meta, attribute_id } = req.body;

      const list = await db.AttributeValue.findOne({ where: { value: value } });
      if (!list) {
        await db.AttributeValue.create({
          value: value,
          meta: meta,
          attribute_id: attribute_id
        });
      }

      res.status(200).json({ status: 200, message: "Successfully added to the Attribute Value list" });
    } catch (err) {
      next(err);
    }
  },

  async getAllAttribute(req, res, next) {
    const { id, slug } = req.query;
    const limit = req.body.limit || 40;
    const page = req.body.page || 1;

    try {
      let attribute;
      if (id || slug) {
        attribute = await db.Attribute.findOne({
          where: id ? { id } : { slug },
          include: [db.AttributeValue],
        });
      } else {
        attribute = await db.Attribute.findAll({
          include: [db.AttributeValue],
          limit,
          offset: (page - 1) * limit,
        });
      }
      const response = Util.getFormatedResponse(false, attribute, {
        message: 'Success',
      });
      res.status(response.code).json(response);
    } catch (err) {
      next(err);
    }
  },

  async getAttribute(req, res, next) {
    const { id, slug } = req.query;

    try {
      let attribute = {};
      if (id || slug) {
        attribute = await db.Attribute.findOne({
          where: id ? { id } : { slug },
          include: [db.AttributeValue],
        }) || {};
      }
      const response = Util.getFormatedResponse(false, attribute, {
        message: 'Success',
      });
      res.status(response.code).json(response);
    } catch (err) {
      next(err);
    }
  },


  async getDeleteAttributeValue(req, res, next) {
    try {

      db.AttributeValue
        .findOne({
          where: { id: req.query.id },
        })
        .then((list) => {
          if (list) {
            return db.AttributeValue.destroy({ where: { id: list.id } });
          }
          throw new RequestError("Attribute is not found");
        })
        .then((success) => {
          res
            .status(200)
            .json({ status: 200, success: true, message: "Success deleted" });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      next(err);
    }
  },

  async getDeleteAttribute(req, res, next) {
    try {
      const attribute = await db.Attribute.findOne({
        where: { id: req.query.id },
      });

      if (!attribute) {
        throw new RequestError("Attribute is not found");
      }

      await db.AttributeValue.destroy({ where: { attribute_id: attribute.id } });
      await db.Attribute.destroy({ where: { id: attribute.id } });

      res
        .status(200)
        .json({ status: 200, success: true, message: "Success deleted" });
    } catch (err) {
      next(err);
    }
  },
};
