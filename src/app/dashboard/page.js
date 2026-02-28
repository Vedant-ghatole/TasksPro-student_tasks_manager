"use client";

import { useAuth } from "@/components/AuthProvider";
import { useGamification } from "@/components/GamificationProvider";
import { useEffect, useState } from "react";
import Link from "next/link";

const QUOTES = [
    { text: "The beautiful thing about learning is that nobody can take it away from you.", author: "B.B. King" },
    { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
];

export default function Dashboard() {
    const { user } = useAuth();
    const { xp, streak, badges, getCurrentLevel, getNextLevel, getLevelProgress, BADGE_DEFS, xpHistory } = useGamification();
    const [greeting, setGreeting] = useState("");
    const [quote, setQuote] = useState(QUOTES[0]);
    const [currentDate, setCurrentDate] = useState("");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good morning");
        else if (hour < 18) setGreeting("Good afternoon");
        else setGreeting("Good evening");
        setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
        setCurrentDate(new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        }));
    }, []);

    const level = getCurrentLevel();
    const nextLevel = getNextLevel();
    const levelProgress = getLevelProgress();
    const earnedBadges = BADGE_DEFS.filter(b => badges.includes(b.id));
    const unearnedBadges = BADGE_DEFS.filter(b => !badges.includes(b.id)).slice(0, 4);

    // Mock data for performance
    const predictedGrade = "B+";
    const weakSubjects = ["Operating Systems", "Database Systems"];

    const quickActions = [
        { name: "Take Quiz", href: "/dashboard/quizzes", icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "from-primary-500 to-secondary-500" },
        { name: "Ask AI", href: "/dashboard/ai-assistant", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", color: "from-emerald-500 to-teal-500" },
        { name: "Start Focus", href: "/dashboard/focus", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "from-amber-500 to-orange-500" },
        { name: "Discussions", href: "/dashboard/discussions", icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z", color: "from-blue-500 to-blue-600" },
    ];

    return (
        <div className="space-y-6 animate-fade-in-up">

            {/* Greeting Banner */}
            <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-primary-500/20 relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-xs font-medium text-primary-200 mb-1">{currentDate}</p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight">
                        {greeting}, <span className="text-primary-100">{user?.email?.split('@')[0] || 'Student'}</span> 👋
                    </h1>
                    <p className="text-primary-100/80 max-w-lg text-sm">Your academic command center — stay organized, ace your exams.</p>
                    <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl">
                            <span className="text-sm">{level.emoji}</span>
                            <span className="text-xs font-bold">{level.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl">
                            <span className="text-sm">⚡</span>
                            <span className="text-xs font-bold">{xp} XP</span>
                        </div>
                        {streak > 0 && (
                            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl">
                                <span className="text-sm">🔥</span>
                                <span className="text-xs font-bold">{streak} day streak</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4 blur-2xl"></div>
                <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-secondary-500/20 translate-y-1/2 blur-2xl"></div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {quickActions.map((action, i) => (
                    <Link key={i} href={action.href}
                        className="group flex flex-col items-center gap-2.5 p-4 bg-white rounded-2xl border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon}></path></svg>
                        </div>
                        <span className="text-xs font-bold text-slate-700">{action.name}</span>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column (2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Performance Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: "Predicted Grade", value: predictedGrade, iconBg: "bg-primary-50 text-primary-600", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
                            { label: "Study Streak", value: `${streak}d`, iconBg: "bg-orange-50 text-orange-600", icon: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" },
                            { label: "Badges Earned", value: earnedBadges.length, iconBg: "bg-amber-50 text-amber-600", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
                            { label: "Level Progress", value: `${levelProgress}%`, iconBg: "bg-emerald-50 text-emerald-600", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 card-hover group">
                                <div className={`p-2 rounded-lg ${stat.iconBg} w-fit mb-2 group-hover:scale-110 transition-transform`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}></path></svg>
                                </div>
                                <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Weak Subject Alert */}
                    {weakSubjects.length > 0 && (
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-5 border border-red-100">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-red-900">Focus Needed</h3>
                                    <p className="text-xs text-red-700 mt-0.5">
                                        Improve in: <span className="font-bold">{weakSubjects.join(", ")}</span>
                                    </p>
                                    <Link href="/dashboard/quizzes" className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-red-600 hover:text-red-800 transition-colors">
                                        Take practice quiz →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Announcements */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 card-hover">
                        <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
                            Latest Announcements
                            <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">3 New</span>
                        </h2>
                        <div className="space-y-3">
                            {[
                                { title: "Mid-term exam schedules posted", time: "2 hours ago", by: "Admin", icon: "bg-yellow-50 text-yellow-600" },
                                { title: "New DSA quiz available", time: "5 hours ago", by: "Prof. Shah", icon: "bg-indigo-50 text-indigo-600" },
                                { title: "Study materials uploaded for Web Dev", time: "1 day ago", by: "CR", icon: "bg-emerald-50 text-emerald-600" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <div className={`h-8 w-8 flex-shrink-0 ${item.icon} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-slate-800 truncate group-hover:text-primary-600 transition-colors">{item.title}</p>
                                        <p className="text-[10px] text-slate-400">{item.time} • {item.by}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Badges */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5">
                        <h3 className="text-sm font-bold text-slate-900 mb-3">🏅 Badges</h3>
                        {earnedBadges.length > 0 ? (
                            <div className="grid grid-cols-4 gap-2 mb-3">
                                {earnedBadges.map(b => (
                                    <div key={b.id} className="flex flex-col items-center gap-1 p-2 bg-primary-50/50 rounded-xl" title={b.desc}>
                                        <span className="text-xl">{b.icon}</span>
                                        <span className="text-[8px] font-bold text-slate-500 text-center leading-tight">{b.name}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 mb-3">Complete actions to earn badges!</p>
                        )}
                        {unearnedBadges.length > 0 && (
                            <>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Locked</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {unearnedBadges.map(b => (
                                        <div key={b.id} className="flex flex-col items-center gap-1 p-2 bg-slate-50 rounded-xl opacity-40" title={b.desc}>
                                            <span className="text-xl grayscale">{b.icon}</span>
                                            <span className="text-[8px] font-bold text-slate-400 text-center leading-tight">{b.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* XP Activity */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5">
                        <h3 className="text-sm font-bold text-slate-900 mb-3">⚡ Recent XP</h3>
                        {xpHistory.length > 0 ? (
                            <div className="space-y-2">
                                {xpHistory.slice(0, 5).map((entry, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <span className="text-xs text-slate-600 truncate flex-1">{entry.reason}</span>
                                        <span className="text-xs font-bold text-emerald-600 ml-2">+{entry.amount}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400">Start using TasksPro to earn XP!</p>
                        )}
                    </div>

                    {/* Quote */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white relative overflow-hidden">
                        <svg className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 w-24 h-24 opacity-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"></path></svg>
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-bold tracking-widest uppercase mb-3 text-slate-300">
                                ⭐ Daily Motivation
                            </div>
                            <blockquote className="text-sm font-bold leading-snug mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                                &ldquo;{quote.text}&rdquo;
                            </blockquote>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">— {quote.author}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
