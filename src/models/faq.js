'use strict';

module.exports = function (sequelize, DataTypes) {
    const Faq = sequelize.define('Faq', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        question: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        answer: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        categoryId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Category', // name of Target model
                key: 'id', // key in Target model that we're referencing
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        },
        subCategoryId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'SubCategory', // name of Target model
                key: 'id', // key in Target model that we're referencing
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        },
    }, {});

    Faq.associate = function (models) {
        Faq.belongsTo(models.SubCategory, {
            foreignKey: "subCategoryId",
        });

        Faq.belongsTo(models.Category, {
            foreignKey: "categoryId",
            as: "maincat",
        });
    };

    return Faq;
};
