async function loadIPBox() {
	try {
		const res = await fetch("/ip");

		if (!res.ok) {
			throw new Error(`HTTP ${res.status}`);
		}

		const data = await res.json();

		const ipText = data.ip || "unknown";
		const city = data.location?.city || "unknown";
		const region = data.location?.region || "";
		const country = data.location?.country || "unknown";
		const network = data.location?.network || "unknown";

		const ipElement = document.getElementById("ip");

		if (!ipElement) {
			console.error("No element found with id='ip'");
			return;
		}

		ipElement.textContent =
			`${ipText} | ${city}, ${region} ${country} | ${network}`;
	} catch (err) {
		console.error("IP box error:", err);

		const ipElement = document.getElementById("ip");
		if (ipElement) {
			ipElement.textContent = "location unavailable";
		}
	}
}

loadIPBox();