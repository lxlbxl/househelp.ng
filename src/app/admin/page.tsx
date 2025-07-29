'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Star,
  AlertTriangle,
  Home,
  Building2,
  UserCheck,
  CreditCard,
  FileText,
  MessageSquare,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalUsers: number;
  totalHelpers: number;
  totalHouseholds: number;
  totalAgencies: number;
  totalBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingVerifications: number;
  activeBookings: number;
  completedBookings: number;
  averageRating: number;
  totalReviews: number;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  user_type: string;
  created_at: string;
  verification_status?: string;
  is_admin: boolean;
}

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  payment_type: string;
  payment_status: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

interface VerificationRequest {
  id: string;
  user_id: string;
  document_type: string;
  status: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClientClient();
  const { user, loading: authLoading, signOut } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalHelpers: 0,
    totalHouseholds: 0,
    totalAgencies: 0,
    totalBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingVerifications: 0,
    activeBookings: 0,
    completedBookings: 0,
    averageRating: 0,
    totalReviews: 0,
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Checking admin access...');
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Authentication error. Please try logging in again.');
          return;
        }
        
        if (!session?.user) {
          console.log('No session found, redirecting to login');
          router.push('/login?redirect=/admin');
          return;
        }
        
        console.log('Session found, checking profile...');
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin, user_type, email, full_name')
          .eq('id', session.user.id)
          .single();
        
        console.log('Profile data:', profile);
        console.log('Profile error:', profileError);
        
        if (profileError) {
          console.error('Profile fetch error:', profileError);
          setError(`Database error: ${profileError.message}. Please contact support.`);
          return;
        }
        
        if (!profile) {
          console.log('No profile found');
          setError('User profile not found. Please complete your registration.');
          return;
        }
        
        const isAdmin = profile.is_admin === true || profile.user_type === 'admin';
        console.log('Is admin check:', { is_admin: profile.is_admin, user_type: profile.user_type, isAdmin });
        
        if (!isAdmin) {
          setError(`Access denied. You need admin privileges to access this page. Current user type: ${profile.user_type || 'none'}, Admin status: ${profile.is_admin ? 'true' : 'false'}`);
          return;
        }
        
        console.log('Admin access granted, loading dashboard data...');
        setIsAdmin(true);
        await loadDashboardData();
        
      } catch (error) {
        console.error('Error in checkAdminAccess:', error);
        setError(`Unexpected error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [router]);



  const loadDashboardData = async () => {
    try {
      await Promise.all([
        loadStats(),
        loadUsers(),
        loadTransactions(),
        loadVerifications(),
        loadRecentActivity()
      ]);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    }
  };

  const loadStats = async () => {
    try {
      // Get user counts
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_type');
      
      const totalUsers = profiles?.length || 0;
      const totalHelpers = profiles?.filter(p => p.user_type === 'helper').length || 0;
      const totalHouseholds = profiles?.filter(p => p.user_type === 'household').length || 0;
      const totalAgencies = profiles?.filter(p => p.user_type === 'agency').length || 0;

      // Get booking stats
      const { data: bookings } = await supabase
        .from('bookings')
        .select('status, total_amount, created_at');
      
      const totalBookings = bookings?.length || 0;
      const activeBookings = bookings?.filter(b => b.status === 'scheduled' || b.status === 'in_progress').length || 0;
      const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;
      
      // Calculate revenue
      const totalRevenue = bookings?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = bookings?.filter(b => {
        const bookingDate = new Date(b.created_at);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      }).reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;

      // Get verification stats
      const { data: verificationDocs } = await supabase
        .from('verification_documents')
        .select('status');
      
      const pendingVerifications = verificationDocs?.filter(v => v.status === 'pending').length || 0;

      // Get review stats
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating');
      
      const totalReviews = reviews?.length || 0;
      const averageRating = reviews?.length ? 
        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

      setStats({
        totalUsers,
        totalHelpers,
        totalHouseholds,
        totalAgencies,
        totalBookings,
        totalRevenue,
        monthlyRevenue,
        pendingVerifications,
        activeBookings,
        completedBookings,
        averageRating,
        totalReviews,
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (profiles) {
        setUsers(profiles);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadTransactions = async () => {
    try {
      const { data: payments } = await supabase
        .from('payments')
        .select(`
          *,
          profiles!inner(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (payments) {
        const formattedTransactions = payments.map(payment => ({
          ...payment,
          user_name: payment.profiles?.full_name,
          user_email: payment.profiles?.email
        }));
        setTransactions(formattedTransactions);
      }
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
  };

  const loadVerifications = async () => {
    try {
      const { data: verificationDocs } = await supabase
        .from('verification_documents')
        .select(`
          *,
          profiles!inner(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (verificationDocs) {
        const formattedVerifications = verificationDocs.map(doc => ({
          ...doc,
          user_name: doc.profiles?.full_name,
          user_email: doc.profiles?.email
        }));
        setVerifications(formattedVerifications);
      }
    } catch (err) {
      console.error('Error loading verifications:', err);
    }
  };

  const loadRecentActivity = async () => {
    try {
      // Get recent bookings, matches, and registrations
      const { data: recentBookings } = await supabase
        .from('bookings')
        .select(`
          *,
          helper_profiles!inner(user_id),
          household_profiles!inner(user_id)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: recentMatches } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      const activity = [
        ...(recentBookings?.map(booking => ({
          type: 'booking',
          description: `New booking created`,
          timestamp: booking.created_at,
          status: booking.status
        })) || []),
        ...(recentMatches?.map(match => ({
          type: 'match',
          description: `New match created`,
          timestamp: match.created_at,
          status: match.status
        })) || []),
        ...(recentUsers?.map(user => ({
          type: 'registration',
          description: `New ${user.user_type} registered`,
          timestamp: user.created_at,
          status: 'active'
        })) || [])
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15);

      setRecentActivity(activity);
    } catch (err) {
      console.error('Error loading recent activity:', err);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
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
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-300">Manage your HouseHelp platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                onClick={handleSignOut}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-white/5 border border-white/10">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-300"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-300"
            >
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="transactions" 
              className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-300"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger 
              value="verifications" 
              className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-300"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Verifications
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-300"
            >
              <PieChart className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-300"
            >
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
                  <p className="text-xs text-gray-400">
                    {stats.totalHelpers} helpers, {stats.totalHouseholds} households, {stats.totalAgencies} agencies
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-gray-400">
                    ${stats.monthlyRevenue.toFixed(2)} this month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Active Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.activeBookings}</div>
                  <p className="text-xs text-gray-400">
                    {stats.completedBookings} completed
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Pending Verifications</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.pendingVerifications}</div>
                  <p className="text-xs text-gray-400">
                    Require review
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <CardDescription className="text-gray-300">
                  Latest platform activities and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.slice(0, 8).map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-white/5">
                      <div className={`h-2 w-2 rounded-full ${
                        activity.type === 'booking' ? 'bg-primary' :
                        activity.type === 'match' ? 'bg-secondary' :
                        'bg-green-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-white text-sm">{activity.description}</p>
                        <p className="text-gray-400 text-xs">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline" className={`text-xs ${
                        activity.status === 'completed' ? 'border-green-500 text-green-400' :
                        activity.status === 'pending' ? 'border-yellow-500 text-yellow-400' :
                        'border-primary text-primary'
                      }`}>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">User Management</CardTitle>
                    <CardDescription className="text-gray-300">
                      Manage all platform users
                    </CardDescription>
                  </div>
                  <Button className="bg-primary text-black hover:bg-primary/90">
                    <Download className="h-4 w-4 mr-2" />
                    Export Users
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.slice(0, 10).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-black">
                            {user.full_name?.charAt(0) || user.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-medium">{user.full_name || 'No name'}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="text-primary border-primary">
                          {user.user_type}
                        </Badge>
                        <Badge variant="outline" className={`${
                          user.verification_status === 'verified' ? 'text-green-400 border-green-400' :
                          user.verification_status === 'pending' ? 'text-yellow-400 border-yellow-400' :
                          'text-red-400 border-red-400'
                        }`}>
                          {user.verification_status || 'unverified'}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="border-white/20 text-white">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-white/20 text-white">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="mt-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Transaction History</CardTitle>
                    <CardDescription className="text-gray-300">
                      All platform transactions and payments
                    </CardDescription>
                  </div>
                  <Button className="bg-primary text-black hover:bg-primary/90">
                    <Download className="h-4 w-4 mr-2" />
                    Export Transactions
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                      <div className="flex items-center space-x-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          transaction.payment_type === 'booking' ? 'bg-primary/20' :
                          transaction.payment_type === 'payout' ? 'bg-secondary/20' :
                          'bg-green-500/20'
                        }`}>
                          <DollarSign className={`h-5 w-5 ${
                            transaction.payment_type === 'booking' ? 'text-primary' :
                            transaction.payment_type === 'payout' ? 'text-secondary' :
                            'text-green-400'
                          }`} />
                        </div>
                        <div>
                          <p className="text-white font-medium">${transaction.amount.toFixed(2)}</p>
                          <p className="text-gray-400 text-sm">{transaction.user_name} - {transaction.payment_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline" className={`${
                          transaction.payment_status === 'completed' ? 'text-green-400 border-green-400' :
                          transaction.payment_status === 'pending' ? 'text-yellow-400 border-yellow-400' :
                          'text-red-400 border-red-400'
                        }`}>
                          {transaction.payment_status}
                        </Badge>
                        <p className="text-gray-400 text-sm">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verifications Tab */}
          <TabsContent value="verifications" className="mt-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Verification Requests</CardTitle>
                <CardDescription className="text-gray-300">
                  Review and manage user verification documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {verifications.slice(0, 10).map((verification) => (
                    <div key={verification.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{verification.user_name}</p>
                          <p className="text-gray-400 text-sm">{verification.document_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline" className={`${
                          verification.status === 'approved' ? 'text-green-400 border-green-400' :
                          verification.status === 'pending' ? 'text-yellow-400 border-yellow-400' :
                          'text-red-400 border-red-400'
                        }`}>
                          {verification.status}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Revenue Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total Revenue</span>
                      <span className="text-white font-bold">${stats.totalRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Monthly Revenue</span>
                      <span className="text-white font-bold">${stats.monthlyRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Average Rating</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-white font-bold">{stats.averageRating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">User Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Helpers</span>
                      <span className="text-white font-bold">{stats.totalHelpers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Households</span>
                      <span className="text-white font-bold">{stats.totalHouseholds}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Agencies</span>
                      <span className="text-white font-bold">{stats.totalAgencies}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Platform Activity</CardTitle>
                <CardDescription className="text-gray-300">
                  Real-time platform activity and system events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 rounded-lg bg-white/5">
                      <div className={`h-3 w-3 rounded-full ${
                        activity.type === 'booking' ? 'bg-primary' :
                        activity.type === 'match' ? 'bg-secondary' :
                        'bg-green-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-white">{activity.description}</p>
                        <p className="text-gray-400 text-sm">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline" className={`${
                        activity.status === 'completed' ? 'border-green-500 text-green-400' :
                        activity.status === 'pending' ? 'border-yellow-500 text-yellow-400' :
                        'border-primary text-primary'
                      }`}>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}