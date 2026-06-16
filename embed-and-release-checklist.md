# Embed and Release Checklist

Use this checklist whenever you need to add an iframe or similar embedded component and ship safely.

## 1) Scope Lock
- Confirm exact target pages.
- Confirm exact insertion point on each page.
- Confirm whether existing widgets must remain unchanged.
- Confirm responsive behavior expectations on desktop and mobile.

## 2) Preflight
- Verify you are editing source files, not generated output in _site.
- Identify shared stylesheet for reusable embed styles.
- Check for existing section IDs and JS hooks to avoid breaking selectors.
- Ensure embed URL and required iframe attributes are final.

## 3) Implementation
- Add reusable CSS classes first (container, title, frame).
- Add the embed block in each target page at agreed insertion points.
- Preserve existing IDs, name attributes, and JS-powered containers.
- Keep changes minimal and consistent across pages.

## 4) Build and Validate
- Run: npm run build
- Confirm no build errors.
- Validate generated output includes embed URL in all target pages under _site.
- Check responsive behavior quickly at common breakpoints (for example 390px, 768px, 1280px).

## 5) Diagnostics
- Run editor diagnostics on edited files.
- Resolve any issues introduced by the change.
- Rebuild after fixes.

## 6) Git Hygiene
- Stage only intended files.
- Review staged diff before commit.
- Commit with a scoped message naming affected pages.
- Confirm branch and status before push.

## 7) Push and Deploy
- Push to remote branch.
- Deploy to production target.
- If push or deploy fails in sandbox due to network restrictions, retry unsandboxed.
- Capture final deployment URL and alias confirmation.

## 8) Post-Deploy Smoke Test
- Open each live target page.
- Confirm iframe loads and is visible in intended location.
- Confirm surrounding booking or planner flows still function.
- Confirm no layout overlap or clipping on mobile.

## 9) Closeout Template
- What changed:
  - Files edited
  - Insertion points
  - Shared CSS classes added
- Verification performed:
  - Build result
  - Generated output checks
  - Diagnostics status
- Release result:
  - Commit hash
  - Push status
  - Production URL
- Notes:
  - Any unrelated local changes intentionally left untouched
