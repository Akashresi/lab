const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TimeLog = sequelize.define('TimeLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('quiz', 'challenge'),
        allowNull: false
    },
    reference_id: {
        type: DataTypes.UUID, // Points to quiz_id or challenge_id
        allowNull: false
    },
    time_spent: {
        type: DataTypes.INTEGER, // in seconds
        defaultValue: 0
    },
    started_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    ended_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'time_logs'
});

module.exports = TimeLog;
