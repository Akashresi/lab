const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const InterviewSubmission = sequelize.define('InterviewSubmission', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    answer: { type: DataTypes.TEXT },
    ai_score: { type: DataTypes.INTEGER },
    ai_feedback: { type: DataTypes.TEXT },
    submitted_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    timestamps: true,
    createdAt: 'submitted_at',
    updatedAt: false,
    tableName: 'interview_submissions'
});

module.exports = InterviewSubmission;
