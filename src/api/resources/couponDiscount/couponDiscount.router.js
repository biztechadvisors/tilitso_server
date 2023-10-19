const express = require("express");
const { jwtStrategy } = require("../../../middleware/strategy");
const upload = require("../../../awsbucket");
const couponDiscountController = require("./couponDiscount.controller");

const couponDiscountRouter = express.Router();

couponDiscountRouter.route("/coupon-create").post( upload.single("photo"), couponDiscountController.CouponDiscCreate);
couponDiscountRouter.route("/redeem").post(couponDiscountController.redeemReferralCode);

couponDiscountRouter.get("/coupon-list", couponDiscountController.getCouponDiscList);

couponDiscountRouter.delete("/coupon-delete",  couponDiscountController.deleteProductFromCouponDisc);

couponDiscountRouter.put("/coupon-update",  upload.single("photo"), couponDiscountController.CouponDiscUpdate);

couponDiscountRouter.route("/coupon-status").put( couponDiscountController.couponDiscStatusUpdate);

couponDiscountRouter.delete("/couponDesc-delete",  couponDiscountController.deleteCoupon);

couponDiscountRouter.post("/apply-coupon", couponDiscountController.applyCouponCode);

couponDiscountRouter.post("/changeDeliveryCharge", couponDiscountController.changeDeliveryCharge);

module.exports = couponDiscountRouter;
