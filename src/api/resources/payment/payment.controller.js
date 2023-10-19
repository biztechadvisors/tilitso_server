const Razorpay = require('razorpay');
const crypto = require('crypto');
const { response } = require('express');

const razorpay = new Razorpay({
  key_id: "rzp_test_5pZjAxubHkUaGo",
  key_secret: "m2eUDWAactAclyIvFABxZ1Kh",
});

async function orderDetails(req, res, next) {
  const { amount, currency, payment_capture } = req.body;
  try {
    const options = {
      amount: amount,
      currency: currency,
      payment_capture: payment_capture || 1,
    };
    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, order: order });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
}

async function findOrderList(req, res, next) {
  const { razorpay_payment_id } = req.body;
  try {
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    // console.log("Payment", payment)
    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
}

async function getKey(req, res) {
  res.status(200).json({ key: process.env.key_id })
}

async function getAllPayment(req, res, next) {
  try {
    const payments = await db.payment.findAll({
      include: [{ model: db.customer }],
    });
    res.status(200).json({ success: true, data: payments });
  } catch (err) {
    throw new RequestError('Error');
  }
}

module.exports = {
  orderDetails,
  getKey,
  findOrderList,
  getAllPayment,
};
