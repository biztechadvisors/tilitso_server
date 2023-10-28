"use strict";
module.exports = (sequelize, DataTypes) => {
    const wallet_point = sequelize.define(
        "wallet_point",
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            walletPoints: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            walletCurrency: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            usedWalletPoints: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            customerId: { // Change to `customerId`
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'customer',
                    key: 'id',
                },
            },
        },
        {}
    );
    wallet_point.associate = function (models) {
        // associations can be defined here
        models.wallet_point.belongsTo(models.customer, {
            foreignKey: 'customerId'
        });
    };
    return wallet_point;
};