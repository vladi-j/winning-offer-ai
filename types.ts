// Business Domain Types

export interface Branding {
  primaryColor: string;
  fontName: string;
  logoUrl?: string;
  toneOfVoice: 'professional' | 'casual' | 'urgent' | 'luxury';
}

export interface BusinessProfile {
  id: string;
  companyName: string;
  industry: string;
  knowledgeBase: string[]; // List of editable facts/rules
  caseStudies: string[];   // List of past projects, links, and examples
  pastEmails: string[];    // List of past email examples for tone matching
  branding: Branding;
  isVerified: boolean; 
}

// AI Analysis Types

export interface AIAuditResult {
  completenessScore: number;
  identifiedServices: string[];
  missingCriticalInfo: string[];
  suggestions: string[];
  riskAnalysis: string;
}

export interface OfferRequest {
  clientEmailRaw: string;
  clientName?: string;
  channel: 'email' | 'whatsapp' | 'linkedin';
}

export interface GeneratedOffer {
  status: 'ready' | 'needs_info';
  emailSubject: string;
  emailBody: string;
  missingClientInfo: string[]; // Questions to ask back
  rationale: string;
}

// State Management Types

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  ONBOARDING = 'ONBOARDING',
  OFFER_CREATION = 'OFFER_CREATION',
}