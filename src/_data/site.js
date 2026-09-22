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
    return services.map((s) => ({
      label: s.title,
      url: serviceUrl(s),
      image: s.image || null,
    }));
  }
  return [];
}

function resolveNavHeader(services, header) {
  if (!Array.isArray(header)) return [];
  return header.map((item) => {
    const { childrenFrom, ...rest } = item;
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

  return {
    ...config,
    currentYear: new Date().getFullYear(),
    nav: {
      ...config.nav,
      header: resolveNavHeader(services, config.nav?.header || []),
    },
  };
};
