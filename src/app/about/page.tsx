import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us - Path to Rehab',
  description: 'Learn about Path to Rehab and our mission to help individuals and families find substance abuse treatment facilities.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">
          About Path to Rehab
        </h1>

        <div className="space-y-8">
          <section className="bg-card rounded-xl shadow-sm border border-border p-6 md:p-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Our Mission
            </h2>
            <p className="text-muted-foreground mb-4">
              Path to Rehab was created to help individuals and families navigate the often
              overwhelming process of finding substance abuse treatment. We believe that
              access to accurate, verified treatment facility information should be free
              and easy to find.
            </p>
            <p className="text-muted-foreground">
              Whether you're seeking help for yourself or a loved one, Path to Rehab provides
              comprehensive facility information to help you make informed decisions about
              treatment options in your area.
            </p>
          </section>

          <section className="bg-card rounded-xl shadow-sm border border-border p-6 md:p-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Our Data Source
            </h2>
            <p className="text-muted-foreground mb-4">
              All facility information on Path to Rehab comes directly from SAMHSA (Substance Abuse
              and Mental Health Services Administration), a branch of the U.S. Department of Health
              and Human Services. SAMHSA maintains the most comprehensive database of substance abuse
              treatment facilities in the United States.
            </p>
            <p className="text-muted-foreground mb-4">
              We update our database weekly to ensure you have access to the most current
              information available about treatment facilities, their services, and contact details.
            </p>
            <p className="text-muted-foreground">
              Learn more at{' '}
              <a
                href="https://findtreatment.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary/80"
              >
                FindTreatment.gov
              </a>
            </p>
          </section>

          <section className="bg-card rounded-xl shadow-sm border border-border p-6 md:p-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              What We Provide
            </h2>
            <p className="text-muted-foreground mb-4">
              Path to Rehab helps you:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Find treatment facilities by location (state, city, zip code)</li>
              <li>Filter by treatment type, services offered, and insurance accepted</li>
              <li>Access facility contact information and addresses</li>
              <li>Understand different levels of care and treatment options</li>
            </ul>
          </section>

          <section className="bg-amber-50 dark:bg-amber-950 rounded-xl border border-amber-200 dark:border-amber-800 p-6 md:p-8">
            <h2 className="text-xl font-semibold text-amber-800 dark:text-amber-200 mb-4">
              Need Immediate Help?
            </h2>
            <p className="text-amber-700 dark:text-amber-300 mb-4">
              If you or someone you know is struggling with substance abuse, please call
              SAMHSA's National Helpline:
            </p>
            <p className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-4">
              1-800-662-4357
            </p>
            <p className="text-amber-700 dark:text-amber-300">
              Free, confidential, 24/7, 365-day-a-year treatment referral and information service.
            </p>
          </section>

          <section className="bg-card rounded-xl shadow-sm border border-border p-6 md:p-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Contact Us
            </h2>
            <p className="text-muted-foreground mb-4">
              Have questions, found an issue with facility information, or want to suggest improvements?
              We'd love to hear from you.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors"
            >
              Get in Touch
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
