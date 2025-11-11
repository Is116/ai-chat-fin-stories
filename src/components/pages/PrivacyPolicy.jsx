import React from 'react';
import { Shield, Lock, Eye, Database, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';

const PrivacyPolicy = ({ user, onLogout }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} onLogout={onLogout} />
      <main className="flex-1 bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl border border-white/30">
                <Shield className="w-10 h-10 md:w-12 md:h-12" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Privacy Policy
              </h1>
            </div>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl">
              Your privacy is important to us. This policy explains how we collect, use, and protect your data.
            </p>
            <p className="text-sm text-white/70 mt-4">
              Last updated: November 10, 2025
            </p>
          </div>
        </section>

        {/* Quick Overview */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-12 text-center text-gray-900">
              Privacy at a Glance
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all rounded-2xl text-center">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold mb-2 text-gray-900">Secure</h3>
                <p className="text-sm text-gray-600">Your data is encrypted and protected</p>
              </div>
              <div className="bg-white p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all rounded-2xl text-center">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold mb-2 text-gray-900">Private</h3>
                <p className="text-sm text-gray-600">Conversations are only visible to you</p>
              </div>
              <div className="bg-white p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all rounded-2xl text-center">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Database className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold mb-2 text-gray-900">No Selling</h3>
                <p className="text-sm text-gray-600">We never sell your personal data</p>
              </div>
              <div className="bg-white p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all rounded-2xl text-center">
                <div className="bg-gradient-to-br from-pink-500 to-purple-600 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold mb-2 text-gray-900">Transparent</h3>
                <p className="text-sm text-gray-600">Clear policies, no hidden practices</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-8 md:p-12 border border-gray-200 shadow-xl rounded-2xl">
              <div className="space-y-12">
                {/* Section 1 */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 pb-3 border-b-2 border-gray-200 text-gray-900">
                    1. Information We Collect
                  </h2>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      We collect information that you provide directly to us, including:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Account Information:</strong> Username, email address, and password (encrypted)</li>
                      <li><strong>Profile Information:</strong> Optional profile details you choose to provide</li>
                      <li><strong>Conversation Data:</strong> Messages you send and receive when chatting with characters</li>
                      <li><strong>Usage Information:</strong> How you interact with our service, including pages visited and features used</li>
                      <li><strong>Device Information:</strong> Browser type, IP address, operating system, and device identifiers</li>
                    </ul>
                  </div>
                </div>

                {/* Section 2 */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 pb-3 border-b-2 border-gray-200 text-gray-900">
                    2. How We Use Your Information
                  </h2>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>We use the information we collect to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Provide, maintain, and improve our services</li>
                      <li>Create and manage your account</li>
                      <li>Save and retrieve your conversation history</li>
                      <li>Generate AI responses from literary characters</li>
                      <li>Send you technical notices, updates, and support messages</li>
                      <li>Respond to your comments, questions, and customer service requests</li>
                      <li>Analyze usage patterns to improve user experience</li>
                      <li>Detect, prevent, and address technical issues and security vulnerabilities</li>
                    </ul>
                  </div>
                </div>

                {/* Section 3 */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 pb-3 border-b-2 border-gray-200 text-gray-900">
                    3. Information Sharing and Disclosure
                  </h2>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf (e.g., hosting, analytics)</li>
                      <li><strong>AI Processing:</strong> Your messages are processed by Claude AI (Anthropic) to generate character responses</li>
                      <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                      <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                      <li><strong>With Your Consent:</strong> When you explicitly authorize us to share information</li>
                    </ul>
                  </div>
                </div>

                {/* Section 4 */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 pb-3 border-b-2 border-gray-200 text-gray-900">
                    4. Data Security
                  </h2>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. These measures include:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Encryption of data in transit and at rest</li>
                      <li>Secure password hashing</li>
                      <li>Regular security assessments and updates</li>
                      <li>Limited access to personal information by employees</li>
                      <li>Monitoring for suspicious activity</li>
                    </ul>
                    <p className="mt-4">
                      However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee its absolute security.
                    </p>
                  </div>
                </div>

                {/* Section 5 */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 pb-3 border-b-2 border-gray-200 text-gray-900">
                    5. Your Rights and Choices
                  </h2>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>You have the following rights regarding your personal information:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                      <li><strong>Correction:</strong> Update or correct your personal information</li>
                      <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                      <li><strong>Opt-out:</strong> Unsubscribe from marketing emails at any time</li>
                      <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
                      <li><strong>Restriction:</strong> Request limitation of processing of your personal information</li>
                    </ul>
                    <p className="mt-4">
                      To exercise these rights, please contact us through our Contact page or email us at privacy@literarychat.com.
                    </p>
                  </div>
                </div>

                {/* Section 6 */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 pb-3 border-b-2 border-gray-200 text-gray-900">
                    6. Cookies and Tracking Technologies
                  </h2>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      We use cookies and similar tracking technologies to collect information about your browsing activities. This helps us:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Remember your preferences and settings</li>
                      <li>Keep you logged in</li>
                      <li>Understand how you use our service</li>
                      <li>Improve our platform based on usage patterns</li>
                    </ul>
                    <p className="mt-4">
                      You can control cookies through your browser settings. However, disabling cookies may affect your ability to use certain features.
                    </p>
                  </div>
                </div>

                {/* Section 7 */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 pb-3 border-b-2 border-gray-200 text-gray-900">
                    7. Children's Privacy
                  </h2>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      Literary Chat is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us, and we will delete such information.
                    </p>
                  </div>
                </div>

                {/* Section 8 */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 pb-3 border-b-2 border-gray-200 text-gray-900">
                    8. International Data Transfers
                  </h2>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using our service, you consent to the transfer of your information to these countries.
                    </p>
                  </div>
                </div>

                {/* Section 9 */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 pb-3 border-b-2 border-gray-200 text-gray-900">
                    9. Changes to This Policy
                  </h2>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Significant changes will be communicated via email or a prominent notice on our service.
                    </p>
                    <p>
                      Your continued use of Literary Chat after changes are posted constitutes your acceptance of the updated policy.
                    </p>
                  </div>
                </div>

                {/* Section 10 */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 pb-3 border-b-2 border-gray-200 text-gray-900">
                    10. Contact Us
                  </h2>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                    </p>
                    <div className="bg-gray-50 p-6 border-2 border-black mt-4">
                      <p className="font-bold mb-2">Literary Chat Privacy Team</p>
                      <p>Email: privacy@literarychat.com</p>
                      <p>Address: 123 Literary Lane, Book City, BC 12345</p>
                      <p>Phone: +1 (555) 123-4567</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 bg-black text-white border-t-4 border-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-black uppercase mb-6">
              Questions About Privacy?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Our team is here to help address any privacy concerns you may have.
            </p>
            <Link
              to="/contact"
              className="inline-block bg-white text-black font-bold py-4 px-8 uppercase text-sm border-2 border-white hover:bg-gray-200 transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
