const User = require('./User');
const Quiz = require('./Quiz');
const Question = require('./Question'); // quiz_questions
const CodeChallenge = require('./CodeChallenge'); // code_challenges
const QuizSubmission = require('./QuizSubmission');
const ChallengeSubmission = require('./ChallengeSubmission');
const InterviewQuestion = require('./InterviewQuestion');
const InterviewSubmission = require('./InterviewSubmission');

// --- Associations ---

// User -> Quiz (Creator)
User.hasMany(Quiz, { foreignKey: 'creator_id' });
Quiz.belongsTo(User, { foreignKey: 'creator_id' });

// User -> CodeChallenge (Creator)
User.hasMany(CodeChallenge, { foreignKey: 'creator_id' });
CodeChallenge.belongsTo(User, { foreignKey: 'creator_id' });

// Quiz -> Questions
Quiz.hasMany(Question, { foreignKey: 'quiz_id', onDelete: 'CASCADE' });
Question.belongsTo(Quiz, { foreignKey: 'quiz_id' });

// Quiz Submissions
Quiz.hasMany(QuizSubmission, { foreignKey: 'quiz_id' });
QuizSubmission.belongsTo(Quiz, { foreignKey: 'quiz_id' });

User.hasMany(QuizSubmission, { foreignKey: 'user_id' });
QuizSubmission.belongsTo(User, { foreignKey: 'user_id' });

// Challenge Submissions
CodeChallenge.hasMany(ChallengeSubmission, { foreignKey: 'challenge_id' });
ChallengeSubmission.belongsTo(CodeChallenge, { foreignKey: 'challenge_id' });

User.hasMany(ChallengeSubmission, { foreignKey: 'user_id' });
ChallengeSubmission.belongsTo(User, { foreignKey: 'user_id' });

// Interview Submissions
InterviewQuestion.hasMany(InterviewSubmission, { foreignKey: 'question_id' });
InterviewSubmission.belongsTo(InterviewQuestion, { foreignKey: 'question_id' });

User.hasMany(InterviewSubmission, { foreignKey: 'user_id' });
InterviewSubmission.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
    User,
    Quiz,
    Question,
    CodeChallenge,
    QuizSubmission,
    ChallengeSubmission,
    InterviewQuestion,
    InterviewSubmission
};
