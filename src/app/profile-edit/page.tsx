'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientClient } from '@/lib/supabase/client';

type UserType = 'household' | 'helper';

interface HelperProfile {
  id: string;
  user_id: string;
  skills: string[];
  experience_years: number;
  bio: string;
  availability: 'immediate' | 'date';
  availability_date?: string;
  work_preference: 'live_in' | 'live_out' | 'both';
  location: string;
  languages: string[];
  expected_salary?: number;
}

interface HouseholdProfile {
  id: string;
  user_id: string;
  location: string;
  help_type: string[];
  preferences: {
    live_in: boolean;
    age_range: [number, number];
    languages: string[];
    religion?: string;
  };
  additional_info: string;
}

export default function ProfileEdit() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientClient();
  
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Helper profile state
  const [helperProfile, setHelperProfile] = useState<HelperProfile | null>(null);
  
  // Household profile state
  const [householdProfile, setHouseholdProfile] = useState<HouseholdProfile | null>(null);
  
  // Available options
  const skillOptions = [
    'Cleaning', 'Cooking', 'Childcare', 'Elderly Care', 
    'Laundry', 'Gardening', 'Driving', 'Pet Care'
  ];
  
  const languageOptions = [
    'English', 'Yoruba', 'Hausa', 'Igbo', 'Pidgin', 'French'
  ];
  
  const helpTypeOptions = [
    'Maid', 'Nanny', 'Cook', 'Cleaner', 'Driver', 'Gardener', 'Caregiver'
  ];

  useEffect(() => {
    // Check if user type is specified in URL
    const typeParam = searchParams.get('type') as UserType;
    if (typeParam === 'household' || typeParam === 'helper') {
      setUserType(typeParam);
    } else {
      // If no type specified, redirect to dashboard
      router.push('/dashboard');
    }
    
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error('You must be logged in to edit your profile');
        }
        
        setUserId(user.id);
        
        if (typeParam === 'helper') {
          // Fetch helper profile
          const { data: helperData, error: helperError } = await supabase
            .from('helper_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (helperError) {
            throw helperError;
          }
          
          setHelperProfile(helperData);
        } else if (typeParam === 'household') {
          // Fetch household profile
          const { data: householdData, error: householdError } = await supabase
            .from('household_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (householdError) {
            throw householdError;
          }
          
          setHouseholdProfile(householdData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [searchParams, router, supabase]);

  // Helper functions for form updates
  const updateHelperProfile = (field: keyof HelperProfile, value: any) => {
    if (!helperProfile) return;
    
    setHelperProfile(prev => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };
  
  const updateHouseholdProfile = (field: keyof HouseholdProfile, value: any) => {
    if (!householdProfile) return;
    
    setHouseholdProfile(prev => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };
  
  const toggleHelperSkill = (skill: string) => {
    if (!helperProfile) return;
    
    setHelperProfile(prev => {
      if (!prev) return prev;
      
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills };
    });
  };
  
  const toggleHouseholdHelpType = (type: string) => {
    if (!householdProfile) return;
    
    setHouseholdProfile(prev => {
      if (!prev) return prev;
      
      const help_type = prev.help_type.includes(type)
        ? prev.help_type.filter(t => t !== type)
        : [...prev.help_type, type];
      return { ...prev, help_type };
    });
  };
  
  const toggleLanguage = (language: string, isHelper: boolean) => {
    if (isHelper && helperProfile) {
      setHelperProfile(prev => {
        if (!prev) return prev;
        
        const languages = prev.languages.includes(language)
          ? prev.languages.filter(l => l !== language)
          : [...prev.languages, language];
        return { ...prev, languages };
      });
    } else if (!isHelper && householdProfile) {
      setHouseholdProfile(prev => {
        if (!prev) return prev;
        
        const languages = prev.preferences.languages.includes(language)
          ? prev.preferences.languages.filter(l => l !== language)
          : [...prev.preferences.languages, language];
        return { 
          ...prev, 
          preferences: { ...prev.preferences, languages } 
        };
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !userType) return;
    
    setSaving(true);
    setError(null);
    
    try {
      if (userType === 'helper' && helperProfile) {
        // Update helper profile
        const { error } = await supabase
          .from('helper_profiles')
          .update({
            ...helperProfile,
            updated_at: new Date().toISOString(),
          })
          .eq('id', helperProfile.id);
          
        if (error) throw error;
      } else if (userType === 'household' && householdProfile) {
        // Update household profile
        const { error } = await supabase
          .from('household_profiles')
          .update({
            ...householdProfile,
            updated_at: new Date().toISOString(),
          })
          .eq('id', householdProfile.id);
          
        if (error) throw error;
      }
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving your profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading your profile...</div>;
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

  if (!userType || (userType === 'helper' && !helperProfile) || (userType === 'household' && !householdProfile)) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div>No profile found. Please complete your profile setup first.</div>
        <div className="mt-4">
          <button 
            onClick={() => router.push('/profile-setup')} 
            className="btn-primary"
          >
            Set Up Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto card">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Edit Your {userType === 'helper' ? 'Helper' : 'Household'} Profile
          </h1>
          <button 
            onClick={() => router.push('/dashboard')} 
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Helper Profile Form */}
          {userType === 'helper' && helperProfile && (
            <>
              <div>
                <label className="label">Your Skills</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {skillOptions.map(skill => (
                    <div 
                      key={skill}
                      onClick={() => toggleHelperSkill(skill)}
                      className={`border rounded-md p-2 text-center cursor-pointer transition-colors ${
                        helperProfile.skills.includes(skill)
                          ? 'bg-primary-100 border-primary-500 text-primary-700'
                          : 'border-gray-300 hover:border-primary-300'
                      }`}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="experience" className="label">
                  Years of Experience
                </label>
                <input
                  id="experience"
                  type="number"
                  min="0"
                  max="50"
                  value={helperProfile.experience_years}
                  onChange={(e) => updateHelperProfile('experience_years', parseInt(e.target.value))}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="bio" className="label">
                  Bio / About Me
                </label>
                <textarea
                  id="bio"
                  value={helperProfile.bio}
                  onChange={(e) => updateHelperProfile('bio', e.target.value)}
                  className="input min-h-[100px]"
                  required
                  placeholder="Tell potential employers about yourself, your experience, and why you're a great choice..."
                />
              </div>
              
              <div>
                <label className="label">Work Preference</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={helperProfile.work_preference === 'live_in'}
                      onChange={() => updateHelperProfile('work_preference', 'live_in')}
                      className="mr-2"
                    />
                    Live-in
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={helperProfile.work_preference === 'live_out'}
                      onChange={() => updateHelperProfile('work_preference', 'live_out')}
                      className="mr-2"
                    />
                    Live-out
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={helperProfile.work_preference === 'both'}
                      onChange={() => updateHelperProfile('work_preference', 'both')}
                      className="mr-2"
                    />
                    Both
                  </label>
                </div>
              </div>
              
              <div>
                <label className="label">Availability</label>
                <div className="flex space-x-4 mb-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={helperProfile.availability === 'immediate'}
                      onChange={() => updateHelperProfile('availability', 'immediate')}
                      className="mr-2"
                    />
                    Immediate
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={helperProfile.availability === 'date'}
                      onChange={() => updateHelperProfile('availability', 'date')}
                      className="mr-2"
                    />
                    From a specific date
                  </label>
                </div>
                
                {helperProfile.availability === 'date' && (
                  <input
                    type="date"
                    value={helperProfile.availability_date || ''}
                    onChange={(e) => updateHelperProfile('availability_date', e.target.value)}
                    className="input"
                    required
                  />
                )}
              </div>
              
              <div>
                <label htmlFor="location" className="label">
                  Location (City/State)
                </label>
                <input
                  id="location"
                  type="text"
                  value={helperProfile.location}
                  onChange={(e) => updateHelperProfile('location', e.target.value)}
                  className="input"
                  required
                  placeholder="e.g. Lagos, Nigeria"
                />
              </div>
              
              <div>
                <label className="label">Languages Spoken</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {languageOptions.map(language => (
                    <div 
                      key={language}
                      onClick={() => toggleLanguage(language, true)}
                      className={`border rounded-md p-2 text-center cursor-pointer transition-colors ${
                        helperProfile.languages.includes(language)
                          ? 'bg-primary-100 border-primary-500 text-primary-700'
                          : 'border-gray-300 hover:border-primary-300'
                      }`}
                    >
                      {language}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="expected_salary" className="label">
                  Expected Monthly Salary (₦)
                </label>
                <input
                  id="expected_salary"
                  type="number"
                  min="0"
                  step="1000"
                  value={helperProfile.expected_salary || ''}
                  onChange={(e) => updateHelperProfile('expected_salary', parseFloat(e.target.value) || 0)}
                  className="input"
                  placeholder="e.g. 50000"
                />
                <p className="text-sm text-gray-600 mt-1">
                  This is your expected monthly salary and is subject to negotiation with households.
                </p>
              </div>
            </>
          )}
          
          {/* Household Profile Form */}
          {userType === 'household' && householdProfile && (
            <>
              <div>
                <label htmlFor="location" className="label">
                  Location (City/State)
                </label>
                <input
                  id="location"
                  type="text"
                  value={householdProfile.location}
                  onChange={(e) => updateHouseholdProfile('location', e.target.value)}
                  className="input"
                  required
                  placeholder="e.g. Lagos, Nigeria"
                />
              </div>
              
              <div>
                <label className="label">Type of Help Needed</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {helpTypeOptions.map(type => (
                    <div 
                      key={type}
                      onClick={() => toggleHouseholdHelpType(type)}
                      className={`border rounded-md p-2 text-center cursor-pointer transition-colors ${
                        householdProfile.help_type.includes(type)
                          ? 'bg-primary-100 border-primary-500 text-primary-700'
                          : 'border-gray-300 hover:border-primary-300'
                      }`}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="label">Accommodation Preference</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={householdProfile.preferences.live_in}
                      onChange={() => setHouseholdProfile(prev => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          preferences: { ...prev.preferences, live_in: true }
                        };
                      })}
                      className="mr-2"
                    />
                    Live-in
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!householdProfile.preferences.live_in}
                      onChange={() => setHouseholdProfile(prev => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          preferences: { ...prev.preferences, live_in: false }
                        };
                      })}
                      className="mr-2"
                    />
                    Live-out
                  </label>
                </div>
              </div>
              
              <div>
                <label className="label">Age Range Preference</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    min="18"
                    max="70"
                    value={householdProfile.preferences.age_range[0]}
                    onChange={(e) => setHouseholdProfile(prev => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        preferences: { 
                          ...prev.preferences, 
                          age_range: [parseInt(e.target.value), prev.preferences.age_range[1]] 
                        }
                      };
                    })}
                    className="input w-24"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    min="18"
                    max="70"
                    value={householdProfile.preferences.age_range[1]}
                    onChange={(e) => setHouseholdProfile(prev => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        preferences: { 
                          ...prev.preferences, 
                          age_range: [prev.preferences.age_range[0], parseInt(e.target.value)] 
                        }
                      };
                    })}
                    className="input w-24"
                  />
                </div>
              </div>
              
              <div>
                <label className="label">Preferred Languages</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {languageOptions.map(language => (
                    <div 
                      key={language}
                      onClick={() => toggleLanguage(language, false)}
                      className={`border rounded-md p-2 text-center cursor-pointer transition-colors ${
                        householdProfile.preferences.languages.includes(language)
                          ? 'bg-primary-100 border-primary-500 text-primary-700'
                          : 'border-gray-300 hover:border-primary-300'
                      }`}
                    >
                      {language}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="religion" className="label">
                  Religious Preference (Optional)
                </label>
                <select
                  id="religion"
                  value={householdProfile.preferences.religion || ''}
                  onChange={(e) => setHouseholdProfile(prev => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      preferences: { ...prev.preferences, religion: e.target.value || undefined }
                    };
                  })}
                  className="input"
                >
                  <option value="">No Preference</option>
                  <option value="Christian">Christian</option>
                  <option value="Muslim">Muslim</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="additional_info" className="label">
                  Additional Information
                </label>
                <textarea
                  id="additional_info"
                  value={householdProfile.additional_info}
                  onChange={(e) => updateHouseholdProfile('additional_info', e.target.value)}
                  className="input min-h-[100px]"
                  placeholder="Any other details or requirements you'd like to share..."
                />
              </div>
            </>
          )}
          
          <div className="flex space-x-4">
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={saving}
            >
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
            <button 
              type="button"
              onClick={() => router.push('/dashboard')} 
              className="btn-secondary flex-1"
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}