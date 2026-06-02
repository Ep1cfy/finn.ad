const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

let width;
let height;
let particles = [];

const seed = Math.random() * 10000;

function resizeCanvas() {
	width = canvas.width = window.innerWidth;
	height = canvas.height = window.innerHeight;
}

function makeParticles() {
	particles = [];

	const count = Math.floor((width * height) / 18000);

	for (let i = 0; i < count; i++) {
		particles.push({
			x: Math.random() * width,
			y: Math.random() * height,
			age: Math.random() * 200,
			speed: 0.25 + Math.random() * 0.45,
			offset: Math.random() * 1000,
		});
	}
}

function field(x, y, t, offset) {
	const nx = x / width - 0.5;
	const ny = y / height - 0.5;

	const dist = Math.sqrt(nx * nx + ny * ny);
	const angleToCenter = Math.atan2(ny, nx);

	const swirl =
		angleToCenter +
		Math.sin(dist * 12 + t * 0.0003 + seed + offset) * 1.2 +
		Math.cos(nx * 8 + ny * 6 + seed) * 0.7;

	return swirl + Math.PI / 2;
}

function draw(time) {
	ctx.fillStyle = "rgba(31, 35, 41, 0.08)";
	ctx.fillRect(0, 0, width, height);

	for (const p of particles) {
		const angle = field(p.x, p.y, time, p.offset);

		const oldX = p.x;
		const oldY = p.y;

		p.x += Math.cos(angle) * p.speed;
		p.y += Math.sin(angle) * p.speed;

		p.age++;

		const alpha = Math.max(0, 0.14 - p.age / 1800);

		ctx.beginPath();
		ctx.moveTo(oldX, oldY);
		ctx.lineTo(p.x, p.y);

		ctx.strokeStyle = `rgba(97, 175, 239, ${alpha})`;
		ctx.lineWidth = 1;
		ctx.stroke();

		if (
			p.x < -20 ||
			p.x > width + 20 ||
			p.y < -20 ||
			p.y > height + 20 ||
			p.age > 600
		) {
			p.x = Math.random() * width;
			p.y = Math.random() * height;
			p.age = 0;
			p.speed = 0.25 + Math.random() * 0.45;
			p.offset = Math.random() * 1000;
		}
	}

	requestAnimationFrame(draw);
}

resizeCanvas();
makeParticles();
requestAnimationFrame(draw);

window.addEventListener("resize", () => {
	resizeCanvas();
	makeParticles();
});