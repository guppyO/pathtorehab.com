/**
 * FACILITY INSIGHTS ENGINE
 *
 * Generates unique, data-driven insights for each facility page.
 * These insights differentiate pages to avoid "thin content" / doorway page penalties.
 */

import { supabase, Facility } from './db';

export interface FacilityRankings {
  // City ranking
  cityRank: number;
  totalInCity: number;

  // State ranking
  stateRank: number;
  totalInState: number;

  // Service counts
  typeOfCareCount: number;
  serviceSettingsCount: number;
  paymentOptionsCount: number;
  specialProgramsCount: number;

  // Features
  has24HourHotline: boolean;
  hasIntakePhone: boolean;
  hasWebsite: boolean;
  hasDualDiagnosis: boolean;
  hasDetox: boolean;
  hasMAT: boolean;
}

export interface FacilityInsight {
  type: 'ranking' | 'services' | 'access' | 'specialty' | 'highlight';
  title: string;
  description: string;
  highlight?: string;
  positive?: boolean;
}

/**
 * Get ranking data for a specific facility
 */
export async function getFacilityRankings(facility: Facility): Promise<FacilityRankings> {
  // Get city ranking
  const { data: cityFacilities } = await supabase
    .from('facilities')
    .select('id, dqs')
    .eq('state', facility.state)
    .eq('city_slug', facility.city_slug)
    .eq('is_indexable', true)
    .order('dqs', { ascending: false });

  const cityRank = cityFacilities?.findIndex(f => f.id === facility.id) ?? -1;
  const totalInCity = cityFacilities?.length || 1;

  // Get state ranking
  const { data: stateFacilities } = await supabase
    .from('facilities')
    .select('id, dqs')
    .eq('state', facility.state)
    .eq('is_indexable', true)
    .order('dqs', { ascending: false });

  const stateRank = stateFacilities?.findIndex(f => f.id === facility.id) ?? -1;
  const totalInState = stateFacilities?.length || 1;

  // Count services
  const typeOfCareCount = facility.type_of_care?.length || 0;
  const serviceSettingsCount = facility.service_settings?.length || 0;
  const paymentOptionsCount = facility.payment_options?.length || 0;
  const specialProgramsCount = facility.special_programs?.length || 0;

  // Check features
  const allServices = [
    ...(facility.type_of_care || []),
    ...(facility.service_settings || []),
    ...(facility.special_programs || []),
  ].map(s => s.toLowerCase());

  const hasDualDiagnosis = allServices.some(s =>
    s.includes('dual diagnosis') || s.includes('co-occurring')
  );
  const hasDetox = allServices.some(s =>
    s.includes('detox') || s.includes('detoxification')
  );
  const hasMAT = allServices.some(s =>
    s.includes('medication-assisted') || s.includes('mat ') || s.includes('buprenorphine') || s.includes('methadone')
  );

  return {
    cityRank: cityRank + 1,
    totalInCity,
    stateRank: stateRank + 1,
    totalInState,
    typeOfCareCount,
    serviceSettingsCount,
    paymentOptionsCount,
    specialProgramsCount,
    has24HourHotline: !!facility.hotline,
    hasIntakePhone: !!facility.intake_phone,
    hasWebsite: !!facility.website,
    hasDualDiagnosis,
    hasDetox,
    hasMAT,
  };
}

/**
 * Generate unique insights based on the data
 */
export function generateFacilityInsights(facility: Facility, rankings: FacilityRankings): FacilityInsight[] {
  const insights: FacilityInsight[] = [];

  // Ranking insights
  if (rankings.cityRank === 1 && rankings.totalInCity > 1) {
    insights.push({
      type: 'ranking',
      title: `Top-Ranked in ${facility.city}`,
      description: `This facility ranks #1 out of ${rankings.totalInCity} treatment centers in ${facility.city}, ${facility.state} based on service comprehensiveness.`,
      highlight: '#1 in city',
      positive: true,
    });
  } else if (rankings.cityRank <= 3 && rankings.totalInCity >= 5) {
    insights.push({
      type: 'ranking',
      title: `Top 3 in ${facility.city}`,
      description: `Ranked #${rankings.cityRank} among ${rankings.totalInCity} treatment facilities in ${facility.city}.`,
      positive: true,
    });
  } else if (rankings.totalInCity === 1) {
    insights.push({
      type: 'ranking',
      title: 'Only Facility in Area',
      description: `This is the only SAMHSA-listed treatment facility in ${facility.city}, ${facility.state}.`,
      highlight: 'Only option locally',
    });
  } else if (rankings.totalInCity > 1) {
    insights.push({
      type: 'ranking',
      title: 'Local Option',
      description: `One of ${rankings.totalInCity} treatment facilities in ${facility.city}. Compare services to find the best fit.`,
    });
  }

  // State ranking
  if (rankings.stateRank <= 10 && rankings.totalInState >= 50) {
    insights.push({
      type: 'ranking',
      title: `Top 10 in ${facility.state_name || facility.state}`,
      description: `Ranked #${rankings.stateRank} out of ${rankings.totalInState} facilities statewide based on comprehensive services offered.`,
      highlight: `Top 10 statewide`,
      positive: true,
    });
  }

  // 24/7 Access
  if (rankings.has24HourHotline) {
    insights.push({
      type: 'access',
      title: '24/7 Hotline Available',
      description: 'This facility offers a 24-hour hotline for immediate assistance, available any time day or night.',
      highlight: '24/7 access',
      positive: true,
    });
  }

  // Specialty services
  if (rankings.hasDualDiagnosis) {
    insights.push({
      type: 'specialty',
      title: 'Dual Diagnosis Treatment',
      description: 'Offers specialized treatment for co-occurring mental health and substance use disorders, addressing both conditions simultaneously.',
      highlight: 'Dual diagnosis',
      positive: true,
    });
  }

  if (rankings.hasDetox) {
    insights.push({
      type: 'specialty',
      title: 'Detoxification Services',
      description: 'Provides medically supervised detoxification services to safely manage withdrawal symptoms.',
      highlight: 'Detox available',
      positive: true,
    });
  }

  if (rankings.hasMAT) {
    insights.push({
      type: 'specialty',
      title: 'Medication-Assisted Treatment',
      description: 'Offers FDA-approved medications like buprenorphine or methadone as part of a comprehensive treatment approach.',
      highlight: 'MAT available',
      positive: true,
    });
  }

  // Service breadth
  const totalServices = rankings.typeOfCareCount + rankings.serviceSettingsCount + rankings.specialProgramsCount;
  if (totalServices >= 15) {
    insights.push({
      type: 'services',
      title: 'Comprehensive Care',
      description: `Offers ${totalServices}+ different treatment services and programs, providing a wide range of care options.`,
      highlight: 'Full-service',
      positive: true,
    });
  } else if (totalServices >= 8) {
    insights.push({
      type: 'services',
      title: 'Multiple Treatment Options',
      description: `Provides ${totalServices} different services and treatment approaches to address various recovery needs.`,
    });
  }

  // Payment flexibility
  if (rankings.paymentOptionsCount >= 5) {
    insights.push({
      type: 'access',
      title: 'Flexible Payment Options',
      description: `Accepts ${rankings.paymentOptionsCount} different payment methods including various insurance plans and financial assistance options.`,
      positive: true,
    });
  }

  // Website availability (shows professionalism)
  if (rankings.hasWebsite && rankings.hasIntakePhone) {
    insights.push({
      type: 'access',
      title: 'Easy to Contact',
      description: 'Has dedicated intake phone line and website for easy access to information and admissions.',
    });
  }

  return insights;
}

/**
 * Get questions customized for this facility type
 */
export function getCustomizedQuestions(facility: Facility): string[] {
  const questions: string[] = [];
  const allServices = [
    ...(facility.type_of_care || []),
    ...(facility.service_settings || []),
    ...(facility.special_programs || []),
  ].map(s => s.toLowerCase());

  // Base questions everyone should ask
  questions.push("What is your admission process and timeline?");
  questions.push("Do you accept my insurance plan?");

  // Detox-specific
  if (allServices.some(s => s.includes('detox'))) {
    questions.push("What medications are used during detox, and how long does it typically last?");
  }

  // Residential-specific
  if (allServices.some(s => s.includes('residential') || s.includes('inpatient'))) {
    questions.push("What is the typical length of stay for the residential program?");
    questions.push("What does a typical day in the program look like?");
  }

  // Outpatient-specific
  if (allServices.some(s => s.includes('outpatient'))) {
    questions.push("How many hours per week does the outpatient program require?");
    questions.push("Do you offer evening or weekend sessions?");
  }

  // MAT-specific
  if (allServices.some(s => s.includes('medication') || s.includes('buprenorphine') || s.includes('methadone'))) {
    questions.push("Which medication-assisted treatment options do you offer?");
  }

  // Dual diagnosis
  if (allServices.some(s => s.includes('dual') || s.includes('co-occurring'))) {
    questions.push("How do you address co-occurring mental health conditions?");
  }

  // Family involvement
  if (allServices.some(s => s.includes('family'))) {
    questions.push("What family therapy or involvement options are available?");
  }

  // Aftercare
  questions.push("What aftercare or continuing care support do you provide?");

  // Return unique questions, limited to 6
  return [...new Set(questions)].slice(0, 6);
}

/**
 * Get comparison facilities
 */
export async function getComparisonFacilities(
  facility: Facility,
  limit: number = 5
): Promise<{ name: string; slug: string; city: string; typeOfCareCount: number }[]> {
  const { data } = await supabase
    .from('facilities')
    .select('name, slug, city, type_of_care')
    .eq('state', facility.state)
    .eq('city_slug', facility.city_slug)
    .eq('is_indexable', true)
    .neq('id', facility.id)
    .order('dqs', { ascending: false })
    .limit(limit);

  return (data || []).map(f => ({
    name: f.name,
    slug: f.slug,
    city: f.city,
    typeOfCareCount: f.type_of_care?.length || 0,
  }));
}
