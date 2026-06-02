const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

let w, h;
const seed = Math.random() * 1000;

function resizeCanvas() {
	w = canvas.width = window.innerWidth;
	h = canvas.height = window.innerHeight;
}

function draw(time) {
	time *= 0.00042;

	ctx.clearRect(0, 0, w, h);

	ctx.fillStyle = "rgba(24, 27, 32, 0.16)";
	ctx.fillRect(0, 0, w, h);

	const spacing = 42;
	const amp = 10;   // was lower before
	const step = 18;

	const cx = w / 2;
	const cy = h / 2;

	// vertical lines
	for (let baseX = -spacing; baseX <= w + spacing; baseX += spacing) {
		ctx.beginPath();

		for (let y = 0; y <= h; y += step) {
			const dx = (baseX - cx) / w;
			const dy = (y - cy) / h;
			const r = Math.sqrt(dx * dx + dy * dy);

			const swirl =
				Math.sin(r * 18 - time * 3 + seed) * 3.5;

			const x =
				baseX +
				Math.sin(y * 0.013 + time * 2.4 + seed + baseX * 0.01) * amp +
				Math.cos(y * 0.005 + time * 1.5 + seed * 0.7) * (amp * 0.55) +
				swirl;

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
			const dx = (x - cx) / w;
			const dy = (baseY - cy) / h;
			const r = Math.sqrt(dx * dx + dy * dy);

			const swirl =
				Math.cos(r * 18 - time * 3 + seed) * 3.5;

			const y =
				baseY +
				Math.cos(x * 0.013 + time * 2.1 + seed + baseY * 0.01) * amp +
				Math.sin(x * 0.005 + time * 1.25 + seed * 0.9) * (amp * 0.55) +
				swirl;

			if (x === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}

		ctx.strokeStyle = "rgba(97, 175, 239, 0.038)";
		ctx.lineWidth = 1;
		ctx.stroke();
	}

	// subtle nodes
	for (let gx = 0; gx <= w; gx += spacing * 2) {
		for (let gy = 0; gy <= h; gy += spacing * 2) {
			const dx = (gx - cx) / w;
			const dy = (gy - cy) / h;
			const r = Math.sqrt(dx * dx + dy * dy);

			const px = gx + Math.sin(time * 2.2 + gy * 0.01 + seed + r * 10) * 5;
			const py = gy + Math.cos(time * 2.2 + gx * 0.01 + seed + r * 10) * 5;

			ctx.beginPath();
			ctx.arc(px, py, 0.8, 0, Math.PI * 2);
			ctx.fillStyle = "rgba(198, 120, 221, 0.065)";
			ctx.fill();
		}
	}

	requestAnimationFrame(draw);
}

resizeCanvas();
requestAnimationFrame(draw);
window.addEventListener("resize", resizeCanvas);