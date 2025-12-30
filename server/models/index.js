const User = require('./User');
const Quiz = require('./Quiz');
const Question = require('./Question');
const CodeChallenge = require('./CodeChallenge');
const Attempt = require('./Attempt');

// Associations

// User -> Quiz / CodeChallenge
User.hasMany(Quiz, { foreignKey: 'creator_id' });
Quiz.belongsTo(User, { foreignKey: 'creator_id' });

User.hasMany(CodeChallenge, { foreignKey: 'creator_id' });
CodeChallenge.belongsTo(User, { foreignKey: 'creator_id' });

// Quiz -> Questions
Quiz.hasMany(Question, { foreignKey: 'quiz_id', onDelete: 'CASCADE' });
Question.belongsTo(Quiz, { foreignKey: 'quiz_id' });

// Attempts
User.hasMany(Attempt, { foreignKey: 'user_id' });
Attempt.belongsTo(User, { foreignKey: 'user_id' });

Quiz.hasMany(Attempt, { foreignKey: 'quiz_id' });
Attempt.belongsTo(Quiz, { foreignKey: 'quiz_id' });

CodeChallenge.hasMany(Attempt, { foreignKey: 'challenge_id' });
Attempt.belongsTo(CodeChallenge, { foreignKey: 'challenge_id' });

module.exports = { User, Quiz, Question, CodeChallenge, Attempt };
