import Link from 'next/link';
import DashboardNav from '@/components/DashboardNav';
import BrandLogo from '@/components/BrandLogo';

export const metadata = {
  title: 'Terms of Service - Best Husband Ever',
  description: 'Terms of Service for Best Husband Ever',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/" className="inline-block mb-6">
              <BrandLogo variant="nav" />
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-4">Terms of Service</h1>
            <p className="text-sm text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8 space-y-6 text-slate-300">
            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">1. Acceptance of Terms</h2>
              <p className="text-sm leading-relaxed">
                By accessing and using Best Husband Ever ("the Service"), you accept and agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">2. Description of Service</h2>
              <p className="text-sm leading-relaxed">
                Best Husband Ever provides daily relationship actions, tips, and tools to help improve your relationship. 
                The Service includes but is not limited to: daily action suggestions, progress tracking, journaling features, 
                and educational content. We are not a substitute for professional therapy, counseling, or medical advice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">3. Not Professional Advice</h2>
              <p className="text-sm leading-relaxed">
                The content provided through the Service is for informational and educational purposes only. It is not intended 
                as professional relationship counseling, therapy, or medical advice. Always seek the advice of qualified 
                professionals for serious relationship or personal issues. We are not responsible for any decisions made 
                based on the content provided.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">4. Subscription and Payment</h2>
              <div className="text-sm leading-relaxed space-y-2">
                <p>
                  <strong className="text-slate-50">Free Trial:</strong> We offer a 7-day free trial for paid features. 
                  No credit card is required during the trial period.
                </p>
                <p>
                  <strong className="text-slate-50">Subscription Plans:</strong> After the trial, you may choose to 
                  continue with a paid subscription ($7/month) or use the free tier. Subscriptions automatically renew 
                  unless cancelled.
                </p>
                <p>
                  <strong className="text-slate-50">Cancellation:</strong> You may cancel your subscription at any time. 
                  Cancellation takes effect at the end of your current billing period. No refunds are provided for partial 
                  billing periods.
                </p>
                <p>
                  <strong className="text-slate-50">Refunds:</strong> Refund requests will be considered on a case-by-case 
                  basis within 30 days of payment. Contact us at action@besthusbandever.com for refund requests.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">5. User Accounts</h2>
              <p className="text-sm leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us 
                immediately of any unauthorized use of your account. We reserve the right to suspend or terminate accounts 
                that violate these terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">6. User Content</h2>
              <p className="text-sm leading-relaxed">
                You retain ownership of any content you create or share through the Service (such as journal entries). 
                By using the Service, you grant us a license to store, display, and process your content as necessary to 
                provide the Service. You are responsible for ensuring your content does not violate any laws or infringe 
                on the rights of others.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">7. Prohibited Uses</h2>
              <p className="text-sm leading-relaxed mb-2">You agree not to:</p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Use the Service for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Share your account with others</li>
                <li>Use automated systems to access the Service</li>
                <li>Post harmful, abusive, or offensive content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">8. Intellectual Property</h2>
              <p className="text-sm leading-relaxed">
                All content, features, and functionality of the Service are owned by Best Husband Ever and are protected 
                by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute any 
                content from the Service without our written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">9. Limitation of Liability</h2>
              <p className="text-sm leading-relaxed">
                To the maximum extent permitted by law, Best Husband Ever shall not be liable for any indirect, incidental, 
                special, or consequential damages arising from your use of the Service. Our total liability shall not exceed 
                the amount you paid for the Service in the 12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">10. Changes to Terms</h2>
              <p className="text-sm leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. We will notify users of significant changes 
                via email or through the Service. Continued use of the Service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">11. Contact Information</h2>
              <p className="text-sm leading-relaxed">
                If you have questions about these Terms of Service, please contact us at:{' '}
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

