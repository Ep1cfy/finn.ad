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

	const urls = {
		recent: makeURL({
			method: "user.getrecenttracks",
			limit: "1",
		}),

		info: makeURL({
			method: "user.getinfo",
		}),

		topTrackOverall: makeURL({
			method: "user.gettoptracks",
			period: "overall",
			limit: "1",
		}),

		topArtistOverall: makeURL({
			method: "user.gettopartists",
			period: "overall",
			limit: "1",
		}),

		topAlbumOverall: makeURL({
			method: "user.gettopalbums",
			period: "overall",
			limit: "1",
		}),

		topTrack7Day: makeURL({
			method: "user.gettoptracks",
			period: "7day",
			limit: "1",
		}),

		topArtist7Day: makeURL({
			method: "user.gettopartists",
			period: "7day",
			limit: "1",
		}),

		topTrack1Month: makeURL({
			method: "user.gettoptracks",
			period: "1month",
			limit: "1",
		}),

		topArtist1Month: makeURL({
			method: "user.gettopartists",
			period: "1month",
			limit: "1",
		}),

		topTrack12Month: makeURL({
			method: "user.gettoptracks",
			period: "12month",
			limit: "1",
		}),

		topArtist12Month: makeURL({
			method: "user.gettopartists",
			period: "12month",
			limit: "1",
		}),
	};

	const responses = await Promise.all(
		Object.values(urls).map((url) => fetch(url))
	);

	const [
		recentData,
		infoData,
		topTrackOverallData,
		topArtistOverallData,
		topAlbumOverallData,
		topTrack7DayData,
		topArtist7DayData,
		topTrack1MonthData,
		topArtist1MonthData,
		topTrack12MonthData,
		topArtist12MonthData,
	] = await Promise.all(responses.map((res) => res.json()));

	const recent = recentData.recenttracks?.track?.[0];

	const user = infoData.user;
	const registeredUnix = Number(user?.registered?.unixtime || 0);
	const registeredDate = registeredUnix
		? new Date(registeredUnix * 1000)
		: null;

	const accountAgeDays = registeredDate
		? Math.floor((Date.now() - registeredDate.getTime()) / 86400000)
		: null;

	const avgScrobblesPerDay =
		accountAgeDays && Number(user?.playcount)
			? Math.round(Number(user.playcount) / accountAgeDays)
			: null;

	const getTopTrack = (data) => {
		const track = data.toptracks?.track?.[0];
		if (!track) return null;

		return {
			title: track.name,
			artist: track.artist?.name,
			playcount: track.playcount,
			url: track.url,
		};
	};

	const getTopArtist = (data) => {
		const artist = data.topartists?.artist?.[0];
		if (!artist) return null;

		return {
			name: artist.name,
			playcount: artist.playcount,
			url: artist.url,
		};
	};

	const getTopAlbum = (data) => {
		const album = data.topalbums?.album?.[0];
		if (!album) return null;

		return {
			title: album.name,
			artist: album.artist?.name,
			playcount: album.playcount,
			url: album.url,
		};
	};

	return Response.json({
		now: recent
			? {
					title: recent.name,
					artist: recent.artist?.["#text"],
					album: recent.album?.["#text"],
					image: recent.image?.at(-1)?.["#text"],
					url: recent.url,
					nowPlaying: recent["@attr"]?.nowplaying === "true",
			  }
			: null,

		stats: {
			username: user?.name,
			playcount: user?.playcount || "0",
			registeredDate: registeredDate
				? registeredDate.toISOString().split("T")[0]
				: null,
			accountAgeDays,
			avgScrobblesPerDay,

			overall: {
				topTrack: getTopTrack(topTrackOverallData),
				topArtist: getTopArtist(topArtistOverallData),
				topAlbum: getTopAlbum(topAlbumOverallData),
			},

			sevenDay: {
				topTrack: getTopTrack(topTrack7DayData),
				topArtist: getTopArtist(topArtist7DayData),
			},

			oneMonth: {
				topTrack: getTopTrack(topTrack1MonthData),
				topArtist: getTopArtist(topArtist1MonthData),
			},

			twelveMonth: {
				topTrack: getTopTrack(topTrack12MonthData),
				topArtist: getTopArtist(topArtist12MonthData),
			},
		},
	});
}