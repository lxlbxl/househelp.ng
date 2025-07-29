'use client';

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">How HouseHelp.ng Works</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simple, secure, and efficient. Connect with verified domestic help in just a few steps.
          </p>
        </div>
        
        {/* For Households */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center text-primary-600">For Households</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Sign Up & Create Profile</h3>
              <p className="text-gray-600">
                Create your household account and tell us about your specific needs, preferences, and requirements.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Browse & Match</h3>
              <p className="text-gray-600">
                Browse verified helpers or let our smart matching system find the perfect candidates for you.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Connect & Hire</h3>
              <p className="text-gray-600">
                Message potential helpers, conduct interviews, and hire the right person for your home.
              </p>
            </div>
          </div>
        </section>
        
        {/* For Helpers */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center text-secondary-600">For Helpers</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-secondary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Register & Verify</h3>
              <p className="text-gray-600">
                Sign up, complete your profile, and go through our verification process to build trust.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-secondary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Get Matched</h3>
              <p className="text-gray-600">
                Receive job opportunities that match your skills, location, and availability preferences.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-secondary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Start Working</h3>
              <p className="text-gray-600">
                Connect with households, discuss terms, and start your new employment opportunity.
              </p>
            </div>
          </div>
        </section>
        
        {/* Detailed Process */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">The Complete Process</h2>
          
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-500">
              <h3 className="text-xl font-semibold mb-3 text-primary-600">1. Registration & Profile Setup</h3>
              <p className="text-gray-700 mb-4">
                Both households and helpers start by creating detailed profiles. We collect information about:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Personal information and contact details</li>
                <li>Location and availability preferences</li>
                <li>Skills, experience, and specializations</li>
                <li>References and background information</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-secondary-500">
              <h3 className="text-xl font-semibold mb-3 text-secondary-600">2. Verification Process</h3>
              <p className="text-gray-700 mb-4">
                All helpers go through our comprehensive verification process:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Identity verification with government-issued ID</li>
                <li>Background checks and reference verification</li>
                <li>Skills assessment and certification review</li>
                <li>Interview with our verification team</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-accent-500">
              <h3 className="text-xl font-semibold mb-3 text-accent-600">3. Smart Matching</h3>
              <p className="text-gray-700 mb-4">
                Our algorithm considers multiple factors for optimal matches:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Geographic proximity and transportation</li>
                <li>Skills match with household requirements</li>
                <li>Schedule compatibility and availability</li>
                <li>Budget alignment and compensation expectations</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-500">
              <h3 className="text-xl font-semibold mb-3 text-primary-600">4. Communication & Hiring</h3>
              <p className="text-gray-700 mb-4">
                Secure communication tools facilitate the hiring process:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>In-app messaging system for initial contact</li>
                <li>Video call scheduling for interviews</li>
                <li>Contract templates and agreement tools</li>
                <li>Payment processing and escrow services</li>
              </ul>
            </div>
          </div>
        </section>
        
        {/* Safety & Security */}
        <section className="mb-16 bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Safety & Security</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-6 h-6 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                Verified Profiles
              </h3>
              <p className="text-gray-600">
                Every helper profile is thoroughly verified with background checks, reference verification, and identity confirmation.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-6 h-6 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                Secure Communication
              </h3>
              <p className="text-gray-600">
                All communication happens through our secure platform, protecting your personal information until you're ready to share.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-6 h-6 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                Payment Protection
              </h3>
              <p className="text-gray-600">
                Secure payment processing with escrow services ensures fair compensation and protection for both parties.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-6 h-6 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                24/7 Support
              </h3>
              <p className="text-gray-600">
                Our customer support team is available around the clock to help resolve any issues or concerns.
              </p>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="text-center bg-primary-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of satisfied households and helpers who have found their perfect match through HouseHelp.ng.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/register?type=household" className="btn-primary">
              I Need Help
            </a>
            <a href="/register?type=helper" className="btn-secondary">
              I Provide Help
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}