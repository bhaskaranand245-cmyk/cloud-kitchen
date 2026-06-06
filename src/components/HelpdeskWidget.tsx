import React, { useState, useEffect, useRef } from 'react';
import { MessageSquareCode, X, Send, Utensils, ShieldCheck, User, Sparkles, MessageSquare, Heart, AlertTriangle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'chef';
  text: string;
  time: string;
}

export default function HelpdeskWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [widgetTab, setWidgetTab] = useState<'chat' | 'feedback'>('chat');

  // Chat Sub-tab State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'chef',
      text: 'Namaste! 🙏 I am Chef Bhagwati’s Digital Kitchen Assistant. How can I assist you with your fresh meals or monthly tiffin subscriptions today?',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Global Feedback collection form State
  const [feedCategory, setFeedCategory] = useState<'Suggestion' | 'Complaint' | 'Feature Request' | 'General Feedback'>('Suggestion');
  const [feedPriority, setFeedPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [feedName, setFeedName] = useState('');
  const [feedEmail, setFeedEmail] = useState('');
  const [feedMessage, setFeedMessage] = useState('');
  const [feedSubmitting, setFeedSubmitting] = useState(false);
  const [feedSuccess, setFeedSuccess] = useState('');
  const [feedError, setFeedError] = useState('');

  // Math Captcha state for feedback anti-spam
  const [mathA, setMathA] = useState(4);
  const [mathB, setMathB] = useState(3);
  const [mathAns, setMathAns] = useState('');

  const predefinedPrompts = [
    { label: '📍 Free delivery query?', text: 'Are deliveries to Ramnagar free, and what sectors do you service?' },
    { label: '⏸️ Pause plan rules?', text: 'How do I pause my active monthly tiffin subscription if I travel?' },
    { label: '🌶️ Custom spicing adjustments?', text: 'Can I customize daily tiffins for low oil, zero ghee, or mild spices?' },
    { label: '🍲 What is Chef Special today?', text: 'What is the special thali recommendation from the kitchen today?' }
  ];

  const regenerateVerificationPuzzle = () => {
    setMathA(Math.floor(Math.random() * 7) + 2);
    setMathB(Math.floor(Math.random() * 8) + 1);
    setMathAns('');
  };

  useEffect(() => {
    regenerateVerificationPuzzle();
  }, [widgetTab, isOpen]);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, widgetTab]);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Dynamic response delay based on content
    setTimeout(() => {
      let responseText = "Dhanyawad (Thank you)! Storing your instructions. Our kitchen dispatch operators will confirm your preference shortly.";
      const cleanText = textToSend.toLowerCase();

      if (cleanText.includes('free') || cleanText.includes('delivery') || cleanText.includes('pincode') || cleanText.includes('ramnagar')) {
        responseText = "Absolutely! We service key areas around Ramnagar and Pune. Within our service buffer zones, subscription delivery is 100% free with premium thermal insulation boxes! No hidden daily charges! 📍";
      } else if (cleanText.includes('pause') || cleanText.includes('subscription') || cleanText.includes('monthly') || cleanText.includes('tiffin') || cleanText.includes('plan')) {
        responseText = "Yes! You can pause daily thali delivery schedules at any time. Simply use our order management dashboard or send a text 12 hours before cooking starts. All paused meals roll forward onto your wallet cycle safely! ⏸️";
      } else if (cleanText.includes('spice') || cleanText.includes('low-oil') || cleanText.includes('oil') || cleanText.includes('custom') || cleanText.includes('spicing')) {
        responseText = "With Chef Bhagwati, your dietary constraints are respected. During subscription setups, you can opt for mild spice, zero ghee bhakris, or low-oil dal prep in the checkout notes. Our kitchen keeps a separate non-spicy thali line! 🌶️";
      } else if (cleanText.includes('special') || cleanText.includes('recommend') || cleanText.includes('today')) {
        responseText = "Our thali of the day features home-grown Peshawari Paneer (in creamy almond whole masala curry), motherly hand-rolled Butter Rotis, slow-cooked Jeera Basmati Rice, and dynamic Moong Dal Halwa. Try ordering it! 🍲";
      }

      const chefMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'chef',
        text: responseText,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, chefMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedSuccess('');
    setFeedError('');

    // Pre-flight checks
    if (!feedName.trim()) {
      setFeedError('Please write your name.');
      return;
    }
    if (!feedEmail.trim() || !feedEmail.includes('@')) {
      setFeedError('Please supply a valid email address.');
      return;
    }
    if (!feedMessage.trim()) {
      setFeedError('Please express your suggestions or complaints text.');
      return;
    }

    const checkAnswer = mathA + mathB;
    if (parseInt(mathAns.trim(), 10) !== checkAnswer) {
      setFeedError(`Human check math proof is incorrect. ${mathA} + ${mathB} = ?`);
      return;
    }

    setFeedSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: feedName.trim(),
          email: feedEmail.trim(),
          category: feedCategory,
          priority: feedPriority,
          message: feedMessage.trim()
        })
      });

      if (res.ok) {
        setFeedSuccess('Thank you! Your suggestion has been securely stored in our cloud feedback repository and visible inside administration log.');
        setFeedName('');
        setFeedEmail('');
        setFeedMessage('');
        regenerateVerificationPuzzle();
      } else {
        const data = await res.json().catch(() => ({}));
        setFeedError(data.error || 'Failed to transmit feedback. Try again shortly.');
      }
    } catch (err) {
      setFeedError('Server communication fault occurred. Please submit again.');
    } finally {
      setFeedSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans pointer-events-none">
      <div className="flex flex-col items-end pointer-events-auto">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.92 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-80 sm:w-96 h-[510px] bg-white rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden flex flex-col mb-4 bg-gradient-to-b from-neutral-50/50 to-white"
            >
              {/* Header Box */}
              <div className="p-4 bg-[#800020] text-white flex items-center justify-between border-b border-[#600015]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-[#800020] flex items-center justify-center font-serif font-black shadow-xs shrink-0">
                    भ
                  </div>
                  <div className="text-left">
                    <span className="block text-[9px] font-black tracking-widest uppercase text-amber-300">Live Kitchen Hub</span>
                    <h4 className="text-[13px] font-extrabold flex items-center gap-1 leading-tight">
                      Chef Bhagwati Desk 
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </h4>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-xl transition cursor-pointer text-neutral-200 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sub-tab Navigation Switcher */}
              <div className="flex bg-neutral-100 p-1 border-b border-neutral-200 shadow-3xs shrink-0 select-none">
                <button
                  onClick={() => setWidgetTab('chat')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    widgetTab === 'chat'
                      ? 'bg-white text-[#800020] shadow-3xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  💬 AI Assistant Advisor
                </button>
                <button
                  onClick={() => setWidgetTab('feedback')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    widgetTab === 'feedback'
                      ? 'bg-white text-[#800020] shadow-3xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  ✍️ Submit Suggestions
                </button>
              </div>

              {/* TAB 1: LIVE CHAT ADVISOR */}
              {widgetTab === 'chat' && (
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-neutral-50/50">
                    {messages.map((m) => {
                      const isChef = m.sender === 'chef';
                      return (
                        <div key={m.id} className={`flex gap-2 max-w-[85%] ${isChef ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}>
                          {isChef && (
                            <div className="w-7 h-7 rounded-lg bg-[#800020]/15 text-[#800020] flex items-center justify-center font-serif font-black text-xs shrink-0 mt-0.5 border border-[#800020]/10">
                              भ
                            </div>
                          )}
                          <div>
                            <div className={`p-3 rounded-2xl text-xs leading-relaxed shadow-3xs ${
                              isChef 
                                ? 'bg-white border border-neutral-200 text-neutral-800 rounded-tl-none font-sans' 
                                : 'bg-orange-600 text-white rounded-tr-none font-semibold'
                            }`}>
                              {m.text}
                            </div>
                            <span className="text-[9px] text-neutral-400 font-medium mt-1 block px-1">
                              {m.time}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {isTyping && (
                      <div className="flex gap-2 max-w-[85%] mr-auto text-left">
                        <div className="w-7 h-7 rounded-lg bg-[#800020]/15 text-[#800020] flex items-center justify-center font-serif font-black text-xs shrink-0 border border-[#800020]/10">
                          भ
                        </div>
                        <div className="bg-white border border-neutral-200 shadow-3xs px-3.5 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Predefined prompts quick select rows */}
                  <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-150 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0 border-b">
                    {predefinedPrompts.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => handleSendMessage(p.text)}
                        className="px-2.5 py-1.5 bg-white hover:bg-amber-50 text-[10px] font-bold text-neutral-600 hover:text-orange-950 border border-neutral-250 rounded-full transition shrink-0 cursor-pointer shadow-3xs"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Typing input form footer selection */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage(inputText);
                    }}
                    className="p-3 border-t border-neutral-200 bg-white flex items-center gap-2 shrink-0"
                  >
                    <input
                      type="text"
                      placeholder="Ask kitchen assistant advisory..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-600 focus:bg-white"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="p-2 bg-[#800020] hover:bg-orange-600 text-white rounded-xl transition cursor-pointer disabled:opacity-40"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: GLOBAL CUSTOMER FEEDBACK SUBMIT FORM */}
              {widgetTab === 'feedback' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/20 text-left min-h-0">
                  <div className="text-left space-y-1">
                    <h5 className="font-extrabold text-[12px] text-neutral-800">Submit Your Concerns & Suggestions</h5>
                    <p className="text-[10px] text-neutral-400">Your direct insights help Chef Bhagwati maintain five-star culinary standards.</p>
                  </div>

                  <form onSubmit={handleFeedbackSubmit} className="space-y-3 text-xs">
                    {/* Category Selector row selection */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Feedback Category</label>
                        <select
                          value={feedCategory}
                          onChange={(e: any) => setFeedCategory(e.target.value)}
                          className="w-full text-[11px] bg-white border border-neutral-300 rounded-lg p-1.5 font-bold text-neutral-700"
                        >
                          <option value="Suggestion">💡 Suggestion</option>
                          <option value="Complaint">⚠️ Complaint</option>
                          <option value="Feature Request">✨ Feature Plan</option>
                          <option value="General Feedback">🍛 Kitchen Food</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Priority</label>
                        <select
                          value={feedPriority}
                          onChange={(e: any) => setFeedPriority(e.target.value)}
                          className="w-full text-[11px] bg-white border border-neutral-300 rounded-lg p-1.5 font-bold text-neutral-700"
                        >
                          <option value="Low">Low Priority</option>
                          <option value="Medium">Medium</option>
                          <option value="High">🚨 High</option>
                          <option value="Urgent">🔥 Urgent</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Your Name"
                          value={feedName}
                          onChange={(e) => setFeedName(e.target.value)}
                          className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-[11px] focus:ring-1 focus:ring-orange-650"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Email</label>
                        <input
                          type="email"
                          required
                          placeholder="Email address"
                          value={feedEmail}
                          onChange={(e) => setFeedEmail(e.target.value)}
                          className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-[11px] focus:ring-1 focus:ring-orange-650"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Message Detail</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="E.g., Can you introduce an all-wheat, high-protein thali variant for physical center athletes? Keep up the motherly taste!"
                        value={feedMessage}
                        onChange={(e) => setFeedMessage(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-orange-650 resize-none leading-normal"
                      />
                    </div>

                    {/* Captcha challenge */}
                    <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-neutral-600 bg-white border px-2 py-1 rounded">
                        Spam Check: What is {mathA} + {mathB}?
                      </span>
                      <input
                        type="number"
                        required
                        placeholder="Sum"
                        value={mathAns}
                        onChange={(e) => setMathAns(e.target.value)}
                        className="w-14 text-center border rounded font-extrabold focus:outline-none"
                      />
                    </div>

                    {/* Error labels display */}
                    {feedSuccess && (
                      <p className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-100 font-bold">
                        {feedSuccess}
                      </p>
                    )}
                    {feedError && (
                      <p className="text-[10px] text-red-700 bg-red-50 p-2 rounded-xl border border-red-150 font-bold">
                        ⚠️ {feedError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={feedSubmitting}
                      className="w-full py-2 bg-[#800020] hover:bg-orange-600 text-white rounded-xl transition font-extrabold cursor-pointer text-xs disabled:opacity-40 shadow-xs"
                    >
                      {feedSubmitting ? "Transmitting Suggestion..." : "Submit Suggestions Log"}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Bubble button info indicator */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-2 bg-white/95 backdrop-blur-sm border border-neutral-200 p-2 rounded-xl text-[10px] font-extrabold text-[#800020] shadow-md flex items-center gap-1.5 max-w-sm shrink-0 border-l-4 border-l-orange-600"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
            <span>Need advice or want to leave feedback? We are live! 🟢</span>
          </motion.div>
        )}

        {/* Main triggering bubble button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-gradient-to-tr from-[#800020] to-orange-600 hover:from-orange-650 hover:to-orange-700 text-white rounded-full shadow-xl flex items-center justify-center cursor-pointer transition transform hover:scale-105"
        >
          <MessageSquareCode className="w-6 h-6 animate-pulse" />
        </button>
      </div>
    </div>
  );
}
