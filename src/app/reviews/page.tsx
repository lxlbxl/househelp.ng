'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientClient } from '@/lib/supabase/client';

type UserType = 'household' | 'helper';

interface Match {
  id: string;
  helper_id: string;
  household_id: string;
  status: 'pending' | 'matched' | 'rejected';
  created_at: string;
  helper_profile?: {
    id: string;
    user_id: string;
    full_name: string;
    profile_picture?: string;
    skills?: string[];
    rating?: number;
  };
  household_profile?: {
    id: string;
    user_id: string;
    full_name: string;
    profile_picture?: string;
    location?: string;
    rating?: number;
  };
}

interface Review {
  id?: string;
  reviewer_id: string;
  reviewee_id: string;
  match_id: string;
  rating: number;
  comment: string;
  created_at?: string;
}

export default function Reviews() {
  const router = useRouter();
  const supabase = createClientClient();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [reviewsForMe, setReviewsForMe] = useState<Review[]>([]);
  
  // Review form state
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error('You must be logged in to access reviews');
        }
        
        setUserId(user.id);
        
        // Check if user has a helper profile
        const { data: helperProfile, error: helperError } = await supabase
          .from('helper_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        // Check if user has a household profile
        const { data: householdProfile, error: householdError } = await supabase
          .from('household_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (helperProfile) {
          setUserType('helper');
          await fetchHelperData(user.id, helperProfile.id);
        } else if (householdProfile) {
          setUserType('household');
          await fetchHouseholdData(user.id, householdProfile.id);
        } else {
          // No profile found, redirect to profile setup
          router.push('/profile-setup');
          return;
        }
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [supabase, router]);
  
  const fetchHelperData = async (userId: string, helperId: string) => {
    try {
      // Fetch matches for this helper
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          household_profile:household_profiles(*)
        `)
        .eq('helper_id', helperId)
        .eq('status', 'matched');
      
      if (matchesError) throw matchesError;
      
      setMatches(matchesData || []);
      
      // Fetch reviews written by this user
      const { data: myReviewsData, error: myReviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewer_id', userId);
      
      if (myReviewsError) throw myReviewsError;
      
      setMyReviews(myReviewsData || []);
      
      // Fetch reviews written for this user
      const { data: reviewsForMeData, error: reviewsForMeError } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewee_id', userId);
      
      if (reviewsForMeError) throw reviewsForMeError;
      
      setReviewsForMe(reviewsForMeData || []);
      
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const fetchHouseholdData = async (userId: string, householdId: string) => {
    try {
      // Fetch matches for this household
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          helper_profile:helper_profiles(*)
        `)
        .eq('household_id', householdId)
        .eq('status', 'matched');
      
      if (matchesError) throw matchesError;
      
      setMatches(matchesData || []);
      
      // Fetch reviews written by this user
      const { data: myReviewsData, error: myReviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewer_id', userId);
      
      if (myReviewsError) throw myReviewsError;
      
      setMyReviews(myReviewsData || []);
      
      // Fetch reviews written for this user
      const { data: reviewsForMeData, error: reviewsForMeError } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewee_id', userId);
      
      if (reviewsForMeError) throw reviewsForMeError;
      
      setReviewsForMe(reviewsForMeData || []);
      
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const handleSelectMatch = (match: Match) => {
    setSelectedMatch(match);
    setRating(5);
    setComment('');
  };
  
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !selectedMatch) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Determine reviewee ID based on user type
      const revieweeId = userType === 'helper' 
        ? selectedMatch.household_profile?.user_id
        : selectedMatch.helper_profile?.user_id;
      
      if (!revieweeId) {
        throw new Error('Could not determine who to review');
      }
      
      // Check if user has already reviewed this match
      const existingReviewIndex = myReviews.findIndex(review => 
        review.match_id === selectedMatch.id && review.reviewee_id === revieweeId
      );
      
      if (existingReviewIndex >= 0) {
        // Update existing review
        const { error: updateError } = await supabase
          .from('reviews')
          .update({
            rating,
            comment,
          })
          .eq('id', myReviews[existingReviewIndex].id);
        
        if (updateError) throw updateError;
        
        // Update local state
        const updatedReviews = [...myReviews];
        updatedReviews[existingReviewIndex] = {
          ...updatedReviews[existingReviewIndex],
          rating,
          comment,
        };
        
        setMyReviews(updatedReviews);
        
      } else {
        // Create new review
        const { data: newReview, error: createError } = await supabase
          .from('reviews')
          .insert({
            reviewer_id: userId,
            reviewee_id: revieweeId,
            match_id: selectedMatch.id,
            rating,
            comment,
          })
          .select()
          .single();
        
        if (createError) throw createError;
        
        // Update local state
        setMyReviews([...myReviews, newReview]);
      }
      
      // Reset form
      setSelectedMatch(null);
      setRating(5);
      setComment('');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const hasReviewedMatch = (matchId: string, revieweeId: string) => {
    return myReviews.some(review => 
      review.match_id === matchId && review.reviewee_id === revieweeId
    );
  };
  
  const getExistingReview = (matchId: string, revieweeId: string) => {
    return myReviews.find(review => 
      review.match_id === matchId && review.reviewee_id === revieweeId
    );
  };
  
  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-md inline-block mb-4">
          {error}
        </div>
        <button 
          onClick={() => router.push('/dashboard')} 
          className="btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Reviews & Ratings</h1>
          <button 
            onClick={() => router.push('/dashboard')} 
            className="btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>
        
        {/* Reviews I've Received */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Reviews I've Received</h2>
          
          {reviewsForMe.length === 0 ? (
            <p className="text-gray-500">You haven't received any reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviewsForMe.map((review) => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex items-center mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg 
                          key={star} 
                          className={`w-5 h-5 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-2 text-gray-600">{review.rating}/5</span>
                    </div>
                    <span className="ml-auto text-sm text-gray-500">{formatDate(review.created_at || '')}</span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* My Matches to Review */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">My Matches</h2>
          
          {matches.length === 0 ? (
            <p className="text-gray-500">You don't have any matches to review yet.</p>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => {
                const matchProfile = userType === 'helper' ? match.household_profile : match.helper_profile;
                const revieweeId = matchProfile?.user_id;
                const existingReview = revieweeId ? getExistingReview(match.id, revieweeId) : null;
                
                return (
                  <div key={match.id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{matchProfile?.full_name}</h3>
                      <p className="text-sm text-gray-500">Matched on {formatDate(match.created_at)}</p>
                    </div>
                    
                    {existingReview ? (
                      <div className="flex items-center">
                        <div className="flex mr-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg 
                              key={star} 
                              className={`w-4 h-4 ${star <= existingReview.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <button 
                          onClick={() => handleSelectMatch(match)}
                          className="text-primary-600 hover:text-primary-800 text-sm"
                        >
                          Edit Review
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleSelectMatch(match)}
                        className="btn-primary text-sm py-1 px-3"
                      >
                        Leave Review
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Review Form */}
        {selectedMatch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  Review {userType === 'helper' ? selectedMatch.household_profile?.full_name : selectedMatch.helper_profile?.full_name}
                </h3>
                <button 
                  onClick={() => setSelectedMatch(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium">Rating</label>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <svg 
                          className={`w-8 h-8 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="comment" className="block mb-2 font-medium">Comment</label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="input w-full h-32"
                    placeholder="Share your experience working with this person..."
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button 
                    type="button"
                    onClick={() => setSelectedMatch(null)}
                    className="btn-secondary"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}