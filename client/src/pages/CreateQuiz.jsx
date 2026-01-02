import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, GripVertical } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function CreateQuiz() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        access_code: '',
        duration_minutes: 30,
        start_time: new Date().toISOString().slice(0, 16),
        questions: []
    });

    const addQuestion = () => {
        setFormData(prev => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'mcq',
                    text: '',
                    options: ['', '', '', ''],
                    correct_index: 0,
                    semantic_answer: '',
                    explanation: ''
                }
            ]
        }));
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const updateOption = (qIndex, oIndex, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[qIndex].options[oIndex] = value;
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const removeQuestion = (index) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.questions.length === 0) {
                toast.error('Please add at least one question');
                return;
            }

            await api.post('/quizzes', {
                ...formData,
                is_ai_generated: false
            });

            toast.success('Quiz created successfully!');
            navigate('/quizzes');
        } catch (error) {
            // Error handled by api interceptor
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create New Quiz</h1>
                    <p className="text-slate-500 mt-1">Design a manual quiz for your students</p>
                </div>
                <button onClick={handleSubmit} className="btn btn-primary gap-2">
                    <Save className="h-5 w-5" />
                    Publish Quiz
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card space-y-4">
                    <h2 className="font-semibold text-lg border-b pb-2 mb-4">Basic Info</h2>
                    <div>
                        <label className="label">Quiz Title</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Master React Hooks"
                            required
                        />
                    </div>
                    <div>
                        <label className="label">Access Code (Password)</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.access_code}
                            onChange={e => setFormData({ ...formData, access_code: e.target.value })}
                            placeholder="Optional secert code"
                        />
                    </div>
                </div>

                <div className="card space-y-4">
                    <h2 className="font-semibold text-lg border-b pb-2 mb-4">Settings</h2>
                    <div>
                        <label className="label">Start Time</label>
                        <input
                            type="datetime-local"
                            className="input"
                            value={formData.start_time}
                            onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="label">Duration (Minutes)</label>
                        <input
                            type="number"
                            className="input"
                            value={formData.duration_minutes}
                            onChange={e => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                            min="1"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Questions ({formData.questions.length})</h2>
                    <button onClick={addQuestion} className="btn btn-outline gap-2">
                        <Plus className="h-4 w-4" /> Add Question
                    </button>
                </div>

                <div className="space-y-4">
                    {formData.questions.map((q, qIndex) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={q.id || qIndex}
                            className="card relative group"
                        >
                            <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => removeQuestion(qIndex)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex gap-4">
                                <div className="mt-2 text-slate-400 cursor-move">
                                    <GripVertical className="h-5 w-5" />
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-slate-400">Q{qIndex + 1}</span>
                                        <select
                                            className="input w-40 py-1"
                                            value={q.type}
                                            onChange={e => updateQuestion(qIndex, 'type', e.target.value)}
                                        >
                                            <option value="mcq">Multiple Choice</option>
                                            <option value="interactive">Interactive (AI)</option>
                                        </select>
                                    </div>

                                    <input
                                        type="text"
                                        className="input text-lg font-medium border-0 border-b rounded-none px-0 focus:ring-0"
                                        placeholder="Enter visual question text..."
                                        value={q.text}
                                        onChange={e => updateQuestion(qIndex, 'text', e.target.value)}
                                    />

                                    {q.type === 'mcq' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            {q.options.map((opt, oIndex) => (
                                                <div key={oIndex} className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name={`correct-${qIndex}`}
                                                        checked={q.correct_index === oIndex}
                                                        onChange={() => updateQuestion(qIndex, 'correct_index', oIndex)}
                                                        className="w-4 h-4 text-primary-600"
                                                    />
                                                    <input
                                                        type="text"
                                                        className="input text-sm"
                                                        placeholder={`Option ${oIndex + 1}`}
                                                        value={opt}
                                                        onChange={e => updateOption(qIndex, oIndex, e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {q.type === 'interactive' && (
                                        <div className="space-y-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                                            <div>
                                                <label className="label text-xs uppercase tracking-wide">Expected Semantic Answer</label>
                                                <textarea
                                                    className="input"
                                                    rows="2"
                                                    value={q.semantic_answer}
                                                    onChange={e => updateQuestion(qIndex, 'semantic_answer', e.target.value)}
                                                    placeholder="What key concept should the student mention?"
                                                />
                                            </div>
                                            <div>
                                                <label className="label text-xs uppercase tracking-wide">Explanation / Grading Criteria</label>
                                                <textarea
                                                    className="input"
                                                    rows="2"
                                                    value={q.explanation}
                                                    onChange={e => updateQuestion(qIndex, 'explanation', e.target.value)}
                                                    placeholder="Hidden context for grading..."
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {formData.questions.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                            <p className="text-slate-500">No questions added yet. Click "Add Question" to start.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
