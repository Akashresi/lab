import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen } from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'participant'
    });
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await register(
            formData.username,
            formData.email,
            formData.password,
            formData.role
        );
        if (success) navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-2xl shadow-xl p-8">
                <div className="flex flex-col items-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Account</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Username</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="label">Email</label>
                        <input
                            type="email"
                            className="input"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="label">Password</label>
                        <input
                            type="password"
                            className="input"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="label">I am a...</label>
                        <select
                            className="input"
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="participant">Participant</option>
                            <option value="creator">Creator (Teacher)</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary w-full py-3">
                        Sign Up
                    </button>
                </form>
                <p className="mt-6 text-center text-slate-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-600 font-medium hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
