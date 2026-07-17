import { useState, useEffect } from 'react';
import { useSEO } from '../hooks/useSEO';
import { Timer, Play, Pause, RotateCcw, ListTodo, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    completed: boolean;
}

export default function PomodoroTracker({ onBack }: { onBack: () => void }) {
    const [mode, setMode] = useState<'focus' | 'break'>('focus');
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [tasks, setTasks] = useState<Task[]>(() => {
        const saved = localStorage.getItem('pomodoro_tasks');
        return saved ? JSON.parse(saved) : [];
    });
    const [newTask, setNewTask] = useState('');
    const [streaks, setStreaks] = useState(() => parseInt(localStorage.getItem('pomodoro_streaks') || '0'));

    useSEO(
        'Pomodoro Task Tracker | Offline Storage',
        'Boost your productivity with a local client-side Pomodoro timer and task ledger. Track your focus streaks securely without cloud sync.',
        '/pomodoro-tracker'
    );

    const initialTimeLeft = mode === 'focus' ? 25 * 60 : 5 * 60;

    useEffect(() => {
        localStorage.setItem('pomodoro_tasks', JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        localStorage.setItem('pomodoro_streaks', streaks.toString());
    }, [streaks]);

    useEffect(() => {
        let interval: any = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (isActive && timeLeft === 0) {
            // Timer finished
            if (mode === 'focus') {
                setStreaks(s => s + 1);
                setMode('break');
                setTimeLeft(5 * 60);
            } else {
                setMode('focus');
                setTimeLeft(25 * 60);
            }
            setIsActive(false);

            // Play a simple beep locally using Web Audio API
            try {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                oscillator.type = 'sine';
                oscillator.frequency.value = 800;
                gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.01);
                gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.5);
            } catch (e) { } // ignore if blocked
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode]);

    const addTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        setTasks([{ id: Date.now().toString(), title: newTask, completed: false }, ...tasks]);
        setNewTask('');
    };

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const pad = (num: number) => num.toString().padStart(2, '0');
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progress = ((initialTimeLeft - timeLeft) / initialTimeLeft) * 100;

    return (
        <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-8 font-sans selection:bg-rose-500/30 overflow-y-auto">
            <div className="max-w-4xl mx-auto h-full flex flex-col pt-8">
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all flex items-center" title="Back to Hub">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                        </button>
                        <div className="w-px h-6 bg-zinc-800 hidden sm:block"></div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                                <Timer size={24} />
                            </div>
                            <div>
                                <h1 className="font-bold text-2xl text-zinc-100 tracking-tight">Focus & Ledger</h1>
                                <p className="text-xs text-zinc-400 font-medium tracking-wider uppercase mt-1">Local-first productivity</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-rose-400 tracking-wider mix-blend-screen">Streaks: {streaks}</span>
                    </div>
                </header>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Timer Section */}
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl relative overflow-hidden">
                        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 blur-[100px] pointer-events-none rounded-full transition-colors duration-1000 ${mode === 'focus' ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}></div>

                        <div className="relative w-64 h-64 flex items-center justify-center mb-8">
                            {/* SVG Circular Progress */}
                            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="4" fill="none" className="text-zinc-800" />
                                <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="4" fill="none"
                                    className={`transition-all duration-1000 ease-linear ${mode === 'focus' ? 'text-rose-500' : 'text-emerald-500'}`}
                                    strokeDasharray={2 * Math.PI * 120}
                                    strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                                    strokeLinecap="round"
                                />
                            </svg>

                            <div className="text-center z-10 flex flex-col items-center">
                                <div className="text-6xl font-extrabold tracking-tighter mb-2 font-mono">
                                    {pad(minutes)}:{pad(seconds)}
                                </div>
                                <div className={`text-sm font-bold uppercase tracking-widest ${mode === 'focus' ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {mode === 'focus' ? 'Deep Work' : 'Recovery Break'}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 z-10">
                            <button
                                onClick={() => setIsActive(!isActive)}
                                className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-transform hover:scale-105 ${mode === 'focus' ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'}`}
                            >
                                {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                            </button>
                            <button
                                onClick={() => { setIsActive(false); setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60); }}
                                className="w-12 h-12 rounded-full border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
                                title="Reset Timer"
                            >
                                <RotateCcw size={20} />
                            </button>
                        </div>

                        <div className="mt-8 flex bg-zinc-950 p-1 rounded-full border border-zinc-800 z-10">
                            <button
                                onClick={() => { setMode('focus'); setTimeLeft(25 * 60); setIsActive(false); }}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'focus' ? 'bg-rose-500/20 text-rose-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Pomodoro
                            </button>
                            <button
                                onClick={() => { setMode('break'); setTimeLeft(5 * 60); setIsActive(false); }}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'break' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Short Break
                            </button>
                        </div>
                    </div>

                    {/* Ledger Section */}
                    <div className="flex-1 flex flex-col bg-zinc-900/40 border border-zinc-800/80 rounded-3xl overflow-hidden">
                        <div className="p-4 bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 text-xs">
                            <strong className="text-rose-400">How to use:</strong> Add your current tasks to the ledger below. Start the focus timer. When a 25-minute Deep Work session naturally finishes, your streak will increment automatically!
                        </div>
                        <div className="p-6 border-b border-zinc-800/80">
                            <h3 className="font-bold text-zinc-100 flex items-center gap-2 mb-4">
                                <ListTodo size={20} className="text-zinc-400" /> Storage Ledger
                            </h3>
                            <form onSubmit={addTask} className="relative">
                                <input
                                    type="text"
                                    value={newTask}
                                    onChange={e => setNewTask(e.target.value)}
                                    placeholder="What are you working on?"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-rose-500/50 transition-colors"
                                />
                                <button type="submit" disabled={!newTask.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-zinc-800 hover:bg-rose-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-zinc-800">
                                    <Plus size={16} />
                                </button>
                            </form>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar min-h-[300px]">
                            {tasks.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-500 opacity-50 p-8">
                                    <ListTodo size={48} className="mb-4" />
                                    <p className="text-sm text-center">Your ledger is empty. Add a task to start tracking your session.</p>
                                </div>
                            ) : (
                                tasks.map(t => (
                                    <div key={t.id} className="flex items-center gap-3 p-3 bg-zinc-950/50 border border-zinc-800/50 rounded-xl group hover:border-zinc-700 transition-colors">
                                        <button onClick={() => toggleTask(t.id)} className={`flex-shrink-0 transition-colors ${t.completed ? 'text-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}>
                                            <CheckCircle2 size={20} />
                                        </button>
                                        <span className={`flex-1 text-sm transition-all ${t.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                                            {t.title}
                                        </span>
                                        <button onClick={() => deleteTask(t.id)} className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Features Overview */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 mb-16 relative w-full">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-32 bg-rose-500/10 blur-[100px] pointer-events-none"></div>

                    <div className="text-center mb-16 relative z-10 w-full">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold mb-6 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                            <Timer size={16} /> Local-first productivity
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
                            Focus & Ledger Tracker <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">Secure Browser Pomodoro Timer</span>
                        </h2>
                        <p className="mt-8 text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                            Take control of your productivity without sacrificing your data privacy. Our Focus & Ledger Tracker combines a traditional Pomodoro timer with a secure, local productivity log. Monitor your deep-work intervals and build consistent habits while keeping your operational data safely tucked away inside your local browser storage.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                                <ListTodo size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-100 mb-4">Deep-Work Ledger</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                Log your focus intervals systematically to audit your daily efficiency. With our integrated task tracker, you can cross items off instantly while maintaining a clear view of your ongoing projects.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                <Play size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-100 mb-4">Secure Browser Storage</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                Your time logs stay on your machine - no accounts or cloud tracking required. The ledger uses HTML5 Web Storage functionality to keep your session histories intact completely offline.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl hover:bg-zinc-900/60 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(217,70,239,0.1)]">
                                <Timer size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-100 mb-4">Optimized Pomodoro Flow</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                Balance intense focus blocks with structured recovery breaks seamlessly. Customize your deep work sessions into manageable chunks designed to prevent burnout across your workday.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    "name": "Pomodoro Task Tracker & Ledger",
                    "operatingSystem": "Web Browser",
                    "applicationCategory": "ProductivityApplication",
                    "description": "Track deep-work sessions securely within browser storage via a local Pomodoro ledger.",
                    "offers": { "@type": "Offer", "price": "0.00", "priceCurrency": "USD" }
                })
            }} />
        </div>
    );
}
