const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Quiz = sequelize.define('Quiz', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    access_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 }
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'active', 'ended'),
        defaultValue: 'scheduled',
    },
    type: {
        type: DataTypes.ENUM('quiz', 'interview'),
        defaultValue: 'quiz',
    },

    is_ai_generated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    topic: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'quizzes'
});

module.exports = Quiz;
