/*
 * V1 data adapter. Keep this file's public shape when replacing demo data
 * with API-backed calendar and weather providers later.
 */
const SETTINGS = { demoMode: true, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, location: 'Delhi' };

const demoEvents = [
  { hour: 9, minute: 30, title: 'Team stand-up', source: 'Work · Outlook', kind: 'work', duration: 30 },
  { hour: 11, minute: 0, title: 'Architecture review', source: 'Work · Outlook', kind: 'work', duration: 60 },
  { hour: 13, minute: 0, title: 'Lunch with Riya', source: 'Personal · Google', kind: 'personal', duration: 60 },
  { hour: 15, minute: 30, title: 'Deep work', source: 'Personal · Google', kind: 'personal', duration: 90 }
];

function pad(number) { return String(number).padStart(2, '0'); }
function eventDate(event, now = new Date()) { const date = new Date(now); date.setHours(event.hour, event.minute, 0, 0); return date; }
function formatTime(date) { return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date); }
function formatDate(date) { return new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(date); }

function renderAgenda(events) {
  document.querySelector('#event-count').textContent = `${events.length} EVENT${events.length === 1 ? '' : 'S'}`;
  document.querySelector('#agenda-list').innerHTML = events.length ? events.map(event => `
    <div class="event ${event.kind}">
      <time class="event-time">${formatTime(eventDate(event))}</time>
      <span class="event-dot" aria-hidden="true"></span>
      <div><span class="event-title">${event.title}</span><span class="event-source">${event.source}</span></div>
    </div>`).join('') : '<p class="next-meta">Nothing scheduled for today.</p>';
}

function updateClock() {
  const now = new Date();
  document.querySelector('#clock').textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  document.querySelector('#date').textContent = formatDate(now);
  const next = demoEvents.map(event => ({ ...event, startsAt: eventDate(event, now) })).find(event => event.startsAt > now);
  const title = document.querySelector('#next-title');
  const meta = document.querySelector('#next-meta');
  const countdown = document.querySelector('#countdown');
  if (!next) { title.textContent = 'Nothing else today'; meta.textContent = 'Your desk is clear.'; countdown.textContent = 'OPEN TIME'; return; }
  const minutes = Math.max(1, Math.ceil((next.startsAt - now) / 60000));
  title.textContent = next.title;
  meta.textContent = `${formatTime(next.startsAt)} · ${next.source}`;
  countdown.textContent = minutes < 60 ? `IN ${minutes} MIN` : `IN ${Math.floor(minutes / 60)}H ${minutes % 60}M`;
}

async function loadWeather() {
  document.querySelector('#weather-location').textContent = SETTINGS.location;
  // Demo weather intentionally keeps this page usable offline. A future provider
  // can replace this adapter without touching presentation code.
}

document.querySelector('#data-mode').textContent = SETTINGS.demoMode ? 'DEMO MODE' : 'CONNECTED';
renderAgenda(demoEvents);
updateClock(); loadWeather();
setInterval(updateClock, 1000);
document.querySelector('#fullscreen-button').addEventListener('click', async () => {
  if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
  else await document.exitFullscreen?.();
});
