import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Clock, Calendar, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QuizDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [accessCode, setAccessCode] = useState('');

    useEffect(() => {
        api.get(`/quizzes/${id}`).then(res => setQuiz(res.data)).catch(() => { });
    }, [id]);

    const handleStart = () => {
        if (quiz.access_code && accessCode !== quiz.access_code) {
            toast.error('Invalid access code');
            return;
        }
        navigate(`/quizzes/${id}/attempt`);
    };

    if (!quiz) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">{quiz.title}</h1>
                <div className="flex justify-center gap-6 text-slate-500">
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5" /> {quiz.duration_minutes} Minutes
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" /> {new Date(quiz.start_time).toLocaleDateString()}
                    </div>
                </div>
            </div>

            <div className="card max-w-md mx-auto">
                <div className="space-y-4">
                    {quiz.access_code && (
                        <div>
                            <label className="label flex items-center gap-2"><Lock className="h-4 w-4" /> Access Code Required</label>
                            <input
                                type="password"
                                className="input"
                                placeholder="Enter code to start"
                                value={accessCode}
                                onChange={e => setAccessCode(e.target.value)}
                            />
                        </div>
                    )}

                    <button onClick={handleStart} className="btn btn-primary w-full py-3 text-lg">
                        Start Quiz
                    </button>
                </div>
            </div>
        </div>
    );
}
