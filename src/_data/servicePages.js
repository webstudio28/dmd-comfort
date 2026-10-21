const fs = require("fs");
const path = require("path");

/** Keep menu identities separate from the approved, keyword-led page content. */
module.exports = function () {
  const services = JSON.parse(fs.readFileSync(path.join(__dirname, "services.json"), "utf8"));
  const content = JSON.parse(fs.readFileSync(path.join(__dirname, "serviceContent.json"), "utf8"));
  const bySlug = new Map(services.map(service => [service.slug, service]));
  const card = slug => {
    const item = bySlug.get(slug);
    if (!item) throw new Error(`Unknown related service: ${slug}`);
    return {...item, url: item.href || `/uslugi/${item.slug}/`, summary: content[slug]?.description || item.shortDescription || item.title};
  };

  return services.filter(service => !service.href).map(service => {
    const copy = content[service.slug];
    if (!copy) throw new Error(`Missing approved service content: ${service.slug}`);
    const parent = service.parentSlug ? bySlug.get(service.parentSlug) : null;
    return {
      ...service,
      copy,
      parentTitle: parent?.title || "",
      parentUrl: parent ? `/uslugi/${parent.slug}/` : "",
      subcategoryCards: (service.menuChildren || []).map(child => card(child.slug)),
      relatedServices: (copy.relatedSlugs || []).map(card),
    };
  });
};
