"use client";

import { useState, useEffect, useRef } from "react";

const PRESETS = [
    { label: "Pomodoro", work: 25, break: 5 },
    { label: "Long Focus", work: 50, break: 10 },
    { label: "Quick Sprint", work: 15, break: 3 },
];

export default function FocusTimerPage() {
    const [preset, setPreset] = useState(PRESETS[0]);
    const [isWork, setIsWork] = useState(true);
    const [timeLeft, setTimeLeft] = useState(PRESETS[0].work * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [sessions, setSessions] = useState(0);
    const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);
    const audioRef = useRef(null);

    useEffect(() => {
        let interval = null;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            // Timer finished
            if (isWork) {
                setSessions(prev => prev + 1);
                setTotalFocusMinutes(prev => prev + preset.work);
                setIsWork(false);
                setTimeLeft(preset.break * 60);
            } else {
                setIsWork(true);
                setTimeLeft(preset.work * 60);
            }
            // Play a soft notification
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = 800;
                gain.gain.value = 0.1;
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            } catch (e) { /* ignore audio errors */ }
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft, isWork, preset]);

    const selectPreset = (p) => {
        setPreset(p);
        setIsWork(true);
        setTimeLeft(p.work * 60);
        setIsRunning(false);
    };

    const resetTimer = () => {
        setIsWork(true);
        setTimeLeft(preset.work * 60);
        setIsRunning(false);
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const totalSeconds = isWork ? preset.work * 60 : preset.break * 60;
    const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
    const circumference = 2 * Math.PI * 120;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Focus Timer</h1>
                <p className="text-slate-500 font-medium">Stay productive with timed focus sessions</p>
            </div>

            {/* Preset Selector */}
            <div className="flex justify-center gap-3">
                {PRESETS.map((p, i) => (
                    <button
                        key={i}
                        onClick={() => selectPreset(p)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${preset.label === p.label
                                ? 'bg-gradient-to-r from-primary-600 to-secondary-500 text-white shadow-lg shadow-primary-500/30'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-200 hover:bg-primary-50'
                            }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Timer Display */}
            <div className="flex flex-col items-center">
                <div className="relative w-72 h-72 sm:w-80 sm:h-80">
                    {/* Background Ring */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 260 260">
                        <circle cx="130" cy="130" r="120" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                        <circle
                            cx="130" cy="130" r="120"
                            fill="none"
                            stroke="url(#timer-gradient)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-1000 ease-linear"
                        />
                        <defs>
                            <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={isWork ? "#6366f1" : "#34d399"} />
                                <stop offset="100%" stopColor={isWork ? "#8b5cf6" : "#6ee7b7"} />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Center Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isWork ? 'text-primary-500' : 'text-emerald-500'}`}>
                            {isWork ? "Focus Time" : "Break Time"}
                        </p>
                        <p className="text-6xl sm:text-7xl font-extrabold text-slate-900 tabular-nums tracking-tight">
                            {String(minutes).padStart(2, '0')}
                            <span className={`${isRunning ? 'animate-pulse-soft' : ''}`}>:</span>
                            {String(seconds).padStart(2, '0')}
                        </p>
                        <p className="text-xs font-medium text-slate-400 mt-2">{preset.label} • {isWork ? `${preset.work} min` : `${preset.break} min break`}</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4 mt-6">
                    <button
                        onClick={resetTimer}
                        className="p-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all duration-200 active:scale-95 shadow-sm"
                        title="Reset"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    </button>

                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 active:scale-90 ${isRunning
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30 text-white'
                                : 'bg-gradient-to-r from-primary-600 to-secondary-500 hover:shadow-xl shadow-primary-500/30 text-white'
                            }`}
                    >
                        {isRunning ? (
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        ) : (
                            <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                        )}
                    </button>

                    <button
                        onClick={() => { setTimeLeft(prev => prev + 60); }}
                        className="p-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all duration-200 active:scale-95 shadow-sm"
                        title="Add 1 minute"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 text-center card-hover">
                    <p className="text-3xl font-extrabold text-primary-600">{sessions}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Sessions Done</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 text-center card-hover">
                    <p className="text-3xl font-extrabold text-emerald-600">{totalFocusMinutes}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Minutes Focused</p>
                </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-primary-50 to-secondary-500/5 rounded-2xl p-6 border border-primary-100/50 max-w-lg mx-auto">
                <h3 className="font-bold text-primary-900 text-sm mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    Focus Tips
                </h3>
                <ul className="text-xs text-slate-600 space-y-1.5">
                    <li>• Set your phone to Do Not Disturb mode</li>
                    <li>• Close unnecessary browser tabs</li>
                    <li>• Keep a glass of water nearby</li>
                    <li>• Stretch during break sessions</li>
                </ul>
            </div>
        </div>
    );
}
