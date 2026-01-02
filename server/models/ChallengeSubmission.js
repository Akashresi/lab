const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ChallengeSubmission = sequelize.define('ChallengeSubmission', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    code: { type: DataTypes.TEXT },
    language: { type: DataTypes.TEXT },
    ai_score: { type: DataTypes.INTEGER },
    submitted_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    timestamps: true,
    createdAt: 'submitted_at',
    updatedAt: false,
    tableName: 'challenge_submissions'
});

module.exports = ChallengeSubmission;
