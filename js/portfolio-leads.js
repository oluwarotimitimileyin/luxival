(function () {
  function get(form, name) {
    return form.elements[name]?.value.trim() || '';
  }

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const status = form.parentElement.querySelector('.portfolio-lead-status');
    if (status) {
      status.style.color = '#C9A96A';
      status.textContent = 'Sending...';
    }

    if (!window.LuxivalSupabase) {
      if (status) {
        status.style.color = '#f77';
        status.textContent = 'Unable to connect right now. Please use the contact page.';
      }
      return;
    }

    const inspiredBy = form.getAttribute('data-portfolio-lead') || document.title;
    const payload = {
      name: get(form, 'name'),
      email: get(form, 'email'),
      company: get(form, 'company'),
      service_interest: 'Portfolio project consultation',
      message: [
        `Inspired by: ${inspiredBy}`,
        `Project type: ${get(form, 'project_type')}`,
        `Budget range: ${get(form, 'budget')}`,
        `Timeline: ${get(form, 'timeline')}`,
        `Message: ${get(form, 'message')}`
      ].join('\n'),
      source: `portfolio-landing:${window.location.pathname}`,
      status: 'new'
    };

    const { error } = await window.LuxivalSupabase.submitContactInquiry(payload);
    if (error) {
      if (status) {
        status.style.color = '#f77';
        status.textContent = 'Unable to submit now. Please try again.';
      }
      return;
    }

    form.reset();
    window.LuxivalSupabase.notifyLead({...payload,type:'Portfolio lead'});
    if (status) {
      status.style.color = '#C9A96A';
      status.textContent = 'Thanks. Luxival will follow up with next steps.';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('form[data-portfolio-lead]').forEach((form) => form.addEventListener('submit', submit));
  });
})();
