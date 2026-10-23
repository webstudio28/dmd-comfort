const fs = require("fs");
const path = require("path");

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, name), "utf8"));
}

function countLabel(count) {
  return count === 1 ? "1 проект" : `${count} проекта`;
}

module.exports = function () {
  const services = readJson("services.json");
  const projects = readJson("projects.json");
  const coverProjects = readJson("projectGroupCovers.json");
  const coverImage = (slug, items) =>
    (items.find((project) => project.slug === coverProjects[slug]) || items[0]).images[0];
  const bySlug = new Map(services.map((service) => [service.slug, service]));
  const buckets = new Map();
  const others = [];

  for (const project of projects) {
    const matched = (project.serviceSlugs || []).filter((slug) => bySlug.has(slug));
    if (!matched.length) {
      others.push(project);
      continue;
    }
    for (const slug of matched) {
      if (!buckets.has(slug)) buckets.set(slug, []);
      buckets.get(slug).push(project);
    }
  }

  // Hub categories = main services only (parents + standalones). Subservices roll up into their parent.
  const groups = [];
  for (const service of services) {
    if (service.parentSlug) continue;
    const childSlugs = (service.menuChildren || []).map((child) => child.slug);
    const seen = new Set();
    const items = [];
    for (const slug of [service.slug, ...childSlugs]) {
      for (const project of buckets.get(slug) || []) {
        if (seen.has(project.slug)) continue;
        seen.add(project.slug);
        items.push(project);
      }
    }
    if (!items.length) continue;
    groups.push({
      slug: service.slug,
      title: service.title,
      href: `/proekti/usluga/${service.slug}/`,
      image: coverImage(service.slug, items),
      count: items.length,
      countLabel: countLabel(items.length),
      projects: items,
    });
  }

  if (others.length) {
    groups.push({
      slug: "drugi",
      title: "Други",
      href: "/proekti/drugi/",
      image: coverImage("drugi", others),
      count: others.length,
      countLabel: countLabel(others.length),
      projects: others,
    });
  }

  return groups;
};
