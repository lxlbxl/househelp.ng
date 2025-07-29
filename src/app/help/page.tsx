'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'household' | 'helper' | 'payments' | 'verification';
}

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState<string>('general');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const faqItems: FAQItem[] = [
    // General FAQs
    {
      question: "What is HouseHelp.ng?",
      answer: "HouseHelp.ng is a platform that connects households with domestic helpers in Nigeria. We provide a safe and efficient way for households to find reliable helpers, and for helpers to find good employment opportunities.",
      category: "general"
    },
    {
      question: "How does HouseHelp.ng work?",
      answer: "HouseHelp.ng works as a matching platform. Households and helpers create profiles, go through our verification process, and then can browse and match with each other. Once matched, they can communicate through our platform to discuss details before deciding to work together.",
      category: "general"
    },
    {
      question: "Is HouseHelp.ng free to use?",
      answer: "We offer both free and premium plans. Basic features are available for free, but premium features like advanced matching, priority verification, and unlimited messaging require a subscription.",
      category: "general"
    },
    {
      question: "How do I contact customer support?",
      answer: "You can reach our customer support team by emailing support@househelp.ng or by using the contact form on our website. Premium users have access to priority support.",
      category: "general"
    },
    
    // Household FAQs
    {
      question: "How do I find a suitable helper?",
      answer: "After creating and verifying your profile, you can browse available helpers based on your requirements. You can filter by skills, experience, location, and availability. When you find potential matches, you can express interest and start a conversation if they match with you too.",
      category: "household"
    },
    {
      question: "How are helpers verified?",
      answer: "All helpers on our platform go through a verification process that includes ID verification, address verification, and reference checks. Premium helpers may also have additional background checks. However, we still recommend conducting your own interviews and checks before making a final decision.",
      category: "household"
    },
    {
      question: "What if the helper doesn't work out?",
      answer: "If a helper doesn't meet your expectations, you can end the relationship at any time. We recommend clearly communicating your expectations from the beginning. If there are serious issues, please report them to our support team.",
      category: "household"
    },
    {
      question: "Do I pay the helper through HouseHelp.ng?",
      answer: "No, HouseHelp.ng is a matching platform only. Payment arrangements are made directly between you and the helper. We recommend discussing payment terms clearly before starting work.",
      category: "household"
    },
    
    // Helper FAQs
    {
      question: "How do I find a household to work with?",
      answer: "After creating and verifying your profile, you can browse available household opportunities. You can filter by location, job type, and other preferences. When you find potential matches, you can express interest and start a conversation if they match with you too.",
      category: "helper"
    },
    {
      question: "How can I improve my chances of getting matched?",
      answer: "Complete your profile with accurate information, including your skills, experience, and availability. Upload a professional photo and complete the verification process. Premium members get higher visibility in search results.",
      category: "helper"
    },
    {
      question: "What if I have issues with a household?",
      answer: "If you experience any issues with a household, try to resolve them through clear communication first. If serious problems persist, you can report the household to our support team, and we will investigate the matter.",
      category: "helper"
    },
    {
      question: "Can I work for multiple households?",
      answer: "Yes, depending on your availability and capacity, you can work for multiple households. Make sure to clearly communicate your schedule and availability to each household to avoid conflicts.",
      category: "helper"
    },
    
    // Payments FAQs
    {
      question: "What payment methods are accepted?",
      answer: "We accept payments via Paystack, which supports credit/debit cards, bank transfers, and mobile money. All transactions are secure and encrypted.",
      category: "payments"
    },
    {
      question: "How much does a premium subscription cost?",
      answer: "We offer several subscription tiers starting from ₦2,500 per month. You can view all our pricing options on the Payments page. We also offer discounts for quarterly and annual subscriptions.",
      category: "payments"
    },
    {
      question: "Can I cancel my subscription?",
      answer: "Yes, you can cancel your subscription at any time from your account settings. Your premium features will remain active until the end of your current billing period.",
      category: "payments"
    },
    {
      question: "Is there a refund policy?",
      answer: "We offer a 7-day money-back guarantee for new premium subscriptions. If you're not satisfied with our premium features, contact our support team within 7 days of your purchase for a full refund.",
      category: "payments"
    },
    
    // Verification FAQs
    {
      question: "Why do I need to verify my account?",
      answer: "Verification helps ensure the safety and security of all users on our platform. It builds trust between households and helpers and reduces the risk of fraud or misrepresentation.",
      category: "verification"
    },
    {
      question: "What documents do I need for verification?",
      answer: "For basic verification, you'll need a government-issued ID (such as a National ID, driver's license, or passport) and proof of address (such as a utility bill or bank statement). Helpers may also need to provide reference letters or certificates of previous employment.",
      category: "verification"
    },
    {
      question: "How long does verification take?",
      answer: "Basic verification typically takes 1-3 business days. Premium users enjoy priority verification, which is usually completed within 24 hours.",
      category: "verification"
    },
    {
      question: "What if my verification is rejected?",
      answer: "If your verification is rejected, you'll receive an email explaining the reason. You can resubmit with the correct or additional documents as required. If you believe there's been an error, you can contact our support team.",
      category: "verification"
    }
  ];
  
  const filteredFAQs = faqItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center">Help Center</h1>
        <p className="text-gray-600 text-center mb-8">Find answers to frequently asked questions about HouseHelp.ng</p>
        
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for answers..."
              className="w-full p-4 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-4 top-4 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Category Tabs */}
        <div className="flex flex-wrap mb-8 border-b">
          {['all', 'general', 'household', 'helper', 'payments', 'verification'].map((category) => (
            <button
              key={category}
              className={`px-4 py-2 font-medium capitalize ${activeCategory === category ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveCategory(category)}
            >
              {category === 'all' ? 'All FAQs' : category}
            </button>
          ))}
        </div>
        
        {/* FAQ Accordion */}
        <div className="space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => (
              <details key={index} className="group bg-white rounded-lg shadow-sm overflow-hidden">
                <summary className="list-none flex justify-between items-center cursor-pointer p-5">
                  <h3 className="font-medium text-lg">{faq.question}</h3>
                  <span className="text-primary-600 group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </span>
                </summary>
                <div className="p-5 pt-0 border-t">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              </details>
            ))
          ) : (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-gray-500">No results found. Try a different search term or category.</p>
            </div>
          )}
        </div>
        
        {/* Contact Support */}
        <div className="mt-12 bg-gray-50 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Still need help?</h2>
          <p className="text-gray-600 mb-4">Our support team is ready to assist you with any questions or concerns.</p>
          <div className="flex justify-center space-x-4">
            <Link href="mailto:support@househelp.ng" className="btn-primary">
              Contact Support
            </Link>
            <Link href="/" className="btn-secondary">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}