'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientClient } from '@/lib/supabase/client';
import Image from 'next/image';

type UserType = 'household' | 'helper';

interface Profile {
  id: string;
  user_id: string;
  created_at: string;
  [key: string]: any; // For other profile fields
}

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
}

interface ProfileWithUser extends Profile {
  user: User;
}

export default function Browse() {
  const router = useRouter();
  const supabase = createClientClient();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<ProfileWithUser[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [matchLoading, setMatchLoading] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error('You must be logged in to view this page');
        }
        
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
          setUserProfile(helperProfile);
          
          // Fetch household profiles for helper to browse
          const { data: householdProfiles, error: profilesError } = await supabase
            .from('household_profiles')
            .select(`
              *,
              user:profiles(*)
            `);
          
          if (!profilesError && householdProfiles) {
            // Filter out profiles that already have matches with this helper
            const { data: existingMatches } = await supabase
              .from('matches')
              .select('household_id')
              .eq('helper_id', helperProfile.id);
            
            const matchedHouseholdIds = existingMatches?.map(match => match.household_id) || [];
            
            const filteredProfiles = householdProfiles.filter(
              profile => !matchedHouseholdIds.includes(profile.id)
            );
            
            setProfiles(filteredProfiles);
          }
        } else if (householdProfile) {
          setUserType('household');
          setUserProfile(householdProfile);
          
          // Fetch helper profiles for household to browse
          const { data: helperProfiles, error: profilesError } = await supabase
            .from('helper_profiles')
            .select(`
              *,
              user:profiles(*)
            `);
          
          if (!profilesError && helperProfiles) {
            // Filter out profiles that already have matches with this household
            const { data: existingMatches } = await supabase
              .from('matches')
              .select('helper_id')
              .eq('household_id', householdProfile.id);
            
            const matchedHelperIds = existingMatches?.map(match => match.helper_id) || [];
            
            const filteredProfiles = helperProfiles.filter(
              profile => !matchedHelperIds.includes(profile.id)
            );
            
            setProfiles(filteredProfiles);
          }
        } else {
          // No profile found, redirect to profile setup
          router.push('/profile-setup');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [supabase, router]);
  
  const handleLike = async () => {
    if (!userProfile || !userType || currentProfileIndex >= profiles.length) return;
    
    const currentProfile = profiles[currentProfileIndex];
    
    try {
      setMatchLoading(true);
      
      // Create a match
      const { error } = await supabase
        .from('matches')
        .insert([
          userType === 'helper' 
            ? {
                helper_id: userProfile.id,
                household_id: currentProfile.id,
                status: 'pending',
                created_at: new Date().toISOString(),
              }
            : {
                helper_id: currentProfile.id,
                household_id: userProfile.id,
                status: 'pending',
                created_at: new Date().toISOString(),
              }
        ]);
      
      if (error) throw error;
      
      // Move to next profile
      setCurrentProfileIndex(prev => prev + 1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setMatchLoading(false);
    }
  };
  
  const handleDislike = () => {
    // Simply move to the next profile
    setCurrentProfileIndex(prev => prev + 1);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-primary-100/30 to-transparent opacity-70"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-secondary-100/30 to-transparent opacity-70"></div>
        </div>
        
        <div className="card bg-white/90 backdrop-blur-sm shadow-hover border border-gray-100 p-8 rounded-2xl animate-pulse max-w-md w-full">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="h-6 w-2/3 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-4 w-4/6 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="text-primary-600 font-medium animate-pulse flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading profiles...
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-primary-100/30 to-transparent opacity-70"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-secondary-100/30 to-transparent opacity-70"></div>
        </div>
        
        <div className="max-w-md w-full">
          <div className="card bg-white/90 backdrop-blur-sm shadow-hover border border-gray-100 p-8 rounded-2xl animate-fade-in">
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
            <button 
              onClick={() => router.push('/dashboard')} 
              className="btn-primary w-full py-3 rounded-xl shadow-button transition-all duration-300 transform hover:translate-y-[-2px] group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center font-bold">
                Back to Dashboard
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
              <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!userProfile || !userType) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-primary-100/30 to-transparent opacity-70"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-secondary-100/30 to-transparent opacity-70"></div>
        </div>
        
        <div className="max-w-md w-full">
          <div className="card bg-white/90 backdrop-blur-sm shadow-hover border border-gray-100 p-8 rounded-2xl animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner-glow">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2 gradient-text-subtle">Profile Required</h2>
              <p className="text-gray-600">Please complete your profile setup to continue.</p>
            </div>
            
            <button 
              onClick={() => router.push('/profile-setup')} 
              className="btn-primary w-full py-3 rounded-xl shadow-button transition-all duration-300 transform hover:translate-y-[-2px] group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center font-bold">
                Set Up Profile
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
              <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (profiles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-primary-100/30 to-transparent opacity-70"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-secondary-100/30 to-transparent opacity-70"></div>
        </div>
        
        <div className="max-w-md w-full">
          <div className="card bg-white/90 backdrop-blur-sm shadow-hover border border-gray-100 p-8 rounded-2xl animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-secondary-100 text-secondary-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner-glow">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2 gradient-text-subtle">No Profiles Available</h2>
              <p className="text-gray-600 mb-4">
                We couldn't find any {userType === 'helper' ? 'households' : 'helpers'} for you to browse right now.
              </p>
              <p className="text-gray-600 mb-4">
                Check back later or update your profile to improve your matching chances.
              </p>
            </div>
            
            <button 
              onClick={() => router.push('/dashboard')} 
              className="btn-primary w-full py-3 rounded-xl shadow-button transition-all duration-300 transform hover:translate-y-[-2px] group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center font-bold">
                Back to Dashboard
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
              <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (currentProfileIndex >= profiles.length) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-primary-100/30 to-transparent opacity-70"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-secondary-100/30 to-transparent opacity-70"></div>
        </div>
        
        <div className="max-w-md w-full">
          <div className="card bg-white/90 backdrop-blur-sm shadow-hover border border-gray-100 p-8 rounded-2xl animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner-glow">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2 gradient-text-subtle">All Caught Up!</h2>
              <p className="text-gray-600 mb-4">
                You've viewed all available {userType === 'helper' ? 'households' : 'helpers'} for now.
              </p>
              <p className="text-gray-600 mb-4">
                Check back later for new profiles or view your current matches.
              </p>
            </div>
            
            <button 
              onClick={() => router.push('/dashboard')} 
              className="btn-primary w-full py-3 rounded-xl shadow-button transition-all duration-300 transform hover:translate-y-[-2px] group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center font-bold">
                View Matches
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
              <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentProfileIndex];

  return (
    <div className="min-h-screen px-4 py-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-primary-100/30 to-transparent opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-secondary-100/30 to-transparent opacity-70"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-100 rounded-full blur-3xl opacity-20 float-animation" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary-100 rounded-full blur-3xl opacity-20 float-animation" style={{animationDelay: '1.5s'}}></div>
        
        {/* Decorative shapes */}
        <div className="absolute top-20 left-20 w-12 h-12 border-2 border-primary-200 rounded-lg rotate-12 opacity-30"></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 border-2 border-secondary-200 rounded-full opacity-30"></div>
        <div className="absolute top-1/2 right-32 w-8 h-8 bg-accent-200 rounded-md rotate-45 opacity-30"></div>
      </div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold gradient-text-subtle animate-shimmer">
            Browse {userType === 'helper' ? 'Households' : 'Helpers'}
          </h1>
          <button 
            onClick={() => router.push('/dashboard')} 
            className="btn-secondary rounded-xl shadow-button transition-all duration-300 transform hover:translate-y-[-2px] group relative overflow-hidden flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </button>
        </div>
        
        <div className="max-w-md mx-auto">
          <div className="card bg-white/90 backdrop-blur-sm shadow-hover border border-gray-100 rounded-2xl overflow-hidden animate-fade-in">
            {/* Profile Card */}
            <div className="relative">
              {/* Profile Image */}
              <div className="h-56 bg-gradient-conic from-primary-400 via-secondary-400 to-accent-400 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-shine opacity-20"></div>
                <div className="relative z-10">
                  {currentProfile.user.avatar_url ? (
                    <div className="rounded-full border-4 border-white shadow-lg transform transition-transform duration-500 hover:scale-105">
                      <Image 
                        src={currentProfile.user.avatar_url} 
                        alt={currentProfile.user.full_name} 
                        width={140} 
                        height={140}
                        className="rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center text-primary-500 text-5xl font-light border-4 border-white shadow-lg transform transition-transform duration-500 hover:scale-105">
                      {currentProfile.user.full_name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Profile Info */}
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-4 text-center">{currentProfile.user.full_name}</h2>
                
                {userType === 'helper' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Looking for
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {currentProfile.help_type?.map((type: string) => (
                          <span key={type} className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm transition-all duration-300 hover:shadow-md hover:bg-primary-200">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Location
                      </h3>
                      <p className="text-gray-700 font-medium">{currentProfile.location}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Accommodation
                      </h3>
                      <p className="text-gray-700 font-medium">{currentProfile.preferences?.live_in ? 'Live-in' : 'Live-out'}</p>
                    </div>
                    
                    {currentProfile.additional_info && (
                      <div>
                        <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Additional Information
                        </h3>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">{currentProfile.additional_info}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {userType === 'household' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Skills
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {currentProfile.skills?.map((skill: string) => (
                          <span key={skill} className="bg-secondary-100 text-secondary-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm transition-all duration-300 hover:shadow-md hover:bg-secondary-200">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Experience
                      </h3>
                      <p className="text-gray-700 font-medium">{currentProfile.experience_years} years</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Location
                      </h3>
                      <p className="text-gray-700 font-medium">{currentProfile.location}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Work Preference
                      </h3>
                      <p className="text-gray-700 font-medium capitalize">{currentProfile.work_preference?.replace('_', '-')}</p>
                    </div>
                    
                    {currentProfile.bio && (
                      <div>
                        <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Bio
                        </h3>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">{currentProfile.bio}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex p-6 border-t border-gray-100 gap-4">
              <button 
                onClick={handleDislike}
                disabled={matchLoading}
                className="flex-1 py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-300 font-medium flex items-center justify-center shadow-sm hover:shadow-md group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500 group-hover:-translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Skip
              </button>
              <button 
                onClick={handleLike}
                disabled={matchLoading}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl transition-all duration-300 font-medium flex items-center justify-center shadow-button hover:shadow-lg transform hover:translate-y-[-2px] group"
              >
                {matchLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Matching...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white group-hover:scale-110 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    Like
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="text-center mt-6 text-gray-600 text-sm bg-white/80 backdrop-blur-sm py-2 px-4 rounded-full shadow-sm inline-block mx-auto">
            Profile {currentProfileIndex + 1} of {profiles.length}
          </div>
        </div>
      </div>
    </div>
  );
}