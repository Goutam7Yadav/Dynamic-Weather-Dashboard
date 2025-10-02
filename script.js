const apiKey = "0fcf296682d7d17da27355ef1a535829"; /*OpenWeatherMap API*/
let chartInstance = null;

/*Auto-detect user location on page load*/
window.onload = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
};

function success(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    getWeatherByCoords(lat, lon);
}

function error() {
    alert("Unable to retrieve your location. Please search manually.");
}
/*end-section*/

/*start*/
//Temperature Emojis
function getTempEmoji(temp) {
    if (temp < 0) return "❄️";      // Freezing
    if (temp < 10) return "🧥";     // Cold
    if (temp < 20) return "🌤️";    // Mild
    if (temp < 30) return "☀️";     // Warm
    return "☀";                    // Hot
}

//Weather Condition Emojis
function getConditionEmoji(condition) {
    condition = condition.toLowerCase();
    if (condition.includes("cloud")) return "☁️";
    if (condition.includes("rain")) return "🌧️";
    if (condition.includes("thunder")) return "⛈️";
    if (condition.includes("snow")) return "❄️";
    if (condition.includes("clear")) return "☀️";
    return "🌍"; // Default
}

//Humidity Emojis
function getHumidityEmoji(humidity) {
    if (humidity < 30) return "💨";  // Dry
    if (humidity < 60) return "💧";  // Normal
    return "💦";                     // Humid
}

//Wind Emojis
function getWindEmoji(speed) {
    if (speed < 2) return "🍃";
    if (speed < 6) return "🌬️";
    if (speed < 12) return "💨";
    if (speed < 20) return "🌪️";
    return "🌀";
}
/*end */

//Handle city search form
document.querySelector("form").addEventListener("submit", function(e) {
    e.preventDefault();
    const city = document.getElementById("classA").value.trim();
    if (city === "") {
        alert("Please enter a city name!");
        return;
    }
    getWeather(city);
});

// Weather by city name
async function getWeather(city) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod !== 200) {
            alert("City not found!");
            return;
        }

        // Update boxes with emojis
        document.getElementById("temp").innerText =
            data.main.temp + " °C " + getTempEmoji(data.main.temp);

        document.getElementById("condition").innerText =
            data.weather[0].description + " " + getConditionEmoji(data.weather[0].main);

        document.getElementById("humidity").innerText =
            data.main.humidity + " % " + getHumidityEmoji(data.main.humidity);

        document.getElementById("wind").innerText =
            data.wind.speed + " m/s " + getWindEmoji(data.wind.speed);

        // Call forecast for graph
        getForecast(city);
    } catch (error) {
        console.error("Error fetching weather:", error);
    }
}

// Forecast by city
async function getForecast(city) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();

        const labels = data.list.slice(0, 6).map(item => item.dt_txt.split(" ")[1].slice(0, 5));
        const temps = data.list.slice(0, 6).map(item => item.main.temp);

        renderChart(labels, temps, "orange", "rgba(255,165,0,0.2)");
    } catch (error) {
        console.error("Error fetching forecast:", error);
    }
}

//Weather by coordinates (for geolocation)
async function getWeatherByCoords(lat, lon) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();

        // Update boxes with emojis
        document.getElementById("temp").innerText =
            data.main.temp + " °C " + getTempEmoji(data.main.temp);

        document.getElementById("condition").innerText =
            data.weather[0].description + " " + getConditionEmoji(data.weather[0].main);

        document.getElementById("humidity").innerText =
            data.main.humidity + " % " + getHumidityEmoji(data.main.humidity);

        document.getElementById("wind").innerText =
            data.wind.speed + " m/s " + getWindEmoji(data.wind.speed);

        getForecastByCoords(lat, lon);
    } catch (error) {
        console.error("Error fetching geolocation weather:", error);
    }
}

//Forecast by coordinates
async function getForecastByCoords(lat, lon) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();

        const labels = data.list.slice(0, 6).map(item => item.dt_txt.split(" ")[1].slice(0, 5));
        const temps = data.list.slice(0, 6).map(item => item.main.temp);

        renderChart(labels, temps, "blue", "rgba(0, 0, 255, 0.2)");
    } catch (error) {
        console.error("Error fetching forecast:", error);
    }
}

//Chart rendering function (prevents overlap)
function renderChart(labels, temps, borderColor, bgColor) {
    const ctx = document.getElementById("weatherChart").getContext("2d");

    if (chartInstance) {
        chartInstance.destroy(); // clear old chart
    }

    chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Temperature (°C)",
                data: temps,
                borderColor: borderColor,
                backgroundColor: bgColor,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true }
            }
        }
    });
}
