const API_KEY = 'a583481b0d44a588d10f31b85e1a5df6';
const searchInput = document.getElementById('searchInput');
const digitalTime = document.getElementById('digitalTime');
const digitalDate = document.getElementById('digitalDate');
const sunMoonIcon = document.getElementById('sunMoonIcon');
const miniMap = document.getElementById('miniMap');

// ১. টাইম ও অটো আইকন আপডেট
function updateDateTime() {
  const now = new Date();
  digitalTime.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  digitalDate.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
setInterval(updateDateTime, 1000);
updateDateTime();

// ২. আবহাওয়া ফেচ করা
async function fetchWeatherByCity(city) {
  let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
  try {
    let res = await fetch(url);
    let data = await res.json();
    if (data.cod !== 200) return;
    
    displayCurrent(data);
    fetch30Days(data.coord.lat, data.coord.lon);
    updateMiniMap(data.coord.lat, data.coord.lon);
  } catch (error) { console.log(error); }
}

// ৩. মেইন ডিসপ্লে ও সূর্যাস্ত লজিক
function displayCurrent(data) {
  document.getElementById('location').textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
  document.getElementById('description').textContent = data.weather[0].description;
  
  // অটোমেটিক চাঁদ/সূর্য পরিবর্তন
  const now = Math.floor(Date.now() / 1000); 
  sunMoonIcon.textContent = (now >= data.sys.sunrise && now < data.sys.sunset) ? '🌞' : '🌙';
}

// ৪. ৩০ দিনের ফোরকাস্ট (লিস্ট আকারে ছোট বক্সে)
async function fetch30Days(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const list = data.list.filter((_, i) => i % 8 === 0); // প্রতিদিনের একটি ডেটা
    
    const html = list.map((d, idx) => {
      const date = new Date();
      date.setDate(date.getDate() + idx + 1);
      return `
        <div class="forecast-card">
          <span>${date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</span>
          <span>${d.weather[0].main}</span>
          <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}.png" alt="icon"/>
          <span style="font-weight: bold;">${Math.round(d.main.temp)}°C</span>
        </div>
      `;
    }).join('');
    document.getElementById('forecast30').innerHTML = html;
  } catch (error) { console.log(error); }
}

function updateMiniMap(lat, lon) {
  miniMap.src = `https://maps.google.com/maps?q=${lat},${lon}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
}

function getWeather() {
  const city = searchInput.value.trim();
  if (city) fetchWeatherByCity(city);
}

// অটো রিফ্রেশ প্রতি ১৫ মিনিটে
setInterval(() => {
  const city = document.getElementById('location').textContent.split(',')[0];
  if (city) fetchWeatherByCity(city);
}, 900000);

window.addEventListener('DOMContentLoaded', () => {
  searchInput.value = 'Dhaka';
  getWeather();
});
