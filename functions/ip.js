export async function onRequest(context) {
	const { env, request } = context;

	const ip =
		request.headers.get("CF-Connecting-IP") ||
		request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
		"unknown";

	const cf = request.cf || {};

	let ipinfo = null;
	let network = "unknown";

	if (env.IPINFO_TOKEN && ip !== "unknown") {
		try {
			const ipinfoURL = `https://ipinfo.io/${ip}/json?token=${env.IPINFO_TOKEN}`;
			const ipinfoRes = await fetch(ipinfoURL);
			ipinfo = await ipinfoRes.json();

			const privacy = ipinfo.privacy || {};

			const isVPN =
				privacy.vpn === true ||
				privacy.proxy === true ||
				privacy.tor === true ||
				privacy.relay === true ||
				privacy.hosting === true;

			network = isVPN ? "VPN" : "not VPN";
		} catch (err) {
			ipinfo = {
				error: "ipinfo lookup failed"
			};
			network = "unknown";
		}
	}

	return Response.json({
		ip,

		cloudflare: {
			country: cf.country || "unknown",
			region: cf.region || "unknown",
			regionCode: cf.regionCode || "unknown",
			city: cf.city || "unknown",
			postalCode: cf.postalCode || "unknown",
			timezone: cf.timezone || "unknown",
			latitude: cf.latitude || "unknown",
			longitude: cf.longitude || "unknown",
			continent: cf.continent || "unknown",
			asn: cf.asn || "unknown",
			asOrganization: cf.asOrganization || "unknown",
			httpProtocol: cf.httpProtocol || "unknown",
			tlsVersion: cf.tlsVersion || "unknown",
			tlsCipher: cf.tlsCipher || "unknown",
			clientTcpRtt: cf.clientTcpRtt || "unknown",
			colo: cf.colo || "unknown"
		},

		ipinfo: ipinfo || {
			status: "not enabled",
			message: "Set IPINFO_TOKEN in Cloudflare Pages environment variables"
		},

		network
	});
}