'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientClient } from '@/lib/supabase/client';
import Link from 'next/link';

type ReputationData = {
  success: boolean;
  reputation: {
    total_reviews: number;
    average_rating: number;
    average_response_time: number;
    average_helper_quality: number;
    reliability_index: number;
    reviews: Array<{
      id: string;
      rating: number;
      comment: string;
      response_time_rating: number;
      helper_quality_rating: number;
      created_at: string;
      reviewer: {
        full_name: string;
        avatar_url: string;
      };
    }>;
  };
};

export default function AgencyReputation() {
  const router = useRouter();
  const supabase = createClientClient();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reputationData, setReputationData] = useState<ReputationData | null>(null);
  const [showResponseForm, setShowResponseForm] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [responseError, setResponseError] = useState<string | null>(null);
  const [responseSuccess, setResponseSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchReputationData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error('You must be logged in to view this page');
        }
        
        // Check if user has an agency profile
        const { data: agencyProfile, error: agencyError } = await supabase
          .from('agency_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (agencyError || !agencyProfile) {
          // Redirect to agency registration if no profile found
          router.push('/agency/register');
          return;
        }
        
        // Fetch agency reputation data
        const response = await fetch('/api/agency/reputation');
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch reputation data');
        }
        
        setReputationData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReputationData();
  }, [supabase, router]);

  const handleResponseSubmit = async (reviewId: string) => {
    // This would be implemented to allow agencies to respond to reviews
    // For now, it's a placeholder
    setResponseError(null);
    setResponseSuccess(null);
    
    try {
      if (!responseText.trim()) {
        throw new Error('Response cannot be empty');
      }
      
      // In a real implementation, this would send the response to the API
      // await fetch(`/api/agency/reputation/${reviewId}/response`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ response: responseText }),
      // });
      
      setResponseSuccess('Response submitted successfully');
      
      // Reset form
      setResponseText('');
      setShowResponseForm(null);
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setResponseSuccess(null);
      }, 2000);
      
    } catch (error: any) {
      setResponseError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse">Loading reputation data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-md inline-block">
          {error}
        </div>
        <div className="mt-4">
          <button 
            onClick={() => router.push('/agency/register')} 
            className="btn-primary"
          >
            Register Agency
          </button>
        </div>
      </div>
    );
  }

  if (!reputationData) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div>No reputation data found. Please try again later.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Reputation & Reviews</h1>
        <button 
          onClick={() => router.push('/agency/dashboard')}
          className="btn-secondary"
        >
          Back to Dashboard
        </button>
      </div>
      
      {/* Reputation Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 text-center">
          <div className="text-4xl font-bold text-primary-500 mb-2">
            {reputationData.reputation.average_rating.toFixed(1)}
          </div>
          <div className="text-gray-500">Average Rating</div>
          <div className="text-sm text-gray-400 mt-1">
            {reputationData.reputation.total_reviews} review{reputationData.reputation.total_reviews !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="card p-6 text-center">
          <div className="text-4xl font-bold text-primary-500 mb-2">
            {reputationData.reputation.reliability_index.toFixed(1)}
          </div>
          <div className="text-gray-500">Reliability Index</div>
          <div className="text-sm text-gray-400 mt-1">
            Based on performance metrics
          </div>
        </div>
        
        <div className="card p-6 text-center">
          <div className="text-4xl font-bold text-primary-500 mb-2">
            {reputationData.reputation.average_response_time.toFixed(1)}
          </div>
          <div className="text-gray-500">Avg. Response Time</div>
          <div className="text-sm text-gray-400 mt-1">
            Rating from clients
          </div>
        </div>
      </div>
      
      {/* Review Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Helper Quality</h3>
          <div className="flex items-center">
            <div className="flex-1 bg-gray-200 rounded-full h-2.5 mr-2">
              <div 
                className="bg-primary-500 h-2.5 rounded-full" 
                style={{ width: `${(reputationData.reputation.average_helper_quality / 5) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">
              {reputationData.reputation.average_helper_quality.toFixed(1)}/5
            </span>
          </div>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Response Time</h3>
          <div className="flex items-center">
            <div className="flex-1 bg-gray-200 rounded-full h-2.5 mr-2">
              <div 
                className="bg-primary-500 h-2.5 rounded-full" 
                style={{ width: `${(reputationData.reputation.average_response_time / 5) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">
              {reputationData.reputation.average_response_time.toFixed(1)}/5
            </span>
          </div>
        </div>
      </div>
      
      {/* Reviews List */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-6">Client Reviews</h2>
        
        {reputationData.reputation.reviews.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
            <p className="mt-1 text-sm text-gray-500">Once clients start reviewing your agency, they will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reputationData.reputation.reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {review.reviewer.avatar_url ? (
                        <img className="h-10 w-10 rounded-full" src={review.reviewer.avatar_url} alt="" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 font-medium">
                            {review.reviewer.full_name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">{review.reviewer.full_name}</h4>
                      <div className="flex items-center mt-1">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {review.comment && (
                  <p className="text-gray-700 mb-3">{review.comment}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-3">
                  <div>
                    <span className="font-medium">Response Time:</span>{' '}
                    {review.response_time_rating ? `${review.response_time_rating}/5` : 'Not rated'}
                  </div>
                  <div>
                    <span className="font-medium">Helper Quality:</span>{' '}
                    {review.helper_quality_rating ? `${review.helper_quality_rating}/5` : 'Not rated'}
                  </div>
                </div>
                
                <button
                  onClick={() => setShowResponseForm(showResponseForm === review.id ? null : review.id)}
                  className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                >
                  {showResponseForm === review.id ? 'Cancel Response' : 'Respond to Review'}
                </button>
                
                {showResponseForm === review.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    {responseSuccess && (
                      <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4">
                        {responseSuccess}
                      </div>
                    )}
                    
                    {responseError && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                        {responseError}
                      </div>
                    )}
                    
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md mb-3"
                      rows={3}
                      placeholder="Enter your response to this review..."
                    ></textarea>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleResponseSubmit(review.id)}
                        className="btn-primary text-sm"
                      >
                        Submit Response
                      </button>
                      <button
                        onClick={() => {
                          setShowResponseForm(null);
                          setResponseText('');
                          setResponseError(null);
                        }}
                        className="btn-secondary text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
