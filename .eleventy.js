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
  eleventyConfig.addPassthroughCopy({ "robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "llms.txt": "llms.txt" });
  eleventyConfig.addPassthroughCopy({ "sitemap.xml": "sitemap.xml" });
  eleventyConfig.addPassthroughCopy({ "favicon.svg": "favicon.svg" });
  eleventyConfig.addFilter("date", (dateObj) => {
    const date = new Date(dateObj);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return date.toISOString().split("T")[0];
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
