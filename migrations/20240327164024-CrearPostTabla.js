module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(
            'Posts',
            {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true
                },
                title: {
                    type: Sequelize.STRING,
                    validate: {notEmpty: {msg: "Title must not be empty."}}
                },
                body: {
                    type: Sequelize.STRING,
                    validate: {notEmpty: {msg: "Body must not be empty."}}
                },
                attachmentId: {
                    type: Sequelize.INTEGER,
                    allowNull: true
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                }
            },
            {
                sync: {force: true}
            }
        );
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Posts');
    }
};
