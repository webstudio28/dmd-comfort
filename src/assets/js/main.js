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
    closeCustomSelects();
    modal.classList.add("invisible", "pointer-events-none");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    modalBackdrop?.classList.add("opacity-0");
    modalBackdrop?.classList.remove("opacity-100");
    modalCard?.classList.add("opacity-0", "translate-y-4");
  }

  document.querySelectorAll(".open-inquiry").forEach((el) => el.addEventListener("click", openModal));
  document.querySelectorAll("[data-close-modal]").forEach((el) => el.addEventListener("click", closeModal));

  /* ---- Custom select (inquiry modal service field) ---- */
  const customSelects = Array.from(document.querySelectorAll("[data-custom-select]"));

  function getCustomSelectParts(root) {
    return {
      root,
      input: root.querySelector('input[type="hidden"]'),
      trigger: root.querySelector(".custom-select-trigger"),
      label: root.querySelector("[data-custom-select-label]"),
      list: root.querySelector(".custom-select-list"),
      options: Array.from(root.querySelectorAll('[role="option"]')),
    };
  }

  function setCustomSelectActive(parts, index) {
    parts.options.forEach((option, i) => {
      option.classList.toggle("is-active", i === index);
    });
  }

  function scrollCustomOptionIntoList(parts, option) {
    if (!option || !parts.list) return;
    const list = parts.list;
    const top = option.offsetTop;
    const bottom = top + option.offsetHeight;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
  }

  function positionCustomSelectList(parts) {
    const triggerRect = parts.trigger.getBoundingClientRect();
    const dialog = parts.trigger.closest('[role="dialog"]');
    const bounds = dialog?.getBoundingClientRect() || {
      top: 0,
      bottom: window.innerHeight,
    };
    const gap = 8;
    const spaceBelow = bounds.bottom - triggerRect.bottom - gap;
    const spaceAbove = triggerRect.top - bounds.top - gap;
    const preferred = Math.min(264, window.innerHeight * 0.42);
    const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;
    parts.root.classList.toggle("is-drop-up", openUp);
    parts.list.style.maxHeight = `${Math.max(120, Math.min(preferred, openUp ? spaceAbove : spaceBelow))}px`;
  }

  function openCustomSelect(parts) {
    customSelects.forEach((other) => {
      if (other !== parts.root) closeCustomSelect(getCustomSelectParts(other));
    });
    parts.root.classList.add("is-open");
    parts.list.hidden = false;
    parts.trigger.setAttribute("aria-expanded", "true");
    positionCustomSelectList(parts);
    const selectedIndex = Math.max(
      0,
      parts.options.findIndex((option) => option.classList.contains("is-selected")),
    );
    setCustomSelectActive(parts, selectedIndex);
    scrollCustomOptionIntoList(parts, parts.options[selectedIndex]);
  }

  function closeCustomSelect(parts) {
    parts.root.classList.remove("is-open", "is-drop-up");
    parts.list.hidden = true;
    parts.list.style.maxHeight = "";
    parts.trigger.setAttribute("aria-expanded", "false");
    setCustomSelectActive(parts, -1);
  }

  function closeCustomSelects() {
    customSelects.forEach((root) => closeCustomSelect(getCustomSelectParts(root)));
  }

  function applyCustomOption(parts, option, { close = true, focus = true } = {}) {
    const value = option.getAttribute("data-value") || "";
    const text = option.textContent.trim();
    if (parts.input) parts.input.value = value;
    if (parts.label) {
      parts.label.textContent = text;
      parts.label.classList.toggle("is-placeholder", !value);
    }
    parts.options.forEach((item) => {
      const selected = item === option;
      item.classList.toggle("is-selected", selected);
      item.setAttribute("aria-selected", selected ? "true" : "false");
    });
    if (close) closeCustomSelect(parts);
    if (focus) parts.trigger.focus();
  }

  function selectCustomOption(parts, option) {
    applyCustomOption(parts, option);
  }

  customSelects.forEach((root) => {
    const parts = getCustomSelectParts(root);
    if (!parts.trigger || !parts.list) return;

    const preselected = parts.list.querySelector("[data-interest-preselect]");
    if (preselected) applyCustomOption(parts, preselected, { close: false, focus: false });

    parts.trigger.addEventListener("click", () => {
      if (parts.root.classList.contains("is-open")) closeCustomSelect(parts);
      else openCustomSelect(parts);
    });

    parts.trigger.addEventListener("keydown", (e) => {
      const open = parts.root.classList.contains("is-open");
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!open) {
          openCustomSelect(parts);
          return;
        }
        const current = parts.options.findIndex((option) => option.classList.contains("is-active"));
        const delta = e.key === "ArrowDown" ? 1 : -1;
        const next = Math.min(parts.options.length - 1, Math.max(0, (current < 0 ? 0 : current) + delta));
        setCustomSelectActive(parts, next);
        scrollCustomOptionIntoList(parts, parts.options[next]);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!open) {
          openCustomSelect(parts);
          return;
        }
        const active = parts.options.find((option) => option.classList.contains("is-active"));
        if (active) selectCustomOption(parts, active);
      } else if (e.key === "Home" && open) {
        e.preventDefault();
        setCustomSelectActive(parts, 0);
        scrollCustomOptionIntoList(parts, parts.options[0]);
      } else if (e.key === "End" && open) {
        e.preventDefault();
        const last = parts.options.length - 1;
        setCustomSelectActive(parts, last);
        scrollCustomOptionIntoList(parts, parts.options[last]);
      }
    });

    parts.options.forEach((option) => {
      option.addEventListener("click", () => selectCustomOption(parts, option));
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-custom-select]")) closeCustomSelects();
  });

  /* ---- Gallery modal (Valeto-style) ---- */
  const lightbox = document.getElementById("imageLightbox");
  const lightboxImage = lightbox?.querySelector("[data-lightbox-image]");
  const lightboxStage = lightbox?.querySelector("[data-lightbox-stage]");
  const lightboxPrev = lightbox?.querySelector("[data-lightbox-prev]");
  const lightboxNext = lightbox?.querySelector("[data-lightbox-next]");
  let lightboxItems = [];
  let lightboxIndex = 0;

  function isLightboxOpen() {
    return Boolean(lightbox && !lightbox.hidden);
  }

  function showLightboxImage(index) {
    if (!lightboxImage || !lightboxItems.length) return;
    lightboxIndex = ((index % lightboxItems.length) + lightboxItems.length) % lightboxItems.length;
    const item = lightboxItems[lightboxIndex];
    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt || "";
  }

  function openLightbox(items, index) {
    if (!lightbox || !items.length) return;
    lightboxItems = items;
    showLightboxImage(index);
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
  }

  function closeLightbox() {
    if (!isLightboxOpen()) return;
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    if (lightboxImage) {
      lightboxImage.removeAttribute("src");
      lightboxImage.alt = "";
    }
  }

  function stepLightbox(delta) {
    if (!isLightboxOpen() || lightboxItems.length < 2) return;
    showLightboxImage(lightboxIndex + delta);
  }

  document.querySelectorAll("[data-gallery]").forEach((gallery) => {
    const items = [...gallery.querySelectorAll("[data-gallery-index]")]
      .map((btn) => {
        const img = btn.querySelector("img");
        return {
          src: img?.currentSrc || img?.src || "",
          alt: img?.alt || "",
          button: btn,
        };
      })
      .filter((item) => item.src);

    items.forEach((item, index) => {
      item.button?.addEventListener("click", () => openLightbox(items, index));
    });
  });

  lightbox?.querySelectorAll("[data-lightbox-close]").forEach((el) => {
    el.addEventListener("click", closeLightbox);
  });
  lightboxPrev?.addEventListener("click", () => stepLightbox(-1));
  lightboxNext?.addEventListener("click", () => stepLightbox(1));

  let swipeStartX = null;
  lightboxStage?.addEventListener(
    "touchstart",
    (e) => {
      if (!e.touches?.length) return;
      swipeStartX = e.touches[0].clientX;
    },
    { passive: true },
  );
  lightboxStage?.addEventListener("touchend", (e) => {
    if (swipeStartX === null || !e.changedTouches?.length) return;
    const deltaX = e.changedTouches[0].clientX - swipeStartX;
    swipeStartX = null;
    if (Math.abs(deltaX) < 40) return;
    if (deltaX < 0) stepLightbox(1);
    else stepLightbox(-1);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (isLightboxOpen()) {
        closeLightbox();
        return;
      }
      const openSelect = customSelects.find((root) => root.classList.contains("is-open"));
      if (openSelect) {
        closeCustomSelect(getCustomSelectParts(openSelect));
        openSelect.querySelector(".custom-select-trigger")?.focus();
        return;
      }
      closeMenu();
      closeModal();
      return;
    }
    if (!isLightboxOpen()) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      stepLightbox(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      stepLightbox(1);
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

  const reducedDragMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-drag-scroll]").forEach((el) => {
    let active = null;
    let moved = false;
    let suppressClick = false;
    let samples = [];
    let glide = 0;

    const stopGlide = () => {
      if (!glide) return;
      cancelAnimationFrame(glide);
      glide = 0;
    };

    const track = (x, t) => {
      samples.push({ x, t });
      const cutoff = t - 80;
      while (samples.length && samples[0].t < cutoff) samples.shift();
    };

    const releaseVelocity = (t) => {
      if (samples.length < 2) return 0;
      const first = samples[0];
      const last = samples[samples.length - 1];
      const dt = last.t - first.t;
      if (dt < 16 || t - last.t > 60) return 0;
      return (first.x - last.x) / dt;
    };

    const startGlide = (velocity) => {
      if (reducedDragMotion || Math.abs(velocity) < 0.05) return;
      let last = performance.now();
      let v = velocity;
      const step = (now) => {
        const dt = Math.min(32, now - last);
        last = now;
        const max = el.scrollWidth - el.clientWidth;
        const next = el.scrollLeft + v * dt;
        if (next <= 0 || next >= max) {
          el.scrollLeft = Math.max(0, Math.min(max, next));
          glide = 0;
          return;
        }
        el.scrollLeft = next;
        v *= Math.pow(0.95, dt / 16);
        if (Math.abs(v) < 0.02) {
          glide = 0;
          return;
        }
        glide = requestAnimationFrame(step);
      };
      glide = requestAnimationFrame(step);
    };

    const endDrag = (e) => {
      if (!active || (e && e.pointerId !== active.id)) return;
      const id = active.id;
      const didMove = moved;
      const velocity = didMove ? releaseVelocity(e?.timeStamp ?? performance.now()) : 0;
      active = null;
      moved = false;
      samples = [];
      el.classList.remove("is-dragging");
      try {
        if (el.hasPointerCapture?.(id)) el.releasePointerCapture(id);
      } catch (_) {}
      if (didMove) {
        suppressClick = true;
        startGlide(velocity);
      }
    };

    el.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch" || e.button !== 0 || !e.isPrimary) return;
      if (el.scrollWidth <= el.clientWidth + 2) return;
      stopGlide();
      suppressClick = false;
      moved = false;
      samples = [];
      track(e.clientX, e.timeStamp);
      active = { id: e.pointerId, x: e.clientX, left: el.scrollLeft };
    });

    el.addEventListener("pointermove", (e) => {
      if (!active || e.pointerId !== active.id) return;
      const dx = e.clientX - active.x;
      if (!moved && Math.abs(dx) <= 5) return;
      if (!moved) {
        moved = true;
        el.setPointerCapture?.(e.pointerId);
        el.classList.add("is-dragging");
      }
      e.preventDefault();
      el.scrollLeft = active.left - dx;
      track(e.clientX, e.timeStamp);
    });

    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    el.addEventListener("lostpointercapture", () => {
      active = null;
      moved = false;
      el.classList.remove("is-dragging");
    });

    el.addEventListener("dragstart", (e) => e.preventDefault());

    el.addEventListener(
      "click",
      (e) => {
        if (!suppressClick) return;
        e.preventDefault();
        e.stopPropagation();
        suppressClick = false;
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

(() => {
  document.querySelectorAll("[data-read-more]").forEach((root) => {
    const panel = root.querySelector("[data-read-more-panel]");
    const btn = root.querySelector("[data-read-more-toggle]");
    const label = btn?.querySelector("[data-read-more-label]");
    if (!panel || !btn || !label) return;

    btn.addEventListener("click", () => {
      const open = panel.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      label.textContent = open
        ? btn.getAttribute("data-label-less")
        : btn.getAttribute("data-label-more");
    });
  });
})();
