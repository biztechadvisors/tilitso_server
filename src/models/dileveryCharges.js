"use strict";
module.exports = (sequelize, DataTypes) => {
  const DeliveryCharges = sequelize.define(
    "delivery_charges",
    {
      totalShopping: DataTypes.INTEGER,
      localDeliveryCharge: DataTypes.INTEGER,
    },
    {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );
  return DeliveryCharges;
};
