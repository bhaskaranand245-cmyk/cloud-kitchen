import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  LifeBuoy, 
  Plus, 
  Search, 
  Tag, 
  Clock, 
  User, 
  Send, 
  FileText, 
  Image as ImageIcon, 
  Folder, 
  AlertCircle, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  PhoneCall, 
  Mail, 
  X,
  Upload,
  Layers,
  HelpCircle,
  TrendingUp,
  MessageSquareCode,
  Bell
} from 'lucide-react';
import { Enquiry, EnquiryThreadMessage } from '../types';

interface SupportDeskProps {
  enquiries: Enquiry[];
  onUpdateEnquiries: (newEnquiries: Enquiry[]) => void;
}

export default function SupportDesk({ enquiries, onUpdateEnquiries }: SupportDeskProps) {
  // FAQs
  const FAQS = [
    {
      q: "How can I pause or change my active monthly tiffin subscription?",
      a: "You can temporarily pause or modify your daily meals up to 12 hours in advance under your Tiffin dashboard or by messaging us directly on WhatsApp with your Order ID. Unused meals are credited with full refund guarantees forward to your next month's billing cycle.",
      cat: "Orders & Delivery"
    },
    {
      q: "My online secure credit card payment got deducted but the thali order is showing pending?",
      a: "This occurs due to momentary financial gateway synchronization latency. Rest assured, our backend runs a double-entry reconciliation every 10-15 minutes or you can upload the payment receipt screenshot directly via a support ticket below for manual chef approval.",
      cat: "Billing & Payments"
    },
    {
      q: "Which areas in Pune does Bhagwati deliver fresh food to for free?",
      a: "We currently offer free hot deliveries to Karve Nagar, Erandwane, Kothrud, Deccan Gymkhana, Shivajinagar, and surrounding sectors within a 7km radius of our kitchen hub (pincodes 411038, 411004, 411005, 411029).",
      cat: "Orders & Delivery"
    },
    {
      q: "Can I customize spice levels, skip ghee/butter, or request onion-garlic free thalis?",
      a: "Yes! While ordering from this website, write your specific guidelines in the 'Kitchen Notes' field at the bottom of your cart. We prepare customizable child-friendly mild spices or diabetic low-oil variants separately upon direct instruction.",
      cat: "General Inquiry"
    },
    {
      q: "What is your refund policy for cancelled orders?",
      a: "For single-day orders, cancellations made within 15 minutes of checkout are refunded instantly to your original payment mode. For subscription cancellations, refunds are computed on a pro-rata basis based on days served.",
      cat: "Returns & Refunds"
    }
  ];

  // Forms
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'General Inquiry' | 'Technical Support' | 'Billing & Payments' | 'Orders & Delivery' | 'Returns & Refunds' | 'Account Issues' | 'Feedback & Suggestions'>('General Inquiry');
  const [ticketPriority, setTicketPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  
  // Attachments dynamic upload simulator
  const [attachmentBase64, setAttachmentBase64] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string>('');

  // States
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  const [activeTicketTab, setActiveTicketTab] = useState<'all' | 'open' | 'resolved'>('all');
  const [selectedTicket, setSelectedTicket] = useState<Enquiry | null>(null);
  const [replyText, setReplyText] = useState('');
  
  // Status messages
  const [submissionSuccessMsg, setSubmissionSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notifyMsg, setNotifyMsg] = useState<string | null>(null);

  // Load name/details from checkout caches if available
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('bhagwati_customer_name') || '';
      const savedMobile = localStorage.getItem('bhagwati_customer_mobile') || '';
      if (savedName) setCustomerName(savedName);
      if (savedMobile) setCustomerMobile(savedMobile);
    } catch (e) {
      console.warn("Storage profile load error:", e);
    }
  }, []);

  // Search FAQs
  const filteredFaqs = FAQS.filter(faq => 
    faq.q.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
    faq.a.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
    faq.cat.toLowerCase().includes(faqSearchQuery.toLowerCase())
  );

  // File Upload base64 simulation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg('File attachments are limited to 2MB to ensure secure processing.');
        return;
      }
      setAttachmentName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentBase64(reader.result as string);
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Support request
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !ticketSubject.trim() || !ticketMessage.trim()) {
      setErrorMsg('Please input your name, heading subject, and message explanation.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSubmissionSuccessMsg('');

    try {
      const payload = {
        name: customerName.trim(),
        email: customerEmail.trim(),
        mobile: customerMobile.trim(),
        subject: ticketSubject.trim(),
        message: ticketMessage.trim(),
        category: ticketCategory,
        status: 'Open',
        priority: ticketPriority,
        attachments: attachmentBase64 ? [attachmentBase64] : [],
        thread: [
          {
            id: `msg-initial-${Date.now()}`,
            sender: 'customer' as const,
            message: ticketMessage.trim(),
            createdAt: new Date().toISOString(),
            attachmentUrl: attachmentBase64 || undefined
          }
        ]
      };

      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        onUpdateEnquiries(data.enquiries);
        setSubmissionSuccessMsg(`🎉 Ticket successfully logged! Ticket ID: ${data.enquiry.id}. A kitchen support executive has been allocated.`);
        
        // Push immediate notification trigger
        triggerBannerNotification(`Confirmation: Ticket ${data.enquiry.id} is now registered under category "${ticketCategory}"!`);

        // Empty state fields
        setTicketSubject('');
        setTicketMessage('');
        setAttachmentBase64(null);
        setAttachmentName('');
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Server rejected support request payload.');
      }
    } catch (e) {
      setErrorMsg('Connection error. Failed to wire support socket payload.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Respond / reply to existing conversation logs thread
  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    const newReplyMsg: EnquiryThreadMessage = {
      id: `reply-${Date.now()}`,
      sender: 'customer',
      message: replyText.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedThread = [...(selectedTicket.thread || []), newReplyMsg];
    
    // Auto shift status of resolved tickets back to Open if client responds
    const nextStatus = selectedTicket.status === 'Resolved' || selectedTicket.status === 'Closed' 
      ? 'In Progress' 
      : selectedTicket.status;

    try {
      const res = await fetch(`/api/enquiries/${selectedTicket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thread: updatedThread,
          status: nextStatus,
          updatedAt: new Date().toISOString()
        })
      });

      if (res.ok) {
        const data = await res.json();
        onUpdateEnquiries(data.enquiries);
        
        // Find refreshed local reference
        const refreshedTarget = data.enquiries.find((enq: Enquiry) => enq.id === selectedTicket.id);
        if (refreshedTarget) {
          setSelectedTicket(refreshedTarget);
        }
        
        setReplyText('');
        triggerBannerNotification(`Reply recorded successfully for Ticket ID: ${selectedTicket.id}!`);
      } else {
        setErrorMsg('Unable to append reply string on database schema.');
      }
    } catch (e) {
      setErrorMsg('Service connection timed out.');
    }
  };

  // Status-based color trackers
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'In Progress':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Waiting for Customer':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'Closed':
        return 'bg-neutral-100 text-neutral-500 border border-neutral-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  // Priority badge coloring
  const getPriorityBadgeClass = (priority?: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-900 font-extrabold border-red-300';
      case 'High':
        return 'bg-rose-100 text-rose-800 font-bold border-rose-200';
      case 'Medium':
        return 'bg-orange-100 text-orange-800 font-medium border-orange-200';
      case 'Low':
        return 'bg-neutral-100 text-neutral-600 border-neutral-200';
      default:
        return 'bg-neutral-100 text-neutral-500';
    }
  };

  const triggerBannerNotification = (message: string) => {
    setNotifyMsg(message);
    setTimeout(() => {
      setNotifyMsg(null);
    }, 6000);
  };

  return (
    <section className="bg-neutral-50 py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Dynamic Notification Banner Alert */}
        {notifyMsg && (
          <div className="fixed top-20 right-6 z-[999] max-w-sm bg-stone-900 border-l-4 border-l-orange-500 text-white p-4 rounded-xl shadow-2xl flex items-start gap-3 animate-bounce">
            <Bell className="w-5 h-5 text-amber-300 animate-swing shrink-0 mt-0.5" />
            <div className="text-left space-y-0.5">
              <span className="text-[10px] uppercase font-black tracking-wider text-neutral-400">Support Desk Notification</span>
              <p className="text-xs font-medium">{notifyMsg}</p>
            </div>
            <button onClick={() => setNotifyMsg(null)} className="p-0.5 text-neutral-400 hover:text-white ml-auto cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-neutral-200">
          <div className="space-y-1 text-left">
            <span className="text-xs font-bold text-orange-700 uppercase tracking-widest bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
              Customer Support Desk
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-neutral-900 flex items-center gap-2">
              <span className="text-red-950 font-serif font-bold">Bhagwati Help Desk & Ticket Center</span>
            </h2>
            <p className="text-xs text-neutral-500">
              Check immediate helper resources, lodge high-priority support tickets, or monitor existing queries in real-time.
            </p>
          </div>

          <div className="flex gap-2 flex-wrap text-xs">
            <a 
              href="tel:9960877739" 
              className="px-4 py-2 bg-white border rounded-xl font-bold flex items-center gap-1.5 hover:bg-neutral-100 transition shadow-xs text-neutral-700"
            >
              <PhoneCall className="w-3.5 h-3.5 text-orange-600" />
              Hotline: +91 9960877739
            </a>
            <a 
              href="mailto:support@bhagwaticloudkitchen.co.in" 
              className="px-4 py-2 bg-[#800020] text-white rounded-xl font-bold flex items-center gap-1.5 hover:bg-red-950 transition shadow-sm"
            >
              <Mail className="w-3.5 h-3.5 text-amber-300" />
              Email Support
            </a>
          </div>
        </div>

        {/* HELP CENTER & ACCORDION SEARCH */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-neutral-950 flex items-center gap-1.5">
                <HelpCircle className="w-5 h-5 text-orange-600" /> Support Hub FAQ Directory
              </h3>
              <p className="text-xs text-neutral-500">Search simple instructions first prior to launching ticketing queues.</p>
            </div>
            
            {/* Search filter input */}
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search queries..."
                value={faqSearchQuery}
                onChange={(e) => setFaqSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, idx) => {
                const isExpanded = expandedFaqIndex === idx;
                return (
                  <div 
                    key={idx} 
                    className={`border border-neutral-200/80 rounded-2xl p-4 transition ${isExpanded ? 'bg-amber-50/30' : 'bg-neutral-50/30 hover:bg-neutral-50/75'}`}
                  >
                    <button
                      onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                      className="w-full flex items-start justify-between gap-3 text-left font-bold text-xs text-neutral-800 cursor-pointer"
                    >
                      <span className="flex items-start gap-2">
                        <span className="px-1.5 py-0.5 bg-neutral-200 text-neutral-600 text-[9px] uppercase font-black rounded-xs">{faq.cat}</span>
                        {faq.q}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 shrink-0 text-orange-600" /> : <ChevronDown className="w-4 h-4 shrink-0 text-neutral-400" />}
                    </button>
                    {isExpanded && (
                      <p className="mt-2.5 text-xs text-neutral-600 font-sans leading-relaxed pt-1 border-t border-dashed">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-neutral-500 text-center col-span-2 py-4 font-mono">No matching FAQ solutions discovered. Try writing in the ticket box below.</p>
            )}
          </div>
        </div>

        {/* PRIMARY COLUMNS: TICKET GENERATOR VS TRACKING CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Lodge Request section */}
          <div className="lg:col-span-5 bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-xs text-left">
            <div className="pb-4 border-b border-neutral-100 mb-6 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-800">Support Desk</span>
              <h3 className="font-serif font-black text-neutral-950 text-xl">Lodge Support Ticket</h3>
              <p className="text-xs text-neutral-500">Provide thorough data metrics to guarantee instantaneous dispatch resolution.</p>
            </div>

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Mobile number</label>
                  <input
                    type="tel"
                    placeholder="e.g., 9960877739"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Your Email</label>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Support Category</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value as any)}
                    className="w-full px-2 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 font-semibold"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Billing & Payments">Billing & Payments</option>
                    <option value="Orders & Delivery">Orders & Delivery</option>
                    <option value="Returns & Refunds">Returns & Refunds</option>
                    <option value="Account Issues">Account Issues</option>
                    <option value="Feedback & Suggestions">Feedback & Suggestions</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Urgency Priority</label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value as any)}
                    className="w-full px-2 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 font-semibold"
                  >
                    <option value="Low">Low (General)</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High (Urgent)</option>
                    <option value="Critical">Critical (Immediate Call)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Subject Title Heading</label>
                <input
                  type="text"
                  required
                  placeholder="Describe your issue with order#"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 focus:bg-white font-medium text-neutral-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Description / Detailed Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide precise details such as transaction numbers, cooking directions or subscription calendar dates..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 focus:bg-white resize-none"
                />
              </div>

              {/* Secure attachment files section */}
              <div className="bg-neutral-50 border border-neutral-200 border-dashed rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-neutral-600 flex items-center gap-1.5 uppercase">
                    <Upload className="w-3.5 h-3.5 text-neutral-500" /> Dynamic File/Screenshot Upload
                  </span>
                  <span className="text-[9px] text-neutral-400 font-mono">Max 2MB</span>
                </div>
                
                <div className="flex gap-2.5 items-center">
                  <label className="px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-100 transition rounded-lg text-[10px] font-bold text-neutral-700 cursor-pointer flex items-center gap-1">
                    Select File
                    <input 
                      type="file" 
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden" 
                    />
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500 truncate max-w-[150px]">
                    {attachmentName || "No attachments picked"}
                  </span>
                </div>

                {attachmentBase64 && (
                  <div className="pt-2 flex items-center justify-between bg-white px-2.5 py-1.5 border rounded-lg">
                    <span className="text-[9px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> Attachment loaded!
                    </span>
                    <button 
                      type="button" 
                      onClick={() => { setAttachmentBase64(null); setAttachmentName(''); }} 
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Error messages */}
              {errorMsg && (
                <div className="p-3 bg-red-100 border border-red-200 text-red-800 text-[11px] font-bold rounded-xl leading-relaxed">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* Form success code */}
              {submissionSuccessMsg && (
                <div className="p-3 bg-green-100 border border-green-200 text-green-900 text-[11px] font-bold rounded-xl leading-relaxed">
                  {submissionSuccessMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#800020] hover:bg-orange-600 text-white font-serif font-black text-xs uppercase tracking-wider rounded-xl transition shadow duration-150 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Syncing Network..." : "🔑 Transmit Official Ticket"}
              </button>

            </form>
          </div>

          {/* Monitor existing requests container */}
          <div className="lg:col-span-7 bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-xs text-left min-h-[550px]">
            <div className="pb-4 border-b border-neutral-100 mb-6 flex justify-between items-center flex-wrap gap-4">
              <div className="space-y-1">
                <h3 className="font-serif font-black text-neutral-950 text-lg">My Support Tickets ({enquiries.length})</h3>
                <p className="text-xs text-neutral-500">Select any ticket context tag to view historic threads or post dynamic replies.</p>
              </div>

              {/* Filter tickets */}
              <div className="grid grid-cols-3 gap-1 p-0.5 bg-neutral-100 border rounded-xl text-[10px] font-bold shrink-0">
                <button
                  onClick={() => setActiveTicketTab('all')}
                  className={`px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer ${activeTicketTab === 'all' ? 'bg-[#800020] text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-800'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTicketTab('open')}
                  className={`px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer ${activeTicketTab === 'open' ? 'bg-[#800020] text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-800'}`}
                >
                  Active
                </button>
                <button
                  onClick={() => setActiveTicketTab('resolved')}
                  className={`px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer ${activeTicketTab === 'resolved' ? 'bg-[#800020] text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-800'}`}
                >
                  Cleared
                </button>
              </div>
            </div>

            {/* Filtered tickets array map */}
            {(() => {
              const displayTickets = enquiries.filter(t => {
                if (activeTicketTab === 'open') return t.status !== 'Resolved' && t.status !== 'Closed';
                if (activeTicketTab === 'resolved') return t.status === 'Resolved' || t.status === 'Closed';
                return true;
              });

              if (displayTickets.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
                    <Folder className="w-12 h-12 text-neutral-300" />
                    <div>
                      <p className="text-xs font-black text-neutral-800">No active support tickets documented</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">Use the lodge tool to create a support enquiry.</p>
                    </div>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Left tickets queue */}
                  <div className="md:col-span-5 space-y-2 max-h-[480px] overflow-y-auto pr-1">
                    {displayTickets.map((tc) => {
                      const isSelected = selectedTicket?.id === tc.id;
                      return (
                        <div
                          key={tc.id}
                          onClick={() => setSelectedTicket(tc)}
                          className={`p-3 rounded-2xl border text-left cursor-pointer transition flex flex-col justify-between ${isSelected ? 'border-orange-500 bg-orange-55/10 bg-orange-50/15' : 'border-neutral-200/80 hover:bg-neutral-50'}`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[9px] font-bold font-mono">
                              <span className="text-stone-400">ID: {tc.id}</span>
                              <span className={`px-1.5 py-0.5 rounded ${getStatusBadgeClass(tc.status)}`}>
                                {tc.status}
                              </span>
                            </div>
                            <h4 className="text-xs font-black text-neutral-900 truncate">{tc.subject}</h4>
                          </div>

                          <div className="flex justify-between items-center mt-3 pt-2 border-t border-dotted border-neutral-100">
                            <span className="text-[9px] font-semibold text-[#800020] uppercase font-mono tracking-wider">
                              {tc.category || 'Support Request'}
                            </span>
                            <span className="text-[9px] text-neutral-400 font-medium">
                              {new Date(tc.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right thread view details */}
                  <div className="md:col-span-7 bg-neutral-50/50 border border-neutral-200/85 rounded-2xl p-4 min-h-[380px] flex flex-col justify-between">
                    {selectedTicket ? (
                      <div className="flex-1 flex flex-col justify-between h-full space-y-4">
                        
                        {/* Selected ticket summary */}
                        <div className="pb-3 border-b border-neutral-200/60 text-left">
                          <div className="flex justify-between items-start gap-2 flex-wrap pb-1">
                            <div>
                              <span className="text-[9px] font-bold text-neutral-400 block font-mono">SUPPORT TICKET ROOT PANEL</span>
                              <h4 className="text-xs font-black text-neutral-900 font-serif leading-tight">{selectedTicket.subject}</h4>
                            </div>
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-lg shrink-0 ${getPriorityBadgeClass(selectedTicket.priority)}`}>
                              {selectedTicket.priority || 'Medium'} Urgency
                            </span>
                          </div>

                          <div className="mt-2.5 flex items-center justify-between text-[9px] text-neutral-500 font-mono">
                            <span>Status: <strong className="text-neutral-800">{selectedTicket.status}</strong></span>
                            <span>Agent: <strong className="text-amber-900 font-sans">{selectedTicket.assignedAgent || 'Bhagwati Core Team'}</strong></span>
                          </div>
                        </div>

                        {/* Conversational history logs scroll pane */}
                        <div className="flex-1 overflow-y-auto max-h-[220px] pr-1 space-y-3 pl-0.5 py-1 text-xs">
                          
                          {/* Thread list */}
                          {selectedTicket.thread && selectedTicket.thread.length > 0 ? (
                            selectedTicket.thread.map((msg, i) => {
                              const isSelf = msg.sender === 'customer';
                              return (
                                <div key={msg.id || i} className={`flex flex-col space-y-0.5 max-w-[85%] ${isSelf ? 'ml-auto items-end text-right' : 'mr-auto text-left'}`}>
                                  <div className="flex items-center gap-1.5 text-[9px] text-neutral-400 font-bold font-mono">
                                    <span>{msg.sender === 'customer' ? 'You' : msg.sender === 'agent' ? (selectedTicket.assignedAgent || 'Support Agent') : 'System Log'}</span>
                                    <span>•</span>
                                    <span>{new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  
                                  <div className={`p-2.5 rounded-2xl shadow-xs leading-relaxed font-sans ${
                                    isSelf 
                                      ? 'bg-orange-600 text-white rounded-tr-none' 
                                      : 'bg-white border border-neutral-200 text-neutral-800 rounded-tl-none font-medium'
                                  }`}>
                                    {msg.message}
                                    
                                    {/* Display attached image mockup securely */}
                                    {msg.attachmentUrl && (
                                      <div className="mt-2 pt-2 border-t border-white/20 text-left">
                                        <div className="text-[8px] font-bold text-amber-200 uppercase flex items-center gap-0.5 mb-1">
                                          <ImageIcon className="w-3.5 h-3.5" /> Attached Secure Screen Capture
                                        </div>
                                        <img 
                                          src={msg.attachmentUrl} 
                                          alt="User Screen Attachment" 
                                          className="max-h-[80px] rounded-lg border border-black/10 shadow-sm"
                                          referrerPolicy="no-referrer"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            // Fallback rendering message if thread is initially unpopulated
                            <div className="space-y-1 text-left p-3.5 rounded-xl border border-dashed bg-white">
                              <div className="flex items-center gap-2 font-black font-serif text-[11px] text-neutral-800">
                                <AlertCircle className="w-4 h-4 text-orange-600" /> Ground Initial Inquiry Message
                              </div>
                              <p className="text-[11px] text-neutral-500 font-sans leading-relaxed">
                                "{selectedTicket.message}"
                              </p>
                              {selectedTicket.replyText && (
                                <div className="mt-2.5 pt-2 border-t border-neutral-100 flex gap-2.5">
                                  <div className="w-5 h-5 bg-[#800020] text-amber-300 text-[10px] font-black rounded-lg flex items-center justify-center font-serif shrink-0">भ</div>
                                  <div className="space-y-0.5">
                                    <span className="text-[9px] font-black block text-neutral-500 uppercase tracking-widest leading-none">Traditional Chef Desk Reply</span>
                                    <p className="text-[11px] text-neutral-700 font-sans leading-relaxed">{selectedTicket.replyText}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Interactive direct reply form */}
                        <form onSubmit={handlePostReply} className="flex gap-2.5 pt-3.5 border-t border-neutral-200/60 bg-white p-2.5 rounded-xl">
                          <input
                            type="text"
                            required
                            placeholder={`Reply to ticket ${selectedTicket.id}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="flex-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-600 focus:bg-white text-neutral-800"
                          />
                          <button
                            type="submit"
                            title="Submit Reply"
                            className="px-3 py-2 bg-[#800020] hover:bg-orange-600 text-white rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 shadow-xs"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </form>

                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-2">
                        <MessageSquare className="w-10 h-10 text-neutral-300" />
                        <div>
                          <p className="text-xs font-bold text-neutral-500">No ticket actively highlighted</p>
                          <p className="text-[10px] text-neutral-400 mt-1 max-w-[180px] mx-auto leading-relaxed">Choose a ticket context tag from the left index column to display the dialog thread history.</p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              );
            })()}

          </div>

        </div>

      </div>
    </section>
  );
}
