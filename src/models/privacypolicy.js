"use strict";
const { Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const PrivacyPolicy = sequelize.define(
        "PrivacyPolicy",
        {
            banner: DataTypes.TEXT,
            title: DataTypes.STRING,
            content: DataTypes.STRING,
            slug: DataTypes.STRING,
            status: {
                type: DataTypes.BOOLEAN,
                validate: {
                    isUnique: async function (value, next) {
                        let existing = await PrivacyPolicy.findOne({
                            where: {
                                status: true,
                                id: {
                                    [Op.ne]: this.id
                                }
                            }
                        });
                        if (existing) {
                            return next('Only one row can have status true');
                        }
                        return next();
                    }
                }
            }
        },
        {}
    );
    PrivacyPolicy.associate = function (models) {
        // associations can be defined here
    };
    return PrivacyPolicy;
};
