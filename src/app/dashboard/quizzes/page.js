"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useGamification } from "@/components/GamificationProvider";

const SAMPLE_QUIZZES = [
    {
        id: "sample_1",
        title: "Data Structures Basics",
        subject: "DSA",
        difficulty: "easy",
        timeLimit: 300,
        createdBy: "system",
        createdByEmail: "admin@taskspro.com",
        questions: [
            { id: "q1", question: "What is the time complexity of searching in a hash table (average case)?", options: ["O(n)", "O(1)", "O(log n)", "O(n²)"], correct: 1, explanation: "Hash tables provide O(1) average-case lookup using hash functions." },
            { id: "q2", question: "Which data structure uses LIFO ordering?", options: ["Queue", "Array", "Stack", "Linked List"], correct: 2, explanation: "Stack follows Last-In-First-Out (LIFO) principle." },
            { id: "q3", question: "What is the worst case time complexity of QuickSort?", options: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"], correct: 2, explanation: "QuickSort degrades to O(n²) when the pivot is always the smallest/largest element." },
            { id: "q4", question: "Which traversal visits nodes in Left-Root-Right order?", options: ["Preorder", "Inorder", "Postorder", "Level order"], correct: 1, explanation: "Inorder traversal visits left subtree, then root, then right subtree." },
            { id: "q5", question: "A complete binary tree with n nodes has height:", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], correct: 1, explanation: "A complete binary tree has height O(log n) as each level doubles capacity." },
        ]
    },
    {
        id: "sample_2",
        title: "Web Development Fundamentals",
        subject: "Web Dev",
        difficulty: "medium",
        timeLimit: 420,
        createdBy: "system",
        createdByEmail: "admin@taskspro.com",
        questions: [
            { id: "w1", question: "Which HTTP method is idempotent?", options: ["POST", "GET", "PATCH", "None"], correct: 1, explanation: "GET requests are idempotent — calling them multiple times produces the same result." },
            { id: "w2", question: "What does CSS stand for?", options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"], correct: 1, explanation: "CSS = Cascading Style Sheets, used for styling web pages." },
            { id: "w3", question: "Which React hook manages side effects?", options: ["useState", "useEffect", "useRef", "useMemo"], correct: 1, explanation: "useEffect is designed for side effects like data fetching, subscriptions, etc." },
            { id: "w4", question: "What is the default position value in CSS?", options: ["relative", "absolute", "static", "fixed"], correct: 2, explanation: "The default CSS position is 'static' — elements flow normally." },
            { id: "w5", question: "Which status code means 'Not Found'?", options: ["200", "301", "404", "500"], correct: 2, explanation: "HTTP 404 indicates the requested resource was not found on the server." },
        ]
    },
];

export default function QuizzesPage() {
    const { user } = useAuth();
    const { addXP, awardBadge } = useGamification();
    const [quizzes, setQuizzes] = useState([]);
    const [results, setResults] = useState([]);
    const [view, setView] = useState("list"); // list | take | result | create
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef(null);

    // Create quiz form
    const [newTitle, setNewTitle] = useState("");
    const [newSubject, setNewSubject] = useState("");
    const [newDifficulty, setNewDifficulty] = useState("medium");
    const [newTimeLimit, setNewTimeLimit] = useState(300);
    const [newQuestions, setNewQuestions] = useState([{ question: "", options: ["", "", "", ""], correct: 0, explanation: "" }]);

    useEffect(() => {
        const stored = localStorage.getItem("taskspro_quizzes");
        const storedResults = localStorage.getItem("taskspro_quiz_results");
        try {
            const parsed = stored ? JSON.parse(stored) : [];
            setQuizzes([...SAMPLE_QUIZZES, ...parsed]);
        } catch (e) { setQuizzes(SAMPLE_QUIZZES); }
        try {
            setResults(storedResults ? JSON.parse(storedResults) : []);
        } catch (e) { /* ignore */ }
    }, []);

    useEffect(() => {
        const userQuizzes = quizzes.filter(q => q.createdBy !== "system");
        localStorage.setItem("taskspro_quizzes", JSON.stringify(userQuizzes));
    }, [quizzes]);

    useEffect(() => {
        localStorage.setItem("taskspro_quiz_results", JSON.stringify(results));
    }, [results]);

    // Timer
    useEffect(() => {
        if (view === "take" && timeLeft > 0) {
            timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearTimeout(timerRef.current);
        } else if (view === "take" && timeLeft === 0 && activeQuiz) {
            submitQuiz();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view, timeLeft]);

    const startQuiz = (quiz) => {
        setActiveQuiz(quiz);
        setCurrentQ(0);
        setAnswers({});
        setTimeLeft(quiz.timeLimit);
        setView("take");
    };

    const submitQuiz = useCallback(() => {
        if (!activeQuiz) return;
        clearTimeout(timerRef.current);

        let correct = 0;
        activeQuiz.questions.forEach((q, i) => {
            if (answers[i] === q.correct) correct++;
        });
        const score = Math.round((correct / activeQuiz.questions.length) * 100);
        const result = {
            id: Date.now().toString(),
            quizId: activeQuiz.id,
            quizTitle: activeQuiz.title,
            userId: user.uid,
            score,
            correct,
            total: activeQuiz.questions.length,
            answers,
            completedAt: new Date().toISOString(),
            timeTaken: activeQuiz.timeLimit - timeLeft,
        };
        setResults(prev => [result, ...prev]);

        // XP rewards
        addXP(30, `Completed quiz: ${activeQuiz.title}`);
        if (score === 100) {
            addXP(50, "Perfect quiz score!");
            awardBadge("quiz_ace");
        }
        if (!results.some(r => r.userId === user.uid)) {
            awardBadge("first_quiz");
        }

        setView("result");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeQuiz, answers, timeLeft, user, results]);

    const createQuiz = (e) => {
        e.preventDefault();
        if (!newTitle || newQuestions.some(q => !q.question || q.options.some(o => !o))) return;
        const quiz = {
            id: Date.now().toString(),
            title: newTitle,
            subject: newSubject || "General",
            difficulty: newDifficulty,
            timeLimit: newTimeLimit,
            createdBy: user.uid,
            createdByEmail: user.email,
            questions: newQuestions,
        };
        setQuizzes(prev => [...prev, quiz]);
        setView("list");
        setNewTitle(""); setNewSubject(""); setNewQuestions([{ question: "", options: ["", "", "", ""], correct: 0, explanation: "" }]);
    };

    const addQuestion = () => {
        setNewQuestions(prev => [...prev, { question: "", options: ["", "", "", ""], correct: 0, explanation: "" }]);
    };

    const updateQuestion = (idx, field, value) => {
        setNewQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
    };

    const updateOption = (qIdx, oIdx, value) => {
        setNewQuestions(prev => prev.map((q, i) => {
            if (i !== qIdx) return q;
            const opts = [...q.options];
            opts[oIdx] = value;
            return { ...q, options: opts };
        }));
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    const diffColors = { easy: "text-green-700 bg-green-50", medium: "text-amber-700 bg-amber-50", hard: "text-red-700 bg-red-50" };
    const myResults = results.filter(r => r.userId === user?.uid);

    // ─── RESULT VIEW ───
    if (view === "result" && activeQuiz) {
        const latest = results[0];
        return (
            <div className="animate-fade-in-up max-w-3xl mx-auto space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                    <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 text-3xl ${latest.score >= 80 ? 'bg-emerald-50' : latest.score >= 50 ? 'bg-amber-50' : 'bg-red-50'}`}>
                        {latest.score >= 80 ? '🎉' : latest.score >= 50 ? '👍' : '📚'}
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900">
                        {latest.score >= 80 ? 'Excellent!' : latest.score >= 50 ? 'Good Job!' : 'Keep Practicing!'}
                    </h2>
                    <p className="text-5xl font-extrabold gradient-text mt-2">{latest.score}%</p>
                    <p className="text-sm text-slate-500 mt-2">{latest.correct}/{latest.total} correct • {formatTime(latest.timeTaken)} taken</p>
                    <div className="flex justify-center gap-3 mt-6">
                        <button onClick={() => { setView("list"); setActiveQuiz(null); }} className="btn-secondary text-sm py-2 px-5">Back to Quizzes</button>
                        <button onClick={() => startQuiz(activeQuiz)} className="btn-primary text-sm py-2 px-5">Retry</button>
                    </div>
                </div>

                {/* Answer Review */}
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-500">Answer Review</h3>
                    {activeQuiz.questions.map((q, i) => {
                        const userAnswer = latest.answers[i];
                        const isCorrect = userAnswer === q.correct;
                        return (
                            <div key={i} className={`bg-white rounded-xl border p-5 ${isCorrect ? 'border-emerald-200' : 'border-red-200'}`}>
                                <div className="flex items-start gap-3">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {isCorrect ? '✓' : '✗'}
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-800 mb-2">{q.question}</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2">
                                            {q.options.map((opt, oi) => (
                                                <div key={oi} className={`text-xs px-3 py-1.5 rounded-lg border ${oi === q.correct ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold' : oi === userAnswer && !isCorrect ? 'bg-red-50 border-red-200 text-red-700 line-through' : 'border-slate-100 text-slate-600'}`}>
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                        {q.explanation && <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">💡 {q.explanation}</p>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // ─── QUIZ TAKING VIEW ───
    if (view === "take" && activeQuiz) {
        const q = activeQuiz.questions[currentQ];
        const progress = ((currentQ + 1) / activeQuiz.questions.length) * 100;
        return (
            <div className="animate-fade-in-up max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">{activeQuiz.title}</h2>
                        <p className="text-xs text-slate-500">Question {currentQ + 1} of {activeQuiz.questions.length}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${timeLeft < 60 ? 'bg-red-50 text-red-600 animate-pulse-soft' : 'bg-slate-100 text-slate-700'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Progress */}
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>

                {/* Question */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <p className="text-base font-bold text-slate-900 mb-6">{q.question}</p>
                    <div className="space-y-3">
                        {q.options.map((opt, oi) => (
                            <button
                                key={oi}
                                onClick={() => setAnswers(prev => ({ ...prev, [currentQ]: oi }))}
                                className={`w-full text-left p-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${answers[currentQ] === oi
                                        ? 'border-primary-500 bg-primary-50 text-primary-900 shadow-sm'
                                        : 'border-slate-100 hover:border-primary-200 hover:bg-slate-50 text-slate-700'
                                    }`}
                            >
                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg mr-3 text-xs font-bold ${answers[currentQ] === oi ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    {['A', 'B', 'C', 'D'][oi]}
                                </span>
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                    <button onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))} disabled={currentQ === 0}
                        className="btn-secondary text-sm py-2 px-5 disabled:opacity-40">
                        Previous
                    </button>
                    {currentQ < activeQuiz.questions.length - 1 ? (
                        <button onClick={() => setCurrentQ(prev => prev + 1)} className="btn-primary text-sm py-2 px-5">
                            Next
                        </button>
                    ) : (
                        <button onClick={submitQuiz} className="bg-emerald-600 text-white font-semibold text-sm py-2.5 px-6 rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 transition-all active:scale-95">
                            Submit Quiz
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // ─── CREATE QUIZ VIEW ───
    if (view === "create") {
        return (
            <div className="animate-fade-in-up max-w-3xl mx-auto space-y-6">
                <button onClick={() => setView("list")} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    Back
                </button>
                <h1 className="text-2xl font-extrabold text-slate-900">Create Quiz</h1>
                <form onSubmit={createQuiz} className="space-y-5">
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                        <input type="text" required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="input-field" placeholder="Quiz title" />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" value={newSubject} onChange={e => setNewSubject(e.target.value)} className="input-field" placeholder="Subject" />
                            <select value={newDifficulty} onChange={e => setNewDifficulty(e.target.value)} className="input-field bg-white">
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time Limit: {formatTime(newTimeLimit)}</label>
                            <input type="range" min={60} max={1800} step={60} value={newTimeLimit} onChange={e => setNewTimeLimit(Number(e.target.value))} className="w-full mt-1" />
                        </div>
                    </div>

                    {newQuestions.map((q, qi) => (
                        <div key={qi} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3">
                            <p className="text-xs font-bold text-slate-400">Question {qi + 1}</p>
                            <input type="text" required value={q.question} onChange={e => updateQuestion(qi, 'question', e.target.value)} className="input-field" placeholder="Question text" />
                            <div className="grid grid-cols-2 gap-2">
                                {q.options.map((opt, oi) => (
                                    <div key={oi} className="flex items-center gap-2">
                                        <button type="button" onClick={() => updateQuestion(qi, 'correct', oi)} className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${q.correct === oi ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                                            {q.correct === oi && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                        </button>
                                        <input type="text" required value={opt} onChange={e => updateOption(qi, oi, e.target.value)} className="input-field text-sm py-2" placeholder={`Option ${['A', 'B', 'C', 'D'][oi]}`} />
                                    </div>
                                ))}
                            </div>
                            <input type="text" value={q.explanation} onChange={e => updateQuestion(qi, 'explanation', e.target.value)} className="input-field text-sm" placeholder="Explanation (shown after answering)" />
                        </div>
                    ))}

                    <button type="button" onClick={addQuestion} className="btn-secondary w-full flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Add Question
                    </button>
                    <button type="submit" className="btn-primary w-full">Publish Quiz</button>
                </form>
            </div>
        );
    }

    // ─── LIST VIEW ───
    return (
        <div className="animate-fade-in-up space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Quizzes</h1>
                    <p className="text-sm text-slate-500 mt-1">Test your knowledge, earn XP</p>
                </div>
                {(user?.role === "teacher" || user?.role === "cr") && (
                    <button onClick={() => setView("create")} className="btn-primary flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Create Quiz
                    </button>
                )}
            </div>

            {/* Stats */}
            {myResults.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center">
                        <p className="text-2xl font-extrabold text-primary-600">{myResults.length}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attempts</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center">
                        <p className="text-2xl font-extrabold text-emerald-600">{Math.round(myResults.reduce((s, r) => s + r.score, 0) / myResults.length)}%</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Score</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center">
                        <p className="text-2xl font-extrabold text-amber-600">{Math.max(...myResults.map(r => r.score))}%</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Best Score</p>
                    </div>
                </div>
            )}

            {/* Quiz Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizzes.map(quiz => {
                    const best = myResults.filter(r => r.quizId === quiz.id).sort((a, b) => b.score - a.score)[0];
                    return (
                        <div key={quiz.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden card-hover group">
                            <div className={`h-1.5 bg-gradient-to-r ${quiz.difficulty === 'easy' ? 'from-green-400 to-green-500' : quiz.difficulty === 'medium' ? 'from-amber-400 to-amber-500' : 'from-red-400 to-red-500'}`}></div>
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${diffColors[quiz.difficulty]}`}>{quiz.difficulty}</span>
                                    <span className="text-[10px] font-bold text-slate-400">{quiz.subject}</span>
                                    <span className="text-[10px] text-slate-400">• {quiz.questions.length} Q</span>
                                </div>
                                <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors mb-1">{quiz.title}</h3>
                                <p className="text-xs text-slate-500 mb-4">⏱ {formatTime(quiz.timeLimit)} • By {quiz.createdByEmail?.split('@')[0]}</p>
                                <div className="flex items-center justify-between">
                                    {best && <span className="text-xs font-bold text-emerald-600">Best: {best.score}%</span>}
                                    <button onClick={() => startQuiz(quiz)} className="btn-primary text-xs py-2 px-4 ml-auto">
                                        {best ? 'Retry' : 'Start Quiz'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
