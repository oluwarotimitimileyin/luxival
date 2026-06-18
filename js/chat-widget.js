(function () {
  if (document.getElementById('chatWidget')) return;

  const widgetMarkup = `
    <div class="chat-widget" id="chatWidget">
      <button class="chat-toggle" id="chatToggle" aria-label="Open Luxival chat">
        <span>Talk to Luxival</span>
      </button>
      <div class="chat-panel" id="chatPanel" hidden>
        <div class="chat-header">
          <div>
            <strong>Luxival assistant</strong>
            <p>Ask anything about services, pricing flow, or booking.</p>
          </div>
          <button class="chat-close" id="chatClose" aria-label="Close chat">×</button>
        </div>
        <div class="chat-body">
          <div class="chat-messages" id="chatMessages" aria-live="polite"></div>
          <div class="chat-chip-row" id="chatChipRow">
            <button class="chat-chip" type="button" data-chip="I need a website and SEO help">Website + SEO</button>
            <button class="chat-chip" type="button" data-chip="I need airport transfer in Helsinki">Airport transfer</button>
            <button class="chat-chip" type="button" data-chip="I want a website QA audit">QA audit</button>
          </div>
          <form id="chatComposer" class="chat-composer">
            <textarea id="chatInput" rows="2" placeholder="Type your question..." maxlength="1200"></textarea>
            <button type="submit" class="chat-button">Send</button>
          </form>
          <div class="chat-status" id="chatStatus"></div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', widgetMarkup);

  const widget = document.getElementById('chatWidget');
  const toggle = document.getElementById('chatToggle');
  const panel = document.getElementById('chatPanel');
  const closeButton = document.getElementById('chatClose');
  const composer = document.getElementById('chatComposer');
  const input = document.getElementById('chatInput');
  const messagesEl = document.getElementById('chatMessages');
  const statusEl = document.getElementById('chatStatus');
  const chipRow = document.getElementById('chatChipRow');

  const messages = [];
  let isSending = false;

  function showStatus(message, isError) {
    statusEl.textContent = message || '';
    statusEl.style.color = isError ? '#ff6b6b' : 'var(--muted)';
  }

  function setOpen(open) {
    panel.hidden = !open;
    widget.classList.toggle('open', open);
    if (open) {
      input.focus();
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  function addMessage(role, content) {
    const item = document.createElement('div');
    item.className = `chat-bubble ${role === 'assistant' ? 'assistant' : 'user'}`;
    item.textContent = content;
    messagesEl.appendChild(item);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    messages.push({ role, content });
  }

  async function sendMessage(text) {
    if (!text || isSending) return;

    isSending = true;
    addMessage('user', text);
    showStatus('Luxival assistant is typing...', false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          page: window.location.pathname,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat failed: ${response.status}`);
      }

      const data = await response.json();
      const reply = data && typeof data.reply === 'string' ? data.reply : null;

      if (!reply) {
        throw new Error('Chat response is empty');
      }

      addMessage('assistant', reply);
      showStatus('', false);
    } catch (error) {
      console.error('Chat request failed:', error);
      addMessage('assistant', 'I had trouble answering right now. Please try again, or use /contact for a direct response.');
      showStatus('Connection issue. Please try again.', true);
    } finally {
      isSending = false;
    }
  }

  toggle.addEventListener('click', () => {
    setOpen(!widget.classList.contains('open'));
  });

  closeButton.addEventListener('click', () => setOpen(false));

  composer.addEventListener('submit', async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    await sendMessage(text);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      composer.requestSubmit();
    }
  });

  chipRow.querySelectorAll('.chat-chip').forEach((button) => {
    button.addEventListener('click', async () => {
      const text = button.getAttribute('data-chip');
      if (!text) return;
      await sendMessage(text);
    });
  });

  addMessage('assistant', 'Hi, I am Luxival assistant. What do you need help with today?');
})();
