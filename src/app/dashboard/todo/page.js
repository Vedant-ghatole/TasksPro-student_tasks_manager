"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function TodoPage() {
    const { user } = useAuth();
    const [todos, setTodos] = useState([]);
    const [activeTab, setActiveTab] = useState("academic");

    // Form state
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState("medium");
    const [dueDate, setDueDate] = useState("");

    // Load from localStorage
    useEffect(() => {
        if (!user) return;
        const stored = localStorage.getItem(`todos_${user.uid}`);
        if (stored) {
            try { setTodos(JSON.parse(stored)); } catch (e) { /* ignore */ }
        }
    }, [user]);

    // Save to localStorage
    useEffect(() => {
        if (user) {
            localStorage.setItem(`todos_${user.uid}`, JSON.stringify(todos));
        }
    }, [todos, user]);

    const handleAddTodo = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        const newTodo = {
            id: Date.now().toString(),
            title,
            type: activeTab,
            priority,
            dueDate: dueDate || null,
            completed: false,
            createdAt: new Date().toISOString()
        };
        setTodos(prev => [newTodo, ...prev]);
        setTitle("");
        setDueDate("");
        setPriority("medium");
    };

    const toggleTodo = (id) => {
        setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTodo = (id) => {
        setTodos(prev => prev.filter(t => t.id !== id));
    };

    const filteredTodos = todos.filter(t => t.type === activeTab);
    const completedCount = filteredTodos.filter(t => t.completed).length;
    const totalCount = filteredTodos.length;

    const tabs = [
        { id: "academic", label: "Academic", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
        { id: "personal", label: "Personal", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    ];

    return (
        <div className="max-w-3xl mx-auto animate-fade-in-up space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900">To-Do Lists</h1>
                <p className="text-sm text-slate-500 mt-1">Stay organized with your tasks</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === tab.id
                                ? 'bg-white text-primary-700 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon}></path></svg>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Progress */}
            {totalCount > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Progress</span>
                        <span className="text-xs font-bold text-primary-600">{completedCount}/{totalCount} completed</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Add Task Form */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <form onSubmit={handleAddTodo} className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="What needs to be done?"
                        className="input-field flex-1"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <input
                        type="date"
                        className="input-field sm:w-36"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                    <select
                        className="input-field sm:w-28 bg-white"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                    <button type="submit" className="btn-primary whitespace-nowrap">
                        Add Task
                    </button>
                </form>
            </div>

            {/* Task List */}
            <ul className="space-y-2">
                {filteredTodos.length === 0 ? (
                    <li className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                        <div className="mx-auto w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-3">
                            <svg className="w-7 h-7 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <p className="font-bold text-slate-800">All clear!</p>
                        <p className="text-sm text-slate-500 mt-0.5">No {activeTab} tasks yet.</p>
                    </li>
                ) : (
                    filteredTodos.map((todo) => (
                        <li key={todo.id} className={`flex items-center gap-4 p-4 bg-white rounded-xl border transition-all duration-200 group ${todo.completed ? 'opacity-60 border-slate-100' : 'border-slate-200 hover:shadow-sm hover:border-primary-100'}`}>
                            <button
                                onClick={() => toggleTodo(todo.id)}
                                className={`flex-shrink-0 h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${todo.completed
                                        ? 'bg-primary-600 border-primary-600'
                                        : 'border-slate-300 hover:border-primary-400'
                                    }`}
                            >
                                {todo.completed && (
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                )}
                            </button>
                            <div className={`flex-1 min-w-0 ${todo.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                <p className="font-semibold text-sm truncate">{todo.title}</p>
                                <div className="flex gap-2 text-[10px] mt-1 flex-wrap">
                                    {todo.dueDate && (
                                        <span className="text-slate-400 flex items-center gap-1 font-medium">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                            {todo.dueDate}
                                        </span>
                                    )}
                                    <span className={`px-1.5 py-0.5 rounded-md capitalize font-bold ${todo.priority === 'high' ? 'bg-red-50 text-red-600' :
                                            todo.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                                                'bg-green-50 text-green-600'
                                        }`}>
                                        {todo.priority}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => deleteTodo(todo.id)}
                                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all p-1.5 rounded-lg hover:bg-red-50"
                                aria-label="Delete task"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}
