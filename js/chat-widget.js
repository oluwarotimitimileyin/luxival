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
          <div class="chat-chip-row" id="chatChipRow"></div>
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

  const config = window.LuxivalConfig || {};
  const SUPABASE_URL = config.SUPABASE_URL || '';
  const SUPABASE_KEY = config.SUPABASE_PUBLISHABLE_KEY || '';
  const SID_KEY = 'luxival_chat_sid';

  function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function getSessionId() {
    var sid = localStorage.getItem(SID_KEY);
    if (sid) return sid;
    sid = generateUUID();
    localStorage.setItem(SID_KEY, sid);
    return sid;
  }

  function supabaseHeaders() {
    return {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    };
  }

  async function saveMessage(role, content) {
    if (!SUPABASE_URL || !SUPABASE_KEY) return;
    try {
      var sid = getSessionId();
      await fetch(SUPABASE_URL + '/rest/v1/chat_messages', {
        method: 'POST',
        headers: supabaseHeaders(),
        body: JSON.stringify({ session_id: sid, role: role, content: content }),
      });
    } catch (e) {
      // Fail silently — chat works without persistence
    }
  }

  async function loadHistory() {
    if (!SUPABASE_URL || !SUPABASE_KEY) return [];
    try {
      var sid = getSessionId();
      var resp = await fetch(
        SUPABASE_URL + '/rest/v1/chat_messages?session_id=eq.' + encodeURIComponent(sid) + '&order=created_at.asc&limit=50',
        { headers: supabaseHeaders() }
      );
      if (!resp.ok) return [];
      var data = await resp.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

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

  function renderBubble(role, content) {
    var item = document.createElement('div');
    item.className = 'chat-bubble ' + (role === 'assistant' ? 'assistant' : 'user');
    item.textContent = content;
    messagesEl.appendChild(item);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addMessage(role, content) {
    renderBubble(role, content);
    messages.push({ role: role, content: content });
  }

  function showLeadForm(lead) {
    var existing = document.getElementById('chatLeadForm');
    if (existing) existing.remove();

    var form = document.createElement('div');
    form.id = 'chatLeadForm';
    form.className = 'chat-bubble assistant lead-form';
    form.innerHTML = [
      '<p style="margin:0 0 8px;font-size:14px;opacity:0.9">Share your details and we will follow up.</p>',
      '<input type="text" id="leadName" placeholder="Your name" required style="width:100%;margin-bottom:6px;padding:8px 10px;border:1px solid rgba(201,169,106,0.3);border-radius:6px;background:rgba(255,255,255,0.05);color:inherit;font:inherit;font-size:13px;box-sizing:border-box">',
      '<input type="email" id="leadEmail" placeholder="Your email" required style="width:100%;margin-bottom:6px;padding:8px 10px;border:1px solid rgba(201,169,106,0.3);border-radius:6px;background:rgba(255,255,255,0.05);color:inherit;font:inherit;font-size:13px;box-sizing:border-box">',
      '<input type="tel" id="leadPhone" placeholder="Phone / WhatsApp (optional)" style="width:100%;margin-bottom:8px;padding:8px 10px;border:1px solid rgba(201,169,106,0.3);border-radius:6px;background:rgba(255,255,255,0.05);color:inherit;font:inherit;font-size:13px;box-sizing:border-box">',
      '<button type="button" id="leadSubmit" style="width:100%;padding:8px;background:var(--gold,#C9A96A);color:#0A0B0F;border:none;border-radius:6px;font-weight:600;font-size:13px;cursor:pointer">Send details</button>',
      '<p id="leadFeedback" style="margin:6px 0 0;font-size:12px;opacity:0;transition:opacity 0.3s">Thanks! We will be in touch.</p>',
    ].join('');
    messagesEl.appendChild(form);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    document.getElementById('leadSubmit').addEventListener('click', async function () {
      var name = document.getElementById('leadName').value.trim();
      var email = document.getElementById('leadEmail').value.trim();
      var phone = document.getElementById('leadPhone').value.trim();
      var feedback = document.getElementById('leadFeedback');

      if (!name || !email) {
        feedback.textContent = 'Please enter your name and email.';
        feedback.style.opacity = '1';
        feedback.style.color = '#ff6b6b';
        return;
      }

      feedback.style.opacity = '0';
      document.getElementById('leadSubmit').disabled = true;
      document.getElementById('leadSubmit').textContent = 'Sending...';

      var ok = await submitLead({ ...lead, name: name, email: email, phone: phone });

      feedback.textContent = ok
        ? 'Thanks! We will be in touch soon.'
        : 'Could not send. Please email us directly at support@luxival.com.';
      feedback.style.opacity = '1';
      feedback.style.color = ok ? 'var(--gold, #C9A96A)' : '#ff6b6b';
      document.getElementById('leadSubmit').textContent = 'Sent ';
    });
  }

  async function submitLead(lead) {
    try {
      var response = await fetch('/api/lead-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Chat lead',
          name: lead.name || '',
          email: lead.email || '',
          phone: lead.phone || '',
          message: 'Service: ' + (lead.service || 'Unknown') + '\nIntent: ' + (lead.intent || 'Inquiry') + '\n' + (lead.message || ''),
          source: 'chat-widget',
        }),
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  }

  function handleLead(lead) {
    if (lead.name && lead.email) {
      submitLead(lead);
      var msg = 'Your details have been shared with our team. We will follow up shortly — or you can reach us directly at support@luxival.com or WhatsApp +358 50 351 8366.';
      addMessage('assistant', msg);
      saveMessage('assistant', msg);
      return;
    }
    showLeadForm(lead);
  }

  async function sendMessage(text) {
    if (!text || isSending) return;

    isSending = true;
    addMessage('user', text);
    saveMessage('user', text);
    showStatus('Luxival assistant is typing...', false);

    try {
      var response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages,
          page: window.location.pathname,
          session_id: getSessionId(),
        }),
      });

      if (!response.ok) {
        throw new Error('Chat failed: ' + response.status);
      }

      var data = await response.json();
      var reply = data && typeof data.reply === 'string' ? data.reply : null;

      if (!reply) {
        throw new Error('Chat response is empty');
      }

      addMessage('assistant', reply);
      saveMessage('assistant', reply);
      showStatus('', false);

      if (data.lead && typeof data.lead === 'object') {
        handleLead(data.lead);
      }
    } catch (error) {
      console.error('Chat request failed:', error);
      var fallback = 'I had trouble answering right now. Please try again, or use /contact for a direct response.';
      addMessage('assistant', fallback);
      saveMessage('assistant', fallback);
      showStatus('Connection issue. Please try again.', true);
    } finally {
      isSending = false;
    }
  }

  toggle.addEventListener('click', function () {
    setOpen(!widget.classList.contains('open'));
  });

  closeButton.addEventListener('click', function () { setOpen(false); });

  composer.addEventListener('submit', async function (event) {
    event.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    await sendMessage(text);
  });

  input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      composer.requestSubmit();
    }
  });

  function setupChips() {
    var path = window.location.pathname;
    var chips;

    if (path.startsWith('/tourism') || path.startsWith('/transfers')) {
      chips = [
        { label: 'Airport transfer', text: 'I need an airport transfer in Helsinki' },
        { label: 'Private rides', text: 'Tell me about private rides and tours' },
        { label: 'Tourism planning', text: 'I want help planning a Finland trip' },
      ];
    } else if (path.startsWith('/qa') || path.startsWith('/audit')) {
      chips = [
        { label: 'Website audit', text: 'I want a website QA audit' },
        { label: 'Test automation', text: 'Tell me about test automation services' },
        { label: 'Performance test', text: 'I need performance testing' },
      ];
    } else if (path.startsWith('/services') || path.startsWith('/digital')) {
      chips = [
        { label: 'Website + SEO', text: 'I need a website and SEO help' },
        { label: 'AI agents', text: 'Tell me about AI agent services' },
        { label: 'UGC content', text: 'I need UGC or TikTok content' },
      ];
    } else if (path.startsWith('/portfolio')) {
      chips = [
        { label: 'Web projects', text: 'Show me your web design work' },
        { label: 'Website + SEO', text: 'I need a website and SEO help' },
        { label: 'QA audit', text: 'I want a website QA audit' },
      ];
    } else if (path.startsWith('/about')) {
      chips = [
        { label: 'Website + SEO', text: 'I need a website and SEO help' },
        { label: 'Airport transfer', text: 'I need airport transfer in Helsinki' },
        { label: 'QA audit', text: 'I want a website QA audit' },
      ];
    } else {
      chips = [
        { label: 'Website + SEO', text: 'I need a website and SEO help' },
        { label: 'Airport transfer', text: 'I need airport transfer in Helsinki' },
        { label: 'QA audit', text: 'I want a website QA audit' },
      ];
    }

    chipRow.innerHTML = '';
    chips.forEach(function (chip) {
      var btn = document.createElement('button');
      btn.className = 'chat-chip';
      btn.type = 'button';
      btn.textContent = chip.label;
      btn.addEventListener('click', function () { sendMessage(chip.text); });
      chipRow.appendChild(btn);
    });
  }

  // Bootstrap
  (async function init() {
    setupChips();
    var history = await loadHistory();
    if (history.length === 0) {
      addMessage('assistant', 'Hi, I am Luxival assistant. What do you need help with today?');
    } else {
      history.forEach(function (msg) {
        addMessage(msg.role, msg.content);
      });
    }
  })();
})();
