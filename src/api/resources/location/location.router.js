const express = require("express");
const locationController = require("./location.controller");
const {  jwtCustomerStrategy } = require("../../../middleware/strategy");

const locationRouter = express.Router();

locationRouter.route("/create").post(locationController.index);
locationRouter.route("/list").get(locationController.List);
locationRouter.route("/delete").delete(locationController.getLocationDelete);
locationRouter.route("/update").post(locationController.getLocationUpdate);

// Area create
locationRouter.route("/area/create").post(locationController.areaCreate);
locationRouter.route("/area/delete").delete(locationController.getAreaDeleteById);
locationRouter.route("/area/getAllAreaList").get(locationController.getAreaList);
locationRouter.route("/area/update").post(locationController.getCityUpdate);
locationRouter.route("/area/list").get(locationController.cityList);
locationRouter.route("/area/create").post(locationController.cityCreate);
locationRouter.route("/area/delete").delete(locationController.deleteCity);

// Get location
locationRouter.route("/area/list/getbyid").get(locationController.getAreaListById);

module.exports = locationRouter;
