const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const { env } = require('../config/env');

const GEMINI_MODEL_ALIASES = {
  'gemini-1.5-flash': 'gemini-2.5-flash',
};
const GEMINI_MODEL = GEMINI_MODEL_ALIASES[env.geminiModel] || env.geminiModel || 'gemini-2.5-flash';
const MAX_TEXT_CHARS = 4000;

const URGENT_KEYWORDS = [
  'urgent', 'alert', 'emergency', 'critical', 'immediate',
  'maintenance', 'failure', 'delay', 'cancellation', 'hazard',
  'disruption', 'breakdown', 'incident', 'warning', 'suspend',
];

function buildMockSummary(payload) {
  return [
    'Key points: Document uploaded for KMRL staff review.',
    payload.description
      ? `Alerts: ${payload.description}`
      : 'Alerts: No specific alerts identified from the available metadata.',
    'Actions required: Review the original document and confirm whether any operational follow-up is needed.',
  ].join(' ');
}

function truncateText(text, maxChars = MAX_TEXT_CHARS) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  return normalized.length > maxChars
    ? `${normalized.slice(0, maxChars)}...`
    : normalized;
}

async function extractPdfText(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return '';
  }

  try {
    const buffer = await fs.promises.readFile(filePath);
    const parser = new PDFParse({ data: buffer });
    const parsed = await parser.getText();
    return truncateText(parsed.text || '');
  } catch (error) {
    console.warn('[summaryService] Failed to extract PDF text:', error.message);
    return '';
  }
}

async function extractDocumentText(payload) {
  if (payload.mimeType === 'application/pdf') {
    return extractPdfText(payload.filePath);
  }

  return '';
}

function buildPrompt(payload, extractedText) {
  return [
    'Summarize the following metro operational document into:',
    '* Key points',
    '* Alerts (if any)',
    '* Actions required',
    '',
    'Keep it short, clear, and professional.',
    '',
    `Title: ${payload.title}`,
    `Description: ${payload.description || 'N/A'}`,
    `File Name: ${payload.originalName}`,
    `File Type: ${payload.mimeType}`,
    '',
    'Document Text:',
    extractedText || 'No extractable document text was found. Use the available metadata only.',
  ].join('\n');
}

function hasGeminiConfig() {
  return Boolean(env.geminiApiKey);
}

async function requestGeminiSummary(prompt) {
  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
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
    const extractedText = await extractDocumentText(payload);
    const prompt = buildPrompt(payload, extractedText);
    const summary = await requestGeminiSummary(prompt);
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
