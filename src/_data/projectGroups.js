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

  const groups = [];
  for (const service of services) {
    const items = buckets.get(service.slug);
    if (!items || !items.length) continue;
    groups.push({
      slug: service.slug,
      title: service.title,
      href: `/proekti/usluga/${service.slug}/`,
      image: items[0].images[0],
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
      image: others[0].images[0],
      count: others.length,
      countLabel: countLabel(others.length),
      projects: others,
    });
  }

  return groups;
};
