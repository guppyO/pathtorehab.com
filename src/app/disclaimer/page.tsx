import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME, SITE_URL } from '@/lib/db';
import { Footer } from '@/components/Footer';
import { ChevronRight, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: `Important disclaimers and disclosures for ${SITE_NAME}. Understand the limitations of our information.`,
  alternates: {
    canonical: `${SITE_URL}/disclaimer`,
  },
};

export default function DisclaimerPage() {
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
            <span className="text-foreground font-medium">Disclaimer</span>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Disclaimer</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          {/* Important Medical Disclaimer */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 not-prose">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Important Medical Disclaimer</h2>
                <p className="text-muted-foreground">
                  The information provided on {SITE_NAME} is for general informational purposes only and is NOT
                  intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek
                  the advice of your physician, mental health professional, or other qualified health provider with
                  any questions you may have regarding a medical condition or treatment options.
                </p>
              </div>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">No Endorsement</h2>
            <p className="text-muted-foreground">
              {SITE_NAME} does not endorse, recommend, or guarantee any specific treatment facility, program, or
              service listed on this website. The inclusion of a facility in our directory does not imply any
              endorsement of its services, qualifications, or effectiveness.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Data Source & Accuracy</h2>
            <p className="text-muted-foreground">
              All facility information on this website is sourced from the Substance Abuse and Mental Health Services
              Administration (SAMHSA), a federal government agency. While we strive to keep information current:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Information may be outdated or inaccurate</li>
              <li>Facility details, services, or availability may change without notice</li>
              <li>We do not verify the accuracy of information provided by SAMHSA</li>
              <li>Always contact facilities directly to confirm current information</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Not a Treatment Provider</h2>
            <p className="text-muted-foreground">
              {SITE_NAME} is an informational directory service only. We are NOT:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>A treatment facility or healthcare provider</li>
              <li>A referral service that places patients in treatment</li>
              <li>A medical advice service</li>
              <li>A crisis intervention service</li>
            </ul>
            <p className="text-muted-foreground">
              <strong>If you are experiencing a medical emergency, call 911 immediately.</strong>
            </p>
            <p className="text-muted-foreground">
              <strong>If you need immediate help with substance abuse or mental health:</strong> Call the SAMHSA
              National Helpline at{' '}
              <a href="tel:1-800-662-4357" className="text-primary hover:underline">
                1-800-662-4357
              </a>{' '}
              (available 24/7, 365 days a year).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Affiliate & Advertising Disclosure</h2>
            <p className="text-muted-foreground">
              This website may contain advertisements and affiliate links. We may receive compensation when you
              click on links or make purchases through our site. This compensation may influence which facilities
              are displayed or how they are presented. However, our editorial content and facility listings are
              based on SAMHSA data and are not influenced by compensation.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">External Links</h2>
            <p className="text-muted-foreground">
              This website contains links to external websites operated by treatment facilities and other third
              parties. We have no control over the content, privacy policies, or practices of these external sites
              and are not responsible for their content or accuracy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Under no circumstances shall {SITE_NAME}, its owners, operators, or affiliates be liable for any
              direct, indirect, incidental, special, consequential, or punitive damages arising from:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Your use of or inability to use this website</li>
              <li>Any decisions made based on information provided on this website</li>
              <li>Treatment outcomes at any facility listed on this website</li>
              <li>Actions or omissions of any treatment facility</li>
              <li>Errors or inaccuracies in facility information</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Your Responsibility</h2>
            <p className="text-muted-foreground">
              You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Verifying all facility information before making decisions</li>
              <li>Consulting with qualified healthcare professionals</li>
              <li>Conducting your own due diligence on any treatment facility</li>
              <li>Understanding your insurance coverage and payment obligations</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Changes to This Disclaimer</h2>
            <p className="text-muted-foreground">
              We reserve the right to update this disclaimer at any time. Changes will be effective immediately
              upon posting. Your continued use of the website constitutes acceptance of any modified disclaimer.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
