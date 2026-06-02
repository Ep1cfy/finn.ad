export async function onRequest(context) {
	const { env } = context;

	const baseURL = "https://ws.audioscrobbler.com/2.0/";

	const makeURL = (params) =>
		baseURL +
		"?" +
		new URLSearchParams({
			user: env.LASTFM_USER,
			api_key: env.LASTFM_API_KEY,
			format: "json",
			...params,
		});

	const recentTracksURL = makeURL({
		method: "user.getrecenttracks",
		limit: "1",
	});

	const userInfoURL = makeURL({
		method: "user.getinfo",
	});

	const topTracksURL = makeURL({
		method: "user.gettoptracks",
		period: "overall",
		limit: "1",
	});

	const topArtistsURL = makeURL({
		method: "user.gettopartists",
		period: "overall",
		limit: "1",
	});

	const topAlbumsURL = makeURL({
		method: "user.gettopalbums",
		period: "overall",
		limit: "1",
	});

	const [
		recentTracksRes,
		userInfoRes,
		topTracksRes,
		topArtistsRes,
		topAlbumsRes,
	] = await Promise.all([
		fetch(recentTracksURL),
		fetch(userInfoURL),
		fetch(topTracksURL),
		fetch(topArtistsURL),
		fetch(topAlbumsURL),
	]);

	const recentTracksData = await recentTracksRes.json();
	const userInfoData = await userInfoRes.json();
	const topTracksData = await topTracksRes.json();
	const topArtistsData = await topArtistsRes.json();
	const topAlbumsData = await topAlbumsRes.json();

	const track = recentTracksData.recenttracks?.track?.[0];
	const topTrack = topTracksData.toptracks?.track?.[0];
	const topArtist = topArtistsData.topartists?.artist?.[0];
	const topAlbum = topAlbumsData.topalbums?.album?.[0];

	return Response.json({
		now: track
			? {
					title: track.name,
					artist: track.artist?.["#text"],
					album: track.album?.["#text"],
					image: track.image?.at(-1)?.["#text"],
					url: track.url,
					nowPlaying: track["@attr"]?.nowplaying === "true",
			  }
			: null,

		stats: {
			playcount: userInfoData.user?.playcount || "0",

			topTrack: topTrack
				? {
						title: topTrack.name,
						artist: topTrack.artist?.name,
						playcount: topTrack.playcount,
						url: topTrack.url,
				  }
				: null,

			topArtist: topArtist
				? {
						name: topArtist.name,
						playcount: topArtist.playcount,
						url: topArtist.url,
				  }
				: null,

			topAlbum: topAlbum
				? {
						title: topAlbum.name,
						artist: topAlbum.artist?.name,
						playcount: topAlbum.playcount,
						url: topAlbum.url,
				  }
				: null,
		},
	});
}