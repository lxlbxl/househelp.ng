'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientClient } from '@/lib/supabase/client';
import { PaymentClient } from '@/lib/payment/client';
import { generateReference } from '@/lib/utils';

type UserType = 'household' | 'helper';
type PaymentStatus = 'pending' | 'completed' | 'failed';
type PlanType = 'basic' | 'premium' | 'enterprise';

interface PaymentPlan {
  id: string;
  name: string;
  type: PlanType;
  price: number;
  duration: number; // in days
  features: string[];
}

interface PaymentRecord {
  id?: string;
  user_id: string;
  amount: number;
  plan_type: PlanType;
  payment_status: PaymentStatus;
  transaction_ref?: string;
  created_at?: string;
  expires_at?: string;
}

export default function Payments() {
  const router = useRouter();
  const supabase = createClientClient();
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  
  // Define payment plans
  const plans: PaymentPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      type: 'basic',
      price: 0,
      duration: 30,
      features: [
        'Create a profile',
        'Browse up to 10 profiles per day',
        'Message up to 3 matches',
        'Basic verification badge'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      type: 'premium',
      price: 5000, // ₦5,000
      duration: 30,
      features: [
        'All Basic features',
        'Unlimited profile browsing',
        'Unlimited messaging',
        'Priority in search results',
        'Premium verification badge',
        'Access to advanced filters'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      type: 'enterprise',
      price: 15000, // ₦15,000
      duration: 90,
      features: [
        'All Premium features',
        'Background check priority',
        'Dedicated support',
        'Multiple profile management (for agencies)',
        'Detailed analytics and reporting',
        'Custom contract templates'
      ]
    }
  ];
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error('You must be logged in to access payment features');
        }
        
        setUserId(user.id);
        setUserEmail(user.email || '');
        
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
        } else if (householdProfile) {
          setUserType('household');
        } else {
          // No profile found, redirect to profile setup
          router.push('/profile-setup');
          return;
        }
        
        // Fetch payment history
        const { data: payments, error: paymentsError } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (!paymentsError && payments) {
          setPaymentHistory(payments);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [supabase, router]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getCurrentPlan = () => {
    if (paymentHistory.length === 0) return 'basic';
    
    const activePlan = paymentHistory.find(payment => {
      return (
        payment.payment_status === 'completed' &&
        new Date(payment.expires_at || '') > new Date()
      );
    });
    
    return activePlan ? activePlan.plan_type : 'basic';
  };
  
  const getPlanExpiryDate = () => {
    if (paymentHistory.length === 0) return null;
    
    const activePlan = paymentHistory.find(payment => {
      return (
        payment.payment_status === 'completed' &&
        new Date(payment.expires_at || '') > new Date()
      );
    });
    
    return activePlan ? activePlan.expires_at : null;
  };
  
  
  const handleSelectPlan = (plan: PaymentPlan) => {
    setSelectedPlan(plan);
  };
  
  const handlePayment = async () => {
    if (!selectedPlan) return;
    
    if (selectedPlan.price === 0) {
      // For free plan, just update the record
      try {
        setProcessing(true);
        
        if (!userId) return;
        
        // Create a completed payment record for free plan
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            user_id: userId,
            amount: 0,
            plan_type: 'basic',
            payment_status: 'completed',
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          });
        
        if (paymentError) throw paymentError;
        
        // Refresh payment history
        const { data: payments, error: paymentsError } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (!paymentsError && payments) {
          setPaymentHistory(payments);
        }
        
        setSelectedPlan(null);
        setProcessing(false);
        
      } catch (err: any) {
        setError(err.message);
        setProcessing(false);
      }
    } else {
      // For paid plans, initialize payment with PaymentClient
      try {
        setProcessing(true);
        
        // Create a pending payment record
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .insert({
            user_id: userId,
            amount: selectedPlan.price,
            plan_type: selectedPlan.type,
            payment_status: 'pending',
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + selectedPlan.duration * 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single();
        
        if (paymentError) throw paymentError;
        
        // Initialize payment with PaymentClient
        const paymentClient = new PaymentClient(
          process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
          process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || ''
        );
        
        await paymentClient.initializePayment({
          email: userEmail,
          amount: selectedPlan.price,
          reference: payment.transaction_ref || generateReference(),
          metadata: {
            payment_id: payment.id,
            user_id: userId,
            plan_type: selectedPlan.type
          },
          callback: async (response) => {
            // Verify the payment
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                reference: response.reference
              }),
            });
            
            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
              // Refresh payment history
              const { data: payments, error: paymentsError } = await supabase
                .from('payments')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
              
              if (!paymentsError && payments) {
                setPaymentHistory(payments);
              }
              
              setSelectedPlan(null);
              setProcessing(false);
            } else {
              setError(verifyData.message || 'Payment verification failed');
              setProcessing(false);
            }
          },
          onClose: () => {
            setProcessing(false);
          }
        });
        
      } catch (err: any) {
        setError(err.message);
        setProcessing(false);
      }
    }
  };
  
  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
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

  const currentPlan = getCurrentPlan();
  const expiryDate = getPlanExpiryDate();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Subscription Plans</h1>
          <button 
            onClick={() => router.push('/dashboard')} 
            className="btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>
        
        {/* Current Plan Status */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Subscription</h2>
          
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              currentPlan === 'enterprise' ? 'bg-purple-500' :
              currentPlan === 'premium' ? 'bg-blue-500' :
              'bg-green-500'
            }`} />
            <span className="font-medium">
              {currentPlan === 'enterprise' ? 'Enterprise Plan' :
               currentPlan === 'premium' ? 'Premium Plan' :
               'Basic Plan'}
            </span>
            
            {expiryDate && (
              <span className="ml-2 text-sm text-gray-500">
                (Expires: {formatDate(expiryDate)})
              </span>
            )}
          </div>
          
          <p className="mt-2 text-gray-600">
            {currentPlan === 'basic' ? 
              'You are currently on the Basic plan. Upgrade to access premium features.' :
             currentPlan === 'premium' ? 
              'You are enjoying Premium features. Your subscription is active.' :
              'You have access to all Enterprise features. Thank you for your support!'}
          </p>
        </div>
        
        {/* Plan Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`card p-6 border-2 transition-all ${selectedPlan?.id === plan.id ? 'border-primary-500 shadow-lg' : 'border-transparent'} ${currentPlan === plan.type ? 'bg-gray-50' : ''}`}
              onClick={() => handleSelectPlan(plan)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                {currentPlan === plan.type && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Current</span>
                )}
              </div>
              
              <div className="mb-4">
                <span className="text-2xl font-bold">{formatCurrency(plan.price)}</span>
                <span className="text-gray-500">/{plan.duration} days</span>
              </div>
              
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                className={`w-full py-2 px-4 rounded-md font-medium ${currentPlan === plan.type ? 'bg-gray-300 text-gray-700 cursor-not-allowed' : 'bg-primary-500 text-white hover:bg-primary-600'}`}
                disabled={currentPlan === plan.type || processing}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectPlan(plan);
                }}
              >
                {currentPlan === plan.type ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
        
        {/* Payment Action */}
        {selectedPlan && (
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Complete Your Subscription</h2>
            
            <div className="mb-4">
              <p className="font-medium">Selected Plan: {selectedPlan.name}</p>
              <p className="text-gray-600">Amount: {formatCurrency(selectedPlan.price)}</p>
              <p className="text-gray-600">Duration: {selectedPlan.duration} days</p>
            </div>
            
            <button
              onClick={handlePayment}
              className="btn-primary w-full"
              disabled={processing}
            >
              {processing ? 'Processing...' : selectedPlan.price === 0 ? 'Activate Basic Plan' : 'Proceed to Payment'}
            </button>
            
            {selectedPlan.price > 0 && (
              <div className="mt-4 text-center text-sm text-gray-500">
                <p>Secure payment powered by Paystack</p>
                <div className="flex justify-center mt-2 space-x-2">
                  <svg className="h-6" viewBox="0 0 111 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.7 7.3h4.2c3.1 0 5.3 2.1 5.3 5.3 0 3.3-2.2 5.3-5.3 5.3H5.7V7.3zm4.2 8.5c1.9 0 3-1.2 3-3.1s-1.1-3.1-3-3.1H8.1v6.2h1.8zM16.7 7.3h2.4v10.6h-2.4V7.3zM20.9 12.6c0-3.1 2.4-5.5 5.6-5.5 3.2 0 5.6 2.4 5.6 5.5s-2.4 5.5-5.6 5.5c-3.2 0-5.6-2.4-5.6-5.5zm8.8 0c0-1.9-1.4-3.3-3.2-3.3-1.8 0-3.2 1.4-3.2 3.3s1.4 3.3 3.2 3.3c1.8 0 3.2-1.4 3.2-3.3zM33.4 7.3h2.4v1.5c.6-1 1.6-1.7 3.1-1.7 2.3 0 4.5 1.8 4.5 5.5v.1c0 3.7-2.1 5.5-4.5 5.5-1.5 0-2.5-.7-3.1-1.6v4.6h-2.4V7.3zm7.6 5.3c0-2-1.3-3.3-2.9-3.3-1.6 0-2.9 1.3-2.9 3.3s1.3 3.3 2.9 3.3c1.6 0 2.9-1.3 2.9-3.3zM45.3 12.6c0-3.1 2.4-5.5 5.6-5.5 3.2 0 5.6 2.4 5.6 5.5s-2.4 5.5-5.6 5.5c-3.2 0-5.6-2.4-5.6-5.5zm8.8 0c0-1.9-1.4-3.3-3.2-3.3-1.8 0-3.2 1.4-3.2 3.3s1.4 3.3 3.2 3.3c1.8 0 3.2-1.4 3.2-3.3zM57.9 7.3h2.4v1.5c.6-1 1.6-1.7 3.1-1.7 2.3 0 4.5 1.8 4.5 5.5v.1c0 3.7-2.1 5.5-4.5 5.5-1.5 0-2.5-.7-3.1-1.6v4.6h-2.4V7.3zm7.6 5.3c0-2-1.3-3.3-2.9-3.3-1.6 0-2.9 1.3-2.9 3.3s1.3 3.3 2.9 3.3c1.6 0 2.9-1.3 2.9-3.3zM69.7 7.3h2.4v1.7c.6-1.1 1.6-1.9 3.2-1.9 2.3 0 3.6 1.5 3.6 3.9v6.9h-2.4v-6c0-1.6-.8-2.4-2.1-2.4-1.3 0-2.3.9-2.3 2.4v6h-2.4V7.3zM80.9 7.3h2.4v10.6h-2.4V7.3zM85.1 12.6c0-3.1 2.4-5.5 5.6-5.5 3.2 0 5.6 2.4 5.6 5.5s-2.4 5.5-5.6 5.5c-3.2 0-5.6-2.4-5.6-5.5zm8.8 0c0-1.9-1.4-3.3-3.2-3.3-1.8 0-3.2 1.4-3.2 3.3s1.4 3.3 3.2 3.3c1.8 0 3.2-1.4 3.2-3.3zM97.6 7.3h2.4v1.7c.6-1.1 1.6-1.9 3.2-1.9 2.3 0 3.6 1.5 3.6 3.9v6.9h-2.4v-6c0-1.6-.8-2.4-2.1-2.4-1.3 0-2.3.9-2.3 2.4v6h-2.4V7.3z" fill="#011B33"/>
                  </svg>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Payment History */}
        {paymentHistory.length > 0 && (
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Payment History</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left">Date</th>
                    <th className="py-2 text-left">Plan</th>
                    <th className="py-2 text-left">Amount</th>
                    <th className="py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment) => (
                    <tr key={payment.id} className="border-b">
                      <td className="py-3">{formatDate(payment.created_at || '')}</td>
                      <td className="py-3 capitalize">{payment.plan_type}</td>
                      <td className="py-3">{formatCurrency(payment.amount)}</td>
                      <td className="py-3">
                        <span 
                          className={`px-2 py-1 rounded-full text-xs ${
                            payment.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                            payment.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {payment.payment_status.charAt(0).toUpperCase() + payment.payment_status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
