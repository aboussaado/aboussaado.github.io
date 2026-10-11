
(() => {

  const html =
    document.documentElement;


  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;



  // =======================================================
  // NATIVE CROSS-DOCUMENT VIEW TRANSITIONS
  // =======================================================

  const nativePageTransitions =
    "startViewTransition" in document &&
    CSS.supports(
      "view-transition-name: root"
    );


  /*
   * If we have just arrived from another internal page,
   * run the top accent sweep immediately.
   */
  if (nativePageTransitions) {

    let arriving =
      false;


    try {

      arriving =
        sessionStorage.getItem(
          "site-native-page-transition"
        ) === "1";


      sessionStorage.removeItem(
        "site-native-page-transition"
      );

    } catch (_) {}


    if (arriving) {

      html.classList.add(
        "site-native-arriving"
      );


      window.setTimeout(
        () => {

          html.classList.remove(
            "site-native-arriving"
          );

        },
        520
      );

    }

  }


  // =======================================================
  // PAGE ENTRANCE
  // =======================================================

  const showPage = () => {

    if (reducedMotion) {

      html.classList.add(
        "site-page-ready"
      );

      return;
    }


    /*
     * Paint initial state first,
     * then trigger the upward entrance.
     */
    requestAnimationFrame(() => {

      requestAnimationFrame(() => {

        html.classList.add(
          "site-page-ready"
        );

      });

    });

  };


  // =======================================================
  // GROUPED SCROLL REVEAL
  // =======================================================

  const initialiseReveal = () => {

    /*
     * Reveal semantic blocks as units.
     *
     * No nested h3/p/ul animations anymore.
     */

    const selector = [

      // ---------------- Homepage ----------------

      ".home-latest__item",

      ".home-research__axis",

      ".home-experience__item",

      ".home-publication-card",

      ".home-background__item",

      ".home-contact__content",
      ".home-contact__links",


      // ---------------- CV ----------------

      ".cv-entry",

      ".cv-publication",

      ".cv-award",

      ".cv-certificate",

      ".cv-skill-group",

      ".cv-language",


      // ---------------- Publications ----------------

      ".publication-entry",

      ".publications-editorial__bibliography > h2",
      ".publications-page__content > h2"

    ].join(",");


    const elements =
      Array.from(
        document.querySelectorAll(
          selector
        )
      );


    /*
     * Remove duplicates if an element happened to match
     * several selectors.
     */
    const uniqueElements =
      Array.from(
        new Set(elements)
      );


    if (!uniqueElements.length) {
      return;
    }


    uniqueElements.forEach(
      (element) => {

        element.classList.add(
          "site-reveal-item"
        );

      }
    );


    if (reducedMotion) {

      uniqueElements.forEach(
        (element) => {

          element.classList.add(
            "is-revealed"
          );

        }
      );

      return;
    }


    /*
     * Elements disappear again once they leave the
     * central reading zone.
     */

    const observer =
      new IntersectionObserver(
        (entries) => {

          const entering =
            entries
              .filter(
                (entry) =>
                  entry.isIntersecting
              )
              .sort(
                (a, b) =>
                  a.boundingClientRect.top -
                  b.boundingClientRect.top
              );


          entering.forEach(
            (entry, index) => {

              const delay =
                Math.min(
                  index * 70,
                  210
                );


              entry.target
                .style
                .setProperty(
                  "--site-reveal-delay",
                  `${delay}ms`
                );


              entry.target
                .classList
                .add(
                  "is-revealed"
                );

            }
          );


          entries
            .filter(
              (entry) =>
                !entry.isIntersecting
            )
            .forEach(
              (entry) => {

                entry.target
                  .style
                  .setProperty(
                    "--site-reveal-delay",
                    "0ms"
                  );


                entry.target
                  .classList
                  .remove(
                    "is-revealed"
                  );

              }
            );

        },
        {
          /*
           * Reading zone:
           * enough margin to avoid flickering at viewport
           * edges while still making the fade clearly tied
           * to scrolling.
           */

          rootMargin:
            "-7% 0px -12% 0px",

          threshold: [
            0,
            0.06,
            0.15
          ]
        }
      );


    uniqueElements.forEach(
      (element) => {

        observer.observe(
          element
        );

      }
    );

  };


  // =======================================================
  // INTERNAL PAGE TRANSITIONS
  // =======================================================

  const initialisePageLinks = () => {

    document.addEventListener(
      "click",
      (event) => {

        if (reducedMotion) {
          return;
        }


        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }


        const link =
          event.target.closest(
            "a[href]"
          );


        if (!link) {
          return;
        }


        if (
          link.hasAttribute(
            "download"
          ) ||
          link.target === "_blank"
        ) {
          return;
        }


        const href =
          link.getAttribute(
            "href"
          );


        if (
          !href ||
          href.startsWith("#") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:")
        ) {
          return;
        }


        let destination;


        try {

          destination =
            new URL(
              link.href,
              window.location.href
            );

        } catch {

          return;

        }


        if (
          destination.origin !==
          window.location.origin
        ) {
          return;
        }


        /*
         * Same-page links remain smooth anchors rather
         * than triggering a page transition.
         */

        if (
          destination.pathname ===
            window.location.pathname &&
          destination.search ===
            window.location.search
        ) {
          return;
        }


        event.preventDefault();


        html.classList.add(
          "site-is-leaving"
        );



        window.setTimeout(
          () => {
            window.location.href =
              destination.href;
          },
          220
        );

      }
    );

  };


  // =======================================================
  // BFCache / browser back-forward
  // =======================================================

  window.addEventListener(
    "pageshow",
    () => {

      html.classList.remove(
        "site-is-leaving"
      );


      requestAnimationFrame(() => {

        html.classList.add(
          "site-page-ready"
        );

      });

    }
  );


  // =======================================================
  // INIT
  // =======================================================

  const initialise = () => {

    initialiseReveal();

    initialisePageLinks();

    showPage();

  };


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initialise
    );

  } else {

    initialise();

  }

})();
