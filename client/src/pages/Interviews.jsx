import { Mic2 } from 'lucide-react';

export default function Interviews() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Mock Interview</h1>
                <p className="text-slate-500 mt-1">Practice technical questions with instant AI feedback.</p>
            </div>

            <div className="flex flex-col items-center justify-center py-24 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="p-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-full mb-6">
                    <Mic2 className="h-10 w-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Interview Module Unavailable</h2>
                <p className="text-slate-500 max-w-lg text-center">
                    The AI Interviewer is currently undergoing maintenance. Check back soon for intelligent mock interviews.
                </p>
            </div>
        </div>
    );
}
