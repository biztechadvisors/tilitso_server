'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('wallet_points', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      walletPoints: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      walletCurrency: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      usedWalletPoints: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      customerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id',
        },
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('wallet_points');
  },
};
