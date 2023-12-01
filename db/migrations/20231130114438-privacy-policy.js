'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('PrivacyPolicies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      banner: {
        type: Sequelize.TEXT
      },
      title: {
        type: Sequelize.STRING
      },
      content: {
        type: Sequelize.STRING
      },
      slug: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.BOOLEAN,
        unique: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  }
  ,

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('PrivacyPolicies');
  }

};
