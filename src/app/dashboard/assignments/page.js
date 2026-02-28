"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function AssignmentsPage() {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("student_tasks_assignments");
            if (stored) {
                const parsed = JSON.parse(stored);
                parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setAssignments(parsed);
            }
        } catch (e) {
            console.error("Error loading assignments", e);
        }
    }, []);

    const saveAssignments = (newAssignments) => {
        try {
            localStorage.setItem("student_tasks_assignments", JSON.stringify(newAssignments));
        } catch (e) {
            console.error("Error saving assignments", e);
        }
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        if (!title || !dueDate || !user) return;

        setUploading(true);
        try {
            // Mock file url
            let fileUrl = null;
            let fileName = null;

            if (file) {
                fileUrl = URL.createObjectURL(file); // Temporary local URL for demo
                fileName = file.name;
            }

            const newAsmt = {
                id: Date.now().toString(),
                title,
                description,
                dueDate,
                fileUrl,
                fileName,
                createdAt: new Date().toISOString(),
                createdBy: user.uid,
                createdByEmail: user.email,
                submissions: [] // Initialize empty submissions array
            };

            const updatedAssignments = [newAsmt, ...assignments];
            setAssignments(updatedAssignments);
            saveAssignments(updatedAssignments);

            // Reset form
            setTitle("");
            setDescription("");
            setDueDate("");
            setFile(null);
            setShowCreateForm(false);
        } catch (error) {
            console.error("Error creating assignment:", error);
            alert("Failed to create assignment");
        } finally {
            setUploading(false);
        }
    };

    const handleStudentSubmit = async (assignmentId, e) => {
        e.preventDefault();
        const fileInput = e.target.elements.submissionFile;
        const submitFile = fileInput.files[0];

        if (!submitFile || !user) return;

        try {
            const fileUrl = URL.createObjectURL(submitFile); // Mock URL

            const submission = {
                id: Date.now().toString(),
                studentId: user.uid,
                studentEmail: user.email,
                fileUrl,
                fileName: submitFile.name,
                submittedAt: new Date().toISOString()
            };

            const updatedAssignments = assignments.map(asmt => {
                if (asmt.id === assignmentId) {
                    return {
                        ...asmt,
                        submissions: [...(asmt.submissions || []), submission]
                    };
                }
                return asmt;
            });

            setAssignments(updatedAssignments);
            saveAssignments(updatedAssignments);

            alert("Assignment submitted successfully!");
            e.target.reset();
        } catch (error) {
            console.error("Error submitting assignment:", error);
            alert("Failed to submit assignment");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assignments</h1>
                    <p className="mt-1 text-sm text-slate-500">Track and submit your coursework.</p>
                </div>
                {(user?.role === "teacher" || user?.role === "cr") && (
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${showCreateForm
                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                : 'btn-primary shadow-none'
                            }`}
                    >
                        {showCreateForm ? (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                Cancel
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                Create Assignment
                            </>
                        )}
                    </button>
                )}
            </div>

            {showCreateForm && (user?.role === "teacher" || user?.role === "cr") && (
                <div className="glass-panel p-6 sm:p-8 rounded-2xl animate-fade-in-up" style={{ animationDuration: '0.4s' }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">New Assignment</h2>
                    </div>

                    <form onSubmit={handleCreateAssignment} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="input-field shadow-none bg-slate-50"
                                    placeholder="e.g., Chapter 5 Physics Problems"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    rows={3}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="input-field shadow-none bg-slate-50 resize-y"
                                    placeholder="Provide detailed instructions..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Due Date</label>
                                <input
                                    type="date"
                                    required
                                    value={dueDate}
                                    onChange={e => setDueDate(e.target.value)}
                                    className="input-field shadow-none bg-slate-50 text-slate-600"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Attachment (Optional)</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <div className="space-y-1 text-center">
                                        <svg className="mx-auto h-8 w-8 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="flex text-sm text-slate-600 justify-center">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500 px-1">
                                                <span>Upload a file</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={e => setFile(e.target.files[0])} />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            {file ? file.name : 'PNG, JPG, PDF up to 10MB'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={uploading}
                                className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Publishing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                        Publish Assignment
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                {assignments.length === 0 ? (
                    <div className="col-span-full text-center py-20 glass-card rounded-2xl border-dashed border-2 border-slate-200 bg-white/40">
                        <div className="mx-auto h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="h-10 w-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No Assignments Yet</h3>
                        <p className="mt-2 text-slate-500">Check back later for new coursework.</p>
                    </div>
                ) : (
                    assignments.map(assignment => {
                        const isStudent = user?.role === "student";
                        const hasSubmitted = isStudent && assignment.submissions?.some(sub => sub.studentId === user.uid);

                        return (
                            <div key={assignment.id} className="glass-card flex flex-col rounded-2xl overflow-hidden relative group">
                                {/* Decorative top border based on status */}
                                <div className={`h-1.5 w-full ${hasSubmitted ? 'bg-accent-400' : 'bg-primary-500'}`}></div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-700 transition-colors line-clamp-2">{assignment.title}</h3>
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                                            ${hasSubmitted
                                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                                                : 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20'
                                            }
                                        `}>
                                            {hasSubmitted ? (
                                                <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> Done</>
                                            ) : (
                                                <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Due {new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-sm mb-6 flex-1 line-clamp-3">{assignment.description}</p>

                                    <div className="mt-auto border-t border-slate-100 pt-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                        <div className="flex flex-col">
                                            {assignment.fileUrl ? (
                                                <a
                                                    href={assignment.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors w-fit line-clamp-1 max-w-[200px]"
                                                    title={assignment.fileName}
                                                >
                                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                                    <span className="truncate">{assignment.fileName || "Attachment"}</span>
                                                </a>
                                            ) : (
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                                    No attachment
                                                </span>
                                            )}
                                            <span className="text-xs text-slate-400 mt-2 font-medium">By {assignment.createdByEmail?.split('@')[0]}</span>
                                        </div>

                                        {isStudent && !hasSubmitted && (
                                            <form onSubmit={(e) => handleStudentSubmit(assignment.id, e)} className="flex items-center gap-2 w-full sm:w-auto bg-slate-50 p-2 rounded-xl border border-slate-200">
                                                <div className="relative overflow-hidden w-full sm:w-32">
                                                    <input
                                                        type="file"
                                                        name="submissionFile"
                                                        required
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        title="Choose file to submit"
                                                    />
                                                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg py-1.5 px-2 pointer-events-none group-hover:bg-slate-50 transition-colors">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                                        Select File
                                                    </div>
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="shrink-0 bg-primary-600 text-white rounded-lg p-1.5 hover:bg-primary-700 transition shadow-sm hover:shadow active:scale-95"
                                                    title="Upload Submission"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                                </button>
                                            </form>
                                        )}
                                        {isStudent && hasSubmitted && (
                                            <div className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                Submitted
                                            </div>
                                        )}
                                        {/* Teacher view of submission count */}
                                        {(user?.role === "teacher" || user?.role === "cr") && (
                                            <div className="text-sm font-semibold text-primary-700 flex items-center gap-1.5 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                                {assignment.submissions?.length || 0} Submissions
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
