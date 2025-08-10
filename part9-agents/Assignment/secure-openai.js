// Secure AI Assistant (Firebase Functions)
// Keep your OpenAI API key on the server via Firebase Functions.

// 1) Replace with your Firebase project config (Project Settings → General → Your apps)
const firebaseConfig = {
  apiKey: "your-firebase-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const functions = firebase.functions();

const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const authStatus = document.getElementById('auth-status');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const statusEl = document.getElementById('status');

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

// Auth state
auth.onAuthStateChanged((user) => {
  if (user) {
    authStatus.textContent = `Authenticated as ${user.email || user.uid}`;
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    messageInput.disabled = false;
    sendButton.disabled = false;
    setStatus('Ready', 'success');
  } else {
    authStatus.textContent = 'Not authenticated';
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    messageInput.disabled = true;
    sendButton.disabled = true;
    setStatus('Authentication required');
  }
});

loginBtn.addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch((err) => setStatus(`Login error: ${err.message}`, 'error'));
});

logoutBtn.addEventListener('click', () => {
  auth.signOut().catch((err) => setStatus(`Logout error: ${err.message}`, 'error'));
});

async function secureChat(userText) {
  try {
    const chatWithAI = functions.httpsCallable('chatWithAI');
    const result = await chatWithAI({ message: userText });
    return result.data.response;
  } catch (error) {
    if (error.code === 'functions/unauthenticated') {
      throw new Error('Please login to use this feature');
    }
    throw new Error(error.message || 'Failed to get AI response');
  }
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
    const reply = await secureChat(text);
    addMessageToUI(reply, 'bot');
    setStatus('Ready', 'success');
  } catch (err) {
    setStatus(`Error: ${err.message || err}`, 'error');
    addMessageToUI('Sorry, something went wrong. Please try again later.', 'bot');
  } finally {
    sendButton.disabled = false;
  }
}

sendButton.addEventListener('click', handleSend);
messageInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSend(); });

