'use strict';
module.exports = (sequelize, DataTypes) => {
    const Payment = sequelize.define('Payment', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        payment_transaction_id: DataTypes.INTEGER,
        payment_transaction_order_id: DataTypes.INTEGER,
        transaction_id: DataTypes.STRING,
        transaction_type: DataTypes.STRING,
        amount: DataTypes.FLOAT,
        additional_information: DataTypes.JSON,
        razorpay_payment_id: DataTypes.STRING,
        orderId: DataTypes.INTEGER,
        custId: DataTypes.INTEGER
    }, {});
    Payment.associate = function (models) {
        // associations can be defined here
        models.Payment.belongsTo(models.Order, { foreignKey: 'orderId' });
        models.Payment.hasOne(models.customer, {
            foreignKey: 'id',
            sourceKey: 'custId',
            as: 'user'
        });
    };
    return Payment;
};