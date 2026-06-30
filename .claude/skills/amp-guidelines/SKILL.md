---
name: amp-guidelines
description: Google AMP (Accelerated Mobile Pages) compliance guidelines for making AMP pages Google Search-friendly. Covers AMP HTML spec requirements, validation, structured data, URL schemes, and search feature eligibility. Use when building, auditing, or fixing AMP pages.
---

# AMP GUIDELINES FOR GOOGLE SEARCH

Apply these guidelines whenever creating, auditing, or troubleshooting AMP pages for Google Search compatibility.

---

## Core Requirements

1. **Follow the AMP HTML specification.** Every AMP page must conform to the official AMP HTML spec. Invalid AMP pages are excluded from AMP-related Search features.

2. **Content parity.** Users must experience the same content and complete the same actions on AMP pages as on the corresponding canonical pages, where possible.

3. **Responsive design.** AMP pages are NOT mobile-only. Build with responsive design so they display well on all device types (mobile and desktop).

4. **Structured data compliance.** If structured data is added to an AMP page, it must follow Google's structured data policies.

---

## URL Scheme

AMP URLs must make sense to the user and relate to the canonical domain.

**Do:**
- `amp.example.com/giraffes`
- `example.com/amp/giraffes`

**Don't:**
- `test.com/giraffes` (unrelated domain — confusing when the canonical is `example.com`)

The AMP URL is visible in the browser when users click from Google Search, so it must clearly associate with the main website.

---

## Validation

- Use the AMP Validator to ensure pages are valid before publishing.
- Invalid AMP pages will not be eligible for AMP-specific Search features.
- Validate after every change — small errors can silently disqualify pages.

---

## AMP on Desktop

- AMP pages render equally well on desktop and mobile.
- For pages where AMP supports all needed functionality, consider standalone AMP pages to serve both desktop and mobile visitors from a single page.
- AMP on desktop does **not** receive search-specific features in Google Search results (those are mobile-only).

---

## Key Topics Checklist

When working with AMP pages, address each of these:

- [ ] Page follows AMP HTML specification
- [ ] Content matches canonical page
- [ ] URL scheme is logical and relates to canonical domain
- [ ] AMP page is valid (run through AMP Validator)
- [ ] Structured data follows Google policies (if present)
- [ ] Responsive design works across devices
- [ ] Canonical ↔ AMP link tags are correctly set

---

## Removal

To remove AMP pages from Google Search:
- Remove the `<link rel="amphtml">` tag from the canonical page.
- Return a 404 for the AMP URL.
- Remove the AMP page from the sitemap.
