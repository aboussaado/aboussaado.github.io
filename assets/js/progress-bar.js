
/*
 * Smooth scrolling progress indicator.
 *
 * Instead of snapping directly to the current scroll
 * position, the displayed value eases toward it.
 */

(() => {

  const progress =
    document.getElementById("progress");

  if (!progress) return;


  /*
   * Lower = softer / more delayed.
   * Higher = more responsive.
   *
   * 0.16 gives a subtle amount of inertia.
   */
  const SMOOTHING = 0.16;


  let current = 0;
  let target = 0;
  let maximum = 1;
  let frame = null;


  const getMaximum = () =>
    Math.max(
      document.documentElement.scrollHeight -
      window.innerHeight,
      1
    );


  const getScrollPosition = () =>
    Math.max(
      window.scrollY ||
      document.documentElement.scrollTop ||
      0,
      0
    );


  const configure = () => {

    maximum = getMaximum();

    target =
      Math.min(
        getScrollPosition(),
        maximum
      );

    /*
     * Keep the current displayed position valid when
     * viewport/document dimensions change.
     */
    current =
      Math.min(
        current,
        maximum
      );


    progress.max =
      maximum;

    progress.value =
      current;

  };


  const animate = () => {

    const difference =
      target - current;


    current +=
      difference * SMOOTHING;


    /*
     * Snap only when imperceptibly close to the target,
     * otherwise continue the easing.
     */
    if (
      Math.abs(difference) < 0.35
    ) {

      current =
        target;

      progress.value =
        current;

      frame =
        null;

      return;

    }


    progress.value =
      current;


    frame =
      requestAnimationFrame(
        animate
      );

  };


  const updateTarget = () => {

    maximum =
      getMaximum();


    target =
      Math.min(
        getScrollPosition(),
        maximum
      );


    progress.max =
      maximum;


    if (!frame) {

      frame =
        requestAnimationFrame(
          animate
        );

    }

  };


  /*
   * Initial state.
   */
  maximum =
    getMaximum();

  current =
    Math.min(
      getScrollPosition(),
      maximum
    );

  target =
    current;

  progress.max =
    maximum;

  progress.value =
    current;


  window.addEventListener(
    "scroll",
    updateTarget,
    {
      passive: true
    }
  );


  window.addEventListener(
    "resize",
    () => {

      configure();

      updateTarget();

    },
    {
      passive: true
    }
  );


  window.addEventListener(
    "load",
    () => {

      configure();

      updateTarget();

    }
  );

})();
