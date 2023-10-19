'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the new column 'razorpay_payment_id' to the 'Order' table
    await queryInterface.addColumn('Orders', 'razorpay_payment_id', {
      type: Sequelize.STRING, // Adjust the data type if necessary
      allowNull: true, // Set to false if the column should not be nullable
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the added column when rolling back the migration
    await queryInterface.removeColumn('Orders', 'razorpay_payment_id');
  },
};
