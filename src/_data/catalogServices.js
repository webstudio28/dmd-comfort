const fs = require("fs");
const path = require("path");

/** Main services only. Sub-services stay on their parent page. */
module.exports = function () {
  const services = JSON.parse(fs.readFileSync(path.join(__dirname, "services.json"), "utf8"));
  return services.filter((service) => !service.parentSlug);
};
