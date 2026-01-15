const API_KEY = 'a583481b0d44a588d10f31b85e1a5df6';
const searchInput = document.getElementById('searchInput');
const digitalTime = document.getElementById('digitalTime');
const digitalDate = document.getElementById('digitalDate');
const currentYear = document.getElementById('currentYear');
const sunMoonIcon = document.getElementById('sunMoonIcon');
const miniMap = document.getElementById('miniMap');

// Dark/Light Toggle
function toggleDarkLight() {
  const body = document.body;
  const icon = document.getElementById('themeIcon');
  if (body.classList.contains('dark')) {
    body.classList.remove('dark');
    body.classList.add('light');
    icon.className = 'fas fa-moon';
  } else {
    body.classList.remove('light');
    body.classList.add('dark');
    icon.className = 'fas fa-sun';
  }
}

// Time & Date + Auto Sun/Moon
function updateDateTime() {
  const now = new Date();
  digitalTime.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  digitalDate.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  currentYear.textContent = now.getFullYear();

  // Simple visual sun/moon based on local time
  const hour = now.getHours();
  sunMoonIcon.textContent = (hour >= 6 && hour < 18) ? '🌞' : '🌙';
}
setInterval(updateDateTime, 1000);
updateDateTime();

// Voice Search
function startVoiceSearch() {
  const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  rec.lang = 'en-US'; 
  rec.start();
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
  }, err => {
    alert("Location access denied or unavailable.");
  });
}

// Search Function
function getWeather() {
  const city = searchInput.value.trim();
  if (!city) return;
  fetchWeatherByCity(city);
}

// Keyboard Enter Key Support
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    getWeather();
  }
});

// Fetch Weather By City
async function fetchWeatherByCity(city) {
  let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
  try {
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
  } catch (error) {
    console.error("Error fetching weather:", error);
  }
}

// Fetch Weather By Coordinates
async function fetchWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    displayCurrent(data);
    fetchSunMoon(lat, lon);
    fetch30Days(lat, lon);
    updateMiniMap(lat, lon);
  } catch (error) {
    console.error("Error fetching by coords:", error);
  }
}

function displayCurrent(data) {
  document.getElementById('location').textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
  document.getElementById('description').textContent = data.weather[0].description;
  document.getElementById('icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  document.getElementById('details').textContent = `Feels like ${Math.round(data.main.feels_like)}°C • Humidity ${data.main.humidity}%`;
}

// Sun/Moon Icon from API
async function fetchSunMoon(lat, lon) {
  // Note: OneCall API might require a paid subscription/card setup. 
  // If it fails, the default updateDateTime() logic will still work.
  try {
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if(data.current) {
        const now = Date.now() / 1000;
        sunMoonIcon.textContent = (now >= data.current.sunrise && now < data.current.sunset) ? '🌞' : '🌙';
    }
  } catch (e) {
    console.log("OneCall API error or limit reached.");
  }
}

// 30 Days Forecast (OpenWeather Free provides 5 days / 3 hour forecast)
async function fetch30Days(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const list = data.list.filter((_, i) => i % 8 === 0);
    const html = list.map((d, idx) => {
      const date = new Date();
      date.setDate(date.getDate() + idx + 1);
      return `
        <div class="forecast-card">
          <div>${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
          <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}.png" alt="icon"/>
          <div>${Math.round(d.main.temp)}°C</div>
          <div style="font-size: 0.8rem;">${d.weather[0].main}</div>
        </div>
      `;
    }).join('');
    document.getElementById('forecast30').innerHTML = html;
  } catch (error) {
    console.error("Forecast error:", error);
  }
}

// Mini Map
function updateMiniMap(lat, lon) {
  // Using a simplified Google Maps embed or similar can work here
  miniMap.src = `https://www.google.com/maps?q=${lat},${lon}&output=embed`;
}

// Theme Switch
function changeTheme(color) {
  document.body.className = color;
}

// --- AUTO UPDATE LOGIC ---
// প্রতি ১৫ মিনিট (৯০০,০০০ মিলিসেকেন্ড) পরপর তথ্য আপডেট হবে
setInterval(() => {
  const currentCity = document.getElementById('location').textContent.split(',')[0];
  if (currentCity && currentCity !== "Location") {
    fetchWeatherByCity(currentCity);
    console.log("Weather Auto-Updated at: " + new Date().toLocaleTimeString());
  }
}, 900000); 

// Auto load Dhaka on start
window.addEventListener('DOMContentLoaded', () => {
  searchInput.value = 'Dhaka';
  getWeather();
});
