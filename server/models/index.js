const User = require('./User');
const Quiz = require('./Quiz');
const Attempt = require('./Attempt');

// Associations
User.hasMany(Quiz, { foreignKey: 'creator_id' });
Quiz.belongsTo(User, { foreignKey: 'creator_id' });

User.hasMany(Attempt, { foreignKey: 'user_id' });
Attempt.belongsTo(User, { foreignKey: 'user_id' });

Quiz.hasMany(Attempt, { foreignKey: 'quiz_id' });
Attempt.belongsTo(Quiz, { foreignKey: 'quiz_id' });

module.exports = { User, Quiz, Attempt };
