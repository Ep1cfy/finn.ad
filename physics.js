function startPhysicsMode() {
	const {
	  Engine,
	  Render,
	  Runner,
	  Bodies,
	  Composite,
	  Mouse,
	  MouseConstraint
	} = Matter;
  
	const engine = Engine.create();
	engine.gravity.y = 1;
  
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
	render.canvas.style.zIndex = "9999";
	render.canvas.style.pointerEvents = "auto";
  
	const bodies = [];
  
	const elements = document.querySelectorAll(".introduction, .now-playing, .taskbar-left");
  
	elements.forEach((el) => {
	  const rect = el.getBoundingClientRect();
  
	  const body = Bodies.rectangle(
		rect.left + rect.width / 2,
		rect.top + rect.height / 2,
		rect.width,
		rect.height,
		{
		  restitution: 0.6,
		  friction: 0.2,
		  render: {
			fillStyle: "#61afef",
			strokeStyle: "#ff5faf",
			lineWidth: 5
		  }
		}
	  );
  
	  el.style.visibility = "hidden";
	  bodies.push(body);
	});
  
	const ground = Bodies.rectangle(
	  window.innerWidth / 2,
	  window.innerHeight + 30,
	  window.innerWidth,
	  60,
	  { isStatic: true }
	);
  
	const leftWall = Bodies.rectangle(
	  -30,
	  window.innerHeight / 2,
	  60,
	  window.innerHeight,
	  { isStatic: true }
	);
  
	const rightWall = Bodies.rectangle(
	  window.innerWidth + 30,
	  window.innerHeight / 2,
	  60,
	  window.innerHeight,
	  { isStatic: true }
	);
  
	Composite.add(engine.world, [...bodies, ground, leftWall, rightWall]);
  
	const mouse = Mouse.create(render.canvas);
	const mouseConstraint = MouseConstraint.create(engine, {
	  mouse,
	  constraint: {
		stiffness: 0.2,
		render: { visible: false }
	  }
	});
  
	Composite.add(engine.world, mouseConstraint);
	render.mouse = mouse;
  
	Render.run(render);
	Runner.run(Runner.create(), engine);
  }