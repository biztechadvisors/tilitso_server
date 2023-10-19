'use strict';
module.exports = (sequelize, DataTypes) => {
  const ch_coupon_items = sequelize.define('ch_coupon_items', {
    couponDetailId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products', // Make sure 'products' is the correct table name
        key: 'id' // Make sure 'id' is the correct primary key column name in the 'products' table
      }
    },
  }, {});

  ch_coupon_items.associate = function (models) {
    // associations can be defined here
    ch_coupon_items.belongsTo(models.ch_coupon_detail, {
      foreignKey: "couponDetailId",
      as: "couponItems",
    });

    ch_coupon_items.belongsTo(models.product, {
      foreignKey: "productId",
      as: "productList",
    });
  };

  return ch_coupon_items;
};
