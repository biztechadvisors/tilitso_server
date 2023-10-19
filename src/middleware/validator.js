// const BaseJoi = require("joi");
// const Extension = require("joi-date-extensions");
// const Joi = BaseJoi.extend(Extension);

// // Define a middleware function to validate request bodies or query parameters
// const validateBody = (schema) => {
//   return (req, res, next) => {
//     try {
//       const result =
//         req.method !== "GET"
//           ? schema.validate(req.body)
//           : schema.validate(req.query);

//       // If validation fails, send a 400 response with validation errors
//       if (result.error) {
//         return res.status(400).json(result.error);
//       }

//       // Attach the validated data to the request object
//       if (!req.value) {
//         req.value = {};
//       }
//       req.value["body"] = result.value;
//       next();
//     } catch (error) {
//       console.error(error);
//       res.status(500).send("Internal Server Error");
//     }
//   };
// };

// const schemas = {
//   registerSchema: Joi.object({
//     firstName: Joi.string().required(),
//     lastName: Joi.string().required(),
//     email: Joi.string().email().required(),
//     password: Joi.string().required(),
//     phoneNo: Joi.string().required(), // Use Joi.string() for phone number
//     address: Joi.string().required(),
//     role: Joi.string().required(),
//     verify: Joi.number().required(),
//   }),
//   loginSchema: Joi.object().keys({
//     email: Joi.string().email().required(),
//     password: Joi.string().required(),
//     role: Joi.string().required(),
//   }),
//   customerLoginSchema: Joi.object().keys({
//     email: Joi.string().email().required(),
//     password: Joi.string().required(),
//     role: Joi.string().allow(null),
//   }),
//   userCheckSchema: Joi.object().keys({
//     email: Joi.string().email().required(),
//   }),
//   sendResetPassword: Joi.object().keys({
//     email: Joi.string().email().required(),
//     role: Joi.string().allow(null),
//   }),
//   emailVerify: Joi.object().keys({
//     email: Joi.string().email().required(),
//     key: Joi.string().required(),
//   }),
//   resetPassword: Joi.object().keys({
//     email: Joi.string().email().required(),
//     key: Joi.string().required(),
//     password: Joi.string().required(),
//   }),
//   supplierDetails: Joi.object().keys({
//     storename: Joi.string().required(),
//     status: Joi.number().required(),
//     shopaddress: Joi.string().required(),
//     shopdesc: Joi.string().required(),
//     ownername: Joi.string().required(),
//     owneraddress: Joi.string().required(),
//     email: Joi.string().email().required(),
//     phone: Joi.string().required(),
//     areaId: Joi.number().required(),
//   }),
//   location: Joi.object().keys({
//     name: Joi.string().required(),
//     status: Joi.number().required(),
//   }),
//   area: Joi.object().keys({
//     name: Joi.string().required(),
//     locationId: Joi.number().required(),
//     status: Joi.number().required(),
//   }),
//   bookSalonSchema: Joi.object().keys({
//     firstName: Joi.string().required(),
//     lastName: Joi.string().required(),
//     email: Joi.string().email().required(),
//     phoneNumber: Joi.number().required(),
//     appointmentDate: Joi.date().min(1).required(),
//     price: Joi.number().allow(""),
//     grandTotal: Joi.number().allow(""),
//     totalSave: Joi.number().allow(""),
//     serviceList: Joi.array().items(Joi.object()).allow(""),
//     salonOwnerId: Joi.number().required(),
//   }),

//   shopSchema: Joi.object().keys({
//     id: Joi.number().allow(null),
//     SHOPNAME: Joi.string().required(),
//     PHONE: Joi.string().required(),
//     ADDRESS: Joi.string().required(),
//     CITY: Joi.string().required(),
//     PICKUPADDRESS: Joi.string().required(),
//     DESCRIPTION: Joi.string().allow(""),
//     BANKNAME: Joi.string().allow(null),
//     BANKACCOUNTNO: Joi.number().allow(null),
//     BANKBRANCH: Joi.string().allow(null),
//     BANKACCOUNTHOLDERNAME: Joi.string().allow(null),
//   }),

//   area: Joi.object().keys({
//     name: Joi.string().required(),
//     locationId: Joi.number(),
//   }),
//   coupon: Joi.object().keys({
//     Code: Joi.string().required(),
//     VarientId: Joi.number().required(),
//     StartDate: Joi.date().required(),
//     EndDate: Joi.date().required(),
//     Type: Joi.number().required(),
//     Value: Joi.number().required(),
//   }),
// };

// module.exports = {
//   validateBody,
//   schemas,
// };
