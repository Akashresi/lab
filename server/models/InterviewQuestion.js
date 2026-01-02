const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const InterviewQuestion = sequelize.define('InterviewQuestion', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    topic: { type: DataTypes.TEXT },
    role: { type: DataTypes.TEXT },
    difficulty: { type: DataTypes.TEXT },
    question: { type: DataTypes.TEXT },
}, {
    timestamps: false,
    tableName: 'interview_questions'
});

module.exports = InterviewQuestion;
