document.addEventListener('DOMContentLoaded', async () => {
  if (!window.supabase || !window.LuxivalConfig) {
    return;
  }

  if (!window.LuxivalConfig.SUPABASE_URL || !window.LuxivalConfig.SUPABASE_PUBLISHABLE_KEY) {
    return;
  }

  const supabaseClient = window.supabase.createClient(
    window.LuxivalConfig.SUPABASE_URL,
    window.LuxivalConfig.SUPABASE_PUBLISHABLE_KEY
  );

  const authModal = document.getElementById('authModal');
  const authForm = document.getElementById('authForm');
  const authEmail = document.getElementById('authEmail');
  const authPassword = document.getElementById('authPassword');
  const authSubmit = document.getElementById('authSubmit');
  const authError = document.getElementById('authError');
  const authInfo = document.getElementById('authInfo');
  const authResetPassword = document.getElementById('authResetPassword');
  const body = document.body;

  const allowedAdminEmail = (window.LuxivalConfig.ADMIN_ALLOWED_EMAIL || '').trim().toLowerCase();

  const isAllowedAdminEmail = (email) => {
    if (!allowedAdminEmail) return true;
    return String(email || '').trim().toLowerCase() === allowedAdminEmail;
  };

  const showAuthError = (message) => {
    if (authInfo) {
      authInfo.textContent = '';
      authInfo.className = '';
    }
    authError.textContent = message;
    authError.className = 'auth-error';
    authSubmit.disabled = false;
    authSubmit.textContent = 'Sign In';
  };

  const showAuthInfo = (message) => {
    if (authError) {
      authError.textContent = '';
      authError.className = '';
    }
    if (!authInfo) return;
    authInfo.textContent = message;
    authInfo.className = 'auth-info';
  };

  const clearAuthMessages = () => {
    if (authError) {
      authError.textContent = '';
      authError.className = '';
    }
    if (authInfo) {
      authInfo.textContent = '';
      authInfo.className = '';
    }
  };

  const hideAuthModal = () => {
    authModal.classList.add('hidden');
    body.classList.remove('dashboard-hidden');
  };

  const showStatus = (el, message, isError = false) => {
    if (!el) return;
    el.textContent = message;
    el.style.color = isError ? '#ff9999' : '#d2b27a';
  };

  const slugify = (text) =>
    String(text || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const escapeHtml = (value) =>
    String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const formatDate = (value) => {
    if (!value) return 'Not published';
    return new Date(value).toLocaleString();
  };

  let currentSession = null;
  try {
    const { data: sessionResponse, error: sessionError } = await supabaseClient.auth.getSession();
    if (sessionError) {
      showAuthError(sessionError.message || 'Unable to read current session.');
    }
    currentSession = sessionResponse ? sessionResponse.session : null;
  } catch (error) {
    showAuthError('Unable to initialize authentication. Check Supabase settings.');
  }

  const handleAuth = async (event) => {
    event.preventDefault();
    clearAuthMessages();
    authSubmit.disabled = true;
    authSubmit.textContent = 'Signing in...';

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: authEmail.value.trim(),
        password: authPassword.value,
      });

      if (error) {
        showAuthError(error.message || 'Authentication failed.');
        return;
      }

      const activeSession = data && data.session ? data.session : null;
      if (!activeSession) {
        const followUp = await supabaseClient.auth.getSession();
        const fallbackSession = followUp && followUp.data ? followUp.data.session : null;
        if (!fallbackSession) {
          showAuthError('Sign-in succeeded but no active session was created. Confirm email verification is complete in Supabase Auth.');
          return;
        }
        const fallbackEmail = fallbackSession.user && fallbackSession.user.email;
        if (!isAllowedAdminEmail(fallbackEmail)) {
          await supabaseClient.auth.signOut();
          showAuthError('This account is not authorized for admin access.');
          return;
        }
        hideAuthModal();
        await loadDashboard(fallbackSession);
        return;
      }

      const signedInEmail = activeSession.user && activeSession.user.email;
      if (!isAllowedAdminEmail(signedInEmail)) {
        await supabaseClient.auth.signOut();
        showAuthError('This account is not authorized for admin access.');
        return;
      }

      hideAuthModal();
      await loadDashboard(activeSession);
    } catch (error) {
      const message = error && error.message ? error.message : 'Sign-in failed due to an unexpected network/auth error.';
      showAuthError(message);
    } finally {
      if (!authModal.classList.contains('hidden')) {
        authSubmit.disabled = false;
        authSubmit.textContent = 'Sign In';
      }
    }
  };

  authForm.addEventListener('submit', handleAuth);

  if (authResetPassword) {
    authResetPassword.addEventListener('click', async () => {
      clearAuthMessages();
      const email = authEmail.value.trim();
      if (!email) {
        showAuthError('Enter your email first, then request a reset link.');
        return;
      }

      const redirectTo = `${window.location.origin}/admin`;
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) {
        showAuthError(error.message || 'Unable to send reset link.');
        return;
      }

      showAuthInfo(`Reset link sent to ${email}. Open the email and follow the link to set a new password.`);
    });
  }

  window.logoutAdmin = async () => {
    await supabaseClient.auth.signOut();
    body.classList.add('dashboard-hidden');
    authModal.classList.remove('hidden');
    authForm.reset();
    clearAuthMessages();
  };

  if (currentSession) {
    const existingEmail = currentSession.user && currentSession.user.email;
    if (!isAllowedAdminEmail(existingEmail)) {
      await supabaseClient.auth.signOut();
      authModal.classList.remove('hidden');
      showAuthError('This account is not authorized for admin access.');
      return;
    }
    hideAuthModal();
    await loadDashboard(currentSession);
  } else {
    authModal.classList.remove('hidden');
  }

  async function loadDashboard(activeSession) {
    const contactCount = document.getElementById('contactCount');
    const rideCount = document.getElementById('rideCount');
    const newsletterCount = document.getElementById('newsletterCount');
    const rideRequestsTable = document.getElementById('rideRequestsTable');
    const contactInquiriesTable = document.getElementById('contactInquiriesTable');
    const newsletterTable = document.getElementById('newsletterTable');

    const blogForm = document.getElementById('blogForm');
    const blogId = document.getElementById('blogId');
    const blogTitle = document.getElementById('blogTitle');
    const blogSlug = document.getElementById('blogSlug');
    const blogExcerpt = document.getElementById('blogExcerpt');
    const blogContent = document.getElementById('blogContent');
    const blogCategory = document.getElementById('blogCategory');
    const blogTags = document.getElementById('blogTags');
    const blogFeaturedImage = document.getElementById('blogFeaturedImage');
    const blogPublished = document.getElementById('blogPublished');
    const blogList = document.getElementById('blogList');
    const blogStatus = document.getElementById('blogStatus');
    const blogFormReset = document.getElementById('blogFormReset');

    const reviewForm = document.getElementById('reviewForm');
    const reviewId = document.getElementById('reviewId');
    const reviewerName = document.getElementById('reviewerName');
    const reviewText = document.getElementById('reviewText');
    const reviewSource = document.getElementById('reviewSource');
    const reviewServiceArea = document.getElementById('reviewServiceArea');
    const reviewAvatar = document.getElementById('reviewAvatar');
    const reviewRating = document.getElementById('reviewRating');
    const reviewPublished = document.getElementById('reviewPublished');
    const reviewList = document.getElementById('reviewList');
    const reviewStatus = document.getElementById('reviewStatus');
    const reviewFormReset = document.getElementById('reviewFormReset');

    const assetForm = document.getElementById('assetForm');
    const assetBucket = document.getElementById('assetBucket');
    const assetPath = document.getElementById('assetPath');
    const assetFile = document.getElementById('assetFile');
    const assetStatus = document.getElementById('assetStatus');
    const assetList = document.getElementById('assetList');
    const assetPreview = document.getElementById('assetPreview');

    const pageContentForm = document.getElementById('pageContentForm');
    const pageContentId = document.getElementById('pageContentId');
    const pageKey = document.getElementById('pageKey');
    const contentKey = document.getElementById('contentKey');
    const contentLabel = document.getElementById('contentLabel');
    const contentValue = document.getElementById('contentValue');
    const pageContentStatus = document.getElementById('pageContentStatus');
    const pageContentList = document.getElementById('pageContentList');
    const pageContentReset = document.getElementById('pageContentReset');
    const pageContentFilter = document.getElementById('pageContentFilter');
    const pageContentRefresh = document.getElementById('pageContentRefresh');
    const pageTemplatePreset = document.getElementById('pageTemplatePreset');
    const contentTemplatePreset = document.getElementById('contentTemplatePreset');
    const applyContentPreset = document.getElementById('applyContentPreset');
    const contentPreviewPayload = document.getElementById('contentPreviewPayload');
    const contentPreviewLive = document.getElementById('contentPreviewLive');

    const renderTable = (container, headings, rows) => {
      if (!container) return;
      const table = document.createElement('table');
      table.className = 'data-table';

      const headRow = document.createElement('tr');
      headings.forEach((heading) => {
        const th = document.createElement('th');
        th.textContent = heading;
        headRow.appendChild(th);
      });

      const thead = document.createElement('thead');
      thead.appendChild(headRow);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      rows.forEach((row) => {
        const tr = document.createElement('tr');
        row.forEach((cell) => {
          const td = document.createElement('td');
          td.textContent = cell;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      container.innerHTML = '';
      container.appendChild(table);
    };

    const showLeadError = (container, message) => {
      if (!container) return;
      container.innerHTML = `<div class="form-status" style="color:#f77">${message}</div>`;
    };

    const clearBlogForm = () => {
      blogId.value = '';
      blogForm.reset();
      blogPublished.checked = false;
      showStatus(blogStatus, '');
    };

    const clearReviewForm = () => {
      reviewId.value = '';
      reviewForm.reset();
      reviewRating.value = '5';
      reviewPublished.checked = false;
      showStatus(reviewStatus, '');
    };

    const clearPageContentForm = () => {
      if (!pageContentForm) return;
      pageContentId.value = '';
      pageContentForm.reset();
      if (pageTemplatePreset) pageTemplatePreset.value = '';
      if (contentTemplatePreset) contentTemplatePreset.value = '';
      updateContentPreview();
      showStatus(pageContentStatus, '');
    };

    const escapeWithLineBreaks = (value) => escapeHtml(String(value || '')).replace(/\n/g, '<br>');

    const updateContentPreview = () => {
      const resolvedPageKey = pageKey.value.trim() || (pageTemplatePreset ? pageTemplatePreset.value : '');
      const resolvedContentKey = contentKey.value.trim() || (contentTemplatePreset ? contentTemplatePreset.value : '');
      const resolvedLabel = contentLabel.value.trim();
      const resolvedValue = contentValue.value;

      const payload = {
        page_key: sanitizeSegment(resolvedPageKey).toLowerCase(),
        content_key: sanitizeSegment(resolvedContentKey).toLowerCase(),
        label: resolvedLabel || '',
        content_value: resolvedValue || '',
      };

      if (contentPreviewPayload) {
        contentPreviewPayload.textContent = JSON.stringify(payload, null, 2);
      }

      if (contentPreviewLive) {
        const title = payload.page_key && payload.content_key
          ? `${payload.page_key} / ${payload.content_key}`
          : 'Select or type a page_key and content_key';
        const labelLine = payload.label ? `<div><strong>Label:</strong> ${escapeHtml(payload.label)}</div>` : '';
        const valueLine = payload.content_value
          ? `<div style="margin-top:0.35rem">${escapeWithLineBreaks(payload.content_value)}</div>`
          : '<div style="opacity:0.75;margin-top:0.35rem">Content value preview will appear here.</div>';

        contentPreviewLive.innerHTML = `<div><strong>${escapeHtml(title)}</strong></div>${labelLine}${valueLine}`;
      }
    };

    const sanitizeSegment = (value) => String(value || '').trim().replace(/[^a-zA-Z0-9/_-]+/g, '-');

    const toPublicUrl = (bucket, path) => {
      const response = supabaseClient.storage.from(bucket).getPublicUrl(path);
      if (!response || !response.data) return '';
      return response.data.publicUrl || '';
    };

    const loadLeads = async () => {
      const [{ error: contactError, data: contacts = [] }, { error: rideError, data: rides = [] }, { error: newsletterError, data: newsletter = [] }] = await Promise.all([
        window.LuxivalSupabase.fetchContactInquiries(20),
        window.LuxivalSupabase.fetchRideRequests(20),
        window.LuxivalSupabase.fetchNewsletterSubscribers(20),
      ]);

      if (contactError) showLeadError(contactInquiriesTable, 'Unable to load contact inquiries.');
      if (rideError) showLeadError(rideRequestsTable, 'Unable to load ride requests.');
      if (newsletterError) showLeadError(newsletterTable, 'Unable to load newsletter subscribers.');

      if (contactCount) contactCount.textContent = contacts.length;
      if (rideCount) rideCount.textContent = rides.length;
      if (newsletterCount) newsletterCount.textContent = newsletter.length;

      renderTable(
        rideRequestsTable,
        ['Created', 'Customer', 'Pickup', 'Destination', 'Date', 'Time', 'Service', 'Flight', 'Price', 'Status'],
        rides.map((ride) => [
          new Date(ride.created_at).toLocaleString(),
          ride.customer_name || '-',
          ride.pickup_location || '-',
          ride.destination || '-',
          ride.preferred_date || '-',
          ride.ride_time || '-',
          ride.service_type || '-',
          ride.flight_number || '-',
          ride.estimated_price != null ? `EUR ${ride.estimated_price}` : '-',
          ride.status || '-',
        ])
      );

      renderTable(
        contactInquiriesTable,
        ['Created', 'Name', 'Email', 'Service', 'Message', 'Status'],
        contacts.map((contact) => [
          new Date(contact.created_at).toLocaleString(),
          contact.name || '-',
          contact.email || '-',
          contact.service_interest || '-',
          contact.message ? contact.message.substring(0, 80) + (contact.message.length > 80 ? '...' : '') : '-',
          contact.status || '-',
        ])
      );

      renderTable(
        newsletterTable,
        ['Created', 'Email', 'Name', 'Status'],
        newsletter.map((item) => [
          new Date(item.created_at).toLocaleString(),
          item.email || '-',
          item.name || '-',
          item.status || '-',
        ])
      );
    };

    const loadBlogPosts = async () => {
      const { data, error } = await supabaseClient
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        showStatus(blogStatus, `Blog load failed: ${error.message}`, true);
        return;
      }

      if (!data || data.length === 0) {
        blogList.innerHTML = '<div class="cms-item"><p>No blog posts yet.</p></div>';
        return;
      }

      blogList.innerHTML = data.map((post) => `
        <article class="cms-item">
          <h4>${escapeHtml(post.title)}</h4>
          <p class="cms-meta">/${escapeHtml(post.slug)} • ${post.published ? 'Published' : 'Draft'} • ${formatDate(post.published_at || post.created_at)}</p>
          <div class="cms-actions">
            <button class="cms-btn" data-blog-action="edit" data-id="${post.id}">Edit</button>
            <button class="cms-btn" data-blog-action="toggle" data-id="${post.id}" data-published="${post.published}">${post.published ? 'Unpublish' : 'Publish'}</button>
            <button class="cms-btn" data-blog-action="delete" data-id="${post.id}">Delete</button>
          </div>
        </article>
      `).join('');
    };

    const loadReviews = async () => {
      const { data, error } = await supabaseClient
        .from('site_reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        showStatus(reviewStatus, `Reviews load failed: ${error.message}`, true);
        return;
      }

      if (!data || data.length === 0) {
        reviewList.innerHTML = '<div class="cms-item"><p>No reviews yet.</p></div>';
        return;
      }

      reviewList.innerHTML = data.map((review) => `
        <article class="cms-item">
          <h4>${escapeHtml(review.reviewer_name)} • ${review.rating}/5</h4>
          <p class="cms-meta">${review.published ? 'Published' : 'Draft'} • ${formatDate(review.published_at || review.created_at)}</p>
          <p>${escapeHtml(review.review_text)}</p>
          <div class="cms-actions">
            <button class="cms-btn" data-review-action="edit" data-id="${review.id}">Edit</button>
            <button class="cms-btn" data-review-action="toggle" data-id="${review.id}" data-published="${review.published}">${review.published ? 'Unpublish' : 'Publish'}</button>
            <button class="cms-btn" data-review-action="delete" data-id="${review.id}">Delete</button>
          </div>
        </article>
      `).join('');
    };

    const loadAssets = async () => {
      if (!assetList) return;

      const { data, error } = await supabaseClient
        .from('uploaded_assets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        showStatus(assetStatus, `Assets load failed: ${error.message}`, true);
        assetList.innerHTML = '<div class="cms-item"><p>Asset table not available yet.</p></div>';
        return;
      }

      if (!data || data.length === 0) {
        assetList.innerHTML = '<div class="cms-item"><p>No uploaded assets yet.</p></div>';
        return;
      }

      assetList.innerHTML = data.map((asset) => {
        const safeName = escapeHtml(asset.file_name || asset.path || 'File');
        const safeMeta = `${escapeHtml(asset.bucket)} • ${formatDate(asset.created_at)}`;
        const safeUrl = asset.public_url ? escapeHtml(asset.public_url) : '';
        return `
          <article class="cms-item">
            <h4>${safeName}</h4>
            <p class="cms-meta">${safeMeta}</p>
            ${safeUrl ? `<p><a href="${safeUrl}" target="_blank" rel="noopener">Open</a></p>` : '<p class="cms-meta">Private file (no public URL)</p>'}
          </article>
        `;
      }).join('');
    };

    const loadPageContent = async (pageFilter = 'all') => {
      if (!pageContentList) return;

      let query = supabaseClient
        .from('site_content')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(100);

      if (pageFilter && pageFilter !== 'all') {
        query = query.eq('page_key', pageFilter);
      }

      const { data, error } = await query;

      if (error) {
        showStatus(pageContentStatus, `Page content load failed: ${error.message}`, true);
        pageContentList.innerHTML = '<div class="cms-item"><p>site_content table not found. Apply the updated SQL setup.</p></div>';
        return;
      }

      if (!data || data.length === 0) {
        const target = pageFilter && pageFilter !== 'all' ? ` for ${escapeHtml(pageFilter)}` : '';
        pageContentList.innerHTML = `<div class="cms-item"><p>No content entries yet${target}.</p></div>`;
        return;
      }

      pageContentList.innerHTML = data.map((entry) => `
        <article class="cms-item">
          <h4>${escapeHtml(entry.page_key)} / ${escapeHtml(entry.content_key)}</h4>
          <p class="cms-meta">${escapeHtml(entry.label || 'No label')} • ${formatDate(entry.updated_at || entry.created_at)}</p>
          <p>${escapeHtml(String(entry.content_value || '')).slice(0, 120)}</p>
          <div class="cms-actions">
            <button class="cms-btn" data-content-action="edit" data-id="${entry.id}">Edit</button>
            <button class="cms-btn" data-content-action="delete" data-id="${entry.id}">Delete</button>
          </div>
        </article>
      `).join('');
    };

    blogTitle.addEventListener('input', () => {
      if (!blogId.value) {
        blogSlug.value = slugify(blogTitle.value);
      }
    });

    blogForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const payload = {
        title: blogTitle.value.trim(),
        slug: slugify(blogSlug.value.trim()),
        excerpt: blogExcerpt.value.trim() || null,
        content: blogContent.value.trim() || null,
        category: blogCategory.value.trim() || 'blog',
        tags: blogTags.value.trim() ? blogTags.value.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
        featured_image: blogFeaturedImage.value.trim() || null,
        published: blogPublished.checked,
        published_at: blogPublished.checked ? new Date().toISOString() : null,
        author: (activeSession.user && activeSession.user.email) || 'Luxival',
      };

      if (!payload.title || !payload.slug) {
        showStatus(blogStatus, 'Title and slug are required.', true);
        return;
      }

      let error;
      if (blogId.value) {
        const response = await supabaseClient.from('blog_posts').update(payload).eq('id', blogId.value);
        error = response.error;
      } else {
        const response = await supabaseClient.from('blog_posts').insert([payload]);
        error = response.error;
      }

      if (error) {
        showStatus(blogStatus, `Save failed: ${error.message}`, true);
        return;
      }

      showStatus(blogStatus, 'Blog post saved successfully.');
      clearBlogForm();
      await loadBlogPosts();
    });

    blogFormReset.addEventListener('click', clearBlogForm);

    blogList.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-blog-action]');
      if (!button) return;

      const action = button.getAttribute('data-blog-action');
      const id = button.getAttribute('data-id');
      if (!id) return;

      if (action === 'edit') {
        const { data, error } = await supabaseClient.from('blog_posts').select('*').eq('id', id).single();
        if (error || !data) {
          showStatus(blogStatus, 'Unable to load post for editing.', true);
          return;
        }

        blogId.value = data.id;
        blogTitle.value = data.title || '';
        blogSlug.value = data.slug || '';
        blogExcerpt.value = data.excerpt || '';
        blogContent.value = data.content || '';
        blogCategory.value = data.category || '';
        blogTags.value = Array.isArray(data.tags) ? data.tags.join(', ') : '';
        blogFeaturedImage.value = data.featured_image || '';
        blogPublished.checked = !!data.published;
        showStatus(blogStatus, 'Editing selected post.');
      }

      if (action === 'toggle') {
        const currentPublished = button.getAttribute('data-published') === 'true';
        const nextPublished = !currentPublished;
        const { error } = await supabaseClient
          .from('blog_posts')
          .update({
            published: nextPublished,
            published_at: nextPublished ? new Date().toISOString() : null,
          })
          .eq('id', id);

        if (error) {
          showStatus(blogStatus, `Publish toggle failed: ${error.message}`, true);
          return;
        }

        showStatus(blogStatus, nextPublished ? 'Post published.' : 'Post unpublished.');
        await loadBlogPosts();
      }

      if (action === 'delete') {
        const ok = window.confirm('Delete this post? This cannot be undone.');
        if (!ok) return;

        const { error } = await supabaseClient.from('blog_posts').delete().eq('id', id);
        if (error) {
          showStatus(blogStatus, `Delete failed: ${error.message}`, true);
          return;
        }

        showStatus(blogStatus, 'Post deleted.');
        await loadBlogPosts();
      }
    });

    reviewForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const payload = {
        reviewer_name: reviewerName.value.trim(),
        review_text: reviewText.value.trim(),
        source: reviewSource.value.trim() || null,
        service_area: reviewServiceArea.value.trim() || null,
        avatar_url: reviewAvatar.value.trim() || null,
        rating: Number(reviewRating.value || 5),
        published: reviewPublished.checked,
        published_at: reviewPublished.checked ? new Date().toISOString() : null,
      };

      if (!payload.reviewer_name || !payload.review_text) {
        showStatus(reviewStatus, 'Reviewer name and review text are required.', true);
        return;
      }

      let error;
      if (reviewId.value) {
        const response = await supabaseClient.from('site_reviews').update(payload).eq('id', reviewId.value);
        error = response.error;
      } else {
        const response = await supabaseClient.from('site_reviews').insert([payload]);
        error = response.error;
      }

      if (error) {
        showStatus(reviewStatus, `Save failed: ${error.message}`, true);
        return;
      }

      showStatus(reviewStatus, 'Review saved successfully.');
      clearReviewForm();
      await loadReviews();
    });

    reviewFormReset.addEventListener('click', clearReviewForm);

    reviewList.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-review-action]');
      if (!button) return;

      const action = button.getAttribute('data-review-action');
      const id = button.getAttribute('data-id');
      if (!id) return;

      if (action === 'edit') {
        const { data, error } = await supabaseClient.from('site_reviews').select('*').eq('id', id).single();
        if (error || !data) {
          showStatus(reviewStatus, 'Unable to load review for editing.', true);
          return;
        }

        reviewId.value = data.id;
        reviewerName.value = data.reviewer_name || '';
        reviewText.value = data.review_text || '';
        reviewSource.value = data.source || '';
        reviewServiceArea.value = data.service_area || '';
        reviewAvatar.value = data.avatar_url || '';
        reviewRating.value = String(data.rating || 5);
        reviewPublished.checked = !!data.published;
        showStatus(reviewStatus, 'Editing selected review.');
      }

      if (action === 'toggle') {
        const currentPublished = button.getAttribute('data-published') === 'true';
        const nextPublished = !currentPublished;
        const { error } = await supabaseClient
          .from('site_reviews')
          .update({
            published: nextPublished,
            published_at: nextPublished ? new Date().toISOString() : null,
          })
          .eq('id', id);

        if (error) {
          showStatus(reviewStatus, `Publish toggle failed: ${error.message}`, true);
          return;
        }

        showStatus(reviewStatus, nextPublished ? 'Review published.' : 'Review unpublished.');
        await loadReviews();
      }

      if (action === 'delete') {
        const ok = window.confirm('Delete this review? This cannot be undone.');
        if (!ok) return;

        const { error } = await supabaseClient.from('site_reviews').delete().eq('id', id);
        if (error) {
          showStatus(reviewStatus, `Delete failed: ${error.message}`, true);
          return;
        }

        showStatus(reviewStatus, 'Review deleted.');
        await loadReviews();
      }
    });

    if (assetForm) {
      assetForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        showStatus(assetStatus, 'Uploading...');

        const selectedFile = assetFile && assetFile.files ? assetFile.files[0] : null;
        if (!selectedFile) {
          showStatus(assetStatus, 'Please choose a file.', true);
          return;
        }

        const bucket = assetBucket.value;
        const folder = sanitizeSegment(assetPath.value || 'uploads');
        const fileName = sanitizeSegment(selectedFile.name);
        const finalPath = `${folder}/${Date.now()}-${fileName}`;

        const uploadResponse = await supabaseClient
          .storage
          .from(bucket)
          .upload(finalPath, selectedFile, { cacheControl: '3600', upsert: false });

        if (uploadResponse.error) {
          showStatus(assetStatus, `Upload failed: ${uploadResponse.error.message}`, true);
          return;
        }

        const publicUrl = bucket === 'project-images' ? toPublicUrl(bucket, finalPath) : null;

        const { error: assetInsertError } = await supabaseClient.from('uploaded_assets').insert([{
          bucket,
          path: finalPath,
          file_name: selectedFile.name,
          content_type: selectedFile.type || null,
          size_bytes: selectedFile.size,
          uploaded_by: (activeSession.user && activeSession.user.email) || null,
          public_url: publicUrl,
        }]);

        if (assetInsertError) {
          showStatus(assetStatus, `Uploaded but metadata save failed: ${assetInsertError.message}`, true);
          return;
        }

        if (assetPreview && publicUrl) {
          assetPreview.src = publicUrl;
          assetPreview.style.display = 'block';
        }

        assetForm.reset();
        showStatus(assetStatus, 'Asset uploaded successfully.');
        await loadAssets();
      });
    }

    if (pageContentForm) {
      [pageKey, contentKey, contentLabel, contentValue].forEach((field) => {
        if (!field) return;
        field.addEventListener('input', updateContentPreview);
      });

      [pageTemplatePreset, contentTemplatePreset].forEach((field) => {
        if (!field) return;
        field.addEventListener('change', updateContentPreview);
      });

      pageContentForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const resolvedPageKey = pageKey.value.trim() || (pageTemplatePreset ? pageTemplatePreset.value : '');
        const resolvedContentKey = contentKey.value.trim() || (contentTemplatePreset ? contentTemplatePreset.value : '');

        const payload = {
          page_key: sanitizeSegment(resolvedPageKey).toLowerCase(),
          content_key: sanitizeSegment(resolvedContentKey).toLowerCase(),
          label: contentLabel.value.trim() || null,
          content_value: contentValue.value.trim(),
          updated_by: (activeSession.user && activeSession.user.email) || null,
          updated_at: new Date().toISOString(),
        };

        if (!payload.page_key || !payload.content_key || !payload.content_value) {
          showStatus(pageContentStatus, 'Page key, content key, and value are required.', true);
          return;
        }

        let saveError = null;
        if (pageContentId.value) {
          const response = await supabaseClient.from('site_content').update(payload).eq('id', pageContentId.value);
          saveError = response.error;
        } else {
          const response = await supabaseClient.from('site_content').upsert([payload], { onConflict: 'page_key,content_key' });
          saveError = response.error;
        }

        if (saveError) {
          showStatus(pageContentStatus, `Save failed: ${saveError.message}`, true);
          return;
        }

        showStatus(pageContentStatus, 'Content saved successfully.');
        if (pageContentFilter && payload.page_key) {
          pageContentFilter.value = payload.page_key;
        }
        clearPageContentForm();
        await loadPageContent(pageContentFilter ? pageContentFilter.value : 'all');
      });
    }

    if (applyContentPreset) {
      applyContentPreset.addEventListener('click', () => {
        if (pageTemplatePreset && pageTemplatePreset.value && !pageKey.value.trim()) {
          pageKey.value = pageTemplatePreset.value;
        }
        if (contentTemplatePreset && contentTemplatePreset.value && !contentKey.value.trim()) {
          contentKey.value = contentTemplatePreset.value;
        }

        if (pageContentFilter && pageTemplatePreset && pageTemplatePreset.value) {
          pageContentFilter.value = pageTemplatePreset.value;
          loadPageContent(pageContentFilter.value);
        }

        updateContentPreview();
        showStatus(pageContentStatus, 'Preset applied. Add value and save.', false);
      });
    }

    if (pageContentReset) {
      pageContentReset.addEventListener('click', clearPageContentForm);
    }

    if (pageContentFilter) {
      pageContentFilter.addEventListener('change', async () => {
        await loadPageContent(pageContentFilter.value);
      });
    }

    if (pageContentRefresh) {
      pageContentRefresh.addEventListener('click', async () => {
        await loadPageContent(pageContentFilter ? pageContentFilter.value : 'all');
      });
    }

    if (pageContentList) {
      pageContentList.addEventListener('click', async (event) => {
        const button = event.target.closest('[data-content-action]');
        if (!button) return;

        const action = button.getAttribute('data-content-action');
        const id = button.getAttribute('data-id');
        if (!id) return;

        if (action === 'edit') {
          const { data, error } = await supabaseClient.from('site_content').select('*').eq('id', id).single();
          if (error || !data) {
            showStatus(pageContentStatus, 'Unable to load content entry.', true);
            return;
          }

          pageContentId.value = data.id;
          pageKey.value = data.page_key || '';
          contentKey.value = data.content_key || '';
          contentLabel.value = data.label || '';
          contentValue.value = data.content_value || '';
          updateContentPreview();
          showStatus(pageContentStatus, 'Editing selected content entry.');
        }

        if (action === 'delete') {
          const ok = window.confirm('Delete this content entry?');
          if (!ok) return;

          const { error } = await supabaseClient.from('site_content').delete().eq('id', id);
          if (error) {
            showStatus(pageContentStatus, `Delete failed: ${error.message}`, true);
            return;
          }

          showStatus(pageContentStatus, 'Content entry deleted.');
          await loadPageContent(pageContentFilter ? pageContentFilter.value : 'all');
        }
      });
    }

    const initialPageFilter = pageContentFilter ? pageContentFilter.value : 'all';
    updateContentPreview();
    await Promise.all([loadLeads(), loadBlogPosts(), loadReviews(), loadAssets(), loadPageContent(initialPageFilter)]);
  }
});
