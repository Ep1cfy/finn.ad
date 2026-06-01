async function loadLastfm() {
	try {
	  const response = await fetch("/lastfm");
  
	  if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	  }
  
	  const track = await response.json();
	  console.log("Last.fm data:", track);
  
	  document.getElementById("np-track").textContent =
		track.title || "Unknown Track";
  
	  document.getElementById("np-artist").textContent =
		track.artist || "Unknown Artist";
  
	  document.getElementById("np-status").textContent =
		track.nowPlaying ? "now playing" : "last played";
  
	  if (track.image) {
		document.getElementById("np-cover").src = track.image;
	  } else {
		document.getElementById("np-cover").style.display = "none";
		}
		document.getElementById("playcount").textContent =
		"🎵 " + track.playcount || "--";

	} catch (err) {
	  console.error("Last.fm error:", err);
	  document.getElementById("np-track").textContent = "Last.fm unavailable";
	  document.getElementById("np-artist").textContent = "";
	}
  }
  
  loadLastfm();
  setInterval(loadLastfm, 30000);