const fs = require("fs");
const path = require("path");

const PREVIEW = 8;
const SLUG = "obrashtane-s-pvc-pervazi";

module.exports = function () {
  const projects = JSON.parse(fs.readFileSync(path.join(__dirname, "projects.json"), "utf8"));
  const matched = projects.filter((project) => (project.serviceSlugs || []).includes(SLUG));

  return {
    items: matched.slice(0, PREVIEW).map((project) => ({
      title: project.title,
      location: project.location || project.objectType || "",
      url: `/proekti/${project.slug}/`,
      image: project.images?.[0] || null,
    })),
    total: matched.length,
    moreUrl: matched.length ? `/proekti/usluga/${SLUG}/` : "",
  };
};
