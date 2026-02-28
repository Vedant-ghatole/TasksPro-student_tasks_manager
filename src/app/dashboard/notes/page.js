"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function NotesPage() {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [showEditor, setShowEditor] = useState(false);
    const [editId, setEditId] = useState(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [color, setColor] = useState("slate");
    const [searchQuery, setSearchQuery] = useState("");

    const COLORS = [
        { name: "slate", bg: "bg-white", border: "border-slate-200", text: "text-slate-800" },
        { name: "blue", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-900" },
        { name: "green", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-900" },
        { name: "purple", bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-900" },
        { name: "amber", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-900" },
        { name: "rose", bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-900" },
    ];

    // Load notes from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(`notes_${user?.uid}`);
        if (stored) {
            try { setNotes(JSON.parse(stored)); } catch (e) { /* ignore */ }
        }
    }, [user]);

    // Save notes to localStorage
    useEffect(() => {
        if (user) {
            localStorage.setItem(`notes_${user.uid}`, JSON.stringify(notes));
        }
    }, [notes, user]);

    const handleSave = () => {
        if (!title.trim()) return;

        if (editId) {
            setNotes(prev =>
                prev.map(n => n.id === editId ? { ...n, title, content, color, updatedAt: new Date().toISOString() } : n)
            );
        } else {
            const newNote = {
                id: Date.now().toString(),
                title,
                content,
                color,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                pinned: false,
            };
            setNotes(prev => [newNote, ...prev]);
        }

        setTitle("");
        setContent("");
        setColor("slate");
        setEditId(null);
        setShowEditor(false);
    };

    const handleEdit = (note) => {
        setTitle(note.title);
        setContent(note.content);
        setColor(note.color);
        setEditId(note.id);
        setShowEditor(true);
    };

    const handleDelete = (id) => {
        setNotes(prev => prev.filter(n => n.id !== id));
    };

    const togglePin = (id) => {
        setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
    };

    const getColorClasses = (colorName) => COLORS.find(c => c.name === colorName) || COLORS[0];

    const filteredNotes = notes.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pinnedNotes = filteredNotes.filter(n => n.pinned);
    const unpinnedNotes = filteredNotes.filter(n => !n.pinned);

    return (
        <div className="animate-fade-in-up space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Quick Notes</h1>
                    <p className="text-sm text-slate-500 mt-1">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex gap-3 items-center">
                    {/* Search */}
                    <div className="relative flex-1 sm:flex-none">
                        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2.5 w-full sm:w-64 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <button
                        onClick={() => { setShowEditor(!showEditor); setEditId(null); setTitle(""); setContent(""); setColor("slate"); }}
                        className="btn-primary flex items-center gap-2 whitespace-nowrap"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        {showEditor ? "Cancel" : "New Note"}
                    </button>
                </div>
            </div>

            {/* Editor */}
            {showEditor && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Note title..."
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full text-xl font-bold text-slate-900 placeholder:text-slate-300 border-0 outline-none bg-transparent"
                        />
                        <textarea
                            rows={5}
                            placeholder="Start writing..."
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            className="w-full text-sm text-slate-700 placeholder:text-slate-300 border-0 outline-none bg-transparent resize-none"
                        />
                        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                            <div className="flex gap-2">
                                {COLORS.map(c => (
                                    <button
                                        key={c.name}
                                        onClick={() => setColor(c.name)}
                                        className={`w-7 h-7 rounded-full ${c.bg} border-2 transition-all duration-200 ${color === c.name ? 'ring-2 ring-primary-500 ring-offset-2 scale-110' : c.border
                                            }`}
                                    />
                                ))}
                            </div>
                            <button onClick={handleSave} className="btn-primary text-sm py-2 px-5">
                                {editId ? "Update" : "Save Note"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pinned Notes */}
            {pinnedNotes.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v2H5V5zm-1 3h12l-1.2 9.6A2 2 0 0112.82 19H7.18a2 2 0 01-1.98-1.4L4 8z" /></svg>
                        Pinned
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pinnedNotes.map(note => {
                            const cc = getColorClasses(note.color);
                            return (
                                <div key={note.id} className={`${cc.bg} rounded-2xl p-5 border ${cc.border} card-hover group relative`}>
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                        <button onClick={() => togglePin(note.id)} className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-yellow-500 shadow-sm"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v2H5V5zm-1 3h12l-1.2 9.6A2 2 0 0112.82 19H7.18a2 2 0 01-1.98-1.4L4 8z" /></svg></button>
                                        <button onClick={() => handleEdit(note)} className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-500 shadow-sm"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                                        <button onClick={() => handleDelete(note.id)} className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-red-500 shadow-sm"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                    </div>
                                    <h3 className={`font-bold ${cc.text} mb-2 pr-16 line-clamp-1`}>{note.title}</h3>
                                    <p className="text-sm text-slate-600 line-clamp-4 whitespace-pre-wrap">{note.content}</p>
                                    <p className="text-[10px] text-slate-400 mt-3 font-medium">{new Date(note.updatedAt).toLocaleDateString()}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* All Notes */}
            <div>
                {pinnedNotes.length > 0 && unpinnedNotes.length > 0 && (
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Others</p>
                )}
                {unpinnedNotes.length === 0 && pinnedNotes.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                        <div className="mx-auto w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No notes yet</h3>
                        <p className="text-sm text-slate-500">Create your first note to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {unpinnedNotes.map(note => {
                            const cc = getColorClasses(note.color);
                            return (
                                <div key={note.id} className={`${cc.bg} rounded-2xl p-5 border ${cc.border} card-hover group relative`}>
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                        <button onClick={() => togglePin(note.id)} className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-400 hover:text-yellow-500 shadow-sm"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v2H5V5zm-1 3h12l-1.2 9.6A2 2 0 0112.82 19H7.18a2 2 0 01-1.98-1.4L4 8z" /></svg></button>
                                        <button onClick={() => handleEdit(note)} className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-500 shadow-sm"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                                        <button onClick={() => handleDelete(note.id)} className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-red-500 shadow-sm"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                    </div>
                                    <h3 className={`font-bold ${cc.text} mb-2 pr-16 line-clamp-1`}>{note.title}</h3>
                                    <p className="text-sm text-slate-600 line-clamp-4 whitespace-pre-wrap">{note.content}</p>
                                    <p className="text-[10px] text-slate-400 mt-3 font-medium">{new Date(note.updatedAt).toLocaleDateString()}</p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
