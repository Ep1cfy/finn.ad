let physicsStarted = false;

function startPhysicsMode() {
  if (physicsStarted) return;
  physicsStarted = true;

  const {
    Engine,
    Render,
    Runner,
    Bodies,
    Composite,
    Mouse,
    MouseConstraint,
    Events
  } = Matter;

  const engine = Engine.create();
  engine.gravity.y = 1;
  const viewportScale = Math.max(
    0.42,
    Math.min(1, Math.min(window.innerWidth / 1200, window.innerHeight / 800))
  );

  // Static overlay label
  const label = document.createElement("div");
  label.className = "physics-active-label";
  label.textContent = "physics sim active";
  document.body.appendChild(label);

  const render = Render.create({
    element: document.body,
    engine,
    options: {
      width: window.innerWidth,
      height: window.innerHeight,
      wireframes: false,
      background: "transparent"
    }
  });

  render.canvas.style.position = "fixed";
  render.canvas.style.top = "0";
  render.canvas.style.left = "0";
  render.canvas.style.zIndex = "9998";
  render.canvas.style.pointerEvents = "auto";

  const bodies = [];

  const elements = document.querySelectorAll(
    ".physics-object, .now-playing, .taskbar-left, .taskbar-center,.ipbox,.socials-card"
  );

  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const bodyWidth = rect.width * viewportScale;
    const bodyHeight = rect.height * viewportScale;

    const body = Bodies.rectangle(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      bodyWidth,
      bodyHeight,
      {
        restitution: 0.65,
        friction: 0.25,
        frictionAir: 0.015,
        render: {
          fillStyle: "rgba(44, 49, 60, 0.92)",
          strokeStyle: "#56b6c2",
          lineWidth: Math.max(1, 2 * viewportScale)
        }
      }
    );

    body.plugin = {
      gridWidth: bodyWidth,
      gridHeight: bodyHeight,
      gridSize: Math.max(8, 14 * viewportScale)
    };

    el.style.visibility = "hidden";
    bodies.push(body);
  });

  const thickness = 80 * viewportScale;

  const ground = Bodies.rectangle(
    window.innerWidth / 2,
    window.innerHeight + thickness / 2,
    window.innerWidth,
    thickness,
    { isStatic: true }
  );

  const ceiling = Bodies.rectangle(
    window.innerWidth / 2,
    -thickness / 2,
    window.innerWidth,
    thickness,
    { isStatic: true }
  );

  const leftWall = Bodies.rectangle(
    -thickness / 2,
    window.innerHeight / 2,
    thickness,
    window.innerHeight,
    { isStatic: true }
  );

  const rightWall = Bodies.rectangle(
    window.innerWidth + thickness / 2,
    window.innerHeight / 2,
    thickness,
    window.innerHeight,
    { isStatic: true }
  );

  Composite.add(engine.world, [
    ...bodies,
    ground,
    ceiling,
    leftWall,
    rightWall
  ]);

  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: {
      stiffness: 0.18,
      render: { visible: false }
    }
  });

  Composite.add(engine.world, mouseConstraint);
  render.mouse = mouse;

  // Draw grid lines over the physics objects
  Events.on(render, "afterRender", () => {
    const ctx = render.context;

    bodies.forEach((body) => {
      const width = body.plugin.gridWidth;
      const height = body.plugin.gridHeight;
      const gridSize = body.plugin.gridSize;

      ctx.save();

      ctx.translate(body.position.x, body.position.y);
      ctx.rotate(body.angle);

      ctx.strokeStyle = "rgba(209, 154, 102, 0.45)";
      ctx.lineWidth = 1;

      for (let x = -width / 2; x <= width / 2; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, -height / 2);
        ctx.lineTo(x, height / 2);
        ctx.stroke();
      }

      for (let y = -height / 2; y <= height / 2; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(-width / 2, y);
        ctx.lineTo(width / 2, y);
        ctx.stroke();
      }

      ctx.restore();
    });
  });

  Render.run(render);
  Runner.run(Runner.create(), engine);
}
