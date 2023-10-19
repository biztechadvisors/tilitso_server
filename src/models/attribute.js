'use strict';

module.exports = function(sequelize, DataTypes) {
  const Attribute = sequelize.define('Attribute', { // Update model name to match the actual model name
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {});

 Attribute.associate = function (models) {
    Attribute.hasMany(models.AttributeValue, { foreignKey: 'attribute_id' });
  };

 return Attribute;
};