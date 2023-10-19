const { db } = require("./models");
const config = require("./config");
const { Op } = require("sequelize");
const kue = require('kue');
const { RequestError } = require('./errors'); // Assuming you have a custom RequestError defined

const queue = kue.createQueue({
  prefix: "q",
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    auth: process.env.REDIS_PASSWORD,
  },
});


let getTargetProduct = (targets) => {
  var targetProduct = [];
  for (var i = 0; targets && i < targets.length; i++) {
    targetProduct.push(targets[i].id);
  }
  return targetProduct;
};

module.exports = {
  init: () => {
    queue.process("img-upload", function (job, done) {
      console.log("Upload");
      Promise.all([
        db.productphoto.bulkCreate(job.data.attachmentEntries),
        db.productphoto.destroy({
          where: {
            id: job.data.productId,
          },
        }),
      ])
        .then((r) => {
          done(true);
        })
        .catch((err) => {
          console.log("error - " + err);
          done(false);
        });
    });
    queue.process("product-update", (job, done) => {
      const targets = job.data.productList;
      const discount = job.data.discount;
      const targetProduct = getTargetProduct(targets);
      db.ProductVariant.findAll({
        attributes: [
          "id",
          "productCode",
          "productId",
          "distributorPrice",
          "buyerPrice",
          "qty",
          "sellerPrice",
        ],
        distinct: true,
        where: {
          productId: {
            [Op.in]: targetProduct,
          },
        },
      })
        .then(async (varient) => {
          const t = await db.sequelize.transaction();
          try {
            let itemEntries = [];
            for (var i = 0; i < varient.length; i++) {
              const discountPer = discount;
              const discountPrice = Math.round(
                (varient[i].distributorPrice * discountPer) / 100
              );
              const total = Math.round(
                varient[i].distributorPrice - discountPrice
              );
              const netPrice = Math.round(
                varient[i].distributorPrice - discountPrice
              );
              itemEntries.push({
                distributorPrice: varient[i].distributorPrice,
                buyerPrice: varient[i].buyerPrice,
                qty: varient[i].qty,
                productId: varient[i].productId,
                id: varient[i].id,
                productCode: varient[i].productCode,
                discount: discountPrice,
                discountPer: discountPer,
                total: total,
                netPrice: netPrice,
              });
            }
            if (itemEntries.length)
              await db.ProductVariant.bulkCreate(
                itemEntries,
                {
                  updateOnDuplicate: Object.keys(itemEntries[0]),
                },
                {
                  transaction: t,
                }
              );

            return t.commit();
          } catch (err) {
            await t.rollback();
            throw err;
          }
        })
        .then((r) => {
          done(null, true);
        })
        .catch((err) => {
          console.log(err);
          done(null, false);
        });
    });
  },
};

module.exports.queue = queue; 
