import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME, SITE_URL } from '@/lib/db';
import { ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `Terms of Service for ${SITE_NAME}. Read our terms and conditions for using this website.`,
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <ChevronRight className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">{SITE_NAME}</span>
          </Link>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">Terms of Service</span>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Terms of Service</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Agreement to Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using {SITE_NAME}, you agree to be bound by these Terms of Service. If you do not agree
              to these terms, please do not use our website.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Description of Service</h2>
            <p className="text-muted-foreground">
              {SITE_NAME} is an informational directory that provides listings of addiction treatment and mental health
              facilities sourced from the Substance Abuse and Mental Health Services Administration (SAMHSA). We aggregate
              publicly available data to help users find treatment options.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Important Disclaimers</h2>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-foreground font-medium mb-2">Medical Disclaimer</p>
              <p className="text-muted-foreground text-sm">
                The information provided on this website is for general informational purposes only. It is NOT a substitute
                for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare
                provider with any questions you may have regarding a medical condition or treatment.
              </p>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>We do not endorse, recommend, or guarantee any specific treatment facility.</li>
              <li>Facility information is sourced from SAMHSA and may not be current or accurate.</li>
              <li>We are not a treatment provider and do not provide medical services.</li>
              <li>Contact facilities directly to verify information before making decisions.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Use of Website</h2>
            <p className="text-muted-foreground">You agree to use this website only for lawful purposes. You must not:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Use the website in any way that violates applicable laws or regulations</li>
              <li>Attempt to gain unauthorized access to any part of the website</li>
              <li>Use automated systems to scrape or extract data without permission</li>
              <li>Interfere with or disrupt the website or servers</li>
              <li>Transmit any malicious code or harmful content</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Intellectual Property</h2>
            <p className="text-muted-foreground">
              The website design, logos, and original content are owned by {SITE_NAME}. Facility data is sourced from
              SAMHSA and is in the public domain. You may not reproduce, distribute, or create derivative works from
              our proprietary content without permission.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Third-Party Links</h2>
            <p className="text-muted-foreground">
              Our website contains links to third-party websites, including treatment facility websites. We are not
              responsible for the content, privacy policies, or practices of these external sites.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, {SITE_NAME} shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages arising from your use of the website or reliance on any
              information provided.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Indemnification</h2>
            <p className="text-muted-foreground">
              You agree to indemnify and hold harmless {SITE_NAME} from any claims, damages, or expenses arising from
              your use of the website or violation of these terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.
              Your continued use of the website constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Governing Law</h2>
            <p className="text-muted-foreground">
              These terms shall be governed by and construed in accordance with applicable laws, without regard to
              conflict of law principles.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Contact</h2>
            <p className="text-muted-foreground">
              If you have questions about these Terms of Service, please contact us through our website.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
