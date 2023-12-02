const { db } = require('../../../models');

  module.exports = {
    async addAbout(req,res,next){
        try{
            const{title,content,slug,status,banner}=req.body
            const aboutCreated  = await db.AboutUs.create({
                title: title,
                content:content,
                slug:slug,
                status:status,
                banner:req.file?req.file.location:null
            })
            if(!aboutCreated){
                return res.status(201).json({success:false, message:"Already Inserted Please Remove One for data for AboutUS"});  
            }
            return res.status(201).json({success:true, message:"Successfully inserted AboutUs"});
        }catch(err){
            next(err)
            return res.status(201).json({success:false , message:"Something Went Wrong"});  
        }
    },

    async GetAbout(req,res,next){
        try{
            let AboutDataArray = []
            const aboutUs = await db.AboutUs.findAll();
            for(const data of aboutUs){
                const{id,title,banner,content,status,slug,createdAt,updatedAt} = data
               
                AboutData = {
                    id:id,
                    title:title,
                    slug:slug,
                    content:content,
                    banner:banner,
                    status:status,
                    createdAt:createdAt,
                    updatedAt:updatedAt
                }
                AboutDataArray.push(AboutData);
            }

            console.log(AboutDataArray)

            if (aboutUs.length > 0) {
              return res.status(200).json({ success: true, data: AboutDataArray });
            } else {
              return res.status(404).json({ success: false, msg: "No aboutUs is Here" });
            }
        }catch(err){
            next(err);
        }
    },

    async GetAboutSlug(req,res,next){
        try{
            const {id, slug} = req.query
            console.log(req.query)
            const aboutOne = await db.AboutUs.findOne({
                where:{id:id, slug:slug}
            })
            if (aboutOne) {
              return res.status(200).json({ success: true, data: aboutOne });
            } else {
              return res.status(404).json({ success: false, msg: "No Faq is Here" });
            }
        }catch(err){
            next(err);
        }
    },

    async UpdateAbout(req,res,next){
        try{
            const{
                id,
                banner,
                title,
                content,
                slug,
                status
            } = req.body;
            // console.log(req.body)

            if(id){
                const isAbout = await db.AboutUs.findOne({
                    where:{id:id}
                })
                if (!isAbout) {
                    throw new Error(`AboutUs not found for name: ${id}`);
                  }
                const updateAbout = await db.AboutUs.update({
                    banner: req.file?req.file.location:banner,
                    title: title,
                    content: content,
                    slug:slug,
                    status:status
                },{
                    where:{id:id}
                });
                // console.log(updateAbout)

                if(updateAbout > 0){
                return res.status(201).json({
                    success: true,
                    message: "aboutUs will be updated"
                });
            }else{
                return res.status(404).json({
                    success: false,
                    message: "No aboutUs was updated"
                  });
                }
        
            }

        }catch(err){
            next(err)
        }
    },

    async DeleteAbout(req,res,next){
        try {
            const { AboutId } = req.body;
            const deletedRows = await db.AboutUs.destroy({
              where: {
                id: AboutId,
              },
            });
        
            if (deletedRows > 0) {
              return res.status(201).json({ success: true, msg: "Successfully Delete AboutUs" });
            } else {
              return res.status(404).json({ success: false, msg: "AboutUs not found" });
            }
          } catch (err) {
            next(err);
          }
    },
  }