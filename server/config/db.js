// server/config/db.js

const { Sequelize } = require("sequelize");

// Create Sequelize instance
const sequelize = new Sequelize(
    process.env.POSTGRES_URI || "postgres://postgres:Akash@@6655@localhost:5433/quizmaster",
    {
        dialect: "postgres",
        logging: false,
    }
);

// Connect DB safely (NO process.exit)
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ PostgreSQL Connected");

        await sequelize.sync({ alter: true });
        console.log("✅ Database Synced");
    } catch (error) {
        console.error("❌ Database Connection Error");
        console.error(error);

        // ❌ DO NOT EXIT THE PROCESS
        // Let server keep running so you can see logs and debug
    }
};

module.exports = { sequelize, connectDB };
