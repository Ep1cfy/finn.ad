const canvas = document.getElementById("bg-canvas");

if (!canvas) {
	console.error("bg-canvas not found");
} else {
	const ctx = canvas.getContext("2d");

	let w = 0;
	let h = 0;
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
		force: 0,
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

		const movement = Math.hypot(pointer.vx, pointer.vy);

		if (pointer.down) {
			pointer.force = Math.min(120, pointer.force + movement * 0.9);
		} else {
			pointer.force = Math.min(45, pointer.force + movement * 0.25);
		}
	}

	window.addEventListener("pointermove", (event) => {
		updatePointer(event.clientX, event.clientY);
	});

	window.addEventListener("pointerdown", (event) => {
		pointer.down = true;
		updatePointer(event.clientX, event.clientY);
	});

	window.addEventListener("pointerup", () => {
		pointer.down = false;
	});

	window.addEventListener("pointerleave", () => {
		pointer.active = false;
		pointer.down = false;
	});

	function pointerDistortion(x, y) {
		if (!pointer.active) {
			return { x: 0, y: 0 };
		}

		const dx = x - pointer.x;
		const dy = y - pointer.y;
		const dist = Math.sqrt(dx * dx + dy * dy);

		const radius = pointer.down ? 260 : 180;

		if (dist > radius) {
			return { x: 0, y: 0 };
		}

		const falloff = 1 - dist / radius;
		const strength = falloff * falloff * pointer.force;

		const dragX = pointer.vx * 0.35 * falloff;
		const dragY = pointer.vy * 0.35 * falloff;

		const angle = Math.atan2(dy, dx) + Math.PI / 2;
		const swirlAmount = strength * 0.16;

		return {
			x: dragX + Math.cos(angle) * swirlAmount,
			y: dragY + Math.sin(angle) * swirlAmount,
		};
	}

	function draw(timestamp) {
		const time = timestamp * 0.00042;

		ctx.clearRect(0, 0, w, h);

		ctx.fillStyle = "rgba(24, 27, 32, 0.16)";
		ctx.fillRect(0, 0, w, h);

		const spacing = 42;
		const amp = 10;
		const step = 18;

		const cx = w / 2;
		const cy = h / 2;

		pointer.force *= 0.92;

		// Vertical grid lines
		for (let baseX = -spacing; baseX <= w + spacing; baseX += spacing) {
			ctx.beginPath();

			for (let y = 0; y <= h; y += step) {
				const dx = (baseX - cx) / w;
				const dy = (y - cy) / h;
				const r = Math.sqrt(dx * dx + dy * dy);

				const swirl = Math.sin(r * 18 - time * 3 + seed) * 3.5;

				let x =
					baseX +
					Math.sin(y * 0.013 + time * 2.4 + seed + baseX * 0.01) * amp +
					Math.cos(y * 0.005 + time * 1.5 + seed * 0.7) * (amp * 0.55) +
					swirl;

				const distortion = pointerDistortion(x, y);

				x += distortion.x;
				const distortedY = y + distortion.y;

				if (y === 0) {
					ctx.moveTo(x, distortedY);
				} else {
					ctx.lineTo(x, distortedY);
				}
			}

			ctx.strokeStyle = pointer.down
				? "rgba(198, 120, 221, 0.075)"
				: "rgba(255, 255, 255, 0.045)";

			ctx.lineWidth = 1;
			ctx.stroke();
		}

		// Horizontal grid lines
		for (let baseY = -spacing; baseY <= h + spacing; baseY += spacing) {
			ctx.beginPath();

			for (let x = 0; x <= w; x += step) {
				const dx = (x - cx) / w;
				const dy = (baseY - cy) / h;
				const r = Math.sqrt(dx * dx + dy * dy);

				const swirl = Math.cos(r * 18 - time * 3 + seed) * 3.5;

				let y =
					baseY +
					Math.cos(x * 0.013 + time * 2.1 + seed + baseY * 0.01) * amp +
					Math.sin(x * 0.005 + time * 1.25 + seed * 0.9) * (amp * 0.55) +
					swirl;

				const distortion = pointerDistortion(x, y);

				const distortedX = x + distortion.x;
				y += distortion.y;

				if (x === 0) {
					ctx.moveTo(distortedX, y);
				} else {
					ctx.lineTo(distortedX, y);
				}
			}

			ctx.strokeStyle = pointer.down
				? "rgba(97, 175, 239, 0.075)"
				: "rgba(97, 175, 239, 0.038)";

			ctx.lineWidth = 1;
			ctx.stroke();
		}

		// Cursor distortion halo
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
		}

		requestAnimationFrame(draw);
	}

	resizeCanvas();
	requestAnimationFrame(draw);

	window.addEventListener("resize", resizeCanvas);
}