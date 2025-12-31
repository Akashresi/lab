const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Result = sequelize.define('Result', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    language: {
        type: DataTypes.STRING,
        defaultValue: 'javascript'
    },
    type: {
        type: DataTypes.ENUM('quiz', 'challenge'),
        allowNull: false
    },
    quiz_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    challenge_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    score: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    total_score: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    percentage: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    accuracy: {
        type: DataTypes.STRING, // e.g., "8/10"
        allowNull: true
    },
    time_taken: {
        type: DataTypes.INTEGER, // in seconds
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('Pass', 'Fail', 'Partial'),
        defaultValue: 'Fail'
    },
    details: {
        type: DataTypes.JSONB, // Stores feedback, breakdown of answers
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'results'
});

module.exports = Result;
