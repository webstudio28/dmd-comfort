const services = require("./services.json");

/** Services that still get a `/uslugi/{slug}/` detail page (not an external href). */
module.exports = services.filter((s) => !s.href);
