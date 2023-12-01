const { db } = require('../../../models');

module.exports = {
    async AddFaq(req,res, next){
    const t = await db.sequelize.transaction();
        try{
            const{
                question,
                answer,
                subCategoryId,
                categoryId
            } = req.body;
            try{
                const faqCreated = await db.Faq.create({
                    question: question,
                    answer: answer,
                    subCategoryId: subCategoryId,
                    categoryId:categoryId,}, 
                { transaction: t })
                await t.commit();
                return res.status(201).json({success:true, message:"Successfully inserted FAQ"});
            }catch(error){
                await t.rollback();
                throw error;
            }
        }catch (err) {
        next(err);
        }
    },

    async GetFaq(req,res,next){
        try{
            let faqDataArray = []
            const faqs = await db.Faq.findAll();
            for(const data of faqs){
                const{id,question,answer,categoryId , subCategoryId} = data
                let category = await db.category.findOne({ where: { id: categoryId }});
                    if (!category) {
                    categoryId = null
                    }

                let subcategory = await db.SubCategory.findOne({ where: { id: subCategoryId } });
                    if (!subcategory) {
                        subcategory = null
                    }
                // console.log(subcategory)
                faqData = {
                    id:id,
                    question:question,
                    answer:answer,
                    category:category,
                    subCategoryId:subcategory
                }
                faqDataArray.push(faqData);
            }

            console.log(faqData.category.id)

            if (faqs.length > 0) {
              return res.status(200).json({ success: true, data: faqDataArray });
            } else {
              return res.status(404).json({ success: false, msg: "No Faq is Here" });
            }
        }catch(err){
            next(err);
        }
    },

    async GetFaqId(req,res,next){
        try{
            const {faqId} = req.body
            let faqOneData = {}
            const faqOne = await db.Faq.findOne({
                where:{id:faqId}
            })
                const{id,question,answer,categoryId , subCategoryId} = faqOne
                const category = await db.category.findOne({ where: { id: categoryId }});
                    if (!category) {
                    throw new Error(`Category not found for ID: ${categoryId}`);
                    }

                const subcategory = await db.SubCategory.findOne({ where: { id: subCategoryId } });
                    if (!subcategory) {
                        throw new Error(`Subcategory not found for name: ${subCategoryId}`);
                    }
                faqOneData = {
                    id:id,
                    question:question,
                    answer:answer,
                    category:category,
                    subCategoryId:subcategory
                }

            console.log(faqOneData.category.id)

            if (faqOne) {
              return res.status(200).json({ success: true, data: faqOneData });
            } else {
              return res.status(404).json({ success: false, msg: "No Faq is Here" });
            }
        }catch(err){
            next(err);
        }
    },

    async UpdateFaq(req,res,next){
        try{
            const{
                id,
                question,
                answer,
                subCategoryId,
                categoryId
            } = req.body;

            if(id){
                const isFaq = await db.Faq.findOne({
                    where:{id:id}
                })
                if (!isFaq) {
                    throw new Error(`Category not found for name: ${id}`);
                  }
                const updateFaq = await db.Faq.update({
                    question: question,
                    answer: answer,
                    subCategoryId: subCategoryId,
                    categoryId:categoryId,
                },{
                    where:{id:id}
                });

                if(updateFaq > 0){
                return res.status(201).json({
                    success: true,
                    message: "FAQ will be updated"
                });
            }else{
                return res.status(404).json({
                    success: false,
                    message: "No FAQ was updated"
                  });
                }
        
            }

        }catch(err){
            next(err)
        }
    },

    async DeleteFaq(req,res,next){
        try {
            const { faqId } = req.body;
            const deletedRows = await db.Faq.destroy({
              where: {
                id: faqId,
              },
            });
        
            if (deletedRows > 0) {
              return res.status(201).json({ success: true, msg: "Successfully Delete FAQ" });
            } else {
              return res.status(404).json({ success: false, msg: "FAQ not found" });
            }
          } catch (err) {
            next(err);
          }
    }


}