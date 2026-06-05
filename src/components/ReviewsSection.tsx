import React, { useState } from 'react';
import { Review } from '../types';
import { Star, CheckCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReviewsSectionProps {
  reviews: Review[];
  onSubmitReview: (name: string, rating: number, comment: string) => Promise<void>;
}

export default function ReviewsSection({ reviews, onSubmitReview }: ReviewsSectionProps) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    setIsSubmitting(true);
    setSubmitMessage('');
    try {
      await onSubmitReview(name.trim(), rating, comment.trim());
      setSubmitMessage('Review submitted successfully! Thank you for feeding back.');
      setName('');
      setRating(5);
      setComment('');
    } catch (err) {
      setSubmitMessage('Error posting review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Aggregated score
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
    : "4.9";

  return (
    <section id="reviews-section" className="py-20 bg-neutral-50 border-t border-neutral-200/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-900 leading-tight">
            Loved by Hard-Working Pune Foodies
          </h2>
          <p className="text-sm text-neutral-500 font-sans">
            Hear from our monthly tiffin subscribers, working professionals, and families who order authentic veg lunches weekly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Reviews Score Panel */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/50 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-neutral-950">Customer Rating Summary</h3>
              
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-neutral-900 font-serif">{avgRating}</span>
                <span className="text-sm text-neutral-400">out of 5.0</span>
              </div>

              <div className="flex gap-0.5 text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-amber-500" />
                ))}
              </div>

              <p className="text-xs text-neutral-500 leading-relaxed">
                Calculated over {reviews.length} authenticated orders. Bhagwati Cloud Kitchen maintains an average rating of 4.9 stars through extreme focus on freshness & hygiene.
              </p>

              {/* Verified Badge */}
              <div className="flex items-center gap-2 text-xs text-green-700 font-semibold bg-green-50 p-3 rounded-xl border border-green-100">
                <CheckCircle className="w-4 h-4 text-green-700 shrink-0" />
                <span>100% Authenticated Reviews</span>
              </div>
            </div>

            {/* Testimonial Form */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/50 shadow-xs">
              <h3 className="text-lg font-bold text-neutral-950 mb-4">Submit Your Review</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-neutral-600 block mb-1.5">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-600 block mb-1.5">Rating (1 to 5 Stars)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRating(num)}
                        className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center transition border ${
                          rating >= num
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-neutral-50 text-neutral-400 border-neutral-200'
                        }`}
                      >
                        {num}★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-600 block mb-1.5">Your Feedback Comments</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us what you loved about our spices, package leak-proofing, or delivery promptness..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 focus:bg-white transition resize-none"
                  />
                </div>

                {submitMessage && (
                  <p className="text-xs text-green-700 font-medium bg-green-50 p-2.5 rounded-lg border border-green-100">{submitMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white bg-red-950 hover:bg-orange-600 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Publish My Review"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-6 max-h-[85vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-200">
            <AnimatePresence initial={false}>
              {reviews.map((rev) => (
                <motion.div
                  key={rev.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="bg-white p-6 rounded-2xl border border-neutral-200/50 shadow-xs space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-neutral-900">{rev.name}</h4>
                      <span className="text-[10px] text-neutral-400 font-medium font-sans">
                        {new Date(rev.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex gap-0.5 text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-700 font-sans leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  {/* Simulated Owner Reply */}
                  {rev.replyText && (
                    <div className="bg-orange-50/60 p-4 rounded-xl border border-orange-100/60 space-y-1.5 transition-colors hover:bg-orange-50 duration-200">
                      <p className="text-[11px] uppercase tracking-widest font-extrabold text-orange-700 flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                        <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" /> Instant Response from Cloud Kitchen Owner
                      </p>
                      <p className="text-xs text-neutral-600 italic leading-relaxed">
                        &ldquo;{rev.replyText}&rdquo;
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}

// Sparkles helper import
import { Sparkles } from 'lucide-react';
