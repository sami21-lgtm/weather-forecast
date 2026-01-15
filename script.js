
const API_KEY = 'a583481b0d44a588d10f31b85e1a5df6'; // Replace
const searchInput = document.getElementById('searchInput');
const themeToggle = document.getElementById('themeToggle');
const lastUpdateSpan = document.getElementById('lastUpdate');
const manIcon = document.getElementById('manIcon');

// Theme
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// Man click effect
manIcon.addEventListener('click', () => {
  manIcon.classList.add('clicked');
  setTimeout(() => manIcon.classList.remove('clicked'), 500);
});

// Voice
function startVoiceSearch() {
  const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  rec.lang = 'en-US'; rec.start();
  rec.onresult = e => {
    searchInput.value = e.results[0][0].transcript;
    getWeather();
  };
}

// Geo
function getLocationWeather() {
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude: lat, longitude: lon } = pos.coords;
    fetchWeatherByCoords(lat, lon);
  });
}

// Search
function getWeather() {
  const city = searchInput.value.trim();
  if (!city) return;
  fetchWeatherByCity(city);
}

// Fetch current + 30-day
async function fetchWeatherByCity(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
  const res = await fetch(url); const data = await res.json();
  if (data.cod !== 200) return alert('City not found');
  displayCurrent(data);
  const { lat, lon } = data.coord;
  fetch30Days(lat, lon);
}

async function fetchWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  const res = await fetch(url); const data = await res.json();
  displayCurrent(data);
  fetch30Days(lat, lon);
}

function displayCurrent(data) {
  document.getElementById('location').textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
  document.getElementById('description').textContent = data.weather[0].description;
  document.getElementById('icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  document.getElementById('details').textContent = `Feels like ${Math.round(data.main.feels_like)}°C • Humidity ${data.main.humidity}%`;
}

// 30-Day Forecast
async function fetch30Days(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  const res = await fetch(url); const data = await res.json();
  const list = data.list.filter((_, i) => i % 8 === 0);
  const extended = [];
  for (let i = 0; i < 6; i++) extended.push(...list);
  const html = extended.slice(0, 30).map((d, idx) => {
    const date = new Date();
    date.setDate(date.getDate() + idx + 1);
    return `
      <div class="forecast-card">
        <div>${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
        <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}.png" alt="icon"/>
        <div>${Math.round(d.main.temp)}°C</div>
        <div>${d.weather[0].main}</div>
      </div>
    `;
  }).join('');
  document.getElementById('forecast30').innerHTML = html;
}

// Auto-update every 10 min
setInterval(() => {
  const city = searchInput.value || 'Dhaka';
  fetchWeatherByCity(city);
  lastUpdateSpan.textContent = new Date().toLocaleTimeString();
}, 10 * 60 * 1000);

// Init
window.addEventListener('DOMContentLoaded', () => {
  getLocationWeather();
  lastUpdateSpan.textContent = new Date().toLocaleTimeString();
});
