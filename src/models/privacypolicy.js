"use strict";
const { Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const PrivacyPolicies = sequelize.define(
        "PrivacyPolicies",
        {
            banner: DataTypes.TEXT,
            title: DataTypes.STRING,
            content: DataTypes.STRING,
            slug: DataTypes.STRING,
            status: DataTypes.BOOLEAN,
        },
        {}
    );
    PrivacyPolicies.associate = function (models) {
        // associations can be defined here
    };
    return PrivacyPolicies;
};
