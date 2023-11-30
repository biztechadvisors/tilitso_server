"use strict";
module.exports = (sequelize, DataTypes) => {
    const Blog = sequelize.define(
        "Blog",
        {
            banner: DataTypes.TEXT,
            title: DataTypes.STRING,
            content: DataTypes.STRING,
            slug: DataTypes.STRING,
            status: DataTypes.BOOLEAN,
            desc: DataTypes.STRING,
        },
        {}
    );
    Blog.associate = function (models) {
        // associations can be defined here
    };
    return Blog;
};
