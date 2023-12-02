const express = require('express');
const aboutController = require('./about.controller')
const upload = require('../../../awsbucket')


const aboutRouter = express.Router();

aboutRouter.route('/insert').post(
    upload.single('photo'),
    aboutController.addAbout
);

aboutRouter.route('/getAbout').get(
    aboutController.GetAbout
);

aboutRouter.route('/getAboutSlug').get(
    aboutController.GetAboutSlug
);

aboutRouter.route('/updateAbout').post(
    upload.single('photo'),
    aboutController.UpdateAbout
);

aboutRouter.route('/deleteAbout').delete(
    aboutController.DeleteAbout
);
module.exports = aboutRouter;