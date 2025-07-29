'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">About HouseHelp.ng</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connecting households with reliable domestic help across Nigeria
          </p>
        </div>
        
        {/* Our Mission */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Mission</h2>
          <div className="bg-white rounded-lg shadow-md p-8">
            <p className="text-gray-700 mb-4">
              At HouseHelp.ng, our mission is to transform the domestic help sector in Nigeria by creating a transparent, 
              secure, and efficient platform that benefits both households and domestic workers.
            </p>
            <p className="text-gray-700 mb-4">
              We believe that every household deserves reliable help, and every domestic worker deserves fair employment 
              opportunities. By leveraging technology, we're building bridges between these two groups, fostering trust, 
              and elevating standards across the industry.
            </p>
            <p className="text-gray-700">
              Our platform is designed to address the common challenges in finding and hiring domestic help - from 
              verification and trust issues to communication barriers and fair treatment concerns.
            </p>
          </div>
        </section>
        
        {/* Our Story */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Story</h2>
          <div className="bg-white rounded-lg shadow-md p-8">
            <p className="text-gray-700 mb-4">
              HouseHelp.ng was founded in 2023 after our founder experienced firsthand the challenges of finding reliable 
              domestic help in Lagos. After several disappointing experiences with traditional agencies and word-of-mouth 
              referrals, they realized there had to be a better way.
            </p>
            <p className="text-gray-700 mb-4">
              At the same time, conversations with domestic workers revealed their struggles with finding good employers, 
              fair wages, and respectful treatment. The disconnect between these two groups - both wanting the same thing 
              but unable to find each other - inspired the creation of HouseHelp.ng.
            </p>
            <p className="text-gray-700">
              Starting with a small team of passionate individuals, we've grown steadily, connecting thousands of households 
              with helpers across Nigeria. Our commitment to safety, quality, and fairness has made us the trusted platform 
              for domestic help matching in the country.
            </p>
          </div>
        </section>
        
        {/* Our Values */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Trust & Safety</h3>
              <p className="text-gray-700">
                We prioritize the safety of all users through rigorous verification processes, secure communication channels, 
                and continuous monitoring of our platform.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Respect & Dignity</h3>
              <p className="text-gray-700">
                We believe in treating all users with respect and dignity, regardless of their role. We promote fair wages, 
                reasonable working conditions, and mutual respect between households and helpers.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p className="text-gray-700">
                We continuously improve our platform with innovative features that make the matching process more efficient, 
                transparent, and beneficial for all parties involved.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p className="text-gray-700">
                We're building more than just a platform; we're creating a community where best practices are shared, 
                standards are elevated, and the domestic help sector in Nigeria is transformed for the better.
              </p>
            </div>
          </div>
        </section>
        
        {/* Our Team */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Team</h2>
          <div className="bg-white rounded-lg shadow-md p-8">
            <p className="text-gray-700 mb-6 text-center">
              HouseHelp.ng is powered by a diverse team of professionals passionate about using technology to solve real-world problems.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <h3 className="font-semibold">Adebayo Ogunlesi</h3>
                <p className="text-gray-600 text-sm">Founder & CEO</p>
              </div>
              
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <h3 className="font-semibold">Ngozi Eze</h3>
                <p className="text-gray-600 text-sm">Chief Operations Officer</p>
              </div>
              
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <h3 className="font-semibold">Chinedu Okoro</h3>
                <p className="text-gray-600 text-sm">Chief Technology Officer</p>
              </div>
            </div>
            
            <p className="text-center mt-8 text-gray-600">
              Our team also includes dedicated customer support specialists, verification experts, and developers working together to provide you with the best experience.
            </p>
          </div>
        </section>
        
        {/* Join Us */}
        <section className="mb-16 bg-primary-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Join Our Mission</h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Whether you're a household looking for reliable help or a domestic worker seeking fair employment, 
            HouseHelp.ng is here to connect you with the right match.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="btn-primary">
              Sign Up Today
            </Link>
            <Link href="/contact" className="btn-secondary">
              Contact Us
            </Link>
          </div>
        </section>
        
        {/* Testimonials */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-center">What People Say About Us</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Mrs. Folake Adeleke</h3>
                  <p className="text-gray-600 text-sm">Lagos, Household</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "HouseHelp.ng has been a game-changer for our family. After struggling to find reliable help for months, 
                we found the perfect match within a week of using the platform. The verification process gave us peace of mind, 
                and the communication tools made the hiring process smooth."
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Emmanuel Okafor</h3>
                  <p className="text-gray-600 text-sm">Abuja, Helper</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "As a professional cook, I was looking for a household that would value my skills and provide fair compensation. 
                Through HouseHelp.ng, I connected with a wonderful family who appreciates my work and treats me with respect. 
                The platform has truly improved my career prospects."
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}