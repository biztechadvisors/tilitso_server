'use strict';

module.exports = function (sequelize, DataTypes) {
  const AttributeValue = sequelize.define('AttributeValue', { // Update model name to match the actual model name
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    meta: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {});

 AttributeValue.associate = function (models) {
    AttributeValue.belongsTo(models.Attribute, { foreignKey: 'attribute_id' });
  };

 return AttributeValue;
};