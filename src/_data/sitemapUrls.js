const services = require("./services.json");
const projects = require("./projects.json");
const blog = require("./blog.json");
const videos = require("./videos.json");

module.exports = function () {
  const urls = [
    "/",
    "/za-nas/",
    "/kontakti/",
    "/uslugi/",
    "/proekti/",
    "/blog/",
    "/videa/",
  ];

  for (const s of services) {
    urls.push(s.href || `/uslugi/${s.slug}/`);
  }

  for (const p of projects) {
    urls.push(`/proekti/${p.slug}/`);
  }

  for (const a of blog) {
    urls.push(`/blog/${a.slug}/`);
  }

  for (const v of videos) {
    urls.push(`/videa/${v.slug}/`);
  }

  return [...new Set(urls)];
};
