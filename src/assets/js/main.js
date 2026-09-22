(function () {
  const header = document.getElementById("header");
  const mobileMenu = document.getElementById("mobileMenu");
  const modal = document.getElementById("inquiryModal");
  const panel = mobileMenu?.querySelector(".absolute.inset-y-0");
  const backdrop = mobileMenu?.children[0];
  const modalCard = modal?.querySelector('[role="dialog"]');
  const modalBackdrop = modal?.children[0];

  function setHeader() {
    if (!header || !header.classList.contains("js-transparent")) return;
    const scrolled = window.scrollY > 32;
    header.classList.toggle("bg-white/95", scrolled);
    header.classList.toggle("text-ink", scrolled);
    header.classList.toggle("shadow-[0_5px_22px_rgba(36,51,43,0.08)]", scrolled);
    header.classList.toggle("backdrop-blur-md", scrolled);
    header.classList.toggle("text-white", !scrolled);
    header.querySelectorAll("[data-nav-link]").forEach(() => {});
    const logo = header.querySelector("a");
    if (logo) {
      logo.classList.toggle("text-white", !scrolled);
      logo.classList.toggle("text-ink", scrolled);
    }
    const toggle = document.getElementById("menuOpen");
    if (toggle) {
      toggle.classList.toggle("text-white", !scrolled);
      toggle.classList.toggle("text-ink", scrolled);
    }
    header.querySelectorAll("nav a").forEach((el) => {
      if (el.closest(".group > div")) return;
      el.classList.toggle("text-white/85", !scrolled);
      el.classList.toggle("hover:text-white", !scrolled);
      el.classList.toggle("group-hover:text-white", !scrolled);
      el.classList.toggle("text-ink", scrolled);
      el.classList.toggle("hover:text-ink-muted", scrolled);
      el.classList.toggle("group-hover:text-ink-muted", scrolled);
    });
  }

  if (header && document.body.dataset.transparentHeader === "true") {
    header.classList.add("js-transparent");
    setHeader();
    window.addEventListener("scroll", setHeader, { passive: true });
  }

  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("invisible", "pointer-events-none");
    mobileMenu.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
    backdrop?.classList.remove("opacity-0");
    backdrop?.classList.add("opacity-100");
    panel?.classList.remove("translate-x-full");
  }

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add("invisible", "pointer-events-none");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
    backdrop?.classList.add("opacity-0");
    backdrop?.classList.remove("opacity-100");
    panel?.classList.add("translate-x-full");
  }

  document.getElementById("menuOpen")?.addEventListener("click", openMenu);
  document.querySelectorAll("[data-close-menu]").forEach((el) => el.addEventListener("click", closeMenu));
  mobileMenu?.querySelectorAll("a").forEach((el) => el.addEventListener("click", closeMenu));

  function openModal() {
    closeMenu();
    if (!modal) return;
    modal.classList.remove("invisible", "pointer-events-none");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    modalBackdrop?.classList.remove("opacity-0");
    modalBackdrop?.classList.add("opacity-100");
    modalCard?.classList.remove("opacity-0", "translate-y-4");
    setTimeout(() => document.getElementById("name")?.focus(), 200);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.add("invisible", "pointer-events-none");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    modalBackdrop?.classList.add("opacity-0");
    modalBackdrop?.classList.remove("opacity-100");
    modalCard?.classList.add("opacity-0", "translate-y-4");
  }

  document.querySelectorAll(".open-inquiry").forEach((el) => el.addEventListener("click", openModal));
  document.querySelectorAll("[data-close-modal]").forEach((el) => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
      closeModal();
    }
  });

  document.getElementById("inquiryForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const content = document.getElementById("formContent");
    const success = document.getElementById("formSuccess");
    if (content) content.classList.add("hidden");
    if (success) success.classList.remove("hidden");
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  document.querySelectorAll("[data-video-embed]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.getAttribute("data-video-embed");
      if (!src) return;
      const host = btn.parentElement;
      if (!host) return;
      const iframe = document.createElement("iframe");
      iframe.className = "h-full w-full";
      iframe.src = src;
      iframe.title = btn.getAttribute("data-video-title") || "Видео";
      iframe.setAttribute(
        "allow",
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
      );
      iframe.allowFullscreen = true;
      host.replaceChildren(iframe);
    });
  });
})();
