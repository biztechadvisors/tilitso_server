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
            }
        },
        {}
    );
    PrivacyPolicy.associate = function (models) {
        // associations can be defined here
    };
    return PrivacyPolicy;
};
