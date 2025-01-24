let apiKey = "1e3e8f230b6064d27976e41163a82b77";

// Caching utility functions
function getCachedData(key) {
    const cache = JSON.parse(localStorage.getItem(key) || "{}");
    if (cache.expire && cache.expire > Date.now()) {
        return cache.data;
    }
    return null;
}

function setCacheData(key, data, ttl = 30 * 60 * 1000) { // Cache for 30 minutes
    localStorage.setItem(key, JSON.stringify({
        data: data,
        expire: Date.now() + ttl
    }));
}

// Retry logic for fetch
async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
    try {
        let response = await fetch(url, options);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, options, retries - 1, delay * 2);
        } else {
            throw error;
        }
    }
}

navigator.geolocation.getCurrentPosition(async function(position) {
    try {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;

        // Using reverse geocoding to get the location name which could be a constituency
        let cachedMapData = getCachedData('mapData');
        let mapData;
        if (cachedMapData) {
            mapData = cachedMapData;
        } else {
            let mapResponse = await fetchWithRetry(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`);
            mapData = await mapResponse;
            setCacheData('mapData', mapData);
        }
        
        let loc = mapData[0].name;

        // Fetch current weather data using lat and lon directly for better accuracy
        let cachedWeatherData = getCachedData('weatherData');
        let weatherData;
        if (cachedWeatherData) {
            weatherData = cachedWeatherData;
        } else {
            let weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
            let weatherResponse = await fetchWithRetry(weatherUrl);
            weatherData = await weatherResponse;
            setCacheData('weatherData', weatherData);
        }

        // Display current weather info, using "constituency" where applicable
        document.getElementById("city-name").textContent = `Weather in ${loc} Constituency`;
        document.getElementById("metric").textContent = Math.floor(weatherData.main.temp) + "°";
        document.getElementById("weather-main").textContent = weatherData.weather[0].description;
        document.getElementById("humidity").textContent = Math.floor(weatherData.main.humidity);
        document.getElementById("feels-like").textContent = Math.floor(weatherData.main.feels_like);
        document.getElementById("temp-min-today").textContent = Math.floor(weatherData.main.temp_min) + "°";
        document.getElementById("temp-max-today").textContent = Math.floor(weatherData.main.temp_max) + "°";

        let weatherCondition = weatherData.weather[0].main.toLowerCase();
        let weatherImg = document.querySelector(".weather-icon");

        if (weatherCondition === "rain") {
            weatherImg.src = "image/rain.png";
        } else if (weatherCondition === "clear" || weatherCondition === "clear sky") {
            weatherImg.src = "image/sun.png";
        } else if (weatherCondition === "snow") {
            weatherImg.src = "image/snow.png";
        } else if (weatherCondition === "clouds" || weatherCondition === "smoke") {
            weatherImg.src = "image/cloud.png";
        } else if (weatherCondition === "mist" || weatherCondition === "fog") {
            weatherImg.src = "image/mist.png";
        } else if (weatherCondition === "haze") {
            weatherImg.src = "image/haze.png";
        } else {
            weatherImg.src = "image/sun.png"; // Default image
        }

        // Fetch 5-day forecast directly with lat and lon
        let cachedForecastData = getCachedData('forecastData');
        let forecastData;
        if (cachedForecastData) {
            forecastData = cachedForecastData;
        } else {
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
            let forecastResponse = await fetchWithRetry(forecastUrl);
            forecastData = await forecastResponse;
            setCacheData('forecastData', forecastData);
        }

        displayForecast(forecastData);

    } catch (error) {
        console.error("An error occurred:", error);
        // Here you might want to show an error message to the user or use default data
    }
}, () => {
    alert("Please turn on your location and refresh the page");
});

function displayForecast(data) {
    const dailyForecasts = {};
    let forecast = document.getElementById('forecast-box');
    let forecastbox = "";

    data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        let dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        let day = new Date(date).getDay();

        if (!dailyForecasts[date]) {
            dailyForecasts[date] = {
                day_today: dayName[day],
                temperature: Math.floor(item.main.temp) + "°",
                description: item.weather[0].description,
                weatherImg: item.weather[0].main.toLowerCase()
            };
        }
    });

    for (const date in dailyForecasts) {
        let imgSrc = determineImageSrc(dailyForecasts[date].weatherImg);
        forecastbox += `
        <div class="weather-forecast-box">
            <div class="day-weather">
                <span>${dailyForecasts[date].day_today}</span>
            </div>
            <div class="weather-icon-forecast">
                <img src="${imgSrc}" alt="Weather Icon for ${dailyForecasts[date].day_today}" />
            </div>
            <div class="temp-weather">
                <span>${dailyForecasts[date].temperature}</span>
            </div>
            <div class="weather-main-forecast">${dailyForecasts[date].description}</div>
        </div>`;
    }

    forecast.innerHTML = forecastbox;
}

function determineImageSrc(condition) {
    switch (condition) {
        case "rain": return "image/rain.png";
        case "clear":
        case "clear sky": return "image/sun.png";
        case "snow": return "image/snow.png";
        case "clouds":
        case "smoke": return "image/cloud.png";
        case "mist":
        case "fog": return "image/mist.png";
        case "haze": return "image/haze.png";
        default: return "image/sun.png"; // Default image
    }
}

// Sensor graphs code
$(document).ready(function () {
    var ctxs = ['waterLevel', 'tilt', 'strain', 'seismic', 'pressure', 'acoustic'].map(id => document.getElementById(`${id}Chart`).getContext('2d'));

    function randomData(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function generateSensorData() {
        return {
            waterLevel: [randomData(0, 100), randomData(0, 100), randomData(0, 100), randomData(0, 100), randomData(0, 100)],
            tilt: [randomData(0, 30), randomData(0, 30), randomData(0, 30), randomData(0, 30), randomData(0, 30)],
            strain: [randomData(0, 500), randomData(0, 500), randomData(0, 500), randomData(0, 500), randomData(0, 500)],
            seismic: [randomData(0, 10), randomData(0, 10), randomData(0, 10), randomData(0, 10), randomData(0, 10)],
            pressure: [randomData(0, 200), randomData(0, 200), randomData(0, 200), randomData(0, 200), randomData(0, 200)],
            acoustic: [randomData(0, 100), randomData(0, 100), randomData(0, 100), randomData(0, 100), randomData(0, 100)]
        };
    }

    var sensorData = generateSensorData();

    function updateSystemStatus(sensorData) {
        var alertStatusElement = document.getElementById('alertStatus');
        var maxValue = Math.max(...Object.values(sensorData).flat());

        if (maxValue > 80) {
            alertStatusElement.className = 'alert alert-danger blink';
            alertStatusElement.textContent = 'System Status: Critical';
        } else if (maxValue > 50) {
            alertStatusElement.className = 'alert alert-warning blink';
            alertStatusElement.textContent = 'System Status: Warning';
        } else {
            alertStatusElement.className = 'alert alert-info';
            alertStatusElement.textContent = 'System Status: Normal';
        }

        ['waterLevel', 'tilt', 'strain', 'seismic', 'pressure', 'acoustic'].forEach(sensor => {
            updateSensorStatus(sensor, sensorData[sensor]);
        });
    }

    function updateSensorStatus(sensor, values) {
        var statusElement = document.getElementById(sensor + 'Status');
        var statusText = 'Normal';
        var statusClass = 'alert-info';
        var maxValue = Math.max(...values);

        if (maxValue > 80) {
            statusText = 'Critical';
            statusClass = 'alert-danger blink';
        } else if (maxValue > 50) {
            statusText = 'Warning';
            statusClass = 'alert-warning blink';
        }

        statusElement.className = 'alert ' + statusClass;
        statusElement.textContent = 'Status: ' + statusText;
    }

    function createChart(ctx, label, data) {
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Sensor 1', 'Sensor 2', 'Sensor 3', 'Sensor 4', 'Sensor 5'],
                datasets: [{
                    label: label,
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { suggestedMin: 0, suggestedMax: 100 },
                    x: {
                        title: { display: true, text: 'Sensors' }
                    }
                }
            }
        });
    }

    var charts = ['waterLevel', 'tilt', 'strain', 'seismic', 'pressure', 'acoustic'].map((type, i) => 
        createChart(ctxs[i], type.charAt(0).toUpperCase() + type.slice(1), sensorData[type])
    );

    function updateCharts() {
        sensorData = generateSensorData();

        charts.forEach((chart, index) => {
            chart.data.datasets[0].data = Object.values(sensorData)[index];
            chart.update();
        });

        updateSystemStatus(sensorData);
    }

    setInterval(updateCharts, 5000);
});









// map
function initMap() {
  var map = L.map('map').setView([-1.286389, 36.817223], 15); // Default Nairobi coordinates

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Use geolocation to center the map on your current position
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var lat = position.coords.latitude;
      var lon = position.coords.longitude;
      map.setView([lat, lon], 15); // Set the map view to your current location

      // Use the geocode service to get the location name
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
      .then(response => response.json())
      .then(data => {
        let locationName = data.display_name || "Unknown Location";
        // Add a marker for your current position with the location name
        L.marker([lat, lon]).addTo(map)
          .bindPopup(locationName)
          .openPopup();
      })
      .catch(error => {
        console.error('Error fetching location name:', error);
        // Fallback to using coordinates if fetching the location name fails
        L.marker([lat, lon]).addTo(map)
          .bindPopup(`Location at ${lat.toFixed(4)}, ${lon.toFixed(4)}`)
          .openPopup();
      });
    }, function(error) {
      console.error('Error getting location:', error);
      alert('Geolocation failed. Defaulting to Nairobi.');
    });
  } else {
    alert('Geolocation is not supported by this browser.');
  }
}

// Call the function to initialize the map
initMap();



$(document).ready(function () {
    // Handle user query submission
    $('#askButton').on('click', function () {
        var query = $('#userQuery').val();
        if(query.trim() !== '') {
            appendMessage('user', query);
            $('#userQuery').val(''); // Clear input after sending

            // Make an AJAX call to the server
            $.ajax({
                url: 'http://localhost:3000/',  // This should be your server endpoint
                type: 'POST',
                data: { message: query },
                success: function(response) {
                    // Assuming the server sends back a response in JSON format with a 'message' field
                    // Remove ' BACK' if present or handle as needed
                    var aiResponse = response.message.replace(' BACK', '');
                    appendMessage('ai', aiResponse);
                },
                error: function(xhr, status, error) {
                    appendMessage('ai', 'Error: Could not get response from server.');
                    console.error('Error:', error);
                }
            });
        }
    });

    function appendMessage(sender, message) {
        var chatWindow = $('#chatWindow');
        var messageClass = sender === 'ai' ? 'ai-message' : 'user-message';
        chatWindow.append('<div class="chat-message"><div class="' + messageClass + '">' + message + '</div></div>');
        chatWindow.scrollTop(chatWindow[0].scrollHeight); // Scroll to bottom
    }

    // Handle sensor data upload (Unchanged)
    $('#uploadForm').on('submit', function (e) {
        e.preventDefault();
        var formData = new FormData();
        formData.append('file', $('#fileInput')[0].files[0]);

        // Simulating AJAX call for file upload
        setTimeout(function() {
            alert("Data uploaded successfully (Simulated)");
        }, 1000);
    });
});