const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CodeChallenge = sequelize.define('CodeChallenge', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    section_title: {
        type: DataTypes.STRING,
        allowNull: true // e.g. "Problem Statement"
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
    test_cases: {
        type: DataTypes.JSONB, // Array of { input, output, hidden }
        allowNull: false,
        defaultValue: []
    },
    is_ai_generated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    topic: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    timestamps: true,
    tableName: 'code_challenges'
});

module.exports = CodeChallenge;
