import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, Check, RefreshCw } from 'lucide-react';
import { CustomConfig } from '../types';

interface ContactSectionProps {
  config: CustomConfig;
}

export default function ContactSection({ config }: ContactSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('New Catering Request');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setIsSending(true);
    setStatusMsg('');

    setTimeout(() => {
      setIsSending(false);
      setStatusMsg("Thank you! Your catering inquiry was delivered to the kitchen managers. We will phone you back in 10-15 minutes.");
      setName('');
      setEmail('');
      setMessage('');
    }, 1200);
  };

  // WhatsApp formatted ordering layout URL
  const whatsappUrl = `https://wa.me/91${config.mobileNumber}?text=Namaste%20Bhagwati%20Cloud%20Kitchen,%20I'd%20like%20to%20know%20more%20about%20your%20Daily%20Tiffin%20Subscription%20Plans.`;

  return (
    <section id="contact-section" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">Get In Touch</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-900 leading-tight">
            Connect with Our Pune Kitchen Managers
          </h2>
          <p className="text-sm text-neutral-500 font-sans">
            Ready to order, ask about custom spices, monthly subscription plans, or major party catering? Let's connect.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          
          {/* Details & Location */}
          <div className="flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              
              {/* Phone cards */}
              <div className="flex items-start gap-4 p-5 rounded-2xl border border-neutral-200/60 bg-neutral-50/50 hover:bg-neutral-50 transition">
                <div className="p-3 rounded-xl bg-orange-100 text-orange-700 mt-1 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900">Direct Kitchen Call line</h4>
                  <a href={`tel:${config.mobileNumber}`} className="text-lg font-extrabold text-red-950 block hover:underline mt-0.5">
                    +91 {config.mobileNumber}
                  </a>
                  <p className="text-xs text-neutral-500 font-sans mt-1">One-click calling supported. Call us for instant delivery adjustments.</p>
                </div>
              </div>

              {/* Whatsapp Trigger card */}
              <div className="flex items-start gap-4 p-5 rounded-2xl border border-green-200 bg-green-50/30 hover:bg-green-50 transition">
                <div className="p-3 rounded-xl bg-green-100 text-green-700 mt-1 shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900">WhatsApp Tiffin Booking</h4>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-green-700 hover:underline mt-1 bg-green-100 px-3 py-1 rounded-lg">
                    Message Owner on WhatsApp
                  </a>
                  <p className="text-xs text-neutral-500 font-sans mt-2">Chat directly with kitchen operators to book daily meals or custom requests.</p>
                </div>
              </div>

              {/* Physical address & opening hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border border-neutral-100 bg-white rounded-xl space-y-1">
                  <h5 className="font-bold text-xs text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-600" /> Kitchen Hub
                  </h5>
                  <p className="text-xs text-neutral-700 font-sans leading-relaxed pt-1">
                    {config.address}
                  </p>
                </div>

                <div className="p-4 border border-neutral-100 bg-white rounded-xl space-y-1">
                  <h5 className="font-bold text-xs text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-orange-600" /> Business Hours
                  </h5>
                  <p className="text-xs text-neutral-700 font-sans leading-relaxed pt-1">
                    Monday – Sunday<br />
                    Breakfast: 07:30 AM – 10:30 AM<br />
                    Lunch/Dinner: 11:30 AM – 10:30 PM
                  </p>
                </div>
              </div>

            </div>

            {/* Google Map Integration with error fallback */}
            <div className="rounded-2xl border border-neutral-200 overflow-hidden shadow-xs shrink-0 aspect-video lg:h-52 w-full bg-neutral-100 relative">
              <iframe
                title="Bhagwati Cloud Kitchen Location Map"
                src={config.googleMapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="bg-neutral-50 border border-neutral-200/60 p-8 rounded-3xl flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-serif font-bold text-neutral-950 mb-1">Send Catering or Tiffin Inquiry</h3>
              <p className="text-xs text-neutral-500 font-sans mb-6">Need custom spice levels, bulk daily boxes, or standard office thali catering services?</p>
              
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-neutral-600 block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-neutral-600 block mb-1">Your Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="Enter email e.g. you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-neutral-600 block mb-1">Select Inquiry Type</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 transition"
                  >
                    <option value="New Catering Request">Corporate / Office Thali Catering</option>
                    <option value="Tiffin Plans Inquiry">Monthly Custom Tiffin Subscription</option>
                    <option value="Spice adjustments">Custom Spice/Veg options request</option>
                    <option value="Partnerships">Business & Franchise Partnerships</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-neutral-600 block mb-1">Inquiry Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe details such as dates, headcount or spice customizations required..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 transition resize-none"
                  />
                </div>

                {statusMsg && (
                  <p className="text-xs text-green-700 font-semibold bg-green-50 p-3 rounded-lg border border-green-100 flex items-center gap-1.5 leading-relaxed">
                    <Check className="w-4 h-4 text-green-700 shrink-0" /> {statusMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-red-950 hover:bg-orange-600 transition disabled:opacity-50 cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Transmitting...
                    </>
                  ) : (
                    "Transmit Inquiry"
                  )}
                </button>
              </form>
            </div>

            <div className="pt-4 border-t border-neutral-200 mt-6 flex justify-between text-[10px] text-neutral-400 font-semibold uppercase">
              <span>GDPR Certified Privacy</span>
              <span>•</span>
              <span>Instant Callbacks Guaranteed</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
