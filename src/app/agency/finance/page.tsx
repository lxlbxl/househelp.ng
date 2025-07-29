'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientClient } from '@/lib/supabase/client';
import Link from 'next/link';

type FinanceData = {
  success: boolean;
  finance: {
    period: string;
    start_date: string;
    end_date: string;
    commission_rate: number;
    commission_earned: number;
    salaries_paid: number;
    pending_salaries: number;
    upcoming_salary_obligations: number;
    net_revenue: number;
    analytics: Array<{
      id: string;
      period_start: string;
      period_end: string;
      total_helpers: number;
      active_helpers: number;
      placements_made: number;
      revenue_generated: number;
      commission_earned: number;
      average_helper_rating: number;
      reliability_index: number;
      created_at: string;
      updated_at: string;
    }>;
  };
};

export default function AgencyFinance() {
  const router = useRouter();
  const supabase = createClientClient();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [financeData, setFinanceData] = useState<FinanceData | null>(null);
  const [period, setPeriod] = useState('month');
  const [showBulkPaymentForm, setShowBulkPaymentForm] = useState(false);
  const [bulkPaymentForm, setBulkPaymentForm] = useState({
    helper_ids: [] as string[],
    amount: 0,
    description: ''
  });
  const [bulkPaymentError, setBulkPaymentError] = useState<string | null>(null);
  const [bulkPaymentSuccess, setBulkPaymentSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchFinanceData = async () => {
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
        
        // Fetch agency finance data
        const response = await fetch(`/api/agency/finance?period=${period}`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch finance data');
        }
        
        setFinanceData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFinanceData();
  }, [supabase, router, period]);

  const handleBulkPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setBulkPaymentError(null);
    setBulkPaymentSuccess(null);
    
    try {
      // Validate required fields
      if (!bulkPaymentForm.helper_ids || bulkPaymentForm.helper_ids.length === 0) {
        throw new Error('At least one helper must be selected');
      }
      
      if (!bulkPaymentForm.amount || bulkPaymentForm.amount <= 0) {
        throw new Error('Amount must be greater than zero');
      }
      
      // Submit bulk payment
      const response = await fetch('/api/agency/finance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bulkPaymentForm),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create bulk payment');
      }
      
      setBulkPaymentSuccess(`Bulk payment created for ${data.payment_count} helpers`);
      
      // Refresh finance data
      const refreshResponse = await fetch(`/api/agency/finance?period=${period}`);
      const refreshData = await refreshResponse.json();
      
      if (refreshData.success) {
        setFinanceData(refreshData);
      }
      
      // Reset form
      setBulkPaymentForm({
        helper_ids: [],
        amount: 0,
        description: ''
      });
      
      // Hide form after 2 seconds
      setTimeout(() => {
        setShowBulkPaymentForm(false);
        setBulkPaymentSuccess(null);
      }, 2000);
      
    } catch (error: any) {
      setBulkPaymentError(error.message);
    }
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(e.target.value);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse">Loading financial data...</div>
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

  if (!financeData) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div>No financial data found. Please try again later.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Financial Management</h1>
        <div className="space-x-4">
          <button 
            onClick={() => router.push('/agency/dashboard')}
            className="btn-secondary"
          >
            Back to Dashboard
          </button>
          <button 
            onClick={() => setShowBulkPaymentForm(!showBulkPaymentForm)}
            className="btn-primary"
          >
            {showBulkPaymentForm ? 'Cancel' : 'Bulk Payment'}
          </button>
        </div>
      </div>
      
      {/* Bulk Payment Form */}
      {showBulkPaymentForm && (
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create Bulk Payment</h2>
          
          {bulkPaymentSuccess && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4">
              {bulkPaymentSuccess}
            </div>
          )}
          
          {bulkPaymentError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
              {bulkPaymentError}
            </div>
          )}
          
          <form onSubmit={handleBulkPaymentSubmit} className="space-y-4">
            <div>
              <label htmlFor="helper_ids" className="label">
                Select Helpers <span className="text-red-500">*</span>
              </label>
              <select
                id="helper_ids"
                name="helper_ids"
                multiple
                value={bulkPaymentForm.helper_ids}
                onChange={(e) => {
                  const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                  setBulkPaymentForm(prev => ({ ...prev, helper_ids: selectedOptions }));
                }}
                className="input h-24"
                required
              >
                {/* This would be populated with actual helpers */}
                <option value="helper-1">John Doe</option>
                <option value="helper-2">Jane Smith</option>
                <option value="helper-3">Michael Johnson</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Hold Ctrl (or Cmd on Mac) to select multiple helpers.
              </p>
            </div>
            
            <div>
              <label htmlFor="amount" className="label">
                Total Amount (₦) <span className="text-red-500">*</span>
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                value={bulkPaymentForm.amount}
                onChange={(e) => setBulkPaymentForm(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                className="input"
                min="0"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                This amount will be divided equally among the selected helpers.
              </p>
            </div>
            
            <div>
              <label htmlFor="description" className="label">
                Description
              </label>
              <input
                id="description"
                name="description"
                type="text"
                value={bulkPaymentForm.description}
                onChange={(e) => setBulkPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                className="input"
                placeholder="e.g. Monthly salary payment"
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="btn-primary"
              >
                Create Payment
              </button>
              <button
                type="button"
                onClick={() => setShowBulkPaymentForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-2">Commission Earned</h3>
          <p className="text-2xl font-bold text-primary-500">₦{financeData.finance.commission_earned.toLocaleString()}</p>
          <p className="text-sm text-gray-500">This {period}</p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-2">Salaries Paid</h3>
          <p className="text-2xl font-bold text-primary-500">₦{financeData.finance.salaries_paid.toLocaleString()}</p>
          <p className="text-sm text-gray-500">This {period}</p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-2">Pending Salaries</h3>
          <p className="text-2xl font-bold text-primary-500">₦{financeData.finance.pending_salaries.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Awaiting payment</p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-2">Net Revenue</h3>
          <p className="text-2xl font-bold text-primary-500">₦{financeData.finance.net_revenue.toLocaleString()}</p>
          <p className="text-sm text-gray-500">After salaries</p>
        </div>
      </div>
      
      {/* Commission Rate */}
      <div className="card p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Commission Rate</h3>
            <p className="text-gray-500">Percentage earned from each placement</p>
          </div>
          <div className="text-2xl font-bold text-primary-500">
            {(financeData.finance.commission_rate * 100).toFixed(0)}%
          </div>
        </div>
      </div>
      
      {/* Upcoming Obligations */}
      <div className="card p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Upcoming Salary Obligations</h3>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Total monthly salary obligations</span>
          <span className="text-2xl font-bold text-primary-500">
            ₦{financeData.finance.upcoming_salary_obligations.toLocaleString()}
          </span>
        </div>
      </div>
      
      {/* Historical Analytics */}
      {financeData.finance.analytics.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Historical Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Helpers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Placements
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {financeData.finance.analytics.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.period_start).toLocaleDateString()} - {new Date(record.period_end).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.total_helpers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.placements_made}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₦{record.revenue_generated.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₦{record.commission_earned.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.average_helper_rating.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
