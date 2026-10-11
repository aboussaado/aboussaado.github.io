
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".publications-page__lorenz");
  const svg = document.querySelector(".lorenz-63");

  if (!container || !svg) return;

  const curve = svg.querySelector(".lorenz-63__curve");
  const glow = svg.querySelector(".lorenz-63__glow");

  if (!curve || !glow) return;

  const sigma = 10;
  const rho = 28;
  const beta = 8 / 3;

  const dt = 0.005;
  const steps = 12000;
  const discard = 1800;
  const stride = 2;

  let state = [0.1, 0.0, 0.0];

  const derivative = ([x, y, z]) => [
    sigma * (y - x),
    x * (rho - z) - y,
    x * y - beta * z,
  ];

  const add = (a, b, scale = 1) => [
    a[0] + b[0] * scale,
    a[1] + b[1] * scale,
    a[2] + b[2] * scale,
  ];

  const rk4 = (s) => {
    const k1 = derivative(s);
    const k2 = derivative(add(s, k1, dt / 2));
    const k3 = derivative(add(s, k2, dt / 2));
    const k4 = derivative(add(s, k3, dt));

    return [
      s[0] + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
      s[1] + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
      s[2] + (dt / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]),
    ];
  };


  // -------------------------------------------------------
  // Integrate the actual Lorenz 63 system
  // -------------------------------------------------------

  const points = [];

  for (let i = 0; i < steps; i++) {
    state = rk4(state);

    if (i >= discard && i % stride === 0) {
      points.push([...state]);
    }
  }


  // -------------------------------------------------------
  // Centre the trajectory in 3D
  // -------------------------------------------------------

  const center = points.reduce(
    (acc, [x, y, z]) => [
      acc[0] + x,
      acc[1] + y,
      acc[2] + z,
    ],
    [0, 0, 0]
  ).map(value => value / points.length);

  const centered = points.map(([x, y, z]) => [
    x - center[0],
    y - center[1],
    z - center[2],
  ]);


  // -------------------------------------------------------
  // Projection
  // -------------------------------------------------------

  const project = ([x, y, z], yaw, pitch) => {
    // rotation around vertical axis
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);

    const x1 = x * cosY - y * sinY;
    const y1 = x * sinY + y * cosY;

    // slight vertical tilt
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);

    const screenY = z * cosP - y1 * sinP;

    return [x1, screenY];
  };


  // -------------------------------------------------------
  // Fixed bounds across the whole animation range.
  // Prevents the drawing from changing apparent size.
  // -------------------------------------------------------

  const yawSamples = [-0.34, -0.22, -0.10, 0.02, 0.14];
  const pitchSamples = [0.08, 0.13, 0.18];

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  yawSamples.forEach((yaw) => {
    pitchSamples.forEach((pitch) => {
      centered.forEach((point) => {
        const [x, y] = project(point, yaw, pitch);

        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      });
    });
  });


  const width = 620;
  const height = 420;

  const padX = 34;
  const padY = 30;

  const scaleX = (width - 2 * padX) / (maxX - minX);
  const scaleY = (height - 2 * padY) / (maxY - minY);
  const scale = Math.min(scaleX, scaleY);

  const usedWidth = (maxX - minX) * scale;
  const usedHeight = (maxY - minY) * scale;

  const offsetX = (width - usedWidth) / 2;
  const offsetY = (height - usedHeight) / 2;


  const render = (yaw, pitch) => {
    const d = centered
      .map((point, index) => {
        const [x, y] = project(point, yaw, pitch);

        const X = offsetX + (x - minX) * scale;
        const Y =
          height -
          (offsetY + (y - minY) * scale);

        return `${index === 0 ? "M" : "L"}${X.toFixed(2)},${Y.toFixed(2)}`;
      })
      .join(" ");

    curve.setAttribute("d", d);
    glow.setAttribute("d", d);
  };


  // -------------------------------------------------------
  // Initial position
  // -------------------------------------------------------

  const baseYaw = -0.10;
  const basePitch = 0.13;

  render(baseYaw, basePitch);

  curve.setAttribute("pathLength", "1");
  glow.setAttribute("pathLength", "1");

  requestAnimationFrame(() => {
    container.classList.add("is-ready");
  });


  // -------------------------------------------------------
  // Accessibility
  // -------------------------------------------------------

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (reducedMotion.matches) return;


  // -------------------------------------------------------
  // Only animate while visible
  // -------------------------------------------------------

  let visible = true;

  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
    },
    {
      threshold: 0.05,
    }
  );

  observer.observe(container);


  // -------------------------------------------------------
  // Slow orbital motion
  // -------------------------------------------------------

  let previousFrame = 0;

  const animate = (time) => {
    requestAnimationFrame(animate);

    if (!visible || document.hidden) return;

    // ~30 fps is plenty for this illustration.
    if (time - previousFrame < 22) return;

    previousFrame = time;

    /*
     * Very slow movement:
     * roughly 30–40 seconds per oscillation.
     *
     * Nothing in the underlying Lorenz trajectory changes;
     * only our 3D viewing angle changes.
     */
    const yaw =
      baseYaw +
      0.20 * Math.sin(time * 0.00019);

    const pitch =
      basePitch +
      0.045 * Math.sin(time * 0.00014 + 1.1);

    render(yaw, pitch);
  };

  requestAnimationFrame(animate);
});
