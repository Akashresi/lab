import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Clock, Calendar, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user } = useAuth();
    const [quizzes, setQuizzes] = useState([]);

    useEffect(() => {
        // Fetch recent quizzes
        api.get('/quizzes').then(res => setQuizzes(res.data.slice(0, 3))).catch(() => { });
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    Welcome back, {user?.username}!
                </h1>
                <p className="text-slate-500 mt-1">Here's what's happening today.</p>
            </div>

            {/* Stats Cards (Mock data for now) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white border-none">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-primary-100 font-medium">Completed Quizzes</p>
                            <h3 className="text-3xl font-bold mt-1">12</h3>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 font-medium">Pending Challenges</p>
                            <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">3</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Quizzes</h2>
                    <Link to="/quizzes" className="text-primary-600 font-medium hover:underline flex items-center gap-1">
                        View All <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map(quiz => (
                        <div key={quiz.id} className="card hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-lg mb-2">{quiz.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {quiz.duration_minutes}m
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(quiz.start_time).toLocaleDateString()}
                                </div>
                            </div>
                            <Link to={`/quizzes/${quiz.id}`} className="btn btn-outline w-full text-sm">
                                Details
                            </Link>
                        </div>
                    ))}
                    {quizzes.length === 0 && <p className="text-slate-500">No quizzes found.</p>}
                </div>
            </div>
        </div>
    );
}
