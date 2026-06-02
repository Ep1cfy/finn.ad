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
				<div class="playcount-main">🎵 ${stats.playcount} scrobbles</div>
				<div class="playcount-sub">track: ${stats.topTrack?.title || "unknown"}</div>
				<div class="playcount-sub">artist: ${stats.topArtist?.name || "unknown"}</div>
				<div class="playcount-sub">album: ${stats.topAlbum?.title || "unknown"}</div>
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