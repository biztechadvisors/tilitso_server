const express = require('express');
const productController = require('./product.controller');
const upload = require('../../../awsbucket');

const productRouter = express.Router();

productRouter.route('/add').post(
  upload.single('photo'),
  productController.addProduct
);

productRouter.route('/uploadPro').post(
  upload.single('photo'),
  productController.uploadProductsAsync
);

productRouter.route('/getAllproduct').get(productController.index);

productRouter.route('/getAllproductList').post(

  productController.getAllProductList
);

productRouter.route('/search/getAllproductList').get(

  productController.searchAllProductList
);

productRouter.route('/update').post(

  upload.single('photo'),
  productController.update
);

productRouter.route('/getProductByCategory').get(
  productController.getProductListByCategory
);

productRouter.route('/getProductById').get(
  productController.getProductListById
);

productRouter.route('/getWebProductById').post(
  productController.getWebProductListById
);

productRouter.route('/product-offer').post(
  productController.addProductOffer
);

productRouter.route('/getAllProductOffer').get(
  productController.getProductOffer
);

productRouter.route('/delete').delete(

  productController.productDelete
);

productRouter.route('/deleteOfferById/:id').get(

  productController.productOfferDelete
);

productRouter.route('/upload-img').post(

  upload.array('file', 10),
  productController.multiplePhotoUpload
);

productRouter.route('/upload/varient-img').post(
  upload.array('file', 10),
  productController.varientImageUpload
);

productRouter.route('/getAllPhoto').post(
  productController.getAllPhoto
);

productRouter.route('/getAllPhotoById').post(
  productController.getAllPhotoById
);

productRouter.route('/slider-photo/delete').delete(

  productController.deleteSliderPhoto
);

productRouter.route('/varients-delete').delete(

  productController.productVarients
);

productRouter.route('/main-delete').delete(

  productController.deleteMainProduct
);

productRouter.route('/new-arrival').get(
  productController.newArrivalProduct
);

productRouter.route('/list').post(
  productController.getAllProductBySlug
);

productRouter.route('/getAllByCategory').post(
  productController.GetAllByCategory
);

productRouter.route('/catalogsearch/result').get(
  productController.getFilterbyProduct
);

productRouter.route('/filtersortby').post(
  productController.filtershortby
);

productRouter.route('/status/update').post(

  productController.statusUpdate
);

productRouter.route('/update-stock').post(

  productController.stockUpdate
);

productRouter.route('/banner-upload').post(

  upload.single('banner'),
  productController.bannerUpload
);

productRouter.route('/admin/banner-list').get(

  productController.bannerAdminList
);

productRouter.route('/banner-list').get(
  productController.bannerList
);

productRouter.route('/banner-status').post(

  productController.bannerStatus
);

productRouter.route('/aws/delete/photo').post(

  productController.awsProductPhotoDelete
);

productRouter.route('/website/relatedProduct').post(
  productController.relatedProduct
);

productRouter.route('/banner-delete').post(

  productController.bannerListDelete
);

productRouter.route('/seo-create').post(

  productController.seoDetailsList
);

productRouter.route('/color/create').post(
  upload.single('thumbnail'),

  productController.createColorDetails
);

productRouter.route('/color-update').post(
  upload.single('thumbnail'),

  productController.updateColorDetails
);

productRouter.route('/color/list').post(

  productController.getColorList
);

productRouter.route('/color/delete').delete(

  productController.deleteColorById
);

productRouter.route('/color/list').get(

  productController.productColourList
);

productRouter.route('/getAllList').get(

  productController.getProductForFlash
);

productRouter.route('/tag').get(

  productController.getTag
);

productRouter.route('/tag').delete(

  productController.getDeleteTag
);

productRouter.route('/attributeAdd').post(
  productController.createAttribute
);

productRouter.route('/attributeValuesAdd').post(
  productController.createAttributeValues);

productRouter.route('/getAllAttribute').get(
  productController.getAllAttribute);

productRouter.route('/getDeleteAttributeValue').delete(
  productController.getDeleteAttributeValue);

productRouter.route('/getDeleteAttribute').delete(
  productController.getDeleteAttribute);

module.exports = productRouter;
