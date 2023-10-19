const { db } = require('../../../models');
const Util = require("../../../helpers/Util");
const config = require("../../../config");
const moment = require('moment');
const AWS = require("aws-sdk");
const s3 = new AWS.S3({
    accessKeyId: config.app.AWS_ACCESS_KEY,
    secretAccessKey: config.app.AWS_SECRET_KEY,
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


export default {
    referralCreate: async (req, res, next) => {
        try {
            console.log("first", req.body);
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

    getReferralList: async (req, res, next) => {
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
                        onShopping: req.body.onShopping,
                        discountPer: req.body.discountPer,
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

    redeemReferralCode: async (req, res, next) => {
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

};

