"""
Playwright-based website scanner for Luxival Audit Platform.
Runs real Chromium browser; extracts SEO, performance, accessibility, security signals.
"""
import asyncio
import re
from typing import Dict, Any, List
from playwright.async_api import async_playwright, Page, BrowserContext

from models import CheckResult, FlowResult


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------

def _check(cid: str, label: str, passed: bool, detail: str, warn: bool = False) -> CheckResult:
    status = "pass" if passed else ("warn" if warn else "fail")
    return CheckResult(id=cid, label=label, status=status, detail=detail, score=1 if passed else 0)


# ---------------------------------------------------------------------------
# FREE SCAN — 12 checks using real browser DOM
# ---------------------------------------------------------------------------

async def run_free_scan(url: str) -> Dict[str, Any]:
    results: List[CheckResult] = []
    meta: Dict[str, Any] = {}

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
        context: BrowserContext = await browser.new_context(
            user_agent="Mozilla/5.0 (compatible; LuxivalAuditBot/1.0)",
            viewport={"width": 1280, "height": 800},
        )
        page: Page = await context.new_page()

        try:
            resp = await page.goto(url, wait_until="domcontentloaded", timeout=30000)
            status_code = resp.status if resp else 0
        except Exception as e:
            await browser.close()
            raise RuntimeError(f"Could not load {url}: {e}")

        # --- collect DOM data ---
        title = await page.title()
        meta_desc = await page.evaluate("() => document.querySelector('meta[name=description]')?.content || ''")
        h1s = await page.evaluate("() => [...document.querySelectorAll('h1')].map(e=>e.innerText.trim())")
        h2s = await page.evaluate("() => document.querySelectorAll('h2').length")
        og_title = await page.evaluate("() => document.querySelector('meta[property=\"og:title\"]')?.content || ''")
        og_desc = await page.evaluate("() => document.querySelector('meta[property=\"og:description\"]')?.content || ''")
        og_img = await page.evaluate("() => document.querySelector('meta[property=\"og:image\"]')?.content || ''")
        canonical = await page.evaluate("() => document.querySelector('link[rel=canonical]')?.href || ''")
        lang = await page.evaluate("() => document.documentElement.lang || ''")
        viewport_meta = await page.evaluate("() => !!document.querySelector('meta[name=viewport]')")
        imgs_missing_alt = await page.evaluate(
            "() => [...document.querySelectorAll('img')].filter(i => !i.alt).length"
        )
        total_imgs = await page.evaluate("() => document.querySelectorAll('img').length")
        final_url = page.url

        await browser.close()

    # --- build checks ---
    t_len = len(title)
    results.append(_check("title_len", "Title tag length",
        30 <= t_len <= 60, f"'{title}' ({t_len} chars — ideal 30–60)"))

    d_len = len(meta_desc)
    results.append(_check("meta_desc", "Meta description",
        120 <= d_len <= 160, f"{d_len} chars — ideal 120–160"))

    results.append(_check("h1_single", "Single H1 tag",
        len(h1s) == 1, f"Found {len(h1s)} H1(s)"))

    results.append(_check("h2_present", "H2 headings present",
        h2s > 0, f"{h2s} H2 tag(s) found"))

    results.append(_check("og_title", "OG title tag",
        bool(og_title), og_title or "Missing"))

    results.append(_check("og_desc", "OG description",
        bool(og_desc), og_desc[:80] + "…" if len(og_desc) > 80 else og_desc or "Missing"))

    results.append(_check("og_img", "OG image",
        bool(og_img), og_img or "Missing"))

    results.append(_check("canonical", "Canonical tag",
        bool(canonical), canonical or "Missing"))

    results.append(_check("https", "HTTPS enabled",
        final_url.startswith("https://"), final_url))

    alt_ok = imgs_missing_alt == 0
    results.append(_check("img_alt", "Image alt text",
        alt_ok, f"{imgs_missing_alt}/{total_imgs} images missing alt"))

    results.append(_check("lang_attr", "HTML lang attribute",
        bool(lang), f'lang="{lang}"' if lang else "Missing lang attribute"))

    results.append(_check("viewport", "Viewport meta tag",
        viewport_meta, "Present" if viewport_meta else "Missing"))

    score = sum(c.score for c in results)
    meta = {"title": title, "url": final_url, "status_code": status_code}
    return {"checks": results, "score": score, "max_score": 12, "meta": meta}


# ---------------------------------------------------------------------------
# PREMIUM SCAN — 7 flows using real Playwright data
# ---------------------------------------------------------------------------

async def run_premium_scan(url: str) -> List[FlowResult]:
    flows: List[FlowResult] = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (compatible; LuxivalAuditBot/1.0)",
            viewport={"width": 1280, "height": 800},
        )
        page = await context.new_page()
        await page.goto(url, wait_until="networkidle", timeout=45000)

        # FLOW 1 — SEO deep dive
        flows.append(await _flow_seo(page))
        # FLOW 2 — Performance (via CDP metrics)
        flows.append(await _flow_performance(page, context))
        # FLOW 3 — Mobile
        await page.close()
        mobile_page = await context.new_page()
        await mobile_page.set_viewport_size({"width": 375, "height": 812})
        await mobile_page.goto(url, wait_until="domcontentloaded", timeout=30000)
        flows.append(await _flow_mobile(mobile_page))
        await mobile_page.close()
        # FLOW 4–7 on desktop
        desktop_page = await context.new_page()
        await desktop_page.goto(url, wait_until="domcontentloaded", timeout=30000)
        flows.append(await _flow_accessibility(desktop_page))
        flows.append(await _flow_security(desktop_page))
        flows.append(await _flow_social(desktop_page))
        flows.append(await _flow_schema(desktop_page))
        await browser.close()

    return flows


async def _flow_seo(page: Page) -> FlowResult:
    checks: List[CheckResult] = []

    robots = await page.evaluate(
        "() => document.querySelector('meta[name=robots]')?.content || 'not set'"
    )
    checks.append(_check("robots_meta", "Robots meta tag", "noindex" not in robots.lower(),
        f'content="{robots}"'))

    h_tags = await page.evaluate(
        "() => ['h1','h2','h3','h4'].reduce((a,t)=>{a[t]=document.querySelectorAll(t).length;return a},{})"
    )
    hierarchy_ok = h_tags.get("h1", 0) >= 1 and h_tags.get("h2", 0) >= 1
    checks.append(_check("heading_hierarchy", "Heading hierarchy", hierarchy_ok,
        f"H1:{h_tags.get('h1',0)} H2:{h_tags.get('h2',0)} H3:{h_tags.get('h3',0)}"))

    internal_links = await page.evaluate(
        "() => [...document.querySelectorAll('a[href]')].filter(a=>!a.href.startsWith('http')||a.href.includes(location.hostname)).length"
    )
    checks.append(_check("internal_links", "Internal links", internal_links >= 3,
        f"{internal_links} internal links found"))

    word_count = await page.evaluate(
        "() => document.body.innerText.trim().split(/\\s+/).length"
    )
    checks.append(_check("word_count", "Content word count", word_count >= 300,
        f"{word_count} words (aim for 300+)"))

    score = sum(c.score for c in checks)
    return FlowResult(flow_id="seo", flow_name="SEO Deep Dive",
        score=score, max_score=len(checks), checks=checks)


async def _flow_performance(page: Page, context: BrowserContext) -> FlowResult:
    checks: List[CheckResult] = []

    metrics = await page.evaluate("() => JSON.stringify(window.performance.timing)")
    import json
    t = json.loads(metrics)
    load_time_ms = t.get("loadEventEnd", 0) - t.get("navigationStart", 1)

    checks.append(_check("load_time", "Page load time", load_time_ms < 3000,
        f"{load_time_ms}ms (target < 3000ms)"))

    resource_count = await page.evaluate(
        "() => performance.getEntriesByType('resource').length"
    )
    checks.append(_check("resource_count", "Resource requests", resource_count < 80,
        f"{resource_count} requests (aim < 80)"))

    render_blocking = await page.evaluate(
        "() => [...document.querySelectorAll('link[rel=stylesheet], script:not([async]):not([defer])')].length"
    )
    checks.append(_check("render_blocking", "Render-blocking resources",
        render_blocking < 5, f"{render_blocking} blocking resources"))

    score = sum(c.score for c in checks)
    return FlowResult(flow_id="performance", flow_name="Performance",
        score=score, max_score=len(checks), checks=checks)


async def _flow_mobile(page: Page) -> FlowResult:
    checks: List[CheckResult] = []

    viewport_meta = await page.evaluate("() => !!document.querySelector('meta[name=viewport]')")
    checks.append(_check("mob_viewport", "Viewport meta tag", viewport_meta,
        "Present" if viewport_meta else "Missing"))

    touch_icon = await page.evaluate(
        "() => !!document.querySelector('link[rel*=\"apple-touch-icon\"], link[rel*=\"icon\"]')"
    )
    checks.append(_check("mob_icon", "Touch icon / favicon", touch_icon,
        "Found" if touch_icon else "No touch icon"))

    font_sizes = await page.evaluate(
        "() => [...document.querySelectorAll('p,li,span')].map(e=>parseFloat(getComputedStyle(e).fontSize)).filter(Boolean)"
    )
    small_text = sum(1 for s in font_sizes if s < 12)
    checks.append(_check("mob_font", "Readable font sizes", small_text == 0,
        f"{small_text} elements with font < 12px"))

    score = sum(c.score for c in checks)
    return FlowResult(flow_id="mobile", flow_name="Mobile Optimisation",
        score=score, max_score=len(checks), checks=checks)


async def _flow_accessibility(page: Page) -> FlowResult:
    checks: List[CheckResult] = []

    imgs_no_alt = await page.evaluate(
        "() => [...document.querySelectorAll('img')].filter(i=>!i.alt).length"
    )
    checks.append(_check("a11y_alt", "All images have alt text", imgs_no_alt == 0,
        f"{imgs_no_alt} images missing alt"))

    lang = await page.evaluate("() => document.documentElement.lang || ''")
    checks.append(_check("a11y_lang", "HTML lang attribute", bool(lang),
        f'lang="{lang}"' if lang else "Missing"))

    unlabelled_inputs = await page.evaluate(
        "() => [...document.querySelectorAll('input,textarea,select')].filter(i=>!i.labels?.length && !i.getAttribute('aria-label') && !i.getAttribute('aria-labelledby')).length"
    )
    checks.append(_check("a11y_labels", "Form inputs labelled", unlabelled_inputs == 0,
        f"{unlabelled_inputs} unlabelled inputs"))

    aria_roles = await page.evaluate("() => document.querySelectorAll('[role]').length")
    checks.append(_check("a11y_aria", "ARIA roles used", aria_roles > 0,
        f"{aria_roles} elements with ARIA roles"))

    skip_link = await page.evaluate(
        "() => !!document.querySelector('a[href=\"#main\"],a[href=\"#content\"],a[class*=\"skip\"]')"
    )
    checks.append(_check("a11y_skip", "Skip-to-content link", skip_link,
        "Found" if skip_link else "Missing"))

    score = sum(c.score for c in checks)
    return FlowResult(flow_id="accessibility", flow_name="Accessibility",
        score=score, max_score=len(checks), checks=checks)


async def _flow_security(page: Page) -> FlowResult:
    checks: List[CheckResult] = []

    final_url = page.url
    checks.append(_check("sec_https", "HTTPS", final_url.startswith("https://"), final_url))

    mixed = await page.evaluate(
        "() => [...document.querySelectorAll('[src],[href]')].filter(e=>(e.src||e.href||'').startsWith('http://')).length"
    )
    checks.append(_check("sec_mixed", "No mixed content", mixed == 0,
        f"{mixed} HTTP resources on HTTPS page" if mixed else "Clean"))

    iframes = await page.evaluate("() => document.querySelectorAll('iframe').length")
    checks.append(_check("sec_iframes", "Iframe usage", iframes < 3,
        f"{iframes} iframes found"))

    ext_scripts = await page.evaluate(
        "() => [...document.querySelectorAll('script[src]')].filter(s=>!s.src.includes(location.hostname)).length"
    )
    checks.append(_check("sec_ext_scripts", "External scripts", ext_scripts < 10,
        f"{ext_scripts} external scripts"))

    score = sum(c.score for c in checks)
    return FlowResult(flow_id="security", flow_name="Security",
        score=score, max_score=len(checks), checks=checks)


async def _flow_social(page: Page) -> FlowResult:
    checks: List[CheckResult] = []
    for tag, prop, name in [
        ("og:title", "property", "OG title"),
        ("og:description", "property", "OG description"),
        ("og:image", "property", "OG image"),
        ("twitter:card", "name", "Twitter card"),
        ("twitter:title", "name", "Twitter title"),
    ]:
        val = await page.evaluate(
            f"() => document.querySelector('meta[{prop}=\"{tag}\"]')?.content || ''"
        )
        cid = tag.replace(":", "_")
        checks.append(_check(cid, name, bool(val), val[:80] if val else "Missing"))

    score = sum(c.score for c in checks)
    return FlowResult(flow_id="social", flow_name="Social / Open Graph",
        score=score, max_score=len(checks), checks=checks)


async def _flow_schema(page: Page) -> FlowResult:
    checks: List[CheckResult] = []

    json_ld = await page.evaluate(
        "() => [...document.querySelectorAll('script[type=\"application/ld+json\"]')].map(s=>{try{return JSON.parse(s.textContent)}catch{return null}}).filter(Boolean)"
    )
    checks.append(_check("schema_present", "JSON-LD schema present", len(json_ld) > 0,
        f"{len(json_ld)} JSON-LD block(s) found"))

    schema_types = [s.get("@type", "") for s in json_ld if isinstance(s, dict)]
    checks.append(_check("schema_types", "Schema @type defined",
        any(schema_types), ", ".join(schema_types) if schema_types else "None"))

    breadcrumb = any("BreadcrumbList" in str(s) for s in json_ld)
    checks.append(_check("schema_breadcrumb", "Breadcrumb schema",
        breadcrumb, "Found" if breadcrumb else "Not found"))

    score = sum(c.score for c in checks)
    return FlowResult(flow_id="schema", flow_name="Structured Data / Schema",
        score=score, max_score=len(checks), checks=checks)
