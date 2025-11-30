import { GoogleGenAI, Type } from "@google/genai";
import { BusinessProfile, GeneratedOffer } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const VIDEO_SERVICES_FRAMEWORK = `
FRAMEWORK FOR VIDEO SERVICES:
1. Services & Deliverables:
   - Core services (e.g., Paid Ads, UGC, Explainers)
   - Deliverables (Lengths 6s-60s, Ratios 9:16/16:9, Revisions, Scripts, Raw footage rules)
   - Exclusions/Red Lines (What is NOT offered)

2. Pricing System:
   - Base prices for specific services
   - Add-on prices (Rush, Source files, Voiceover)
   - Discount rules (Max %, Bundle logic)

3. Production Timeline & Capacity:
   - Standard timeline steps (Concept -> Delivery)
   - Rush options & Fees
   - Weekly/Monthly capacity limits

4. Creative Identity:
   - Visual aesthetic styles
   - Unique selling points/Strengths
   - Case study details (Problem -> Solution)

5. Process & Policies:
   - Onboarding steps (Brief -> Contract -> Deposit)
   - Payment terms (Deposit %, Refund rules)
   - Scope boundaries (What counts as extra)
`;

// ---------------------------------------------------------
// 1. Knowledge Extraction Agents
// ---------------------------------------------------------

export const extractBusinessFacts = async (text: string, industry?: string): Promise<string[]> => {
  let systemInstruction = `
    You are a Business Analyst.
    Extract distinct, factual business rules, services, pricing models, constraints, and key selling points from the text below.
    Return them as a flat JSON array of concise strings.
    Each string should be a standalone fact.
  `;

  // Specific Override for Video Services
  if (industry === 'Video services') {
    systemInstruction = `
      You are a Specialized Consultant for a Video Production Agency.
      Your goal is to extract business facts from the text specifically mapping to this framework:
      ${VIDEO_SERVICES_FRAMEWORK}

      INSTRUCTIONS:
      1. Analyze the input text.
      2. Extract specific facts that answer the questions in the FRAMEWORK above.
      3. Format each fact clearly (e.g., "Service: We do not offer 3D animation", "Pricing: Rush fee is +30%", "Process: 50% deposit required").
      4. If the text contains information not in the framework but relevant to the business, include it as well.
      5. Do not hallucinate facts. Only extract what is explicitly stated or strongly implied in the text.
      6. Return a flat JSON array of strings.
    `;
  }

  const prompt = `
    ${systemInstruction}

    Input Text:
    "${text}"
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  const textResponse = response.text;
  if (!textResponse) return [];
  return JSON.parse(textResponse) as string[];
};

export const extractCaseStudies = async (text: string): Promise<string[]> => {
  const prompt = `
    You are a Portfolio Curator.
    Extract case studies, past project examples, client names, and links from the text.
    Format them into concise, punchy "Proof Points" that a salesperson can use.
    
    Structure: "Client/Project Name: [What was done] - [Result/Outcome] ([Link if present])"

    Input Text:
    "${text}"
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  const textResponse = response.text;
  if (!textResponse) return [];
  return JSON.parse(textResponse) as string[];
};

// ---------------------------------------------------------
// 2. Knowledge Audit Agent (Gap Analysis)
// ---------------------------------------------------------

export const auditKnowledgeBase = async (currentFacts: string[], industry: string): Promise<string[]> => {
  // 1. Instant Start for Empty States (No API call needed)
  if (!currentFacts || currentFacts.length === 0) {
    if (industry === 'Video services') {
      return [
        "List your Core Services (e.g., 'UGC Ads', 'Event Coverage')",
        "Define your Base Pricing (e.g., 'Starting at $500')",
        "State your Standard Turnaround Time (e.g., '5-7 business days')"
      ];
    }
    return ["Start by adding your Core Services and Base Prices."];
  }

  // 2. Deep Audit for Populated States
  let framework = "General Business Framework (Services, Pricing, Identity, Operations)";
  if (industry === 'Video services') {
    framework = VIDEO_SERVICES_FRAMEWORK;
  }

  const prompt = `
    You are a Strategic Auditor for a ${industry} business.
    
    Current Knowledge Base (Facts provided so far):
    ${currentFacts.map(f => `- ${f}`).join('\n')}

    Target Framework:
    ${framework}

    Task:
    Compare the Current Knowledge Base against the Target Framework.
    Identify the top 3-5 most critical missing pieces of information that are necessary to generate accurate sales offers.
    
    Output:
    A JSON array of strings. Each string must be a specific, actionable suggestion starting with a verb (e.g., "Define your rush delivery fees", "List your payment terms for new clients").
    Do NOT suggest things that are already present.
    If the profile is very strong, suggest 1 advanced tip (e.g., "Add a specific case study for X").
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  const textResponse = response.text;
  if (!textResponse) return [];
  return JSON.parse(textResponse) as string[];
}

// ---------------------------------------------------------
// 3. Offer Generation Agent
// ---------------------------------------------------------

interface OfferOptions {
  includeSummary: boolean;
  includeQuestions: boolean;
  includeTiers: boolean;
  includeWorkflow: boolean;
  includePS: boolean;
}

export const generateOfferDraft = async (
  business: BusinessProfile,
  clientEmail: string,
  options: OfferOptions = {
    includeSummary: true,
    includeQuestions: true,
    includeTiers: true,
    includeWorkflow: true,
    includePS: true
  }
): Promise<GeneratedOffer> => {

  const structureInstructions = [
    "Greeting: Casual, brief, and human. No 'I hope this email finds you well'.",
    options.includeSummary ? "The Plan (Project Summary): Bullet points ONLY. Briefly re-state their need and our approach." : "",
    options.includeQuestions ? "Clarifications (Questions): Only ask 1-3 high-impact questions (Rated 8-10 in importance). If asking about design, ask for examples/mood boards." : "",
    options.includeTiers ? "The Options (3-Tier Packages): Use a table or clean list. Basic / Pro / Advanced. Include price if known, otherwise ranges. Link relevant Portfolio items here." : "",
    options.includeWorkflow ? "Next Steps (Workflow): 1. Pre-prod 2. Shoot 3. Edit. Keep it very short." : "",
    "Call to Action: Clear single step to proceed.",
    options.includePS ? "P.S.: A quick value-add or reminder." : ""
  ].filter(Boolean).join("\n\n");

  const prompt = `
    ROLE:
    You are a Senior Creative Partner at "${business.companyName}". 
    You are NOT an AI assistant. You are a human expert.
    
    YOUR GOAL:
    Write a short, professional, and clear offer email.
    
    TONE:
    - Real, Human, Professional.
    - NOT Salesy or Hype-filled.
    - NO administrative fluff ("We are pleased to submit...").
    - NO repetition.
    - Use bullet points and bold text for scanning.
    - Tone: ${business.branding.toneOfVoice} (But keep it grounded and efficient).
    
    STYLE MIMICRY (Use these past emails as a reference for voice and sentence length):
    ${(business.pastEmails || []).map((e, i) => `--- EXAMPLE ${i+1} ---\n${e}\n`).join('\n')}

    BUSINESS CONTEXT (Rules & Pricing):
    ${business.knowledgeBase.map(k => `- ${k}`).join('\n')}

    PORTFOLIO (Proof Points):
    ${(business.caseStudies || []).map(k => `- ${k}`).join('\n')}

    CLIENT REQUEST:
    "${clientEmail}"

    CRITICAL RULES FOR CONTENT:
    1. **Strict Service Boundary**: ONLY offer services explicitly listed in the "BUSINESS CONTEXT". Do NOT invent services to please the client. If they ask for something we don't do (based on context), politely decline that specific part or say we can discuss it.
    2. **Reasonable Assumptions**: Do not make up specific details (like "30-second duration") unless they are standard rules in the Business Context or explicitly requested by the client. Use ranges or placeholders if unsure.
    3. **Brevity**: Cut all unnecessary words. Be direct. Match the length of the PAST EMAIL EXAMPLES if available.
    4. **Questions**: 
       - Internal Step: Generate potential questions. Rank them 1-10 on importance.
       - Action: DISCARD any questions rated 1-3. 
       - Action: KEEP only the top 1-3 questions rated 8-10 (e.g., "Hard deadline?", "Decision maker?").
       - If asking about design, DO NOT ask for "guidelines". Ask for "examples, links, or a mood description".
    5. **Structure**: Use HTML tags (<h3>, <ul>, <li>, <strong>) to create visual hierarchy.

    REQUIRED EMAIL STRUCTURE:
    ${structureInstructions}

    TASK:
    1. Analyze the request against the Business Context.
    2. Determine if you have enough info for a "Ready" offer or if it "Needs Info".
    3. Draft the email body using the structure above.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          status: { type: Type.STRING, enum: ["ready", "needs_info"] },
          emailSubject: { type: Type.STRING },
          emailBody: { type: Type.STRING, description: "The HTML body of the email draft" },
          missingClientInfo: { type: Type.ARRAY, items: { type: Type.STRING } },
          rationale: { type: Type.STRING, description: "Why did you make these decisions?" }
        },
        required: ["status", "emailSubject", "emailBody", "missingClientInfo", "rationale"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");

  return JSON.parse(text) as GeneratedOffer;
};