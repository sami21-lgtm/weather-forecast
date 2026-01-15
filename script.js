const API_KEY = 'a583481b0d44a588d10f31b85e1a5df6';
const searchInput = document.getElementById('searchInput');
const digitalTime = document.getElementById('digitalTime');
const digitalDate = document.getElementById('digitalDate');
const currentYear = document.getElementById('currentYear');
const sunMoonIcon = document.getElementById('sunMoonIcon');
const miniMap = document.getElementById('miniMap');

// ১. টাইম ও ডেট আপডেট
function updateDateTime() {
  const now = new Date();
  digitalTime.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  digitalDate.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  currentYear.textContent = now.getFullYear();
}
setInterval(updateDateTime, 1000);
updateDateTime();

// ২. আবহাওয়া ফেচ করা (City দিয়ে)
async function fetchWeatherByCity(city) {
  let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
  try {
    let res = await fetch(url);
    let data = await res.json();
    if (data.cod !== 200) return alert('City not found');
    
    displayCurrent(data);
    fetch30Days(data.coord.lat, data.coord.lon);
    updateMiniMap(data.coord.lat, data.coord.lon);
  } catch (error) { console.error(error); }
}

// ৩. স্ক্রিনে ডেটা ও সূর্য/চাঁদ দেখানো
function displayCurrent(data) {
  document.getElementById('location').textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
  document.getElementById('description').textContent = data.weather[0].description;
  document.getElementById('icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  document.getElementById('details').textContent = `Feels like ${Math.round(data.main.feels_like)}°C • Hum ${data.main.humidity}%`;

  const now = Math.floor(Date.now() / 1000); 
  if (now >= data.sys.sunrise && now < data.sys.sunset) {
    sunMoonIcon.textContent = '🌞'; 
  } else {
    sunMoonIcon.textContent = '🌙'; 
  }
}

// ৪. পরবর্তী দিনগুলোর ফোরকাস্ট (বক্স ছোট করে সাজানো)
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
          <div style="font-size: 11px;">${date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</div>
          <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}.png" alt="icon"/>
          <div style="font-weight: bold;">${Math.round(d.main.temp)}°C</div>
        </div>
      `;
    }).join('');
    document.getElementById('forecast30').innerHTML = html;
  } catch (error) { console.error(error); }
}

// ৫. ম্যাপ আপডেট
function updateMiniMap(lat, lon) {
  miniMap.src = `https://maps.google.com/maps?q=${lat},${lon}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
}

// সার্চ ফাংশন
function getWeather() {
  const city = searchInput.value.trim();
  if (city) fetchWeatherByCity(city);
}

// পেজ লোড হলে ঢাকা দেখাবে
window.addEventListener('DOMContentLoaded', () => {
  searchInput.value = 'Dhaka';
  getWeather();
});
