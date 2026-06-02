const cursor = document.getElementById("cursor");
const cursorDot = document.getElementById("cursor-dot");

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

let cursorX = mouseX;
let cursorY = mouseY;

window.addEventListener("mousemove", (e) => {
	mouseX = e.clientX;
	mouseY = e.clientY;

	cursorDot.style.left = `${mouseX}px`;
	cursorDot.style.top = `${mouseY}px`;
});

function animateCursor() {
	cursorX += (mouseX - cursorX) * 0.18;
	cursorY += (mouseY - cursorY) * 0.18;

	cursor.style.left = `${cursorX}px`;
	cursor.style.top = `${cursorY}px`;

	requestAnimationFrame(animateCursor);
}

animateCursor();

const hoverTargets = "a, button, img, .physics-sim-icon, .lastfm-link, .timeline-item";

document.querySelectorAll(hoverTargets).forEach((el) => {
	el.addEventListener("mouseenter", () => {
		cursor.classList.add("cursor-hover");
	});

	el.addEventListener("mouseleave", () => {
		cursor.classList.remove("cursor-hover");
	});
});

window.addEventListener("mousedown", () => {
	cursor.classList.add("cursor-click");
});

window.addEventListener("mouseup", () => {
	cursor.classList.remove("cursor-click");
});