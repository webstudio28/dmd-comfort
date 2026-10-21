const fs = require("fs");
const path = require("path");

/** Services that get a `/uslugi/{slug}/` page. External `href` entries stay on their own URL. */
module.exports = function () {
  const services = JSON.parse(fs.readFileSync(path.join(__dirname, "services.json"), "utf8"));
  const bySlug = new Map(services.map((service) => [service.slug, service]));

  return services
    .filter((service) => !service.href)
    .map((service) => {
      const parent = service.parentSlug ? bySlug.get(service.parentSlug) : null;
      return {
        ...service,
        parentTitle: parent ? parent.title : "",
        parentUrl: parent ? `/uslugi/${parent.slug}/` : "",
        subcategoryCards: (service.menuChildren || [])
          .map((child) => bySlug.get(child.slug))
          .filter(Boolean),
      };
    });
};
