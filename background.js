const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

let w, h;
const seed = Math.random() * 1000;

const pointer = {
	x: 0,
	y: 0,
	px: 0,
	py: 0,
	vx: 0,
	vy: 0,
	down: false,
	active: false,
	force: 0
};

function resizeCanvas() {
	w = canvas.width = window.innerWidth;
	h = canvas.height = window.innerHeight;
}

function updatePointer(x, y) {
	pointer.vx = x - pointer.x;
	pointer.vy = y - pointer.y;

	pointer.px = pointer.x;
	pointer.py = pointer.y;

	pointer.x = x;
	pointer.y = y;

	pointer.active = true;

	if (pointer.down) {
		pointer.force = Math.min(
			120,
			pointer.force + Math.hypot(pointer.vx, pointer.vy) * 0.9
		);
	} else {
		pointer.force = Math.min(
			45,
			pointer.force + Math.hypot(pointer.vx, pointer.vy) * 0.25
		);
	}
}

window.addEventListener("pointermove", (e) => {
	updatePointer(e.clientX, e.clientY);
});

window.addEventListener("pointerdown", (e) => {
	pointer.down = true;
	updatePointer(e.clientX, e.clientY);
});

window.addEventListener("pointerup", () => {
	pointer.down = false;
});

window.addEventListener("pointerleave", () => {
	pointer.active = false;
	pointer.down = false;
});

function pointerDistortion(x, y) {
	if (!pointer.active) return { x: 0, y: 0 };

	const dx = x - pointer.x;
	const dy = y - pointer.y;
	const dist = Math.sqrt(dx * dx + dy * dy);

	const radius = pointer.down ? 260 : 180;

	if (dist > radius) return { x: 0, y: 0 };

	const falloff = 1 - dist / radius;
	const strength = falloff * falloff * pointer.force;

	// drag direction distortion
	const dragX = pointer.vx * 0.35 * falloff;
	const dragY = pointer.vy * 0.35 * falloff;

	// swirl around cursor
	const angle = Math.atan2(dy, dx) + Math.PI / 2;
	const swirlAmount = strength * 0.16;

	return {
		x: dragX + Math.cos(angle) * swirlAmount,
		y: dragY + Math.sin(angle) * swirlAmount
	};
}

function draw(time) {
	time *= 0.00035;

	ctx.clearRect(0, 0, w, h);

	// subtle vignette-ish dark wash
	ctx.fillStyle = "rgba(24, 27, 32, 0.18)";
	ctx.fillRect(0, 0, w, h);

<<<<<<< HEAD
	const spacing = 42;
	const amp = 10;
	const step = 18;

	const cx = w / 2;
	const cy = h / 2;
=======
	const spacing = 42; // distance between grid lines
	const amp = 7;      // distortion amount
	const step = 18;    // smoothness of each line segment
>>>>>>> parent of ab6bc7d (math update again)

	pointer.force *= 0.92;

	// vertical lines
	for (let baseX = -spacing; baseX <= w + spacing; baseX += spacing) {
		ctx.beginPath();

		for (let y = 0; y <= h; y += step) {
<<<<<<< HEAD
			const dx = (baseX - cx) / w;
			const dy = (y - cy) / h;
			const r = Math.sqrt(dx * dx + dy * dy);

			const swirl = Math.sin(r * 18 - time * 3 + seed) * 3.5;

			let x =
=======
			const x =
>>>>>>> parent of ab6bc7d (math update again)
				baseX +
				Math.sin(y * 0.012 + time * 2.2 + seed + baseX * 0.01) * amp +
				Math.cos(y * 0.004 + time * 1.3 + seed * 0.7) * (amp * 0.45);

			const distortion = pointerDistortion(x, y);

			x += distortion.x;
			const yy = y + distortion.y;

			if (y === 0) ctx.moveTo(x, yy);
			else ctx.lineTo(x, yy);
		}

		ctx.strokeStyle = pointer.down
			? "rgba(198, 120, 221, 0.075)"
			: "rgba(255, 255, 255, 0.045)";

		ctx.lineWidth = 1;
		ctx.stroke();
	}

	// horizontal lines
	for (let baseY = -spacing; baseY <= h + spacing; baseY += spacing) {
		ctx.beginPath();

		for (let x = 0; x <= w; x += step) {
<<<<<<< HEAD
			const dx = (x - cx) / w;
			const dy = (baseY - cy) / h;
			const r = Math.sqrt(dx * dx + dy * dy);

			const swirl = Math.cos(r * 18 - time * 3 + seed) * 3.5;

			let y =
=======
			const y =
>>>>>>> parent of ab6bc7d (math update again)
				baseY +
				Math.cos(x * 0.012 + time * 2.0 + seed + baseY * 0.01) * amp +
				Math.sin(x * 0.004 + time * 1.15 + seed * 0.9) * (amp * 0.45);

			const distortion = pointerDistortion(x, y);

			const xx = x + distortion.x;
			y += distortion.y;

			if (x === 0) ctx.moveTo(xx, y);
			else ctx.lineTo(xx, y);
		}

<<<<<<< HEAD
		ctx.strokeStyle = pointer.down
			? "rgba(97, 175, 239, 0.075)"
			: "rgba(97, 175, 239, 0.038)";

=======
		ctx.strokeStyle = "rgba(97, 175, 239, 0.035)";
>>>>>>> parent of ab6bc7d (math update again)
		ctx.lineWidth = 1;
		ctx.stroke();
	}

<<<<<<< HEAD
	// cursor distortion halo
	if (pointer.active && pointer.force > 1) {
		const radius = pointer.down ? 260 : 180;

		const gradient = ctx.createRadialGradient(
			pointer.x,
			pointer.y,
			0,
			pointer.x,
			pointer.y,
			radius
		);

		gradient.addColorStop(0, "rgba(198, 120, 221, 0.055)");
		gradient.addColorStop(0.45, "rgba(97, 175, 239, 0.025)");
		gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2);
		ctx.fill();
=======
	// occasional brighter intersections / nodes
	for (let gx = 0; gx <= w; gx += spacing * 2) {
		for (let gy = 0; gy <= h; gy += spacing * 2) {
			const px = gx + Math.sin(time * 2 + gy * 0.01 + seed) * 4;
			const py = gy + Math.cos(time * 2 + gx * 0.01 + seed) * 4;

			ctx.beginPath();
			ctx.arc(px, py, 0.8, 0, Math.PI * 2);
			ctx.fillStyle = "rgba(198, 120, 221, 0.06)";
			ctx.fill();
		}
>>>>>>> parent of ab6bc7d (math update again)
	}

	requestAnimationFrame(draw);
}

resizeCanvas();
requestAnimationFrame(draw);
window.addEventListener("resize", resizeCanvas);