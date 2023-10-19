module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('BannerDetails', 'heading', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('BannerDetails', 'content', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('BannerDetails', 'heading');
    await queryInterface.removeColumn('BannerDetails', 'content');
  },
};