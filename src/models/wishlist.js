'use strict';
module.exports = (sequelize, DataTypes) => {
    const wishlist = sequelize.define('wishlist', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        customer_id: {
            type: DataTypes.INTEGER
        },
        email: {
            type: DataTypes.STRING
        },
        phone: {
            type: DataTypes.STRING
        },
        cart_data: {
            type: DataTypes.JSON
        },
        cart_quantity: {
            type: DataTypes.INTEGER
        },
        created_at: {
            type: DataTypes.DATE
        },
        updated_at: {
            type: DataTypes.DATE
        }
    }, {
        tableName: 'wishlist',
        timestamps: true,
        underscored: true
    });

    return wishlist;
};