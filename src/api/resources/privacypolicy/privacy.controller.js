const { db } = require('../../../models');
const AWS = require('aws-sdk');


// const s3 = new AWS.S3({
//     accessKeyId: process.env.AWS_ACCESS_KEY,
//     secretAccessKey: process.env.AWS_SECRET_KEY,
//   });

//   let deleteFileFromS3 = async (imgUrl) => {
//     try {
//       const lastItem = imgUrl.substring(imgUrl.lastIndexOf('/') + 1);
//       let params = {
//         Bucket: 'ninocodenox',
//         Key: lastItem,
//       };
//       s3.deleteObject(params, (error, data) => {
//         if (error) {
//           console.log(error, error.stack);
//         }
//         return data;
//       });
//     } catch (error) {
//       assert.isNotOk(error, 'Promise error');
//       done();
//     }
//   };

module.exports = {

  async AddPrivacy(req, res, next) {
    try {
      console.log("Privacy-Policy-Data", req.body)
      console.log("Privacy-Policy-Image", req.file.location)
      const { title, content, slug, status } = req.body
      await db.PrivacyPolicies.create({
        banner: req.file.location ? req.file.location : "",
        title: title,
        content: content,
        slug: slug,
        status: status
      })
      return res.status(201).json({ success: true, message: "Successfully inserted PrivacyPolicy" })
    } catch (err) {
      next(err)
    }
  },

  async GetPrivacy(req, res, next) {
    try {
      let PrivacyDataArray = []
      const Privacy = await db.PrivacyPolicies.findAll();
      for (const data of Privacy) {
        const { id, title, banner, content, status, slug, createdAt, updatedAt } = data

        PrivacyData = {
          id: id,
          title: title,
          slug: slug,
          content: content,
          banner: banner,
          status: status,
          createdAt: createdAt,
          updatedAt: updatedAt
        }
        PrivacyDataArray.push(PrivacyData);
      }

      if (Privacy.length > 0) {
        return res.status(200).json({ success: true, data: PrivacyDataArray });
      } else {
        return res.status(404).json({ success: false, msg: "No PrivacyPolicies is Here" });
      }
    } catch (err) {
      next(err);
    }
  },

  async GetPrivacySlug(req, res, next) {
    try {
      const { id, slug } = req.query
      const PrivacyOne = await db.PrivacyPolicies.findOne({
        where: { id: id, slug: slug }
      })
      if (PrivacyOne) {
        return res.status(200).json({ success: true, data: PrivacyOne });
      } else {
        return res.status(404).json({ success: false, msg: "No Faq is Here" });
      }
    } catch (err) {
      next(err);
    }
  },

  async UpdatePrivacy(req, res, next) {
    try {
      const {
        id,
        banner,
        title,
        content,
        slug,
        status
      } = req.body;

      if (id) {
        const isPrivacy = await db.PrivacyPolicies.findOne({
          where: { id: id }
        })
        if (!isPrivacy) {
          throw new Error(`Privacy not found for name: ${id}`);
        }
        const updatePrivacy = await db.PrivacyPolicies.update({
          banner: req.file ? req.file.location : banner,
          title: title,
          content: content,
          slug: slug,
          status: status
        }, {
          where: { id: id }
        });

        if (updatePrivacy > 0) {
          return res.status(201).json({
            success: true,
            message: "Privacy will be updated"
          });
        } else {
          return res.status(404).json({
            success: false,
            message: "No Privacy was updated"
          });
        }

      } else {
        return res.status(404).json({
          success: false,
          message: "Id Not Found"
        });
      }

    } catch (err) {
      next(err)
    }
  },

  async DeletePrivacy(req, res, next) {
    try {
      const { PrivacyId } = req.body;
      const deletedRows = await db.PrivacyPolicies.destroy({
        where: {
          id: PrivacyId,
        },
      });

      if (deletedRows > 0) {
        return res.status(201).json({ success: true, msg: "Successfully Delete Privacy" });
      } else {
        return res.status(404).json({ success: false, msg: "Privacy not found" });
      }
    } catch (err) {
      next(err);
    }
  }

}