// ============================================================
// chatbot.js — CropSmart Kisan AI Floating Chatbot Widget
// ============================================================

(function() {
  // 1. Create HTML Structure
  const chatHtml = `
    <!-- Floating Chat Launcher Button -->
    <div id="kisan-chat-toggle" class="kisan-chat-fab" onclick="toggleKisanChat()">
      <div class="kisan-fab-pulse"></div>
      <span class="kisan-fab-icon">🌱</span>
      <span class="kisan-fab-label" id="kisan-fab-label">Kisan AI</span>
    </div>

    <!-- Chat Modal Window -->
    <div id="kisan-chat-modal" class="kisan-chat-modal" style="display: none;">
      
      <!-- Chat Header -->
      <div class="kisan-chat-header">
        <div class="kisan-header-title">
          <span class="kisan-icon-circle">🌱</span>
          <div>
            <h4 id="kisan-modal-title">CropSmart Kisan AI</h4>
            <span class="kisan-online-status">
              <span class="online-dot"></span>
              <span id="kisan-online-text">Online · Farm Agronomist</span>
            </span>
          </div>
        </div>
        <button class="kisan-close-btn" onclick="toggleKisanChat()" title="Close">✕</button>
      </div>

      <!-- Chat Messages Container -->
      <div id="kisan-chat-messages" class="kisan-chat-messages">
        <!-- Messages rendered here -->
      </div>

      <!-- Suggestion Chips Container -->
      <div id="kisan-chat-suggestions" class="kisan-chat-suggestions">
        <!-- Chips rendered dynamically -->
      </div>

      <!-- Chat Input Form -->
      <form id="kisan-chat-form" class="kisan-chat-input-row" onsubmit="sendKisanChatMessage(event)">
        <input 
          type="text" 
          id="kisan-user-input" 
          class="kisan-chat-input" 
          placeholder="Ask about crops, soil test, mandi prices…" 
          autocomplete="off"
        />
        <button type="submit" class="kisan-send-btn" title="Send message">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>

    </div>
  `;

  // Append widget to body
  const wrap = document.createElement('div');
  wrap.id = 'kisan-ai-widget';
  wrap.innerHTML = chatHtml;
  document.body.appendChild(wrap);

  // Initialize state
  let isOpen = false;
  let chatHistory = [];

  function toggleKisanChat() {
    isOpen = !isOpen;
    const modal = document.getElementById('kisan-chat-modal');
    const fab = document.getElementById('kisan-chat-toggle');
    if (!modal) return;

    if (isOpen) {
      modal.style.display = 'flex';
      modal.classList.add('open');
      fab.classList.add('active');
      document.getElementById('kisan-user-input').focus();
      
      // If first time open, show welcome greeting
      if (chatHistory.length === 0) {
        showWelcomeGreeting();
      }
    } else {
      modal.style.display = 'none';
      modal.classList.remove('open');
      fab.classList.remove('active');
    }
  }

  function showWelcomeGreeting() {
    const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
    const greetingText = isTa
      ? `வணக்கம்! நான் உங்கள் **CropSmart உழவன் AI ஆலோசகர்** 🌱\n\nஉங்கள் நிலத்தின் மண் வளம் (Score: 63, N: 42 kg/ha), 3-பருவ தக்காளி வரலாறு மற்றும் 782,000+ மண்டி சந்தை விலைகளின் அடிப்படையில் நான் பதிலளிப்பேன். கீழே உள்ள கேள்விகளை தேர்வு செய்யவும் அல்லது உங்கள் கேள்வியை தட்டச்சு செய்யவும்!`
      : `Hello! I am your **CropSmart Kisan AI Agronomist** 🌱\n\nI have full context of your 4.5-acre farm, your current soil test (Score: 63, N: 42 kg/ha), your continuous tomato cultivation history, and 782k+ live APMC Mandi rates. How can I help you today?`;

    const initialSuggestions = isTa
      ? ["அடுத்த பயிர் என்ன நடலாம்?", "என் மண் வளம் ஏன் குறைந்துள்ளது?", "மண்டி சந்தை விலைகள் என்ன?", "3-பருவ சுழற்சி திட்டம்"]
      : ["What crop to plant next?", "Explain my soil test", "Current Mandi prices", "Why avoid continuous Tomato?"];

    appendMessage('bot', greetingText);
    renderSuggestions(initialSuggestions);
  }

  function renderSuggestions(chips) {
    const box = document.getElementById('kisan-chat-suggestions');
    if (!box) return;
    if (!chips || !chips.length) {
      box.innerHTML = '';
      return;
    }
    box.innerHTML = chips.map(chip => `
      <button type="button" class="kisan-chip" onclick="submitQuickSuggestion('${chip.replace(/'/g, "\\'")}')">
        💬 ${chip}
      </button>
    `).join('');
  }

  function formatMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>')
      .replace(/• /g, '&bull; ');
  }

  function appendMessage(sender, text) {
    chatHistory.push({ sender, text });
    const msgBox = document.getElementById('kisan-chat-messages');
    if (!msgBox) return;

    const div = document.createElement('div');
    div.className = `kisan-msg ${sender}`;
    div.innerHTML = `
      <div class="kisan-msg-bubble ${sender}">
        ${formatMarkdown(text)}
      </div>
    `;
    msgBox.appendChild(div);
    msgBox.scrollTop = msgBox.scrollHeight;
  }

  function appendTypingIndicator() {
    const msgBox = document.getElementById('kisan-chat-messages');
    const id = 'kisan-typing-indicator';
    const div = document.createElement('div');
    div.id = id;
    div.className = 'kisan-msg bot';
    div.innerHTML = `
      <div class="kisan-msg-bubble bot typing">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    msgBox.appendChild(div);
    msgBox.scrollTop = msgBox.scrollHeight;
    return id;
  }

  function removeTypingIndicator() {
    const el = document.getElementById('kisan-typing-indicator');
    if (el) el.remove();
  }

  async function sendKisanChatMessage(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('kisan-user-input');
    const msg = input.value.trim();
    if (!msg) return;

    input.value = '';
    appendMessage('user', msg);
    appendTypingIndicator();
    renderSuggestions([]);

    const lang = (window.i18n && window.i18n.getLanguage() === 'ta') ? 'ta' : 'en';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          farm_id: window.state?.farm_id || 101,
          lang: lang
        })
      });

      removeTypingIndicator();

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      appendMessage('bot', data.reply || 'I am ready to assist with your crops and soil health.');
      renderSuggestions(data.suggestions || []);
    } catch (err) {
      removeTypingIndicator();
      console.error('Chat error:', err);
      appendMessage('bot', '⚠️ Could not connect to Kisan AI service. Please ensure the backend is running.');
    }
  }

  function submitQuickSuggestion(text) {
    const input = document.getElementById('kisan-user-input');
    if (input) {
      input.value = text;
      sendKisanChatMessage();
    }
  }

  // Update labels if language switches
  window.updateChatbotLanguage = function() {
    const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
    const fabLabel = document.getElementById('kisan-fab-label');
    const title = document.getElementById('kisan-modal-title');
    const status = document.getElementById('kisan-online-text');
    const input = document.getElementById('kisan-user-input');

    if (fabLabel) fabLabel.textContent = isTa ? 'உழவன் AI' : 'Kisan AI';
    if (title) title.textContent = isTa ? 'CropSmart உழவன் AI' : 'CropSmart Kisan AI';
    if (status) status.textContent = isTa ? 'இணையத்தில் உள்ளது · வேளாண் ஆலோசகர்' : 'Online · Farm Agronomist';
    if (input) input.placeholder = isTa ? 'பயிர், மண் பரிசோதனை, விலை பற்றி கேட்கவும்…' : 'Ask about crops, soil test, mandi prices…';
  };

  // Expose methods globally
  window.toggleKisanChat = toggleKisanChat;
  window.sendKisanChatMessage = sendKisanChatMessage;
  window.submitQuickSuggestion = submitQuickSuggestion;
})();
