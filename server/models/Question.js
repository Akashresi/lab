const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Question = sequelize.define('Question', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    options: {
        type: DataTypes.JSONB, // Array of strings e.g. ["Paris", "London", "Berlin"]
        allowNull: false,
    },
    correct_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 0 }
    },
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    }
}, {
    timestamps: true,
    tableName: 'questions'
});

module.exports = Question;
