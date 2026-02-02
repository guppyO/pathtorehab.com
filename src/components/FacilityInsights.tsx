/**
 * FACILITY INSIGHTS COMPONENT
 *
 * Displays unique, data-driven insights for each facility page.
 * This differentiates pages to avoid "thin content" / doorway page penalties.
 */

import Link from 'next/link';
import { Award, Activity, Heart, Clock, Shield, HelpCircle } from 'lucide-react';
import type { FacilityInsight, FacilityRankings } from '@/lib/insights';

interface FacilityInsightsProps {
  facilityName: string;
  city: string;
  state: string;
  insights: FacilityInsight[];
  rankings: FacilityRankings;
  customQuestions: string[];
  comparisonFacilities: { name: string; slug: string; city: string; typeOfCareCount: number }[];
}

const iconMap = {
  ranking: Award,
  services: Activity,
  access: Clock,
  specialty: Shield,
  highlight: Heart,
};

export function FacilityInsights({
  facilityName,
  city,
  state,
  insights,
  rankings,
  customQuestions,
  comparisonFacilities,
}: FacilityInsightsProps) {
  return (
    <div className="space-y-6">
      {/* Key Insights Section */}
      {insights.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Key Insights
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            What makes this facility unique in {city}, {state}
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-primary/5 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-primary">#{rankings.cityRank}</div>
              <div className="text-xs text-muted-foreground">in {city}</div>
            </div>
            <div className="bg-secondary/5 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-secondary">#{rankings.stateRank}</div>
              <div className="text-xs text-muted-foreground">in {state}</div>
            </div>
            <div className="bg-accent/10 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-accent-foreground">{rankings.typeOfCareCount}</div>
              <div className="text-xs text-muted-foreground">care types</div>
            </div>
            {/* Show programs if > 0, otherwise show payment options */}
            {rankings.specialProgramsCount > 0 ? (
              <div className="bg-muted rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-foreground">{rankings.specialProgramsCount}</div>
                <div className="text-xs text-muted-foreground">programs</div>
              </div>
            ) : rankings.paymentOptionsCount > 0 ? (
              <div className="bg-muted rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-foreground">{rankings.paymentOptionsCount}</div>
                <div className="text-xs text-muted-foreground">payment options</div>
              </div>
            ) : (
              <div className="bg-muted rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-foreground">{rankings.serviceSettingsCount}</div>
                <div className="text-xs text-muted-foreground">settings</div>
              </div>
            )}
          </div>

          {/* Insight Cards */}
          <div className="space-y-2">
            {insights.slice(0, 4).map((insight, index) => {
              const Icon = iconMap[insight.type] || Heart;

              return (
                <div
                  key={index}
                  className={`flex gap-3 p-3 rounded-lg ${
                    insight.positive
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-muted/50 border border-border'
                  }`}
                >
                  <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                    insight.positive
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-foreground text-sm">
                        {insight.title}
                      </h3>
                      {insight.highlight && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          insight.positive
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {insight.highlight}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {insight.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Customized Questions to Ask */}
      <div className="bg-muted/30 rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-primary" />
          Questions to Ask This Facility
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Based on the services offered, consider asking:
        </p>
        <div className="space-y-2">
          {customQuestions.map((q, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-primary font-bold text-xs mt-0.5">{i + 1}.</span>
              <span className="text-sm text-foreground">{q}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Compare with Other Facilities */}
      {comparisonFacilities.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Other Facilities in {city}
          </h3>
          <div className="space-y-2">
            {comparisonFacilities.map((comp) => (
              <Link
                key={comp.slug}
                href={`/facility/${comp.slug}`}
                className="block p-2 rounded-lg bg-muted/30 hover:bg-muted transition-colors"
              >
                <div className="font-medium text-foreground text-sm line-clamp-1">
                  {comp.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {comp.typeOfCareCount} care types
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
