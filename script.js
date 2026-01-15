const API_KEY = 'a583481b0d44a588d10f31b85e1a5df6';
const API_KEY = 'YOUR_OPENWEATHER_API_KEY';
const searchInput = document.getElementById('searchInput');
const themeToggle = document.getElementById('themeToggle');
const manIcon = document.getElementById('manIcon');
const digitalTime = document.getElementById('digitalTime');
const digitalDate = document.getElementById('digitalDate');
const currentYear = document.getElementById('currentYear');
const sunMoonIcon = document.getElementById('sunMoonIcon');
const weatherEmoji = document.getElementById('weatherEmoji');
const miniMap = document.getElementById('miniMap');

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

// Man click
manIcon.addEventListener('click', () => {
  manIcon.classList.add('clicked');
  setTimeout(() => manIcon.classList.remove('clicked'), 500);
});

// Digital Time & Date & Year
function updateDateTime() {
  const now = new Date();
  digitalTime.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  digitalDate.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  currentYear.textContent = now.getFullYear();
}
setInterval(updateDateTime, 1000);
updateDateTime();

// Weather emoji mapping
function getWeatherEmoji(main) {
  const emojis = {
    Clear: '☀️',
    Clouds: '☁️',
    Rain: '🌧️',
    Drizzle: '🌦️',
    Thunderstorm: '⛈️',
    Snow: '❄️',
    Mist: '🌫️',
    Fog: '🌫️',
    Haze: '🌫️'
  };
  return emojis[main] || '☀️';
}

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

// Fetch
async function fetchWeatherByCity(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
  const res = await fetch(url); const data = await res.json();
  if (data.cod !== 200) return alert('City not found');
  displayCurrent(data);
  const { lat, lon } = data.coord;
  fetchSunMoon(lat, lon);
  fetch30Days(lat, lon);
  updateMiniMap(lat, lon);
}

async function fetchWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  const res = await fetch(url); const data = await res.json();
  displayCurrent(data);
  fetchSunMoon(lat, lon);
  fetch30Days(lat, lon);
  updateMiniMap(lat, lon);
}

function displayCurrent(data) {
  document.getElementById('location').textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
  document.getElementById('description').textContent = data.weather[0].description;
  document.getElementById('icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  document.getElementById('details').textContent = `Feels like ${Math.round(data.main.feels_like)}°C • Humidity ${data.main.humidity}%`;
  
  // Update weather emoji
  weatherEmoji.textContent = getWeatherEmoji(data.weather[0].main);
}

// Sun/Moon Icon (time based)
async function fetchSunMoon(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${API_KEY}`;
  const res = await fetch(url); const data = await res.json();
  updateSunMoonIcon(data);
}

function updateSunMoonIcon(data) {
  const now = Date.now() / 1000;
  const isDay = now >= data.current.sunrise && now < data.current.sunset;
  sunMoonIcon.textContent = isDay ? '🌞' : '🌙';
}

// 30-Day
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

// Update Mini Map
function updateMiniMap(lat, lon) {
  const src = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.904745562371!2d${lon}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${lat}!3m2!1sen!2sbd!4v${Date.now()}`;
  miniMap.src = src;
}

// Auto-update every 10 min
setInterval(() => {
  const city = searchInput.value || 'Dhaka';
  fetchWeatherByCity(city);
}, 10 * 60 * 1000);

// Init
window.addEventListener('DOMContentLoaded', () => {
  getLocationWeather();
});
