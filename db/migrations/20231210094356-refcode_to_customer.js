module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'customers',
      'refCode',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'customers',
      'refCode'
    );
  },
};
