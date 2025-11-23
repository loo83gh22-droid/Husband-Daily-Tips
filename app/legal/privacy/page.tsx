import Link from 'next/link';
import DashboardNav from '@/components/DashboardNav';
import BrandLogo from '@/components/BrandLogo';

export const metadata = {
  title: 'Privacy Policy - Best Husband Ever',
  description: 'Privacy Policy for Best Husband Ever',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/" className="inline-block mb-6">
              <BrandLogo variant="nav" />
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-4">Privacy Policy</h1>
            <p className="text-sm text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8 space-y-6 text-slate-300">
            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">1. Information We Collect</h2>
              <div className="text-sm leading-relaxed space-y-2">
                <p>
                  <strong className="text-slate-50">Account Information:</strong> When you create an account, we collect 
                  your email address, name, and authentication information through Auth0.
                </p>
                <p>
                  <strong className="text-slate-50">Profile Information:</strong> We collect optional profile information 
                  such as whether you have kids, whether they live with you, and other preferences you choose to provide 
                  to personalize your experience.
                </p>
                <p>
                  <strong className="text-slate-50">Usage Data:</strong> We collect information about how you use the 
                  Service, including actions completed, journal entries, favorites, and progress data.
                </p>
                <p>
                  <strong className="text-slate-50">Technical Data:</strong> We automatically collect certain technical 
                  information such as IP address, browser type, and device information for security and functionality purposes.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">2. How We Use Your Information</h2>
              <p className="text-sm leading-relaxed mb-2">We use your information to:</p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Provide and improve the Service</li>
                <li>Personalize your daily actions and content</li>
                <li>Process subscriptions and payments</li>
                <li>Send you service-related emails (daily actions, updates)</li>
                <li>Respond to your inquiries and provide support</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">3. Data Storage and Security</h2>
              <p className="text-sm leading-relaxed">
                Your data is stored securely using Supabase (PostgreSQL database) and Auth0 (authentication). We implement 
                industry-standard security measures to protect your information. However, no method of transmission over the 
                internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">4. Data Sharing</h2>
              <p className="text-sm leading-relaxed">
                We do not sell your personal information. We may share your data only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4 mt-2">
                <li>With service providers (Auth0, Supabase, Resend for emails) who help us operate the Service</li>
                <li>If required by law or to protect our rights</li>
                <li>In connection with a business transfer (merger, acquisition, etc.)</li>
                <li>With your explicit consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">5. Your Rights</h2>
              <p className="text-sm leading-relaxed mb-2">You have the right to:</p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data (journal entries can be exported)</li>
                <li>Opt out of marketing emails (service emails will still be sent)</li>
                <li>Cancel your account at any time</li>
              </ul>
              <p className="text-sm leading-relaxed mt-3">
                To exercise these rights, contact us at{' '}
                <a href="mailto:action@besthusbandever.com" className="text-primary-400 hover:text-primary-300">
                  action@besthusbandever.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">6. Cookies and Tracking</h2>
              <p className="text-sm leading-relaxed">
                We use cookies and similar technologies to maintain your session, remember your preferences, and improve 
                the Service. You can control cookies through your browser settings, though this may affect Service functionality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">7. Children's Privacy</h2>
              <p className="text-sm leading-relaxed">
                The Service is intended for adults (18+). We do not knowingly collect information from children. If you 
                believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">8. International Users</h2>
              <p className="text-sm leading-relaxed">
                If you are located outside the United States, please note that your information may be transferred to and 
                processed in the United States. By using the Service, you consent to this transfer. If you are in the European 
                Union, you have additional rights under GDPR, which we respect.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">9. Data Retention</h2>
              <p className="text-sm leading-relaxed">
                We retain your data for as long as your account is active or as needed to provide the Service. If you delete 
                your account, we will delete or anonymize your personal data within 30 days, except where we are required 
                to retain it for legal purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">10. Changes to Privacy Policy</h2>
              <p className="text-sm leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of significant changes via email 
                or through the Service. Your continued use of the Service after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">11. Contact Us</h2>
              <p className="text-sm leading-relaxed">
                If you have questions about this Privacy Policy or our data practices, please contact us at:{' '}
                <a href="mailto:action@besthusbandever.com" className="text-primary-400 hover:text-primary-300">
                  action@besthusbandever.com
                </a>
              </p>
            </section>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-primary-400 hover:text-primary-300 text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

