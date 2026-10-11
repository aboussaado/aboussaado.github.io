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
