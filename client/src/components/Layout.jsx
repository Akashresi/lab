import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    Code2,
    Mic2,
    LogOut,
    Menu,
    X,
    Moon,
    Sun,
    Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Toaster } from 'react-hot-toast';

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isDark, setIsDark] = useState(false); // In a real app, use a theme context
    const location = useLocation();

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };

    const navItems = [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Quizzes', path: '/quizzes', icon: BookOpen },
        { label: 'Challenges', path: '/challenges', icon: Code2 },
        { label: 'Interviews', path: '/interviews', icon: Mic2 },
    ];

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100 transition-colors duration-200">
            <Toaster position="top-right" />

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed md:sticky top-0 h-screen w-64 bg-white dark:bg-dark-card border-r border-slate-200 dark:border-slate-800 z-50 transition-transform duration-300 ease-in-out",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-2 font-bold text-xl text-primary-600">
                        <BookOpen className="h-6 w-6" />
                        <span>QuizMaster</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium",
                                    isActive
                                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 font-bold">
                                {user?.username?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <p className="font-medium text-sm">{user?.username}</p>
                                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white dark:bg-dark-card border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8">
                    <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2">
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="ml-auto flex items-center gap-4">
                        {/* Action Buttons for Creator */}
                        {(user?.role === 'creator' || user?.role === 'admin') && (
                            <div className="flex gap-2">
                                <Link to="/quizzes/create" className="btn btn-primary text-sm flex items-center gap-1">
                                    <Plus className="h-4 w-4" /> New Quiz
                                </Link>
                            </div>
                        )}

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
