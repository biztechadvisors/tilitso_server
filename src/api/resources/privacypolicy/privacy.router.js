const express = require('express');
const privacyController = require('./privacy.controller');
const upload = require('../../../awsbucket');

const privacyRouter = express.Router();

privacyRouter.route('/insert').post(
    upload.single('photo'),
    privacyController.AddPrivacy
  );

module.exports = privacyRouter;