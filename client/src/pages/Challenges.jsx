import { useState, useEffect } from 'react';
import { Plus, Terminal, Code2, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Challenges() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const res = await api.get('/challenges');
                setChallenges(res.data || []);
            } catch (error) {
                toast.error('Failed to load challenges');
            } finally {
                setLoading(false);
            }
        };
        fetchChallenges();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Code Challenges</h1>
                    <p className="text-slate-500">Practice algorithms and data structures with automated testing</p>
                </div>
                {(user?.role === 'creator' || user?.role === 'admin') && (
                    <button onClick={() => navigate('/challenges/create')} className="btn btn-primary gap-2">
                        <Plus className="h-5 w-5" />
                        Create Challenge
                    </button>
                )}
            </div>

            {loading ? (
                <div className="py-12 text-center text-slate-500">Loading challenges...</div>
            ) : challenges.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <div className="p-4 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-full mb-4">
                        <Code2 className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Challenges Yet</h2>
                    <p className="text-slate-500 text-center mb-6">
                        Be the first to create a coding challenge!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {challenges.map(challenge => (
                        <div key={challenge.id} className="card hover:border-primary-500 transition-colors flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                        ${challenge.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                                            challenge.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                                'bg-yellow-100 text-yellow-700'}`}>
                                        {challenge.difficulty || 'Medium'}
                                    </span>
                                    {(user?.role === 'creator' || user?.role === 'admin') && (
                                        <span className="text-xs text-slate-400">Creator View</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{challenge.title}</h3>
                                    <p className="text-slate-500 text-sm line-clamp-2 mt-1">{challenge.description}</p>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> {challenge.duration_minutes}m
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Terminal className="h-3 w-3" /> {challenge.test_cases?.length || 0} Tests
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(`/challenges/${challenge.id}`)}
                                className="btn btn-outline w-full mt-6"
                            >
                                Solve Challenge
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
