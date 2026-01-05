import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Timer, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function QuizAttempt() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { [questionIndex]: answerValue }
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await api.get(`/quizzes/${id}`);
                setQuiz(res.data.data);
                setTimeLeft(res.data.data.duration_minutes * 60);
            } catch (error) {
                toast.error("Failed to load quiz");
                navigate('/quizzes');
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [id, navigate]);

    useEffect(() => {
        if (!quiz || submitting) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [quiz, submitting]);

    const handleOptionSelect = (optionIndex) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: optionIndex
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.Questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            // Transform answers object to array based on question order
            const answersArray = quiz.Questions.map((_, i) => answers[i] ?? null);

            await api.post(`/quizzes/${id}/submit`, { answers: answersArray });
            toast.success("Quiz Submitted!");
            navigate('/dashboard'); // Or results page if allowed
        } catch (error) {
            toast.error("Submission failed");
            setSubmitting(false);
        }
    };

    if (loading || !quiz) return <div className="p-12 text-center">Loading Assessment...</div>;

    const currentQuestion = quiz.Questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quiz.Questions.length - 1;

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Header / Timer */}
            <div className="flex items-center justify-between mb-8 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
                <div>
                    <h1 className="text-xl font-bold">{quiz.title}</h1>
                    <p className="text-sm text-slate-500">Question {currentQuestionIndex + 1} of {quiz.Questions.length}</p>
                </div>
                <div className={`flex items-center gap-2 text-xl font-mono font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                    <Timer className="h-6 w-6" />
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Question Card */}
            <div className="card min-h-[400px] flex flex-col justify-between">
                <div className="space-y-6">
                    <h2 className="text-2xl font-medium text-slate-900 dark:text-white">
                        {currentQuestion.text || currentQuestion.question}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(currentQuestion.options || []).map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleOptionSelect(idx)}
                                className={`p-6 text-left rounded-xl border-2 transition-all ${answers[currentQuestionIndex] === idx
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-200'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${answers[currentQuestionIndex] === idx ? 'border-primary-500 text-primary-600' : 'border-slate-300 text-slate-400'
                                        }`}>
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span className="text-lg">{opt}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t dark:border-slate-700">
                    <button
                        onClick={handlePrev}
                        disabled={currentQuestionIndex === 0}
                        className="btn btn-outline"
                    >
                        Previous
                    </button>

                    {isLastQuestion ? (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="btn btn-primary bg-green-600 hover:bg-green-700"
                        >
                            {submitting ? 'Submitting...' : 'Submit Assessment'}
                        </button>
                    ) : (
                        <button onClick={handleNext} className="btn btn-primary">
                            Next Question
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
