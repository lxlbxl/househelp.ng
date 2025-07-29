'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientClient } from '@/lib/supabase/client';
import Link from 'next/link';

type Helper = {
  id: string;
  employment_status: string;
  contract_start_date: string;
  contract_end_date: string;
  salary: number;
  helper: {
    id: string;
    user_id: string;
    skills: string[];
    experience_years: number;
    bio: string;
    availability: string;
    availability_date: string;
    work_preference: string;
    location: string;
    languages: string[];
    verification_status: string;
    rating: number;
    user: {
      full_name: string;
      email: string;
      avatar_url: string;
    };
  };
};

export default function AgencyHelpers() {
  const router = useRouter();
  const supabase = createClientClient();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormData, setAddFormData] = useState({
    helper_id: '',
    employment_status: 'active',
    contract_start_date: new Date().toISOString().split('T')[0],
    contract_end_date: '',
    salary: 0
  });
  const [addFormError, setAddFormError] = useState<string | null>(null);
  const [addFormSuccess, setAddFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgencyAndHelpers = async () => {
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
        
        setAgencyId(agencyProfile.id);
        
        // Fetch agency helpers
        const response = await fetch('/api/agency/helpers');
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch helpers');
        }
        
        setHelpers(data.helpers);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgencyAndHelpers();
  }, [supabase, router]);

  const handleAddHelper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyId) return;
    
    setAddFormError(null);
    setAddFormSuccess(null);
    
    try {
      // Validate required fields
      if (!addFormData.helper_id) {
        throw new Error('Helper ID is required');
      }
      
      // Submit new helper
      const response = await fetch('/api/agency/helpers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addFormData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add helper');
      }
      
      setAddFormSuccess('Helper added successfully!');
      
      // Refresh helpers list
      const refreshResponse = await fetch('/api/agency/helpers');
      const refreshData = await refreshResponse.json();
      
      if (refreshData.success) {
        setHelpers(refreshData.helpers);
      }
      
      // Reset form
      setAddFormData({
        helper_id: '',
        employment_status: 'active',
        contract_start_date: new Date().toISOString().split('T')[0],
        contract_end_date: '',
        salary: 0
      });
      
      // Hide form after 2 seconds
      setTimeout(() => {
        setShowAddForm(false);
        setAddFormSuccess(null);
      }, 2000);
      
    } catch (error: any) {
      setAddFormError(error.message);
    }
  };

  const handleRemoveHelper = async (helperId: string) => {
    if (!agencyId) return;
    
    if (!confirm('Are you sure you want to remove this helper from your agency?')) {
      return;
    }
    
    try {
      // Find the agency_helper record
      const { data: agencyHelper, error: findError } = await supabase
        .from('agency_helpers')
        .select('id')
        .eq('agency_id', agencyId)
        .eq('helper_id', helperId)
        .single();
      
      if (findError || !agencyHelper) {
        throw new Error('Helper not found in your agency');
      }
      
      // Remove helper from agency
      const response = await fetch(`/api/agency/helpers?id=${agencyHelper.id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove helper');
      }
      
      // Refresh helpers list
      const refreshResponse = await fetch('/api/agency/helpers');
      const refreshData = await refreshResponse.json();
      
      if (refreshData.success) {
        setHelpers(refreshData.helpers);
      }
      
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse">Loading agency helpers...</div>
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Agency Helpers</h1>
        <div className="space-x-4">
          <button 
            onClick={() => router.push('/agency/dashboard')}
            className="btn-secondary"
          >
            Back to Dashboard
          </button>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary"
          >
            {showAddForm ? 'Cancel' : 'Add Helper'}
          </button>
        </div>
      </div>
      
      {/* Add Helper Form */}
      {showAddForm && (
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add Helper to Agency</h2>
          
          {addFormSuccess && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4">
              {addFormSuccess}
            </div>
          )}
          
          {addFormError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
              {addFormError}
            </div>
          )}
          
          <form onSubmit={handleAddHelper} className="space-y-4">
            <div>
              <label htmlFor="helper_id" className="label">
                Helper ID <span className="text-red-500">*</span>
              </label>
              <input
                id="helper_id"
                name="helper_id"
                type="text"
                value={addFormData.helper_id}
                onChange={(e) => setAddFormData(prev => ({ ...prev, helper_id: e.target.value }))}
                className="input"
                placeholder="Enter helper's ID"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                You can find a helper's ID on their profile page.
              </p>
            </div>
            
            <div>
              <label htmlFor="employment_status" className="label">
                Employment Status
              </label>
              <select
                id="employment_status"
                name="employment_status"
                value={addFormData.employment_status}
                onChange={(e) => setAddFormData(prev => ({ ...prev, employment_status: e.target.value }))}
                className="input"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="contract_start_date" className="label">
                Contract Start Date
              </label>
              <input
                id="contract_start_date"
                name="contract_start_date"
                type="date"
                value={addFormData.contract_start_date}
                onChange={(e) => setAddFormData(prev => ({ ...prev, contract_start_date: e.target.value }))}
                className="input"
              />
            </div>
            
            <div>
              <label htmlFor="contract_end_date" className="label">
                Contract End Date
              </label>
              <input
                id="contract_end_date"
                name="contract_end_date"
                type="date"
                value={addFormData.contract_end_date}
                onChange={(e) => setAddFormData(prev => ({ ...prev, contract_end_date: e.target.value }))}
                className="input"
              />
            </div>
            
            <div>
              <label htmlFor="salary" className="label">
                Monthly Salary (₦)
              </label>
              <input
                id="salary"
                name="salary"
                type="number"
                value={addFormData.salary}
                onChange={(e) => setAddFormData(prev => ({ ...prev, salary: parseFloat(e.target.value) }))}
                className="input"
                min="0"
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="btn-primary"
              >
                Add Helper
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Helpers List */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Managed Helpers</h2>
          <span className="text-gray-500">
            {helpers.length} helper{helpers.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {helpers.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No helpers yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first helper to your agency.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary"
              >
                Add Helper
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Helper
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skills
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {helpers.map((helper) => (
                  <tr key={helper.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {helper.helper.user.avatar_url ? (
                            <img className="h-10 w-10 rounded-full" src={helper.helper.user.avatar_url} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 font-medium">
                                {helper.helper.user.full_name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{helper.helper.user.full_name}</div>
                          <div className="text-sm text-gray-500">{helper.helper.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {helper.helper.skills.slice(0, 3).map((skill) => (
                          <span key={skill} className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                        {helper.helper.skills.length > 3 && (
                          <span className="text-gray-500 text-xs">+{helper.helper.skills.length - 3} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {helper.helper.experience_years} year{helper.helper.experience_years !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        helper.employment_status === 'active' ? 'bg-green-100 text-green-800' :
                        helper.employment_status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {helper.employment_status.charAt(0).toUpperCase() + helper.employment_status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₦{helper.salary.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleRemoveHelper(helper.helper.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
