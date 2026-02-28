"use client";

import { useAuth } from "@/components/AuthProvider";

export default function AttendancePage() {
    const { user } = useAuth();

    const attendanceData = [
        { subject: "Data Structures", total: 40, attended: 35 },
        { subject: "Web Development", total: 35, attended: 30 },
        { subject: "Database Systems", total: 42, attended: 31 },
        { subject: "Cyber Security", total: 30, attended: 29 },
        { subject: "Operating Systems", total: 38, attended: 25 },
    ];

    const overallTotal = attendanceData.reduce((a, c) => a + c.total, 0);
    const overallAttended = attendanceData.reduce((a, c) => a + c.attended, 0);
    const overallPct = ((overallAttended / overallTotal) * 100).toFixed(1);
    const circumference = 2 * Math.PI * 45;
    const overallOffset = circumference - (overallPct / 100) * circumference;

    return (
        <div className="animate-fade-in-up space-y-8">
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Attendance Overview</h1>
                <p className="text-sm text-slate-500 mt-1">Track your class attendance across subjects</p>
            </div>

            {/* Overall Ring + Stats */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-8">
                <div className="relative w-32 h-32 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                        <circle cx="50" cy="50" r="45" fill="none" stroke="url(#att-grad)" strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={overallOffset} className="transition-all duration-1000" />
                        <defs>
                            <linearGradient id="att-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={overallPct >= 75 ? "#6366f1" : "#ef4444"} />
                                <stop offset="100%" stopColor={overallPct >= 75 ? "#8b5cf6" : "#f97316"} />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-extrabold text-slate-900">{overallPct}%</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall</span>
                    </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-xl font-bold text-slate-900">Total Attendance</h2>
                    <p className="text-slate-500 text-sm mt-1">You attended <span className="font-bold text-slate-700">{overallAttended}</span> out of <span className="font-bold text-slate-700">{overallTotal}</span> total classes this semester.</p>
                    {overallPct < 75 && (
                        <div className="mt-4 inline-flex items-center gap-2 text-sm text-red-700 bg-red-50 px-4 py-2 rounded-xl border border-red-100 font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            Below 75% requirement!
                        </div>
                    )}
                </div>
            </div>

            {/* Subject Cards */}
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Subject Breakdown</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    {attendanceData.map((d, i) => {
                        const pct = ((d.attended / d.total) * 100).toFixed(1);
                        return (
                            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 card-hover">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-bold text-slate-800 text-sm">{d.subject}</h4>
                                    <span className={`text-sm font-extrabold ${pct >= 75 ? 'text-emerald-600' : pct >= 65 ? 'text-amber-600' : 'text-red-600'}`}>{pct}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2">
                                    <div
                                        className={`h-2.5 rounded-full transition-all duration-700 ${pct >= 75 ? 'bg-gradient-to-r from-primary-500 to-secondary-500' : pct >= 65 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`}
                                        style={{ width: `${pct}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    <span>Attended: {d.attended}</span>
                                    <span>Total: {d.total}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
