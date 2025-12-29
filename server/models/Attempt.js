const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Attempt = sequelize.define('Attempt', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    answers: {
        type: DataTypes.JSONB, // Stores array of selected indices
        allowNull: false,
    },
    score: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    submitted_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    is_late: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    timestamps: true,
    tableName: 'attempts'
});

module.exports = Attempt;
