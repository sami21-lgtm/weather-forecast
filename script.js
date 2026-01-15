const API_KEY = 'a583481b0d44a588d10f31b85e1a5df6';
const searchInput = document.getElementById('searchInput');
const digitalTime = document.getElementById('digitalTime');
const digitalDate = document.getElementById('digitalDate');
const currentYear = document.getElementById('currentYear');
const sunMoonIcon = document.getElementById('sunMoonIcon');
const miniMap = document.getElementById('miniMap');

// Time & Date
function updateDateTime() {
  const now = new Date();
  digitalTime.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  digitalDate.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  currentYear.textContent = now.getFullYear();
}
setInterval(updateDateTime, 1000);
updateDateTime();

// Voice Search
function startVoiceSearch() {
  const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  rec.lang = 'en-US'; rec.start();
  rec.onresult = e => {
    searchInput.value = e.results[0][0].transcript;
    getWeather();
  };
}

// Location Weather
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

// Fetch Weather
async function fetchWeatherByCity(city) {
  let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
  let res = await fetch(url);
  let data = await res.json();

  if (data.cod !== 200) {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${city},BD&units=metric&appid=${API_KEY}`;
    res = await fetch(url);
    data = await res.json();
  }

  if (data.cod !== 200) {
    const extra = [`${city},IN`, `${city},US`, `${city},UK`];
    for (const c of extra) {
      const tryRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${c}&units=metric&appid=${API_KEY}`);
      const tryData = await tryRes.json();
      if (tryData.cod === 200) { data = tryData; break; }
    }
  }

  if (data.cod !== 200) return alert('City/Area not found');

  displayCurrent(data);
  const { lat, lon } = data.coord;
  fetchSunMoon(lat, lon);
  fetch30Days(lat, lon);
  updateMiniMap(lat, lon);
}

async function fetchWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
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
}

// Sun/Moon Icon
async function fetchSunMoon(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const now = Date.now() / 1000;
  sunMoonIcon.textContent = (now >= data.current.sunrise && now < data.current.sunset) ? '🌞' : '🌙';
}

// 30 Days Forecast
async function fetch30Days(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const list = data.list.filter((_, i) => i % 8 === 0);
  const html = list.slice(0, 30).map((d, idx) => {
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

// Mini Map
function updateMiniMap(lat, lon) {
  miniMap.src = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.904745562371!2d${lon}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${lat}!3m2!1sen!2sbd!4v${Date.now()}`;
}

// Theme Switch
function changeTheme(color) {
  document.body.className = color;
}

// Auto load Dhaka on start
window.addEventListener('DOMContentLoaded', () => {
  searchInput.value = 'Dhaka';
  getWeather();
});
