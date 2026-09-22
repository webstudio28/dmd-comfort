module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.png": "favicon.png" });

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
