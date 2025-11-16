/**
 * Google Cloud Configuration
 * Handles initialization of Vertex AI and Gemini API clients
 */

const { VertexAI } = require('@google-cloud/vertexai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Vertex AI client
const initVertexAI = () => {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const location = process.env.VERTEX_AI_LOCATION || 'us-central1';

  if (!projectId) {
    throw new Error('GOOGLE_CLOUD_PROJECT_ID environment variable is required');
  }

  return new VertexAI({
    project: projectId,
    location: location,
  });
};

// Initialize Gemini API client
const initGeminiAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }

  return new GoogleGenerativeAI(apiKey);
};

// Vertex AI instance (lazy initialization)
let vertexAIInstance = null;
const getVertexAI = () => {
  if (!vertexAIInstance) {
    vertexAIInstance = initVertexAI();
  }
  return vertexAIInstance;
};

// Gemini AI instance (lazy initialization)
let geminiAIInstance = null;
const getGeminiAI = () => {
  if (!geminiAIInstance) {
    geminiAIInstance = initGeminiAI();
  }
  return geminiAIInstance;
};

// Model configurations
const MODELS = {
  GEMINI_PRO: 'gemini-2.5-flash', // Stable model (free tier available)
  GEMINI_FLASH: 'gemini-2.5-flash', // Fast responses
  EMBEDDING: 'text-embedding-004', // For vector embeddings
};

// Generation configuration
const DEFAULT_GENERATION_CONFIG = {
  temperature: 0.7,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 2048,
};

const CREATIVE_GENERATION_CONFIG = {
  temperature: 0.9,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 4096,
};

const PRECISE_GENERATION_CONFIG = {
  temperature: 0.2,
  topP: 0.8,
  topK: 20,
  maxOutputTokens: 2048,
};

module.exports = {
  initVertexAI,
  initGeminiAI,
  getVertexAI,
  getGeminiAI,
  MODELS,
  DEFAULT_GENERATION_CONFIG,
  CREATIVE_GENERATION_CONFIG,
  PRECISE_GENERATION_CONFIG,
};
