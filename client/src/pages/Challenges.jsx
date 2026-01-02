import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Challenges() {
    const { user } = useAuth();
    // Disabled loading logic for now, static view only
    const loading = false;
    const challenges = [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Code Challenges</h1>
                {/*  Creation is possible but list is empty for now */}
                {(user?.role === 'creator' || user?.role === 'admin') && (
                    <button disabled className="btn btn-primary gap-2 opacity-50 cursor-not-allowed">
                        <Plus className="h-5 w-5" />
                        Create Challenge
                    </button> // Disabled to prevent error calls
                )}
            </div>

            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="p-4 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-full mb-4">
                    <Plus className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Code Challenges Coming Soon</h2>
                <p className="text-slate-500 max-w-md text-center">
                    We're building a powerful LeetCode-style execution environment. Check back later!
                </p>
            </div>
        </div>
    );
}
