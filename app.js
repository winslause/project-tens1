
    let apiKey = "1e3e8f230b6064d27976e41163a82b77";

    navigator.geolocation.getCurrentPosition(async function(position) {
        try {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;

            // Using reverse geocoding to get city name
            var map = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${apiKey}`);
            var userdata = await map.json();
            let loc = userdata[0].name;

            // Fetch current weather data
            let url = `https://api.openweathermap.org/data/2.5/weather?q=${loc}&units=metric&appid=${apiKey}`;
            let respond = await fetch(url);
            let data = await respond.json();

// Display current weather info
document.getElementById("city-name").textContent = data.name;
document.getElementById("metric").textContent = Math.floor(data.main.temp) + "°";
document.getElementById("weather-main").textContent = data.weather[0].description; // Fix this line
document.getElementById("humidity").textContent = Math.floor(data.main.humidity);
document.getElementById("feels-like").textContent = Math.floor(data.main.feels_like);
document.getElementById("temp-min-today").textContent = Math.floor(data.main.temp_min) + "°";
document.getElementById("temp-max-today").textContent = Math.floor(data.main.temp_max) + "°";


            let weatherCondition = data.weather[0].main.toLowerCase();
            let weatherImg = document.querySelector(".weather-icon");

            if (weatherCondition === "rain") {
                weatherImg.src = "image/rain.png"; // Corrected path to image
            } else if (weatherCondition === "clear" || weatherCondition === "clear sky") {
                weatherImg.src = "image/sun.png"; // Correct path
            } else if (weatherCondition === "snow") {
                weatherImg.src = "image/snow.png"; // Correct path
            } else if (weatherCondition === "clouds" || weatherCondition === "smoke") {
                weatherImg.src = "image/cloud.png"; // Correct path
            } else if (weatherCondition === "mist" || weatherCondition === "fog") {
                weatherImg.src = "image/mist.png"; // Correct path
            } else if (weatherCondition === "haze") {
                weatherImg.src = "image/haze.png"; // Correct path
            } else {
                weatherImg.src = "image/sun.png"; // Default image
            }
            

            // Fetch 5-day forecast
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${data.name}&appid=${apiKey}&units=metric`;
            fetch(forecastUrl)
                .then(response => response.json())
                .then(forecastData => {
                    displayForecast(forecastData);
                })
                .catch(error => {
                    console.error("Error fetching forecast:", error);
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
                    let imgSrc = "";

                    switch (dailyForecasts[date].weatherImg) {
                        case "rain":
                            imgSrc = "image/rain.png";
                            break;
                        case "clear":
                        case "clear sky":
                            imgSrc = "image/sun.png";
                            break;
                        case "snow":
                            imgSrc = "image/snow.png";
                            break;
                        case "clouds":
                        case "smoke":
                            imgSrc = "image/cloud.png";
                            break;
                        case "mist":
                        case "fog":
                            imgSrc = "image/mist.png";
                            break;
                        case "haze":
                            imgSrc = "image/haze.png";
                            break;
                        default:
                            imgSrc = "image/sun.png"; // Default image
                    }

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

        } catch (error) {
            console.error("An error occurred:", error);
        }
    }, () => {
        alert("Please turn on your location and refresh the page");
    });



// sensor graphs
$(document).ready(function () {
    // Get the chart contexts for each sensor
    var waterLevelCtx = document.getElementById('waterLevelChart').getContext('2d');
    var tiltCtx = document.getElementById('tiltChart').getContext('2d');
    var strainCtx = document.getElementById('strainChart').getContext('2d');
    var seismicCtx = document.getElementById('seismicChart').getContext('2d');
    var pressureCtx = document.getElementById('pressureChart').getContext('2d');
    var acousticCtx = document.getElementById('acousticChart').getContext('2d');

    // Function to generate random data for each sensor
    function randomData(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Generate random data for each sensor
    function generateSensorData() {
        return {
            waterLevel: [
                randomData(0, 100), randomData(0, 100), randomData(0, 100), randomData(0, 100), randomData(0, 100)
            ],
            tilt: [
                randomData(0, 30), randomData(0, 30), randomData(0, 30), randomData(0, 30), randomData(0, 30)
            ],
            strain: [
                randomData(0, 500), randomData(0, 500), randomData(0, 500), randomData(0, 500), randomData(0, 500)
            ],
            seismic: [
                randomData(0, 10), randomData(0, 10), randomData(0, 10), randomData(0, 10), randomData(0, 10)
            ],
            pressure: [
                randomData(0, 200), randomData(0, 200), randomData(0, 200), randomData(0, 200), randomData(0, 200)
            ],
            acoustic: [
                randomData(0, 100), randomData(0, 100), randomData(0, 100), randomData(0, 100), randomData(0, 100)
            ]
        };
    }

    // Initial data for sensors
    var sensorData = generateSensorData();

    // Function to update the system status based on sensor data
    function updateSystemStatus(sensorData) {
        var alertStatusElement = document.getElementById('alertStatus');
        var maxValue = Math.max(
            ...sensorData.waterLevel,
            ...sensorData.tilt,
            ...sensorData.strain,
            ...sensorData.seismic,
            ...sensorData.pressure,
            ...sensorData.acoustic
        );

        // Update system status (based on highest sensor value)
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

        // Update individual sensor statuses
        updateSensorStatus('waterLevel', sensorData.waterLevel);
        updateSensorStatus('tilt', sensorData.tilt);
        updateSensorStatus('strain', sensorData.strain);
        updateSensorStatus('seismic', sensorData.seismic);
        updateSensorStatus('pressure', sensorData.pressure);
        updateSensorStatus('acoustic', sensorData.acoustic);
    }

    // Function to update individual sensor status
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

    // Function to create each chart with updated x-axis labels (Sensor 1 to Sensor 5)
    function createChart(ctx, label, data) {
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Sensor 1', 'Sensor 2', 'Sensor 3', 'Sensor 4', 'Sensor 5'],  // Updated x-axis labels
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
                        title: {
                            display: true,
                            text: 'Sensors'
                        }
                    }
                }
            }
        });
    }

    // Create individual charts for each sensor
    var waterLevelChart = createChart(waterLevelCtx, 'Water Level', sensorData.waterLevel);
    var tiltChart = createChart(tiltCtx, 'Tilt', sensorData.tilt);
    var strainChart = createChart(strainCtx, 'Strain', sensorData.strain);
    var seismicChart = createChart(seismicCtx, 'Seismic Activity', sensorData.seismic);
    var pressureChart = createChart(pressureCtx, 'Pressure', sensorData.pressure);
    var acousticChart = createChart(acousticCtx, 'Acoustic Emissions', sensorData.acoustic);

    // Update all charts and status every 5 seconds
    function updateCharts() {
        sensorData = generateSensorData();

        // Update data for each chart
        waterLevelChart.data.datasets[0].data = sensorData.waterLevel;
        tiltChart.data.datasets[0].data = sensorData.tilt;
        strainChart.data.datasets[0].data = sensorData.strain;
        seismicChart.data.datasets[0].data = sensorData.seismic;
        pressureChart.data.datasets[0].data = sensorData.pressure;
        acousticChart.data.datasets[0].data = sensorData.acoustic;

        // Update all charts
        waterLevelChart.update();
        tiltChart.update();
        strainChart.update();
        seismicChart.update();
        pressureChart.update();
        acousticChart.update();

        // Update system status
        updateSystemStatus(sensorData);
    }

    // Update every 5 seconds
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