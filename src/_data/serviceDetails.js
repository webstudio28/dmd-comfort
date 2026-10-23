const fs = require("fs");
const path = require("path");

const PROJECTS_PREVIEW = 8;

/** Display name for the service page (keyword-led). Menu keeps services.json title. */
function pageNameFromKeyword(keyword) {
  if (!keyword) return "";
  // Avoid \\b - it does not treat Cyrillic as word chars in JS.
  return keyword
    .replace(/(^|[^\p{L}\p{N}_])пвц(?=[^\p{L}\p{N}_]|$)/giu, "$1ПВЦ")
    .replace(/(^|[^\p{L}\p{N}_])pvc(?=[^\p{L}\p{N}_]|$)/giu, "$1PVC")
    .replace(/(^|[^\p{L}\p{N}_])пловдив(?=[^\p{L}\p{N}_]|$)/giu, "$1Пловдив")
    .replace(/^./u, (ch) => ch.toUpperCase());
}

/** Label used in “Нашите проекти за …” - wider than bare “Пловдив”. */
function projectsForLabel(slug, pageName) {
  if (slug === "aluminiumieva-dograma" || slug === "pvc-dograma") {
    return "Дограма в Пловдив и региона";
  }
  if (!pageName) return pageName;
  if (/Пловдив и региона/u.test(pageName)) return pageName;
  if (/Пловдив$/u.test(pageName)) {
    return pageName.replace(/Пловдив$/u, "Пловдив и региона");
  }
  return pageName;
}

/** Menu-style phrase for spoken UI (“Защо да изберете … от нас?”). */
function naturalServicePhrase(title) {
  if (!title) return "";
  if (/^(PVC|ПВЦ)\b/u.test(title)) return title;
  return title.replace(/^./u, (ch) => ch.toLocaleLowerCase("bg-BG"));
}

function whyChooseTitle(copy, title, slug) {
  if (copy?.featuresTitle) return copy.featuresTitle;
  // Short menu labels that need a clearer spoken phrase
  const spoken = {
    "razshirenie-na-magazin": "разширение на магазин",
    "razshirenie-na-ofis": "разширение на офис",
    "usvoyavane-na-terasi": "усвояване на тераси",
    "pregradni-steni": "преградни стени",
    "portalni-vrati": "портални врати",
  };
  const phrase = spoken[slug] || naturalServicePhrase(title);
  return `Защо да изберете ${phrase} от нас?`;
}

/** Keep menu identities separate from the approved, keyword-led page content. */
module.exports = function () {
  const services = JSON.parse(fs.readFileSync(path.join(__dirname, "services.json"), "utf8"));
  const content = JSON.parse(fs.readFileSync(path.join(__dirname, "serviceContent.json"), "utf8"));
  const projects = JSON.parse(fs.readFileSync(path.join(__dirname, "projects.json"), "utf8"));
  const blog = JSON.parse(fs.readFileSync(path.join(__dirname, "blog.json"), "utf8"));
  const bySlug = new Map(services.map((service) => [service.slug, service]));
  const blogBySlug = new Map(blog.map((post) => [post.slug, post]));

  const pageNameFor = (slug) => {
    const copy = content[slug];
    return pageNameFromKeyword(copy?.keyword) || bySlug.get(slug)?.title || slug;
  };

  const card = (slug) => {
    const item = bySlug.get(slug);
    if (!item) throw new Error(`Unknown related service: ${slug}`);
    const copy = content[slug];
    return {
      ...item,
      pageName: pageNameFor(slug),
      url: item.href || `/uslugi/${item.slug}/`,
      summary: copy?.description || item.shortDescription || item.title,
    };
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
        location: project.location || project.objectType || "",
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

  return services
    .filter((service) => !service.href)
    .map((service) => {
      const copy = content[service.slug];
      if (!copy) throw new Error(`Missing approved service content: ${service.slug}`);
      const parent = service.parentSlug ? bySlug.get(service.parentSlug) : null;
      const relatedProjects = projectsForService(service);
      const relatedBlog = copy.blogSlug ? blogBySlug.get(copy.blogSlug) || null : null;
      const pageName = pageNameFor(service.slug);
      return {
        ...service,
        copy: {
          ...copy,
          // Keep explicit overrides; otherwise build a natural spoken heading.
          featuresTitle: whyChooseTitle(copy, service.title, service.slug),
        },
        pageName,
        projectsFor: projectsForLabel(service.slug, pageName),
        parentTitle: parent ? pageNameFor(parent.slug) : "",
        parentMenuTitle: parent?.title || "",
        parentUrl: parent ? `/uslugi/${parent.slug}/` : "",
        subcategoryCards: (service.menuChildren || []).map((child) => card(child.slug)),
        relatedServices: (copy.relatedSlugs || []).map(card),
        relatedProjects: relatedProjects.slice(0, PROJECTS_PREVIEW),
        // Project hub only has main-service groups; subservices link to the parent category.
        projectsMoreUrl: relatedProjects.length
          ? `/proekti/usluga/${parent?.slug || service.slug}/`
          : "",
        projectsTotal: relatedProjects.length,
        relatedBlog,
      };
    });
};
