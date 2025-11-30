import { BusinessProfile, GeneratedOffer } from '../types';

const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
    console.warn("Missing ANTHROPIC_API_KEY. AI features will not work.");
}

async function callClaude(system: string, user: string, jsonMode = false): Promise<string> {
    if (!API_KEY) throw new Error("Missing Anthropic API Key");

    const headers = {
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "anthropic-dangerous-direct-browser-access": "true"
    };

    const body = {
        model: "claude-sonnet-4-5",
        max_tokens: 4096,
        system: system,
        messages: [
            { role: "user", content: user }
        ]
    };

    try {
        // Use local proxy to avoid CORS
        const response = await fetch("/api/anthropic/v1/messages", {
            method: "POST",
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Anthropic API Error: ${err}`);
        }

        const data = await response.json();
        return data.content[0].text;
    } catch (error) {
        console.error("Anthropic Call Failed", error);
        throw error;
    }
}

// ---------------------------------------------------------
// 1. Knowledge Extraction
// ---------------------------------------------------------

export const extractBusinessFacts = async (text: string, industry?: string): Promise<string[]> => {
    const system = `
    You are a Business Analyst.
    Extract distinct, factual business rules, services, pricing models, constraints, and key selling points from the text.
    Return them as a JSON array of strings.
    ${industry === 'Video services' ? 'Focus on: Services, Deliverables, Pricing, Timeline, Creative Identity, Process.' : ''}
  `;

    const prompt = `Extract facts from this text:\n"${text}"\n\nReturn ONLY a JSON array of strings.`;

    const result = await callClaude(system, prompt);
    try {
        // Claude might wrap in markdown code block
        const clean = result.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(clean);
    } catch (e) {
        console.error("Failed to parse JSON", result);
        return [];
    }
};

export const extractCaseStudies = async (text: string): Promise<string[]> => {
    const system = `
    You are a Portfolio Curator.
    Extract case studies, projects, and results.
    Format as: "Client/Project: [What was done] - [Result]"
    Return as a JSON array of strings.
  `;

    const prompt = `Extract case studies from:\n"${text}"\n\nReturn ONLY a JSON array of strings.`;

    const result = await callClaude(system, prompt);
    try {
        const clean = result.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(clean);
    } catch (e) {
        return [];
    }
};

// ---------------------------------------------------------
// 2. Knowledge Audit
// ---------------------------------------------------------

export const auditKnowledgeBase = async (currentFacts: string[], industry: string): Promise<string[]> => {
    if (!currentFacts.length) return ["Start by adding your Core Services and Base Prices."];

    const system = `
    You are a Strategic Auditor for a ${industry} business.
    Identify top 3-5 missing critical pieces of info needed for sales offers.
    Return as a JSON array of actionable suggestions (strings).
  `;

    const prompt = `
    Current Facts:
    ${currentFacts.map(f => `- ${f}`).join('\n')}

    Return ONLY a JSON array of strings.
  `;

    const result = await callClaude(system, prompt);
    try {
        const clean = result.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(clean);
    } catch (e) {
        return [];
    }
};

// ---------------------------------------------------------
// 3. Offer Generation
// ---------------------------------------------------------

export const generateOfferDraft = async (
    business: BusinessProfile,
    clientEmail: string,
    options: any
): Promise<GeneratedOffer> => {
    const system = `
    You are a Senior Creative Partner at "${business.companyName}".
    Write a professional offer email based on the client request and business rules.
    Tone: ${business.branding.toneOfVoice}.
    
    Return JSON with fields:
    - status: "ready" or "needs_info"
    - emailSubject: string
    - emailBody: string (HTML format with <h3>, <ul>, <li>, <strong>)
    - missingClientInfo: string[] (questions to ask if needs_info)
    - rationale: string
  `;

    const prompt = `
    Business Rules:
    ${business.knowledgeBase.join('\n')}

    Client Request:
    "${clientEmail}"

    Options: ${JSON.stringify(options)}

    Return ONLY JSON.
  `;

    const result = await callClaude(system, prompt);
    try {
        const clean = result.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(clean);
    } catch (e) {
        throw new Error("Failed to generate offer");
    }
};

// ---------------------------------------------------------
// 4. HTML Email Design
// ---------------------------------------------------------

export const generateHtmlEmail = async (
    offer: GeneratedOffer,
    business: BusinessProfile
): Promise<string> => {
    const system = `
    You are an Expert Email Developer.
    Convert the email text into a responsive HTML email template.
    Brand Color: ${business.branding.primaryColor}.
    Font: ${business.branding.fontName}.
    Return ONLY raw HTML.
  `;

    const prompt = `
    Subject: ${offer.emailSubject}
    Body: ${offer.emailBody}
  `;

    const result = await callClaude(system, prompt);
    return result.replace(/```html/g, '').replace(/```/g, '').trim();
};
