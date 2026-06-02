const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

let w, h;
const seed = Math.random() * 1000;

function resizeCanvas() {
	w = canvas.width = window.innerWidth;
	h = canvas.height = window.innerHeight;
}

function draw(time) {
	time *= 0.00035;

	ctx.clearRect(0, 0, w, h);

	// subtle vignette-ish dark wash
	ctx.fillStyle = "rgba(24, 27, 32, 0.18)";
	ctx.fillRect(0, 0, w, h);

	const spacing = 42; // distance between grid lines
	const amp = 7;      // distortion amount
	const step = 18;    // smoothness of each line segment

	// vertical lines
	for (let baseX = -spacing; baseX <= w + spacing; baseX += spacing) {
		ctx.beginPath();

		for (let y = 0; y <= h; y += step) {
			const x =
				baseX +
				Math.sin(y * 0.012 + time * 2.2 + seed + baseX * 0.01) * amp +
				Math.cos(y * 0.004 + time * 1.3 + seed * 0.7) * (amp * 0.45);

			if (y === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}

		ctx.strokeStyle = "rgba(255, 255, 255, 0.045)";
		ctx.lineWidth = 1;
		ctx.stroke();
	}

	// horizontal lines
	for (let baseY = -spacing; baseY <= h + spacing; baseY += spacing) {
		ctx.beginPath();

		for (let x = 0; x <= w; x += step) {
			const y =
				baseY +
				Math.cos(x * 0.012 + time * 2.0 + seed + baseY * 0.01) * amp +
				Math.sin(x * 0.004 + time * 1.15 + seed * 0.9) * (amp * 0.45);

			if (x === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}

		ctx.strokeStyle = "rgba(97, 175, 239, 0.035)";
		ctx.lineWidth = 1;
		ctx.stroke();
	}

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
	}

	requestAnimationFrame(draw);
}

resizeCanvas();
requestAnimationFrame(draw);
window.addEventListener("resize", resizeCanvas);