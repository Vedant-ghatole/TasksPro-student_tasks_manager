"use client";

import { useState, useEffect, useRef } from "react";

const LOADING_MESSAGES = [
    "Preparing your workspace...",
    "Loading academic modules...",
    "Syncing your progress...",
    "Almost ready...",
];

const STUDENT_FACTS = [
    "💡 Did you know? Spaced repetition can increase retention by 200%",
    "📊 Students who use active recall score 50% higher on exams",
    "🧠 Taking breaks every 25 minutes boosts productivity by 30%",
    "🎯 Setting daily goals increases completion rates by 42%",
    "📚 Teaching others is the most effective way to learn",
];

export default function Loader({ message, onFinish }) {
    const [progress, setProgress] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);
    const [currentMsg, setCurrentMsg] = useState(message || LOADING_MESSAGES[0]);
    const [fact, setFact] = useState("");
    const onFinishRef = useRef(onFinish);
    const hasFinished = useRef(false);

    useEffect(() => {
        onFinishRef.current = onFinish;
    }, [onFinish]);

    // Random fact
    useEffect(() => {
        setFact(STUDENT_FACTS[Math.floor(Math.random() * STUDENT_FACTS.length)]);
    }, []);

    useEffect(() => {
        let cancelled = false;
        let timeoutIds = [];
        const schedule = (fn, delay) => {
            const id = setTimeout(fn, delay);
            timeoutIds.push(id);
        };

        const stages = [
            { target: 25, delay: 150, msg: LOADING_MESSAGES[0] },
            { target: 50, delay: 200, msg: LOADING_MESSAGES[1] },
            { target: 80, delay: 250, msg: LOADING_MESSAGES[2] },
            { target: 100, delay: 150, msg: LOADING_MESSAGES[3] },
        ];

        let stageIdx = 0;
        let prog = 0;

        const runStage = () => {
            if (cancelled || hasFinished.current) return;
            if (stageIdx >= stages.length) {
                hasFinished.current = true;
                schedule(() => {
                    if (cancelled) return;
                    setFadeOut(true);
                    schedule(() => { if (!cancelled) onFinishRef.current?.(); }, 700);
                }, 400);
                return;
            }
            const { target, delay, msg } = stages[stageIdx];
            setCurrentMsg(message || msg);
            const step = () => {
                if (cancelled) return;
                if (prog >= target) { stageIdx++; schedule(runStage, delay); return; }
                prog++;
                setProgress(prog);
                schedule(step, 25);
            };
            step();
        };
        runStage();

        return () => { cancelled = true; timeoutIds.forEach(id => clearTimeout(id)); };
    }, [message]);

    return (
        <div className={`fixed inset-0 z-[200] flex flex-col items-center justify-center transition-opacity duration-700 ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #312e81 70%, #1e293b 100%)' }}>

            {/* Animated background grid */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                backgroundSize: '60px 60px'
            }}></div>

            {/* Floating academic icons */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Orbs */}
                <div className="absolute top-[15%] left-[20%] w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl animate-blob"></div>
                <div className="absolute bottom-[20%] right-[15%] w-96 h-96 rounded-full bg-violet-500/10 blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute top-[50%] right-[40%] w-64 h-64 rounded-full bg-cyan-400/5 blur-3xl animate-blob animation-delay-4000"></div>

                {/* Floating student icons */}
                <div className="absolute top-[12%] left-[8%] text-3xl opacity-10 animate-float" style={{ animationDuration: '6s' }}>📖</div>
                <div className="absolute top-[25%] right-[12%] text-2xl opacity-10 animate-float" style={{ animationDuration: '7s', animationDelay: '1s' }}>🎓</div>
                <div className="absolute bottom-[30%] left-[15%] text-2xl opacity-10 animate-float" style={{ animationDuration: '8s', animationDelay: '2s' }}>🏆</div>
                <div className="absolute bottom-[15%] right-[20%] text-3xl opacity-10 animate-float" style={{ animationDuration: '5s', animationDelay: '0.5s' }}>💻</div>
                <div className="absolute top-[55%] left-[5%] text-2xl opacity-10 animate-float" style={{ animationDuration: '9s', animationDelay: '3s' }}>📝</div>
                <div className="absolute top-[8%] right-[35%] text-2xl opacity-10 animate-float" style={{ animationDuration: '7s', animationDelay: '1.5s' }}>🔬</div>
                <div className="absolute bottom-[8%] left-[40%] text-2xl opacity-10 animate-float" style={{ animationDuration: '6s', animationDelay: '2.5s' }}>⚡</div>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-6 px-6">
                {/* Logo with animated rings */}
                <div className="relative w-32 h-32 mb-2">
                    {/* Spinning outer ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-spin" style={{ animationDuration: '8s' }}></div>
                    <div className="absolute inset-2 rounded-full border border-violet-400/15 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }}></div>

                    {/* Ping glow */}
                    <div className="absolute inset-0 rounded-full bg-indigo-500/15 animate-ping" style={{ animationDuration: '2.5s' }}></div>

                    {/* Main logo */}
                    <div className="absolute inset-4 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 animate-float-slow">
                        {/* Graduation cap + book combined icon */}
                        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                        </svg>
                        {/* Pulse dots */}
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/60 animate-pulse-soft"></div>
                        <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-violet-400 shadow-lg shadow-violet-400/60 animate-pulse-soft" style={{ animationDelay: '0.8s' }}></div>
                        <div className="absolute top-1/2 -right-2 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-lg shadow-amber-400/60 animate-pulse-soft" style={{ animationDelay: '1.6s' }}></div>
                    </div>
                </div>

                {/* Brand */}
                <div className="text-center">
                    <h1 className="text-5xl font-extrabold tracking-tight text-white mb-2">
                        Tasks<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">Pro</span>
                    </h1>
                    <p className="text-sm font-semibold text-indigo-300/70 uppercase tracking-[0.35em]">Ultimate Academic Platform</p>
                </div>

                {/* Progress section */}
                <div className="w-80 space-y-3 mt-2">
                    {/* Segmented progress */}
                    <div className="flex gap-1.5">
                        {[0, 1, 2, 3].map(i => {
                            const segStart = i * 25;
                            const segEnd = (i + 1) * 25;
                            const segProgress = Math.max(0, Math.min(100, ((progress - segStart) / (segEnd - segStart)) * 100));
                            return (
                                <div key={i} className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 transition-all duration-200 ease-out relative"
                                        style={{ width: progress > segStart ? `${segProgress}%` : '0%' }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Status */}
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-indigo-300/60 font-medium animate-pulse-soft">{currentMsg}</p>
                        <p className="text-xs font-bold text-indigo-300/80 tabular-nums">{progress}%</p>
                    </div>
                </div>

                {/* Feature highlights */}
                <div className="flex items-center gap-6 mt-4">
                    {[
                        { icon: "📝", label: "Quizzes" },
                        { icon: "💬", label: "Discussions" },
                        { icon: "🎯", label: "Focus" },
                        { icon: "🤖", label: "AI Help" },
                    ].map((f, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5 opacity-0"
                            style={{ animation: `fade-in-up 0.5s ease-out ${0.5 + i * 0.15}s forwards` }}>
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg backdrop-blur-sm">
                                {f.icon}
                            </div>
                            <span className="text-[9px] font-bold text-indigo-400/50 uppercase tracking-wider">{f.label}</span>
                        </div>
                    ))}
                </div>

                {/* Student fact */}
                <div className="mt-4 max-w-sm text-center px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
                    <p className="text-xs text-indigo-200/40 leading-relaxed">{fact}</p>
                </div>

                {/* Loading dots */}
                <div className="flex items-center gap-1.5 mt-1">
                    {[0, 1, 2, 3, 4].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400/40"
                            style={{ animation: 'pulse-soft 1.4s ease-in-out infinite', animationDelay: `${i * 0.15}s` }} />
                    ))}
                </div>
            </div>
        </div>
    );
}
