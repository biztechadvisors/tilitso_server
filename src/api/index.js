const express = require("express");
const authRouter = require("./resources/auth");
const productRouter = require("./resources/product");
const vendorRouter = require("./resources/vendor");
const sellerRouter = require("./resources/seller");
const categoryRouter = require("./resources/category");
const locationRouter = require("./resources/location");
const customerRouter = require("./resources/customer");
const orderRouter = require("./resources/order");
const businessRouter = require("./resources/business");
const seoRouter = require("./resources/seo");
const websiteRouter = require("./resources/website");
const collectionRouter = require("./resources/collection");
const abandonedCartsRouter = require("./resources/abandonedCart");
const paymentRouter = require("./resources/payment");
const couponDiscountRouter = require("./resources/couponDiscount");
const otherRouter = require("./resources/other")

const restRouter = express.Router();
restRouter.use("/auth", authRouter);
restRouter.use("/customer", customerRouter);
restRouter.use("/location", locationRouter);
restRouter.use("/product", productRouter);
restRouter.use("/vendor", vendorRouter);
restRouter.use("/seller", sellerRouter);
restRouter.use("/category", categoryRouter);
restRouter.use("/order", orderRouter);
restRouter.use("/business", businessRouter);
restRouter.use("/seo", seoRouter);
restRouter.use("/website", websiteRouter);
restRouter.use("/collection", collectionRouter);
restRouter.use("/carts", abandonedCartsRouter);
restRouter.use("/payment", paymentRouter);
restRouter.use("/couponDiscount", couponDiscountRouter);
restRouter.use("/other", otherRouter);


// Define and import findVendorWithLowestPrice function
const { findVendorWithLowestPrice } = require("../utils");

restRouter.get("/vendorMin", async (req, res) => {
  try {
    const productId = req.query.productId;
    const { vendor } = await findVendorWithLowestPrice(productId);
    res.status(200).send({ vendor });
  } catch (err) {
    res.status(500).send({ err });
  }
});

module.exports = restRouter;

