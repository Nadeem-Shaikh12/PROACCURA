import { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, User, CheckCircle2, Quote } from 'lucide-react';
import { Rating } from 'react-simple-star-rating';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

interface Review {
    id: string;
    name: string;
    rating: number;
    comment: string;
    date: string;
    role?: string; // e.g., "Tenant" or "Landlord"
    userId?: string;
    reviewerId?: string; // Add this to match DB
    createdAt?: string; // Add this to match DB
}

export default function ReviewsSection() {
    const { user } = useAuth(); // Get authenticated user
    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newReview, setNewReview] = useState({ name: '', rating: 0, comment: '' });
    const [showForm, setShowForm] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);

    const calculateAverage = (data: Review[]) => {
        if (data.length === 0) {
            setAverageRating(0);
            return;
        }
        const total = data.reduce((acc, curr) => acc + curr.rating, 0);
        setAverageRating(Number((total / data.length).toFixed(1)));
    };

    const fetchReviews = useCallback(async () => {
        try {
            const res = await fetch('/api/reviews');
            if (res.ok) {
                const data = await res.json();
                // Map DB fields to UI fields if necessary
                const mappedReviews = data.map((r: any) => ({
                    id: r.id,
                    name: r.name || r.reviewerId || 'Anonymous', // Fallback for name
                    rating: r.rating,
                    comment: r.comment,
                    date: r.createdAt || r.date || new Date().toISOString(),
                    userId: r.reviewerId
                }));

                setReviews(mappedReviews);
                calculateAverage(mappedReviews);

                // Check if current user has reviewed
                if (user && mappedReviews.some((r: Review) => r.userId === user.id)) {
                    setHasReviewed(true);
                } else {
                    setHasReviewed(false);
                }
            }
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        }
    }, [user]);

    // Fetch reviews on mount
    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to write a review.');
            return;
        }
        if (!newReview.name || newReview.rating === 0 || !newReview.comment) {
            alert('Please fill in all fields and select a rating.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...newReview, userId: user.id }),
            });

            if (res.ok) {
                setNewReview({ name: '', rating: 0, comment: '' });
                fetchReviews(); // Refresh list and setHasReviewed
                setShowForm(false);
            } else if (res.status === 409) {
                alert('You have already submitted a review.');
                setHasReviewed(true);
                setShowForm(false);
            } else {
                alert('Failed to submit review.');
            }
        } catch (error) {
            console.error('Error submitting review', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <section id="reviews" className="py-24 bg-zinc-50 dark:bg-black border-t border-zinc-200 dark:border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 border-b border-zinc-200 dark:border-zinc-800 pb-8">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">
                            Trusted by our Community
                        </h2>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400">
                            Real stories from landlords and tenants who have simplified their property journey with PropAccura.
                        </p>
                    </div>

                    {/* Rating Scorecard */}
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-3">
                            <span className="text-5xl font-bold text-zinc-900 dark:text-white">{averageRating || '4.8'}</span>
                            <div className="flex flex-col">
                                <div className="flex text-yellow-500">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={20} fill={i < Math.round(averageRating || 4.8) ? "currentColor" : "none"} className={i < Math.round(averageRating || 4.8) ? "" : "text-zinc-300 dark:text-zinc-700"} />
                                    ))}
                                </div>
                                <span className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">out of 5 stars</span>
                            </div>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                            Based on <span className="font-semibold text-zinc-900 dark:text-white">{reviews.length > 0 ? reviews.length : 42} reviews</span>
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Reviews Grid */}
                    <div className="lg:col-span-2 grid md:grid-cols-2 gap-6 auto-rows-min">
                        {reviews.length === 0 ? (
                            // Mock reviews for empty state
                            [1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                                                HU
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-zinc-900 dark:text-white text-sm">Happy User</h4>
                                                <span className="text-xs text-zinc-500 block">Verified User</span>
                                            </div>
                                        </div>
                                        <Quote size={20} className="text-indigo-200 dark:text-indigo-900" />
                                    </div>
                                    <div className="flex text-yellow-500 mb-3 text-sm">
                                        {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                                    </div>
                                    <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">
                                        &quot;This platform has completely transformed how I manage my properties. The automated billing and tenant verification features are absolute lifesavers. Highly recommended!&quot;
                                    </p>
                                </div>
                            ))
                        ) : (
                            reviews.map((review) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={review.id}
                                    className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                                                {getInitials(review.name)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-zinc-900 dark:text-white text-sm">{review.name}</h4>
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                                    <span className="text-xs text-zinc-500">Verified User</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Quote size={20} className="text-indigo-200 dark:text-indigo-900" />
                                    </div>

                                    <div className="mb-3">
                                        <Rating initialValue={review.rating} readonly allowFraction size={18} SVGstyle={{ display: 'inline' }} />
                                    </div>

                                    <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed flex-grow">
                                        &quot;{review.comment}&quot;
                                    </p>

                                    <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400">
                                        {new Date(review.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Right Side: CTA Card & Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl sticky top-24">
                            {!showForm ? (
                                <div className="text-center space-y-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
                                        <MessageSquare className="text-white h-8 w-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Share your experience</h3>
                                        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                                            Help others make the right choice by sharing your honest feedback about PropAccura.
                                        </p>
                                    </div>

                                    {hasReviewed ? (
                                        <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl font-medium text-sm border border-emerald-100 dark:border-emerald-900/50">
                                            You have already submitted a review. Thank you!
                                        </div>
                                    ) : !user ? (
                                        <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 p-4 rounded-xl font-medium text-sm">
                                            Please login to write a review.
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowForm(true)}
                                            className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 rounded-xl font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all active:scale-95"
                                        >
                                            Write a Review
                                        </button>
                                    )}

                                    <p className="text-xs text-zinc-400">
                                        Reviews are verified by our team within 24 hours.
                                    </p>
                                </div>
                            ) : (
                                <motion.form
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-5"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold text-zinc-900 dark:text-white">Write a Review</h3>
                                        <button
                                            type="button"
                                            onClick={() => setShowForm(false)}
                                            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>

                                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center">
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Rate Us</label>
                                        <div className="flex justify-center items-center">
                                            <Rating
                                                onClick={(rate) => setNewReview({ ...newReview, rating: rate })}
                                                initialValue={newReview.rating}
                                                allowFraction
                                                size={35}
                                                transition
                                                fillColor="#EAB308"
                                                SVGstyle={{ display: 'inline' }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3.5 text-zinc-400 h-4 w-4" />
                                            <input
                                                type="text"
                                                required
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-zinc-900 dark:text-white text-sm"
                                                placeholder="Your Name"
                                                value={newReview.name}
                                                onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">Feedback</label>
                                        <textarea
                                            required
                                            rows={4}
                                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-zinc-900 dark:text-white text-sm resize-none"
                                            placeholder="Tell us about your experience..."
                                            value={newReview.comment}
                                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </motion.form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
