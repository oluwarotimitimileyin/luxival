# Plan: Apply Apple-Style Glass Icon Neon Effect to All Cards and Buttons

## Current State
- `services.html` has the full Apple-style glass icon tiles with rotating neon rings implemented inline
- Other pages (luxury-lapland.html, about.html, tourism.html, portfolio.html, etc.) use simpler card components without the icon effect
- The neon effect CSS is duplicated inline in each page's `<style>` block

## Goals
1. Extract reusable `.glass-icon` and neon ring CSS into `css/styles.css`
2. Add unique icons with purple rotating neon effects to all card elements across the site
3. Ensure consistent styling for buttons with matching accent colors

## Affected Files

### Pages with `.card` elements needing icons:
- `luxury-lapland.html` - lines 121-123, 147-149 (`.card` in grid-3)
- `about.html` - lines 251-280 (`.card` in grid-3)

### Pages with `.feature` elements needing icons:
- `tourism.html` - lines 315-403 (`.feature` in grid-3)

### Pages with `.dest-card` elements needing icons:
- `tourism.html` - lines 422-501+ (`.dest-card` in dest-grid)

### Pages with `.season-card` elements:
- `tourism.html` - lines 253-304 (`.season-card`)
- `finland-winter-travel.html` - inline styles

### Pages with `.proj` elements:
- `portfolio.html` - lines 159-258 (`.proj` in grid-6)

### Service pages in `/services/`:
- `services/web-design.html`, `services/ai-agents.html`, etc. - check for cards

## Implementation Approach

### Step 1: Add reusable CSS to `css/styles.css`
Add the following component styles:
```css
.glass-icon {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  margin-bottom: 1.2rem;
  display: grid;
  place-items: center;
  position: relative;
  background: linear-gradient(145deg, rgba(255,255,255,.16), rgba(255,255,255,.04));
  border: 1px solid rgba(255,255,255,.14);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.18), 0 18px 44px rgba(0,0,0,.38);
  overflow: hidden;
}

.glass-icon::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: conic-gradient(from 0deg, transparent 0 58%, var(--icon-accent-1, rgba(168,85,247,.12)), var(--icon-accent-2, #a855f7), var(--icon-accent-3, rgba(168,85,247,.45)), var(--icon-accent-1), transparent 86%);
  animation: neonSpin 3.8s linear infinite;
  filter: blur(.2px);
}

.glass-icon::after {
  content: '';
  position: absolute;
  inset: 2px;
  border-radius: 12px;
  background: linear-gradient(145deg, #1a1c28, #0c0d14);
}

.glass-icon svg {
  position: relative;
  z-index: 1;
  width: 27px;
  height: 27px;
  fill: none;
  stroke: var(--icon-color, color-mix(in srgb, var(--accent) 44%, white));
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 8px var(--icon-glow, rgba(168,85,247,.34)));
}

.glass-icon.neon-enhanced {
  box-shadow: inset 0 1px 0 rgba(255,255,255,.2), 0 0 24px var(--icon-glow), 0 18px 44px rgba(0,0,0,.42);
}

@keyframes neonSpin {
  to { transform: rotate(360deg); }
}
```

### Step 2: Update card components to include icons
For each card type, add a preceding `.glass-icon` element with appropriate:
- Unique SVG icon
- CSS custom properties for `--icon-accent-1`, `--icon-accent-2`, `--icon-accent-3`, `--icon-glow`, `--icon-color`

### Step 3: Apply specific icon colors per page/section
- Digital/Tech services: purple tones (#a855f7)
- Tourism services: cyan/blue tones (#22d3ee, #0ea5e9)
- QA/testing: teal/green tones (#14b8a6, #22c55e)
- Travel: orange/red tones (#fb923c, #f59e0b)

### Step 4: Verify buttons have matching accent colors
Update `.btn` hover states in pages to match their card's neon glow colors

## Validation
- Run `npm run build` to ensure no CSS conflicts
- Visually verify all cards show the neon effect
- Test responsive behavior on mobile