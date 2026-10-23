const fs = require("fs");
const path = require("path");

let servicesBySlugCache;
let projectGroupBySlugCache;

function servicesBySlugMap() {
  if (!servicesBySlugCache) {
    const file = path.join(__dirname, "src/_data/services.json");
    const all = JSON.parse(fs.readFileSync(file, "utf8"));
    servicesBySlugCache = new Map(all.map((service) => [service.slug, service]));
  }
  return servicesBySlugCache;
}

function projectGroupBySlugMap() {
  if (!projectGroupBySlugCache) {
    const groups = require("./src/_data/projectGroups")();
    projectGroupBySlugCache = new Map();
    for (const group of groups) {
      for (const project of group.projects) {
        if (!projectGroupBySlugCache.has(project.slug)) {
          projectGroupBySlugCache.set(project.slug, {
            title: group.title,
            href: group.href,
            slug: group.slug,
          });
        }
      }
    }
  }
  return projectGroupBySlugCache;
}

module.exports = function (eleventyConfig) {
  // Keep src/videa + videos.json; publish when site.features.videos is true.
  const site = require("./src/_data/site.js")();
  if (!site.features?.videos) {
    eleventyConfig.ignores.add("src/videa/**");
  }

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.png": "favicon.png" });

  eleventyConfig.addFilter("servicesBySlugs", (slugs) => {
    if (!Array.isArray(slugs) || !slugs.length) return [];
    const bySlug = servicesBySlugMap();
    return slugs.map((slug) => bySlug.get(slug)).filter(Boolean);
  });

  eleventyConfig.addFilter("projectGroup", (project) => {
    const slug = typeof project === "string" ? project : project && project.slug;
    if (!slug) return null;
    return projectGroupBySlugMap().get(slug) || null;
  });

  eleventyConfig.addFilter("matchesAnyHref", (pageUrl, hrefs) => {
    if (!pageUrl || !Array.isArray(hrefs)) return false;
    return hrefs.some((href) => href === pageUrl || `${href}/` === pageUrl || href === `${pageUrl}/`);
  });

  eleventyConfig.addGlobalData("buildDate", () =>
    new Date().toISOString().slice(0, 10),
  );

  function youtubeId(url) {
    if (!url) return "";
    try {
      const u = new URL(url);
      if (u.pathname.startsWith("/embed/")) {
        return u.pathname.split("/")[2] || "";
      }
      let id = u.searchParams.get("v");
      if (!id && u.hostname.includes("youtu.be")) {
        id = u.pathname.replace(/^\//, "").split("/")[0];
      }
      if (!id && u.pathname.startsWith("/shorts/")) {
        id = u.pathname.split("/")[2];
      }
      return id || "";
    } catch {
      return "";
    }
  }

  eleventyConfig.addFilter("youtubeId", youtubeId);

  eleventyConfig.addFilter("youtubeEmbed", (url) => {
    const id = youtubeId(url);
    return id ? `https://www.youtube.com/embed/${id}` : url || "";
  });

  const pathPrefix = process.env.PATH_PREFIX || "/";

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
    },
    pathPrefix,
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
