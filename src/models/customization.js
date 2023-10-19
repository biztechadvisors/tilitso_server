"use strict";
module.exports = (sequelize, DataTypes) => {
  const customization = sequelize.define(
    "customization",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
      phone: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
      },
      message: DataTypes.STRING,
    },
    {
      timestamps: true,
    },
  );
  return customization;
};
