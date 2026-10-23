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
    const byGroupSlug = new Map(groups.map((group) => [group.slug, group]));
    const services = servicesBySlugMap();
    const projects = JSON.parse(
      fs.readFileSync(path.join(__dirname, "src/_data/projects.json"), "utf8"),
    );
    projectGroupBySlugCache = new Map();

    for (const project of projects) {
      let group = null;
      for (const serviceSlug of project.serviceSlugs || []) {
        const service = services.get(serviceSlug);
        if (!service) continue;
        const hubSlug = service.parentSlug || service.slug;
        group = byGroupSlug.get(hubSlug) || null;
        if (group) break;
      }
      if (!group) {
        group = byGroupSlug.get("drugi") || null;
      }
      if (group) {
        projectGroupBySlugCache.set(project.slug, {
          title: group.title,
          href: group.href,
          slug: group.slug,
        });
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

  // Asset provenance documents are internal notes, not public pages.
  eleventyConfig.ignores.add("src/assets/**/*.md");

  // Skip draft folders and superseded heavy originals (WebP/OG replacements are used instead).
  // recursive-copy may pass either a full relative path or a bare filename.
  const skipNames = new Set([
    "sources.md",
    "generated-image.md",
    "pages-bg - copy - copy.png",
    "pages-bg.png",
    "logo.png",
    "hero.jpg",
    "process-bg.jpg",
    "aluminiumievi-navesi.jpg",
    "aluminiumieva-dograma.jpg",
    "pvc-dograma.jpg",
    "vrati.png",
    "obrashtane-s-pvc-profili.png",
    "windows-dec.png",
    "komarnitsi.png",
  ]);
  const skipDirs = [
    "refined-2026-09-22",
    "selected-2026-09-22",
    "window-trim-final",
  ];
  const skipAsset = (srcPath) => {
    const p = String(srcPath).replace(/\\/g, "/").toLowerCase();
    const base = p.split("/").pop();
    if (skipNames.has(base)) return true;
    return skipDirs.some((dir) => p.split("/").includes(dir));
  };

  eleventyConfig.addPassthroughCopy("src/assets", {
    filter: (src) => !skipAsset(src),
  });
  eleventyConfig.addPassthroughCopy({ "src/favicon.png": "favicon.png" });
  eleventyConfig.addPassthroughCopy({ "src/favicon-32.png": "favicon-32.png" });
  eleventyConfig.addPassthroughCopy({ "src/apple-touch-icon.png": "apple-touch-icon.png" });

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

  eleventyConfig.addFilter("relatedProjects", (project, limit = 12) => {
    const slug = project && project.slug;
    if (!slug) return [];
    const groupMeta = projectGroupBySlugMap().get(slug);
    if (!groupMeta) return [];
    const groups = require("./src/_data/projectGroups")();
    const group = groups.find((item) => item.slug === groupMeta.slug);
    if (!group) return [];
    const related = group.projects.filter((item) => item.slug !== slug);
    return typeof limit === "number" ? related.slice(0, limit) : related;
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
