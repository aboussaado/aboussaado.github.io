
document.addEventListener("DOMContentLoaded", () => {

  // =======================================================
  // CV entry highlighting
  // =======================================================

  const items = Array.from(
    document.querySelectorAll(".cv-track-item")
  );


  const updateEntries = () => {
    if (!items.length) return;

    const targetY =
      window.innerHeight * 0.42;

    let closest = null;
    let bestDistance = Infinity;


    items.forEach((item) => {
      const rect =
        item.getBoundingClientRect();

      if (
        rect.bottom < 0 ||
        rect.top > window.innerHeight
      ) {
        return;
      }

      const center =
        rect.top +
        rect.height * 0.42;

      const distance =
        Math.abs(
          center - targetY
        );

      if (distance < bestDistance) {
        bestDistance = distance;
        closest = item;
      }
    });


    items.forEach((item) => {
      item.classList.toggle(
        "is-active",
        item === closest
      );
    });
  };


  let entryTicking = false;

  window.addEventListener(
    "scroll",
    () => {
      if (entryTicking) return;

      entryTicking = true;

      window.requestAnimationFrame(() => {
        updateEntries();
        entryTicking = false;
      });
    },
    { passive: true }
  );

  updateEntries();
});


/* =========================================================
   Exact homepage-style section navigation
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const navLinks = Array.from(
    document.querySelectorAll(
      ".cv-page__rail a[data-cv-section]"
    )
  );


  if (!navLinks.length) return;


  const sections = navLinks
    .map((link) => {
      const id =
        link.dataset.cvSection;

      const section =
        document.getElementById(id);

      return section
        ? { id, section, link }
        : null;
    })
    .filter(Boolean);


  if (!sections.length) return;


  const setActiveSection = (id) => {
    sections.forEach(
      ({
        id: sectionId,
        link
      }) => {

        const isActive =
          sectionId === id;


        link.classList.toggle(
          "is-active",
          isActive
        );


        if (isActive) {
          link.setAttribute(
            "aria-current",
            "true"
          );
        } else {
          link.removeAttribute(
            "aria-current"
          );
        }
      }
    );
  };


  const updateActiveSection = () => {

    /*
     * Exactly the same trigger as homepage.
     */
    const triggerY =
      Math.min(
        140,
        window.innerHeight * 0.2
      );


    /*
     * At the very bottom,
     * last section stays active.
     */
    const atBottom =
      window.innerHeight +
      window.scrollY >=
      document.documentElement
        .scrollHeight - 4;


    if (atBottom) {
      setActiveSection(
        sections[
          sections.length - 1
        ].id
      );

      return;
    }


    /*
     * Same homepage behaviour:
     * first section is active while hero is visible.
     */
    let active =
      sections[0];


    sections.forEach((item) => {

      const rect =
        item.section
          .getBoundingClientRect();


      if (
        rect.top <= triggerY
      ) {
        active = item;
      }
    });


    setActiveSection(
      active.id
    );
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
    {
      passive: true
    }
  );


  /* precise section-nav clicks */

  navLinks.forEach((link) => {

    link.addEventListener(
      "click",
      (event) => {

        event.preventDefault();


        const id =
          link.dataset.cvSection;

        const section =
          document.getElementById(id);


        if (!section) return;


        const headerOffset = 80;


        const top =
          section
            .getBoundingClientRect()
            .top +
          window.scrollY -
          headerOffset;


        setActiveSection(id);


        window.scrollTo({
          top,
          behavior: "smooth"
        });


        history.replaceState(
          null,
          "",
          `#${id}`
        );
      }
    );
  });


  updateActiveSection();
});
