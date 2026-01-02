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
        field: 'question' // Map 'text' property to 'question' column if needed, or just rename property. User said `question` column.
    },
    question: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    options: {
        type: DataTypes.JSONB,
        allowNull: true, // Allow null if using fixed columns? User asked for option_a/b/c/d.
    },
    // Supporting exact schema requests while keeping JSONB flexibility
    option_a: { type: DataTypes.TEXT },
    option_b: { type: DataTypes.TEXT },
    option_c: { type: DataTypes.TEXT },
    option_d: { type: DataTypes.TEXT },
    correct_answer: { type: DataTypes.TEXT },

    // Existing fields for app logic
    correct_index: { type: DataTypes.INTEGER },
    type: {
        type: DataTypes.ENUM('mcq', 'interactive'),
        defaultValue: 'mcq'
    },
    explanation: { type: DataTypes.TEXT },
    semantic_answer: { type: DataTypes.TEXT }
}, {
    timestamps: false,
    tableName: 'quiz_questions'
});

module.exports = Question;
