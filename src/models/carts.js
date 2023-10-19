'use strict';
module.exports = (sequelize, DataTypes) => {
    const carts = sequelize.define('carts', {
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
        tableName: 'carts',
        timestamps: true,
        underscored: true
    });

    return carts;
};