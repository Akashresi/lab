import { useState } from 'react';
import { Mic2, Send, Wand2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Interviews() {
    const [started, setStarted] = useState(false);
    const [config, setConfig] = useState({ topic: 'JavaScript', level: 'Junior' });
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [evaluation, setEvaluation] = useState(null);
    const [evaluating, setEvaluating] = useState(false);

    const startInterview = async () => {
        setLoading(true);
        try {
            const res = await api.post('/ai/generate-interview', config);
            // Ensure we have an array
            const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setQuestions(data);
            setStarted(true);
        } catch (error) {
            toast.error('Failed to start interview. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const submitAnswer = async () => {
        if (!answer.trim()) return;
        setEvaluating(true);
        try {
            const currentQ = questions[currentQIndex];
            const res = await api.post('/ai/evaluate', {
                question: currentQ.text,
                answer: answer,
                context: currentQ.semantic_answer
            });
            setEvaluation(res.data.data);
        } catch (error) {
            toast.error('Evaluation failed');
        } finally {
            setEvaluating(false);
        }
    };

    const nextQuestion = () => {
        setEvaluation(null);
        setAnswer('');
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
        } else {
            toast.success('Interview Complete!');
            setStarted(false);
            setQuestions([]);
            setCurrentQIndex(0);
        }
    };

    if (!started) {
        return (
            <div className="max-w-2xl mx-auto py-12">
                <div className="card space-y-8 text-center">
                    <div className="flex justify-center">
                        <div className="p-4 bg-teal-100 dark:bg-teal-900/30 text-teal-600 rounded-full">
                            <Mic2 className="h-10 w-10" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold">AI Mock Interview</h1>
                    <p className="text-slate-500 max-w-lg mx-auto">
                        Practice technical interview questions with our AI. Get instant feedback on your answers, clarity, and depth.
                    </p>

                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-left">
                        <div>
                            <label className="label">Topic</label>
                            <input
                                className="input"
                                value={config.topic}
                                onChange={e => setConfig({ ...config, topic: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="label">Difficulty</label>
                            <select
                                className="input"
                                value={config.level}
                                onChange={e => setConfig({ ...config, level: e.target.value })}
                            >
                                <option>Junior</option>
                                <option>Mid-Level</option>
                                <option>Senior</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={startInterview}
                        disabled={loading}
                        className="btn btn-primary w-full max-w-sm mx-auto py-3 text-lg"
                    >
                        {loading ? 'Preparing Interview...' : 'Start Interview Session'}
                    </button>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentQIndex];

    return (
        <div className="max-w-3xl mx-auto py-8 space-y-6">
            <div className="flex justify-between items-center text-sm text-slate-500">
                <span>Question {currentQIndex + 1} of {questions.length}</span>
                <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{config.topic}</span>
            </div>

            <div className="card space-y-6">
                <h2 className="text-2xl font-medium">{currentQ?.text}</h2>

                <AnimatePresence mode="wait">
                    {!evaluation ? (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4"
                        >
                            <textarea
                                className="input min-h-[150px] text-lg"
                                placeholder="Type your answer here..."
                                value={answer}
                                onChange={e => setAnswer(e.target.value)}
                            ></textarea>
                            <button
                                onClick={submitAnswer}
                                disabled={evaluating || !answer.trim()}
                                className="btn btn-primary w-full py-3"
                            >
                                {evaluating ? 'AI is Evaluating...' : 'Submit Answer'}
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="feedback"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className={`p-4 rounded-xl border ${evaluation.isCorrect ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'}`}>
                                <h3 className={`font-bold text-lg mb-2 flex items-center gap-2 ${evaluation.isCorrect ? 'text-green-700 dark:text-green-400' : 'text-orange-700 dark:text-orange-400'}`}>
                                    {evaluation.isCorrect ? <Wand2 className="h-5 w-5" /> : <RefreshCw className="h-5 w-5" />}
                                    {evaluation.isCorrect ? 'Strong Answer!' : 'Needs Improvement'}
                                    <span className="ml-auto text-sm bg-white/50 px-2 py-1 rounded">Score: {evaluation.score}/10</span>
                                </h3>
                                <p className="text-slate-700 dark:text-slate-300 mb-4">{evaluation.feedback}</p>

                                <div className="border-t border-black/10 dark:border-white/10 pt-3">
                                    <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Ideal Answer Key</span>
                                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 italic">
                                        "{evaluation.idealAnswer || currentQ.semantic_answer}"
                                    </p>
                                </div>
                            </div>

                            <button onClick={nextQuestion} className="btn btn-outline w-full">
                                {currentQIndex < questions.length - 1 ? 'Next Question' : 'Finish Interview'}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
