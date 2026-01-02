const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const QuizSubmission = sequelize.define('QuizSubmission', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    answers: { type: DataTypes.JSONB },
    ai_score: { type: DataTypes.INTEGER },
    submitted_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    timestamps: true,
    createdAt: 'submitted_at',
    updatedAt: false,
    tableName: 'quiz_submissions'
});

module.exports = QuizSubmission;
