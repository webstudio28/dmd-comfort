const fs = require("fs");
const path = require("path");

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, name), "utf8"));
}

module.exports = function () {
  const services = readJson("services.json");
  const projects = readJson("projects.json");
  const projectGroups = require("./projectGroups")();
  const blog = readJson("blog.json");
  const videos = readJson("videos.json");
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

  for (const group of projectGroups) {
    urls.push(group.href);
  }

  for (const a of blog) {
    urls.push(`/blog/${a.slug}/`);
  }

  for (const v of videos) {
    urls.push(`/videa/${v.slug}/`);
  }

  return [...new Set(urls)];
};
