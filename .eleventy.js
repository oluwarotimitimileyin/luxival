module.exports = function (eleventyConfig) {
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
  eleventyConfig.addPassthroughCopy({ "blog/images": "blog/images" });
  eleventyConfig.addPassthroughCopy({ "robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "sitemap.xml": "sitemap.xml" });
  eleventyConfig.addPassthroughCopy({ "favicon.svg": "favicon.svg" });
  eleventyConfig.addPassthroughCopy({ "favicon.ico": "favicon.ico" });
  eleventyConfig.addPassthroughCopy({ "favicon-16x16.png": "favicon-16x16.png" });
  eleventyConfig.addPassthroughCopy({ "favicon-32x32.png": "favicon-32x32.png" });
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
    templateFormats: ["html", "md", "njk"]
  };
};
