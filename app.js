const demoEvents = [
  { hour: 9, minute: 30, title: 'Team stand-up', source: 'Work · Outlook', type: 'work' },
  { hour: 11, minute: 0, title: 'Architecture review', source: 'Work · Outlook', type: 'work' },
  { hour: 13, minute: 0, title: 'Lunch with Riya', source: 'Personal · Google', type: 'personal' },
  { hour: 15, minute: 30, title: 'Deep work', source: 'Personal · Google', type: 'personal' }
];

const $ = selector => document.querySelector(selector);
const pad = value => String(value).padStart(2, '0');
const eventDate = (event, now) => new Date(now.getFullYear(), now.getMonth(), now.getDate(), event.hour, event.minute);
const formatTime = date => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date);

function eventRow(event) {
  return `<div class="event ${event.type}"><time>${formatTime(eventDate(event, new Date()))}</time><i class="dot"></i><div><b>${event.title}</b><small>${event.source}</small></div></div>`;
}

function renderAgenda() {
  const markup = demoEvents.map(eventRow).join('');
  $('#home-agenda').innerHTML = markup;
  $('#full-agenda').innerHTML = markup;
  $('#event-count').textContent = `${demoEvents.length} EVENTS`;
}

function updateClock() {
  const now = new Date();
  $('#clock').textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  $('#date').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(now);
  const next = demoEvents.map(event => ({ ...event, startsAt: eventDate(event, now) })).find(event => event.startsAt > now);
  if (!next) { $('#next-title').textContent = 'Nothing else today'; $('#next-meta').textContent = 'Your desk is clear.'; $('#countdown').textContent = 'OPEN TIME'; return; }
  const minutes = Math.max(1, Math.ceil((next.startsAt - now) / 60000));
  $('#next-title').textContent = next.title;
  $('#next-meta').textContent = `${formatTime(next.startsAt)} · ${next.source}`;
  $('#countdown').textContent = minutes < 60 ? `IN ${minutes} MIN` : `IN ${Math.floor(minutes / 60)}H ${minutes % 60}M`;
}

let activePage = 0;
const pager = $('#pager');
const pageButtons = [...document.querySelectorAll('.page-nav button')];
function showPage(index) {
  activePage = Math.max(0, Math.min(3, index));
  pager.style.transform = `translateX(-${activePage * 25}%)`;
  pageButtons.forEach((button, buttonIndex) => button.classList.toggle('active', buttonIndex === activePage));
}
pageButtons.forEach((button, index) => button.addEventListener('click', () => showPage(index)));
let touchStart = null;
pager.addEventListener('touchstart', event => { touchStart = event.changedTouches[0].screenX; }, { passive: true });
pager.addEventListener('touchend', event => { if (touchStart === null) return; const distance = event.changedTouches[0].screenX - touchStart; if (Math.abs(distance) > 55) showPage(activePage + (distance < 0 ? 1 : -1)); touchStart = null; }, { passive: true });
document.addEventListener('keydown', event => { if (event.key === 'ArrowRight') showPage(activePage + 1); if (event.key === 'ArrowLeft') showPage(activePage - 1); });

let remainingSeconds = 25 * 60;
let timer = null;
function paintTimer() { $('#focus-time').textContent = `${pad(Math.floor(remainingSeconds / 60))}:${pad(remainingSeconds % 60)}`; }
$('#timer-button').addEventListener('click', () => {
  if (timer) { clearInterval(timer); timer = null; $('#timer-button').textContent = 'RESUME SESSION'; return; }
  $('#timer-button').textContent = 'PAUSE SESSION';
  timer = setInterval(() => { if (remainingSeconds > 0) { remainingSeconds--; paintTimer(); } else { clearInterval(timer); timer = null; $('#timer-button').textContent = 'SESSION COMPLETE'; $('#timer-label').textContent = 'WELL DONE'; } }, 1000);
});
$('#timer-reset').addEventListener('click', () => { clearInterval(timer); timer = null; remainingSeconds = 25 * 60; paintTimer(); $('#timer-button').textContent = 'START SESSION'; $('#timer-label').textContent = 'READY FOR FOCUS'; });
$('#fullscreen-button').addEventListener('click', () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());

renderAgenda();
updateClock();
paintTimer();
setInterval(updateClock, 1000);
