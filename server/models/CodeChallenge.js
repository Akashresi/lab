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
    access_code: { type: DataTypes.STRING },
    start_time: { type: DataTypes.DATE, allowNull: false },
    duration_minutes: { type: DataTypes.INTEGER, allowNull: false },
    test_cases: { type: DataTypes.JSONB, defaultValue: [] },
    topic: { type: DataTypes.STRING },
    is_ai_generated: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
    timestamps: true,
    tableName: 'code_challenges'
});

module.exports = CodeChallenge;
