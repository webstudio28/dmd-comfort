const path = require("path");
const fs = require("fs");

function loadJson(name) {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, name), "utf8"));
  } catch {
    return null;
  }
}

function serviceUrl(service) {
  return service.href || `/uslugi/${service.slug}/`;
}

function resolveChildrenFrom(services, type) {
  if (type === "services") {
    const nestedSlugs = new Set(
      services.flatMap((service) =>
        Array.isArray(service.menuChildren) ? service.menuChildren.map((child) => child.slug) : []
      )
    );

    return services
      .filter((service) => !nestedSlugs.has(service.slug))
      .map((service) => ({
        label: service.title,
        url: serviceUrl(service),
        image: service.image && !service.imageMissing ? service.image : null,
        children: Array.isArray(service.menuChildren)
          ? service.menuChildren.map((child) => ({
              label: child.title,
              url: `/uslugi/${child.slug}/`,
            }))
          : [],
      }));
  }
  return [];
}

function resolveNavHeader(services, header, features) {
  if (!Array.isArray(header)) return [];
  return header
    .filter((item) => !item.feature || features?.[item.feature])
    .map((item) => {
      const { childrenFrom, feature, ...rest } = item;
      const out = { ...rest };

      if (Array.isArray(item.children) && item.children.length) {
        out.children = item.children;
        return out;
      }

      if (childrenFrom) {
        out.children = resolveChildrenFrom(services, childrenFrom);
        return out;
      }

      return out;
    });
}

// Function export so Eleventy re-reads config on every build
module.exports = function () {
  const config = loadJson("site.config.json") || {};
  const services = loadJson("services.json") || [];
  const features = { videos: false, ...(config.features || {}) };

  return {
    ...config,
    features,
    currentYear: new Date().getFullYear(),
    nav: {
      ...config.nav,
      header: resolveNavHeader(services, config.nav?.header || [], features),
    },
  };
};
