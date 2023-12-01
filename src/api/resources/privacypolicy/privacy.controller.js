const { db } = require('../../../models');
const AWS = require('aws-sdk');


const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  });

  let deleteFileFromS3 = async (imgUrl) => {
    try {
      const lastItem = imgUrl.substring(imgUrl.lastIndexOf('/') + 1);
      let params = {
        Bucket: 'ninocodenox',
        Key: lastItem,
      };
      s3.deleteObject(params, (error, data) => {
        if (error) {
          console.log(error, error.stack);
        }
        return data;
      });
    } catch (error) {
      assert.isNotOk(error, 'Promise error');
      done();
    }
  };

module.exports = {

    async AddPrivacy(req,res,next){
        try{
            const {title,content,slug,status} = req.body
            await db.PrivacyPolices.create({
              banner: req.file ? req.file.location : "",
              title:title,
              content: content,
              slug: slug,
              status: status
            })
            return res.status(201).json({success:true, message:"Successfully inserted PrivacyPolicy"})
        }catch(err){
            next(err)
        }

    }
}