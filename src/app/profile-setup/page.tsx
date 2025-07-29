'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, User, MapPin, Clock, DollarSign, FileText, Home, Users, ArrowRight, Briefcase } from 'lucide-react';

type UserType = 'household' | 'helper';

interface HelperProfile {
  services: string[];
  experience_years: number;
  bio: string;
  location: string;
  hourly_rate?: number;
}

interface HouseholdProfile {
  location: string;
  preferred_services: string[];
  household_size?: number;
  budget_range?: string;
  special_requirements?: string;
}

export default function ProfileSetup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientClient();
  
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(false);
  
  // Helper profile state
  const [helperProfile, setHelperProfile] = useState<HelperProfile>({
    services: [],
    experience_years: 0,
    bio: '',
    location: '',
  });
  
  // Household profile state
  const [householdProfile, setHouseholdProfile] = useState<HouseholdProfile>({
    location: '',
    preferred_services: [],
  });
  
  // Available options
  const serviceOptions = [
    'Cleaning', 'Cooking', 'Childcare', 'Elderly Care', 
    'Laundry', 'Gardening', 'Driving', 'Pet Care'
  ];

  useEffect(() => {
    // Check if user type is specified in URL
    const typeParam = searchParams.get('type') as UserType;
    if (typeParam === 'household' || typeParam === 'helper') {
      setUserType(typeParam);
    } else {
      // If no type specified, try to get it from user profile
      const getUserType = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', user.id)
            .single();
          
          if (profile?.user_type) {
            setUserType(profile.user_type as UserType);
          } else {
            // If no user type in profile, show user type selection
            setShowUserTypeSelection(true);
          }
        } else {
          // If no user is logged in, redirect to login
          router.push('/login');
        }
      };
      
      getUserType();
    }
    
    // Get current user if not already set
    if (!userId) {
      const getUser = async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          // If no user is logged in, redirect to login
          router.push('/login');
        } else {
          setUserId(user.id);
        }
      };
      
      getUser();
    }
  }, [searchParams, router, supabase, userId]);

  // Handle user type selection
  const handleUserTypeSelection = async (selectedType: UserType) => {
    if (!userId) return;
    
    try {
      // Update the user's profile with the selected type
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: selectedType })
        .eq('id', userId);
      
      if (error) throw error;
      
      setUserType(selectedType);
      setShowUserTypeSelection(false);
    } catch (error: any) {
      setError(error.message || 'Failed to update user type');
    }
  };

  // Helper functions for form updates
  const updateHelperProfile = (field: keyof HelperProfile, value: any) => {
    setHelperProfile(prev => ({ ...prev, [field]: value }));
  };
  
  const updateHouseholdProfile = (field: keyof HouseholdProfile, value: any) => {
    setHouseholdProfile(prev => ({ ...prev, [field]: value }));
  };
  
  const toggleHelperService = (service: string) => {
    setHelperProfile(prev => {
      const services = prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service];
      return { ...prev, services };
    });
  };
  
  const toggleHouseholdService = (service: string) => {
    setHouseholdProfile(prev => {
      const preferred_services = prev.preferred_services.includes(service)
        ? prev.preferred_services.filter(s => s !== service)
        : [...prev.preferred_services, service];
      return { ...prev, preferred_services };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !userType) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (userType === 'helper') {
        // Update helper profile
        const { error } = await supabase
          .from('helper_profiles')
          .insert([
            {
              user_id: userId,
              ...helperProfile,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);
          
        if (error) throw error;
      } else {
        // Update household profile
        const { error } = await supabase
          .from('household_profiles')
          .insert([
            {
              user_id: userId,
              ...householdProfile,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);
          
        if (error) throw error;
      }
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'An error occurred while saving your profile');
    } finally {
      setLoading(false);
    }
  };

  // Show user type selection if needed
  if (showUserTypeSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">Choose Your Role</CardTitle>
            <CardDescription className="text-gray-300">
              Are you looking to hire help or offer your services?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
                {error}
              </div>
            )}
            <Button
              onClick={() => handleUserTypeSelection('household')}
              variant="outline"
              className="w-full h-auto p-6 border-white/20 text-white hover:bg-primary/20 hover:border-primary/50"
            >
              <div className="flex items-center space-x-4">
                <Users className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <h3 className="font-semibold">Household</h3>
                  <p className="text-sm text-gray-300">Looking to hire domestic help</p>
                </div>
                <ArrowRight className="h-5 w-5 ml-auto" />
              </div>
            </Button>
            <Button
              onClick={() => handleUserTypeSelection('helper')}
              variant="outline"
              className="w-full h-auto p-6 border-white/20 text-white hover:bg-secondary/20 hover:border-secondary/50"
            >
              <div className="flex items-center space-x-4">
                <Briefcase className="h-8 w-8 text-secondary" />
                <div className="text-left">
                  <h3 className="font-semibold">Helper</h3>
                  <p className="text-sm text-gray-300">Offering my domestic services</p>
                </div>
                <ArrowRight className="h-5 w-5 ml-auto" />
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userType || !userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <Card className="bg-black/40 backdrop-blur-xl border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
              {userType === 'helper' ? (
                <User className="h-8 w-8 text-black" />
              ) : (
                <Home className="h-8 w-8 text-black" />
              )}
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Complete Your {userType === 'helper' ? 'Helper' : 'Household'} Profile
            </CardTitle>
            <CardDescription className="text-gray-300 text-lg">
              {userType === 'helper' 
                ? 'Tell us about your skills and experience to connect with the right households'
                : 'Share your needs and preferences to find the perfect household helper'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Helper Profile Form */}
              {userType === 'helper' && (
                <>
                  <div className="space-y-3">
                    <Label className="text-white flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Services You Offer
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {serviceOptions.map(service => (
                        <Badge
                          key={service}
                          variant={helperProfile.services.includes(service) ? "default" : "outline"}
                          className={`cursor-pointer p-3 text-center justify-center transition-all hover:scale-105 ${
                            helperProfile.services.includes(service)
                              ? 'bg-gradient-to-r from-primary to-secondary text-black border-primary'
                              : 'border-primary/30 text-gray-300 hover:border-primary/60 hover:text-white'
                          }`}
                          onClick={() => toggleHelperService(service)}
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-white flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Years of Experience
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        value={helperProfile.experience_years}
                        onChange={(e) => updateHelperProfile('experience_years', parseInt(e.target.value) || 0)}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="e.g., 3"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-white flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Hourly Rate (₦)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        value={helperProfile.hourly_rate || ''}
                        onChange={(e) => updateHelperProfile('hourly_rate', parseInt(e.target.value) || undefined)}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="e.g., 2000"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-white flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </Label>
                    <Input
                      value={helperProfile.location}
                      onChange={(e) => updateHelperProfile('location', e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="e.g., Lagos, Nigeria"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-white flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Bio
                    </Label>
                    <Textarea
                      value={helperProfile.bio}
                      onChange={(e) => updateHelperProfile('bio', e.target.value)}
                      className="bg-white/10 border-white/20 text-white min-h-[100px]"
                      placeholder="Tell us about yourself, your experience, and what makes you a great helper..."
                      required
                    />
                  </div>
                </>
              )}

              {/* Household Profile Form */}
              {userType === 'household' && (
                <>
                  <div className="space-y-3">
                    <Label className="text-white flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Services You Need
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {serviceOptions.map(service => (
                        <Badge
                          key={service}
                          variant={householdProfile.preferred_services.includes(service) ? "default" : "outline"}
                          className={`cursor-pointer p-3 text-center justify-center transition-all hover:scale-105 ${
                            householdProfile.preferred_services.includes(service)
                              ? 'bg-gradient-to-r from-primary to-secondary text-black border-primary'
                              : 'border-primary/30 text-gray-300 hover:border-primary/60 hover:text-white'
                          }`}
                          onClick={() => toggleHouseholdService(service)}
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-white flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Household Size
                      </Label>
                      <Select onValueChange={(value) => updateHouseholdProfile('household_size', parseInt(value))}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 person</SelectItem>
                          <SelectItem value="2">2 people</SelectItem>
                          <SelectItem value="3">3 people</SelectItem>
                          <SelectItem value="4">4 people</SelectItem>
                          <SelectItem value="5">5+ people</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-white flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Budget Range
                      </Label>
                      <Select onValueChange={(value) => updateHouseholdProfile('budget_range', value)}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select budget" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under-50k">Under ₦50,000/month</SelectItem>
                          <SelectItem value="50k-100k">₦50,000 - ₦100,000/month</SelectItem>
                          <SelectItem value="100k-200k">₦100,000 - ₦200,000/month</SelectItem>
                          <SelectItem value="200k-plus">₦200,000+/month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-white flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </Label>
                    <Input
                      value={householdProfile.location}
                      onChange={(e) => updateHouseholdProfile('location', e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="e.g., Lagos, Nigeria"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-white flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Special Requirements (Optional)
                    </Label>
                    <Textarea
                      value={householdProfile.special_requirements || ''}
                      onChange={(e) => updateHouseholdProfile('special_requirements', e.target.value)}
                      className="bg-white/10 border-white/20 text-white min-h-[100px]"
                      placeholder="Any specific requirements, preferences, or additional information..."
                    />
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-black font-semibold py-6 text-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Setting up your profile...
                  </>
                ) : (
                  <>
                    Complete Profile Setup
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
