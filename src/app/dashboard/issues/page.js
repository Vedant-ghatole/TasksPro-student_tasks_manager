"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function IssuesPage() {
    const { user } = useAuth();
    const [issues, setIssues] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("academic");
    const [description, setDescription] = useState("");

    useEffect(() => {
        const stored = localStorage.getItem("student_tasks_issues");
        if (stored) {
            try { setIssues(JSON.parse(stored)); } catch (e) { /* ignore */ }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("student_tasks_issues", JSON.stringify(issues));
    }, [issues]);

    const handleReport = (e) => {
        e.preventDefault();
        if (!title || !description) return;

        const newIssue = {
            id: Date.now().toString(),
            title, category, description,
            status: "open",
            createdAt: new Date().toISOString(),
            reportedBy: user?.uid || "unknown",
            reporterEmail: user?.email || "Unknown"
        };
        setIssues(prev => [newIssue, ...prev]);
        setTitle(""); setCategory("academic"); setDescription("");
        setShowForm(false);
    };

    const updateStatus = (id, newStatus) => {
        setIssues(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
    };

    const statusColors = {
        open: { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-600/10", dot: "bg-red-500" },
        "in-progress": { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-600/20", dot: "bg-amber-500" },
        resolved: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-600/20", dot: "bg-emerald-500" },
    };

    const visibleIssues = user?.role === "student" ? issues.filter(i => i.reportedBy === user.uid) : issues;

    return (
        <div className="animate-fade-in-up space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Issues & Help</h1>
                    <p className="text-sm text-slate-500 mt-1">Report problems or request assistance</p>
                </div>
                {user?.role === "student" && (
                    <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        {showForm ? "Cancel" : "Report Issue"}
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
                    <h2 className="text-lg font-bold mb-4">New Issue Report</h2>
                    <form onSubmit={handleReport} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Title</label>
                            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="Brief summary of the issue" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className="input-field bg-white">
                                <option value="academic">Academic & Classes</option>
                                <option value="infrastructure">Infrastructure & Facilities</option>
                                <option value="technical">Technical Support</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                            <textarea rows={4} required value={description} onChange={e => setDescription(e.target.value)} className="input-field resize-none" placeholder="Provide as much detail as possible..." />
                        </div>
                        <button type="submit" className="btn-primary">Submit Report</button>
                    </form>
                </div>
            )}

            <div className="space-y-3">
                {visibleIssues.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center">
                        <div className="mx-auto w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
                            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <p className="font-bold text-slate-800">No issues reported</p>
                        <p className="text-sm text-slate-500 mt-0.5">Everything seems to be running smoothly.</p>
                    </div>
                ) : (
                    visibleIssues.map(issue => {
                        const sc = statusColors[issue.status] || statusColors.open;
                        return (
                            <div key={issue.id} className="bg-white p-5 rounded-2xl border border-slate-100 card-hover group">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${sc.bg} ${sc.text} ${sc.ring}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                                                {issue.status}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{issue.category}</span>
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900">{issue.title}</h3>
                                        <p className="mt-1 text-sm text-slate-600 line-clamp-2">{issue.description}</p>
                                        <p className="mt-2 text-[10px] text-slate-400 font-medium">
                                            By {issue.reporterEmail?.split('@')[0]} • {new Date(issue.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {(user?.role === "teacher" || user?.role === "cr") && issue.status !== 'resolved' && (
                                        <div className="flex sm:flex-col gap-2 justify-end sm:justify-center">
                                            {issue.status === 'open' && (
                                                <button onClick={() => updateStatus(issue.id, 'in-progress')} className="text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 px-3 py-2 rounded-xl transition font-bold">
                                                    Mark In-Progress
                                                </button>
                                            )}
                                            <button onClick={() => updateStatus(issue.id, 'resolved')} className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-2 rounded-xl transition font-bold">
                                                Mark Resolved
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
