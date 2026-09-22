const path = require("path");
const fs = require("fs");

function loadJson(name) {
  try {
    const full = path.join(__dirname, name);
    // Read fresh each build so nav/config edits aren't stuck in require cache
    return JSON.parse(fs.readFileSync(full, "utf8"));
  } catch {
    return null;
  }
}

const config = loadJson("site.config.json") || {};
const services = loadJson("services.json") || [];

function resolveChildrenFrom(type) {
  if (type === "services") {
    return services.map((s) => ({
      label: s.title,
      url: `/uslugi/${s.slug}/`,
      image: s.image || null,
    }));
  }
  return [];
}

function resolveNavHeader(header) {
  if (!Array.isArray(header)) return [];
  return header.map((item) => {
    const { childrenFrom, ...rest } = item;
    const out = { ...rest };

    if (Array.isArray(item.children) && item.children.length) {
      out.children = item.children;
      return out;
    }

    if (childrenFrom) {
      out.children = resolveChildrenFrom(childrenFrom);
      return out;
    }

    return out;
  });
}

module.exports = {
  ...config,
  currentYear: new Date().getFullYear(),
  nav: {
    ...config.nav,
    header: resolveNavHeader(config.nav?.header || []),
  },
};
