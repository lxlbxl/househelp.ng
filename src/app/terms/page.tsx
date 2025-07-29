'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState<string>('terms');

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Terms of Service & Privacy Policy</h1>
        
        {/* Navigation Tabs */}
        <div className="flex border-b mb-8">
          <button
            className={`px-4 py-2 font-medium ${activeSection === 'terms' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveSection('terms')}
          >
            Terms of Service
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeSection === 'privacy' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveSection('privacy')}
          >
            Privacy Policy
          </button>
        </div>
        
        {activeSection === 'terms' ? (
          <div className="terms-content space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing or using HouseHelp.ng ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
              <p className="text-gray-700">
                HouseHelp.ng is a platform that connects households with domestic helpers. We provide a matching service but are not the employer of any helpers listed on our platform.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
              <p className="text-gray-700">
                When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
              </p>
              <p className="text-gray-700 mt-2">
                You are responsible for safeguarding the password and for all activities that occur under your account. You agree not to disclose your password to any third party.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">4. User Conduct</h2>
              <p className="text-gray-700">
                You agree not to use the Service for any purpose that is illegal or prohibited by these Terms. You may not use the Service in any manner that could damage, disable, overburden, or impair the Service.
              </p>
              <p className="text-gray-700 mt-2">
                As a user, you agree not to:
              </p>
              <ul className="list-disc pl-6 mt-2 text-gray-700 space-y-1">
                <li>Provide false or misleading information about yourself</li>
                <li>Use the service for any illegal purposes</li>
                <li>Harass, abuse, or harm another person</li>
                <li>Impersonate another user or person</li>
                <li>Use another user's account without permission</li>
                <li>Attempt to circumvent any security measures</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">5. Verification Process</h2>
              <p className="text-gray-700">
                While we strive to verify the identity and background of users, we cannot guarantee the accuracy of all information provided by users. You agree to participate in our verification process truthfully and completely.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">6. Payments and Fees</h2>
              <p className="text-gray-700">
                Certain aspects of the Service may require payment. All payments are processed securely through our payment partners. Fees are non-refundable except as required by law or at our sole discretion.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
              <p className="text-gray-700">
                HouseHelp.ng is not liable for any disputes, damages, or issues arising between households and helpers. We are a matching platform only and do not guarantee the quality, safety, or legality of any helper or household.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">8. Termination</h2>
              <p className="text-gray-700">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">9. Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify or replace these Terms at any time. It is your responsibility to review these Terms periodically for changes.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">10. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms, please contact us at support@househelp.ng.
              </p>
            </section>
          </div>
        ) : (
          <div className="privacy-content space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
              <p className="text-gray-700">
                We collect personal information that you voluntarily provide to us when registering for the Service, including but not limited to your name, email address, phone number, and profile information.
              </p>
              <p className="text-gray-700 mt-2">
                For verification purposes, we may collect identification documents, proof of address, and other relevant documentation.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
              <p className="text-gray-700">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 mt-2 text-gray-700 space-y-1">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Verify your identity and prevent fraud</li>
                <li>Send notifications, updates, and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">3. Information Sharing and Disclosure</h2>
              <p className="text-gray-700">
                We do not share your personal information with third parties except in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mt-2 text-gray-700 space-y-1">
                <li>With your consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect and defend our rights and property</li>
                <li>With service providers who help us operate our business</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
              <p className="text-gray-700">
                We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
              <p className="text-gray-700">
                You have the right to access, update, or delete your personal information. You can do this through your account settings or by contacting us directly.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">6. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700">
                We use cookies and similar tracking technologies to track activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">7. Children's Privacy</h2>
              <p className="text-gray-700">
                Our Service does not address anyone under the age of 18. We do not knowingly collect personally identifiable information from children under 18.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">8. Changes to This Privacy Policy</h2>
              <p className="text-gray-700">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "effective date" at the top of this Privacy Policy.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">9. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy, please contact us at privacy@househelp.ng.
              </p>
            </section>
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-primary-600 hover:text-primary-800">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}