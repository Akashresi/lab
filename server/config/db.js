const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.POSTGRES_URI || 'postgres://postgres:password@localhost:5432/quizmaster', {
    dialect: 'postgres',
    logging: false,
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL Connected...');
        // Sync models (in production, use migrations instead)
        await sequelize.sync({ alter: true });
        console.log('Database Synced');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
