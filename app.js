(() => {
  'use strict';
  const {signs,dayKey,validDate,addDays,generate}=window.StarNotes;
  const $=id=>document.getElementById(id);
  const storage={
    get(key){try{return localStorage.getItem(key);}catch{return null;}},
    set(key,value){try{localStorage.setItem(key,value);return true;}catch{return false;}}
  };
  const params=new URLSearchParams(location.search);
  const requestedSign=params.get('sign')||storage.get('zzr520-sign');
  let signId=signs.some(s=>s.id===requestedSign)?requestedSign:'cancer';
  let today=dayKey();
  let selectedDate=validDate(params.get('date'))?params.get('date'):today;
  let followToday=!validDate(params.get('date'));
  let current;
  let toastTimer;
  function toast(text){$('toast').textContent=text;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),4000);}
  function moodKey(){return `zzr520-mood:${selectedDate}`;}
  const responses={'开心':'把这份亮晶晶的心情，悄悄收藏。','平静':'平平淡淡，也是一种很好的天气。','有点累':'辛苦啦，今天也可以早点休息。','想被抱抱':'给你一个轻轻的、长一点的拥抱。'};
  function renderMood(){
    const saved=storage.get(moodKey());
    document.querySelectorAll('[data-mood]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.mood===saved));b.classList.toggle('selected',b.dataset.mood===saved);b.disabled=selectedDate>today;});
    $('mood-status').textContent=selectedDate>today?'明天的心情，留给明天记录。':saved&&responses[saved]?responses[saved]+' 已保存在这台设备。':'只记在这台设备上，留给自己看。';
  }
  function render(){
    current=generate(selectedDate,signId);
    const date=new Date(selectedDate+'T12:00:00+08:00');
    $('date-label').textContent=new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'long',day:'numeric',weekday:'long'}).format(date);
    $('date-subtitle').textContent=`${selectedDate.replaceAll('-',' / ')} · 北京时间${selectedDate===today?' · 今天':''}`;
    $('today-button').textContent=selectedDate===today?'今天':'回到今天';
    $('zodiac-select').value=signId;
    $('zodiac-symbol').textContent=current.sign.symbol+'\uFE0E';
    $('zodiac-name').textContent=current.sign.name;
    $('zodiac-meta').textContent=current.sign.range+' · '+current.sign.meta;
    $('daily-title').textContent=current.title;
    $('daily-summary').textContent=current.summary;
    $('daily-theme').textContent=current.theme;
    for(const k of ['overall','love','work','life']){
      $('score-'+k).textContent=current.scores[k];
      $('text-'+k).textContent=current.texts[k];
      $('bar-'+k).style.width=current.scores[k]+'%';
    }
    $('lucky-color').textContent=current.color[0];$('lucky-swatch').style.backgroundColor=current.color[1];
    $('lucky-number').textContent=current.number;$('lucky-sign').textContent=current.luckySign;
    $('daily-ritual').textContent=current.ritual;
    $('love-message').textContent=current.letter;$('love-message').hidden=true;
    $('reveal-message').setAttribute('aria-expanded','false');$('reveal-message').textContent='拆开这封小情书 ↗';
    document.title=`${current.sign.name} · ${selectedDate} | 写给你的星空`;
    renderMood();
  }
  function syncUrl(){
    const url=new URL(location.href);url.searchParams.set('sign',signId);
    if(followToday) url.searchParams.delete('date');else url.searchParams.set('date',selectedDate);
    try{history.replaceState(null,'',url);}catch{}
  }
  $('prev-day').addEventListener('click',()=>{followToday=false;selectedDate=addDays(selectedDate,-1);render();syncUrl();});
  $('next-day').addEventListener('click',()=>{followToday=false;selectedDate=addDays(selectedDate,1);render();syncUrl();});
  $('today-button').addEventListener('click',()=>{followToday=true;today=dayKey();selectedDate=today;render();syncUrl();});
  $('zodiac-select').addEventListener('change',e=>{signId=e.target.value;storage.set('zzr520-sign',signId);render();syncUrl();});
  $('reveal-message').addEventListener('click',()=>{const show=$('love-message').hidden;$('love-message').hidden=!show;$('reveal-message').setAttribute('aria-expanded',String(show));$('reveal-message').textContent=show?'把心意收好 ↗':'拆开这封小情书 ↗';});
  document.querySelectorAll('[data-mood]').forEach(b=>b.addEventListener('click',()=>{
    if(selectedDate>today)return;
    const ok=storage.set(moodKey(),b.dataset.mood);renderMood();
    toast(ok?'已记下这一刻的心情。':'浏览器未允许保存，心情暂时无法留下。');
  }));
  $('share-button').addEventListener('click',async()=>{
    const url=new URL(location.href);url.searchParams.set('sign',signId);url.searchParams.set('date',selectedDate);
    try{
      if(navigator.share){await navigator.share({title:'写给你的星空',text:current.sign.name+'的今日星空手记',url:url.href});return;}
      if(navigator.clipboard && window.isSecureContext){await navigator.clipboard.writeText(url.href);toast('链接已复制，分享今天的小美好。');return;}
    }catch(error){if(error.name==='AbortError')return;}
    window.prompt('复制这个链接，分享今天的星空：',url.href);
  });
  function checkDay(){const newDay=dayKey();if(newDay!==today){today=newDay;if(followToday)selectedDate=today;render();syncUrl();}}
  setInterval(checkDay,30000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkDay();});
  window.addEventListener('focus',checkDay);
  render();
})();
