// ---------- TIME & DATE ----------
function updateTimeDate() {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  document.getElementById('timeDate').textContent = `${time} • ${date}`;

  // Sun / Moon icon by time
  const hour = now.getHours();
  const iconEl = document.getElementById('weatherIcon');
  if (hour >= 6 && hour < 18) {
    iconEl.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    iconEl.innerHTML = '<i class="fas fa-moon"></i>';
  }
}
setInterval(updateTimeDate, 1000);
updateTimeDate();

// ---------- WEATHER ----------
const API_KEY = 'a583481b0d44a588d10f31b85e1a5df6'; 
const LAT = 23.8103; // Dhaka
const LON = 90.4125;

function updateWeather() {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`)
    .then(res => res.json())
    .then(data => {
      const temp = Math.round(data.main.temp);
      const iconCode = data.weather[0].icon;
      const iconMap = {
        '01d': 'fa-sun', '01n': 'fa-moon', '02d': 'fa-cloud-sun', '02n': 'fa-cloud-moon',
        '03d': 'fa-cloud', '03n': 'fa-cloud', '04d': 'fa-cloud', '04n': 'fa-cloud',
        '09d': 'fa-cloud-rain', '09n': 'fa-cloud-rain', '10d': 'fa-cloud-sun-rain', '10n': 'fa-cloud-moon-rain',
        '11d': 'fa-bolt', '11n': 'fa-bolt', '13d': 'fa-snowflake', '13n': 'fa-snowflake',
        '50d': 'fa-smog', '50n': 'fa-smog'
      };
      const iconClass = iconMap[iconCode] || 'fa-question';
      document.getElementById('weatherIcon').innerHTML = `<i class="fas ${iconClass}"></i>`;
      document.getElementById('temperature').textContent = `${temp}°C`;
    })
    .catch(() => {
      document.getElementById('temperature').textContent = '--°C';
    });
}
updateWeather();
setInterval(updateWeather, 600000); // 10 min

// ---------- BACKGROUND IMAGE CHANGE ----------
// তুমি চাইলে এখানে ইমেজ URL বদলে ব্যাকগ্রাউন্ড সেট করতে পারো
function setBackgroundImage(url) {
  const bg = document.getElementById('bgCover');
  bg.style.background = `url(${url}) center/cover no-repeat`;
  bg.style.animation = 'none';
}

// ---------- PRESET BACKGROUND IMAGES ----------
const backgrounds = [
  'https://i.imgur.com/8X8z9X1.jpg',
  'https://i.imgur.com/7v8Zf1U.jpg',
  'https://i.imgur.com/5b5V5b5.jpg',
  'https://i.imgur.com/9X9X9X9.jpg'
];


function setRandomBackground() {
  const randomIndex = Math.floor(Math.random() * backgrounds.length);
  setBackgroundImage(backgrounds[randomIndex]);
}

// পেজ লোড হলে র্যান্ডম ইমেজ সেট করো:
setRandomBackground();

// ---------- THEME SWITCH ----------
function changeTheme(color) {
  const root = document.documentElement;
  root.style.setProperty('--rainbow', `var(--${color})`);
  document.body.className = color;
}
