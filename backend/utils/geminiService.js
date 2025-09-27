import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { generateFallbackResponse } from "./fallbackChatService.js";

dotenv.config();

// Ordered list of models to attempt (will be auto-expanded with and without 'models/' prefix)
const DEFAULT_MODEL_CHAIN = [
  "gemini-2.5-flash",
].filter(Boolean);

let genAIClient = null;
const modelCache = new Map();
let discoveredModels = null;

// Simple response cache to reduce API calls
const responseCache = {
  cache: new Map(),
  maxSize: 100,
  ttl: 1000 * 60 * 60, // 1 hour
  
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  },
  
  set(key, value) {
    // Basic cache eviction - if cache is full, remove oldest entries
    if (this.cache.size >= this.maxSize) {
      const oldestKey = [...this.cache.keys()][0];
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
};

// Circuit breaker implementation
const circuitBreaker = {
  failures: 0,
  lastFailureTime: 0,
  state: 'CLOSED', // CLOSED (working), OPEN (not working), HALF_OPEN (testing)
  failureThreshold: 3,
  resetTimeout: 30000, // 30 seconds
  
  record(success) {
    if (success) {
      this.reset();
    } else {
      this.failures++;
      this.lastFailureTime = Date.now();
      if (this.failures >= this.failureThreshold && this.state === 'CLOSED') {
        this.state = 'OPEN';
        console.warn(`Circuit breaker OPENED at ${new Date().toISOString()}`);
      }
    }
  },
  
  reset() {
    this.failures = 0;
    if (this.state !== 'CLOSED') {
      this.state = 'CLOSED';
      console.log(`Circuit breaker CLOSED at ${new Date().toISOString()}`);
    }
  },
  
  canRequest() {
    if (this.state === 'CLOSED') {
      return true;
    }
    
    if (this.state === 'OPEN') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure > this.resetTimeout) {
        this.state = 'HALF_OPEN';
        console.log(`Circuit breaker HALF_OPEN at ${new Date().toISOString()}`);
        return true;
      }
      return false;
    }
    
    // HALF_OPEN state allows one test request
    return true;
  }
};

function ensureClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. AI responses will be disabled.");
    return null;
  }

  if (!genAIClient) {
    genAIClient = new GoogleGenerativeAI(apiKey);
  }

  return genAIClient;
}

function getModelInstance(modelName) {
  const client = ensureClient();
  if (!client) return null;

  if (!modelCache.has(modelName)) {
    modelCache.set(modelName, client.getGenerativeModel({ model: modelName }));
  }

  return modelCache.get(modelName);
}

function buildModelList() {
  const preferred = process.env.GEMINI_MODEL;
  const candidates = [preferred, ...DEFAULT_MODEL_CHAIN];
  const seen = new Set();

  const result = [];

  for (const candidate of candidates) {
    if (!candidate) continue;
    for (const variant of expandModelName(candidate)) {
      if (!seen.has(variant)) {
        seen.add(variant);
        result.push(variant);
      }
    }
  }

  return result;
}

function expandModelName(name) {
  if (!name) return [];
  if (name.startsWith("models/")) {
    const bare = name.replace(/^models\//, "");
    return bare ? [name, bare] : [name];
  }
  return [name, `models/${name}`];
}

async function listAvailableModels() {
  if (discoveredModels) return discoveredModels;

  const client = ensureClient();
  if (!client) {
    discoveredModels = [];
    return discoveredModels;
  }

  const names = [];

  try {
    if (typeof client.listModels === "function") {
      const iterator = client.listModels({ pageSize: 100 });
      for await (const model of iterator) {
        if (model?.supportedGenerationMethods?.includes("generateContent")) {
          const name = model?.name;
          if (name) {
            names.push(name);
            const bare = name.replace(/^models\//, "");
            if (bare && bare !== name) {
              names.push(bare);
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn("Unable to dynamically list Gemini models:", err?.message || err);
  }

  discoveredModels = names;
  return discoveredModels;
}

export async function askGemini(prompt) {
  const client = ensureClient();
  if (!client) {
    return "Gemini is not configured yet, but I'm happy to chat once it is!";
  }

  // Check cache first
  const normalizedPrompt = prompt.trim().toLowerCase();
  const cachedResponse = responseCache.get(normalizedPrompt);
  if (cachedResponse) {
    console.log("Using cached response for prompt");
    return cachedResponse;
  }
  
  // Check if circuit breaker is open
  if (!circuitBreaker.canRequest()) {
    console.warn("Circuit breaker is OPEN, using fallback chat service");
    return generateFallbackResponse(prompt);
  }

  const attempted = new Set();
  let retries = 0;
  const MAX_RETRIES = 2;
  
  // Add a retry mechanism for temporary service outages
  while (retries <= MAX_RETRIES) {
    try {
      // First try the models from our predefined list
      const primaryAttempt = await tryModelsForPrompt(prompt, buildModelList(), attempted);
      if (primaryAttempt.status === "success") {
        circuitBreaker.record(true); // Record successful request
        
        // Cache the successful response
        responseCache.set(prompt.trim().toLowerCase(), primaryAttempt.value);
        
        return primaryAttempt.value;
      }
      if (primaryAttempt.status === "fatal" && retries === MAX_RETRIES) {
        circuitBreaker.record(false); // Record failed request
        return primaryAttempt.message;
      }
      
      // If that doesn't work, try to dynamically discover available models
      const dynamicModels = await listAvailableModels();
      const dynamicAttempt = await tryModelsForPrompt(prompt, dynamicModels, attempted);
      if (dynamicAttempt.status === "success") {
        circuitBreaker.record(true); // Record successful request
        
        // Cache the successful response
        responseCache.set(prompt.trim().toLowerCase(), dynamicAttempt.value);
        
        return dynamicAttempt.value;
      }
      if (dynamicAttempt.status === "fatal" && retries === MAX_RETRIES) {
        circuitBreaker.record(false); // Record failed request
        return dynamicAttempt.message;
      }
      
      // If we get here, both attempts failed, but we'll retry if we haven't hit the limit
      retries++;
      
      if (retries <= MAX_RETRIES) {
        console.log(`Retrying Gemini request (attempt ${retries} of ${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
      }
    } catch (err) {
      console.error("Unexpected error in askGemini:", err);
      retries++;
      
      if (retries <= MAX_RETRIES) {
        console.log(`Retrying after error (attempt ${retries} of ${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
      }
    }
  }

  // Record the overall failure
  circuitBreaker.record(false);
  
  console.error("Unable to find a working Gemini model from candidates:", [...attempted]);
  
  // Use our fallback service instead of a generic message
  return generateFallbackResponse(prompt);
}

async function tryModelsForPrompt(prompt, models, attempted) {
  if (!models || models.length === 0) {
    return { status: "exhausted" };
  }

  const queue = [...models];
  let lastError = null;

  while (queue.length) {
    const modelName = queue.shift();
    if (!modelName || attempted.has(modelName)) continue;
    attempted.add(modelName);

    try {
      const model = getModelInstance(modelName);
      if (!model) continue;

      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      });

      const text = result?.response?.text?.();
      if (!text) {
        throw new Error("Empty response from Gemini");
      }
      return { status: "success", value: text };
    } catch (err) {
      lastError = err;
      const status = err?.status;
      const message = err?.message || "";
      
      // Handle model not found errors
      if (status === 404 || message.toLowerCase().includes("not found")) {
        console.warn(`Gemini model '${modelName}' not available. Trying next fallback.`);
        if (!modelName.startsWith("models/")) {
          const prefixed = `models/${modelName}`;
          if (!attempted.has(prefixed)) {
            queue.push(prefixed);
          }
        }
        continue;
      }
      
      // Handle service unavailable errors - continue to next model
      if (status === 503 || message.toLowerCase().includes("service is currently unavailable")) {
        console.warn(`Gemini service unavailable for model '${modelName}'. Trying next fallback.`);
        continue;
      }

      // For other errors, log but continue trying other models
      console.error(`Error with Gemini model '${modelName}':`, err);
    }
  }

  // If we've tried all models and none worked
  console.error("All Gemini models failed:", lastError);
  return {
    status: "fatal",
    message: "I'm having trouble connecting to Gemini right now. Please try again later.",
  };
}
