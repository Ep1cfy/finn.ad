export async function onRequest(context) {
	const { env } = context;
  
	const apiURL =
	  "https://ws.audioscrobbler.com/2.0/?" +
	  new URLSearchParams({
		method: "user.getrecenttracks",
		user: env.LASTFM_USER,
		api_key: env.LASTFM_API_KEY,
		format: "json",
		limit: "1",
	  });
  
	const res = await fetch(apiURL);
	const data = await res.json();
	const track = data.recenttracks?.track?.[0];
	
	return Response.json({
	  title: track.name,
	  artist: track.artist?.["#text"],
	  album: track.album?.["#text"],
	  image: track.image?.at(-1)?.["#text"],
	  url: track.url,
	  nowPlaying: track["@attr"]?.nowplaying === "true",
	});
  }