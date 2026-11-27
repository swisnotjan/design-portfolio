function phoneError(raw){
  const digits=raw.replace(/\D/g,'');
  if(!digits||raw.trim()==='+7')return 'Введите номер телефона';
  if(/[^\d\s()+-]/.test(raw))return 'Используйте только цифры';
  if(raw.startsWith('+')&&!raw.startsWith('+7'))return 'Введите номер с кодом +7';
  if(digits.length>11)return 'В номере слишком много цифр';
  return /^7\d{10}$/.test(digits)?'':'Введите все 10 цифр после +7';
}
function formatPhone(input){
  const raw=input.value, caret=input.selectionStart??raw.length;
  if(/[^\d\s()+-]/.test(raw)||(/^\+/.test(raw)&&!/^\+7/.test(raw)))return;
  let digits=raw.replace(/\D/g,''),count=raw.slice(0,caret).replace(/\D/g,'').length;
  if(raw.startsWith('+7')||(digits.length===11&&/^[78]/.test(digits))){digits=digits.slice(1);count--}
  const formatted='+7'+(digits?' ('+digits.slice(0,3):'')+(digits.length>3?') '+digits.slice(3,6):'')+(digits.length>6?'-'+digits.slice(6,8):'')+(digits.length>8?'-'+digits.slice(8):'');
  input.value=formatted;
  let pos=2,seen=0;
  while(pos<formatted.length&&seen<count){if(/\d/.test(formatted[pos]))seen++;pos++}
  input.setSelectionRange(pos,pos);
}
function isFreshPhone(el){return el.id==='phone'&&document.body.dataset.look==='2'}
document.addEventListener('focusin',e=>{if(isFreshPhone(e.target)&&!e.target.value){e.target.value='+7';state.phone='+7'}});
document.addEventListener('input',e=>{if(isFreshPhone(e.target))formatPhone(e.target)},true);
document.addEventListener('beforeinput',e=>{
  const el=e.target;if(!isFreshPhone(el)||el.selectionStart!==el.selectionEnd)return;
  let p=el.selectionStart;
  if(e.inputType.startsWith('insert')&&el.value.startsWith('+7')&&p<2){el.setSelectionRange(2,2);return}
  if(e.inputType==='deleteContentBackward'){
    if(p<=2){e.preventDefault();return}
    let start=p-1;while(start>2&&!/\d/.test(el.value[start]))start--;
    el.setSelectionRange(start,p);
  }
});
document.body.style.setProperty('--check-image','url(data:image/svg+xml,'+encodeURIComponent(freshIcons.check.replace('currentColor','white')).replaceAll('(', '%28').replaceAll(')', '%29')+')');


function updateFooterShadow(){
  const scroller=app.querySelector('.scroll');
  app.dataset.scrolled=String(Boolean(scroller && scroller.scrollTop>0));
  app.dataset.moreBelow=String(Boolean(scroller && scroller.scrollHeight-scroller.clientHeight-scroller.scrollTop>1));
}
app.addEventListener('scroll',updateFooterShadow,true);
new MutationObserver(updateFooterShadow).observe(app,{childList:true,subtree:true});
addEventListener('resize',updateFooterShadow);
document.fonts.ready.then(updateFooterShadow);
