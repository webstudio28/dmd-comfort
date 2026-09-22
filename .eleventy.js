module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.png": "favicon.png" });

  eleventyConfig.addGlobalData("buildDate", () =>
    new Date().toISOString().slice(0, 10),
  );

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
