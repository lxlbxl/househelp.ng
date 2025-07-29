'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

type AgencyDashboardData = {
  success: boolean;
  agency: {
    id: string;
    business_name: string;
    business_registration_number: string;
    tax_identification_number: string;
    contact_person: string;
    contact_email: string;
    contact_phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    website: string;
    description: string;
    verification_status: string;
    tier: string;
    commission_rate: number;
    created_at: string;
    updated_at: string;
    stats: {
      total_helpers: number;
      active_placements: number;
      monthly_revenue: number;
      average_rating: number;
      reliability_index: number;
    };
    recent_activity: Array<{
      id: string;
      created_at: string;
      status: string;
      helper_profile: {
        id: string;
        user: {
          full_name: string;
        };
      };
      household_profile: {
        id: string;
        user: {
          full_name: string;
        };
      };
    }>;
  };
};

export default function AgencyDashboard() {
  const router = useRouter();
  const supabase = createClientClient();
  const { signOut } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<AgencyDashboardData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchDashboardData = async () => {
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
        
        // Fetch agency dashboard data
        const response = await fetch('/api/agency/dashboard');
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch dashboard data');
        }
        
        setDashboardData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse">Loading your agency dashboard...</div>
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

  if (!dashboardData) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div>No dashboard data found. Please try again later.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">
          {dashboardData.agency.business_name} Dashboard
        </h1>
        <button 
          onClick={handleSignOut}
          className="btn-secondary"
        >
          Sign Out
        </button>
      </div>
      
      {/* Dashboard Tabs */}
      <div className="mb-6 border-b">
        <div className="flex space-x-4">
          <button
            className={`py-2 px-4 ${activeTab === 'overview' ? 'border-b-2 border-primary-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'helpers' ? 'border-b-2 border-primary-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('helpers')}
          >
            Helpers
            {dashboardData.agency.stats.total_helpers > 0 && (
              <span className="ml-2 bg-primary-500 text-white rounded-full px-2 py-1 text-xs">
                {dashboardData.agency.stats.total_helpers}
              </span>
            )}
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'placements' ? 'border-b-2 border-primary-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('placements')}
          >
            Placements
            {dashboardData.agency.stats.active_placements > 0 && (
              <span className="ml-2 bg-primary-500 text-white rounded-full px-2 py-1 text-xs">
                {dashboardData.agency.stats.active_placements}
              </span>
            )}
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'finance' ? 'border-b-2 border-primary-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('finance')}
          >
            Finance
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'reputation' ? 'border-b-2 border-primary-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('reputation')}
          >
            Reputation
          </button>
        </div>
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-2">Total Helpers</h3>
            <p className="text-3xl font-bold text-primary-500">{dashboardData.agency.stats.total_helpers}</p>
            <p className="text-sm text-gray-500">Managed by your agency</p>
          </div>
          
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-2">Active Placements</h3>
            <p className="text-3xl font-bold text-primary-500">{dashboardData.agency.stats.active_placements}</p>
            <p className="text-sm text-gray-500">Currently working</p>
          </div>
          
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-2">Monthly Revenue</h3>
            <p className="text-3xl font-bold text-primary-500">₦{dashboardData.agency.stats.monthly_revenue.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Commission earned</p>
          </div>
          
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-2">Reliability Index</h3>
            <p className="text-3xl font-bold text-primary-500">{dashboardData.agency.stats.reliability_index}</p>
            <p className="text-sm text-gray-500">Based on performance</p>
          </div>
          
          <div className="card p-6 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            {dashboardData.agency.recent_activity.length === 0 ? (
              <p className="text-gray-500">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {dashboardData.agency.recent_activity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {activity.helper_profile?.user.full_name} matched with {activity.household_profile?.user.full_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.created_at).toLocaleDateString()} • {activity.status}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activity.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      activity.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="card p-6 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Agency Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Business Name:</span>
                <span className="font-medium">{dashboardData.agency.business_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tier:</span>
                <span className="font-medium capitalize">{dashboardData.agency.tier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Commission Rate:</span>
                <span className="font-medium">{(dashboardData.agency.commission_rate * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Verification:</span>
                <span className={`font-medium ${
                  dashboardData.agency.verification_status === 'verified' ? 'text-green-600' :
                  dashboardData.agency.verification_status === 'pending' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {dashboardData.agency.verification_status.charAt(0).toUpperCase() + dashboardData.agency.verification_status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Helpers Tab */}
      {activeTab === 'helpers' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Agency Helpers</h2>
            <Link href="/agency/helpers" className="btn-primary">
              Manage Helpers
            </Link>
          </div>
          
          <div className="card p-6">
            <p className="text-gray-500">
              View and manage all helpers under your agency. You can add new helpers, update their information, and track their performance.
            </p>
          </div>
        </div>
      )}
      
      {/* Placements Tab */}
      {activeTab === 'placements' && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Active Placements</h2>
          
          <div className="card p-6">
            <p className="text-gray-500">
              Track all active placements made through your agency. Monitor the status of each placement and ensure successful matches.
            </p>
          </div>
        </div>
      )}
      
      {/* Finance Tab */}
      {activeTab === 'finance' && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Financial Management</h2>
          
          <div className="card p-6">
            <p className="text-gray-500">
              Manage your agency's finances, including commission tracking, bulk payments to helpers, and revenue analytics.
            </p>
          </div>
        </div>
      )}
      
      {/* Reputation Tab */}
      {activeTab === 'reputation' && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Reputation & Reviews</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-primary-500 mb-2">{dashboardData.agency.stats.average_rating}</div>
              <div className="text-gray-500">Average Rating</div>
            </div>
            
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-primary-500 mb-2">{dashboardData.agency.stats.reliability_index}</div>
              <div className="text-gray-500">Reliability Index</div>
            </div>
            
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-primary-500 mb-2">{dashboardData.agency.stats.total_helpers}</div>
              <div className="text-gray-500">Helpers Managed</div>
            </div>
          </div>
          
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Client Reviews</h3>
            <p className="text-gray-500">
              View feedback from households who have hired helpers through your agency. Use this information to improve your services.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
