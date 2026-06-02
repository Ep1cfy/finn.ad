const localStartedAt = Date.now();

let weatherUnit = localStorage.getItem("weatherUnit") || "fahrenheit";
let cachedWeather = "loading...";
let lastWeatherFetch = 0;

function formatUptime(ms) {
	const totalSeconds = Math.floor(ms / 1000);

	const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
	const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
	const seconds = String(totalSeconds % 60).padStart(2, "0");

	return `${hours}:${minutes}:${seconds}`;
}

function weatherCodeToText(code) {
	const codes = {
		0: "clear",
		1: "mostly clear",
		2: "partly cloudy",
		3: "cloudy",
		45: "fog",
		48: "fog",
		51: "light drizzle",
		53: "drizzle",
		55: "heavy drizzle",
		61: "light rain",
		63: "rain",
		65: "heavy rain",
		71: "light snow",
		73: "snow",
		75: "heavy snow",
		80: "rain showers",
		81: "rain showers",
		82: "heavy showers",
		95: "thunderstorm"
	};

	return codes[code] || "unknown";
}

async function getAnnArborWeather() {
	const unitParam = weatherUnit === "celsius" ? "celsius" : "fahrenheit";

	const url =
		"https://api.open-meteo.com/v1/forecast?" +
		new URLSearchParams({
			latitude: "42.2808",
			longitude: "-83.7430",
			current: "temperature_2m,weather_code",
			temperature_unit: unitParam,
			timezone: "America/Detroit"
		});

	const res = await fetch(url);
	const data = await res.json();

	const temp = Math.round(data.current.temperature_2m);
	const code = data.current.weather_code;
	const symbol = weatherUnit === "celsius" ? "°C" : "°F";

	return `${temp}${symbol} ${weatherCodeToText(code)}`;
}

async function updateWeather(force = false) {
	const now = Date.now();

	if (!force && now - lastWeatherFetch < 60000) {
		return;
	}

	lastWeatherFetch = now;

	try {
		cachedWeather = await getAnnArborWeather();
	} catch (err) {
		console.error("Weather error:", err);
		cachedWeather = "weather unavailable";
	}
}

function renderLocalInfo() {
	const uptime = formatUptime(Date.now() - localStartedAt);

	document.getElementById("localinfo").textContent =
`city      ann arbor
weather   ${cachedWeather}
uptime    ${uptime}
status    online`;
}

async function tickLocalInfo() {
	await updateWeather(false);
	renderLocalInfo();
}

const unitToggle = document.getElementById("unit-toggle");

if (unitToggle) {
	unitToggle.textContent = weatherUnit === "celsius" ? "°C" : "°F";

	unitToggle.addEventListener("click", async () => {
		weatherUnit = weatherUnit === "fahrenheit" ? "celsius" : "fahrenheit";
		localStorage.setItem("weatherUnit", weatherUnit);

		unitToggle.textContent = weatherUnit === "celsius" ? "°C" : "°F";

		await updateWeather(true);
		renderLocalInfo();
	});
}

tickLocalInfo();
setInterval(() => {
	renderLocalInfo();
}, 1000);

setInterval(() => {
	updateWeather(true).then(renderLocalInfo);
}, 60000);