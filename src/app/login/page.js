"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

// ─── CONSTANTS ───
const MOTIVATIONAL_MESSAGES = [
    "Let's crush some tasks today 💪",
    "Your next breakthrough is one session away 🚀",
    "Stay focused, stay brilliant ✨",
    "Small steps, big results 🎯",
    "Knowledge is your superpower 🧠",
    "Today's effort = tomorrow's success 🏆",
];

const FEATURES = [
    { icon: "📝", title: "Smart Quizzes", desc: "MCQs with auto-grading & analytics" },
    { icon: "💬", title: "Discussions", desc: "Doubt-clearing with upvotes & threads" },
    { icon: "🤖", title: "AI Assistant", desc: "24/7 study help on any topic" },
    { icon: "🎯", title: "Focus Timer", desc: "Pomodoro with productivity tracking" },
    { icon: "🏆", title: "Gamification", desc: "XP, badges, streaks & leaderboard" },
    { icon: "📊", title: "Insights", desc: "Grades, attendance & performance" },
];

const TESTIMONIALS = [
    { text: "TasksPro helped me improve my GPA from 6.8 to 8.2 in one semester!", name: "Priya Sharma", role: "CSE, 3rd Year", avatar: "P" },
    { text: "The AI assistant is like having a tutor available 24/7. Absolutely love it.", name: "Rahul Mehta", role: "IT, 2nd Year", avatar: "R" },
    { text: "Discussion forums made group study sessions so much more productive.", name: "Sneha Kulkarni", role: "ECE, 4th Year", avatar: "S" },
];

const ROLES = [
    { id: "student", label: "Student", icon: "🎓", desc: "Take quizzes, track progress, earn rewards" },
    { id: "teacher", label: "Teacher", icon: "👨‍🏫", desc: "Create quizzes, manage students & grades" },
    { id: "cr", label: "CR / SRC", icon: "📋", desc: "Moderate, announce, manage class activities" },
];

// ─── FLOATING PARTICLES COMPONENT ───
function FloatingParticles({ dark }) {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 18 }).map((_, i) => (
                <div
                    key={i}
                    className={`absolute w-1 h-1 rounded-full ${dark ? 'bg-white/20' : 'bg-primary-500/15'}`}
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animation: `particle-float ${6 + Math.random() * 8}s ease-in-out infinite`,
                        animationDelay: `${Math.random() * 5}s`,
                        '--tx': `${-30 + Math.random() * 60}px`,
                        '--ty': `${-60 + Math.random() * 40}px`,
                    }}
                />
            ))}
        </div>
    );
}

// ─── MAIN COMPONENT ───
export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("student");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const [focusedField, setFocusedField] = useState(null);
    const [touched, setTouched] = useState({});
    const [success, setSuccess] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [motivMsg, setMotivMsg] = useState("");
    const [savedEmail, setSavedEmail] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { user, loading: authLoading, login } = useAuth();
    const router = useRouter();
    const emailRef = useRef(null);

    // Auto redirect if logged in (#15)
    useEffect(() => {
        if (!authLoading && user) {
            router.push("/dashboard");
        }
    }, [user, authLoading, router]);

    // Mount animation + remembered email (#9)
    useEffect(() => {
        setMounted(true);
        setMotivMsg(MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]);
        const saved = localStorage.getItem("taskspro_remembered_email");
        if (saved) {
            setSavedEmail(saved);
            setEmail(saved);
            setRememberMe(true);
        }
    }, []);

    // Auto-rotate testimonials
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTestimonial(prev => (prev + 1) % TESTIMONIALS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Validation helpers (#14 smart errors)
    const getFieldError = (field) => {
        if (!touched[field]) return null;
        if (field === "name" && !name) return "We'd love to know your name 🙂";
        if (field === "email") {
            if (!email) return "We need your email to continue";
            if (!email.includes("@") || !email.includes(".")) return "Hmm… that doesn't look like a valid email";
        }
        if (field === "password") {
            if (!password) return "Please create a password to secure your account";
            if (password.length < 6) return "A bit short — try at least 6 characters";
        }
        return null;
    };

    const getFieldStatus = (field) => {
        if (!touched[field]) return "idle";
        if (getFieldError(field)) return "error";
        return "valid";
    };

    const passwordStrength = () => {
        if (!password) return 0;
        let s = 0;
        if (password.length >= 6) s++;
        if (password.length >= 8) s++;
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;
        return Math.min(s, 4);
    };

    const strengthLabels = ["", "❌ Weak", "⚠️ Fair", "✅ Good", "🛡️ Very strong"];
    const strengthColors = ["", "bg-red-400", "bg-amber-400", "bg-emerald-400", "bg-emerald-500"];

    const handleBlur = (field) => {
        setFocusedField(null);
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    // Auth handler
    const handleAuth = useCallback(async (e) => {
        e.preventDefault();
        setTouched({ email: true, password: true, name: !isLogin });
        const errors = [getFieldError("email"), getFieldError("password")];
        if (!isLogin) errors.push(getFieldError("name"));
        const firstError = errors.find(Boolean);
        if (firstError) { setError(firstError); return; }

        setLoading(true);
        setError("");
        try {
            setSuccess(true);
            if (rememberMe) localStorage.setItem("taskspro_remembered_email", email);
            else localStorage.removeItem("taskspro_remembered_email");

            await new Promise(r => setTimeout(r, 1000));
            const uid = Math.random().toString(36).substring(2, 15);
            login({ uid, email, name: name || email.split('@')[0], role });
            router.push("/dashboard");
        } catch (err) {
            setSuccess(false);
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email, password, name, role, isLogin, rememberMe]);

    const handleGoogleSignIn = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setSuccess(true);
            await new Promise(r => setTimeout(r, 800));
            const uid = "google_" + Math.random().toString(36).substring(2, 10);
            login({ uid, email: email || "demo.user@gmail.com", name: name || "Demo User", role });
            router.push("/dashboard");
        } catch (err) {
            setSuccess(false);
            setError(err.message || "Google sign in failed. Please try again.");
        } finally { setLoading(false); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email, name, role]);

    // Input ring class helper
    const ringClass = (field) => {
        const s = getFieldStatus(field);
        if (focusedField === field) return "ring-2 ring-primary-500/40";
        if (s === "valid") return "ring-1 ring-emerald-300";
        if (s === "error") return "ring-1 ring-red-300";
        return "";
    };

    // If still checking auth, show nothing
    if (authLoading) return null;
    // If already logged in, don't render login
    if (user) return null;

    const dm = darkMode;

    return (
        <div className={`flex min-h-screen transition-colors duration-500 ${dm ? 'bg-slate-950' : ''}`}
            style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease-out' }}>

            {/* ═══════ LEFT PANEL: SHOWCASE (Desktop) ═══════ */}
            <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-10 xl:p-12"
                style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 80%, #6366f1 100%)' }}>

                <FloatingParticles dark={true} />

                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }}></div>

                {/* Gradient orbs */}
                <div className="absolute top-[10%] right-[10%] w-72 h-72 rounded-full bg-indigo-400/10 blur-3xl animate-blob"></div>
                <div className="absolute bottom-[20%] left-[5%] w-80 h-80 rounded-full bg-violet-500/10 blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute top-[60%] right-[30%] w-64 h-64 rounded-full bg-cyan-400/5 blur-3xl animate-blob animation-delay-4000"></div>

                {/* Floating academic icons */}
                {["📚", "🔬", "💡", "⚡", "🎓", "📐"].map((emoji, i) => (
                    <div key={i} className="absolute text-2xl opacity-[0.08] animate-float"
                        style={{
                            top: `${10 + (i * 15) % 80}%`, left: `${5 + (i * 23) % 85}%`,
                            animationDuration: `${5 + i * 1.2}s`, animationDelay: `${i * 0.8}s`
                        }}>{emoji}</div>
                ))}

                <div className="relative z-10 flex flex-col h-full">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center shadow-xl">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold text-white tracking-tight">TasksPro</h2>
                            <p className="text-[8px] font-semibold text-indigo-300/60 uppercase tracking-[0.3em]">Academic Platform</p>
                        </div>
                    </div>

                    {/* Hero */}
                    <div className="my-auto py-8">
                        <h1 className="text-3xl xl:text-[2.6rem] font-extrabold text-white leading-[1.15] mb-3 tracking-tight">
                            Your academic<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-300">success starts here.</span>
                        </h1>
                        <p className="text-sm text-indigo-200/50 max-w-md leading-relaxed mb-8">
                            Join thousands of students and teachers using TasksPro to boost grades, increase focus, and collaborate better.
                        </p>

                        {/* Stats ribbon */}
                        <div className="flex items-center gap-6 mb-8">
                            {[["10K+", "Students"], ["500+", "Quizzes"], ["4.9★", "Rating"]].map(([val, label], i) => (
                                <div key={i} className="text-center">
                                    <p className="text-xl font-extrabold text-white">{val}</p>
                                    <p className="text-[10px] font-bold text-indigo-300/40 uppercase tracking-wider">{label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Feature grid */}
                        <div className="grid grid-cols-2 gap-2">
                            {FEATURES.map((f, i) => (
                                <div key={i} className="group flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300 cursor-default">
                                    <span className="text-base mt-0.5 group-hover:scale-125 group-hover:rotate-6 transition-transform duration-300">{f.icon}</span>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-bold text-white/90 leading-tight">{f.title}</p>
                                        <p className="text-[9px] text-indigo-300/40 leading-snug mt-0.5">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Testimonial */}
                    <div className="mt-auto">
                        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 backdrop-blur-sm hover:bg-white/[0.06] transition-all duration-500">
                            <div className="flex items-center gap-0.5 mb-2">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <svg key={s} className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                ))}
                            </div>
                            <p className="text-[13px] text-white/60 italic leading-relaxed mb-3">&ldquo;{TESTIMONIALS[activeTestimonial].text}&rdquo;</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-[10px] font-bold text-white">{TESTIMONIALS[activeTestimonial].avatar}</div>
                                    <div>
                                        <p className="text-[11px] font-bold text-white/80">{TESTIMONIALS[activeTestimonial].name}</p>
                                        <p className="text-[9px] text-indigo-300/50">{TESTIMONIALS[activeTestimonial].role}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1.5">
                                    {TESTIMONIALS.map((_, i) => (
                                        <button key={i} onClick={() => setActiveTestimonial(i)}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${i === activeTestimonial ? 'bg-white/60 w-5' : 'bg-white/15 w-1.5 hover:bg-white/30'}`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════ RIGHT PANEL: AUTH FORM ═══════ */}
            <div className={`flex-1 flex items-center justify-center p-5 sm:p-8 relative overflow-hidden transition-colors duration-500 ${dm ? 'bg-slate-900' : 'bg-slate-50'}`}>

                <FloatingParticles dark={dm} />

                {/* Mobile background orbs */}
                <div className={`lg:hidden absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full blur-3xl animate-blob ${dm ? 'bg-indigo-500/10' : 'bg-primary-300/20'}`}></div>
                <div className={`lg:hidden absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full blur-3xl animate-blob animation-delay-2000 ${dm ? 'bg-violet-500/10' : 'bg-secondary-500/15'}`}></div>

                {/* Dark Mode Toggle (#11) */}
                <button onClick={() => setDarkMode(!dm)} className={`absolute top-4 right-4 z-20 p-2.5 rounded-xl border transition-all duration-300 group hover:scale-105 active:scale-95 ${dm ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm'}`}>
                    {dm ? (
                        <svg className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"></path></svg>
                    ) : (
                        <svg className="w-4 h-4 group-hover:-rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
                    )}
                </button>

                <div className="w-full max-w-[400px] relative z-10">
                    {/* Mobile brand */}
                    <div className="lg:hidden flex items-center justify-center gap-2.5 mb-6">
                        <div className="h-9 w-9 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-extrabold gradient-text tracking-tight">TasksPro</h2>
                    </div>

                    {/* ──── GLASSMORPHISM CARD (#17) ──── */}
                    <div className={`rounded-3xl p-6 sm:p-7 transition-all duration-500 ${dm ? 'bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/20' : 'bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50'}`}>

                        {/* Success overlay */}
                        {success && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm animate-fade-in-up">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center animate-count-up">
                                        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">Signing you in...</p>
                                </div>
                            </div>
                        )}

                        {/* Header with personalization (#18, #12) */}
                        <div className="text-center mb-5">
                            <h2 className={`text-[1.5rem] font-extrabold tracking-tight mb-1 ${dm ? 'text-white' : 'text-slate-900'}`}>
                                {isLogin
                                    ? (savedEmail ? `Welcome back, ${savedEmail.split('@')[0]}! 👋` : "Welcome back! 👋")
                                    : "Join TasksPro 🚀"
                                }
                            </h2>
                            <p className={`text-[13px] ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                                {isLogin ? "Sign in to continue your learning journey" : "Create your account and start achieving more"}
                            </p>
                            {/* Motivational message (#12) */}
                            <p className="text-[11px] font-medium text-primary-500 mt-1.5 animate-pulse-soft">{motivMsg}</p>
                        </div>

                        {/* Saved account indicator (#9) */}
                        {isLogin && savedEmail && (
                            <div className={`flex items-center gap-2 p-2.5 rounded-xl mb-4 text-[11px] font-medium animate-slide-down ${dm ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' : 'bg-primary-50 text-primary-700 border border-primary-100'}`}>
                                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                Saved account: {savedEmail}
                                <button onClick={() => { setSavedEmail(""); setEmail(""); localStorage.removeItem("taskspro_remembered_email"); }}
                                    className="ml-auto text-[10px] opacity-60 hover:opacity-100 transition-opacity">Remove</button>
                            </div>
                        )}

                        {/* Error (#14 smart messages) */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-[12px] mb-4 flex items-center gap-2 animate-slide-down font-medium">
                                <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                </div>
                                {error}
                            </div>
                        )}

                        {/* Tab Toggle (#3 animated slider) */}
                        <div className={`flex rounded-xl p-1 mb-5 relative ${dm ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg shadow-sm transition-all duration-300 ease-out ${dm ? 'bg-slate-600' : 'bg-white'} ${isLogin ? 'left-1' : 'left-[calc(50%+3px)]'}`}></div>
                            <button onClick={() => { setIsLogin(true); setError(""); setTouched({}); }} className={`flex-1 relative z-10 py-2 text-[13px] font-bold rounded-lg transition-all duration-200 ${isLogin ? (dm ? 'text-white' : 'text-primary-700') : (dm ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}>Sign In</button>
                            <button onClick={() => { setIsLogin(false); setError(""); setTouched({}); }} className={`flex-1 relative z-10 py-2 text-[13px] font-bold rounded-lg transition-all duration-200 ${!isLogin ? (dm ? 'text-white' : 'text-primary-700') : (dm ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}>Sign Up</button>
                        </div>

                        <form className="space-y-3.5" onSubmit={handleAuth}>
                            {/* Name (signup) */}
                            {!isLogin && (
                                <div className="animate-slide-down">
                                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ml-0.5 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Full Name</label>
                                    <div className={`relative rounded-xl transition-all duration-200 ${ringClass('name')}`}>
                                        <svg className={`w-[16px] h-[16px] absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === 'name' ? 'text-primary-500' : dm ? 'text-slate-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                        <input type="text" value={name} onChange={e => setName(e.target.value)} onFocus={() => setFocusedField('name')} onBlur={() => handleBlur('name')}
                                            className={`w-full rounded-xl border-0 py-3 pl-10 pr-10 text-[13px] ring-1 ring-inset placeholder:text-slate-400 focus:ring-0 transition-all duration-200 ${dm ? 'bg-slate-700/50 text-white ring-slate-600 focus:bg-slate-700' : 'bg-slate-50/80 text-slate-800 ring-slate-200 focus:bg-white'}`}
                                            placeholder="Enter your full name" />
                                        {getFieldStatus('name') === 'valid' && <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 animate-count-up" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>}
                                    </div>
                                    {getFieldError('name') && <p className="text-[10px] text-red-400 mt-0.5 ml-1 animate-slide-down">{getFieldError('name')}</p>}
                                </div>
                            )}

                            {/* Email */}
                            <div>
                                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ml-0.5 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Email Address</label>
                                <div className={`relative rounded-xl transition-all duration-200 ${ringClass('email')}`}>
                                    <svg className={`w-[16px] h-[16px] absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === 'email' ? 'text-primary-500' : dm ? 'text-slate-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
                                    <input ref={emailRef} type="email" value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFocusedField('email')} onBlur={() => handleBlur('email')}
                                        className={`w-full rounded-xl border-0 py-3 pl-10 pr-10 text-[13px] ring-1 ring-inset placeholder:text-slate-400 focus:ring-0 transition-all duration-200 ${dm ? 'bg-slate-700/50 text-white ring-slate-600 focus:bg-slate-700' : 'bg-slate-50/80 text-slate-800 ring-slate-200 focus:bg-white'}`}
                                        placeholder="you@college.edu" required />
                                    {getFieldStatus('email') === 'valid' && <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 animate-count-up" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>}
                                    {getFieldStatus('email') === 'error' && <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-red-400 animate-count-up" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>}
                                </div>
                                {getFieldError('email') && <p className="text-[10px] text-red-400 mt-0.5 ml-1 animate-slide-down">{getFieldError('email')}</p>}
                            </div>

                            {/* Password  */}
                            <div>
                                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ml-0.5 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Password</label>
                                <div className={`relative rounded-xl transition-all duration-200 ${ringClass('password')}`}>
                                    <svg className={`w-[16px] h-[16px] absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === 'password' ? 'text-primary-500' : dm ? 'text-slate-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setFocusedField('password')} onBlur={() => handleBlur('password')}
                                        className={`w-full rounded-xl border-0 py-3 pl-10 pr-20 text-[13px] ring-1 ring-inset placeholder:text-slate-400 focus:ring-0 transition-all duration-200 ${dm ? 'bg-slate-700/50 text-white ring-slate-600 focus:bg-slate-700' : 'bg-slate-50/80 text-slate-800 ring-slate-200 focus:bg-white'}`}
                                        placeholder="Min. 6 characters" required />
                                    {/* Show/Hide text + icon (#7) */}
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className={`absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-1 rounded-lg text-[10px] font-bold transition-all duration-200 ${dm ? 'text-slate-400 hover:text-indigo-400 hover:bg-slate-600' : 'text-slate-400 hover:text-primary-600 hover:bg-slate-100'}`}>
                                        {showPassword ? (
                                            <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>Hide</>
                                        ) : (
                                            <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>Show</>
                                        )}
                                    </button>
                                </div>
                                {getFieldError('password') && <p className="text-[10px] text-red-400 mt-0.5 ml-1 animate-slide-down">{getFieldError('password')}</p>}

                                {/* Password strength indicator (#4) */}
                                {password.length > 0 && (
                                    <div className="mt-1.5 animate-slide-down">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${passwordStrength() >= i ? strengthColors[passwordStrength()] : dm ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                                            ))}
                                        </div>
                                        <p className={`text-[10px] mt-0.5 ml-0.5 font-medium ${passwordStrength() >= 3 ? 'text-emerald-500' : passwordStrength() >= 2 ? 'text-amber-500' : 'text-red-400'}`}>{strengthLabels[passwordStrength()]}</p>
                                    </div>
                                )}
                            </div>

                            {/* Role selector - signup (#20) */}
                            {!isLogin && (
                                <div className="animate-slide-down">
                                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-0.5 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>I am a...</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {ROLES.map(r => (
                                            <button key={r.id} type="button" onClick={() => setRole(r.id)}
                                                className={`group flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all duration-200 ${role === r.id
                                                        ? 'border-primary-500 bg-primary-50 shadow-sm shadow-primary-100 scale-[1.03]'
                                                        : dm ? 'border-slate-600 bg-slate-700/30 hover:border-indigo-400/50 text-slate-300' : 'border-slate-200 bg-white hover:border-primary-200 hover:bg-slate-50'
                                                    }`}>
                                                <span className={`text-lg transition-transform duration-200 ${role === r.id ? 'scale-110' : 'group-hover:scale-110'}`}>{r.icon}</span>
                                                <span className={`text-[10px] font-bold ${role === r.id ? 'text-primary-700' : dm ? 'text-slate-300' : 'text-slate-600'}`}>{r.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <p className={`text-[9px] mt-1 text-center transition-all ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{ROLES.find(r => r.id === role)?.desc}</p>
                                </div>
                            )}

                            {/* Remember + forgot */}
                            {isLogin && (
                                <div className="flex items-center justify-between text-[11px] py-0.5">
                                    <label className="flex items-center gap-2 cursor-pointer select-none group">
                                        <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                                            className="w-3.5 h-3.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 accent-primary-500 cursor-pointer" />
                                        <span className={`font-medium group-hover:text-primary-600 transition-colors ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Remember me</span>
                                    </label>
                                    <button type="button" className="font-bold text-primary-500 hover:text-primary-700 transition-colors hover:underline underline-offset-2">Forgot password?</button>
                                </div>
                            )}

                            {/* Animated gradient submit button (#6, #19) */}
                            <button type="submit" disabled={loading}
                                className="w-full flex justify-center items-center gap-2 py-3 px-6 rounded-xl font-bold text-[13px] text-white transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none animate-gradient-shift hover:animate-glow-pulse !mt-4"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #6366f1, #4f46e5)', backgroundSize: '200% 200%' }}>
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Signing you in...
                                    </>
                                ) : isLogin ? (
                                    <>Sign In <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></>
                                ) : (
                                    <>Create Account <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg></>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center"><div className={`w-full border-t ${dm ? 'border-slate-700' : 'border-slate-200'}`}></div></div>
                            <div className="relative flex justify-center">
                                <span className={`px-3 text-[9px] font-bold uppercase tracking-widest ${dm ? 'bg-slate-800/60 text-slate-500' : 'bg-white/70 text-slate-400'}`}>Or continue with</span>
                            </div>
                        </div>

                        {/* Social buttons (#8) */}
                        <div className="grid grid-cols-2 gap-2.5">
                            <button onClick={handleGoogleSignIn} disabled={loading}
                                className={`group flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-[12px] font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${dm ? 'bg-slate-700/40 border-slate-600 text-slate-300 hover:bg-slate-700 hover:shadow-lg hover:shadow-black/20' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:shadow-lg hover:shadow-slate-200/50'}`}>
                                <svg className="h-4 w-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>
                            <button disabled={loading}
                                className={`group flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-[12px] font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${dm ? 'bg-slate-700/40 border-slate-600 text-slate-300 hover:bg-slate-700 hover:shadow-lg hover:shadow-black/20' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:shadow-lg hover:shadow-slate-200/50'}`}>
                                <svg className="h-4 w-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z"></path></svg>
                                Facebook
                            </button>
                        </div>

                        {/* Security trust indicators (#13) */}
                        <div className="flex items-center justify-center gap-4 mt-4 py-2">
                            {[
                                { icon: "🔒", text: "Secure login" },
                                { icon: "🛡️", text: "Data encrypted" },
                                { icon: "✅", text: "Privacy first" },
                            ].map((item, i) => (
                                <div key={i} className={`flex items-center gap-1 text-[9px] font-medium ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
                                    <span className="text-[10px]">{item.icon}</span>
                                    {item.text}
                                </div>
                            ))}
                        </div>

                    </div>{/* end glassmorphism card */}

                    {/* Toggle + footer */}
                    <p className={`mt-5 text-center text-[12px] ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                        {isLogin ? "New to TasksPro? " : "Already have an account? "}
                        <button onClick={() => { setIsLogin(!isLogin); setError(""); setTouched({}); }}
                            className="font-bold text-primary-500 hover:text-primary-700 transition-colors hover:underline underline-offset-2">
                            {isLogin ? "Create an account" : "Sign in instead"}
                        </button>
                    </p>

                    <p className={`mt-3 text-center text-[9px] leading-relaxed ${dm ? 'text-slate-600' : 'text-slate-400'}`}>
                        By continuing, you agree to TasksPro&apos;s{" "}
                        <button className="text-primary-500 hover:text-primary-700 font-medium transition-colors">Terms</button>
                        {" and "}
                        <button className="text-primary-500 hover:text-primary-700 font-medium transition-colors">Privacy Policy</button>
                    </p>
                </div>
            </div>
        </div>
    );
}
