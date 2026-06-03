import { GoogleGenAI, Type } from '@google/genai';
import { AuditReport } from '../types';
import { auditData as fallbackAuditData } from '../mockData';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

const buildFallbackTelemetry = (url: string): { playwright: string; apis: string } => ({
  playwright: [
    `[INFO] Navigating to ${url}`,
    '[WARN] Mobile viewport (390x844): hero text overflow detected in .arch-container',
    '[INFO] GET /api/v1/status -> 200 (118ms)',
    '[WARN] Missing aria-label on primary navigation toggle button',
    '[INFO] POST /api/auth/login -> 200 (146ms)'
  ].join('\n'),
  apis: [
    'GET /api/v1/status - health probe for service readiness',
    'POST /api/auth/login - session authentication endpoint',
    'GET /api/audit/summary - fetches aggregated QA audit results',
    'POST /api/audit/run - triggers orchestration pipeline execution'
  ].join('\n')
});

const buildFallbackReport = (url: string): AuditReport => ({
  ...fallbackAuditData,
  executive_metrics: {
    ...fallbackAuditData.executive_metrics,
    target_url: url
  }
});

export const generateSampleTelemetry = async (url: string): Promise<{playwright: string, apis: string}> => {
  const prompt = `
    Generate realistic mock telemetry data for testing the website: ${url}.
    Return a JSON object with two properties:
    1. "playwright": A raw string simulating console output of a Playwright test run. Include some realistic warnings, network intercepts, or minor layout errors.
    2. "apis": A raw string listing 3-5 potential backend API endpoints for this type of website (e.g., GET /api/v1/status, POST /api/auth) with brief descriptions.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            playwright: { type: Type.STRING },
            apis: { type: Type.STRING }
          },
          required: ["playwright", "apis"]
        }
      }
    });

    if (!response.text) {
      throw new Error('Failed to generate sample telemetry.');
    }

    return JSON.parse(response.text);
  } catch {
    return buildFallbackTelemetry(url);
  }
};

export const generateAuditReport = async (
  url: string, 
  email: string,
  playwrightLogs: string,
  apiLogs: string
): Promise<AuditReport> => {
  const prompt = `
    You are an advanced QA Automation Orchestrator.
    Target Website: ${url}
    User Email: ${email}

    Playwright Execution Telemetry:
    ${playwrightLogs || '(No logs provided. Please simulate realistic Playwright layout/DOM errors based on typical web app issues.)'}

    API Backend Telemetry:
    ${apiLogs || '(No logs provided. Please simulate realistic API/Network latency and response errors.)'}

    Evaluate these logs against the following design constraints:
    - Primary Accent Theme: Pastel Pink/Rose tones (#f4b5b7)
    - Canvas Typography and Text Base: Deep Black/Slate (#111111)
    - UI Status Highlights: Map PASS status to #10b981 (Emerald), WARNING status to #f59e0b (Amber), and FAIL status to #ef4444 (Crimson).

    Output Generation Rules:
    1. You must format your final response strictly as a raw JSON string matching the schema.
    2. Do not wrap the output in markdown backticks. 
    3. Ensure every metric key is populated accurately based on the gathered data.
    4. CRITICAL: "calculated_health_score" MUST be an integer between 0 and 100.
    5. CRITICAL: "system_verdict" MUST be exactly one of these strings: "PASS", "WARNING", or "FAIL".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            branding_matrix: {
              type: Type.OBJECT,
              properties: {
                detected_hero_bg: { type: Type.STRING },
                canvas_text_color: { type: Type.STRING },
                status_highlight_hex: { type: Type.STRING }
              },
              required: ["detected_hero_bg", "canvas_text_color", "status_highlight_hex"]
            },
            executive_metrics: {
              type: Type.OBJECT,
              properties: {
                target_url: { type: Type.STRING },
                calculated_health_score: { type: Type.INTEGER },
                system_verdict: { type: Type.STRING }
              },
              required: ["target_url", "calculated_health_score", "system_verdict"]
            },
            asymmetrical_grid_cards: {
              type: Type.OBJECT,
              properties: {
                web_app_testing: {
                  type: Type.OBJECT,
                  properties: {
                    section_title: { type: Type.STRING },
                    visual_status: { type: Type.STRING },
                    critique: { type: Type.STRING }
                  },
                  required: ["section_title", "visual_status", "critique"]
                },
                api_backend_testing: {
                  type: Type.OBJECT,
                  properties: {
                    section_title: { type: Type.STRING },
                    visual_status: { type: Type.STRING },
                    critique: { type: Type.STRING }
                  },
                  required: ["section_title", "visual_status", "critique"]
                }
              },
              required: ["web_app_testing", "api_backend_testing"]
            },
            blocker_registry: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  origin_layer: { type: Type.STRING },
                  issue_name: { type: Type.STRING },
                  ui_severity_token: { type: Type.STRING },
                  dev_remediation: { type: Type.STRING }
                },
                required: ["origin_layer", "issue_name", "ui_severity_token", "dev_remediation"]
              }
            },
            personalized_upsell_triggers: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["branding_matrix", "executive_metrics", "asymmetrical_grid_cards", "blocker_registry", "personalized_upsell_triggers"]
        }
      }
    });

    if (!response.text) {
      throw new Error('Failed to generate report content.');
    }

    return JSON.parse(response.text) as AuditReport;
  } catch {
    return buildFallbackReport(url);
  }
};
