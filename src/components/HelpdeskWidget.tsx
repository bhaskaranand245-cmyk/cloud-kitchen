import React, { useState, useEffect, useRef } from 'react';
import { MessageSquareCode, X, Send, Utensils, ShieldCheck, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'chef';
  text: string;
  time: string;
}

export default function HelpdeskWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'chef',
      text: 'Namaste! 🙏 I am Chef Bhagwati’s Digital Kitchen Assistant. How can I assist you with your fresh meals or monthly tiffin subscriptions today?',
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const predefinedPrompts = [
    { label: '📍 Is delivery to my PIN free?', text: 'Are deliveries to Pune pincodes free, and what sectors do you service?' },
    { label: '⏸️ Can I pause my monthly subscription?', text: 'How do I pause my active monthly tiffin subscription if I travel?' },
    { label: '🌶️ Can I request low-oil or mild spice?', text: 'Can I customize daily tiffins for low oil, zero ghee, or mild spices?' },
    { label: '🍲 What is today’s Chef Special?', text: 'What is the special thali or recommendation from the kitchen today?' }
  ];

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Dynamic response delay based on content
    setTimeout(() => {
      let responseText = "Dhanyawad (Thank you)! Storing your instructions. Our kitchen dispatch operators will confirm your preference shortly.";
      const cleanText = textToSend.toLowerCase();

      if (cleanText.includes('pin') || cleanText.includes('delivery') || cleanText.includes('pincode')) {
        responseText = "Absolutely! We service key areas including Karve Nagar, Erandwane, Kothrud, Deccan, and Shivajinagar (Pincodes: 411038, 411004, 411029, 411005). Within these zones, delivery is 100% free with no hidden charges!";
      } else if (cleanText.includes('pause') || cleanText.includes('subscription') || cleanText.includes('monthly') || cleanText.includes('tiffin')) {
        responseText = "Yes, you can pause anytime! Simply call us or text us on WhatsApp 12 hours before your scheduled meal. Unused meals are instantly added to your wallet or rolled forward to your next month’s billing cycle. Zero lost meals guaranteed! ⏸️";
      } else if (cleanText.includes('spice') || cleanText.includes('low-oil') || cleanText.includes('oil') || cleanText.includes('custom')) {
        responseText = "With Bhagwati, your health is our priority. In our Daily Tiffin section, you can fully adjust ghee rotis and add curd items. You can also leave cooking notes for our chefs like 'mild spice' or 'no oil' in the checkout notes, and we will custom-cook your batch separately. 🌶️";
      } else if (cleanText.includes('special') || cleanText.includes('recommend') || cleanText.includes('today')) {
        responseText = "Today’s Chef Special is our **Peshawari Paneer Thali** (fresh dairy paneer cooked in slow cashewnut whole-spice gravy) accompanied by motherly hand-rolled Butter Rotis, fragrant Jeera Basmati rice, and homemade Rabdi. Try adding it to your cart, it is incredibly popular! 🍛";
      }

      const chefMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'chef',
        text: responseText,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, chefMsg]);
      setIsTyping(false);
    }, 1200);
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
              className="w-80 sm:w-96 h-[500px] bg-white rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden flex flex-col mb-4 bg-gradient-to-b from-neutral-50/50 to-white"
            >
              {/* Header */}
              <div className="p-4 bg-[#800020] text-white flex items-center justify-between border-b border-[#600015]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-[#800020] flex items-center justify-center font-serif font-black shadow-sm">
                    भ
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-black tracking-wide uppercase text-amber-300">Live Kitchen Helpdesk</span>
                    <h4 className="text-[13px] font-extrabold flex items-center gap-1">
                      Chef Bhagwati & Team 
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </h4>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-xl transition cursor-pointer text-neutral-200 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Message Box container */}
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
                        <div className={`p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
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
                    <div className="bg-white border border-neutral-200 shadow-xs px-3.5 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Predefined prompts helper tag selection */}
              <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0">
                {predefinedPrompts.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => handleSendMessage(p.text)}
                    className="px-2.5 py-1.5 bg-white hover:bg-amber-50 text-[10px] font-bold text-neutral-600 hover:text-orange-950 border border-neutral-200 rounded-full transition shrink-0 cursor-pointer shadow-xs"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Footer text field form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }}
                className="p-3 border-t border-neutral-200 bg-white flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  placeholder="How can Chef Bhagwati help you?..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-600 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse support tag banner */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-2 bg-white/95 backdrop-blur-sm border border-neutral-200/80 p-2 rounded-xl text-[10px] font-extrabold text-[#800020] shadow-sm flex items-center gap-1.5 max-w-sm shrink-0 border-l-4 border-l-orange-600"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
            <span>Need advice? Support Is Online! 🟢</span>
          </motion.div>
        )}

        {/* Floating Bubble Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-gradient-to-tr from-[#800020] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-xl flex items-center justify-center cursor-pointer transition transform hover:scale-105"
        >
          <MessageSquareCode className="w-6 h-6 animate-pulse" />
        </button>
      </div>
    </div>
  );
}
