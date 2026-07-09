(function () {
  if (document.getElementById('chatWidget')) return;

  function i18n(key, fallback) {
    return window.luxivalI18n && typeof window.luxivalI18n.t === 'function'
      ? window.luxivalI18n.t(key, fallback || key)
      : (fallback || key);
  }

  function ensureChatStyles() {
    if (document.getElementById('chatWidgetStyles')) return;
    var style = document.createElement('style');
    style.id = 'chatWidgetStyles';
    style.textContent = [
      '.chat-widget{position:fixed;right:1rem;bottom:1rem;z-index:10030;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#E8EBF2}',
      '.chat-toggle{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:.72rem 1rem;border:1px solid rgba(201,169,106,.42);border-radius:18px;background:#11131A;color:#C9A96A;box-shadow:0 16px 36px rgba(0,0,0,.42);font:inherit;font-size:.76rem;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}',
      '.chat-panel{position:absolute;right:0;bottom:calc(100% + .8rem);width:min(360px,calc(100vw - 2rem));max-height:min(640px,calc(100vh - 7rem));overflow:hidden;border:1px solid rgba(201,169,106,.32);border-radius:18px;background:#11131A;box-shadow:0 24px 70px rgba(0,0,0,.54)}',
      '.chat-header{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;padding:1rem;border-bottom:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025)}',
      '.chat-header strong{display:block;color:#C9A96A;font-size:.86rem;letter-spacing:.08em;text-transform:uppercase}',
      '.chat-header p{margin:.25rem 0 0;color:rgba(232,235,242,.68);font-size:.78rem;line-height:1.4}',
      '.chat-close{border:0;background:transparent;color:#E8EBF2;font-size:1.3rem;line-height:1;cursor:pointer}',
      '.chat-body{display:grid;grid-template-rows:1fr auto auto auto;gap:.75rem;padding:1rem;max-height:calc(min(640px,100vh - 7rem) - 78px)}',
      '.chat-messages{display:flex;flex-direction:column;gap:.6rem;min-height:180px;max-height:300px;overflow:auto;padding-right:.2rem}',
      '.chat-bubble{max-width:88%;border-radius:18px;padding:.68rem .78rem;font-size:.86rem;line-height:1.45;white-space:pre-wrap}',
      '.chat-bubble.assistant{align-self:flex-start;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);color:#E8EBF2}',
      '.chat-bubble.user{align-self:flex-end;background:#C9A96A;color:#0A0B0F}',
      '.chat-chip-row{display:flex;gap:.45rem;flex-wrap:wrap}',
      '.chat-chip{border:1px solid rgba(201,169,106,.28);border-radius:18px;background:rgba(201,169,106,.08);color:#C9A96A;padding:.42rem .58rem;font:inherit;font-size:.72rem;cursor:pointer}',
      '.chat-composer{display:grid;grid-template-columns:1fr auto;gap:.5rem;align-items:end}',
      '.chat-composer textarea{min-height:44px;max-height:96px;resize:vertical;border:1px solid rgba(255,255,255,.12);border-radius:18px;background:#0A0B0F;color:#E8EBF2;padding:.7rem .8rem;font:inherit;font-size:.85rem}',
      '.chat-composer textarea:focus{outline:none;border-color:#C9A96A}',
      '.chat-button{min-height:44px;border:0;border-radius:18px;background:#C9A96A;color:#0A0B0F;padding:.65rem .85rem;font:inherit;font-size:.76rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;cursor:pointer}',
      '.chat-status{min-height:1rem;color:rgba(232,235,242,.58);font-size:.74rem}',
      '.chat-links{align-self:flex-start;max-width:92%;border:1px solid rgba(201,169,106,.28);border-radius:16px;background:rgba(201,169,106,.06);padding:.6rem .72rem}',
      '.chat-links .chat-links-label{display:block;font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:#C9A96A;margin-bottom:.4rem}',
      '.chat-links a.chat-link{display:block;font-size:.82rem;line-height:1.4;color:#E8EBF2;text-decoration:none;padding:.2rem 0}',
      '.chat-links a.chat-link:hover{text-decoration:underline}',
      '.chat-links a.chat-link.primary{color:#C9A96A;font-weight:600}',
      '.chat-links .chat-links-cta{display:inline-block;margin-top:.4rem;padding:.4rem .66rem;border-radius:14px;background:#C9A96A;color:#0A0B0F;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;text-decoration:none}',
      '@media(max-width:768px){.chat-widget{right:.8rem;bottom:calc(4.5rem + env(safe-area-inset-bottom,0px))}.chat-panel{width:calc(100vw - 1.6rem);max-height:calc(100vh - 6rem)}.chat-toggle{min-height:48px}}'
    ].join('');
    document.head.appendChild(style);
  }

  ensureChatStyles();

  const widgetMarkup = (function() {
    var toggleLabel = i18n('chat.toggleLabel', 'Talk to Luxival');
    var headerTitle = i18n('chat.headerTitle', 'Luxival assistant');
    var headerDesc = i18n('chat.headerDesc', 'Ask anything about services, pricing, or booking.');
    var placeholder = i18n('chat.placeholder', 'Type your question...');
    var sendLabel = i18n('chat.sendButton', 'Send');
    return [
      '<div class="chat-widget" id="chatWidget">',
      '<button class="chat-toggle" id="chatToggle" aria-label="' + toggleLabel + '">',
      '<span>' + toggleLabel + '</span>',
      '</button>',
      '<div class="chat-panel" id="chatPanel" hidden>',
      '<div class="chat-header">',
      '<div>',
      '<strong>' + headerTitle + '</strong>',
      '<p>' + headerDesc + '</p>',
      '</div>',
      '<button class="chat-close" id="chatClose" aria-label="Close chat">×</button>',
      '</div>',
      '<div class="chat-body">',
      '<div class="chat-messages" id="chatMessages" aria-live="polite"></div>',
      '<div class="chat-chip-row" id="chatChipRow"></div>',
      '<form id="chatComposer" class="chat-composer">',
      '<textarea id="chatInput" rows="2" placeholder="' + placeholder + '" maxlength="1200"></textarea>',
      '<button type="submit" class="chat-button">' + sendLabel + '</button>',
      '</form>',
      '<div class="chat-status" id="chatStatus"></div>',
      '</div>',
      '</div>',
      '</div>'
    ].join('');
  })();

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

  function escapeAttr(value) {
    return String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  function renderLinks(links) {
    if (!links || !links.primaryPage) return;
    if (document.getElementById('chatLinks_' + links.intent)) return;

    var parts = ['<div class="chat-links" id="chatLinks_' + escapeAttr(links.intent) + '">'];
    parts.push('<span class="chat-links-label">Recommended next step</span>');
    parts.push('<a class="chat-link primary" href="' + escapeAttr(links.primaryPage) + '">' + escapeAttr(links.primaryLabel) + '</a>');

    if (Array.isArray(links.relatedPages)) {
      links.relatedPages.forEach(function (p) {
        if (!p || !p.href) return;
        parts.push('<a class="chat-link" href="' + escapeAttr(p.href) + '">' + escapeAttr(p.label || p.href) + '</a>');
      });
    }

    if (Array.isArray(links.relatedBlogs)) {
      links.relatedBlogs.forEach(function (b) {
        if (!b || !b.href) return;
        parts.push('<a class="chat-link" href="' + escapeAttr(b.href) + '">Read: ' + escapeAttr(b.label || b.href) + '</a>');
      });
    }

    if (links.cta) {
      parts.push('<a class="chat-links-cta" href="' + escapeAttr(links.primaryPage) + '">' + escapeAttr(links.cta) + '</a>');
    }

    parts.push('</div>');

    var wrap = document.createElement('div');
    wrap.innerHTML = parts.join('');
    // Only allow anchor links to leave the chat bubble; attach the block in the message stream
    var block = wrap.firstChild;
    messagesEl.appendChild(block);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function leadInputValue(lead, key) {
    return String((lead && lead[key]) || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  function showLeadForm(lead, introMessage) {
    var existing = document.getElementById('chatLeadForm');
    if (existing) existing.remove();

    var leadIntro = i18n('chat.leadIntro', 'Share your details and we will follow up.');
    var nameLabel = i18n('chat.leadName', 'Your name');
    var emailLabel = i18n('chat.leadEmail', 'Your email');
    var phoneLabel = i18n('chat.leadPhone', 'Phone / WhatsApp (optional)');
    var submitLabel = i18n('chat.leadSubmit', 'Send details');
    var thanksText = i18n('chat.leadThanks', 'Thanks! We will be in touch soon.');
    var validateText = 'Please enter your name and email.';

    var form = document.createElement('div');
    form.id = 'chatLeadForm';
    form.className = 'chat-bubble assistant lead-form';
    form.innerHTML = [
      '<p style="margin:0 0 8px;font-size:14px;opacity:0.9">' + (introMessage || leadIntro) + '</p>',
      '<input type="text" id="leadName" placeholder="' + nameLabel + '" value="' + leadInputValue(lead, 'name') + '" required style="width:100%;margin-bottom:6px;padding:8px 10px;border:1px solid rgba(201,169,106,0.3);border-radius:14px;background:rgba(255,255,255,0.05);color:inherit;font:inherit;font-size:13px;box-sizing:border-box">',
      '<input type="email" id="leadEmail" placeholder="' + emailLabel + '" value="' + leadInputValue(lead, 'email') + '" required style="width:100%;margin-bottom:6px;padding:8px 10px;border:1px solid rgba(201,169,106,0.3);border-radius:14px;background:rgba(255,255,255,0.05);color:inherit;font:inherit;font-size:13px;box-sizing:border-box">',
      '<input type="tel" id="leadPhone" placeholder="' + phoneLabel + '" value="' + leadInputValue(lead, 'phone') + '" style="width:100%;margin-bottom:8px;padding:8px 10px;border:1px solid rgba(201,169,106,0.3);border-radius:14px;background:rgba(255,255,255,0.05);color:inherit;font:inherit;font-size:13px;box-sizing:border-box">',
      '<button type="button" id="leadSubmit" style="width:100%;padding:8px;background:var(--gold,#C9A96A);color:#0A0B0F;border:none;border-radius:14px;font-weight:600;font-size:13px;cursor:pointer">' + submitLabel + '</button>',
      '<p id="leadFeedback" style="margin:6px 0 0;font-size:12px;opacity:0;transition:opacity 0.3s">' + thanksText + '</p>',
    ].join('');
    messagesEl.appendChild(form);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    document.getElementById('leadSubmit').addEventListener('click', async function () {
      var name = document.getElementById('leadName').value.trim();
      var email = document.getElementById('leadEmail').value.trim();
      var phone = document.getElementById('leadPhone').value.trim();
      var feedback = document.getElementById('leadFeedback');

      if (!name || !email) {
        feedback.textContent = validateText;
        feedback.style.opacity = '1';
        feedback.style.color = '#ff6b6b';
        return;
      }

      feedback.style.opacity = '0';
      var submitButton = document.getElementById('leadSubmit');
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';

      var result = await submitLead(Object.assign({}, lead, { name: name, email: email, phone: phone }, { conversation: messages }));

      if (result.ok && window.LuxivalSupabase) {
        window.LuxivalSupabase.submitChatLead({
          name: name,
          email: email,
          phone: phone || null,
          service_interest: lead.service || 'Chat inquiry',
          message: lead.message || '',
          source: 'chat-widget',
          status: 'new',
        }).catch(function() {});
      }

      feedback.textContent = result.ok
        ? thanksText
        : 'Could not send. Please email us directly at support@luxival.com.';
      feedback.style.opacity = '1';
      feedback.style.color = result.ok ? 'var(--gold, #C9A96A)' : '#ff6b6b';
      submitButton.textContent = result.ok ? 'Sent' : 'Try again';
      submitButton.disabled = result.ok;
    });
  }

  async function submitLead(lead) {
    try {
      var conversation = lead.conversation || messages;
      var body = {
        type: 'Chat lead',
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        message: 'Service: ' + (lead.service || 'Unknown') + '\nIntent: ' + (lead.intent || 'Inquiry') + '\n' + (lead.message || ''),
        source: 'chat-widget',
      };
      if (Array.isArray(conversation) && conversation.length > 0) {
        body.conversation = conversation.map(function (m) {
          return { role: m.role, content: m.content };
        });
      }
      var response = await fetch('/api/lead-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      var data = await response.json().catch(function () { return {}; });
      return {
        ok: response.ok,
        status: response.status,
        error: response.ok ? null : (data.error || 'Email notification failed'),
      };
    } catch (e) {
      return { ok: false, status: 0, error: e && e.message ? e.message : 'Network error' };
    }
  }

  async function handleLead(lead) {
    if (lead.name && lead.email) {
      var result = await submitLead(lead);
      if (!result.ok) {
        var failMsg = 'I could not send the booking automatically. Please check the details below or email support@luxival.com directly.';
        addMessage('assistant', failMsg);
        saveMessage('assistant', failMsg);
        showLeadForm(lead, 'Please confirm your details and try sending again.');
        return;
      }
      if (window.LuxivalSupabase) {
        window.LuxivalSupabase.submitChatLead({
          name: lead.name || '',
          email: lead.email || '',
          phone: lead.phone || null,
          service_interest: lead.service || 'Chat inquiry',
          message: lead.message || '',
          source: 'chat-widget',
          status: 'new',
        }).catch(function() {});
      }
      var msg = 'Your details have been shared with our team. We will follow up shortly, or you can reach us directly at support@luxival.com or WhatsApp +358 50 351 8366.';
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
    showStatus(i18n('chat.statusTyping', 'Luxival assistant is typing...'), false);

    try {
      var chatLang = window.luxivalI18n && typeof window.luxivalI18n.getLang === 'function' ? window.luxivalI18n.getLang() : 'en';
      var response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages,
          page: window.location.pathname,
          session_id: getSessionId(),
          language: chatLang,
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

      if (data.links && typeof data.links === 'object') {
        renderLinks(data.links);
      }

      if (data.lead && typeof data.lead === 'object') {
        await handleLead(data.lead);
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
      addMessage('assistant', i18n('chat.greeting', 'Hi, I am Luxival assistant. What do you need help with today?'));
    } else {
      history.forEach(function (msg) {
        addMessage(msg.role, msg.content);
      });
    }
  })();

  // ---- DYNAMIC LANGUAGE SWITCH ----
  document.addEventListener('luxival:language-changed', function () {
    var toggleEl = document.querySelector('#chatToggle span');
    if (toggleEl) toggleEl.textContent = i18n('chat.toggleLabel', 'Talk to Luxival');

    var headerTitle = document.querySelector('.chat-header strong');
    if (headerTitle) headerTitle.textContent = i18n('chat.headerTitle', 'Luxival assistant');

    var headerDesc = document.querySelector('.chat-header p');
    if (headerDesc) headerDesc.textContent = i18n('chat.headerDesc', 'Ask anything about services, pricing, or booking.');

    var inputEl = document.getElementById('chatInput');
    if (inputEl) inputEl.placeholder = i18n('chat.placeholder', 'Type your question...');

    var sendBtn = document.querySelector('.chat-button');
    if (sendBtn) sendBtn.textContent = i18n('chat.sendButton', 'Send');

    var greetingMsg = i18n('chat.greeting', 'Hi, I am Luxival assistant. What do you need help with today?');
    if (messages.length === 1 && messages[0].role === 'assistant') {
      messages[0].content = greetingMsg;
      var firstBubble = messagesEl.querySelector('.chat-bubble.assistant');
      if (firstBubble) firstBubble.textContent = greetingMsg;
    }

    chipRow.innerHTML = '';
    setupChips();
  });
})();
