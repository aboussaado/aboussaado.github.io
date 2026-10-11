
document.addEventListener("DOMContentLoaded", () => {
  const container =
    document.querySelector(".cv-page__rossler");

  const svg =
    document.querySelector(".rossler-attractor");

  if (!container || !svg) return;

  const curve =
    svg.querySelector(".rossler-attractor__curve");

  const glow =
    svg.querySelector(".rossler-attractor__glow");

  if (!curve || !glow) return;


  // =======================================================
  // RÖSSLER SYSTEM
  // =======================================================

  const a = 0.2;
  const b = 0.2;
  const c = 5.7;

  const dt = 0.008;

  /*
   * Much longer integration than before.
   *
   * This is what gives us the dense family of revolutions
   * visible in the reference Rössler plot.
   */
  const steps = 52000;
  const discard = 3200;

  /*
   * We keep a long temporal interval but do not need every
   * numerical point for SVG rendering.
   */
  const stride = 6;


  const derivative = ([x, y, z]) => [
    -y - z,
    x + a * y,
    b + z * (x - c),
  ];


  const add = (p, q, s = 1) => [
    p[0] + s * q[0],
    p[1] + s * q[1],
    p[2] + s * q[2],
  ];


  const rk4 = (state) => {
    const k1 = derivative(state);

    const k2 = derivative(
      add(state, k1, dt / 2)
    );

    const k3 = derivative(
      add(state, k2, dt / 2)
    );

    const k4 = derivative(
      add(state, k3, dt)
    );

    return [
      state[0] +
        dt *
        (
          k1[0] +
          2 * k2[0] +
          2 * k3[0] +
          k4[0]
        ) / 6,

      state[1] +
        dt *
        (
          k1[1] +
          2 * k2[1] +
          2 * k3[1] +
          k4[1]
        ) / 6,

      state[2] +
        dt *
        (
          k1[2] +
          2 * k2[2] +
          2 * k3[2] +
          k4[2]
        ) / 6,
    ];
  };


  // =======================================================
  // INTEGRATION
  // =======================================================

  let state = [0.1, 0, 0];

  const points = [];

  for (let i = 0; i < steps; i++) {
    state = rk4(state);

    if (
      i >= discard &&
      (i - discard) % stride === 0
    ) {
      points.push([...state]);
    }
  }


  // =======================================================
  // CENTER
  // =======================================================

  const mean = points
    .reduce(
      (acc, p) => [
        acc[0] + p[0],
        acc[1] + p[1],
        acc[2] + p[2],
      ],
      [0, 0, 0]
    )
    .map(v => v / points.length);


  const centered =
    points.map(([x, y, z]) => [
      x - mean[0],
      y - mean[1],
      z - mean[2],
    ]);


  // =======================================================
  // CAMERA
  //
  // High pitch:
  // - xy spiral becomes an ellipse / "ground plane"
  // - z becomes strongly vertical
  //
  // Much closer to the reference image.
  // =======================================================

  const project = ([x, y, z], yaw, pitch) => {
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);

    const xr =
      x * cy -
      y * sy;

    const yr =
      x * sy +
      y * cy;


    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);

    /*
     * Very slight z emphasis to make the vertical excursion
     * read clearly without exaggerating the mathematics.
     */
    const zStretch = 1.08;

    const screenY =
      yr * cp -
      (z * zStretch) * sp;

    return [
      xr,
      screenY
    ];
  };


  /*
   * Main viewpoint.
   */
  const baseYaw = -0.56;
  const basePitch = 1.18;


  // =======================================================
  // FIXED BOUNDS
  // =======================================================

  const yawSamples = [
    baseYaw - 0.055,
    baseYaw,
    baseYaw + 0.055,
  ];

  const pitchSamples = [
    basePitch - 0.025,
    basePitch,
    basePitch + 0.025,
  ];


  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;


  for (const yaw of yawSamples) {
    for (const pitch of pitchSamples) {
      centered.forEach((p) => {
        const [x, y] =
          project(p, yaw, pitch);

        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);

        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      });
    }
  }


  // =======================================================
  // SVG FIT
  // =======================================================

  const width = 620;
  const height = 420;

  /*
   * Smaller padding = larger illustration.
   */
  const padX = 19;
  const padY = 18;

  const usableW =
    width - 2 * padX;

  const usableH =
    height - 2 * padY;


  const scale = Math.min(
    usableW / (maxX - minX),
    usableH / (maxY - minY)
  );


  const centerX =
    (minX + maxX) / 2;

  const centerY =
    (minY + maxY) / 2;


  const toSvg = ([x, y]) => [
    width / 2 +
      (x - centerX) * scale,

    height / 2 -
      (y - centerY) * scale,
  ];


  // =======================================================
  // RENDER
  // =======================================================

  const render = (yaw, pitch) => {
    const projected =
      centered.map((point) =>
        toSvg(
          project(
            point,
            yaw,
            pitch
          )
        )
      );


    let d = "";

    projected.forEach(([x, y], i) => {
      d +=
        `${i === 0 ? "M" : "L"}` +
        `${x.toFixed(2)},${y.toFixed(2)}`;
    });


    curve.setAttribute("d", d);
    glow.setAttribute("d", d);
  };


  render(
    baseYaw,
    basePitch
  );


  // =======================================================
  // INITIAL DRAW
  // =======================================================

  curve.setAttribute(
    "pathLength",
    "1"
  );

  glow.setAttribute(
    "pathLength",
    "1"
  );


  requestAnimationFrame(() => {
    container.classList.add(
      "is-ready"
    );
  });

});
