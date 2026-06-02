async function loadIPBox() {
	const res = await fetch("/ip");
	const data = await res.json();

	const ipText = data.ip || "unknown";
	const city = data.location?.city || "unknown";
	const region = data.location?.region || "";
	const country = data.location?.country || "unknown";
	const network = data.location?.network || "unknown";

	document.querySelector(".ip").textContent =
		`${ipText} | ${city}, ${region} ${country} | ${network}`;
}

loadIPBox();