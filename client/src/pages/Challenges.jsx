import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, Terminal } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Challenges() {
    const { user } = useAuth();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/challenges')
            .then(res => setChallenges(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading challenges...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Code Challenges</h1>
                {(user?.role === 'creator' || user?.role === 'admin') && (
                    <Link to="/challenges/create" className="btn btn-primary gap-2">
                        <Plus className="h-5 w-5" />
                        New Challenge
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map(item => (
                    <div key={item.id} className="card group hover:ring-2 hover:ring-primary-500/20 transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg group-hover:text-primary-600 transition-colors">{item.title}</h3>
                            {item.is_ai_generated && (
                                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">AI</span>
                            )}
                        </div>

                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                            {item.description || 'No description provided'}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4 border-t pt-4 border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {item.duration_minutes}m
                            </div>
                            <div className="flex items-center gap-1">
                                <Terminal className="h-4 w-4" />
                                {item.test_cases?.length || 0} Cases
                            </div>
                        </div>

                        <button onClick={() => { }} className="btn btn-primary w-full">
                            Solve Challenge
                        </button>
                    </div>
                ))}
                {challenges.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500">No active coding challenges.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
