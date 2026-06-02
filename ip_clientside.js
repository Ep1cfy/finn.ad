async function loadIPBox() {
	try {
		const res = await fetch("/ip");

		if (!res.ok) {
			throw new Error(`HTTP ${res.status}`);
		}

		const data = await res.json();

		const ipElement = document.getElementById("ip");

		if (!ipElement) {
			console.error("No element found with id='ip'");
			return;
		}

		const ip = data.ip || "unknown";

		const city =
			data.cloudflare?.city ||
			data.ipinfo?.city ||
			"unknown";

		const region =
			data.cloudflare?.region ||
			data.ipinfo?.region ||
			"";

		const country =
			data.cloudflare?.country ||
			data.ipinfo?.country ||
			"unknown";

		const asn =
			data.cloudflare?.asn ||
			data.ipinfo?.asn?.asn ||
			"unknown ASN";

		const org =
			data.cloudflare?.asOrganization ||
			data.ipinfo?.org ||
			data.ipinfo?.asn?.name ||
			"unknown network";

		const timezone =
			data.cloudflare?.timezone ||
			data.ipinfo?.timezone ||
			"unknown timezone";

		const network = data.network || "unknown";

		ipElement.textContent =
			`🌐 ${ip} | ${city}, ${region}, ${country} | ${org} (${asn}) | ${timezone} | ${network}`;
	} catch (err) {
		console.error("IP box error:", err);

		const ipElement = document.getElementById("ip");
		if (ipElement) {
			ipElement.textContent = "location unavailable";
		}
	}
}

loadIPBox();