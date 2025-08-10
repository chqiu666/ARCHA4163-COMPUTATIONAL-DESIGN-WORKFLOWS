// Firebase Cloud Function: Secure OpenAI proxy
// Requires: firebase-tools initialized in this directory and env var openai.key set
//   firebase functions:config:set openai.key="YOUR_OPENAI_KEY"

const functions = require('firebase-functions');
const fetch = require('node-fetch');

exports.chatWithAI = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const message = typeof data?.message === 'string' ? data.message.trim() : '';
  if (!message) {
    throw new functions.https.HttpsError('invalid-argument', 'Message is required and must be a string');
  }

  const apiKey = functions.config()?.openai?.key;
  if (!apiKey) {
    throw new functions.https.HttpsError('failed-precondition', 'OpenAI API key is not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful, concise AI assistant for a design workflows class.' },
          { role: 'user', content: message }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    const content = result?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Unexpected OpenAI response');
    }

    return { response: content, usage: result.usage };
  } catch (err) {
    throw new functions.https.HttpsError('internal', err.message || 'Unknown error');
  }
});

