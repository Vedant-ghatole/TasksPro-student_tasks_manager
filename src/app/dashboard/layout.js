"use client";

import { useAuth } from "@/components/AuthProvider";
import { useGamification } from "@/components/GamificationProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Loader from "@/components/Loader";

export default function DashboardLayout({ children }) {
    const { user, loading, logout } = useAuth();
    const { xp, streak, getCurrentLevel, getNextLevel, getLevelProgress } = useGamification();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    const handleSignOut = () => {
        logout();
        router.push("/login");
    };

    if (loading || !user) {
        return <Loader message="Preparing your workspace..." />;
    }

    const level = getCurrentLevel();
    const nextLevel = getNextLevel();
    const levelProgress = getLevelProgress();

    const navigation = [
        { name: 'Overview', href: '/dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
        { name: 'Assignments', href: '/dashboard/assignments', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
        { name: 'Quizzes', href: '/dashboard/quizzes', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'Discussions', href: '/dashboard/discussions', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z' },
        { name: 'To-Do Lists', href: '/dashboard/todo', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'Focus Timer', href: '/dashboard/focus', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'Notes', href: '/dashboard/notes', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
        { name: 'Study Materials', href: '/dashboard/materials', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
        { name: 'Attendance', href: '/dashboard/attendance', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { name: 'Issues & Help', href: '/dashboard/issues', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
        { name: 'AI Assistant', href: '/dashboard/ai-assistant', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    ];

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
            {/* Background Decorations */}
            <div className="absolute top-0 left-64 right-0 h-64 bg-gradient-to-br from-primary-100/30 via-secondary-500/5 to-transparent -z-10 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-400/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            {/* Mobile overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"></div>
                </div>
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-2xl shadow-primary-900/5 transform transition-transform duration-300 md:relative md:translate-x-0 flex flex-col
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Sidebar Header */}
                <div className="h-20 flex items-center px-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                            <span className="text-white font-bold text-lg">T</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold tracking-tight gradient-text">TasksPro</h2>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Academic Platform</p>
                        </div>
                    </div>
                </div>

                {/* XP & Level Banner */}
                <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-primary-50/50 to-secondary-500/5">
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                            <span className="text-base">{level.emoji}</span>
                            <span className="text-xs font-bold text-primary-700">{level.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {streak > 0 && (
                                <span className="text-xs font-bold text-orange-500 flex items-center gap-0.5">
                                    🔥 {streak}
                                </span>
                            )}
                            <span className="text-xs font-bold text-slate-500">{xp} XP</span>
                        </div>
                    </div>
                    <div className="w-full bg-slate-200/60 rounded-full h-1.5">
                        <div
                            className={`h-1.5 rounded-full bg-gradient-to-r ${level.color} transition-all duration-700`}
                            style={{ width: `${levelProgress}%` }}
                        ></div>
                    </div>
                    {nextLevel && (
                        <p className="text-[9px] text-slate-400 mt-1 font-medium text-right">{nextLevel.minXP - xp} XP to {nextLevel.name}</p>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-0.5 overflow-y-auto">
                    <p className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Menu</p>
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                    group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                                    ${isActive
                                        ? 'bg-gradient-to-r from-primary-50 to-primary-100/50 text-primary-700 shadow-sm shadow-primary-100/50 border border-primary-200/50'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }
                                `}
                            >
                                <svg
                                    className={`mr-3 h-[18px] w-[18px] flex-shrink-0 transition-colors duration-200
                                        ${isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-primary-500'}
                                    `}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                                </svg>
                                {item.name}
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600 shadow-sm shadow-primary-400"></div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile Card */}
                <div className="p-3 m-3 bg-gradient-to-br from-slate-50 to-primary-50/30 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{user.email?.split('@')[0]}</p>
                            <p className="text-[10px] text-slate-500 truncate capitalize font-semibold">{user.role || 'Student'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 active:scale-95"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden relative">
                {/* Mobile Header */}
                <header className="md:hidden glass-panel h-14 flex items-center justify-between px-4 z-20 border-b border-white/40 sticky top-0">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-sm">T</span>
                        </div>
                        <h1 className="text-lg font-bold gradient-text">TasksPro</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {streak > 0 && <span className="text-sm font-bold text-orange-500">🔥{streak}</span>}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10 relative z-10 w-full max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
