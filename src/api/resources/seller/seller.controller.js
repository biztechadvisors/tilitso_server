const { db } = require('../../../models');
const config = require('../../../config');
const AWS = require('aws-sdk');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const { queue } = require('../../../kue');
const { condition } = require('sequelize');
const Util = require('../../../helpers/Util');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const deleteFileFromS3 = async (imgUrl) => {
  try {
    const lastItem = imgUrl.substring(imgUrl.lastIndexOf('/') + 1);
    const params = {
      Bucket: 'ninocodenox',
      Key: lastItem,
    };
    s3.deleteObject(params, (error, data) => {
      if (error) {
        console.log(error, error.stack);
      }
      return data;
    });
  } catch (error) {
    throw new RequestError(error);
  }
};

const convertToSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Function to check if a bucket exists
function checkBucketExists(bucketName) {
  const s3 = new AWS.S3();
  const params = {
    Bucket: bucketName,
  };
  return s3
    .headBucket(params)
    .promise()
    .then(() => true)
    .catch((err) => {
      if (err.statusCode === 404) {
        return false;
      }
      throw err;
    });
}

module.exports = {
  async createProduct(req, res, next) {
    console.log(req.body)
    try {
      const {
        categoryId,
        subCategoryId,
        childCategoryId,
        LocalDeiveryCharge,
        ZonalDeiveryCharge,
        NationalDeiveryCharge,
        warrantyType,
        condition,
        warrantyPeriod,
        ShippingDays,
        SpecificationDetails,
        priceDetails,
        HighLightDetais,
        tags,
      } = req.body;
      db.user
        .findOne({
          where: { email: req.user.email, role: req.user.role },
        })
        .then(async (user) => {
          if (user) {
            const t = await db.sequelize.transaction();
            try {
              const productCreated = await db.product.create(
                {
                  categoryId: categoryId,
                  condition: condition,
                  subCategoryId: subCategoryId,
                  childCategoryId: childCategoryId,
                  SellerId: "1",
                  status: "inactive",
                  LocalDeiveryCharge: LocalDeiveryCharge,
                  ZonalDeiveryCharge: ZonalDeiveryCharge,
                  NationalDeiveryCharge: NationalDeiveryCharge,
                  WarrantyType: warrantyType,
                  WarrantyPeriod: warrantyPeriod,
                  ShippingDays: ShippingDays,
                  HighLightDetail: HighLightDetais,
                  name: priceDetails[0].productName,
                  slug: convertToSlug(priceDetails[0].productName),
                },
                { transaction: t }
              );

              const featureList = [];
              for (var i = 0; i < SpecificationDetails.length; i++) {
                featureList.push({
                  productId: productCreated.id,
                  type: SpecificationDetails[i].type,
                  value: SpecificationDetails[i].value,
                });
              }
              if (featureList.length)
                await db.ch_specification.bulkCreate(featureList, {
                  transaction: t,
                });
              // tag insert
              if (tags && tags.length) {
                let tagDetail = [];
                for (var i = 0; i < tags.length; i++) {
                  tagDetail.push({
                    productId: productCreated.id,
                    title: tags[i],
                  });
                }
                if (tagDetail && tagDetail.length)
                  await db.tag.bulkCreate(tagDetail, {
                    transaction: t,
                  });
              }
              let priceEntries = [];
              for (var i = 0; i < priceDetails.length; i++) {
                const marginPrice = Math.round(
                  priceDetails[i].distributorPrice - priceDetails[i].buyerPrice
                );
                const marginPer = Math.round(
                  ((priceDetails[i].distributorPrice -
                    priceDetails[i].buyerPrice) /
                    priceDetails[i].distributorPrice) *
                  100
                );
                const discountPer = Math.round(
                  ((priceDetails[i].distributorPrice -
                    priceDetails[i].buyerPrice) /
                    priceDetails[i].distributorPrice) *
                  100
                );
                const discount = Math.round(
                  priceDetails[i].distributorPrice - priceDetails[i].buyerPrice
                );
                const total = Math.round(priceDetails[i].buyerPrice);
                const netPrice = Math.round(priceDetails[i].buyerPrice);

                priceEntries.push({
                  productId: productCreated.id,
                  productName: priceDetails[i].productName,
                  slug: convertToSlug(priceDetails[i].productName),
                  productCode: priceDetails[i].productCode
                    ? priceDetails[i].productCode
                    : "PD" + Math.random().toString(36).substr(2, 4),
                  longDesc: priceDetails[i].longDesc
                    ? priceDetails[i].longDesc
                    : "",
                  shortDesc: priceDetails[i].shortDesc
                    ? priceDetails[i].shortDesc
                    : "",
                  distributorPrice: priceDetails[i].distributorPrice
                    ? priceDetails[i].distributorPrice
                    : 0,
                  buyerPrice: priceDetails[i].buyerPrice
                    ? priceDetails[i].buyerPrice
                    : 0,
                  marginPrice: marginPrice ? marginPrice : 0,
                  marginPer: marginPer ? marginPer : 0,
                  discount: discount ? discount : 0,
                  discountPer: discountPer ? discountPer : 0,
                  total: total ? total : 0,
                  netPrice: netPrice ? netPrice : 0,
                  unitSize: priceDetails[i].unitSize
                    ? priceDetails[i].unitSize
                    : 0,
                  qty: priceDetails[i].qty ? priceDetails[i].qty : 0,
                  colorId: priceDetails[i].colorId
                    ? priceDetails[i].colorId
                    : null,
                  brandId: priceDetails[i].brandId
                    ? priceDetails[i].brandId
                    : null,
                  stockType: priceDetails[i].stockType,
                  refundable: priceDetails[i].REFUNDABLE
                    ? priceDetails[i].REFUNDABLE
                    : null,
                  qtyWarning: priceDetails[i].QTYWARNING
                    ? priceDetails[i].QTYWARNING
                    : null,
                  COD: priceDetails[i].COD ? priceDetails[i].COD : "'",
                  networkType: priceDetails[i].networkType
                    ? priceDetails[i].networkType
                    : null,
                  modelYear: priceDetails[i].modelYear
                    ? priceDetails[i].modelYear
                    : null,
                  osType: priceDetails[i].os_type
                    ? priceDetails[i].os_type
                    : null,
                  memory: priceDetails[i].memory
                    ? priceDetails[i].memory
                    : null,
                  internationalWarranty: priceDetails[i].internationalWarranty
                    ? priceDetails[i].internationalWarranty
                    : null,
                  screenSize: priceDetails[i].screen_size
                    ? priceDetails[i].screen_size
                    : null,
                  batteryCapacity: priceDetails[i].battery_capacity
                    ? priceDetails[i].battery_capacity
                    : null,
                  primaryCamera: priceDetails[i].primary_camera
                    ? priceDetails[i].primary_camera
                    : null,
                  secondaryCamera: priceDetails[i].secondary_camera
                    ? priceDetails[i].secondary_camera
                    : null,
                  simCount: priceDetails[i].sim_count
                    ? priceDetails[i].sim_count
                    : null,
                  interface: priceDetails[i].interface
                    ? priceDetails[i].interface
                    : null,
                  compatibility: priceDetails[i].compatibility
                    ? priceDetails[i].compatibility
                    : null,
                  storageSize: priceDetails[i].storageSize
                    ? priceDetails[i].storageSize
                    : null,
                  storageType: priceDetails[i].storageType
                    ? priceDetails[i].storageType
                    : null,
                  laptopType: priceDetails[i].laptopType
                    ? priceDetails[i].laptopType
                    : null,
                  graphicsMemory: priceDetails[i].graphicsMemory
                    ? priceDetails[i].graphicsMemory
                    : null,
                  osVersion: priceDetails[i].osVersion
                    ? priceDetails[i].osVersion
                    : null,
                  displayResolutionType: priceDetails[i].displayResolutionType
                    ? priceDetails[i].displayResolutionType
                    : null,
                  processorId: priceDetails[i].processorId
                    ? priceDetails[i].processorId
                    : null,
                });
              }
              if (priceEntries.length)
                await db.ProductVariant.bulkCreate(priceEntries, {
                  transaction: t,
                });

              return t.commit();
            } catch (error) {
              console.log("first", error)
              await t.rollback();
              throw new RequestError(error, 500);
            }
          }
          throw new RequestError("User not found", 500);
        })

        .then((product) => {
          res.status(200).json({
            status: 201,
            success: true,
            message: "Successfully inserted product",
          });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },
  async getAllProduct(req, res, next) {
    const { searchString } = req.body;
    const query = {};
    query.where = {};
    const limit = req.body.limit ? Number(req.body.limit) : 10;
    const page = req.body.page ? Number(req.body.page) : 1;
    query.limit = limit;
    query.offset = limit * (page - 1);
    query.order = [["id", "DESC"]];
    query.where.SellerId = req.user.id;
    query.attributes = [
      "id",
      "name",
      "SellerId",
      "LocalDeiveryCharge",
      "ZonalDeiveryCharge",
      "NationalDeiveryCharge",
      "WarrantyType",
      "WarrantyPeriod",
      "PubilshStatus",
      "ShippingDays",
      "HighLightDetail",
      "condition",
    ];
    query.include = [
      { model: db.category, as: "maincat", attributes: ["id", "name"] },
      { model: db.SubCategory, attributes: ["id", "sub_name"] },
      { model: db.SubChildCategory, attributes: ["id", "name"] },
      {
        model: db.ProductVariant,
        include: [
          {
            model: db.collection,
            as: "brand",
            attributes: ["id", "name"],
          },
          {
            model: db.ch_color_detail,
            as: "color",
            attributes: ["id", "TITLE", "CODE"],
          },
        ],
      },
      { model: db.ch_specification, attributes: ["id", "type", "value"] },
    ];
    if (searchString) {
      query.where = {
        [Op.and]: [
          {
            [Op.or]: [
              {
                name: {
                  [Op.like]: "%" + searchString + "%",
                },
              },
              {
                id: searchString,
              },
              {
                slug: {
                  [Op.like]: "%" + searchString + "%",
                },
              },
            ],
          },
          { SellerId: req.user.id },
        ],
      };
    }
    try {
      db.product
        .findAndCountAll(query)
        .then((list) => {
          let pages = Math.ceil(list.count / limit);
          const finalResult = {
            count: list.count,
            pages: pages,
            page: req.body.page,
            items: list.rows,
          };
          var response = Util.getFormatedResponse(false, finalResult, {
            message: "Success",
          });
          res.status(response.code).json(response);
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      res.status(500).json({ err });
    }
  },
  async updateProduct(req, res, next) {
    try {
      const {
        productId,
        categoryId,
        condition,
        subCategoryId,
        childCategoryId,
        LocalDeiveryCharge,
        ZonalDeiveryCharge,
        NationalDeiveryCharge,
        warrantyType,
        warrantyPeriod,
        ShippingDays,
        SpecificationDetails,
        priceDetails,
        HighLightDetais,
        tags,
      } = req.body;
      db.user
        .findOne({
          where: { email: req.user.email, role: req.user.role },
        })
        .then(async (user) => {
          if (user) {
            const t = await db.sequelize.transaction();
            try {
              const productCreated = await db.product.update(
                {
                  categoryId: categoryId,
                  subCategoryId: subCategoryId,
                  childCategoryId: childCategoryId,
                  SellerId: req.user.id,
                  condition: condition,
                  status: "inactive",
                  LocalDeiveryCharge: LocalDeiveryCharge,
                  ZonalDeiveryCharge: ZonalDeiveryCharge,
                  NationalDeiveryCharge: NationalDeiveryCharge,
                  WarrantyType: warrantyType,
                  WarrantyPeriod: warrantyPeriod,
                  ShippingDays: ShippingDays,
                  HighLightDetail: HighLightDetais,
                  name: priceDetails[0].productName,
                  slug: convertToSlug(priceDetails[0].productName),
                },
                { where: { id: productId } },
                { transaction: t }
              );

              const featureList = [];
              for (var i = 0; i < SpecificationDetails.length; i++) {
                featureList.push({
                  productId: productId,
                  id: SpecificationDetails[i].id,
                  type: SpecificationDetails[i].type,
                  value: SpecificationDetails[i].value,
                });
              }
              if (featureList.length)
                await db.ch_specification.bulkCreate(
                  featureList,
                  {
                    updateOnDuplicate: Object.keys(featureList[0]),
                  },
                  { transaction: t }
                );
              if (tags && tags.length) {
                let tagDetail = [];
                for (let i = 0; i < tags.length; i++) {
                  tagDetail.push({
                    productId: productId,
                    title: tags[i],
                  });
                }
                if (tagDetail.length)
                  await db.tag.bulkCreate(tagDetail, {
                    transaction: t,
                  });
              }
              let priceEntries = [];
              for (let i = 0; i < priceDetails.length; i++) {
                const marginPrice = Math.round(
                  priceDetails[i].distributorPrice - priceDetails[i].buyerPrice
                );
                const marginPer = Math.round(
                  ((priceDetails[i].distributorPrice -
                    priceDetails[i].buyerPrice) /
                    priceDetails[i].distributorPrice) *
                  100
                );
                const discountPer = Math.round(
                  ((priceDetails[i].distributorPrice -
                    priceDetails[i].buyerPrice) /
                    priceDetails[i].distributorPrice) *
                  100
                );
                const discount = Math.round(
                  priceDetails[i].distributorPrice - priceDetails[i].buyerPrice
                );
                const total = Math.round(priceDetails[i].buyerPrice);
                const netPrice = Math.round(priceDetails[i].buyerPrice);
                priceEntries.push({
                  productId: productId,
                  id: priceDetails[i].id,
                  productName: priceDetails[i].productName,
                  slug: convertToSlug(priceDetails[i].productName),
                  productCode: priceDetails[i].productCode
                    ? priceDetails[i].productCode
                    : "PD" + Math.random().toString(36).substr(2, 4),
                  longDesc: priceDetails[i].longDesc,
                  shortDesc: priceDetails[i].shortDesc,
                  distributorPrice: priceDetails[i].distributorPrice,
                  buyerPrice: priceDetails[i].buyerPrice,
                  marginPrice: marginPrice,
                  marginPer: marginPer,
                  discount: discount,
                  discountPer: discountPer,
                  total: total,
                  netPrice: netPrice,
                  unitSize: priceDetails[i].unitSize,
                  qty: priceDetails[i].qty,
                  colorId: priceDetails[i].colorId,
                  brandId: priceDetails[i].brandId,
                  youTubeUrl: priceDetails[i].youTubeUrl,
                  stockType: priceDetails[i].stockType,
                  refundable: priceDetails[i].refundable,
                  qtyWarning: priceDetails[i].qtyWarning,
                  COD: priceDetails[i].COD,
                  networkType: priceDetails[i].networkType,
                  modelYear: priceDetails[i].modelYear,
                  osType: priceDetails[i].osType,
                  memory: priceDetails[i].memory,
                  internationalWarranty: priceDetails[i].internationalWarranty,
                  screenSize: priceDetails[i].screenSize,
                  batteryCapacity: priceDetails[i].batteryCapacity,
                  primaryCamera: priceDetails[i].primaryCamera,
                  secondaryCamera: priceDetails[i].secondaryCamera,
                  simCount: priceDetails[i].simCount,
                  interface: priceDetails[i].interface,
                  compatibility: priceDetails[i].compatibility,
                  storageSize: priceDetails[i].storageSize
                    ? priceDetails[i].storageSize
                    : null,
                  storageType: priceDetails[i].storageType
                    ? priceDetails[i].storageType
                    : null,
                  laptopType: priceDetails[i].laptopType
                    ? priceDetails[i].laptopType
                    : null,
                  graphicsMemory: priceDetails[i].graphicsMemory
                    ? priceDetails[i].graphicsMemory
                    : null,
                  osVersion: priceDetails[i].osVersion
                    ? priceDetails[i].osVersion
                    : null,
                  displayResolutionType: priceDetails[i].displayResolutionType
                    ? priceDetails[i].displayResolutionType
                    : null,
                  processorId: priceDetails[i].processorId
                    ? priceDetails[i].processorId
                    : null,
                });
              }
              if (priceEntries.length)
                await db.ProductVariant.bulkCreate(
                  priceEntries,
                  {
                    updateOnDuplicate: Object.keys(priceEntries[0]),
                  },
                  { transaction: t }
                );
              return t.commit();
            } catch (error) {
              await t.rollback();
              throw error;
            }
          }
          throw new RequestError("User not found", 500);
        })

        .then((product) => {
          res.status(200).json({
            status: 201,
            success: true,
            message: "Successfully updated product",
          });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },
  async getPrductById(req, res, next) {
    try {
      db.product
        .findOne({
          attributes: ["id"],
          where: { id: req.body.id, SellerId: req.user.id },
          include: [
            {
              model: db.ProductVariant,
              attributes: ["id", "productId", "productName", "thumbnail"],
              include: [
                {
                  model: db.productphoto,
                  attributes: ["id", "varientId", "imgUrl"],
                },
              ],
            },
          ],
        })
        .then((list) => {
          const featureList = [];
          for (var i = 0; i < list.ProductVariants.length; i++) {
            featureList.push({
              productId: list.id,
              varientId: list.ProductVariants[i].id,
              productName: list.ProductVariants[i].productName,
              thumbnail: list.ProductVariants[i].thumbnail,
              photos: list.ProductVariants[i].productphotos,
            });
          }
          res.status(200).json({
            status: 200,
            success: true,
            data: featureList,
            message: "Success",
          });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      res.status(500).json({ errors: "" + err });
    }
  },

  async sellerImageDetailByid(req, res, next) {
    try {
      const productDetails = await db.product.findOne({
        attributes: ["id", "name", "photo", "slug"],
        where: {
          id: req.query.id,
        },
        include: [
          {
            model: db.productphoto,
            attributes: ["id", "imgUrl"],
          },
        ],
      });

      if (!productDetails) {
        return res.status(404).json({
          status: 404,
          success: false,
          message: "Product not found",
        });
      }

      const featureList = {
        productId: productDetails.id,
        productName: productDetails.name,
        slug: productDetails.slug,
        thumbnail: productDetails.photo,
        photos: productDetails.productphotos,
      };

      res.status(200).json({
        status: 200,
        success: true,
        data: featureList,
        message: "Success",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ errors: "Internal Server Error" });
    }
  }
  ,

  async uploadSingleImage(req, res, next) {
    try {
      db.ProductVariant.findOne({
        where: { productId: req.body.productId, id: req.body.varientId },
      })
        .then((list) => {
          if (list) {
            return db.ProductVariant.update(
              {
                thumbnail: req.file ? req.file.location : null,
              },
              {
                where: {
                  productId: req.body.productId,
                  id: req.body.varientId,
                },
              }
            );
          }
        })
        .then((success) => {
          res.status(200).json({
            status: 200,
            success: true,
            message: "Image uploaded successfully",
          });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      res.status(500).json({ errors: "" + err });
    }
  },

  async uploadMainProdImage(req, res, next) {
    try {
      db.product.findOne({
        where: { id: req.body.productId },
      })
        .then((list) => {
          if (list) {
            return db.product.update(
              {
                photo: req.file ? req.file.location : null,
              },
              {
                where: {
                  id: req.body.productId,
                },
              }
            );
          }
        })
        .then((success) => {
          res.status(200).json({
            status: 200,
            success: true,
            message: "Image uploaded successfully",
          });
        })
        .catch(function (err) {
          console.log(err)
          next(err);
        });
    } catch (err) {
      console.log(err)
      res.status(500).json({ errors: "" + err });
    }
  },

  async deleteThumbnail(req, res, next) {
    try {
      deleteFileFromS3(req.body.thumbnail)
        .then((data) => {
          if (!data) {
            return db.ProductVariant.findOne({
              where: { productId: req.body.productId, id: req.body.varientId },
            });
          }
          throw new RequestError("error");
        })
        .then((list) => {
          if (list) {
            return db.ProductVariant.update(
              {
                thumbnail: null,
              },
              {
                where: {
                  productId: req.body.productId,
                  id: req.body.varientId,
                },
              }
            );
          }
        })
        .then((success) => {
          res.status(200).json({
            status: 200,
            success: true,
            message: "Image delete successfully",
          });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },

  async deleteMainProdImage(req, res, next) {
    try {
      deleteFileFromS3(req.body.thumbnail)
        .then((data) => {
          if (!data) {
            return db.product.findOne({
              where: { id: req.body.id },
            });
          }
          throw new RequestError("error");
        })
        .then((list) => {
          if (list) {
            return db.product.update(
              {
                photo: null,
              },
              {
                where: {
                  id: req.body.id,
                },
              }
            );
          }
        })
        .then((success) => {
          res.status(200).json({
            status: 200,
            success: true,
            message: "Image delete successfully",
          });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },


  async getAllList(req, res, next) {
    try {
      db.ProductVariant.findAll({
        attributes: ["id", "productName"],
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: db.product,
            where: { SellerId: req.user.id },
            attributes: ["id"],
          },
        ],
      })
        .then((list) => {
          res.status(200).json({
            status: 200,
            success: true,
            data: list,
            message: "Success",
          });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      next(err);
    }
  },
  async couponCreate(req, res, next) {
    const { Code, VarientId, StartDate, EndDate, Type, Value } = req.body;
    try {
      db.ch_coupon_detail
        .findOne({
          where: { VarientId: VarientId },
        })
        .then((list) => {
          if (!list) {
            return db.ch_coupon_detail.create({
              Code: Code,
              VarientId: VarientId,
              StartDate: StartDate,
              EndDate: EndDate,
              Type: Type,
              Value: Value,
              Status: true,
            });
          }
          throw new RequestError("Already exist in list");
        })
        .then((success) => {
          res.status(200).json({
            status: 201,
            success: true,
            message: "Successfully created",
          });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      res.status(500).json({ errors: "" + err });
    }
  },
  async couponList(req, res, next) {
    try {
      db.ch_coupon_detail
        .findAll({
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: db.ProductVariant,
              as: "product",
              attributes: ["id", "productName"],
            },
          ],
        })
        .then((list) => {
          res.status(200).json({
            status: 200,
            success: true,
            data: list,
            message: "Success",
          });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      next(err);
    }
  },

  async couponDelete(req, res, next) {
    try {
      db.ch_coupon_detail
        .findOne({
          where: { id: req.query.id },
        })
        .then((list) => {
          if (list) {
            return db.ch_coupon_detail.destroy({ where: { id: list.id } });
          }
          throw new RequestError("Coupon is not found");
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
  async getAllBrandList(req, res, next) {
    try {
      db.collection
        .findAll()
        .then((list) => {
          var response = Util.getFormatedResponse(false, list, {
            message: "Success",
          });
          res.status(response.code).json(response);
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },
  async getAllProductList(req, res, next) {
    const { searchString } = req.query;
    let arrData = [];
    const query = {};
    query.where = {};
    try {
      if (searchString) {
        query.where.productName = {
          [Op.like]: "%" + searchString + "%",
        };
      }
      //limit
      console.log("req.query.page", req.query.page);

      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const page = req.query.page ? Number(req.query.page) : 1;
      query.limit = limit;
      query.offset = limit * (page - 1);
      query.order = [["createdAt", "DESC"]]; // Correct "Desc" to "DESC"
      query.include = [
        {
          model: db.product,
          where: {
            SellerId: { [Op.not]: null },
          },
          attributes: [
            "id",
            "SellerId",
            "PubilshStatus",
            "categoryId",
            "subCategoryId",
            "childCategoryId",
          ],
          include: [
            { model: db.category, as: "maincat", attributes: ["id", "name"] },
            { model: db.SubCategory, attributes: ["id", "sub_name"] },
          ],
        },
        {
          model: db.ch_color_detail,
          as: "color",
          attributes: ["id", "TITLE", "CODE"],
        },
        { model: db.productphoto, attributes: ["id", "imgUrl"] },
      ];
      const productlist = await db.ProductVariant.findAndCountAll(query);
      if (productlist.count === 0) {
        let response = Util.getFormatedResponse(false, {
          message: "No data found",
        });
        res.status(response.code).json(response);
      } else {
        productlist.rows.forEach((value) => {
          const dataList = {
            id: value ? value.id : "",
            productId: value.product ? value.product.id : "",
            name: value ? value.productName : "",
            code: value ? value.productCode : "",
            slug: value ? value.slug : null,
            Available: value ? value.Available : null,
            qty: value ? value.qty : null,
            thumbnail: value ? value.thumbnail : null,
            distributorPrice: value ? value.distributorPrice : null,
            marginPer: value ? value.marginPer : null,
            marginPrice: value ? value.marginPrice : null,
            buyerPrice: value ? value.buyerPrice : null,
            qty: value ? value.qty : null,
            discount: value ? value.discount : null,
            discountPer: value ? value.discountPer : null,
            total: value ? value.total : null,
            netPrice: value ? value.netPrice : null,
            sellerPrice: value ? value.sellerPrice : null,
            maincat: value.product && value.product.maincat ? value.product.maincat.name : null,
            // BrandName: value.brand ? value.brand : null,
            subcat: value.product.SubCategory
              ? value.product.SubCategory.sub_name
              : "",
            childcat: value.product.SubChildCategory
              ? value.product.SubChildCategory.name
              : "",
            PubilshStatus: value.product.PubilshStatus,
          };
          arrData.push(dataList);
        });
        let pages = Math.ceil(productlist.count / limit);
        const finalResult = {
          count: productlist.count,
          pages: pages,
          page: page, // Use the actual page number from the variable
          items: arrData,
        };
        let response = Util.getFormatedResponse(false, finalResult, {
          message: "Success",
        });
        res.status(response.code).json(response);
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  async historyProduct(req, res, next) {
    const { searchString } = req.query;
    const query = {};
    query.where = {};

    const whereCond = {};
    whereCond.where = {};

    if (searchString) {
      query.where = {
        [Op.or]: [
          {
            id: {
              [Op.like]: "%" + searchString + "%",
            },
          },
          {
            name: {
              [Op.like]: "%" + searchString + "%",
            },
          },
          {
            slug: {
              [Op.like]: "%" + searchString + "%",
            },
          },
        ],
      };
      whereCond.where.productName = {
        [Op.like]: "%" + searchString + "%",
      };
    }

    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const page = req.query.page ? Number(req.query.page) : 1;
    query.limit = limit;
    query.offset = limit * (page - 1);

    query.order = [["id", "DESC"]];
    query.attributes = [
      "id",
      "SellerId",
      "name",
      "photo",
      "LocalDeiveryCharge",
      "ZonalDeiveryCharge",
      "NationalDeiveryCharge",
      "WarrantyType",
      "WarrantyPeriod",
      "PubilshStatus",
      "ShippingDays",
      "HighLightDetail",
    ];
    try {
      await db.product.findAndCountAll({
        ...query,
        include: [
          { model: db.category, as: "maincat", attributes: ["id", "name"] },
          { model: db.SubCategory, attributes: ["id", "sub_name"] },
          {
            model: db.ProductVariant,
            ...whereCond
          },
          { model: db.ch_specification, attributes: ["id", "type", "value"] },
          {
            model: db.collection,
          },
        ],
      })
        .then((list) => {
          if (list.count === 0) {
            let response = Util.getFormatedResponse(false, {
              message: "No data found",
            });
            res.status(response.code).json(response);
          } else {
            console.log("Count", list.rows.length)
            let pages = Math.ceil(list.count / limit);
            const finalResult = {
              count: list.count,
              pages: pages,
              page: req.query.page,
              items: list.rows,
            };
            let response = Util.getFormatedResponse(false, finalResult, {
              message: "Success",
            });
            res.status(response.code).json(response);
          }
        })
        .catch(function (err) {
          console.log(err);
          next(err);
        });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  async CommonName(req, res, next) {
    const { id, name, slug } = req.body;
    try {
      db.product
        .findOne({
          where: { id: id },
        })
        .then((list) => {
          if (!list) {
            let response = Util.getFormatedResponse(false, {
              message: "No data found",
            });
            res.status(response.code).json(response);
          } else {
            const success = db.product.update(
              {
                name: name,
                slug: slug,
              },
              { where: { id: id } }
            );
            console.log(JSON.stringify(success));
            if (success) {
              let response = Util.getFormatedResponse(false, {
                message: "Success",
              });
              res.status(response.code).json(response);
            }
          }
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      res.status(500).json({ errors: "" + err });
    }
  },

};
