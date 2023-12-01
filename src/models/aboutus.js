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
            }
        },
        {}
    );
    AboutUs.associate = function (models) {
        // associations can be defined here
    };
    return AboutUs;
};
