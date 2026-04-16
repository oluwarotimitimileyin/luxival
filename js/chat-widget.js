(function () {
  const widgetMarkup = `
    <div class="chat-widget" id="chatWidget">
      <button class="chat-toggle" id="chatToggle" aria-label="Open Luxival chat">
        <span>Talk to Luxival</span>
      </button>
      <div class="chat-panel" id="chatPanel" hidden>
        <div class="chat-header">
          <div>
            <strong>Luxival assistant</strong>
            <p>Quick questions to qualify your request and get you a fast reply.</p>
          </div>
          <button class="chat-close" id="chatClose" aria-label="Close chat">×</button>
        </div>
        <div class="chat-body">
          <div class="chat-step active" data-step="1">
            <p>Hi! What brings you to Luxival today?</p>
            <select id="chatServiceInterest">
              <option value="Website design">Website design</option>
              <option value="SEO & lead generation">SEO & lead generation</option>
              <option value="Web QA / testing">Web QA / testing</option>
              <option value="3D UX / portfolio">3D UX / portfolio</option>
              <option value="Airport transfer / tourism">Airport transfer / tourism</option>
              <option value="Other">Other</option>
            </select>
            <button type="button" class="chat-button chat-next" data-next="2">Next</button>
          </div>
          <div class="chat-step" data-step="2">
            <p>Great. What is the best way to reach you?</p>
            <label for="chatName">Name</label>
            <input id="chatName" type="text" placeholder="Your name" />
            <label for="chatEmail">Email</label>
            <input id="chatEmail" type="email" placeholder="you@example.com" />
            <label for="chatPhone">Phone</label>
            <input id="chatPhone" type="tel" placeholder="Optional phone" />
            <div class="chat-actions">
              <button type="button" class="chat-button chat-back" data-back="1">Back</button>
              <button type="button" class="chat-button chat-next" data-next="3">Next</button>
            </div>
          </div>
          <div class="chat-step" data-step="3">
            <p>Tell us briefly what you need or your travel plan.</p>
            <textarea id="chatMessage" rows="4" placeholder="Describe your project, ride request, or question"></textarea>
            <div class="chat-actions">
              <button type="button" class="chat-button chat-back" data-back="2">Back</button>
              <button type="button" class="chat-button chat-next" data-next="4">Next</button>
            </div>
          </div>
          <div class="chat-step" data-step="4">
            <p>Would you like a follow-up by WhatsApp or email?</p>
            <div class="chat-option-group">
              <label><input type="radio" name="chatContactMethod" value="Email" checked /> Email</label>
              <label><input type="radio" name="chatContactMethod" value="WhatsApp" /> WhatsApp</label>
            </div>
            <div class="chat-actions">
              <button type="button" class="chat-button chat-back" data-back="3">Back</button>
              <button type="button" class="chat-button chat-submit" id="chatSubmit">Send</button>
            </div>
          </div>
          <div class="chat-step" data-step="5">
            <p class="chat-success-title">Thanks — your request is on the way.</p>
            <p>We will review your details and contact you soon.</p>
            <div class="chat-actions">
              <button type="button" class="chat-button chat-close-panel" id="chatDone">Close</button>
            </div>
          </div>
          <div class="chat-status" id="chatStatus"></div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', widgetMarkup);

  const widget = document.getElementById('chatWidget');
  const toggle = document.getElementById('chatToggle');
  const closeButton = document.getElementById('chatClose');
  const panel = document.getElementById('chatPanel');
  const steps = Array.from(widget.querySelectorAll('.chat-step'));
  const statusEl = document.getElementById('chatStatus');
  const submitButton = document.getElementById('chatSubmit');
  const doneButton = document.getElementById('chatDone');

  function showStatus(message, isError = false) {
    statusEl.textContent = message;
    statusEl.style.color = isError ? '#ff6b6b' : '#9d7dff';
  }

  function showStep(stepNumber) {
    steps.forEach((step) => {
      step.classList.toggle('active', step.dataset.step === String(stepNumber));
    });
    statusEl.textContent = '';
  }

  function setOpen(open) {
    panel.hidden = !open;
    widget.classList.toggle('open', open);
  }

  toggle.addEventListener('click', () => setOpen(true));
  closeButton.addEventListener('click', () => setOpen(false));
  doneButton.addEventListener('click', () => setOpen(false));

  widget.querySelectorAll('.chat-next').forEach((button) => {
    button.addEventListener('click', () => {
      const next = button.dataset.next;
      showStep(next);
    });
  });

  widget.querySelectorAll('.chat-back').forEach((button) => {
    button.addEventListener('click', () => {
      const back = button.dataset.back;
      showStep(back);
    });
  });

  submitButton.addEventListener('click', async () => {
    const name = document.getElementById('chatName').value.trim();
    const email = document.getElementById('chatEmail').value.trim();
    const phone = document.getElementById('chatPhone').value.trim();
    const serviceInterest = document.getElementById('chatServiceInterest').value;
    const message = document.getElementById('chatMessage').value.trim();
    const contactMethod = widget.querySelector('input[name="chatContactMethod"]:checked').value;

    if (!name || !email || !message) {
      showStatus('Please complete your name, email, and request details.', true);
      return;
    }

    showStatus('Sending your chat request…');

    const payload = {
      name,
      email,
      phone,
      company: null,
      service_interest: serviceInterest,
      message: `${message} (preferred contact: ${contactMethod})`,
      source: 'chat-widget',
      status: 'new',
      metadata: {
        contact_method: contactMethod,
        origin: window.location.pathname,
        browser: navigator.userAgent,
      },
    };

    const { error } = await window.LuxivalSupabase.submitChatLead(payload);
    if (error) {
      showStatus('Unable to send chat request right now. Please try again later.', true);
      console.error('Chat lead error:', error);
      return;
    }

    showStep(5);
  });
})();
