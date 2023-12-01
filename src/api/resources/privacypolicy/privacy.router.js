const express = require('express');
const privacyController = require('./privacy.controller');
const upload = require('../../../awsbucket');

const privacyRouter = express.Router();

privacyRouter.route('/insert').post(
    upload.single('photo'),
    privacyController.AddPrivacy
  );

  privacyRouter.route('/getPrivacy').get(
    privacyController.GetPrivacy
);

privacyRouter.route('/getPrivacySlug').get(
    privacyController.GetPrivacySlug
);

privacyRouter.route('/updatePrivacy').post(
    upload.single('photo'),
    privacyController.UpdatePrivacy
);

privacyRouter.route('/deletePrivacy').delete(
    privacyController.DeletePrivacy
);
module.exports = privacyRouter;