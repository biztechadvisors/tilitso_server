const express = require('express');
const faqController = require('./faq.controller');

const faqRouter = express.Router();

faqRouter.route('/insert').post(
    faqController.AddFaq
);
faqRouter.route('/getFaq').get(
    faqController.GetFaq
);

faqRouter.route('/getFaqId').post(
    faqController.GetFaqId
);

faqRouter.route('/updateFaq').post(
    faqController.UpdateFaq
);

faqRouter.route('/deleteFaq').delete(
    faqController.DeleteFaq
);

module.exports = faqRouter