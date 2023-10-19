'use strict';
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    custId: DataTypes.INTEGER,
    order_Id: DataTypes.INTEGER,
    shipment_id: DataTypes.INTEGER,
    addressId: DataTypes.INTEGER,
    number: DataTypes.STRING,
    paymentmethod: DataTypes.STRING,
    deliverydate: DataTypes.DATE,
    grandtotal: DataTypes.INTEGER,
    totalDiscount: DataTypes.INTEGER,
    couponCode: DataTypes.STRING,
    localDeliveryCharge: DataTypes.STRING,
    razorpay_payment_id: DataTypes.STRING,
    status: DataTypes.ENUM('processing', 'shipping', 'delieverd', 'cancel', "cancelRequest"),
  }, {});
  Order.associate = function (models) {
    // associations can be defined here
    models.Order.hasMany(models.Cart_Detail, { foreignKey: 'orderId' });
    models.Order.hasMany(models.Address, { foreignKey: 'orderId' });
    // models.Order.hasMany(models.Payment, { foreignKey: 'orderId' });

    models.Order.hasOne(models.customer, {
      foreignKey: 'id',
      sourceKey: 'custId',
      as: 'user'
    });

    models.Order.hasOne(models.Address, {
      foreignKey: 'id',
      sourceKey: 'addressId',
      as: 'address'
    });

  };
  return Order;
};