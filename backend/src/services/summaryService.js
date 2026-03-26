const { env } = require('../config/env');

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const URGENT_KEYWORDS = [
  'urgent', 'alert', 'emergency', 'critical', 'immediate',
  'maintenance', 'failure', 'delay', 'cancellation', 'hazard',
  'disruption', 'breakdown', 'incident', 'warning', 'suspend',
];

function buildMockSummary(payload) {
  return [
    `Document "${payload.title}" has been processed for KMRL staff review.`,
    payload.description
      ? `Key context: ${payload.description}`
      : 'No description was provided, so the summary is based on metadata only.',
    `Source file: ${payload.originalName} (${payload.mimeType}).`,
    'Recommended next steps: verify document ownership, review action items, and notify relevant teams if follow-up is needed.',
  ].join(' ');
}

function buildGeminiPrompt(payload) {
  return [
    'Summarize this document for KMRL staff in 3-4 concise sentences.',
    'Focus on the main purpose, important decisions or action items, and whether the content seems urgent.',
    `Title: ${payload.title}`,
    `Description: ${payload.description || 'N/A'}`,
    `File: ${payload.originalName}`,
    `Type: ${payload.mimeType}`,
  ].join('\n');
}

function hasGeminiConfig() {
  return Boolean(env.geminiApiKey);
}

async function requestGeminiSummary(payload) {
  const model = env.geminiModel;
  const response = await fetch(
    `${GEMINI_API_BASE}/${model}:generateContent?key=${env.geminiApiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: buildGeminiPrompt(payload),
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 250,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

function isUrgentContent(title = '', description = '') {
  const haystack = `${title} ${description}`.toLowerCase();
  return URGENT_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

async function createSummary(payload) {
  const fallbackSummary = buildMockSummary(payload);

  if (!hasGeminiConfig()) {
    return fallbackSummary;
  }

  try {
    const summary = await requestGeminiSummary(payload);
    return summary || fallbackSummary;
  } catch (error) {
    console.warn('[summaryService] Gemini summarization failed, using fallback:', error.message);
    return fallbackSummary;
  }
}

module.exports = {
  createSummary,
  isUrgentContent,
};
