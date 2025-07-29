'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SalaryNegotiation from '@/components/SalaryNegotiation';
import { 
  User, 
  LogOut, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  Heart, 
  MessageCircle, 
  Search, 
  Briefcase,
  Home,
  Users,
  Calendar,
  Globe,
  XCircle,
  CheckCircle,
  Phone,
  Mail
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type UserType = 'household' | 'helper';

interface Profile {
  id: string;
  user_id: string;
  created_at: string;
  [key: string]: any; // For other profile fields
}

interface Match {
  id: string;
  helper_id: string;
  household_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  helper_profile?: Profile;
  household_profile?: Profile;
  user?: {
    full_name: string;
    email: string;
  };
}

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClientClient();
  const { user, loading: authLoading, signOut } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState('profile');

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (authLoading || !user) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data: basicProfile, error: basicProfileError } = await supabase
          .from('profiles')
          .select('user_type, full_name, email')
          .eq('id', user.id)
          .single();

        if (basicProfileError || !basicProfile) {
          console.error('Profile error, redirecting to setup:', basicProfileError);
          router.push('/profile-setup');
          return;
        }

        const { user_type } = basicProfile;

        if (user_type === 'admin') {
          router.push('/admin');
          return;
        } else if (user_type === 'agency') {
          router.push('/agency/dashboard');
          return;
        }

        if (!user_type || !['helper', 'household'].includes(user_type)) {
            router.push('/profile-setup');
            return;
        }

        setUserType(user_type as UserType);

        const profileTable = `${user_type}_profiles`;
        const matchForeignKey = `${user_type}_id`;
        const otherProfileTable = user_type === 'helper' ? 'household_profiles' : 'helper_profiles';
        const otherProfileFKey = user_type === 'helper' ? 'household_profiles' : 'helper_profiles';

        const [profileRes, matchesRes] = await Promise.all([
          supabase.from(profileTable).select('*').eq('user_id', user.id).single(),
          supabase.from('matches').select(`*, ${otherProfileTable}(*), user:profiles!${otherProfileFKey}(full_name, email)`).eq(matchForeignKey, user.id)
        ]);

        if (profileRes.error || !profileRes.data) {
          console.error(`${user_type} profile error, redirecting to setup:`, profileRes.error);
          router.push(`/profile-setup?type=${user_type}`);
          return;
        }

        setProfile(profileRes.data);

        if (matchesRes.data) {
          setMatches(matchesRes.data as Match[]);
        }

      } catch (err: any) {
        console.error('Dashboard error:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, authLoading, router, supabase]);
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if user is not authenticated
  if (!user) {
    return null;
  }
  
  const updateMatchStatus = async (matchId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({ status })
        .eq('id', matchId);
      
      if (error) throw error;
      
      // Update local state
      setMatches(prev => 
        prev.map(match => 
          match.id === matchId ? { ...match, status } : match
        )
      );
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-white text-lg">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md bg-red-900/20 border-red-500/30">
              <CardContent className="p-6 text-center">
                <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400 mb-4">{error}</p>
                <Button 
                  onClick={() => router.push('/login')} 
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-black"
                >
                  Back to Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!profile || !userType) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md bg-white/5 border-white/10">
              <CardContent className="p-6 text-center">
                <User className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-white mb-4">No profile found. Please complete your profile setup.</p>
                <Button asChild className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-black">
                  <Link href="/profile-setup">Set Up Profile</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 border-2 border-primary">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-black font-bold">
                  {profile.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {userType === 'helper' ? 'Helper' : 'Household'} Dashboard
                </h1>
                <p className="text-gray-300">Welcome back!</p>
              </div>
            </div>
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10">
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-300"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="matches" 
              className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-300"
            >
              <Heart className="h-4 w-4 mr-2" />
              Matches
              {matches.length > 0 && (
                <Badge className="ml-2 bg-secondary text-black text-xs">
                  {matches.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="browse" 
              className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-300"
            >
              <Search className="h-4 w-4 mr-2" />
              Browse
            </TabsTrigger>
            <TabsTrigger 
              value="messages" 
              className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-300"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-xl">My Profile</CardTitle>
                    <CardDescription className="text-gray-300">
                      Manage your profile information
                    </CardDescription>
                  </div>
                  <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-black">
                    <Link href={`/profile-edit?type=${userType}`}>
                      Edit Profile
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {userType === 'helper' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-white mb-2 flex items-center">
                          <Star className="h-4 w-4 mr-2 text-primary" />
                          Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills?.map((skill: string) => (
                            <Badge key={skill} className="bg-primary/20 text-primary border-primary/30">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-white mb-2 flex items-center">
                          <Briefcase className="h-4 w-4 mr-2 text-secondary" />
                          Experience
                        </h3>
                        <p className="text-gray-300">{profile.experience_years} years</p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-white mb-2 flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-secondary" />
                          Location
                        </h3>
                        <p className="text-gray-300">{profile.location}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-white mb-2 flex items-center">
                          <Home className="h-4 w-4 mr-2 text-secondary" />
                          Work Preference
                        </h3>
                        <p className="text-gray-300 capitalize">
                          {profile.work_preference?.replace('_', '-')}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-white mb-2 flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-secondary" />
                          Availability
                        </h3>
                        <p className="text-gray-300">
                          {profile.availability === 'immediate' 
                            ? 'Immediate' 
                            : `From ${new Date(profile.availability_date).toLocaleDateString()}`}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-white mb-2 flex items-center">
                          <Users className="h-4 w-4 mr-2 text-secondary" />
                          Languages
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.languages?.map((language: string) => (
                            <Badge key={language} variant="secondary" className="bg-white/10 text-gray-300">
                              {language}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <h3 className="font-medium text-white mb-2">Bio</h3>
                      <p className="text-gray-300 bg-white/5 p-4 rounded-lg">{profile.bio}</p>
                    </div>
                  </div>
                )}
                
                {userType === 'household' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-white mb-2 flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-secondary" />
                          Location
                        </h3>
                        <p className="text-gray-300">{profile.location}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-white mb-2 flex items-center">
                          <Star className="h-4 w-4 mr-2 text-primary" />
                          Help Type Needed
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.help_type?.map((type: string) => (
                            <Badge key={type} className="bg-primary/20 text-primary border-primary/30">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-white mb-2 flex items-center">
                          <Home className="h-4 w-4 mr-2 text-secondary" />
                          Accommodation
                        </h3>
                        <p className="text-gray-300">{profile.preferences?.live_in ? 'Live-in' : 'Live-out'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-white mb-2 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-secondary" />
                          Age Range Preference
                        </h3>
                        <p className="text-gray-300">{profile.preferences?.age_range?.[0]} to {profile.preferences?.age_range?.[1]} years</p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-white mb-2 flex items-center">
                          <Users className="h-4 w-4 mr-2 text-secondary" />
                          Language Preference
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.preferences?.languages?.map((language: string) => (
                            <Badge key={language} variant="secondary" className="bg-white/10 text-gray-300">
                              {language}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {profile.preferences?.religion && (
                        <div>
                          <h3 className="font-medium text-white mb-2">Religious Preference</h3>
                          <p className="text-gray-300">{profile.preferences.religion}</p>
                        </div>
                      )}
                    </div>

                    {profile.additional_info && (
                      <div className="md:col-span-2">
                        <h3 className="font-medium text-white mb-2">Additional Information</h3>
                        <p className="text-gray-300 bg-white/5 p-4 rounded-lg">{profile.additional_info}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches" className="mt-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Your Matches</CardTitle>
                <CardDescription className="text-gray-300">
                  Connect with your perfect matches
                </CardDescription>
              </CardHeader>
              <CardContent>
                {matches.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-300 text-lg mb-2">You don't have any matches yet.</p>
                    <p className="text-gray-400 mb-6">Start browsing to find your perfect match!</p>
                    <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-black">
                      Browse Now
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {matches.map(match => {
                      const matchProfile = userType === 'helper' ? match.household_profile : match.helper_profile;
                      const matchUser = match.user;
                      
                      return (
                        <Card key={match.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-primary text-black">
                                    {matchUser?.full_name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <h3 className="font-medium text-white">{matchUser?.full_name}</h3>
                              </div>
                              <Badge className={
                                match.status === 'accepted' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                match.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                              }>
                                {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                              </Badge>
                            </div>
                            
                            {userType === 'helper' && matchProfile && (
                              <div className="text-sm space-y-2 text-gray-300">
                                <p><span className="font-medium text-white">Looking for:</span> {matchProfile.help_type?.join(', ')}</p>
                                <p><span className="font-medium text-white">Location:</span> {matchProfile.location}</p>
                                <p><span className="font-medium text-white">Accommodation:</span> {matchProfile.preferences?.live_in ? 'Live-in' : 'Live-out'}</p>
                              </div>
                            )}
                            
                            {userType === 'household' && matchProfile && (
                              <div className="text-sm space-y-2 text-gray-300">
                                <p><span className="font-medium text-white">Skills:</span> {matchProfile.skills?.join(', ')}</p>
                                <p><span className="font-medium text-white">Experience:</span> {matchProfile.experience_years} years</p>
                                <p><span className="font-medium text-white">Location:</span> {matchProfile.location}</p>
                                <p><span className="font-medium text-white">Work Preference:</span> {matchProfile.work_preference?.replace('_', '-')}</p>
                              </div>
                            )}
                            
                            <div className="mt-4 flex space-x-2">
                              {match.status === 'pending' && (
                                <>
                                  <Button 
                                    onClick={() => updateMatchStatus(match.id, 'accepted')}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white flex-1"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Accept
                                  </Button>
                                  <Button 
                                    onClick={() => updateMatchStatus(match.id, 'rejected')}
                                    size="sm"
                                    variant="outline"
                                    className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white flex-1"
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Decline
                                  </Button>
                                </>
                              )}
                              
                              {match.status === 'accepted' && (
                                <div className="space-y-2 w-full">
                                  <Button asChild size="sm" className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-black w-full">
                                    <Link href={`/messages?match=${match.id}`}>
                                      <MessageCircle className="h-4 w-4 mr-2" />
                                      Message
                                    </Link>
                                  </Button>
                                  {userType === 'household' && matchProfile?.expected_salary && (
                                    <SalaryNegotiation 
                                      matchId={match.id}
                                      helperId={match.helper_id}
                                      householdId={match.household_id}
                                      helperExpectedSalary={matchProfile.expected_salary}
                                      userType={userType}
                                      onNegotiationUpdate={() => {
                                        // Refresh matches or handle update
                                        console.log('Negotiation updated');
                                      }}
                                    />
                                  )}
                                  {userType === 'helper' && profile?.expected_salary && (
                                    <SalaryNegotiation 
                                      matchId={match.id}
                                      helperId={match.helper_id}
                                      householdId={match.household_id}
                                      helperExpectedSalary={profile.expected_salary}
                                      userType={userType}
                                      onNegotiationUpdate={() => {
                                        // Refresh matches or handle update
                                        console.log('Negotiation updated');
                                      }}
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Browse Tab */}
          <TabsContent value="browse" className="mt-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Browse {userType === 'helper' ? 'Households' : 'Helpers'}</CardTitle>
                <CardDescription className="text-gray-300">
                  Discover your perfect match
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-white text-lg mb-2">The browse feature will be available soon!</p>
                  <p className="text-gray-300">We're working on bringing you the best matching experience.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="mt-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Messages</CardTitle>
                <CardDescription className="text-gray-300">
                  Connect with your matches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-white text-lg mb-2">The messaging feature will be available soon!</p>
                  <p className="text-gray-300">Connect with your matches through our secure messaging system.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
