import { pipeline } from '@xenova/transformers';
import { blocklist } from './blocklist.js'; // 1. Import the blocklist from the new file

// --- Layer 1: Rule-Based Filter ---

function runRuleBasedFilter(text) {
  const lowerCaseText = text.toLowerCase();
  for (const word of blocklist) {
    if (lowerCaseText.includes(word)) {
      return { 
        isFlagged: true, 
        reason: `Content was flagged by the rule-based filter.` 
      };
    }
  }
  return { isFlagged: false };
}

// --- Layer 2: Fast AI Model ---

let fastClassifier;
async function getFastClassifier() {
  if (!fastClassifier) {
    try {
      console.log('Loading fast AI model...');
      fastClassifier = await pipeline('text-classification', 'Xenova/toxic-bert');
      console.log('Fast AI model loaded.');
    } catch (error) {
      console.error("CRITICAL: Failed to download the fast AI model.", error);
      fastClassifier = null;
    }
  }
  return fastClassifier;
}

async function runFastAIModel(text) {
  const classifier = await getFastClassifier();
  if (!classifier) {
    console.warn("Fast AI model not available. Skipping this check.");
    return { isFlagged: false };
  }

  try {
    const output = await classifier(text);
    const toxicResult = output.find(result => result.label === 'toxic' && result.score > 0.9);

    if (toxicResult) {
      return { 
        isFlagged: true, 
        reason: `Content was flagged as "toxic" with ${Math.round(toxicResult.score * 100)}% confidence.` 
      };
    }
    return { isFlagged: false };
  } catch (error) {
    console.error("Error during fast AI moderation:", error);
    return { isFlagged: false };
  }
}


// --- Main Moderation Function ---

export const moderateContent = async (text) => {
  // 1. Run Layer 1
  const ruleResult = runRuleBasedFilter(text);
  if (ruleResult.isFlagged) {
    return ruleResult;
  }

  // 2. If clean, run Layer 2
  const aiResult = await runFastAIModel(text);
  if (aiResult.isFlagged) {
    return aiResult;
  }

  // If the text passes both layers, it is approved.
  return { isFlagged: false };
};
