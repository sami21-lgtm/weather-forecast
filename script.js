const API_KEY = 'a583481b0d44a588d10f31b85e1a5df6';
const searchInput = document.getElementById('searchInput');
const digitalTime = document.getElementById('digitalTime');
const digitalDate = document.getElementById('digitalDate');
const currentYear = document.getElementById('currentYear');
const sunMoonIcon = document.getElementById('sunMoonIcon');
const miniMap = document.getElementById('miniMap');

// ১. ডার্ক/লাইট মোড টগল
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

// ২. ঘড়ি এবং তারিখ (এখানে এখন আর আইকন পরিবর্তনের কোড নেই, কারণ এটি API থেকে হবে)
function updateDateTime() {
  const now = new Date();
  digitalTime.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  digitalDate.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  currentYear.textContent = now.getFullYear();
}
setInterval(updateDateTime, 1000);
updateDateTime();

// ৩. ভয়েস সার্চ
function startVoiceSearch() {
  const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  rec.lang = 'en-US'; 
  rec.start();
  rec.onresult = e => {
    searchInput.value = e.results[0][0].transcript;
    getWeather();
  };
}

// ৪. বর্তমান লোকেশন অনুযায়ী আবহাওয়া
function getLocationWeather() {
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude: lat, longitude: lon } = pos.coords;
    fetchWeatherByCoords(lat, lon);
  }, err => {
    alert("Location access denied or unavailable.");
  });
}

// ৫. সার্চ বাটন এবং এন্টার কী সাপোর্ট
function getWeather() {
  const city = searchInput.value.trim();
  if (!city) return;
  fetchWeatherByCity(city);
}

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    getWeather();
  }
});

// ৬. সিটির নাম দিয়ে ডেটা ফেচ করা
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

    if (data.cod !== 200) return alert('City/Area not found');

    displayCurrent(data);
    const { lat, lon } = data.coord;
    fetch30Days(lat, lon);
    updateMiniMap(lat, lon);
  } catch (error) {
    console.error("Error fetching weather:", error);
  }
}

// ৭. অক্ষাংশ/দ্রাঘিমাংশ দিয়ে ডেটা ফেচ করা
async function fetchWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    displayCurrent(data);
    fetch30Days(lat, lon);
    updateMiniMap(lat, lon);
  } catch (error) {
    console.error("Error fetching by coords:", error);
  }
}

// ৮. স্ক্রিনে আবহাওয়া এবং সূর্য/চাঁদ দেখানো (পারফেক্ট লজিক)
function displayCurrent(data) {
  document.getElementById('location').textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
  document.getElementById('description').textContent = data.weather[0].description;
  document.getElementById('icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  document.getElementById('details').textContent = `Feels like ${Math.round(data.main.feels_like)}°C • Humidity ${data.main.humidity}%`;

  // সূর্যাস্ত লজিক: API থেকে আসা সময় অনুযায়ী চাঁদ/সূর্য আপডেট
  const now = Math.floor(Date.now() / 1000); 
  const sunrise = data.sys.sunrise; 
  const sunset = data.sys.sunset;   

  if (now >= sunrise && now < sunset) {
    sunMoonIcon.textContent = '🌞'; // দিন হলে সূর্য
  } else {
    sunMoonIcon.textContent = '🌙'; // রাত হলে চাঁদ
  }
}

// ৯. ৫ দিনের ফোরকাস্ট (ফ্রি ভার্সন অনুযায়ী)
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

// ১০. মিনি ম্যাপ আপডেট
function updateMiniMap(lat, lon) {
  miniMap.src = `https://maps.google.com/maps?q=${lat},${lon}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
}

// ১১. থিম পরিবর্তন
function changeTheme(color) {
  document.body.className = color;
}

// ১২. অটো-আপডেট লজিক (প্রতি ১৫ মিনিটে একবার)
setInterval(() => {
  const currentCity = document.getElementById('location').textContent.split(',')[0];
  if (currentCity && currentCity !== "Location") {
    fetchWeatherByCity(currentCity);
    console.log("Weather Auto-Updated at: " + new Date().toLocaleTimeString());
  }
}, 900000); 

// ১৩. পেজ লোড হওয়ার সময় ঢাকাকে ডিফল্ট রাখা
window.addEventListener('DOMContentLoaded', () => {
  searchInput.value = 'Dhaka';
  getWeather();
});
