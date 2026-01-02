import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, Calendar } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Quizzes() {
    const { user } = useAuth();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/quizzes')
            .then(res => setQuizzes(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading quizzes...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Browse Quizzes</h1>
                {(user?.role === 'creator' || user?.role === 'admin') && (
                    <Link to="/quizzes/create" className="btn btn-primary gap-2">
                        <Plus className="h-5 w-5" />
                        Create Quiz
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map(quiz => (
                    <div key={quiz.id} className="card group hover:ring-2 hover:ring-primary-500/20 transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg group-hover:text-primary-600 transition-colors">{quiz.title}</h3>
                            {quiz.is_ai_generated && (
                                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">AI</span>
                            )}
                        </div>

                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                            Topic: {quiz.topic || 'General'}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4 border-t pt-4 border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {quiz.duration_minutes}m
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(quiz.start_time).toLocaleDateString()}
                            </div>
                        </div>

                        <Link to={`/quizzes/${quiz.id}`} className="btn btn-primary w-full">
                            Start Quiz
                        </Link>
                    </div>
                ))}
                {quizzes.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500">No quizzes available.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
