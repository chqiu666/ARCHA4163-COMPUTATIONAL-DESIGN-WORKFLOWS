// Agents Assignment – Simple AI Assistant (client-only demo)
// IMPORTANT: For learning/demo only. Do NOT ship API keys in client code.

document.addEventListener('DOMContentLoaded', () => {
  const chatMessages = document.getElementById('chat-messages');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  const statusEl = document.getElementById('status');

  // Replace with your own key for local testing only (DO NOT COMMIT REAL KEYS)
  const OPENAI_API_KEY = 'your-openai-api-key-here';
  const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

  let lastCallMs = 0;
  const MIN_INTERVAL_MS = 900; // simple client-side rate limit

  function setStatus(text, type = '') {
    statusEl.textContent = text;
    statusEl.className = `status${type ? ' ' + type : ''}`;
  }

  function addMessageToUI(text, role) {
    const msg = document.createElement('div');
    msg.className = `message ${role}`;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = `<strong>${role === 'user' ? 'You' : 'AI Assistant'}:</strong> ${escapeHtml(text)}`;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    msg.appendChild(bubble);
    msg.appendChild(meta);
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async function callOpenAI(userText) {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
      throw new Error('Please set your OpenAI API key in app.js for local testing.');
    }

    // simple rate limit
    const now = Date.now();
    const wait = Math.max(0, MIN_INTERVAL_MS - (now - lastCallMs));
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
    lastCallMs = Date.now();

    const body = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful, concise AI assistant for a design workflows class.' },
        { role: 'user', content: userText }
      ],
      temperature: 0.7,
      max_tokens: 200
    };

    const res = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    let data;
    try {
      data = await res.json();
    } catch (e) {
      throw new Error('Failed to parse API response.');
    }

    if (!res.ok) {
      const message = data?.error?.message || `${res.status} ${res.statusText}`;
      throw new Error(`API error: ${message}`);
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('Unexpected API response structure.');
    return content;
  }

  async function handleSend() {
    const text = messageInput.value.trim();
    if (!text) return;
    addMessageToUI(text, 'user');
    messageInput.value = '';
    messageInput.focus();

    sendButton.disabled = true;
    setStatus('Thinking...');
    try {
      const reply = await callOpenAI(text);
      addMessageToUI(reply, 'bot');
      setStatus('Ready', 'success');
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message || err}`, 'error');
      addMessageToUI('Sorry, something went wrong. Please check your API key or try again.', 'bot');
    } finally {
      sendButton.disabled = false;
    }
  }

  sendButton.addEventListener('click', handleSend);
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
  });
});

