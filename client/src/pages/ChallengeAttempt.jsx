import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, Send, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

// Language definitions for Monaco
const defaultCode = {
    javascript: `// Write your solution here\n// Do not change function signature if provided\n\nfunction solution(input) {\n  return input;\n}`,
    python: `# Write your solution here\n\ndef solution(input):\n    return input`,
    java: `public class Main {\n    public static void main(String[] args) {\n        // Read input and print output\n    }\n}`
};

export default function ChallengeAttempt() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState(defaultCode['javascript']);
    const [output, setOutput] = useState(null);
    const [running, setRunning] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                const res = await api.get(`/challenges/${id}`);
                setChallenge(res.data.data);
            } catch (error) {
                toast.error('Failed to load challenge');
                navigate('/challenges');
            } finally {
                setLoading(false);
            }
        };
        fetchChallenge();
    }, [id, navigate]);

    const handleRun = async () => {
        setRunning(true);
        setOutput(null);
        try {
            const res = await api.post(`/challenges/${id}/run`, { code, language });
            setOutput(res.data.data);
        } catch (error) {
            toast.error('Execution failed');
            setOutput([{ status: 'Error', error: 'System Error during execution' }]);
        } finally {
            setRunning(false);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const res = await api.post(`/challenges/${id}/submit`, { code, language });
            const result = res.data.data;
            toast.success(`Submitted! Score: ${result.ai_score}%`);
            navigate('/challenges');
        } catch (error) {
            toast.error('Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !challenge) return <div className="p-12 text-center text-slate-500">Loading Challenge...</div>;

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-4">
            {/* Left Panel: Problem Description */}
            <div className="w-full md:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2">
                <div className="card h-full flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <h1 className="text-xl font-bold">{challenge.title}</h1>
                        <span className="badge bg-slate-100 dark:bg-slate-800">{challenge.difficulty || 'Medium'}</span>
                    </div>

                    <div className="prose dark:prose-invert text-sm flex-1 overflow-y-auto mb-4">
                        <p className="whitespace-pre-wrap">{challenge.description}</p>
                    </div>

                    <div className="space-y-4 border-t dark:border-slate-700 pt-4">
                        <h3 className="font-semibold text-sm">Example Test Cases</h3>
                        {challenge.test_cases?.slice(0, 2).map((tc, i) => (
                            <div key={i} className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg text-xs font-mono">
                                <div className="mb-1"><span className="text-slate-500">Input:</span> {tc.input}</div>
                                <div><span className="text-slate-500">Output:</span> {tc.output}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel: Code Editor */}
            <div className="w-full md:w-2/3 flex flex-col gap-4">
                <div className="card flex-1 p-0 overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700">
                    <div className="bg-slate-50 dark:bg-slate-800 p-2 border-b dark:border-slate-700 flex justify-between items-center">
                        <select
                            className="input text-sm py-1 w-32"
                            value={language}
                            onChange={(e) => {
                                setLanguage(e.target.value);
                                setCode(defaultCode[e.target.value] || '');
                            }}
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                        </select>
                        <div className="flex gap-2">
                            <button
                                onClick={handleRun}
                                disabled={running}
                                className="btn btn-outline text-xs px-3 py-1 flex items-center gap-1"
                            >
                                <Play className="h-3 w-3" /> {running ? 'Running...' : 'Run Code'}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="btn btn-primary text-xs px-3 py-1 flex items-center gap-1"
                            >
                                <Send className="h-3 w-3" /> {submitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </div>

                    <Editor
                        height="60%"
                        language={language}
                        value={code}
                        theme="vs-dark"
                        onChange={(value) => setCode(value)}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                        }}
                    />

                    {/* Output Console */}
                    <div className="flex-1 bg-slate-900 text-slate-300 font-mono text-xs p-4 overflow-y-auto border-t border-slate-700">
                        <div className="mb-2 text-slate-500 font-bold uppercase tracking-wider">Output / Test Results</div>
                        {output ? (
                            <div className="space-y-2">
                                {output.map((res, idx) => (
                                    <div key={idx} className={`p-2 rounded ${res.status === 'Accepted' ? 'bg-green-900/30 border border-green-800' : 'bg-red-900/30 border border-red-800'}`}>
                                        <div className="flex justify-between">
                                            <span className={`font-bold ${res.status === 'Accepted' ? 'text-green-400' : 'text-red-400'}`}>
                                                Test Case {idx + 1}: {res.status}
                                            </span>
                                            <span className="text-slate-500">{res.execution_time}ms</span>
                                        </div>
                                        {res.status !== 'Accepted' && (
                                            <div className="mt-1 pl-2 border-l-2 border-slate-700">
                                                <div>Exp: {res.expected}</div>
                                                <div>Got: {res.actual || res.error}</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-slate-600 italic">Run code to see output results here...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
