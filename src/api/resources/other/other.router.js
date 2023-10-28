const express = require('express');
const otherController = require('./other.controller')

const otherRouter = express.Router();


otherRouter.route("/getWallet").get(otherController.getWallet)

module.exports = otherRouter;