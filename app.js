const timeEl = document.querySelector('#time');
const meridiemEl = document.querySelector('#meridiem');
const dateEl = document.querySelector('#date');
const monthTitle = document.querySelector('#monthTitle');
const calendarGrid = document.querySelector('#calendarGrid');
const now = new Date();
let calendarDate = new Date(now.getFullYear(), now.getMonth(), 1);

function updateClock() {
  const date = new Date();
  const hour = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  timeEl.textContent = `${String(hour % 12 || 12).padStart(2, '0')}:${minutes}`;
  meridiemEl.textContent = hour >= 12 ? 'PM' : 'AM';
  dateEl.textContent = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
}

function renderCalendar() {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  monthTitle.textContent = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(calendarDate);
  const firstDay = new Date(year, month, 1);
  const start = (firstDay.getDay() + 6) % 7;
  const daysThisMonth = new Date(year, month + 1, 0).getDate();
  const daysPreviousMonth = new Date(year, month, 0).getDate();
  calendarGrid.innerHTML = '';
  const totalCells = start + daysThisMonth > 35 ? 42 : 35;
  for (let cell = 0; cell < totalCells; cell++) {
    const day = cell - start + 1;
    const label = document.createElement('time');
    if (day < 1) { label.textContent = daysPreviousMonth + day; label.className = 'outside'; }
    else if (day > daysThisMonth) { label.textContent = day - daysThisMonth; label.className = 'outside'; }
    else {
      label.textContent = day;
      label.dateTime = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (year === now.getFullYear() && month === now.getMonth() && day === now.getDate()) label.className = 'today';
    }
    calendarGrid.append(label);
  }
}

document.querySelector('#previousMonth').addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() - 1); renderCalendar(); });
document.querySelector('#nextMonth').addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() + 1); renderCalendar(); });

let activeScreen = 0, startX = 0;
const track = document.querySelector('#screenTrack');
const dots = [...document.querySelectorAll('.screen-pagination button')];
function setScreen(index) { activeScreen = Math.max(0, Math.min(1, index)); track.style.transform = `translateX(-${activeScreen * 100}%)`; dots.forEach((dot, i) => dot.classList.toggle('active', i === activeScreen)); }
dots.forEach((dot, i) => dot.addEventListener('click', () => setScreen(i)));
window.addEventListener('keydown', event => { if (event.key === 'ArrowRight') setScreen(activeScreen + 1); if (event.key === 'ArrowLeft') setScreen(activeScreen - 1); });
track.addEventListener('pointerdown', event => { startX = event.clientX; });
track.addEventListener('pointerup', event => { if (Math.abs(event.clientX - startX) > 60) setScreen(activeScreen + (event.clientX < startX ? 1 : -1)); });

const fullscreenButton = document.querySelector('#fullscreenButton');
async function toggleFullscreen() {
  if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
  else await document.exitFullscreen?.();
}
fullscreenButton.addEventListener('click', toggleFullscreen);
document.addEventListener('fullscreenchange', () => {
  const active = Boolean(document.fullscreenElement);
  fullscreenButton.setAttribute('aria-label', active ? 'Exit full screen' : 'Enter full screen');
  fullscreenButton.title = active ? 'Exit full screen' : 'Full screen';
});

updateClock(); renderCalendar(); setInterval(updateClock, 1000);

const weatherCard=document.querySelector('.weather-card');
const weatherTitle=weatherCard.querySelector('.weather-title');
const weatherCondition=weatherTitle.querySelector('small');
const weatherMain=weatherCard.querySelector('.weather-main');
const weatherTemperature=weatherMain.querySelector('strong');
const weatherFeelsLike=weatherMain.querySelector('p');
const weatherValues=weatherMain.querySelectorAll('dd');
const weatherLabels=weatherMain.querySelectorAll('dt');
const weatherCodes={0:'Clear Sky',1:'Mostly Clear',2:'Partly Cloudy',3:'Overcast',45:'Foggy',48:'Icy Fog',51:'Light Drizzle',53:'Drizzle',55:'Heavy Drizzle',61:'Light Rain',63:'Rain',65:'Heavy Rain',71:'Light Snow',73:'Snow',75:'Heavy Snow',80:'Rain Showers',81:'Rain Showers',82:'Heavy Showers',95:'Thunderstorm',96:'Storm with Hail',99:'Storm with Hail'};
const aqiLabel=value=>value<=50?'Good':value<=100?'Fair':value<=150?'Unhealthy':value<=200?'Poor':'Very Poor';
async function loadLiveWeather(){try{const lat=28.6139,lon=77.209;const weatherUrl='https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+'&timezone=auto&current=temperature_2m,apparent_temperature,weather_code&daily=temperature_2m_max,temperature_2m_min&forecast_days=1';const airUrl='https://air-quality-api.open-meteo.com/v1/air-quality?latitude='+lat+'&longitude='+lon+'&current=us_aqi';const [weatherResponse,airResponse]=await Promise.all([fetch(weatherUrl),fetch(airUrl)]);if(!weatherResponse.ok||!airResponse.ok)throw Error();const [weather,air]=await Promise.all([weatherResponse.json(),airResponse.json()]);const aqi=Math.round(air.current.us_aqi),current=weather.current;weatherTemperature.textContent=Math.round(current.temperature_2m)+'°C';weatherFeelsLike.textContent='Feels like '+Math.round(current.apparent_temperature)+'°';weatherCondition.textContent=weatherCodes[current.weather_code]||'Current Conditions';weatherValues[0].textContent=Math.round(weather.daily.temperature_2m_max[0])+'°';weatherValues[1].textContent=Math.round(weather.daily.temperature_2m_min[0])+'°';weatherValues[2].textContent=aqi;weatherLabels[3].textContent=aqiLabel(aqi);weatherValues[3].style.background=aqi<=100?'#9ed88f':aqi<=150?'#edc45d':'#eb8b76'}catch{weatherCondition.textContent='Unable to update';weatherFeelsLike.textContent='Check your connection'}}
loadLiveWeather();setInterval(loadLiveWeather,1200000);

document.querySelector('#fullscreenButton')?.remove();
const cityLabel=weatherTitle.querySelectorAll('span')[1];
const weatherIcon=document.querySelector('.sun-icon');
let activeLocation=JSON.parse(localStorage.getItem('focus-dashboard-location')||'{"lat":28.6139,"lon":77.209,"name":"New Delhi"}');
function setWeatherIcon(code,isDay){if(code>=51){weatherIcon.innerHTML='<path d="M32 43c3-13 14-22 28-22 16 0 29 13 29 29 10 1 18 9 18 20 0 12-9 21-21 21H33c-12 0-21-9-21-21 0-14 10-25 23-27Z" fill="#92aabd"/><path d="m42 98-5 12m25-12-5 12m25-12-5 12" stroke="#8bc9ec" stroke-width="5" stroke-linecap="round"/>'}else if(!isDay){weatherIcon.innerHTML='<path d="M74 19a35 35 0 1 0 28 52A31 31 0 1 1 74 19Z" fill="#f3dd96"/>'}else if([2,3,45,48].includes(code)){weatherIcon.innerHTML='<circle cx="48" cy="43" r="23" fill="#ffd35e"/><path d="M36 90c-13 0-23-10-23-23s10-23 23-23c3-13 14-22 28-22 16 0 29 13 29 29 10 1 18 9 18 20 0 11-9 19-20 19H36Z" fill="#c6d1d9"/>'}else{weatherIcon.innerHTML='<g stroke="#ffd15c" stroke-width="5" stroke-linecap="round"><path d="M60 8v14"/><path d="M60 98v14"/><path d="M8 60h14"/><path d="M98 60h14"/></g><circle cx="60" cy="60" r="30" fill="#ffd15c"/>'}}
async function refreshLiveWeather(){try{const weatherUrl='https://api.open-meteo.com/v1/forecast?latitude='+activeLocation.lat+'&longitude='+activeLocation.lon+'&timezone=auto&current=temperature_2m,apparent_temperature,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min&forecast_days=1';const airUrl='https://air-quality-api.open-meteo.com/v1/air-quality?latitude='+activeLocation.lat+'&longitude='+activeLocation.lon+'&current=us_aqi';const [wr,ar]=await Promise.all([fetch(weatherUrl),fetch(airUrl)]);const [weather,air]=await Promise.all([wr.json(),ar.json()]);const c=weather.current,aqi=Math.round(air.current.us_aqi);weatherTemperature.textContent=Math.round(c.temperature_2m)+'°C';weatherFeelsLike.textContent='Feels like '+Math.round(c.apparent_temperature)+'°';weatherCondition.textContent=weatherCodes[c.weather_code]||'Current Conditions';weatherValues[0].textContent=Math.round(weather.daily.temperature_2m_max[0])+'°';weatherValues[1].textContent=Math.round(weather.daily.temperature_2m_min[0])+'°';weatherValues[2].textContent=aqi;weatherLabels[3].textContent=aqiLabel(aqi);weatherValues[3].style.background=aqi<=100?'#9ed88f':aqi<=150?'#edc45d':'#eb8b76';setWeatherIcon(c.weather_code,c.is_day)}catch{weatherCondition.textContent='Unable to update'}}
cityLabel.textContent=activeLocation.name;
if(activeLocation.name==='New Delhi'){const locationButton=document.createElement('button');locationButton.type='button';locationButton.textContent='⌖';locationButton.title='Use my location';locationButton.style.cssText='margin-left:auto;border:0;background:transparent;color:inherit;font:inherit;font-size:18px;cursor:pointer;padding:0 2px';weatherTitle.append(locationButton);locationButton.addEventListener('click',()=>navigator.geolocation?.getCurrentPosition(({coords})=>{activeLocation={lat:coords.latitude,lon:coords.longitude,name:'Your location'};localStorage.setItem('focus-dashboard-location',JSON.stringify(activeLocation));cityLabel.textContent=activeLocation.name;locationButton.remove();refreshLiveWeather()},()=>weatherCondition.textContent='Location permission denied',{maximumAge:900000,timeout:10000}))}
refreshLiveWeather();setInterval(refreshLiveWeather,1200000);

;(() => {
  const title = document.querySelector('.weather-title');
  const compass = title && title.querySelector('.pin');
  if (compass) compass.textContent = '🧭';
  const label = title && title.querySelectorAll('span')[1];
  async function nameCurrentPlace(coords) {
    const url = 'https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + encodeURIComponent(coords.latitude) + '&longitude=' + encodeURIComponent(coords.longitude) + '&localityLanguage=en';
    const response = await fetch(url);
    if (!response.ok) return;
    const place = await response.json();
    const name = place.city || place.locality || place.principalSubdivision;
    if (!name) return;
    activeLocation = { lat: coords.latitude, lon: coords.longitude, name: name };
    localStorage.setItem('focus-dashboard-location', JSON.stringify(activeLocation));
    if (label) label.textContent = name;
  }
  const locationButton = title && title.querySelector('button');
  locationButton && locationButton.addEventListener('click', () => {
    navigator.geolocation && navigator.geolocation.getCurrentPosition(({ coords }) => nameCurrentPlace(coords));
  });
  if (activeLocation && activeLocation.name === 'Your location') {
    navigator.geolocation && navigator.geolocation.getCurrentPosition(({ coords }) => nameCurrentPlace(coords));
  }
})();
