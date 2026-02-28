"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

// Smart AI responses based on keywords
function generateAIResponse(message, role) {
    const msg = message.toLowerCase();

    // Study help
    if (msg.includes("explain") || msg.includes("what is") || msg.includes("how does") || msg.includes("define")) {
        const topics = {
            "array": "An **array** is a collection of elements stored at contiguous memory locations. Key points:\n\n• Fixed size (in most languages)\n• O(1) access by index\n• O(n) insertion/deletion\n• Used for storing sequential data\n\n💡 **Tip:** Arrays are best when you know the size ahead of time and need fast random access.",
            "stack": "A **stack** is a LIFO (Last-In-First-Out) data structure.\n\n• **Push** — add to top: O(1)\n• **Pop** — remove from top: O(1)\n• **Peek** — view top: O(1)\n\n📚 **Real-world uses:** Undo operations, browser back button, function call stack.\n\n💡 **Tip:** Think of a stack of plates — you can only add/remove from the top!",
            "queue": "A **queue** is a FIFO (First-In-First-Out) data structure.\n\n• **Enqueue** — add to rear: O(1)\n• **Dequeue** — remove from front: O(1)\n\n📚 **Uses:** Task scheduling, BFS traversal, print spooling.\n\n💡 **Variations:** Priority Queue, Deque (double-ended), Circular Queue.",
            "linked list": "A **linked list** stores elements in nodes connected by pointers.\n\n• **Singly linked:** Each node points to next\n• **Doubly linked:** Points to both next & prev\n\n✅ O(1) insertion/deletion at known position\n❌ O(n) access (no random access)\n\n💡 **When to use:** When you need frequent insertions/deletions and don't need random access.",
            "binary tree": "A **binary tree** is a hierarchical data structure where each node has at most 2 children.\n\n• **BST (Binary Search Tree):** Left < Root < Right\n• **Balanced BST:** Height = O(log n)\n• **Types:** AVL, Red-Black, B-trees\n\n📚 **Traversals:** Inorder, Preorder, Postorder, Level-order\n\n💡 **Tip:** BSTs are excellent for searching and sorting!",
            "sorting": "Common **sorting algorithms** compared:\n\n| Algorithm | Best | Average | Worst | Stable |\n|-----------|------|---------|-------|--------|\n| Bubble | O(n) | O(n²) | O(n²) | ✅ |\n| Merge | O(n log n) | O(n log n) | O(n log n) | ✅ |\n| Quick | O(n log n) | O(n log n) | O(n²) | ❌ |\n| Heap | O(n log n) | O(n log n) | O(n log n) | ❌ |\n\n💡 **Tip:** Use Merge Sort when stability matters, QuickSort for general purpose!",
            "css": "**CSS (Cascading Style Sheets)** styles HTML elements.\n\n• **Selectors:** class (.), id (#), element, attribute\n• **Box Model:** content → padding → border → margin\n• **Flexbox:** 1D layout (row/column)\n• **Grid:** 2D layout (rows + columns)\n\n💡 **Modern tips:** Use CSS variables, clamp() for responsive sizing, and `gap` instead of margins!",
            "react": "**React** is a JavaScript library for building UIs.\n\n• **Components:** Reusable UI building blocks\n• **JSX:** HTML-like syntax in JavaScript\n• **Hooks:** useState, useEffect, useContext, etc.\n• **Virtual DOM:** Efficient updates\n\n💡 **Key concepts:**\n1. Props flow down (parent → child)\n2. State triggers re-renders\n3. useEffect for side effects\n4. Keys for list rendering",
            "database": "**Database** fundamentals:\n\n• **SQL (Relational):** Tables, rows, columns. E.g., MySQL, PostgreSQL\n• **NoSQL:** Documents, key-value, graph. E.g., MongoDB, Firebase\n\n📚 **Key concepts:**\n• Normalization (1NF, 2NF, 3NF)\n• ACID properties\n• Indexing for performance\n• Joins (INNER, LEFT, RIGHT, FULL)\n\n💡 **Tip:** Use SQL for structured data with relationships, NoSQL for flexible schemas!",
        };

        for (const [key, response] of Object.entries(topics)) {
            if (msg.includes(key)) return response;
        }

        return "Great question! 🤔 Here's how I'd approach this:\n\n1. **Break it down** into smaller concepts\n2. **Look for patterns** and relationships\n3. **Practice with examples** to solidify understanding\n\nCould you be more specific about what topic you'd like explained? I can help with:\n• Data Structures (arrays, trees, graphs)\n• Algorithms (sorting, searching)\n• Web Development (HTML, CSS, JS, React)\n• Databases (SQL, NoSQL)\n• And more!";
    }

    // Study tips
    if (msg.includes("study") || msg.includes("tips") || msg.includes("improve") || msg.includes("marks") || msg.includes("grade")) {
        return "📈 **Smart Study Tips to Boost Your Grades:**\n\n1. **Active Recall** — Test yourself instead of re-reading\n2. **Spaced Repetition** — Review at increasing intervals\n3. **Pomodoro Technique** — 25 min focus + 5 min break\n4. **Teach Others** — If you can explain it, you understand it\n5. **Practice Problems** — Solve past papers and variations\n\n🎯 **Daily Routine:**\n• Morning: New concepts (brain is fresh)\n• Afternoon: Practice problems\n• Evening: Quick revision\n\n💡 **Pro tip:** Use the Quiz feature and Focus Timer in TasksPro to stay on track!";
    }

    // Motivation
    if (msg.includes("motivat") || msg.includes("stress") || msg.includes("anxious") || msg.includes("worried") || msg.includes("help me")) {
        return "💪 **You've got this!** Here's some perspective:\n\n• Every expert was once a beginner\n• Progress isn't always linear — small steps matter\n• Taking breaks is productive, not lazy\n• Asking for help is a sign of strength\n\n🧘 **Quick stress relief:**\n1. Take 5 deep breaths (4s in, 7s hold, 8s out)\n2. Write down 3 things going well\n3. Step outside for 5 minutes\n4. Talk to a friend or mentor\n\n📌 Remember: Your worth isn't defined by grades. Keep learning, stay curious! 🌟";
    }

    // Exam prep
    if (msg.includes("exam") || msg.includes("test") || msg.includes("prepare") || msg.includes("revision")) {
        return "📝 **Exam Preparation Strategy:**\n\n**1 Week Before:**\n• Make topic-wise summary sheets\n• Identify weak areas from quizzes\n• Practice past year questions\n\n**3 Days Before:**\n• Focus on weak topics only\n• Do timed mock tests\n• Review formula sheets\n\n**Night Before:**\n• Light revision only (no new topics!)\n• Prepare materials\n• Sleep 7-8 hours\n\n**Exam Day:**\n• Read all questions first\n• Start with confident questions\n• Manage time per question\n\n💡 **Use TasksPro Quizzes** to simulate exam conditions!";
    }

    // Teacher-specific
    if (role === "teacher" || role === "cr") {
        if (msg.includes("quiz") || msg.includes("question")) {
            return "🎓 **Quiz Creation Tips:**\n\n1. Mix difficulty levels (40% easy, 40% medium, 20% hard)\n2. Write clear, unambiguous questions\n3. Make wrong options plausible (avoid obvious fillers)\n4. Add explanations for learning value\n5. Set appropriate time limits\n\n💡 **Pro tip:** Review which questions students struggle with — it reveals teaching gaps!";
        }
        if (msg.includes("engage") || msg.includes("participat")) {
            return "👥 **Student Engagement Strategies:**\n\n1. **Gamify learning** — Use the XP system and badges\n2. **Discussion prompts** — Post thought-provoking questions\n3. **Quick polls** in class\n4. **Recognize top contributors** publicly\n5. **Collaborative challenges** — Group quizzes\n\n📊 **Track engagement** using the attendance and quiz analytics!";
        }
    }

    // Default
    return "I'm your **TasksPro AI Study Assistant!** 🤖 I can help with:\n\n📚 **Subject Help** — \"Explain binary trees\" or \"What is CSS Grid?\"\n📈 **Study Tips** — \"How to improve my grades?\"\n📝 **Exam Prep** — \"How to prepare for exams?\"\n💪 **Motivation** — \"I'm feeling stressed\"\n🎓 **Teacher Tools** — \"Quiz creation tips\"\n\nJust type your question and I'll do my best to help! 💡";
}

export default function AIAssistantPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const stored = localStorage.getItem(`ai_chat_${user?.uid}`);
        if (stored) {
            try { setMessages(JSON.parse(stored)); } catch (e) { /* ignore */ }
        }
    }, [user]);

    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(`ai_chat_${user?.uid}`, JSON.stringify(messages));
        }
    }, [messages, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = { role: "user", content: input, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Simulate AI thinking delay
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

        const aiResponse = generateAIResponse(input, user?.role);
        const aiMsg = { role: "assistant", content: aiResponse, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
        inputRef.current?.focus();
    };

    const clearChat = () => {
        setMessages([]);
        localStorage.removeItem(`ai_chat_${user?.uid}`);
    };

    const quickPrompts = [
        "How to improve my grades?",
        "Explain binary trees",
        "Tips for exam preparation",
        "What is CSS Flexbox?",
    ];

    return (
        <div className="animate-fade-in-up flex flex-col h-[calc(100vh-120px)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                        <span className="text-lg">🤖</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-extrabold text-slate-900">AI Study Assistant</h1>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Online • Ready to help
                        </p>
                    </div>
                </div>
                {messages.length > 0 && (
                    <button onClick={clearChat} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50">
                        Clear Chat
                    </button>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto rounded-2xl bg-white border border-slate-100 p-4 space-y-4 mb-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-secondary-500/10 rounded-3xl flex items-center justify-center mb-4">
                            <span className="text-4xl">🧠</span>
                        </div>
                        <h2 className="text-xl font-extrabold text-slate-900 mb-2">Hi {user?.email?.split('@')[0]}! 👋</h2>
                        <p className="text-sm text-slate-500 max-w-md mb-6">I&apos;m your AI study assistant. Ask me anything about your subjects, study strategies, or exam preparation!</p>
                        <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                            {quickPrompts.map((prompt, i) => (
                                <button key={i} onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
                                    className="text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-2 rounded-xl transition-colors border border-primary-100">
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] sm:max-w-[75%] ${msg.role === 'user'
                                    ? 'bg-gradient-to-r from-primary-600 to-secondary-500 text-white rounded-2xl rounded-br-md px-4 py-3'
                                    : 'bg-slate-50 text-slate-800 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-100'
                                    }`}>
                                    {msg.role === 'assistant' && (
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <span className="text-xs">🤖</span>
                                            <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">AI Assistant</span>
                                        </div>
                                    )}
                                    <div className={`text-sm whitespace-pre-wrap leading-relaxed ${msg.role === 'user' ? 'text-white' : 'text-slate-700'}`}>
                                        {msg.content}
                                    </div>
                                    <p className={`text-[9px] mt-2 ${msg.role === 'user' ? 'text-white/50' : 'text-slate-400'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-slate-50 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-100">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs">🤖</span>
                                        <div className="flex gap-1">
                                            {[0, 1, 2].map(i => (
                                                <div key={i} className="w-2 h-2 rounded-full bg-slate-400" style={{ animation: 'pulse-soft 1.4s infinite', animationDelay: `${i * 0.2}s` }}></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="flex gap-3">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask anything... (e.g., &quot;Explain quicksort&quot;)"
                    className="input-field flex-1"
                    disabled={isTyping}
                />
                <button type="submit" disabled={!input.trim() || isTyping}
                    className="btn-primary px-5 flex items-center gap-2 disabled:opacity-50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
            </form>
        </div>
    );
}
