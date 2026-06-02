async function loadLastfm() {
	try {
		const response = await fetch("/lastfm");

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const data = await response.json();
		console.log("Last.fm data:", data);

		const track = data.now;
		const stats = data.stats;

		if (track) {
			document.getElementById("np-track").textContent =
				track.title || "Unknown Track";

			document.getElementById("np-artist").textContent =
				track.artist || "Unknown Artist";

			document.getElementById("np-status").textContent =
				track.nowPlaying ? "now playing" : "last played";

			if (track.image) {
				document.getElementById("np-cover").src = track.image;
				document.getElementById("np-cover").style.display = "block";
			} else {
				document.getElementById("np-cover").style.display = "none";
			}
		}

		const playcountElement = document.getElementById("playcount");

		if (playcountElement && stats) {
			playcountElement.innerHTML = `
				<div class="playcount-label">last.fm stats</div>
		
				<div class="playcount-main">♫ ${Number(stats.playcount).toLocaleString()} scrobbles</div>
		
				<div class="playcount-grid">
					<div>
						<span class="stat-key">avg/day</span>
						<span class="stat-value">${stats.avgScrobblesPerDay || "--"}</span>
					</div>
		
					<div>
						<span class="stat-key">since</span>
						<span class="stat-value">${stats.registeredDate || "--"}</span>
					</div>
				</div>
		
				<div class="stat-section">
					<div class="stat-section-title">overall</div>
					<div class="playcount-sub">track: ${stats.overall?.topTrack?.title || "unknown"}</div>
					<div class="playcount-sub">artist: ${stats.overall?.topArtist?.name || "unknown"}</div>
					<div class="playcount-sub">album: ${stats.overall?.topAlbum?.title || "unknown"}</div>
				</div>
		
				<div class="stat-section">
					<div class="stat-section-title">this week</div>
					<div class="playcount-sub">track: ${stats.sevenDay?.topTrack?.title || "unknown"}</div>
					<div class="playcount-sub">artist: ${stats.sevenDay?.topArtist?.name || "unknown"}</div>
				</div>
		
				<div class="stat-section">
					<div class="stat-section-title">this month</div>
					<div class="playcount-sub">track: ${stats.oneMonth?.topTrack?.title || "unknown"}</div>
					<div class="playcount-sub">artist: ${stats.oneMonth?.topArtist?.name || "unknown"}</div>
				</div>
			`;
		}
	} catch (err) {
		console.error("Last.fm error:", err);

		document.getElementById("np-track").textContent = "Last.fm unavailable";
		document.getElementById("np-artist").textContent = "";

		const playcountElement = document.getElementById("playcount");
		if (playcountElement) {
			playcountElement.textContent = "stats unavailable";
		}
	}
}

loadLastfm();
setInterval(loadLastfm, 30000);