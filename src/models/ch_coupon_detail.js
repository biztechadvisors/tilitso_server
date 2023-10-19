'use strict';
module.exports = (sequelize, DataTypes) => {
  const ch_coupon_detail = sequelize.define('ch_coupon_detail', {
    couponCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    discount: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    discountType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    discountPer: {
      type: DataTypes.INTEGER,
    },
    onShopping: {
      type: DataTypes.INTEGER,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {});

  ch_coupon_detail.associate = function (models) {
    // associations can be defined here
    ch_coupon_detail.hasMany(models.ch_coupon_items, {
      foreignKey: "couponDetailId",
      as: "couponItems",
    });
  };

  return ch_coupon_detail;
};
