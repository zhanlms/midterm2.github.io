const apiKey = '287467aaaa409289b26e9bce783c8ae7';
const baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

let isUsingCurrentLocation = false;  // Переменная для отслеживания текущего местоположения
let currentLat = null;
let currentLon = null;

document.addEventListener('DOMContentLoaded', function () {
    const searchBtn = document.getElementById('searchBtn');
    const useLocationBtn = document.getElementById('useLocationBtn');
    const unitSelect = document.getElementById('unitSelect');
    const searchInput = document.getElementById('searchInput');

    if (searchBtn) {
        searchBtn.addEventListener('click', function () {
            const city = searchInput.value;
            if (city) {
                getWeather(city);
                getForecast(city);
            }
        });
    }

    if (useLocationBtn) {
        useLocationBtn.addEventListener('click', function () {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async function (position) {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        isUsingCurrentLocation = true;  // Устанавливаем флаг
                        currentLat = lat;  // Сохраняем координаты
                        currentLon = lon;
                        await getWeatherByLocation(lat, lon);
                        await getForecastByLocation(lat, lon);
                    },
                    function (error) {
                        alert('Error getting location: ' + error.message);
                    }
                );
            } else {
                alert('Geolocation is not supported by this browser.');
            }
        });
    }

    if (unitSelect) {
        unitSelect.addEventListener('change', async () => {
            const unit = unitSelect.value;
            if (isUsingCurrentLocation && currentLat && currentLon) {
                // Если используется текущее местоположение, обновляем данные
                await getWeatherByLocation(currentLat, currentLon);
                await getForecastByLocation(currentLat, currentLon);
            } else {
                const city = searchInput.value;
                if (city) {
                    getWeather(city);
                    getForecast(city);
                }
            }
        });
    }

    let debounceTimeout;
    searchInput.addEventListener('input', function () {
        clearTimeout(debounceTimeout);
        const query = this.value.trim();
        if (query.length > 1) {
            debounceTimeout = setTimeout(() => {
                fetchCitySuggestions(query);
            }, 300);
        } else {
            clearSuggestions();
        }
    });
});

document.getElementById('searchInput').addEventListener('input', function () {
    const query = this.value.trim();
    if (query.length > 1) {
        fetchCitySuggestions(query);
    }
});

async function fetchCitySuggestions(query) {
    const url = `https://api.openweathermap.org/data/2.5/find?q=${query}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (data && data.list && data.list.length > 0) {
            displaySuggestions(data.list);
        } else {
            clearSuggestions();
        }
    } catch (error) {
        console.error('Ошибка при получении предложений:', error.message);
    }
}


function displaySuggestions(suggestions) {
    const suggestionsElement = document.getElementById('suggestions');
    suggestionsElement.innerHTML = '';

    suggestions.forEach((suggestion) => {
        const div = document.createElement('div');
        div.classList.add('suggestion-item');
        div.textContent = `${suggestion.name}, ${suggestion.sys.country}`;
        div.addEventListener('click', () => {
            document.getElementById('searchInput').value = suggestion.name;
            getWeather(suggestion.name);
            getForecast(suggestion.name);
            clearSuggestions();
        });
        suggestionsElement.appendChild(div);
    });
}

function clearSuggestions() {
    document.getElementById('suggestions').innerHTML = '';
}

async function getWeather(city) {
    const unit = document.getElementById('unitSelect').value;
    const url = `${baseUrl}?q=${city}&appid=${apiKey}&units=${unit}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.cod === '404') {
            alert('City not found!');
        } else {
            displayCurrentWeather(data);
        }
    } catch (error) {
        alert('Error fetching weather data: ' + error.message);
    }
}

async function getForecast(city) {
    const unit = document.getElementById('unitSelect').value;
    const url = `${forecastUrl}?q=${city}&appid=${apiKey}&units=${unit}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.cod === '404') {
            alert('City not found!');
        } else {
            displayForecast(data);
        }
    } catch (error) {
        alert('Error fetching forecast data: ' + error.message);
    }
}

function displayForecast(data) {
    const forecastElement = document.getElementById('forecast');
    forecastElement.innerHTML = '<h3>5-Day Forecast</h3>';
    data.list.forEach((day, index) => {
        if (index % 8 === 0) {
            forecastElement.innerHTML += `
                <div class="forecast-day">
                    <h4>${new Date(day.dt * 1000).toLocaleDateString()}</h4>
                    <p>High: ${day.main.temp_max}°${document.getElementById('unitSelect').value === 'metric' ? 'C' : 'F'}</p>
                    <p>Low: ${day.main.temp_min}°${document.getElementById('unitSelect').value === 'metric' ? 'C' : 'F'}</p>
                    <p>Weather: ${day.weather[0].description}</p>
                    <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
                </div>
            `;
        }
    });
}

async function getWeatherByLocation(lat, lon) {
    const unit = document.getElementById('unitSelect').value;
    const url = `${baseUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayCurrentWeather(data);
    } catch (error) {
        alert('Error fetching weather data: ' + error.message);
    }
}

function displayCurrentWeather(data) {
    const weatherElement = document.getElementById('currentWeather');
    weatherElement.innerHTML = `
        <h3>Current Weather in ${data.name}</h3>
        <p>Temperature: ${data.main.temp}°${document.getElementById('unitSelect').value === 'metric' ? 'C' : 'F'}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
        <p>Weather: ${data.weather[0].description}</p>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="${data.weather[0].description}">
    `;
}

async function getForecastByLocation(lat, lon) {
    const unit = document.getElementById('unitSelect').value;
    const url = `${forecastUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.cod === '404') {
            alert('5-day forecast not found for this location!');
        } else {
            displayForecast(data);
        }
    } catch (error) {
        alert('Error fetching 5-day forecast data: ' + error.message);
    }
}
