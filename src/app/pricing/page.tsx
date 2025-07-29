'use client';

import { useState } from 'react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Basic',
      description: 'Perfect for occasional help needs',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        'Browse verified helper profiles',
        'Basic messaging (5 messages/month)',
        'Standard customer support',
        'Basic profile verification',
        'Access to helper ratings'
      ],
      limitations: [
        'Limited to 2 active conversations',
        'No priority matching',
        'No background check reports'
      ],
      popular: false
    },
    {
      name: 'Premium',
      description: 'Most popular for regular households',
      monthlyPrice: 2500,
      yearlyPrice: 25000,
      features: [
        'Everything in Basic',
        'Unlimited messaging',
        'Priority matching algorithm',
        'Detailed background check reports',
        'Video call scheduling',
        'Priority customer support',
        'Advanced search filters',
        'Helper availability notifications'
      ],
      limitations: [],
      popular: true
    },
    {
      name: 'Enterprise',
      description: 'For multiple properties or businesses',
      monthlyPrice: 7500,
      yearlyPrice: 75000,
      features: [
        'Everything in Premium',
        'Multiple property management',
        'Team collaboration tools',
        'Custom matching criteria',
        'Dedicated account manager',
        'API access',
        'Custom reporting',
        'Bulk hiring tools',
        'Contract management system'
      ],
      limitations: [],
      popular: false
    }
  ];

  const helperFeatures = [
    {
      title: 'Profile Creation',
      description: 'Create a comprehensive profile showcasing your skills and experience',
      free: true
    },
    {
      title: 'Verification Process',
      description: 'Complete identity and background verification to build trust',
      free: true
    },
    {
      title: 'Job Matching',
      description: 'Receive job opportunities that match your skills and preferences',
      free: true
    },
    {
      title: 'Basic Messaging',
      description: 'Communicate with potential employers through our platform',
      free: true
    },
    {
      title: 'Profile Boost',
      description: 'Increase your profile visibility in search results',
      free: false,
      price: 500
    },
    {
      title: 'Premium Badge',
      description: 'Stand out with a premium verification badge',
      free: false,
      price: 1000
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that works best for you. No hidden fees, no surprises.
          </p>
        </div>

        {/* For Households */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">For Households</h2>
          
          {/* Billing Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-lg shadow-lg border-2 transition-all hover:shadow-xl ${
                  plan.popular ? 'border-primary-500 scale-105' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold">
                      ₦{billingCycle === 'monthly' ? plan.monthlyPrice.toLocaleString() : plan.yearlyPrice.toLocaleString()}
                    </span>
                    <span className="text-gray-600 ml-2">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                    {billingCycle === 'yearly' && plan.yearlyPrice > 0 && (
                      <div className="text-sm text-green-600 mt-1">
                        Save ₦{((plan.monthlyPrice * 12) - plan.yearlyPrice).toLocaleString()} per year
                      </div>
                    )}
                  </div>
                  
                  <button
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                      plan.popular
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {plan.monthlyPrice === 0 ? 'Get Started Free' : 'Start Free Trial'}
                  </button>
                  
                  <div className="mt-8">
                    <h4 className="font-semibold mb-4">What's included:</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {plan.limitations.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold mb-4 text-gray-600">Limitations:</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, limitationIndex) => (
                            <li key={limitationIndex} className="flex items-start">
                              <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                              </svg>
                              <span className="text-gray-600 text-sm">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* For Helpers */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">For Helpers</h2>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Free to Join & Find Work</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Creating your profile and finding job opportunities is completely free. 
                Optional premium features help you stand out and get hired faster.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold mb-6 text-green-600">Always Free</h4>
                <div className="space-y-4">
                  {helperFeatures.filter(feature => feature.free).map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <div>
                        <h5 className="font-medium">{feature.title}</h5>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-xl font-semibold mb-6 text-primary-600">Premium Add-ons</h4>
                <div className="space-y-4">
                  {helperFeatures.filter(feature => !feature.free).map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-primary-500 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                      </svg>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{feature.title}</h5>
                            <p className="text-gray-600 text-sm">{feature.description}</p>
                          </div>
                          <span className="text-primary-600 font-semibold ml-4">
                            ₦{feature.price?.toLocaleString()}/month
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-6">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer">
                  <h3 className="text-lg font-medium">Is there a free trial available?</h3>
                  <span className="text-primary-600 group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-gray-600">
                  Yes! All paid plans come with a 7-day free trial. You can cancel anytime during the trial period without being charged.
                </p>
              </details>
              
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer">
                  <h3 className="text-lg font-medium">Can I change my plan anytime?</h3>
                  <span className="text-primary-600 group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-gray-600">
                  Absolutely! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect at the next billing cycle.
                </p>
              </details>
              
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer">
                  <h3 className="text-lg font-medium">What payment methods do you accept?</h3>
                  <span className="text-primary-600 group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-gray-600">
                  We accept all major credit cards, debit cards, bank transfers, and mobile money payments including MTN Mobile Money, Airtel Money, and others.
                </p>
              </details>
              
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer">
                  <h3 className="text-lg font-medium">Do helpers pay any fees?</h3>
                  <span className="text-primary-600 group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-gray-600">
                  No! Helpers can create profiles and find work completely free. We only offer optional premium features to help them stand out.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-primary-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of satisfied users who have found their perfect match through HouseHelp.ng.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/register?type=household" className="btn-primary">
              Start Free Trial
            </a>
            <a href="/register?type=helper" className="btn-secondary">
              Join as Helper
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}