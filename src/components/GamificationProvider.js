"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

const GamificationContext = createContext({});
export const useGamification = () => useContext(GamificationContext);

const LEVELS = [
    { name: "Beginner", minXP: 0, color: "from-slate-400 to-slate-500", emoji: "🌱" },
    { name: "Learner", minXP: 100, color: "from-blue-400 to-blue-500", emoji: "📘" },
    { name: "Achiever", minXP: 300, color: "from-emerald-400 to-emerald-500", emoji: "⭐" },
    { name: "Scholar", minXP: 600, color: "from-purple-400 to-purple-500", emoji: "🎓" },
    { name: "Master", minXP: 1000, color: "from-amber-400 to-amber-500", emoji: "🏆" },
    { name: "Legend", minXP: 2000, color: "from-rose-400 to-rose-500", emoji: "👑" },
];

const BADGE_DEFS = [
    { id: "first_login", name: "First Steps", desc: "Logged into TasksPro", icon: "🚀", auto: true },
    { id: "first_quiz", name: "Quiz Taker", desc: "Completed your first quiz", icon: "📝" },
    { id: "quiz_ace", name: "Quiz Ace", desc: "Scored 100% on a quiz", icon: "💯" },
    { id: "streak_3", name: "On Fire", desc: "3-day study streak", icon: "🔥" },
    { id: "streak_7", name: "Unstoppable", desc: "7-day study streak", icon: "⚡" },
    { id: "streak_30", name: "Legendary Streak", desc: "30-day study streak", icon: "💎" },
    { id: "focus_60", name: "Deep Focus", desc: "60 minutes of focused study", icon: "🧠" },
    { id: "focus_300", name: "Focus Master", desc: "300 minutes total focus", icon: "🎯" },
    { id: "contributor", name: "Top Contributor", desc: "Helped 10 peers in discussions", icon: "🤝" },
    { id: "note_taker", name: "Note Expert", desc: "Created 20 notes", icon: "📒" },
    { id: "assignment_5", name: "Diligent", desc: "Submitted 5 assignments", icon: "📋" },
    { id: "semester_champ", name: "Semester Champion", desc: "Highest XP this semester", icon: "🏅" },
];

const XP_REWARDS = {
    completeAssignment: 25,
    completeQuiz: 30,
    quizPerfect: 50,
    postDiscussion: 10,
    helpfulAnswer: 15,
    dailyLogin: 5,
    focusSession: 10,
    createNote: 5,
    streakBonus: 20,
};

export const GamificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [xp, setXP] = useState(0);
    const [badges, setBadges] = useState([]);
    const [streak, setStreak] = useState(0);
    const [lastLoginDate, setLastLoginDate] = useState(null);
    const [xpHistory, setXPHistory] = useState([]);

    const storageKey = user ? `gamification_${user.uid}` : null;

    // Load from localStorage
    useEffect(() => {
        if (!storageKey) return;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                setXP(data.xp || 0);
                setBadges(data.badges || []);
                setStreak(data.streak || 0);
                setLastLoginDate(data.lastLoginDate || null);
                setXPHistory(data.xpHistory || []);
            } catch (e) { /* ignore */ }
        }
    }, [storageKey]);

    // Save to localStorage
    useEffect(() => {
        if (!storageKey) return;
        localStorage.setItem(storageKey, JSON.stringify({
            xp, badges, streak, lastLoginDate, xpHistory
        }));
    }, [xp, badges, streak, lastLoginDate, xpHistory, storageKey]);

    // Daily login streak
    useEffect(() => {
        if (!user) return;
        const today = new Date().toDateString();
        if (lastLoginDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastLoginDate === yesterday.toDateString()) {
            setStreak(prev => prev + 1);
        } else if (lastLoginDate !== today) {
            setStreak(1);
        }
        setLastLoginDate(today);
        addXP(XP_REWARDS.dailyLogin, "Daily Login");

        // Auto-award first login badge
        if (!badges.includes("first_login")) {
            awardBadge("first_login");
        }

        // Streak badges
        if (streak >= 3 && !badges.includes("streak_3")) awardBadge("streak_3");
        if (streak >= 7 && !badges.includes("streak_7")) awardBadge("streak_7");
        if (streak >= 30 && !badges.includes("streak_30")) awardBadge("streak_30");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const addXP = (amount, reason = "") => {
        setXP(prev => prev + amount);
        setXPHistory(prev => [{
            amount,
            reason,
            date: new Date().toISOString(),
        }, ...prev.slice(0, 49)]); // Keep last 50 entries
    };

    const awardBadge = (badgeId) => {
        if (badges.includes(badgeId)) return false;
        setBadges(prev => [...prev, badgeId]);
        addXP(20, `Badge unlocked: ${BADGE_DEFS.find(b => b.id === badgeId)?.name || badgeId}`);
        return true;
    };

    const getCurrentLevel = () => {
        let level = LEVELS[0];
        for (const l of LEVELS) {
            if (xp >= l.minXP) level = l;
        }
        return level;
    };

    const getNextLevel = () => {
        const currentIdx = LEVELS.findIndex(l => l.name === getCurrentLevel().name);
        return currentIdx < LEVELS.length - 1 ? LEVELS[currentIdx + 1] : null;
    };

    const getLevelProgress = () => {
        const current = getCurrentLevel();
        const next = getNextLevel();
        if (!next) return 100;
        const xpInLevel = xp - current.minXP;
        const xpNeeded = next.minXP - current.minXP;
        return Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
    };

    return (
        <GamificationContext.Provider value={{
            xp,
            badges,
            streak,
            xpHistory,
            addXP,
            awardBadge,
            getCurrentLevel,
            getNextLevel,
            getLevelProgress,
            LEVELS,
            BADGE_DEFS,
            XP_REWARDS,
        }}>
            {children}
        </GamificationContext.Provider>
    );
};
