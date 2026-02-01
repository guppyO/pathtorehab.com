/**
 * Footer - Site footer with links and data attribution
 */

import Link from 'next/link';
import { ChevronRight, RefreshCw } from 'lucide-react';
import { SITE_NAME } from '@/lib/db';

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <ChevronRight className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">{SITE_NAME}</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Helping people find the path to recovery with verified treatment center information.
            </p>
            {/* Data freshness */}
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm">
              <RefreshCw className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                Data updated weekly from{' '}
                <a
                  href="https://findtreatment.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 hover:text-primary/80"
                >
                  SAMHSA
                </a>
              </span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/browse" className="hover:text-foreground transition-colors">
                  Browse All States
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-foreground transition-colors">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://findtreatment.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  SAMHSA FindTreatment.gov
                </a>
              </li>
              <li>
                <a href="tel:1-800-662-4357" className="hover:text-foreground transition-colors">
                  National Helpline
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {SITE_NAME}. Data sourced from SAMHSA.</p>
        </div>
      </div>
    </footer>
  );
}
