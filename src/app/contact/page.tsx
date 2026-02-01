/**
 * CONTACT PAGE - Path to Rehab
 *
 * Provides a full contact page that satisfies AdSense "Contact" requirements.
 */

import { Metadata } from 'next';
import { ContactForm } from '@/components/ContactForm';

const SITE_NAME = 'Path to Rehab';
const SITE_DESCRIPTION = 'Find substance abuse treatment facilities near you with verified SAMHSA data.';

export const metadata: Metadata = {
  title: `Contact Us - ${SITE_NAME}`,
  description: `Get in touch with ${SITE_NAME}. Report issues, suggest improvements, or ask questions about finding treatment facilities.`,
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Contact Us
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
            Have a question, found an issue, or want to suggest an improvement?
            We'd love to hear from you.
          </p>
        </div>

        {/* Contact Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
          <ContactForm siteName={SITE_NAME} />
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            All messages are reviewed to help improve {SITE_NAME}.
          </p>
          <p className="mt-2">
            {SITE_DESCRIPTION}
          </p>
        </div>

        {/* FAQ Section (helps with SEO and user trust) */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                What happens to my message?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                All messages are reviewed by our team. We use your input to prioritize
                improvements and fix issues.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Will I receive a response?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                If you provide your email and your message requires follow-up,
                we'll reach out. However, we may not respond to every submission.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                How do I report incorrect facility information?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Select "Facility Information Issue" as the message type and include details about
                which facility has incorrect data. Our information comes from SAMHSA's official
                treatment locator database.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Where does the facility data come from?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                All facility information on Path to Rehab comes from SAMHSA's
                (Substance Abuse and Mental Health Services Administration) official
                treatment facility locator database.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Can I add my treatment facility to this site?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Facilities are listed through SAMHSA's database. To be listed, your facility
                must register with SAMHSA's Behavioral Health Treatment Services Locator.
                Contact SAMHSA directly to add or update facility information.
              </p>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="mt-8 bg-amber-50 dark:bg-amber-950 rounded-xl border border-amber-200 dark:border-amber-800 p-6">
          <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
            Need Immediate Help?
          </h3>
          <p className="text-amber-700 dark:text-amber-300 text-sm">
            If you or someone you know is struggling with substance abuse, please call
            SAMHSA's National Helpline at <strong>1-800-662-4357</strong>. It's free,
            confidential, available 24/7/365.
          </p>
        </div>
      </div>
    </main>
  );
}
