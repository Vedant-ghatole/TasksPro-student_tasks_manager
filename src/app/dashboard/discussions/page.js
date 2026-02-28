"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useGamification } from "@/components/GamificationProvider";

const SUBJECTS = [
    { id: "dsa", name: "Data Structures", icon: "🧮", color: "from-blue-500 to-blue-600" },
    { id: "webdev", name: "Web Development", icon: "🌐", color: "from-emerald-500 to-emerald-600" },
    { id: "dbms", name: "Database Systems", icon: "🗄️", color: "from-purple-500 to-purple-600" },
    { id: "os", name: "Operating Systems", icon: "💻", color: "from-amber-500 to-amber-600" },
    { id: "cyber", name: "Cyber Security", icon: "🔒", color: "from-red-500 to-red-600" },
    { id: "general", name: "General", icon: "💬", color: "from-slate-500 to-slate-600" },
];

export default function DiscussionsPage() {
    const { user } = useAuth();
    const { addXP, awardBadge } = useGamification();
    const [threads, setThreads] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedThread, setSelectedThread] = useState(null);
    const [showNewThread, setShowNewThread] = useState(false);

    // Form state
    const [newTitle, setNewTitle] = useState("");
    const [newBody, setNewBody] = useState("");
    const [newSubject, setNewSubject] = useState("dsa");
    const [replyText, setReplyText] = useState("");

    useEffect(() => {
        const stored = localStorage.getItem("taskspro_discussions");
        if (stored) {
            try { setThreads(JSON.parse(stored)); } catch (e) { /* ignore */ }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("taskspro_discussions", JSON.stringify(threads));
    }, [threads]);

    const createThread = (e) => {
        e.preventDefault();
        if (!newTitle.trim() || !newBody.trim()) return;
        const thread = {
            id: Date.now().toString(),
            title: newTitle,
            body: newBody,
            subject: newSubject,
            authorId: user.uid,
            authorEmail: user.email,
            authorRole: user.role,
            createdAt: new Date().toISOString(),
            upvotes: [],
            replies: [],
            acceptedReplyId: null,
            resolved: false,
        };
        setThreads(prev => [thread, ...prev]);
        setNewTitle(""); setNewBody(""); setShowNewThread(false);
        addXP(10, "Posted a discussion");
    };

    const addReply = (threadId) => {
        if (!replyText.trim()) return;
        const reply = {
            id: Date.now().toString(),
            body: replyText,
            authorId: user.uid,
            authorEmail: user.email,
            authorRole: user.role,
            createdAt: new Date().toISOString(),
            upvotes: [],
        };
        setThreads(prev => prev.map(t =>
            t.id === threadId ? { ...t, replies: [...t.replies, reply] } : t
        ));
        setReplyText("");
        addXP(15, "Helped in discussion");

        // Check for contributor badge
        const totalReplies = threads.reduce((sum, t) =>
            sum + t.replies.filter(r => r.authorId === user.uid).length, 0
        );
        if (totalReplies >= 9) awardBadge("contributor");
    };

    const toggleUpvote = (threadId, replyId = null) => {
        setThreads(prev => prev.map(t => {
            if (t.id !== threadId) return t;
            if (!replyId) {
                const hasUpvoted = t.upvotes.includes(user.uid);
                return { ...t, upvotes: hasUpvoted ? t.upvotes.filter(u => u !== user.uid) : [...t.upvotes, user.uid] };
            }
            return {
                ...t,
                replies: t.replies.map(r => {
                    if (r.id !== replyId) return r;
                    const hasUpvoted = r.upvotes.includes(user.uid);
                    return { ...r, upvotes: hasUpvoted ? r.upvotes.filter(u => u !== user.uid) : [...r.upvotes, user.uid] };
                })
            };
        }));
    };

    const markAccepted = (threadId, replyId) => {
        setThreads(prev => prev.map(t =>
            t.id === threadId ? { ...t, acceptedReplyId: t.acceptedReplyId === replyId ? null : replyId, resolved: t.acceptedReplyId !== replyId } : t
        ));
    };

    const filteredThreads = selectedSubject
        ? threads.filter(t => t.subject === selectedSubject)
        : threads;

    // Leaderboard: count replies per user
    const leaderboard = {};
    threads.forEach(t => {
        t.replies.forEach(r => {
            const name = r.authorEmail?.split('@')[0] || 'unknown';
            leaderboard[name] = (leaderboard[name] || 0) + 1;
        });
    });
    const sortedLeaderboard = Object.entries(leaderboard).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Thread detail view
    if (selectedThread) {
        const thread = threads.find(t => t.id === selectedThread);
        if (!thread) { setSelectedThread(null); return null; }
        const subj = SUBJECTS.find(s => s.id === thread.subject);
        const canAccept = user.uid === thread.authorId || user.role === "teacher" || user.role === "cr";

        return (
            <div className="animate-fade-in-up space-y-6 max-w-4xl mx-auto">
                <button onClick={() => setSelectedThread(null)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    Back to Discussions
                </button>

                {/* Thread */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <button onClick={() => toggleUpvote(thread.id)} className={`flex flex-col items-center gap-0.5 pt-1 ${thread.upvotes.includes(user.uid) ? 'text-primary-600' : 'text-slate-400 hover:text-primary-500'} transition-colors`}>
                            <svg className="w-5 h-5" fill={thread.upvotes.includes(user.uid) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                            <span className="text-xs font-bold">{thread.upvotes.length}</span>
                        </button>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-gradient-to-r ${subj?.color} text-white`}>
                                    {subj?.icon} {subj?.name}
                                </span>
                                {thread.resolved && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">✓ Resolved</span>}
                            </div>
                            <h1 className="text-xl font-extrabold text-slate-900 mb-2">{thread.title}</h1>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{thread.body}</p>
                            <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
                                <span className="font-bold text-slate-600">{thread.authorEmail?.split('@')[0]}</span>
                                <span className="capitalize bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold">{thread.authorRole}</span>
                                <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Replies */}
                <div>
                    <h2 className="text-sm font-bold text-slate-500 mb-3">{thread.replies.length} Replies</h2>
                    <div className="space-y-3">
                        {thread.replies.map(reply => (
                            <div key={reply.id} className={`bg-white rounded-xl border p-5 transition-all ${thread.acceptedReplyId === reply.id ? 'border-emerald-300 bg-emerald-50/30 ring-1 ring-emerald-200' : 'border-slate-100'}`}>
                                <div className="flex items-start gap-3">
                                    <button onClick={() => toggleUpvote(thread.id, reply.id)} className={`flex flex-col items-center gap-0.5 ${reply.upvotes.includes(user.uid) ? 'text-primary-600' : 'text-slate-400 hover:text-primary-500'} transition-colors`}>
                                        <svg className="w-4 h-4" fill={reply.upvotes.includes(user.uid) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                                        <span className="text-[10px] font-bold">{reply.upvotes.length}</span>
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{reply.body}</p>
                                        <div className="mt-3 flex items-center gap-3 flex-wrap">
                                            <span className="text-xs font-bold text-slate-600">{reply.authorEmail?.split('@')[0]}</span>
                                            <span className="text-[10px] text-slate-400">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                            {thread.acceptedReplyId === reply.id && (
                                                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">✓ Accepted Answer</span>
                                            )}
                                            {canAccept && (
                                                <button onClick={() => markAccepted(thread.id, reply.id)} className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${thread.acceptedReplyId === reply.id ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'}`}>
                                                    {thread.acceptedReplyId === reply.id ? "Unmark" : "Accept Answer"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reply form */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <textarea
                        rows={3}
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Write your reply... (Earn 15 XP for helpful answers!)"
                        className="input-field resize-none mb-3"
                    />
                    <div className="flex justify-between items-center">
                        <p className="text-[10px] text-slate-400">Be helpful and specific — you earn XP for quality answers!</p>
                        <button onClick={() => addReply(thread.id)} disabled={!replyText.trim()} className="btn-primary text-sm py-2 px-5 disabled:opacity-50">
                            Post Reply
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main list view
    return (
        <div className="animate-fade-in-up space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Discussions</h1>
                    <p className="text-sm text-slate-500 mt-1">Ask doubts, share knowledge, earn XP</p>
                </div>
                <button onClick={() => setShowNewThread(!showNewThread)} className="btn-primary flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    {showNewThread ? "Cancel" : "New Question"}
                </button>
            </div>

            {/* New Thread Form */}
            {showNewThread && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-slide-down">
                    <form onSubmit={createThread} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subject</label>
                            <div className="flex gap-2 flex-wrap">
                                {SUBJECTS.map(s => (
                                    <button key={s.id} type="button" onClick={() => setNewSubject(s.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${newSubject === s.id ? `bg-gradient-to-r ${s.color} text-white shadow-md` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                        {s.icon} {s.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Question Title</label>
                            <input type="text" required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="input-field" placeholder="e.g., How does quicksort work?" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Details</label>
                            <textarea rows={4} required value={newBody} onChange={e => setNewBody(e.target.value)} className="input-field resize-none" placeholder="Explain your doubt in detail..." />
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] text-primary-500 font-bold">+10 XP for posting</p>
                            <button type="submit" className="btn-primary text-sm py-2 px-5">Post Question</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Subject Filters */}
                    <div className="flex gap-2 flex-wrap">
                        <button onClick={() => setSelectedSubject(null)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!selectedSubject ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>All</button>
                        {SUBJECTS.map(s => (
                            <button key={s.id} onClick={() => setSelectedSubject(s.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedSubject === s.id ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                {s.icon} {s.name}
                            </button>
                        ))}
                    </div>

                    {/* Thread List */}
                    {filteredThreads.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center">
                            <div className="mx-auto w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-3">
                                <span className="text-2xl">💬</span>
                            </div>
                            <p className="font-bold text-slate-800">No discussions yet</p>
                            <p className="text-sm text-slate-500 mt-0.5">Be the first to ask a question!</p>
                        </div>
                    ) : (
                        filteredThreads.map(thread => {
                            const subj = SUBJECTS.find(s => s.id === thread.subject);
                            return (
                                <div key={thread.id} onClick={() => setSelectedThread(thread.id)} className="bg-white p-5 rounded-2xl border border-slate-100 cursor-pointer card-hover group">
                                    <div className="flex items-start gap-4">
                                        <div className="flex flex-col items-center gap-1.5 pt-0.5">
                                            <div className="flex flex-col items-center text-slate-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                                                <span className="text-xs font-bold">{thread.upvotes.length}</span>
                                            </div>
                                            <div className="flex flex-col items-center text-slate-400">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                                <span className="text-[10px] font-bold">{thread.replies.length}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r ${subj?.color} text-white`}>{subj?.icon} {subj?.name}</span>
                                                {thread.resolved && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">✓ Resolved</span>}
                                            </div>
                                            <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">{thread.title}</h3>
                                            <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">{thread.body}</p>
                                            <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                                                <span className="font-bold text-slate-500">{thread.authorEmail?.split('@')[0]}</span>
                                                <span>•</span>
                                                <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Sidebar: Leaderboard */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-100 p-5">
                        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">🏆 Top Contributors</h3>
                        {sortedLeaderboard.length === 0 ? (
                            <p className="text-xs text-slate-400">No contributions yet</p>
                        ) : (
                            <div className="space-y-2.5">
                                {sortedLeaderboard.map(([name, count], i) => (
                                    <div key={name} className="flex items-center gap-3">
                                        <span className={`text-xs font-extrabold w-5 text-center ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-700' : 'text-slate-400'}`}>
                                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                                        </span>
                                        <span className="text-sm font-bold text-slate-700 flex-1 truncate">{name}</span>
                                        <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">{count}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-gradient-to-br from-primary-50 to-secondary-500/5 rounded-2xl p-5 border border-primary-100/50">
                        <h3 className="text-sm font-bold text-primary-900 mb-2 flex items-center gap-2">💡 Tips</h3>
                        <ul className="text-xs text-slate-600 space-y-1.5">
                            <li>• Ask clear, specific questions</li>
                            <li>• Upvote helpful answers</li>
                            <li>• Earn XP for every reply</li>
                            <li>• Top contributors get badges!</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
