const API_KEY = 'a583481b0d44a588d10f31b85e1a5df6'; // Replace with your actual key

// Theme Toggle
const toggle = document.getElementById('themeToggle');
toggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  toggle.innerHTML = document.body.classList.contains('dark')
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
});

// Man Click Effect
const manIcon = document.getElementById('manIcon');
manIcon.addEventListener('click', () => {
  manIcon.classList.add('clicked');
  setTimeout(() => manIcon.classList.remove('clicked'), 500);
});

// Voice Search
function startVoiceSearch() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();
  recognition.onresult = (event) => {
    document.getElementById('searchInput').value = event.results[0][0].transcript;
    getWeather();
  };
}

// Geo Location Weather
function getLocationWeather() {
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    displayWeather(data);
    getForecast(latitude, longitude);
  });
}

// Get Weather by City
async function getWeather() {
  const city = document.getElementById('searchInput').value.trim();
  if (!city) return;

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.cod !== 200) return alert('City not found');
  displayWeather(data);

  const { lat, lon } = data.coord;
  getForecast(lat, lon);
}

// Display Weather
function displayWeather(data) {
  document.getElementById('location').textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
  document.getElementById('description').textContent = data.weather[0].description;
  document.getElementById('icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  document.getElementById('details').textContent = `Feels like ${Math.round(data.main.feels_like)}°C • Humidity ${data.main.humidity}%`;
  document.getElementById('weatherResult').classList.remove('hidden');
}

// 5-Day Forecast
async function getForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  const forecastList = document.getElementById('forecastList');
  forecastList.innerHTML = '';

  const daily = data.list.filter((_, i) => i % 8 === 0); // every 24h
  daily.forEach(item => {
    const div = document.createElement('div');
    div.className = 'forecast-item';
    div.innerHTML = `
      <p>${new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</p>
      <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" />
      <p>${Math.round(item.main.temp)}°C</p>
    `;
    forecastList.appendChild(div);
  });

  document.getElementById('forecast').classList.remove('hidden');
}
