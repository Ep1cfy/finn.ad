console.log("background script loaded");

const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let t = 0;

function draw() {
	t += 0.01;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (let i = 0; i < 80; i++) {
		const x =
			canvas.width / 2 +
			Math.cos(t + i * 0.35) * (80 + i * 6);

		const y =
			canvas.height / 2 +
			Math.sin(t + i * 0.35) * (80 + i * 3);

		ctx.beginPath();
		ctx.arc(x, y, 2, 0, Math.PI * 2);
		ctx.fillStyle = "rgba(97, 175, 239, 0.35)";
		ctx.fill();
	}

	requestAnimationFrame(draw);
}

draw();