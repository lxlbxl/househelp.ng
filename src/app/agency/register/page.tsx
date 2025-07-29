'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientClient } from '@/lib/supabase/client';

export default function AgencyRegistration() {
  const router = useRouter();
  const supabase = createClientClient();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Agency registration form state
  const [formData, setFormData] = useState({
    business_name: '',
    business_registration_number: '',
    tax_identification_number: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    website: '',
    description: ''
  });

  useEffect(() => {
    // Get current user
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
  }, [supabase, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Validate required fields
      if (!formData.business_name || !formData.business_registration_number || 
          !formData.tax_identification_number || !formData.contact_person || 
          !formData.contact_email || !formData.contact_phone || 
          !formData.address || !formData.city || !formData.state) {
        throw new Error('Please fill in all required fields.');
      }
      
      // Submit agency registration
      const response = await fetch('/api/agency/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register agency');
      }
      
      setSuccess(true);
      
      // Redirect to agency dashboard after successful registration
      setTimeout(() => {
        router.push('/agency/dashboard');
      }, 2000);
      
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto card">
        <h1 className="text-2xl font-bold text-center mb-6">Register Your Agency</h1>
        
        {success ? (
          <div className="bg-green-50 text-green-600 p-4 rounded-md mb-6 text-center">
            <p className="font-medium">Agency registered successfully!</p>
            <p className="text-sm">Redirecting to your dashboard...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="business_name" className="label">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="business_name"
                    name="business_name"
                    type="text"
                    value={formData.business_name}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="business_registration_number" className="label">
                    Business Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="business_registration_number"
                    name="business_registration_number"
                    type="text"
                    value={formData.business_registration_number}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="tax_identification_number" className="label">
                    Tax Identification Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="tax_identification_number"
                    name="tax_identification_number"
                    type="text"
                    value={formData.tax_identification_number}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="contact_person" className="label">
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact_person"
                    name="contact_person"
                    type="text"
                    value={formData.contact_person}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="contact_email" className="label">
                    Contact Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="contact_phone" className="label">
                    Contact Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact_phone"
                    name="contact_phone"
                    type="tel"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="address" className="label">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="city" className="label">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="state" className="label">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={formData.state}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="country" className="label">
                    Country
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="Nigeria">Nigeria</option>
                    {/* Add more countries as needed */}
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="website" className="label">
                    Website
                  </label>
                  <input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    className="input"
                    placeholder="https://www.youragency.com"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="description" className="label">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="input min-h-[100px]"
                    placeholder="Tell us about your agency, your services, and what makes you unique..."
                  />
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Important Information</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>By registering your agency, you agree to our Terms of Service and Privacy Policy.</p>
                      <p className="mt-1">Your agency will be reviewed by our team before being approved. You will receive an email notification when your agency is approved.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={loading}
              >
                {loading ? 'Registering Agency...' : 'Register Agency'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
