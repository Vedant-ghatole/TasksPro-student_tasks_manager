"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function MaterialsPage() {
    const { user } = useAuth();
    const [materials, setMaterials] = useState([]);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const stored = localStorage.getItem("student_tasks_materials");
        if (stored) {
            try { setMaterials(JSON.parse(stored)); } catch (e) { /* ignore */ }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("student_tasks_materials", JSON.stringify(materials));
    }, [materials]);

    const handleUpload = (e) => {
        e.preventDefault();
        if (!title || !subject || !file) return;

        const newMaterial = {
            id: Date.now().toString(),
            title,
            subject,
            description,
            fileName: file.name,
            fileSize: (file.size / 1024).toFixed(1) + " KB",
            fileUrl: URL.createObjectURL(file),
            createdAt: new Date().toISOString(),
            uploaderEmail: user?.email || "Unknown"
        };
        setMaterials(prev => [newMaterial, ...prev]);
        setTitle(""); setSubject(""); setDescription(""); setFile(null);
        setShowUploadForm(false);
    };

    const filtered = materials.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const subjects = [...new Set(materials.map(m => m.subject))];

    return (
        <div className="animate-fade-in-up space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Study Materials</h1>
                    <p className="text-sm text-slate-500 mt-1">{materials.length} resource{materials.length !== 1 ? 's' : ''} available</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative flex-1 sm:flex-none">
                        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2.5 w-full sm:w-56 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" />
                    </div>
                    {(user?.role === "teacher" || user?.role === "cr") && (
                        <button onClick={() => setShowUploadForm(!showUploadForm)} className="btn-primary flex items-center gap-2 whitespace-nowrap">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            {showUploadForm ? "Cancel" : "Upload"}
                        </button>
                    )}
                </div>
            </div>

            {showUploadForm && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
                    <h2 className="text-lg font-bold mb-4 text-slate-900">Upload Material</h2>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Title</label>
                                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="e.g., Chapter 5 Notes" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subject</label>
                                <input type="text" required value={subject} onChange={e => setSubject(e.target.value)} className="input-field" placeholder="e.g., Data Structures" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description (Optional)</label>
                            <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} className="input-field resize-none" placeholder="Brief description..." />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">File</label>
                            <input type="file" required onChange={e => setFile(e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-all" />
                        </div>
                        <button type="submit" className="btn-primary">Upload File</button>
                    </form>
                </div>
            )}

            {/* Subject filters */}
            {subjects.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setSearchQuery("")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!searchQuery ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All</button>
                    {subjects.map(s => (
                        <button key={s} onClick={() => setSearchQuery(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${searchQuery === s ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{s}</button>
                    ))}
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-100">
                        <div className="mx-auto w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-3">
                            <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        </div>
                        <p className="font-bold text-slate-800">No materials yet</p>
                        <p className="text-sm text-slate-500 mt-0.5">Upload study resources to share with your class.</p>
                    </div>
                ) : (
                    filtered.map(m => (
                        <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col h-full card-hover">
                            <span className="inline-flex items-center rounded-lg bg-primary-50 px-2.5 py-1 text-[10px] font-bold text-primary-700 uppercase tracking-wider w-fit mb-3">{m.subject}</span>
                            <h3 className="text-base font-bold text-slate-900 mb-1 line-clamp-2">{m.title}</h3>
                            {m.description && <p className="text-sm text-slate-500 line-clamp-2 mb-3">{m.description}</p>}
                            <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center">
                                <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-800 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    Download
                                </a>
                                <span className="text-[10px] text-slate-400 font-medium">{m.fileSize}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
