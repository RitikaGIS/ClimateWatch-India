/* ==========================================
   CLIMATEWATCH INDIA - V2
   LEAFLET + OPEN-METEO + CHART.JS
========================================== */

/* ==========================================
   1. INDIA CITY DATABASE
========================================== */

const cities = [
  { name: "Delhi", lat: 28.6139, lon: 77.209 },
  { name: "Mumbai", lat: 19.076, lon: 72.8777 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
  { name: "Hyderabad", lat: 17.385, lon: 78.4867 },
  { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
  { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
  { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
  { name: "Guwahati", lat: 26.1445, lon: 91.7362 },
  { name: "Bhopal", lat: 23.2599, lon: 77.4126 },
  { name: "Srinagar", lat: 34.0837, lon: 74.7973 },
  { name: "Bhubaneswar", lat: 20.2961, lon: 85.8245 },
  { name: "Patna", lat: 25.5941, lon: 85.1376 },
  { name: "Thiruvananthapuram", lat: 8.5241, lon: 76.9366 },
  { name: "Dehradun", lat: 30.3165, lon: 78.0322 },
  { name: "Shimla", lat: 31.1048, lon: 77.1734 },
  { name: "Ranchi", lat: 23.3441, lon: 85.3096 },
  { name: "Raipur", lat: 21.2514, lon: 81.6296 },
  { name: "Chandigarh", lat: 30.7333, lon: 76.7794 }
];

/* ==========================================
   2. MAP INITIALIZATION
========================================== */

const map = L.map("map", {
  zoomControl: true
}).setView([22.5, 82.5], 5);

/* ==========================================
   3. BASEMAP DEFINITIONS
========================================== */

const osmLayer = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19
  }
);

const satelliteLayer = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "Tiles &copy; Esri",
    maxZoom: 19
  }
);

const darkLayer = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  {
    attribution: "&copy; OpenStreetMap &copy; CARTO",
    maxZoom: 19
  }
);

osmLayer.addTo(map);

/* ==========================================
   4. GIS OVERLAY LAYERS
========================================== */

const cityLayer = L.layerGroup().addTo(map);

const selectedLayer = L.layerGroup().addTo(map);

/* ==========================================
   5. CREATE CITY MARKERS
========================================== */

cities.forEach((city) => {
  const marker = L.circleMarker([city.lat, city.lon], {
    radius: 6,
    color: "#ffffff",
    weight: 1.5,
    fillColor: "#65d6a5",
    fillOpacity: 0.95
  });

  marker.bindPopup("<b>" + city.name + "</b><br>Click to view weather");

  marker.on("click", function () {
    loadWeather(city.lat, city.lon, city.name);
  });

  marker.addTo(cityLayer);
});

/* ==========================================
   6. QUICK CITY BUTTONS
========================================== */

const cityList = document.getElementById("cityList");

cities.forEach((city) => {
  const button = document.createElement("button");

  button.className = "city-btn";
  button.textContent = city.name;

  button.addEventListener("click", function () {
    loadWeather(city.lat, city.lon, city.name);
  });

  cityList.appendChild(button);
});

/* ==========================================
   7. GLOBAL VARIABLES
========================================== */

let weatherChart = null;

let currentLocation = {
  lat: 22.5726,
  lon: 88.3639,
  name: "Kolkata"
};

/* ==========================================
   8. WEATHER CONDITION FUNCTION
========================================== */

function getWeatherInfo(code) {
  const weatherCodes = {
    0: ["Clear sky", "☀️"],
    1: ["Mainly clear", "🌤️"],
    2: ["Partly cloudy", "⛅"],
    3: ["Overcast", "☁️"],

    45: ["Fog", "🌫️"],
    48: ["Depositing rime fog", "🌫️"],

    51: ["Light drizzle", "🌦️"],
    53: ["Moderate drizzle", "🌦️"],
    55: ["Dense drizzle", "🌧️"],

    61: ["Slight rain", "🌧️"],
    63: ["Moderate rain", "🌧️"],
    65: ["Heavy rain", "🌧️"],

    71: ["Slight snowfall", "🌨️"],
    73: ["Moderate snowfall", "🌨️"],
    75: ["Heavy snowfall", "❄️"],

    80: ["Rain showers", "🌦️"],
    81: ["Moderate rain showers", "🌧️"],
    82: ["Violent rain showers", "⛈️"],

    85: ["Snow showers", "🌨️"],
    86: ["Heavy snow showers", "❄️"],

    95: ["Thunderstorm", "⛈️"],
    96: ["Thunderstorm with hail", "⛈️"],
    99: ["Heavy thunderstorm with hail", "⛈️"]
  };

  return weatherCodes[code] || ["Unknown", "🌍"];
}

/* ==========================================
   9. DATE DISPLAY
========================================== */

document.getElementById("dateDisplay").textContent =
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

/* ==========================================
   10. SELECTED LOCATION MARKER
========================================== */

function showSelectedLocation(lat, lon, name) {
  selectedLayer.clearLayers();

  const marker = L.circleMarker([lat, lon], {
    radius: 11,
    color: "#ffffff",
    weight: 3,
    fillColor: "#ffd166",
    fillOpacity: 1
  });

  marker.bindPopup("<b>Selected Location</b><br>" + name);

  marker.addTo(selectedLayer).openPopup();
}

/* ==========================================
   11. WEATHER DATA FUNCTION
========================================== */

async function loadWeather(lat, lon, name) {
  const locationName = name || "Selected Location";

  currentLocation = {
    lat: lat,
    lon: lon,
    name: locationName
  };

  document.getElementById("selectedLocation").textContent =
    locationName + ", India";

  document.getElementById("weatherDescription").textContent =
    "Loading weather information...";

  document.getElementById("searchMessage").textContent =
    "Fetching weather data...";

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");

    const params = {
      latitude: lat,
      longitude: lon,

      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "precipitation",
        "weather_code",
        "wind_speed_10m",
        "wind_direction_10m",
        "pressure_msl",
        "cloud_cover"
      ].join(","),

      hourly: ["temperature_2m", "precipitation", "relative_humidity_2m"].join(
        ","
      ),

      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_sum",
        "precipitation_probability_max",
        "uv_index_max",
        "wind_speed_10m_max"
      ].join(","),

      forecast_days: 7,
      timezone: "auto",
      temperature_unit: "celsius",
      wind_speed_unit: "kmh",
      precipitation_unit: "mm"
    };

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Weather service unavailable");
    }

    const data = await response.json();

    updateWeatherDashboard(data, lat, lon, locationName);

    document.getElementById("searchMessage").textContent =
      "Weather data updated successfully.";
  } catch (error) {
    console.error("Weather error:", error);

    document.getElementById("weatherDescription").textContent =
      "Unable to load weather data.";

    document.getElementById("searchMessage").textContent =
      "Check your internet connection and try again.";
  }
}

/* ==========================================
   12. UPDATE WEATHER DASHBOARD
========================================== */

function updateWeatherDashboard(data, lat, lon, name) {
  const current = data.current;
  const daily = data.daily;

  const info = getWeatherInfo(current.weather_code);

  // MAIN WEATHER METRICS

  document.getElementById("temperature").textContent =
    current.temperature_2m + " °C";

  document.getElementById("feelsLike").textContent =
    current.apparent_temperature + " °C";

  document.getElementById("humidity").textContent =
    current.relative_humidity_2m + " %";

  document.getElementById("rainfall").textContent =
    current.precipitation + " mm";

  document.getElementById("wind").textContent =
    current.wind_speed_10m + " km/h";

  document.getElementById("windDirection").textContent =
    current.wind_direction_10m + " °";

  // ATMOSPHERIC PARAMETERS

  document.getElementById("pressure").textContent =
    current.pressure_msl + " hPa";

  document.getElementById("cloud").textContent = current.cloud_cover + " %";

  document.getElementById("uv").textContent = daily.uv_index_max[0];

  document.getElementById("condition").textContent = info[0];

  document.getElementById("rainProbability").textContent =
    daily.precipitation_probability_max[0] + " %";

  document.getElementById("weatherDescription").textContent =
    info[1] + " " + info[0];

  // SELECTED LOCATION MARKER

  showSelectedLocation(lat, lon, name);

  // UPDATE MAP

  map.setView([lat, lon], 7);

  // CHART AND FORECAST

  createWeatherChart(data);

  createForecast(data);
}

/* ==========================================
   13. HOURLY WEATHER CHART
========================================== */

function createWeatherChart(data) {
  const hourly = data.hourly;

  const now = data.current.time;

  let startIndex = hourly.time.findIndex((time) => time >= now);

  if (startIndex < 0) {
    startIndex = 0;
  }

  const endIndex = Math.min(startIndex + 24, hourly.time.length);

  const labels = hourly.time
    .slice(startIndex, endIndex)
    .map((time) => time.slice(11, 16));

  const temperatures = hourly.temperature_2m.slice(startIndex, endIndex);

  const rainfall = hourly.precipitation.slice(startIndex, endIndex);

  const ctx = document.getElementById("weatherChart");

  if (weatherChart) {
    weatherChart.destroy();
  }

  weatherChart = new Chart(ctx, {
    type: "line",

    data: {
      labels: labels,

      datasets: [
        {
          label: "Temperature (°C)",
          data: temperatures,
          borderColor: "#65d6a5",
          backgroundColor: "rgba(101,214,165,0.12)",
          borderWidth: 2,
          fill: true,
          tension: 0.35,
          yAxisID: "y"
        },

        {
          label: "Precipitation (mm)",
          data: rainfall,
          type: "bar",
          backgroundColor: "rgba(84,184,237,0.65)",
          borderRadius: 3,
          yAxisID: "y1"
        }
      ]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      interaction: {
        mode: "index",
        intersect: false
      },

      plugins: {
        legend: {
          labels: {
            color: "#cbd8e7",
            usePointStyle: true
          }
        }
      },

      scales: {
        x: {
          ticks: {
            color: "#91a3b8",
            maxTicksLimit: 12
          },
          grid: {
            color: "rgba(255,255,255,0.05)"
          }
        },

        y: {
          position: "left",
          title: {
            display: true,
            text: "Temperature (°C)",
            color: "#65d6a5"
          },
          ticks: {
            color: "#91a3b8"
          },
          grid: {
            color: "rgba(255,255,255,0.05)"
          }
        },

        y1: {
          position: "right",
          title: {
            display: true,
            text: "Precipitation (mm)",
            color: "#54b8ed"
          },
          ticks: {
            color: "#91a3b8"
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
}

/* ==========================================
   14. SEVEN DAY WEATHER FORECAST
========================================== */

function createForecast(data) {
  const daily = data.daily;

  const forecastContainer = document.getElementById("forecast");

  forecastContainer.innerHTML = "";

  daily.time.forEach((date, index) => {
    const weather = getWeatherInfo(daily.weather_code[index]);

    const dayName = new Date(date + "T12:00:00").toLocaleDateString("en-IN", {
      weekday: "short"
    });

    const card = document.createElement("div");

    card.className = "forecast-card";

    card.innerHTML = `

      <div class="day">${dayName}</div>

      <div class="weather-icon">${weather[1]}</div>

      <div class="max-temp">
        ${daily.temperature_2m_max[index]}°
      </div>

      <div class="min-temp">
        ${daily.temperature_2m_min[index]}° min
      </div>

      <div class="rain">
        🌧 ${daily.precipitation_sum[index]} mm
      </div>

      <div class="rain">
        💧 ${daily.precipitation_probability_max[index]}%
      </div>

    `;

    forecastContainer.appendChild(card);
  });
}

/* ==========================================
   15. CITY SEARCH / GEOCODING
========================================== */

async function searchCity() {
  const input = document.getElementById("citySearch");

  const query = input.value.trim();

  const message = document.getElementById("searchMessage");

  if (!query) {
    message.textContent = "Please enter a city name.";

    return;
  }

  message.textContent = "Searching location...";

  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");

    url.searchParams.set("name", query);
    url.searchParams.set("count", "10");
    url.searchParams.set("language", "en");
    url.searchParams.set("format", "json");

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Location search failed");
    }

    const result = await response.json();

    const indianResults = (result.results || []).filter(
      (place) => place.country_code === "IN"
    );

    if (indianResults.length === 0) {
      message.textContent = "No matching Indian location found.";

      return;
    }

    const place = indianResults[0];

    const name = place.name;

    loadWeather(place.latitude, place.longitude, name);
  } catch (error) {
    console.error(error);

    message.textContent = "Location search failed. Try again.";
  }
}

document.getElementById("searchBtn").addEventListener("click", searchCity);

document
  .getElementById("citySearch")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      searchCity();
    }
  });

/* ==========================================
   16. MAP CLICK WEATHER IDENTIFICATION
========================================== */

map.on("click", function (event) {
  const lat = event.latlng.lat;
  const lon = event.latlng.lng;

  loadWeather(lat, lon, "Custom Map Location");
});

/* ==========================================
   17. BASEMAP SWITCHING
========================================== */

const basemaps = {
  osm: osmLayer,
  satellite: satelliteLayer,
  dark: darkLayer
};

document.querySelectorAll('input[name="basemap"]').forEach((input) => {
  input.addEventListener("change", function () {
    Object.values(basemaps).forEach((layer) => {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });

    const selected = basemaps[this.value];

    if (selected) {
      selected.addTo(map);
    }
  });
});

/* ==========================================
   18. CITY LAYER CONTROL
========================================== */

document
  .getElementById("cityLayerToggle")
  .addEventListener("change", function () {
    if (this.checked) {
      map.addLayer(cityLayer);
    } else {
      map.removeLayer(cityLayer);
    }
  });

/* ==========================================
   19. SELECTED LOCATION LAYER CONTROL
========================================== */

document
  .getElementById("selectedLayerToggle")
  .addEventListener("change", function () {
    if (this.checked) {
      map.addLayer(selectedLayer);
    } else {
      map.removeLayer(selectedLayer);
    }
  });

/* ==========================================
   20. RESET INDIA MAP
========================================== */

document.getElementById("resetMap").addEventListener("click", function () {
  map.setView([22.5, 82.5], 5);
});

/* ==========================================
   21. INITIAL WEATHER LOAD
========================================== */

loadWeather(22.5726, 88.3639, "Kolkata");

/* ==========================================
   22. MAP SIZE REFRESH
========================================== */

setTimeout(function () {
  map.invalidateSize();
}, 500);
