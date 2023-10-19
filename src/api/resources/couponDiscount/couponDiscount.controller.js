const { db } = require('../../../models');
const Util = require("../../../helpers/Util");
const config = require("../../../config");
const moment = require('moment');
const AWS = require("aws-sdk");
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
});

const deleteFileFromS3 = async (imgUrl) => {
    try {
        const lastItem = imgUrl.substring(imgUrl.lastIndexOf("/") + 1);
        var params = {
            Bucket: "ninocodenox",
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


const referrals = {};
const coupons = {};

const generateReferralCode = () => {
    // Generate a random referral code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 8;
    let referralCode = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        referralCode += characters[randomIndex];
    }
    return referralCode;
};

const generateCouponCode = () => {
    // Generate a random coupon code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 10;
    let couponCode = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        couponCode += characters[randomIndex];
    }
    return couponCode;
};


module.exports = {

    async CouponDiscCreate(req, res, next) {
        try {
            // console.log("first", req.body);
            const { title, startDate, endDate } = req.body;
            const tagsArr = req.body.productIds ? req.body.productIds.split(",") : [];
            const productIdsOR = [];
            for (const tag of tagsArr) {
                productIdsOR.push(tag);
            }
            const query = {
                where: {
                    title: title,
                },
            };
            const existingCoupon = await db.ch_coupon_detail.findOne(query);
            if (existingCoupon) {
                throw new RequestError("This collection already exists", 409);
            }
            const t = await db.sequelize.transaction();
            try {
                const couponDetail = await db.ch_coupon_detail.create(
                    {
                        couponCode: req.body.couponCode,
                        discount: req.body.discount,
                        title: title,
                        photo: req.file ? req.file.location : "",
                        description: req.body.description,
                        onShopping: req.body.onShopping,
                        discountPer: req.body.discountPer,
                        startDate: startDate,
                        endDate: endDate,
                        discountType: req.body.discountType,
                        status: true,
                    },
                    { transaction: t }
                );

                if (req.body.discountType !== "totalAmount" && productIdsOR.length) {
                    let itemEntries = [];
                    for (let i = 0; i < productIdsOR.length; i++) {
                        itemEntries.push({
                            couponDetailId: couponDetail.id,
                            productId: productIdsOR[i],
                            status: 1,
                        });
                    }
                    if (itemEntries.length) {
                        await db.ch_coupon_items.bulkCreate(itemEntries, {
                            transaction: t,
                        });
                    }
                }

                await t.commit();

                let response = Util.getFormatedResponse(false, {
                    message: "Successfully created",
                });
                res.status(response.code).json(response);
            } catch (err) {
                await t.rollback();
                throw err;
            }
        } catch (err) {
            console.error(err);
            let response = Util.getFormatedResponse(true, {
                message: err.message,
            });
            res.status(response.code).json(response);
        }
    },

    async getCouponDiscList(req, res, next) {
        try {
            const query = {
                include: [
                    {
                        model: db.ch_coupon_items,
                        as: "couponItems",
                        attributes: ["id"],
                        include: [
                            {
                                model: db.product,
                                as: "productList",
                                attributes: ["id", "name", "slug"],
                            },
                        ],
                    },
                ],
            };
            const success = await db.ch_coupon_detail.findAll(query);
            let itemEntries = [];

            if (success && success.length) {
                for (let i = 0; i < success.length; i++) {
                    const coupon = success[i];
                    itemEntries.push({
                        id: coupon.id,
                        title: coupon.title,
                        couponCode: coupon.couponCode,
                        discount: coupon.discount,
                        onShopping: coupon.onShopping,
                        discountPer: coupon.discountPer,
                        status: coupon.status,
                        photo: coupon.photo,
                        description: coupon.description,
                        discountType: coupon.discountType,
                        startDate: coupon.startDate,
                        endDate: coupon.endDate,
                        product: coupon.couponItems,
                    });
                }
            }
            let response = Util.getFormatedResponse(false, itemEntries, {
                message: "Successfully",
            });
            res.status(response.code).json(response);
        } catch (err) {
            console.log(err);
            let response = Util.getFormatedResponse(true, {
                message: err.message,
            });
            res.status(response.code).json(response);
        }
    },
    async deleteProductFromCouponDisc(req, res, next) {
        try {
            db.ch_coupon_items
                .findOne({ where: { id: req.query.id } })
                .then((list) => {
                    // console.log("first", list)
                    if (list) {
                        return db.ch_coupon_items.destroy({ where: { id: list.id } });
                    }
                    throw new RequestError("Product is not found");
                })
                .then((re) => {
                    return res.status(200).json({
                        message: "success",
                        status: "deleted product Seccessfully",
                    });
                })
                .catch((err) => {
                    next(err);
                });
        } catch (err) {
            throw new RequestError("Error");
        }
    },

    async CouponDiscUpdate(req, res, next) {
        deleteFileFromS3(photo);
        const { photo } = req.body;
        try {
            const { id } = req.body;
            // console.log("first", req.body);
            const { title, startDate, endDate } = req.body;
            const tagsArr = req.body.productIds ? req.body.productIds.split(",") : [];
            const productIdsOR = [];
            for (const tag of tagsArr) {
                productIdsOR.push(tag);
            }
            const query = {
                where: {
                    id: id, // Assuming the coupon ID is stored in the `id` field
                },
            };
            const existingCoupon = await db.ch_coupon_detail.findOne(query);
            if (!existingCoupon) {
                throw new RequestError("Coupon not found", 404);
            }
            const t = await db.sequelize.transaction();
            try {
                await db.ch_coupon_detail.update(
                    {
                        couponCode: req.body.couponCode,
                        discount: req.body.discount,
                        onShopping: req.body.onShopping,
                        discountPer: req.body.discountPer,
                        title: title,
                        photo: req.file ? req.file.location : "",
                        description: req.body.description,
                        startDate: startDate,
                        endDate: endDate,
                        discountType: req.body.discountType,
                        status: true,
                    },
                    {
                        where: { id: id }, // Assuming the coupon ID is stored in the `id` field
                        transaction: t,
                    }
                );
                if (req.body.discountType !== "totalAmount" && productIdsOR.length) {
                    const existingItems = await db.ch_coupon_items.findAll({
                        where: { couponDetailId: id }, // Assuming the coupon ID is stored in the `id` field
                        transaction: t,
                    });
                    const existingProductIds = existingItems.map(item => item.productId);
                    const newProductIds = productIdsOR.filter(productId => !existingProductIds.includes(productId));
                    let itemEntries = [];
                    for (let i = 0; i < newProductIds.length; i++) {
                        itemEntries.push({
                            couponDetailId: id, // Assuming the coupon ID is stored in the `id` field
                            productId: newProductIds[i],
                            status: 1,
                        });
                    }
                    if (itemEntries.length) {
                        await db.ch_coupon_items.bulkCreate(itemEntries, {
                            transaction: t,
                        });
                    }
                }
                await t.commit();
                let response = Util.getFormatedResponse(false, {
                    message: "Successfully updated",
                });
                res.status(response.code).json(response);
            } catch (err) {
                await t.rollback();
                throw err;
            }
        } catch (err) {
            console.error(err);
            let response = Util.getFormatedResponse(true, {
                message: err.message,
            });
            res.status(response.code).json(response);
        }
    }
    ,


    async couponDiscStatusUpdate(req, res, next) {
        const { id, status } = req.body;

        const query = {};
        query.where = {};
        query.where.id = id;
        db.ch_coupon_detail
            .findOne(query)
            .then(async (list) => {
                if (list) {
                    const t = await db.sequelize.transaction();
                    try {
                        const flashSale = await db.ch_coupon_detail.update(
                            {
                                status: status,
                            },
                            { where: { id: id } },
                            { transaction: t }
                        );
                        return t.commit();
                    } catch (err) {
                        await t.rollback();
                        throw error;
                    }
                } else {
                    throw new RequestError("Not found collection", 409);
                }
            })
            .then((success) => {
                let response = Util.getFormatedResponse(false, {
                    message: "Successfully updated",
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

    async deleteCoupon(req, res, next) {
        try {
            const { id } = req.query;

            const coupon = await db.ch_coupon_detail.findOne({ where: { id: id } });
            if (!coupon) {
                throw new RequestError("Coupon not found", 404);
            }

            await db.ch_coupon_items.destroy({ where: { couponDetailId: id } });
            await db.ch_coupon_detail.destroy({ where: { id: id } });

            res.status(200).json({
                message: "Success",
                status: "Coupon and associated products deleted successfully",
            });
        } catch (err) {
            next(err);
        }
    },

    async applyCouponCode(req, res, next) {
        try {
            const { grandTotal, couponCode, productId, custId } = req.body;
            // Check if the coupon code exists and is valid
            const coupon = await db.ch_coupon_detail.findOne({
                where: { couponCode: couponCode },
                include: [
                    {
                        model: db.ch_coupon_items,
                        as: 'couponItems' // Specify the alias for the association
                    }
                ]
            });
            if (!coupon) {
                return res.status(400).json({ error: 'Invalid coupon code' });
            }
            const { startDate, endDate } = coupon;
            // Check if the current date is within the token's start and end dates
            const currentDate = moment();
            if (currentDate.isBefore(startDate) || currentDate.isAfter(endDate)) {
                return res.status(401).json({ error: 'Token expired' });
            }
            // Check if the coupon code is already used by the custId in the db.order table
            const existingOrder = await db.Order.findOne({
                where: {
                    custId: custId,
                    couponCode: couponCode
                }
            });
            if (existingOrder) {
                return res.status(400).json({ error: 'Coupon code already used' });
            }
            // Calculate the discounted price
            let discountedPrice = grandTotal;
            if (coupon.discountType === 'totalAmount' && grandTotal >= coupon.onShopping) {
                discountedPrice -= coupon.discount;
                return res.status(200).json({ grandTotal: discountedPrice, onShopping: coupon.onShopping, discount: coupon.discount });
            } else if (coupon.discountType === 'particularProduct') {
                const couponItems = coupon.couponItems;
                // Use the alias to access the associated items
                const couponProductIds = couponItems.map((item) => item.productId);
                // Check if the product IDs are associated with the coupon code
                if (!productId.every((id) => couponProductIds.includes(id))) {
                    return res.status(400).json({ error: 'These products are not attached to the coupon code' });
                }
                // Fetch all the product variants for bulk querying
                const variants = await db.ProductVariant.findAll({
                    where: {
                        id: productId
                    }
                });
                // Calculate the product discounts in bulk
                let productDiscount = 0;
                let totalAmount = 0;
                for (const variant of variants) {
                    const actualPrice = variant.actualPrice;
                    if (variant.discount === 0 && variant.discountPer === 0) {
                        const discount = actualPrice * (coupon.discountPer / 100);
                        productDiscount += discount;
                    }
                    totalAmount += actualPrice;
                }
                discountedPrice = totalAmount - productDiscount;

                return res.status(200).json({ grandTotal: discountedPrice });
            }
            // Apply additional conditions
            return res.status(400).json({ error: 'Coupon Discount Valid on orders above Rs 5000' });
        } catch (error) {
            console.error('Error applying coupon code:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    async redeemReferralCode(req, res) {
        const { referralCode, email } = req.body;
        // Check if the referral code exists
        if (referrals.hasOwnProperty(referralCode)) {
            const referrerId = referrals[referralCode];
            const refereeId = customerController.customers.length + 1;
            // Generate coupon codes for the referrer and the referee
            const referrerCouponCode = generateCouponCode();
            const refereeCouponCode = generateCouponCode();
            // Store the coupon codes
            coupons[referrerId] = db.Coupon(referrerId, referrerCouponCode);
            coupons[refereeId] = db.Coupon(refereeId, refereeCouponCode);
            res.json({ success: true, message: "Referral code redeemed successfully." });
        } else {
            res.json({ success: false, message: "Invalid referral code." });
        }
    },

    // Assuming 'db' is the database connection

    async changeDeliveryCharge(req, res) {
        try {
            const { totalShopping, localDeliveryCharge } = req.body;
            // console.log("first", totalShopping, localDeliveryCharge);

            // Assuming 'delivery_charges' represents the Sequelize model for the delivery charges table
            let deliveryCharges = await db.delivery_charges.findOne();
            if (!deliveryCharges) {
                // If there are no existing records, create a new one
                deliveryCharges = await db.delivery_charges.create({ totalShopping, localDeliveryCharge });
            } else {
                // If there is an existing record, update the requested fields
                if (typeof totalShopping !== "undefined") {
                    deliveryCharges.totalShopping = totalShopping;
                }
                if (typeof localDeliveryCharge !== "undefined") {
                    deliveryCharges.localDeliveryCharge = localDeliveryCharge;
                }
                await deliveryCharges.save();
            }

            // Retrieve the updated record from the database
            const updatedDeliveryCharges = await db.delivery_charges.findOne({
                attributes: ["id", "totalShopping", "localDeliveryCharge", "created_at", "updated_at"]
            });
            // console.log("ram", updatedDeliveryCharges);

            res.send(updatedDeliveryCharges);
        } catch (error) {
            res.send({ error: error.message }); // Send only the error message, not the full error object
        }
    },


};

