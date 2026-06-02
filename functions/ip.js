export async function onRequest(context) {
	const { env, request } = context;

	const ip =
		request.headers.get("CF-Connecting-IP") ||
		request.headers.get("X-Forwarded-For") ||
		"unknown";

	const cf = request.cf || {};

	let network = "unknown";

	if (env.IPINFO_TOKEN && ip !== "unknown") {
		try {
			const ipinfoURL = `https://ipinfo.io/${ip}/json?token=${env.IPINFO_TOKEN}`;
			const ipinfoRes = await fetch(ipinfoURL);
			const ipinfoData = await ipinfoRes.json();

			const privacy = ipinfoData.privacy || {};

			const isVPN =
				privacy.vpn === true ||
				privacy.proxy === true ||
				privacy.tor === true ||
				privacy.relay === true ||
				privacy.hosting === true;

			network = isVPN ? "VPN" : "not VPN";
		} catch (err) {
			network = "unknown";
		}
	}

	return Response.json({
		ip: ip,
		location: {
			country: cf.country || "unknown",
			region: cf.region || "unknown",
			city: cf.city || "unknown",
			timezone: cf.timezone || "unknown",
			network: network,
		},
	});
}