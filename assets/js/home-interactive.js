document.addEventListener("DOMContentLoaded", () => {
  const researchSection = document.querySelector(".home-research");

  if (!researchSection) return;

  const axes = [...researchSection.querySelectorAll(".home-research__axis")];

  const previewIndex = researchSection.querySelector(
    ".home-research__preview-index"
  );
  const previewTitle = researchSection.querySelector(
    ".home-research__preview-title"
  );
  const previewText = researchSection.querySelector(
    ".home-research__preview-text"
  );

  if (!axes.length || !previewIndex || !previewTitle || !previewText) return;

  let activeAxis =
    researchSection.querySelector(".home-research__axis.is-active") || axes[0];

  let hoveredAxis = null;
  let scrollTicking = false;

  const supportsHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  function renderPreview(axis) {
    if (!axis) return;

    const index = axis.dataset.index;
    const title = axis.dataset.title;
    const description = axis.dataset.description;

    const preview = researchSection.querySelector(".home-research__preview");

    preview.classList.add("is-changing");

    window.setTimeout(() => {
      previewIndex.textContent = index;
      previewTitle.textContent = title;
      previewText.textContent = description;

      preview.classList.remove("is-changing");
    }, 190);
  }

  function setActiveAxis(axis) {
    if (!axis || axis === activeAxis) return;

    axes.forEach((item) => item.classList.remove("is-active"));
    axis.classList.add("is-active");

    activeAxis = axis;

    if (!hoveredAxis) {
      renderPreview(activeAxis);
    }
  }

  function updateActiveFromScroll() {
    const viewportReference = window.innerHeight * 0.46;

    let closestAxis = activeAxis;
    let closestDistance = Infinity;

    axes.forEach((axis) => {
      const rect = axis.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = Math.abs(center - viewportReference);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestAxis = axis;
      }
    });

    const sectionRect = researchSection.getBoundingClientRect();

    if (
      sectionRect.bottom > window.innerHeight * 0.25 &&
      sectionRect.top < window.innerHeight * 0.75
    ) {
      setActiveAxis(closestAxis);
    }

    scrollTicking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(updateActiveFromScroll);
        scrollTicking = true;
      }
    },
    { passive: true }
  );

  axes.forEach((axis) => {
    if (supportsHover) {
      axis.addEventListener("mouseenter", () => {
        hoveredAxis = axis;
        renderPreview(axis);
      });

      axis.addEventListener("mouseleave", () => {
        hoveredAxis = null;
        renderPreview(activeAxis);
      });
    }

    axis.addEventListener("click", () => {
      hoveredAxis = null;
      setActiveAxis(axis);
      renderPreview(axis);
    });
  });

  updateActiveFromScroll();

  document.querySelectorAll(".home-publication-card__cite").forEach((button) => {
  button.addEventListener("click", async () => {
    const card = button.closest(".home-publication-card");
    const source = card?.querySelector(".home-publication-card__bibtex");

    if (!source) return;

    const text = source.value.trim();

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const temp = document.createElement("textarea");
        temp.value = text;
        temp.style.position = "fixed";
        temp.style.opacity = "0";

        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        temp.remove();
      }


button.textContent = "Copied ✓";

window.setTimeout(() => {
  button.textContent = originalText;
}, 1300);const originalText = button.textContent;

button.classList.add("is-changing");

window.setTimeout(() => {
  button.textContent = "Copied ✓";
  button.classList.remove("is-changing");
}, 160);

window.setTimeout(() => {
  button.classList.add("is-changing");

  window.setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove("is-changing");
  }, 160);
}, 1250);
    } catch (error) {
      console.error("Could not copy BibTeX:", error);
    }
  });
});
});

document.addEventListener("DOMContentLoaded", () => {
  const navLinks = Array.from(
    document.querySelectorAll(".home-section-nav__link")
  );

  if (!navLinks.length) return;

  const sections = navLinks
    .map((link) => {
      const id = link.dataset.section;
      const section = document.getElementById(id);

      return section ? { id, section, link } : null;
    })
    .filter(Boolean);

  if (!sections.length) return;

  const setActiveSection = (id) => {
    sections.forEach(({ id: sectionId, link }) => {
      const isActive = sectionId === id;

      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const updateActiveSection = () => {
    const triggerY = Math.min(140, window.innerHeight * 0.2);

    // At the very bottom of the page, Contact must stay active.
    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 4;

    if (atBottom) {
      setActiveSection(sections[sections.length - 1].id);
      return;
    }

    let active = sections[0];

    sections.forEach((item) => {
      const rect = item.section.getBoundingClientRect();

      if (rect.top <= triggerY) {
        active = item;
      }
    });

    setActiveSection(active.id);
  };

  let ticking = false;

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(() => {
        updateActiveSection();
        ticking = false;
      });
    },
    { passive: true }
  );


  /* precise section-nav clicks */
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      const id = link.dataset.section;
      const section = document.getElementById(id);

      if (!section) return;

      const headerOffset = 80;

      const top =
        section.getBoundingClientRect().top +
        window.scrollY -
        headerOffset;

      setActiveSection(id);

      window.scrollTo({
        top,
        behavior: "smooth",
      });

      history.replaceState(null, "", `#${id}`);
    });
  });

  updateActiveSection();
});

document.addEventListener("DOMContentLoaded", () => {
  const groups = [
    {
      root: ".home-latest",
      item: ".home-latest__item",
    },
    {
      root: ".home-experience",
      item: ".home-experience__item",
    },
    {
      root: ".home-background",
      item: ".home-background__item",
    },
  ];

  const preparedGroups = groups
    .map(({ root, item }) => {
      const container = document.querySelector(root);

      if (!container) return null;

      const items = Array.from(container.querySelectorAll(item));

      if (!items.length) return null;

      return {
        container,
        items,
      };
    })
    .filter(Boolean);

  if (!preparedGroups.length) return;

  const setActive = (group, activeItem) => {
    group.items.forEach((item) => {
      item.classList.toggle("is-active", item === activeItem);
    });
  };

  const updateGroup = (group) => {
    const containerRect = group.container.getBoundingClientRect();

    const isVisible =
      containerRect.bottom > 0 &&
      containerRect.top < window.innerHeight;

    if (!isVisible) return;

    const targetY = window.innerHeight * 0.46;

    let closestItem = group.items[0];
    let closestDistance = Infinity;

    group.items.forEach((item) => {
      const rect = item.getBoundingClientRect();

      const itemCenter = rect.top + rect.height / 2;
      const distance = Math.abs(itemCenter - targetY);

      if (distance < closestDistance) {
        closestItem = item;
        closestDistance = distance;
      }
    });

    setActive(group, closestItem);
  };

  const updateAllGroups = () => {
    preparedGroups.forEach(updateGroup);
  };

  preparedGroups.forEach((group) => {
    group.items.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        setActive(group, item);
      });

      item.addEventListener("mouseleave", () => {
        updateGroup(group);
      });
    });
  });

  let ticking = false;

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(() => {
        updateAllGroups();
        ticking = false;
      });
    },
    { passive: true }
  );

  window.addEventListener("resize", updateAllGroups);

  updateAllGroups();
});
