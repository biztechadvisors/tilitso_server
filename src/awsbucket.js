const config = require("./config");
const multer = require("multer");
const AWS = require("aws-sdk");
const multerS3 = require("multer-s3");


AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/svg") {
    cb(null, true);
  } else {
    cb(new Error("Invalid Mime Type, only JPEG and PNG"), false);
  }
};

const upload = multer({
  storage: multerS3({
    fileFilter,
    s3: s3,
    bucket: "tilitsobucket",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: "diversitech_meta_data" });
    },
    key: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

module.exports = upload;
