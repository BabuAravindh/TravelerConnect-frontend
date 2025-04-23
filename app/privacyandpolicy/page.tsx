"use client";

import { Footer } from "@/components/Footer";
import Navbar from "@/components/Navbar";

const PrivacyPolicyPage = () => {
  return (
    <>
      <Navbar />
      <section className="min-h-screen bg-primary py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-800">Privacy Policy</h1>
            <p className="text-gray-600 mt-2">Last Updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 mb-6">
              At TravelerConnect, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
              and safeguard your information when you use our services.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1. Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              We may collect personal information that you voluntarily provide to us when you register, use our services, or 
              communicate with us, including:
            </p>
            <ul className="list-disc pl-5 text-gray-700 mb-6 space-y-1">
              <li>Name, email address, and contact information</li>
              <li>Account credentials (username and password)</li>
              <li>Travel preferences and itinerary details</li>
              <li>Payment information for premium services</li>
              <li>Communications and feedback you provide</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-5 text-gray-700 mb-6 space-y-1">
              <li>Provide, operate, and maintain our services</li>
              <li>Improve and personalize your experience</li>
              <li>Communicate with you about your account</li>
              <li>Process transactions and send related information</li>
              <li>Respond to your inquiries and provide support</li>
              <li>Send technical notices and security alerts</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3. Information Sharing</h2>
            <p className="text-gray-700 mb-4">
              We do not sell your personal information. We may share information with:
            </p>
            <ul className="list-disc pl-5 text-gray-700 mb-6 space-y-1">
              <li>Service providers who assist in our operations</li>
              <li>Other users when you participate in shared travel plans</li>
              <li>Legal authorities when required by law</li>
              <li>Business transfers in case of merger or acquisition</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4. Data Security</h2>
            <p className="text-gray-700 mb-6">
              We implement appropriate technical and organizational measures to protect your personal information. 
              However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5. Your Rights</h2>
            <p className="text-gray-700 mb-4">Depending on your location, you may have rights to:</p>
            <ul className="list-disc pl-5 text-gray-700 mb-6 space-y-1">
              <li>Access, correct, or delete your personal information</li>
              <li>Object to or restrict processing of your data</li>
              <li>Request portability of your data</li>
              <li>Withdraw consent where applicable</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6. Cookies and Tracking</h2>
            <p className="text-gray-700 mb-6">
              We use cookies and similar technologies to enhance your experience, analyze usage, and deliver personalized content. 
              You can control cookies through your browser settings.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7. Children's Privacy</h2>
            <p className="text-gray-700 mb-6">
              Our services are not directed to children under 13. We do not knowingly collect personal information from children. 
              If we become aware of such collection, we will take steps to delete it.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8. Changes to This Policy</h2>
            <p className="text-gray-700 mb-6">
              We may update this Privacy Policy periodically. We will notify you of significant changes by posting the new policy 
              on our website and updating the "Last Updated" date.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">9. Contact Us</h2>
            <p className="text-gray-700">
              If you have questions about this Privacy Policy, please contact us at:
              <br />
              <a href="mailto:privacy@travelerconnect.com" className="text-button underline">
                privacy@travelerconnect.com
              </a>
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default PrivacyPolicyPage;