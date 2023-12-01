const express = require("express");
const attributeController = require("./attribute.controller");
const upload = require("../../../awsbucket");

const attributeRouter = express.Router();

attributeRouter.route('/attributeAdd').post(
    attributeController.createAttribute
);

attributeRouter.route('/attributeValuesAdd').post(
    attributeController.createAttributeValues);

attributeRouter.route('/getAllAttribute').get(
    attributeController.getAllAttribute);


attributeRouter.route('/getAttribute').get(
    attributeController.getAttribute);


attributeRouter.route('/getDeleteAttributeValue').delete(
    attributeController.getDeleteAttributeValue);

attributeRouter.route('/getDeleteAttribute').delete(
    attributeController.getDeleteAttribute);


module.exports = attributeRouter;
