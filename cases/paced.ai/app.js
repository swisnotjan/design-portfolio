const tabs = [...document.querySelectorAll('[data-calendar]')];
function showCalendar(index) {
  tabs.forEach((tab, i) => {
    const selected = i === index;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
  });
}
tabs.forEach((tab, i) => tab.addEventListener('click', () => showCalendar(i)));
document.querySelector('.calendar-tabs').addEventListener('keydown', event => {
  let index = tabs.indexOf(document.activeElement);
  if (index < 0) return;
  if (event.key === 'ArrowRight') index = (index + 1) % tabs.length;
  else if (event.key === 'ArrowLeft') index = (index + tabs.length - 1) % tabs.length;
  else if (event.key === 'Home') index = 0;
  else if (event.key === 'End') index = tabs.length - 1;
  else return;
  event.preventDefault();
  showCalendar(index);
  tabs[index].focus();
});
showCalendar(1);

const viewer = document.querySelector('#viewer');
const preview = document.querySelector('#viewer-image');
let previousFocus;
document.querySelectorAll('[data-image]').forEach(button => {
  button.addEventListener('click', () => {
    previousFocus = button;
    preview.src = button.dataset.image;
    preview.alt = button.querySelector('img')?.alt || '';
    viewer.showModal();
    document.body.style.overflow = 'hidden';
  });
});
viewer.addEventListener('click', () => viewer.close());
viewer.addEventListener('close', () => {
  document.body.style.overflow = '';
  previousFocus?.focus({preventScroll: true});
});

let topLayer = 5;
document.querySelectorAll('[data-popup]').forEach(card => {
  let x = 0, y = 0, drag;
  function move(nextX, nextY) {
    const stage = card.parentElement;
    const minX = 16 - card.offsetLeft;
    const maxX = stage.clientWidth - card.offsetWidth - card.offsetLeft - 16;
    const minY = 58 - card.offsetTop;
    const maxY = stage.clientHeight - card.offsetHeight - card.offsetTop - 16;
    x = Math.min(maxX, Math.max(minX, nextX));
    y = Math.min(maxY, Math.max(minY, nextY));
    card.style.setProperty('--dx', x + 'px');
    card.style.setProperty('--dy', y + 'px');
  }
  card.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    card.style.zIndex = ++topLayer;
    drag = {pointer: event.pointerId, startX: event.clientX, startY: event.clientY, x, y};
    card.setPointerCapture(event.pointerId);
    card.classList.add('is-dragging');
    card.focus({preventScroll: true});
    event.preventDefault();
  });
  card.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointer) return;
    move(drag.x + event.clientX - drag.startX, drag.y + event.clientY - drag.startY);
  });
  function endDrag() {
    drag = null;
    card.classList.remove('is-dragging');
  }
  card.addEventListener('pointerup', endDrag);
  card.addEventListener('pointercancel', endDrag);
  card.addEventListener('lostpointercapture', endDrag);
  card.addEventListener('keydown', event => {
    const directions = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]};
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    card.style.zIndex = ++topLayer;
    const step = event.shiftKey ? 30 : 10;
    move(x + direction[0] * step, y + direction[1] * step);
  });
});
