import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function CreateChallenge() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('manual'); // manual | ai
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        access_code: '',
        duration_minutes: 60,
        start_time: new Date().toISOString().slice(0, 16),
        test_cases: [],
        topic: '' // For AI
    });

    const addTestCase = () => {
        setFormData(prev => ({
            ...prev,
            test_cases: [...prev.test_cases, { input: '', output: '', hidden: false }]
        }));
    };

    const updateTestCase = (index, field, value) => {
        const newCases = [...formData.test_cases];
        newCases[index] = { ...newCases[index], [field]: value };
        setFormData(prev => ({ ...prev, test_cases: newCases }));
    };

    const removeTestCase = (index) => {
        setFormData(prev => ({
            ...prev,
            test_cases: prev.test_cases.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (activeTab === 'manual') {
                if (!formData.description) {
                    toast.error('Description is required');
                    return;
                }
                await api.post('/challenges', {
                    ...formData,
                    is_ai_generated: false
                });
            } else {
                if (!formData.topic) {
                    toast.error('Topic is required for AI generation');
                    return;
                }
                toast.loading('Generating Challenge with AI...');

                // 1. Generate
                const aiRes = await api.post('/ai/generate-challenge', {
                    topic: formData.topic,
                    difficulty: 'medium'
                });

                // 2. Save
                await api.post('/challenges', {
                    title: aiRes.data.title || formData.title,
                    description: aiRes.data.description,
                    test_cases: aiRes.data.test_cases,
                    duration_minutes: formData.duration_minutes,
                    start_time: formData.start_time,
                    access_code: formData.access_code,
                    is_ai_generated: true,
                    topic: formData.topic
                });
                toast.dismiss();
            }

            toast.success('Challenge created successfully!');
            navigate('/challenges');
        } catch (error) {
            toast.dismiss();
            // Error handled by api interceptor
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create Code Challenge</h1>
                    <p className="text-slate-500 mt-1">Design a coding problem manually or with AI</p>
                </div>
                <button onClick={handleSubmit} className="btn btn-primary gap-2">
                    <Save className="h-5 w-5" />
                    Publish Challenge
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card space-y-4">
                    <h2 className="font-semibold text-lg border-b pb-2 mb-4">Basic Settings</h2>
                    <div>
                        <label className="label">Challenge Title</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Reverse Linked List"
                            required={activeTab === 'manual'}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                            <label className="label">Duration (Mins)</label>
                            <input
                                type="number"
                                className="input"
                                value={formData.duration_minutes}
                                onChange={e => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                                min="1"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="label">Access Code</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.access_code}
                            onChange={e => setFormData({ ...formData, access_code: e.target.value })}
                            placeholder="Optional password"
                        />
                    </div>
                </div>

                <div className="card space-y-4">
                    <h2 className="font-semibold text-lg border-b pb-2 mb-4">Content Source</h2>
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setActiveTab('manual')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${activeTab === 'manual' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}
                        >
                            Manual Entry
                        </button>
                        <button
                            onClick={() => setActiveTab('ai')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${activeTab === 'ai' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}
                        >
                            Generate with AI
                        </button>
                    </div>

                    {activeTab === 'ai' ? (
                        <div className="space-y-4">
                            <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg border border-purple-100 dark:border-purple-900">
                                <p className="text-sm text-purple-800 dark:text-purple-300 mb-2">
                                    Enter a topic or concept, and our AI will generate the problem description and test cases for you.
                                </p>
                                <textarea
                                    className="input min-h-[100px]"
                                    placeholder="e.g. A function to calculate Fibonacci numbers using dynamic programming"
                                    value={formData.topic}
                                    onChange={e => setFormData({ ...formData, topic: e.target.value })}
                                ></textarea>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="label">Problem Description (Markdown supported)</label>
                                <textarea
                                    className="input min-h-[150px] font-mono text-sm"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="# Problem Title..."
                                ></textarea>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {activeTab === 'manual' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Test Cases ({formData.test_cases.length})</h2>
                        <button onClick={addTestCase} className="btn btn-outline gap-2">
                            <Plus className="h-4 w-4" /> Add Case
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {formData.test_cases.map((tc, index) => (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={index}
                                className="card flex gap-4 items-start"
                            >
                                <div className="mt-2 text-slate-400">
                                    <Terminal className="h-5 w-5" />
                                </div>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label text-xs">Input (stdin)</label>
                                        <textarea
                                            className="input font-mono text-sm"
                                            rows="1"
                                            value={tc.input}
                                            onChange={e => updateTestCase(index, 'input', e.target.value)}
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="label text-xs">Expected Output (stdout)</label>
                                        <textarea
                                            className="input font-mono text-sm"
                                            rows="1"
                                            value={tc.output}
                                            onChange={e => updateTestCase(index, 'output', e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeTestCase(index)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-6"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                    {formData.test_cases.length === 0 && (
                        <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                            Add at least one test case for validation.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
