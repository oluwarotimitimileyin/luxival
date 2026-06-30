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

  function injectPageTranslate(html) {
    if (html.includes("/js/page-translate.js")) return html;
    if (/<\/body>/i.test(html)) {
      return html.replace(/<\/body>/i, '  <script src="/js/page-translate.js?v=20260625-1" defer></script>\n</body>');
    }
    return html;
  }

  function injectSoftUiStyles(html) {
    if (html.includes("/css/soft-ui.css")) return html;
    if (/<\/head>/i.test(html)) {
      return html.replace(/<\/head>/i, '<link rel="stylesheet" href="/css/soft-ui.css?v=20260622-1">\n</head>');
    }
    return html;
  }

  function injectSpeechReader(html) {
    if (html.includes("/js/speech-reader.js")) return html;
    if (/<\/head>/i.test(html)) {
      html = html.replace(/<\/head>/i, '<link rel="stylesheet" href="/css/speech-reader.css?v=20260630-1">\n</head>');
    }
    if (/<\/body>/i.test(html)) {
      html = html.replace(/<\/body>/i, '  <script src="/js/speech-reader.js?v=20260630-1" defer></script>\n</body>');
    }
    return html;
  }

  eleventyConfig.addTransform("consent-manager", function(content, outputPath) {
    if (!outputPath || !outputPath.endsWith(".html")) return content;
    if (outputPath.includes("/amp/")) return content;
    return injectSpeechReader(injectPageTranslate(injectChatWidget(injectConsentScript(injectSoftUiStyles(removeUngatedSpeedInsights(content))))));
  });

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
  eleventyConfig.addPassthroughCopy({
    "portfolio/auraframe/frontend/dist": "portfolio/auraframe/frontend/dist"
  });
  eleventyConfig.addPassthroughCopy({
    "portfolio/finnish-business-intelligence/frontend/dist": "portfolio/finnish-business-intelligence/frontend/dist"
  });
  eleventyConfig.addPassthroughCopy({ "blog/images": "blog/images" });
  eleventyConfig.addPassthroughCopy({ "robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "llms.txt": "llms.txt" });
  eleventyConfig.addPassthroughCopy({ "llms-full.txt": "llms-full.txt" });
  eleventyConfig.addPassthroughCopy({ "sitemap.xml": "sitemap.xml" });
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
