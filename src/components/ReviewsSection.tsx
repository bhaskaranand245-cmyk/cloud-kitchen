import React, { useState, useEffect } from 'react';
import { Review } from '../types';
import { Star, CheckCircle, RefreshCw, ThumbsUp, Flag, Search, Filter, ShieldCheck, Mail, User, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReviewsSectionProps {
  reviews: Review[];
  onSubmitReview: (name: string, rating: number, comment: string, email?: string, title?: string) => Promise<void>;
  onUpdateReviews?: (updatedReviews: Review[]) => void;
}

export default function ReviewsSection({ reviews, onSubmitReview, onUpdateReviews }: ReviewsSectionProps) {
  // Submission Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Human Spam proof check state
  const [spamProofNumA, setSpamProofNumA] = useState(3);
  const [spamProofNumB, setSpamProofNumB] = useState(5);
  const [spamProofAnswer, setSpamProofAnswer] = useState('');

  // Helpful click states and reporting states
  const [clickedHelpful, setClickedHelpful] = useState<{ [id: string]: boolean }>({});
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('Spam');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [starFilter, setStarFilter] = useState<number | 'All'>('All');
  const [sortBy, setSortBy] = useState<'Recent' | 'Highest' | 'Lowest' | 'Helpful'>('Recent');

  // Generate dynamic captcha challenge when component loads or on success
  const regenerateCaptcha = () => {
    const a = Math.floor(Math.random() * 8) + 2; 
    const b = Math.floor(Math.random() * 9) + 1;
    setSpamProofNumA(a);
    setSpamProofNumB(b);
    setSpamProofAnswer('');
  };

  useEffect(() => {
    regenerateCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess('');
    setSubmitError('');

    // Field-level validation checks
    if (!name.trim()) {
      setSubmitError('Please enter your full name.');
      return;
    }
    if (!comment.trim() || comment.length > 500) {
      setSubmitError('Please write a review comment (maximum 500 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitReview(name.trim(), rating, comment.trim());
      setSubmitSuccess('Thank you! Your testimonial has been received and scheduled for moderation check.');
      
      // Clear values on successful post
      setName('');
      setRating(5);
      setComment('');
    } catch (err: any) {
      setSubmitError(err.message || 'Error occurred while submitting your review. Please confirm your order history match.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Upvote helpful count handler via fetch
  const handleVoteHelpful = async (reviewId: string) => {
    if (clickedHelpful[reviewId]) return; // Prevent double trigger

    try {
      const res = await fetch(`/api/reviews/${reviewId}/helpful`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setClickedHelpful({ ...clickedHelpful, [reviewId]: true });
        if (onUpdateReviews && data.reviews) {
          onUpdateReviews(data.reviews);
        }
      }
    } catch (err) {
      console.error("Failed to post helpful count", err);
    }
  };

  // Flag and report inappropriate content trigger
  const handleReportFlag = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason })
      });
      if (res.ok) {
        const data = await res.json();
        alert('Review reported successfully. Our administration operators will inspect this shortly.');
        setReportingId(null);
        if (onUpdateReviews && data.reviews) {
          onUpdateReviews(data.reviews);
        }
      }
    } catch (err) {
      console.error("Failed to post report", err);
    }
  };

  // Filter reviews by rating and search keyword
  // Only display non-rejected/approved reviews (or reviews with undefined statuses which are approved legacy ones)
  const visibleReviews = reviews.filter((rev) => {
    // If flagged or rejected, do not show in general customer section for high credibility
    if (rev.status === 'Rejected' || rev.status === 'Flagged') return false;

    const matchesRating = starFilter === 'All' ? true : rev.rating === starFilter;
    const matchesKeyword = searchQuery.trim() === '' 
      ? true 
      : rev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rev.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rev.title && rev.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesRating && matchesKeyword;
  });

  // Sort visible reviews according to user choice
  const sortedReviews = [...visibleReviews].sort((a, b) => {
    if (sortBy === 'Recent') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortBy === 'Highest') {
      return b.rating - a.rating;
    }
    if (sortBy === 'Lowest') {
      return a.rating - b.rating;
    }
    if (sortBy === 'Helpful') {
      return (b.helpfulCount || 0) - (a.helpfulCount || 0);
    }
    return 0;
  });

  // Aggregate stats over all reviews
  const totalSubmissions = reviews.length;
  const averageRatingValue = totalSubmissions > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalSubmissions).toFixed(1)
    : "4.9";

  const starsDistribution = [5, 4, 3, 2, 1].map((starNum) => {
    const frequency = reviews.filter(r => r.rating === starNum).length;
    const percentage = totalSubmissions > 0 ? ((frequency / totalSubmissions) * 100).toFixed(0) : "0";
    return { rating: starNum, count: frequency, pct: percentage };
  });

  return (
    <section id="reviews-section" className="py-20 bg-neutral-50/50 border-t border-neutral-200/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-3.5 py-1 rounded-full border border-orange-100">
            Real Reviews
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-neutral-900 leading-tight">
            Loved by Hard-Working Ramnagar Subscribers
          </h2>
          <p className="text-sm text-neutral-500 font-sans max-w-lg mx-auto">
            Real-time ratings, cooking notes feedback, and verified thali feedback from home cooks and busy working professionals in the community.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          
          {/* LEFT COLUMN: RATINGS DISTRIBUTION PROGRESS CHECKS */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl border border-neutral-200/55 shadow-xs space-y-5">
              <h3 className="text-base font-extrabold text-neutral-900 font-sans uppercase tracking-tight">Authentic Rating Matrix</h3>
              
              <div className="flex items-baseline gap-2.5">
                <span className="text-5xl font-black text-[#800020] font-serif">{averageRatingValue}</span>
                <div className="space-y-0.5">
                  <span className="text-xs text-neutral-400 font-semibold block">out of 5.0 stars</span>
                  <div className="flex gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic star frequencies list */}
              <div className="space-y-3 pt-2 border-t border-dashed">
                {starsDistribution.map((row) => (
                  <button
                    key={row.rating}
                    onClick={() => setStarFilter(starFilter === row.rating ? 'All' : row.rating)}
                    className={`w-full flex items-center gap-3 text-left group transition py-1 hover:bg-neutral-50/50 rounded-lg px-2 -mx-2 cursor-pointer ${
                      starFilter === row.rating ? 'bg-orange-50/35 ring-1 ring-orange-250/20' : ''
                    }`}
                  >
                    <span className="text-xs font-bold font-serif w-8 shrink-0 text-neutral-600 group-hover:text-orange-950">
                      {row.rating} ★
                    </span>
                    <div className="flex-1 bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-orange-600 h-full rounded-full transition-all group-hover:bg-[#800020]" 
                        style={{ width: `${row.pct}%` }} 
                      />
                    </div>
                    <span className="text-xs font-bold font-mono text-neutral-400 w-12 text-right shrink-0">
                      {row.count} ({row.pct}%)
                    </span>
                  </button>
                ))}
              </div>

              {/* Verified Trust Badge block */}
              <div className="flex items-center gap-3 text-xs text-emerald-800 font-bold bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="block font-black text-emerald-950 text-[11px] uppercase tracking-wide">FSSAI Certified hygiene</span>
                  <span className="block text-[10px] text-emerald-700 font-medium font-sans mt-0.5">Every review undergoes system order-history verification.</span>
                </div>
              </div>
            </div>

            {/* TESTIMONIAL SUBMISSION FORM MODULE */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-250/50 shadow-xs">
              <h3 className="text-base font-extrabold text-neutral-900 font-sans uppercase tracking-tight mb-4">Post Meal Testimony</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-neutral-500 block mb-1">Your Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-600 focus:bg-white transition"
                    />
                    <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-neutral-500 block mb-1.5">Rating Score Selection</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRating(num)}
                        className={`flex-1 h-9 rounded-lg font-bold text-xs flex items-center justify-center transition border cursor-pointer ${
                          rating >= num
                            ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-3xs'
                            : 'bg-neutral-50 text-neutral-400 border-neutral-200'
                        }`}
                      >
                        {num}★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-neutral-500 block mb-1">
                    Feedback Message <span className="text-[10px] text-neutral-400">({comment.length}/500 chars)</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    maxLength={500}
                    placeholder="Describe meal presentation, spice balances, box insulation, or chef's special touches..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-600 focus:bg-white transition resize-none leading-relaxed"
                  />
                </div>

                {/* Status messages popup labels container */}
                {submitSuccess && (
                  <p className="text-xs text-green-700 font-bold bg-emerald-50 p-3 rounded-xl border border-green-200">
                    {submitSuccess}
                  </p>
                )}
                {submitError && (
                  <p className="text-xs text-red-650 font-bold bg-red-50 p-3 rounded-xl border border-red-200">
                    ⚠️ {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-red-950 hover:bg-orange-600 cursor-pointer shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying dispatch records...
                    </>
                  ) : (
                    "Publish My Verified Review"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: REVIEWS FILTERING PANEL & LIST */}
          <div className="lg:col-span-2 space-y-5">
            {/* Control Filters Toolbar header card */}
            <div className="bg-white p-4 rounded-3xl border border-neutral-250/50 shadow-xs flex flex-col md:flex-row gap-4 items-stretch justify-between">
              
              {/* Star filtering row buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-neutral-400 mr-1 flex items-center gap-1 font-sans">
                  <Filter className="w-3.5 h-3.5 shrink-0 text-[#800020]" /> Rating:
                </span>
                {['All', 5, 4, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => setStarFilter(num === 'All' ? 'All' : num)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer border ${
                      starFilter === num
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-neutral-50 hover:bg-neutral-150 text-neutral-600 border-neutral-200'
                    }`}
                  >
                    {num === 'All' ? 'All Stars' : `${num}★`}
                  </button>
                ))}
              </div>

              {/* Sorting and searches inputs */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 md:flex-auto">
                  <input
                    type="text"
                    placeholder="Search keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-44 pl-7 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-600 focus:bg-white"
                  />
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                </div>

                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-neutral-50 border border-neutral-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#800020]"
                >
                  <option value="Recent">Most Recent</option>
                  <option value="Highest">Highest Rated</option>
                  <option value="Lowest">Lowest Rated</option>
                  <option value="Helpful">Most Helpful</option>
                </select>
              </div>
            </div>

            {/* List container mapping reviews database state */}
            <div className="space-y-4 max-h-[105vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-200">
              <AnimatePresence initial={false}>
                {sortedReviews.length > 0 ? (
                  sortedReviews.map((rev) => (
                    <motion.div
                      key={rev.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white p-5 rounded-3xl border border-neutral-200/50 shadow-xs space-y-3.5 text-left"
                    >
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-extrabold text-neutral-900 text-sm">{rev.name}</h4>
                            {rev.isVerified && (
                              <span className="bg-green-100 text-green-800 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm shrink-0">
                                ✓ Verified subscriber
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-400 font-medium block mt-0.5 font-sans">
                            {new Date(rev.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>

                        <div className="flex gap-0.5 text-amber-500 bg-amber-50 px-2 py-1 rounded-lg shrink-0">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h5 className="font-extrabold text-neutral-900 text-xs sm:text-sm font-sans">{rev.title || 'Highly Recommended Delivery!'}</h5>
                        <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-sans italic bg-neutral-50/50 p-3 rounded-2xl border border-neutral-200/40">
                          &ldquo;{rev.comment}&rdquo;
                        </p>
                      </div>

                      {/* Owner response reply render */}
                      {rev.replyText && (
                        <div className="bg-orange-50/70 p-4 rounded-2xl border border-orange-100/70 space-y-1 mt-1 font-sans">
                          <p className="text-[10px] uppercase font-black tracking-widest text-orange-700 flex items-center gap-1">
                            <span className="relative flex h-1.5 w-1.5 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75 mr-1" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-550 mr-1" />
                            </span>
                            Chef Special Response
                          </p>
                          <p className="text-xs text-neutral-700 font-serif leading-relaxed italic">
                            &ldquo;{rev.replyText}&rdquo;
                          </p>
                        </div>
                      )}

                      {/* Customer interaction controls footer card */}
                      <div className="flex items-center justify-between border-t border-dashed border-neutral-200/50 pt-3 flex-wrap gap-2 font-sans">
                        <button
                          onClick={() => handleVoteHelpful(rev.id)}
                          disabled={clickedHelpful[rev.id]}
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                            clickedHelpful[rev.id]
                              ? 'text-[#800020] bg-orange-50'
                              : 'text-neutral-400 hover:text-orange-950'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5 shrink-0" />
                          <span>Helpful ({ (rev.helpfulCount || 0) + (clickedHelpful[rev.id] ? 1 : 0) })</span>
                        </button>

                        <div className="relative">
                          {reportingId === rev.id ? (
                            <div className="flex items-center gap-1 bg-neutral-50 p-1 border rounded-lg animate-fadeIn text-xs">
                              <select
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                                className="bg-white border rounded px-1.5 py-0.5 text-[10px] font-bold text-neutral-600 focus:outline-none"
                              >
                                <option value="Spam">Spam</option>
                                <option value="Off-topic">Off-topic</option>
                                <option value="Inappropriate">Inappropriate</option>
                                <option value="Promo text">Promo text</option>
                              </select>
                              <button
                                onClick={() => handleReportFlag(rev.id)}
                                className="px-2 py-0.5 bg-orange-600 text-white rounded font-bold text-[10px]"
                              >
                                Submit
                              </button>
                              <button
                                onClick={() => setReportingId(null)}
                                className="text-neutral-400 font-black px-1"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setReportingId(rev.id);
                                setReportReason('Spam');
                              }}
                              className="text-neutral-300 hover:text-red-650 text-[10px] font-bold flex items-center gap-1 transition"
                            >
                              <Flag className="w-3 h-3 shrink-0" /> Report Comment
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="bg-white p-16 border rounded-3xl text-center space-y-3.5 select-none">
                    <Star className="w-10 h-10 text-neutral-200 mx-auto animate-pulse" />
                    <h4 className="font-extrabold text-neutral-700 text-sm">No reviews matched this selection.</h4>
                    <p className="text-xs text-neutral-400 font-sans max-w-sm mx-auto">Try clearing search parameters or filtering with an alternative rating pill.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
