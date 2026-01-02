import { useState } from 'react';
import { Mic2, Send, Wand2 } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Interviews() {
    const [formData, setFormData] = useState({
        role: 'Frontend Developer',
        topic: 'React Hooks',
        difficulty: 'medium'
    });
    const [question, setQuestion] = useState(null); // { id, role, topic, question }
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setQuestion(null);
        setFeedback(null);
        setAnswer('');

        try {
            const res = await api.post('/interviews/generate', formData);
            setQuestion(res.data.data); // Adjust based on controller response structure
            toast.success('Interview Question Generated');
        } catch (error) {
            // Error handled by interceptor or default toast
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!answer.trim()) return toast.error('Please enter an answer');
        setLoading(true);
        try {
            const res = await api.post(`/interviews/${question.id}/submit`, { answer });
            setFeedback(res.data.data);
            toast.success('Answer Evaluated');
        } catch (error) {
            // Error
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Mock Interview</h1>
                <p className="text-slate-500 mt-1">Practice technical questions with instant AI feedback.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Settings Panel */}
                <div className="card h-fit md:col-span-1 space-y-4">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <Wand2 className="h-5 w-5 text-primary-500" />
                        Configuration
                    </h2>

                    <div>
                        <label className="label">Target Role</label>
                        <input
                            className="input"
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="label">Topic / Skill</label>
                        <input
                            className="input"
                            value={formData.topic}
                            onChange={e => setFormData({ ...formData, topic: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="label">Difficulty</label>
                        <select
                            className="input"
                            value={formData.difficulty}
                            onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="btn btn-primary w-full"
                    >
                        {loading && !question ? 'Generating...' : 'Generate Question'}
                    </button>
                </div>

                {/* Interaction Panel */}
                <div className="md:col-span-2 space-y-6">
                    {!question && !loading && (
                        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400">
                            <Mic2 className="h-12 w-12 mb-4 opacity-50" />
                            <p>Configure and generate a question to start.</p>
                        </div>
                    )}

                    {loading && !question && (
                        <div className="flex flex-col items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                            <p className="text-slate-500">Consulting AI Interviewer...</p>
                        </div>
                    )}

                    {question && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-dark-card p-6 rounded-xl border-l-4 border-primary-500 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10">
                                <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wide mb-2">Question</h3>
                                <p className="text-xl font-medium text-slate-900 dark:text-white">
                                    {question.question}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <label className="label">Your Answer</label>
                                <textarea
                                    className="input min-h-[200px]"
                                    placeholder="Type your detailed answer here..."
                                    value={answer}
                                    onChange={e => setAnswer(e.target.value)}
                                    disabled={!!feedback}
                                ></textarea>

                                {!feedback && (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="btn btn-primary w-full gap-2"
                                    >
                                        {loading ? 'Analyzing...' : <><Send className="h-4 w-4" /> Submit Answer</>}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {feedback && (
                        <div className="card bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-green-800 dark:text-green-400">AI Feedback</h3>
                                <div className="bg-white dark:bg-dark-bg px-3 py-1 rounded-full text-sm font-bold border shadow-sm">
                                    Score: {feedback.ai_score}/100
                                </div>
                            </div>
                            <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
                                {feedback.ai_feedback}
                            </div>
                            <button
                                onClick={() => { setQuestion(null); setFeedback(null); setAnswer(''); }}
                                className="btn btn-outline mt-6 w-full"
                            >
                                Next Question
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
