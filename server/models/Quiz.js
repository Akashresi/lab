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
    topic: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    difficulty: {
        type: DataTypes.STRING, // 'easy', 'medium', 'hard'
        defaultValue: 'medium'
    },
    access_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    start_time: {
        type: DataTypes.DATE, // Mapped from TIMESTAMP
        allowNull: false,
    },
    duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    is_ai_generated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    timestamps: true, // Adds created_at, updated_at
    createdAt: 'created_at',
    updatedAt: false, // User schema didn't specify updated_at, but Sequelize likes it. I'll map created_at.
    tableName: 'quizzes'
});

module.exports = Quiz;
