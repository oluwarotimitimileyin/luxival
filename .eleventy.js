module.exports = function (eleventyConfig) {
  function removeUngatedSpeedInsights(html) {
    return html
      .replace(/\s*<!-- Vercel Speed Insights -->\s*/gi, "\n")
      .replace(/\s*<script>\s*window\.si\s*=\s*window\.si\s*\|\|\s*function\s*\(\)\s*\{\s*\(window\.siq\s*=\s*window\.siq\s*\|\|\s*\[\]\)\.push\(arguments\);?\s*\};?\s*<\/script>\s*/gi, "\n")
      .replace(/\s*<script>\s*window\.si\s*=\s*window\.si\s*\|\|\s*function\s*\(\)\s*\{\s*\(window\.siq\s*=\s*window\.siq\s*\|\|\s*\[\]\)\.push\(arguments\)\s*\};?\s*<\/script>\s*/gi, "\n")
      .replace(/\s*<script[^>]+src=["']\/_vercel\/speed-insights\/script\.js["'][^>]*><\/script>\s*/gi, "\n");
  }

  function injectConsentScript(html) {
    if (html.includes("/js/consent-manager.js")) return html;
    if (/<\/body>/i.test(html)) {
      return html.replace(/<\/body>/i, '  <script src="/js/consent-manager.js?v=20260622-2" defer></script>\n</body>');
    }
    return html;
  }

  function injectChatWidget(html) {
    if (html.includes("/js/chat-widget.js")) return html;
    if (/<\/body>/i.test(html)) {
      return html.replace(/<\/body>/i, '  <script src="/js/chat-widget.js?v=20260622-1" defer></script>\n</body>');
    }
    return html;
  }

  function injectI18nScript(html) {
    if (!html.includes("/js/navbar.js")) return html;
    if (html.includes("/js/i18n.js")) return html;
    if (/<script[^>]+src=["']\/js\/navbar\.js["'][^>]*><\/script>/i.test(html)) {
      return html.replace(/<script([^>]+)src=["']\/js\/navbar\.js["']([^>]*)><\/script>/i, '<script src="/js/i18n.js?v=20260603-1" defer></script>\n<script$1src="/js/navbar.js"$2></script>');
    }
    return html;
  }

  function injectNavConfig(html) {
    if (html.includes("/js/nav-config.js")) return html;
    if (/<\/head>/i.test(html)) {
      return html.replace(/<\/head>/i, '<script src="/js/nav-config.js?v=20260703-1" defer></script>\n</head>');
    }
    return html;
  }

  function versionNavbarJs(html) {
    if (!html.includes("/js/navbar.js")) return html;
    return html.replace(
      /src=["']\/js\/navbar\.js["']/gi,
      'src="/js/navbar.js?v=20260703-1"'
    );
  }

  function injectPageTranslate(html) {
    if (html.includes("/js/page-translate.js")) return html;
    if (/<\/body>/i.test(html)) {
      return html.replace(/<\/body>/i, '  <script src="/js/page-translate.js?v=20260625-1" defer></script>\n</body>');
    }
    return html;
  }

  function injectDiscoverMeta(html) {
    if (html.includes("max-image-preview")) return html;
    if (/<\/head>/i.test(html)) {
      html = html.replace(/<\/head>/i, '<meta name="robots" content="max-image-preview:large">\n</head>');
    }
    return html;
  }

  function injectSoftUiStyles(html) {
    if (html.includes("/css/soft-ui.css")) return html;
    if (/<\/head>/i.test(html)) {
      return html.replace(/<\/head>/i, '<link rel="stylesheet" href="/css/soft-ui.css?v=20260622-1" media="print" onload="this.media=\'all\'">\n</head>');
    }
    return html;
  }

  function injectMobileOverrides(html) {
    if (html.includes("/css/mobile-overrides.css")) return html;
    if (/<\/head>/i.test(html)) {
      html = html.replace(/<\/head>/i, '<link rel="stylesheet" href="/css/mobile-overrides.css?v=20260703-1" media="(max-width: 820px)">\n</head>');
    }
    return html;
  }

  function injectSpeechReader(html) {
    if (html.includes("/js/speech-reader.js")) return html;
    if (/<\/head>/i.test(html)) {
      html = html.replace(/<\/head>/i, '<link rel="stylesheet" href="/css/speech-reader.css?v=20260630-1" media="print" onload="this.media=\'all\'">\n</head>');
    }
    if (/<\/body>/i.test(html)) {
      html = html.replace(/<\/body>/i, '  <script src="/js/speech-reader.js?v=20260630-1" defer></script>\n</body>');
    }
    return html;
  }

  eleventyConfig.addTransform("consent-manager", function(content, outputPath) {
    if (!outputPath || !outputPath.endsWith(".html")) return content;
    if (outputPath.includes("/amp/")) return content;
    return versionNavbarJs(injectNavConfig(injectI18nScript(injectPageTranslate(injectSpeechReader(injectChatWidget(injectConsentScript(injectMobileOverrides(injectSoftUiStyles(injectDiscoverMeta(removeUngatedSpeedInsights(content)))))))))));
  });

  eleventyConfig.addPassthroughCopy({ i18n: "i18n" });
  eleventyConfig.addPassthroughCopy({ assets: "assets" });
  eleventyConfig.addPassthroughCopy({ css: "css" });
  eleventyConfig.addPassthroughCopy({ js: "js" });
  eleventyConfig.addPassthroughCopy({
    "portfolio/esg-compliance-auditor/frontend/dist": "portfolio/esg-compliance-auditor/frontend/dist"
  });
  eleventyConfig.addPassthroughCopy({
    "portfolio/growth-architect/frontend/dist": "portfolio/growth-architect/frontend/dist"
  });
  eleventyConfig.addPassthroughCopy({
    "portfolio/businesslauncher/frontend/dist": "portfolio/businesslauncher/frontend/dist"
  });
  eleventyConfig.addPassthroughCopy({
    "portfolio/ugc-studio-ai/frontend/dist": "portfolio/ugc-studio-ai/frontend/dist"
  });
  eleventyConfig.addPassthroughCopy({
    "portfolio/vortex-ai-platform/frontend/dist": "portfolio/vortex-ai-platform/frontend/dist"
  });
  eleventyConfig.addPassthroughCopy({
    "portfolio/autonomous-qa-audit-dashboard/frontend/dist": "portfolio/autonomous-qa-audit-dashboard/frontend/dist"
  });
  // auraframe/frontend/dist is gitignored (contains baked-in API keys)
  eleventyConfig.addPassthroughCopy({
    "portfolio/finnish-business-intelligence/frontend/dist": "portfolio/finnish-business-intelligence/frontend/dist"
  });
  eleventyConfig.addPassthroughCopy({ "blog/images": "blog/images" });
  eleventyConfig.addPassthroughCopy({ "robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "llms.txt": "llms.txt" });
  eleventyConfig.addPassthroughCopy({ "llms-full.txt": "llms-full.txt" });
  eleventyConfig.addPassthroughCopy({ "sitemap.xml": "sitemap.xml" });
  eleventyConfig.addPassthroughCopy({ "6292d286853d4847b71d0f2b76c30dbc.txt": "6292d286853d4847b71d0f2b76c30dbc.txt" });
  eleventyConfig.addPassthroughCopy({ "favicon.svg": "favicon.svg" });
  eleventyConfig.addPassthroughCopy({ "favicon.ico": "favicon.ico" });
  eleventyConfig.addPassthroughCopy({ "favicon-16x16.png": "favicon-16x16.png" });
  eleventyConfig.addPassthroughCopy({ "favicon-32x32.png": "favicon-32x32.png" });
  eleventyConfig.addPassthroughCopy({ "favicon-48x48.png": "favicon-48x48.png" });
  eleventyConfig.addPassthroughCopy({ "apple-touch-icon.png": "apple-touch-icon.png" });
  eleventyConfig.addPassthroughCopy({ "android-chrome-192x192.png": "android-chrome-192x192.png" });
  eleventyConfig.addPassthroughCopy({ "android-chrome-512x512.png": "android-chrome-512x512.png" });
  eleventyConfig.addPassthroughCopy({ "site.webmanifest": "site.webmanifest" });
  eleventyConfig.addFilter("date", (dateObj) => {
    const date = new Date(dateObj);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return date.toISOString().split("T")[0];
  });
  eleventyConfig.addFilter("canonicalPath", (url) => {
    if (!url || url === "/") {
      return "/";
    }
    return url.replace(/\/index\.html$/, "").replace(/\/$/, "");
  });

  return {
    dir: {
      input: ".",
      includes: "blog/_includes",
      layouts: "blog/_includes/layouts",
      output: "_site"
    },
    templateFormats: ["html", "md", "njk"],
    ignore: [
      ".kilo/**",
      ".agents/**",
      ".claude/**",
      ".git/**"
    ]
  };
};
