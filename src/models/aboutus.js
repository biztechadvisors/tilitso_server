"use strict";
const { Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const AboutUs = sequelize.define(
        "AboutUs",
        {
            banner: DataTypes.TEXT,
            title: DataTypes.STRING,
            content: DataTypes.STRING,
            slug: DataTypes.STRING,
            status: {
                type: DataTypes.BOOLEAN,
                validate: {
                    isUnique: async function (value, next) {
                        let aboutUs = await AboutUs.findOne({
                            where: {
                                status: true,
                                id: {
                                    [Op.ne]: this.id
                                }
                            }
                        });
                        if (aboutUs) {
                            return next('Only one row can have status true');
                        }
                        return next();
                    }
                }
            }
        },
        {}
    );
    AboutUs.associate = function (models) {
        // associations can be defined here
    };
    return AboutUs;
};
