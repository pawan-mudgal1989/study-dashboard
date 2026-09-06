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
  for (let cell = 0; cell < 42; cell++) {
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

updateClock(); renderCalendar(); setInterval(updateClock, 1000);
