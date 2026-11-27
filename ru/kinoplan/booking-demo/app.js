'use strict';
const app=document.querySelector('#app'), layer=document.querySelector('#layer');
const icons={back:'M15 5l-7 7 7 7',close:'M6 6l12 12M18 6 6 18',pin:'M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1114 0z M14 10a2 2 0 11-4 0 2 2 0 014 0z',calendar:'M4 5h16v15H4z M8 3v5m8-5v5M4 11h16',down:'M5 9l7 7 7-7',photo:'M3 6h18v14H3z M4 18l6-7 4 4 3-3 4 5',plus:'M5 12h14M12 5v14',minus:'M5 12h14',card:'M2 5h20v14H2z M2 10h20',ticket:'M3 6h18v4a2 2 0 000 4v4H3v-4a2 2 0 000-4z M16 7v2m0 2v2m0 2v2'};
function icon(k){return freshIcons[k]+'<svg class="ic original-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="'+icons[k]+'"/></svg>'}
const logo='<svg width="30" height="28" viewBox="0 0 34 30" fill="none" stroke="currentColor" stroke-width="1.65"><circle cx="15" cy="15" r="12.5"/><path d="M3 15L26 3q10 11 1 24z"/></svg>';
const sbp='<img width="28" height="26" alt="" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDIiIGhlaWdodD0iNDkiIHZpZXdCb3g9IjAgMCA0MiA0OSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjE5MjkgMjQuNDk1NEw1Ljg2ODM2IDI4LjE4MzJMMCAzOC40NjA1TDIzLjkzODYgMjQuNDk1NEgxMi4xOTI5WiIgZmlsbD0iIzg3NDY5MSIvPgo8cGF0aCBkPSJNMzAuMjYzIDEzLjk2NTFMMjMuOTM4NCAxNy42NTNMMTguMDcwMSAyNy45MzAyTDQxLjk5OTcgMTMuOTY1MUgzMC4yNjNaIiBmaWxsPSIjREExODQ0Ii8+CjxwYXRoIGQ9Ik0yMy45Mzg0IDEwLjI3NzNMMTguMDcwMSAwVjIxLjA2OTdWMjcuOTMwM1Y0OUwyMy45Mzg0IDM4LjcyMjdWMTAuMjc3M1oiIGZpbGw9IiNGOUIyMjkiLz4KPHBhdGggZD0iTTE4LjA3MDEgMEwyMy45Mzg0IDEwLjI3NzNMMzAuMjYzIDEzLjk2NTFINDEuOTk5N0wxOC4wNzAxIDBaIiBmaWxsPSIjRjA3RjFBIi8+CjxwYXRoIGQ9Ik0xOC4wNzAxIDIxLjA2OTZWNDguOTk5OUwyMy45Mzg0IDM4LjcyMjZWMzEuMzM3OEwxOC4wNzAxIDIxLjA2OTZaIiBmaWxsPSIjNzJCMjJDIi8+CjxwYXRoIGQ9Ik0zMC4yNjMgMzUuMDM0N0wyMy45Mzg0IDM4LjcyMjVMMTguMDcwMSA0OC45OTk4TDQxLjk5OTcgMzUuMDM0N0gzMC4yNjNaIiBmaWxsPSIjMDA3NDNFIi8+CjxwYXRoIGQ9Ik0wIDEwLjUzMDNWMzguNDYwNUw1Ljg2ODM2IDI4LjE4MzNWMjAuODA3NUwwIDEwLjUzMDNaIiBmaWxsPSIjNUY1QTk0Ii8+CjxwYXRoIGQ9Ik0xOC4wNzAyIDIxLjA2OTdWMjEuMDc4N0wwIDEwLjUzMDNMNS44NjgzNiAyMC44MDc1TDMwLjI2MzIgMzUuMDM0OEg0MS45OTk5TDE4LjA3MDIgMjEuMDY5N1oiIGZpbGw9IiMwRDkwQ0QiLz4KPC9zdmc+Cg==">';
const shows=[['13:55',4],['14:45',11,1],['16:25',14],['17:30',11,1],['19:25',3],['21:10',13,1],['22:05',3],['23:05',11,1],['23:45',4]];
const days=['Сегодня','Завтра','Сб','Вс','Пн'], dates=['26 ноября','27 ноября','28 ноября','29 ноября','30 ноября'];
const state={page:'schedule',day:0,session:0,all:false,seats:[],zoom:false,email:'',phone:'',agree:false,edit:false,method:'sbp',end:0};
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const price=r=>(r<=2?300:r<=5?380:410)+(shows[state.session][2]?200:0);
const money=n=>n.toLocaleString('ru-RU')+' ₽';
const total=()=>state.seats.reduce((n,s)=>n+price(s.r),0);
const sessionInfo=()=>dates[state.day]+' · '+shows[state.session][0]+' · Зал '+shows[state.session][1];
const ticketCount=n=>n+' '+(n%100>=11&&n%100<=14?'билетов':n%10===1?'билет':n%10>=2&&n%10<=4?'билета':'билетов');
const isEmbedded = window.parent !== window;
document.documentElement.classList.toggle("is-embedded", isEmbedded);
function fit() {
  const maxScale = isEmbedded ? 1 : 1.12;
  const scale = Math.min(innerWidth / 393, innerHeight / 852, maxScale);
  document.documentElement.style.setProperty("--scale", scale);
}
addEventListener('resize',fit);fit();
function go(page){layer.replaceChildren();app.inert=false;state.page=page;render();app.querySelector('.scroll')?.classList.add('anchor');const title=app.querySelector('h1,h2');title.tabIndex=-1;title.focus({preventScroll:true})}
function header(step){return '<header class="top"><div class="topline"><button class="back" data-act="back" aria-label="Назад">'+icon('back')+'</button><div><b>Рокки – это я</b><small>'+sessionInfo()+'</small></div><span class="step" aria-label="Шаг '+step+' из 3"><span class="compactText">Шаг '+step+' из 3</span><span class="fraction">'+step+' / 3</span><svg class="ring" aria-hidden="true" viewBox="0 0 44 44">'+[0,1,2].map(i=>'<circle cx="22" cy="22" r="19" pathLength="120" fill="none" stroke="'+(i<step?'#ffbf26':'#565965')+'" stroke-width="3" stroke-dasharray="36 84" transform="rotate('+(-85+i*120)+' 22 22)"/>').join('')+'</svg><span class="progress" aria-hidden="true">'+[1,2,3].map(n=>'<i class="'+(n<=step?'on':'')+'"></i>').join('')+'</span></span></div></header>'}
function footer(label,act,disabled=false,extra=''){return '<footer class="foot">'+extra+'<button class="primary" data-act="'+act+'" '+(disabled?'disabled':'')+'>'+label+'</button></footer>'}
function schedule(){return '<header class="brand"><div class="wordmark">'+logo+'ГОРИЗОНТ</div><div class="city">'+icon('pin')+'Ростов-на-Дону</div></header><div class="scroll"><section class="hero"><span class="prem">Премьера</span><div class="heroCopy"><h1>Рокки – это я</h1><div class="meta">Драма <span class="dot">·</span> 2D <span class="dot">·</span> <span class="age">18+</span></div></div></section><section class="pad"><div class="venue"><strong>Горизонт Cinema &amp; Emotion</strong><small>просп. Михаила Нагибина, 32д/2</small></div><div class="heading"><h2>Сеансы</h2><span class="month">'+icon('calendar')+'Ноябрь</span></div><div class="dates">'+days.map((d,i)=>'<button class="date '+(i===state.day?'current':'')+'" aria-pressed="'+(i===state.day)+'" data-day="'+i+'"><small>'+d+'</small><strong>'+(26+i)+'</strong></button>').join('')+'</div><div class="grid">'+shows.slice(0,state.all?9:4).map(([t,h,v],i)=>'<button class="showtime" data-show="'+i+'"><div class="line"><strong>'+t+'</strong><span class="tag '+(v?'vip':'')+'">'+(v?'VIP-зал':'2D')+'</span></div><p>Зал '+h+' · от '+money(v?500:300)+'</p></button>').join('')+'</div><button class="more" aria-expanded="'+state.all+'" data-act="more">'+(state.all?'Свернуть':'Все сеансы')+icon('down')+'</button></section></div>'}
const colors=['#ffb875','#65cdbb','#8facff'];
function seatMap(){let html='';for(let r=1;r<=8;r++){html+='<div class="row"><b class="num">'+r+'</b>';for(let n=1;n<=12;n++){const taken=(r*17+n*7+state.session+state.day)%13<2,sel=state.seats.some(s=>s.r===r&&s.n===n);html+='<button class="seat '+(taken?'taken':sel?'sel':'')+'" style="--seat:'+colors[r<=2?0:r<=5?1:2]+'" data-seat="'+r+'-'+n+'" aria-pressed="'+sel+'" aria-label="Ряд '+r+', место '+n+', '+(taken?'занято':money(price(r)))+'" '+(taken?'disabled':'')+'><span>'+(sel?'<span class="old-check">✓</span>'+freshIcons.check:state.zoom&&!taken?n:'')+'</span></button>'}html+='</div>'}return html}
function ticketRows(editable){return state.seats.map(s=>'<div class="ticketline">'+icon('ticket')+'Ряд '+s.r+' · Место '+s.n+'<strong>'+money(price(s.r))+'</strong>'+(editable?'<button class="del" aria-label="Убрать место '+s.n+', ряд '+s.r+'" data-seat="'+s.r+'-'+s.n+'">'+icon('close')+'</button>':'')+'</div>').join('')}
function seating(){return header(1)+'<div class="scroll pad"><div class="hallSurface"><div class="heading"><h2>Выберите места</h2><span class="tag age">18+</span></div><div class="seatArea"><div class="seatTools"><button class="photoBtn" data-act="photo">'+icon('photo')+'Фото зала</button><button class="zoom" data-act="zoom">'+icon(state.zoom?'minus':'plus')+(state.zoom?'Уменьшить':'Увеличить')+'</button></div><div class="mapScroll '+(state.zoom?'pan':'')+'" role="region" aria-label="Схема зала" tabindex="0"><div class="map '+(state.zoom?'zoomed':'')+'"><div class="mapContent"><div class="screen">Экран</div>'+seatMap()+'</div></div></div><div class="legend">'+[1,3,6,0].map((r,i)=>'<span><i style="--seat:'+(colors[i]||'#4a5268')+'"></i>'+(r?['1–2','3–5','6–8'][i]+' ряд · '+money(price(r)):'Занято')+'</span>').join('')+'</div></div></div><h3>Ваши места</h3>'+(state.seats.length?ticketRows(true):'<p class="intro">Нажмите на свободное кресло на схеме</p>')+'</div>'+footer(state.edit?'Сохранить места':'К оформлению','nextseats',!state.seats.length,state.seats.length?'<div class="line sum">'+ticketCount(state.seats.length)+'<strong>'+money(total())+'</strong></div>':'')}
function contacts(){return header(2)+'<div class="scroll pad"><h2>Куда отправить билеты?</h2><p class="intro">Билеты и чек придут на почту после оплаты</p><form id="contacts" novalidate><label class="field">Электронная почта<input id="email" aria-describedby="emailErr" required type="email" autocomplete="email" placeholder="name@example.ru" value="'+esc(state.email)+'"><span id="emailErr" class="error"></span></label><label class="field">Телефон<input id="phone" aria-describedby="phoneHint phoneErr" required type="tel" autocomplete="tel" placeholder="+7 (999) 123-45-67" value="'+esc(state.phone)+'"><small id="phoneHint">Для связи, если сеанс изменится</small><span id="phoneErr" class="error"></span></label><label class="check"><input id="agree" aria-describedby="agreeErr" required type="checkbox" '+(state.agree?'checked':'')+'><span>Принимаю <a href="#terms" data-act="terms">условия покупки</a> и даю <a href="#privacy" data-act="privacy">согласие на обработку персональных данных</a></span></label><div id="agreeErr" class="error"></div></form></div>'+footer(state.edit?'Сохранить контакты':'Продолжить','check')}
function review(){return header(3)+'<div class="scroll pad"><h2>Проверьте заказ</h2><div class="reviewfilm"><img src="poster.jpg" alt=""><div><h3>Рокки – это я</h3><p>Горизонт Cinema & Emotion</p><p>'+sessionInfo()+'</p><div class="chips"><span>2D</span><span class="age">18+</span></div></div></div><section class="reviewpart"><div class="heading"><h3>Билеты</h3><button class="textbtn" data-act="editseats">Изменить места</button></div>'+ticketRows(false)+'</section><section class="reviewpart"><div class="heading"><h3>Получатель</h3><button class="textbtn" data-act="editcontacts">Изменить</button></div><p class="mail">'+esc(state.email)+'</p><small>'+esc(state.phone)+'</small></section><section class="reviewpart"><h3>Способ оплаты</h3>'+['sbp','card'].map(m=>'<button class="method '+(state.method===m?'on':'')+'" aria-pressed="'+(state.method===m)+'" data-method="'+m+'">'+(m==='sbp'?sbp+'Система быстрых платежей':icon('card')+'Банковская карта')+'<i class="radio"></i></button>').join('')+'</section></div>'+footer(state.method==='sbp'?'Выбрать банк':'К оплате картой','payment',false,'<div class="line sum"><b>Итого</b><strong>'+money(total())+'</strong></div>')}
if (isEmbedded) {
  document.addEventListener("pointerdown", () => {
    window.parent.postMessage({type: "booking-interaction"}, "*");
  }, {once: true});
}

function notifyBookingPage() {
  if (window.parent !== window) {
    window.parent.postMessage({type: "booking-page", page: state.page}, "*");
  }
}
window.addEventListener("message", event => {
  if (event.source === window.parent && event.data?.type === "request-booking-page") notifyBookingPage();
});
function render() {
  app.dataset.page = state.page;
  app.innerHTML = ({schedule, seating, contacts, review}[state.page])();
  notifyBookingPage();
}
function refresh(){
  const view=app.querySelector('.scroll'), map=app.querySelector('.mapScroll');
  const pageY=view?.scrollTop||0, mapX=map?.scrollLeft||0, mapY=map?.scrollTop||0;
  const focused=document.activeElement, key=['seat','act','method','day'].find(k=>focused.dataset?.[k]);
  render();
  app.querySelector('.scroll').scrollTop=pageY;
  if(state.zoom)app.querySelector('.mapScroll')?.scrollTo(mapX,mapY);
  if(key)app.querySelector('[data-'+key+'="'+CSS.escape(focused.dataset[key])+'"]')?.focus({preventScroll:true});
}
let modalOrigin;
function modal(title,body,closable=true){if(!layer.firstChild)modalOrigin=document.activeElement;layer.innerHTML='<div class="scrim"><section role="dialog" aria-modal="true" aria-labelledby="sheetTitle" class="sheet" tabindex="-1">'+(closable?'<div class="grab" aria-hidden="true"><i></i></div>':'')+'<div class="heading"><h2 id="sheetTitle">'+title+'</h2>'+(closable?'<button class="round" aria-label="Закрыть" data-act="dismiss">'+icon('close')+'</button>':'')+'</div>'+body+'</section></div>';app.inert=true;const sheet=layer.querySelector('.sheet');sheet.focus({preventScroll:true});
  if(closable)enableSheetDrag(sheet)}
function dismiss(){layer.replaceChildren();app.inert=false;modalOrigin?.focus({preventScroll:true})}
function enableSheetDrag(sheet){
  const grip=sheet.querySelector('.grab');
  const header=sheet.querySelector('.heading');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let drag=null;
  function start(event){
    if(!event.isPrimary || event.button!==0 || event.target.closest('button'))return;
    drag={id:event.pointerId,y:event.clientY,start:performance.now(),offset:0};
    event.currentTarget.setPointerCapture(event.pointerId);
    sheet.style.animation='none';
    sheet.style.transition='none';
  }
  function move(event){
    if(event.pointerId!==drag?.id)return;
    const scale=sheet.getBoundingClientRect().width/sheet.offsetWidth;
    drag.offset=Math.max(0,(event.clientY-drag.y)/scale);
    sheet.style.transform='translateY('+drag.offset+'px)';
  }
  function end(event){
    if(event.pointerId!==drag?.id)return;
    const close=event.type==='pointerup'&&(drag.offset>62||(drag.offset>24&&drag.offset/(performance.now()-drag.start)>.48));
    drag=null;
    sheet.style.transition=reduced?'none':'transform 180ms cubic-bezier(.2,.75,.25,1)';
    sheet.style.transform=close?'translateY(100%)':'';
    if(close){sheet.style.pointerEvents='none';setTimeout(()=>{if(sheet.isConnected)dismiss()},reduced?0:180)}
  }
  for(const area of [grip,header]){
    area.addEventListener('pointerdown',start);
    area.addEventListener('pointermove',move);
    area.addEventListener('pointerup',end);
    area.addEventListener('pointercancel',end);
  }
}
function validate(){const form=document.querySelector('#contacts');const issues={email:/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())?'':'Введите почту в формате name@example.ru',phone:document.body.dataset.look==='2'?phoneError(state.phone):/^[78]\d{10}$/.test(state.phone.replace(/\D/g,''))?'':'Введите номер с кодом страны +7',agree:state.agree?'':'Для продолжения подтвердите согласие'};for(const [k,v] of Object.entries(issues)){form.querySelector('#'+k+'Err').textContent=v;form.querySelector('#'+k).setAttribute('aria-invalid',String(!!v))}const key=Object.keys(issues).find(k=>issues[k]);if(key){form.querySelector('#'+key).focus();return}state.email=state.email.trim();state.edit=false;go('review')}
function timer(){return '<div class="reserve">Места забронированы ещё <b id="clock"></b><br>Затем они вернутся в продажу</div>'}
function tick(){if(!state.end)return;const sec=Math.max(0,Math.ceil((state.end-Date.now())/1000));const clock=document.querySelector('#clock');if(clock)clock.textContent=Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');if(!sec){state.end=0;state.seats=[];state.edit=false;modal('Время брони истекло','<p>Контакты сохранены. Выберите места ещё раз</p><button class="primary" data-act="expired">Выбрать места</button>',false)}}
setInterval(tick,500);
function payment(){if(!state.end)state.end=Date.now()+900000;if(state.method==='sbp'){modal('Выберите банк', '<p class="muted">Оплата через СБП · '+money(total())+'</p>'+timer()+['СберБанк','Т-Банк','Альфа-Банк'].map((b,i)=>'<button class="method bank" data-bank="'+b+'"><span class="bankmark bank'+['111','004','008'][i]+'" aria-hidden="true"></span>'+b+'</button>').join(''))}else endpoint('Оплата картой');tick()}
function endpoint(title){modal(title,'<p>После оплаты вернитесь к заказу</p>'+timer()+'<p class="line">К оплате <b>'+money(total())+'</b></p><button class="primary" data-act="dismiss">Вернуться к заказу</button>');tick()}
function changeSeat(key){let [r,n]=key.split('-').map(Number);let idx=state.seats.findIndex(s=>s.r===r&&s.n===n);if(idx===-1)state.seats.push({r,n});else state.seats.splice(idx,1);refresh()}
function leaveSeats(){state.seats=[];state.end=0;state.zoom=false;go('schedule')}
let savedEdit=null; function startEdit(page){savedEdit={email:state.email,phone:state.phone,agree:state.agree,seats:state.seats.slice()};state.edit=true;go(page)} function back(){if(state.edit&&savedEdit){Object.assign(state,savedEdit);state.edit=false;go('review');return}if(state.page==='seating'){if(state.seats.length)modal('Сменить сеанс?','<p>Выбранные места освободятся</p><button class="secondary" data-act="leave">Сменить сеанс</button><button class="primary" data-act="dismiss">Остаться</button>');else leaveSeats()}else if(state.page==='contacts')go('seating');else if(state.page==='review')go('contacts')}
document.addEventListener('input',e=>{if(['email','phone','agree'].includes(e.target.id)){state[e.target.id]=e.target.id==='agree'?e.target.checked:e.target.value;e.target.removeAttribute('aria-invalid');document.getElementById(e.target.id+'Err').textContent=''}});
document.addEventListener('submit',e=>{e.preventDefault();validate()});
document.addEventListener('keydown',e=>{
  const sheet=layer.querySelector('.sheet');
  if(!sheet)return;
  if(e.key==='Escape'&&sheet.querySelector('[data-act="dismiss"]'))dismiss();
  if(e.key!=='Tab')return;
  const controls=sheet.querySelectorAll('button:not(:disabled),a[href]');
  const first=controls[0],last=controls[controls.length-1];
  if(e.shiftKey&&(document.activeElement===first||document.activeElement===sheet)){e.preventDefault();last.focus()}
  if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
});
document.addEventListener('click',e=>{let b=e.target.closest('button, a[data-act]');if(b?.tagName==='A')e.preventDefault();if(!b){if(e.target.classList.contains('scrim')&&layer.querySelector('[data-act="dismiss"]'))dismiss();return}let d=b.dataset;if('day'in d){state.day=+d.day;refresh()}else if('show'in d){state.session=+d.show;state.edit=false;go('seating')}else if(d.seat)changeSeat(d.seat);else if(d.method){state.method=d.method;refresh()}else if(d.bank)endpoint('Переход в '+d.bank);else switch(d.act){
case 'more':state.all=!state.all;refresh();if(state.all)app.querySelector('.grid').scrollIntoView({block:'nearest'});break;
case 'back':back();break;case 'leave':leaveSeats();break;case 'dismiss':dismiss();break;
case 'photo':modal('Фото зала','<img src="hall.jpg" alt="Вид на ряды кресел со стороны экрана"><p class="smalltxt">Зал 4 · Горизонт Cinema & Emotion</p>');break;
case 'zoom':state.zoom=!state.zoom;refresh();if(state.zoom){const map=app.querySelector('.mapScroll');map.scrollLeft=(map.scrollWidth-map.clientWidth)/2}break;
case 'nextseats':if(state.seats.length){go(state.edit?'review':'contacts');state.edit=false}break;
case 'check':validate();break;
case 'editseats':startEdit('seating');break;case 'editcontacts':startEdit('contacts');break;
case 'privacy':modal('Обработка данных','<p>Почта и телефон используются для проверки заказа. Данные хранятся до закрытия или обновления страницы</p>');break;
case 'terms':modal('Условия покупки','<p>Билет действует на выбранный сеанс и место. Для фильма 18+ при входе могут попросить документ, подтверждающий возраст</p>');break;
case 'payment':payment();break;case 'expired':go('seating');break;
}});
render();
