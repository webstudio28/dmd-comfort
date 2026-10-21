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

  document.querySelectorAll("[data-drag-scroll]").forEach((el) => {
    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    let moved = false;

    el.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch") return;
      if (el.scrollWidth <= el.clientWidth + 2) return;
      isDown = true;
      moved = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      el.setPointerCapture?.(e.pointerId);
      el.classList.add("is-dragging");
    });

    el.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) moved = true;
      el.scrollLeft = startScroll - dx;
    });

    function endDrag(e) {
      if (!isDown) return;
      isDown = false;
      el.classList.remove("is-dragging");
      try {
        el.releasePointerCapture?.(e.pointerId);
      } catch (_) {}
      if (el.hasAttribute("data-drag-snap")) {
        const card = el.firstElementChild;
        if (!card) return;
        const styles = getComputedStyle(el);
        const gap = parseFloat(styles.columnGap || styles.gap) || 0;
        const step = card.getBoundingClientRect().width + gap;
        if (!step) return;
        const index = Math.round(el.scrollLeft / step);
        el.scrollTo({ left: index * step, behavior: "smooth" });
      }
    }

    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    el.addEventListener("lostpointercapture", () => {
      isDown = false;
      el.classList.remove("is-dragging");
    });

    el.addEventListener(
      "click",
      (e) => {
        if (moved) {
          e.preventDefault();
          e.stopPropagation();
          moved = false;
        }
      },
      true,
    );
  });

  const faqRoot = document.querySelector("[data-faq]");
  if (faqRoot) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reducedMotion ? "0.001ms" : "0.45s";
    const easing = "cubic-bezier(0.33, 1, 0.68, 1)";
    const collapsedPeek = "5.25rem";
    const items = () => [...faqRoot.querySelectorAll("details.trim-faq-item")];
    const panelOf = (d) => d.querySelector(".trim-faq-answer");
    const innerOf = (d) => d.querySelector(".trim-faq-answer-inner");

    function finishHeight(panel, onDone) {
      let done = false;
      const run = () => {
        if (done) return;
        done = true;
        panel.removeEventListener("transitionend", onEnd);
        clearTimeout(fallback);
        onDone();
      };
      const onEnd = (e) => {
        if (e.target !== panel || e.propertyName !== "height") return;
        run();
      };
      panel.addEventListener("transitionend", onEnd);
      const fallback = setTimeout(run, reducedMotion ? 50 : 550);
    }

    function openItem(details) {
      const panel = panelOf(details);
      const inner = innerOf(details);
      if (!panel || !inner || details.hasAttribute("data-faq-busy")) return;
      details.setAttribute("data-faq-busy", "true");
      panel.style.overflow = "hidden";
      panel.style.transition = "";
      panel.style.height = "0px";
      details.open = true;
      panel.getBoundingClientRect();
      panel.style.transition = `height ${duration} ${easing}`;
      panel.style.height = `${inner.scrollHeight}px`;
      finishHeight(panel, () => {
        if (!details.open) {
          panel.style.transition = "";
          panel.style.height = "";
          details.removeAttribute("data-faq-busy");
          return;
        }
        panel.style.transition = "";
        panel.style.height = "auto";
        details.removeAttribute("data-faq-busy");
      });
    }

    function closeItem(details) {
      if (!details.open || details.hasAttribute("data-faq-busy")) return;
      const panel = panelOf(details);
      const inner = innerOf(details);
      if (!panel || !inner) {
        details.open = false;
        return;
      }
      details.setAttribute("data-faq-busy", "true");
      panel.style.overflow = "hidden";
      panel.style.transition = "";
      panel.style.height = `${inner.scrollHeight}px`;
      panel.getBoundingClientRect();
      panel.style.transition = `height ${duration} ${easing}`;
      panel.style.height = "0px";
      finishHeight(panel, () => {
        details.open = false;
        panel.style.transition = "";
        panel.style.height = "";
        details.removeAttribute("data-faq-busy");
      });
    }

    items().forEach((details) => {
      const summary = details.querySelector("summary");
      if (!summary) return;
      summary.addEventListener("click", (e) => {
        e.preventDefault();
        if (reducedMotion) {
          if (details.open) details.open = false;
          else {
            items().forEach((other) => {
              if (other !== details) other.open = false;
            });
            details.open = true;
          }
          return;
        }
        if (details.hasAttribute("data-faq-busy")) return;
        if (!details.open) {
          items().forEach((other) => {
            if (other !== details && other.open) closeItem(other);
          });
          openItem(details);
        } else {
          closeItem(details);
        }
      });
    });

    const extra = faqRoot.querySelector("[data-faq-extra]");
    const extraBtn = faqRoot.querySelector("[data-faq-expand]");
    const extraInner = extra?.querySelector("[data-faq-extra-inner]");
    if (extra && extraBtn && extraInner) {
      const collapseExtra = () => {
        extra.classList.remove("is-expanded");
        if (reducedMotion) {
          extraInner.style.maxHeight = collapsedPeek;
          return;
        }
        extraInner.style.maxHeight = `${extraInner.scrollHeight}px`;
        extraInner.getBoundingClientRect();
        extraInner.style.maxHeight = collapsedPeek;
      };
      const expandExtra = () => {
        extra.classList.add("is-expanded");
        if (reducedMotion) {
          extraInner.style.maxHeight = "none";
          return;
        }
        extraInner.style.maxHeight = `${extraInner.scrollHeight}px`;
        extraInner.addEventListener("transitionend", function onEnd(e) {
          if (e.propertyName !== "max-height" || !extra.classList.contains("is-expanded")) return;
          extraInner.removeEventListener("transitionend", onEnd);
          extraInner.style.maxHeight = "none";
        });
      };
      collapseExtra();
      extraBtn.addEventListener("click", () => {
        const expanded = extra.classList.contains("is-expanded");
        if (expanded) {
          extra.querySelectorAll("details.trim-faq-item[open]").forEach((d) => {
            d.open = false;
            const panel = panelOf(d);
            if (panel) {
              panel.style.height = "";
              panel.style.transition = "";
            }
            d.removeAttribute("data-faq-busy");
          });
          collapseExtra();
          extraBtn.setAttribute("aria-expanded", "false");
          extraBtn.querySelector("[data-faq-expand-label]").textContent = extraBtn.getAttribute("data-label-more");
        } else {
          expandExtra();
          extraBtn.setAttribute("aria-expanded", "true");
          extraBtn.querySelector("[data-faq-expand-label]").textContent = extraBtn.getAttribute("data-label-less");
        }
      });
    }
  }
})();
