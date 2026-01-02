const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CodeChallenge = sequelize.define('CodeChallenge', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    difficulty: { type: DataTypes.STRING, defaultValue: 'medium' },
    constraints: { type: DataTypes.TEXT },
    test_cases: { type: DataTypes.JSONB, defaultValue: [] },

    // Extra fields needed for logic
    start_time: { type: DataTypes.DATE },
    duration_minutes: { type: DataTypes.INTEGER },
    access_code: { type: DataTypes.STRING },
    topic: { type: DataTypes.STRING },
    is_ai_generated: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    tableName: 'code_challenges'
});

module.exports = CodeChallenge;
