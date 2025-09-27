/**
 * Simple fallback chat service for when Gemini API is unavailable
 */

const responses = {
  greetings: [
    "Hello! How can I help you today?",
    "Hi there! What's on your mind?",
    "Hey! I'm a simple chat bot. What would you like to talk about?",
    "Greetings! How can I assist you today?",
  ],
  questions: [
    "That's an interesting question. While I don't have access to the Gemini model right now, I can tell you that many users ask similar things.",
    "Great question! When Gemini is back online, it can provide more detailed information on this topic.",
    "I appreciate your curiosity! Unfortunately, my knowledge is limited while the AI service is down.",
    "That's something I'd like to help with. The Gemini service is temporarily unavailable, but I'd be happy to try answering when it's back up.",
  ],
  apologies: [
    "I apologize, but the Gemini AI service is currently unavailable. Please try again later.",
    "Sorry, I'm running in fallback mode right now as the Gemini service is down. I have limited capabilities in this mode.",
    "I'm sorry I can't provide a more helpful response. The AI service is experiencing issues at the moment.",
    "My apologies for the inconvenience. The Gemini service is temporarily down. Please try again later.",
  ],
  unknown: [
    "I'm in fallback mode right now, but I'm still here to chat!",
    "I'm operating with limited capabilities while the main AI service is down.",
    "I'm a simple fallback bot while Gemini is unavailable. I can still keep you company though!",
    "While I can't access Gemini's knowledge right now, I'm happy to chat in a more limited capacity.",
  ]
};

function getRandomResponse(category) {
  const options = responses[category] || responses.unknown;
  return options[Math.floor(Math.random() * options.length)];
}

function detectCategory(message) {
  const lowerMsg = message.toLowerCase();
  
  // Detect greetings
  if (/^(hi|hello|hey|greetings|howdy|what's up)/i.test(lowerMsg)) {
    return 'greetings';
  }
  
  // Detect questions
  if (/^(what|how|why|when|where|who|can you|could you|will you|would you)/i.test(lowerMsg) || lowerMsg.includes('?')) {
    return 'questions';
  }
  
  return 'unknown';
}

export function generateFallbackResponse(message) {
  const category = detectCategory(message);
  const response = getRandomResponse(category);
  
  if (Math.random() < 0.3) { // 30% chance to add an apology
    return `${response}\n\n${getRandomResponse('apologies')}`;
  }
  
  return response;
}