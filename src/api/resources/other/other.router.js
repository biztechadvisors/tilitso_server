const express = require('express');
const otherController = require('./other.controller')

const otherRouter = express.Router();


otherRouter.route("/create").post(otherController.create)

module.exports = otherRouter;