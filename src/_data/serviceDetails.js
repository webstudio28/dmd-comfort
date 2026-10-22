const fs = require("fs");
const path = require("path");

const PROJECTS_PREVIEW = 8;

/** Keep menu identities separate from the approved, keyword-led page content. */
module.exports = function () {
  const services = JSON.parse(fs.readFileSync(path.join(__dirname, "services.json"), "utf8"));
  const content = JSON.parse(fs.readFileSync(path.join(__dirname, "serviceContent.json"), "utf8"));
  const projects = JSON.parse(fs.readFileSync(path.join(__dirname, "projects.json"), "utf8"));
  const bySlug = new Map(services.map(service => [service.slug, service]));
  const card = slug => {
    const item = bySlug.get(slug);
    if (!item) throw new Error(`Unknown related service: ${slug}`);
    return {...item, url: item.href || `/uslugi/${item.slug}/`, summary: content[slug]?.description || item.shortDescription || item.title};
  };

  const projectsForService = (service) => {
    const matchSlugs = new Set([
      service.slug,
      ...(service.menuChildren || []).map((child) => child.slug),
    ]);
    const seen = new Set();
    const matched = [];
    for (const project of projects) {
      if (seen.has(project.slug)) continue;
      const tags = project.serviceSlugs || [];
      if (!tags.some((slug) => matchSlugs.has(slug))) continue;
      seen.add(project.slug);
      matched.push({
        title: project.title,
        text: project.location || project.objectType || project.shortDescription,
        summary: project.shortDescription,
        url: `/proekti/${project.slug}/`,
        image: project.images?.[0] || null,
        imageAlt: project.title,
        imageMissing: !project.images?.[0],
      });
    }
    return matched;
  };

  return services.filter(service => !service.href).map(service => {
    const copy = content[service.slug];
    if (!copy) throw new Error(`Missing approved service content: ${service.slug}`);
    const parent = service.parentSlug ? bySlug.get(service.parentSlug) : null;
    const relatedProjects = projectsForService(service);
    return {
      ...service,
      copy,
      parentTitle: parent?.title || "",
      parentUrl: parent ? `/uslugi/${parent.slug}/` : "",
      subcategoryCards: (service.menuChildren || []).map(child => card(child.slug)),
      relatedServices: (copy.relatedSlugs || []).map(card),
      relatedProjects: relatedProjects.slice(0, PROJECTS_PREVIEW),
      projectsMoreUrl: relatedProjects.length ? `/proekti/usluga/${service.slug}/` : "",
      projectsTotal: relatedProjects.length,
    };
  });
};
