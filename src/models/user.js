"use strict";
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    "user",
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      address: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      role: DataTypes.STRING,
      verify: DataTypes.BOOLEAN,
      password: DataTypes.STRING,
      attempt: DataTypes.INTEGER,
      loggedOutAt: DataTypes.DATE,
      // rewardpoints: DataTypes.STRING,
      // usedrewardpoints: DataTypes.STRING,
    },
    {}
  );
  user.associate = function (models) {
    // associations can be defined here
    models.user.hasMany(models.ch_seller_shopdetail, {
      foreignKey: "SELLERID",
    });
  };
  return user;
};
