/* ====================================================================
   写给紫瑞的星空 · 交互
   想改称呼或特殊日子，只需要动下面这 4 行。
   ==================================================================== */
const CONFIG = {
  her: '紫瑞',              // ← 她的名字 / 昵称，会出现在标题和页脚；留空则是「你」
  birthday: '',             // ← 她的生日，格式 'MM-DD'，例如 '07-12'；不知道就留空
  anniversary: '05-20'      // ← 你们在一起的日子，格式 'MM-DD'
};

(() => {
  'use strict';

  const { signs, dayKey, validDate, addDays, generate } = window.StarNotes;
  const $ = id => document.getElementById(id);
  const HER = (CONFIG.her || '').trim();
  const WHO = HER || '你';
  document.documentElement.classList.toggle('has-name', Boolean(HER));

  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); return true; } catch { return false; } },
    del(key) { try { localStorage.removeItem(key); } catch { } }
  };

  const params = new URLSearchParams(location.search);
  const requestedSign = params.get('sign') || storage.get('zzr520-sign');
  let signId = signs.some(s => s.id === requestedSign) ? requestedSign : 'cancer';
  let today = dayKey();
  let selectedDate = validDate(params.get('date')) ? params.get('date') : today;
  let followToday = !validDate(params.get('date'));
  let current;
  let toastTimer;

  /* ---------------------------------------------------------------
     哪些日子是特别的
     --------------------------------------------------------------- */
  function specialOf(date) {
    const md = date.slice(5);
    if (CONFIG.anniversary && md === CONFIG.anniversary) return 'anniversary';
    if (CONFIG.birthday && md === CONFIG.birthday) return 'birthday';
    if (md === '01-01') return 'newyear';
    return '';
  }

  /* ---------------------------------------------------------------
     来过几次、第几天（只存在这台设备上）
     --------------------------------------------------------------- */
  const VISITS_KEY = 'zzr520-visits-v1';
  const MOOD_PREFIX = 'zzr520-mood:';

  function readVisits() {
    try { return JSON.parse(storage.get(VISITS_KEY) || 'null'); } catch { return null; }
  }

  function recordVisit(day) {
    const now = Date.now();
    let v = readVisits();
    if (!v || typeof v.count !== 'number' || !validDate(v.first)) {
      v = { count: 0, first: day, days: 1, lastAt: 0 };
    }
    v.days = Math.max(1, Math.round((Date.parse(day + 'T00:00:00Z') - Date.parse(v.first + 'T00:00:00Z')) / 86400000) + 1);
    /* 半小时内反复刷新不重复计数，免得把「来过几次」刷成假数据 */
    if (!v.lastAt || now - v.lastAt > 30 * 60 * 1000) {
      v.count += 1;
      v.lastAt = now;
    }
    storage.set(VISITS_KEY, JSON.stringify(v));
    return v;
  }

  let visits = recordVisit(today);

  /* 心情记录只留最近 60 天，别让 localStorage 一直长 */
  function pruneMoods() {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i += 1) {
        const k = localStorage.key(i);
        if (k && k.indexOf(MOOD_PREFIX) === 0) keys.push(k);
      }
      if (keys.length <= 60) return;
      keys.sort();
      keys.slice(0, keys.length - 60).forEach(k => storage.del(k));
    } catch { }
  }

  /* ---------------------------------------------------------------
     小工具
     --------------------------------------------------------------- */
  function toast(text) {
    const el = $('toast');
    el.textContent = text;
    el.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('visible'), 4000);
  }

  function splitTitle(title) {
    const i = title.indexOf('，');
    if (i === -1) return [title, ''];
    return [title.slice(0, i + 1), title.slice(i + 1)];
  }

  function moodKey() { return MOOD_PREFIX + selectedDate; }

  const responses = {
    '开心': '把这份亮晶晶的心情，悄悄收藏。',
    '平静': '平平淡淡，也是一种很好的天气。',
    '有点累': '辛苦啦，今天也可以早点休息。',
    '想被抱抱': '给你一个轻轻的、长一点的拥抱。'
  };

  function renderMood() {
    const saved = storage.get(moodKey());
    document.querySelectorAll('[data-mood]').forEach(b => {
      const on = b.dataset.mood === saved;
      b.setAttribute('aria-pressed', String(on));
      b.classList.toggle('selected', on);
      b.disabled = selectedDate > today;
    });
    $('mood-status').textContent = selectedDate > today
      ? '明天的心情，留给明天记录。'
      : saved && responses[saved]
        ? responses[saved] + ' 已保存在这台设备。'
        : '只记在这台设备上，留给自己看。';
  }

  /* ---------------------------------------------------------------
     那片会长叶子的星空
     --------------------------------------------------------------- */
  const MAX_LEAVES = 20;

  function renderVine(days) {
    const svg = $('vine');
    if (!svg) return;
    const n = Math.max(1, Math.min(days, MAX_LEAVES));
    const start = 30;
    const step = 18.4;
    const yAt = x => 40 + Math.sin(x / 46) * 11;

    const stem = [];
    for (let x = start; x <= start + step * (MAX_LEAVES - 1); x += 6) stem.push([x, yAt(x)]);
    const d = stem.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');

    const leaves = [];
    for (let i = 0; i < n; i += 1) {
      const x = start + i * step;
      const y = yAt(x);
      const tilt = (i % 2 === 0 ? -1 : 1) * (30 + Math.sin(x / 30) * 9);
      const scale = 0.68 + Math.min(i, 12) * 0.022;
      leaves.push(
        `<path class="leaf${i === n - 1 ? ' leaf-new' : ''}" d="M0 0C8-12 22-14 27-5 26 5 13 12 0 0Z"` +
        ` transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${tilt.toFixed(1)}) scale(${scale.toFixed(2)})"/>`
      );
    }
    svg.innerHTML = `<path class="vine-stem" d="${d}"/><circle class="vine-seed" cx="${start - 8}" cy="${yAt(start - 8).toFixed(1)}" r="2.2"/>${leaves.join('')}`;
  }

  /* ---------------------------------------------------------------
     渲染
     --------------------------------------------------------------- */
  function render() {
    current = generate(selectedDate, signId, specialOf(selectedDate));
    const date = new Date(selectedDate + 'T12:00:00+08:00');
    const [a, b] = splitTitle(current.title);

    $('title-a').textContent = a;
    $('title-b').textContent = b;
    $('title-b').hidden = !b;

    $('date-label').textContent = new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai', month: 'long', day: 'numeric', weekday: 'short'
    }).format(date);
    $('date-iso').textContent = selectedDate.replaceAll('-', '.');
    $('visit-count').textContent = visits.count > 1 ? `第 ${visits.count} 次来看` : '第一次来看';
    $('visit-count').hidden = selectedDate !== today;

    $('today-button').disabled = selectedDate === today;
    $('today-button').textContent = selectedDate === today ? '今天' : '回到今天';
    document.body.classList.toggle('is-past', selectedDate !== today);

    $('zodiac-select').value = signId;
    $('zodiac-symbol').textContent = current.sign.symbol + '\uFE0E';
    $('zodiac-name').textContent = current.sign.name;
    $('zodiac-meta').textContent = current.sign.range + ' · ' + current.sign.meta;
    $('daily-summary').textContent = current.summary;
    $('daily-theme').textContent = current.theme;

    $('special-chip').hidden = !current.special;
    $('celestial').classList.toggle('is-special', Boolean(current.special));

    for (const k of ['overall', 'love', 'work', 'life']) {
      $('score-' + k).textContent = current.scores[k];
      $('text-' + k).textContent = current.texts[k];
      $('bar-' + k).style.width = current.scores[k] + '%';
    }

    $('lucky-color').textContent = current.color[0];
    $('lucky-swatch').style.backgroundColor = current.color[1];
    $('lucky-number').textContent = current.number;
    $('lucky-sign').textContent = current.luckySign;
    $('daily-ritual').textContent = current.ritual;

    $('love-body').textContent = current.letter;
    $('love-ps').textContent = current.shortLetter ? 'P.S. ' + current.shortLetter : '';
    $('love-ps').hidden = !current.shortLetter;
    $('love-message').hidden = true;
    $('letter-date').textContent = selectedDate.replaceAll('-', '.');
    $('reveal-message').setAttribute('aria-expanded', 'false');
    $('reveal-message').querySelector('span').textContent = '拆开今天的小情书';

    $('growth-text').textContent = visits.count <= 1
      ? '第一次来。这片星空，是为你留的。'
      : `这是你第 ${visits.count} 次来，这片星空已经陪你 ${visits.days} 天。`;
    renderVine(visits.days);

    document.title = `${current.sign.name} · ${selectedDate} | ${HER ? '写给' + HER + '的星空' : '写给你的星空'}`;
    renderMood();
    renderMoodWeek();
    renderCountdown();
  }

  function syncUrl() {
    const url = new URL(location.href);
    url.searchParams.set('sign', signId);
    if (followToday) url.searchParams.delete('date'); else url.searchParams.set('date', selectedDate);
    try { history.replaceState(null, '', url); } catch { }
  }

  /* ---------------------------------------------------------------
     事件
     --------------------------------------------------------------- */
  $('prev-day').addEventListener('click', () => { followToday = false; selectedDate = addDays(selectedDate, -1); render(); syncUrl(); });
  $('next-day').addEventListener('click', () => { followToday = false; selectedDate = addDays(selectedDate, 1); render(); syncUrl(); });
  $('today-button').addEventListener('click', () => { followToday = true; today = dayKey(); selectedDate = today; render(); syncUrl(); });
  $('zodiac-select').addEventListener('change', e => {
    signId = e.target.value;
    storage.set('zzr520-sign', signId);
    render(); syncUrl();
  });

  $('reveal-message').addEventListener('click', () => {
    const show = $('love-message').hidden;
    $('love-message').hidden = !show;
    $('reveal-message').setAttribute('aria-expanded', String(show));
    $('reveal-message').querySelector('span').textContent = show ? '把心意收好' : '拆开今天的小情书';
    $('love-message').classList.toggle('open', show);
  });

  document.querySelectorAll('[data-mood]').forEach(b => b.addEventListener('click', () => {
    if (selectedDate > today) return;
    const ok = storage.set(moodKey(), b.dataset.mood);
    renderMood();
    renderMoodWeek();
    toast(ok ? '已记下这一刻的心情。' : '浏览器未允许保存，心情暂时无法留下。');
  }));

  $('share-button').addEventListener('click', async () => {
    const url = new URL(location.href);
    url.searchParams.set('sign', signId);
    url.searchParams.set('date', selectedDate);
    const text = HER ? `${HER}，今天的星空是写给你的。` : '今天的星空，是写给你的。';
    try {
      if (navigator.share) { await navigator.share({ title: document.title, text, url: url.href }); return; }
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(`${text} ${url.href}`);
        toast('链接已复制，分享今天的小美好。');
        return;
      }
    } catch (error) { if (error.name === 'AbortError') return; }
    window.prompt('复制这个链接，分享今天的星空：', url.href);
  });

  /* ---------------------------------------------------------------
     提醒：页面开着时弹通知；关掉页面也能收到，靠「加入手机日历」
     --------------------------------------------------------------- */
  const REMIND_KEY = 'zzr520-remind-v1';
  const timeToMinutes = t => {
    const [h, m] = String(t || '').split(':').map(Number);
    return (Number.isFinite(h) ? h : 21) * 60 + (Number.isFinite(m) ? m : 0);
  };

  function beijingNow() {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(new Date());
    const get = t => parts.find(p => p.type === t).value;
    return {
      day: `${get('year')}-${get('month')}-${get('day')}`,
      minutes: Number(get('hour')) * 60 + Number(get('minute'))
    };
  }

  function readRemind() {
    try {
      return Object.assign({ on: false, time: '21:00', last: '' }, JSON.parse(storage.get(REMIND_KEY) || '{}'));
    } catch { return { on: false, time: '21:00', last: '' }; }
  }
  let remind = readRemind();
  const saveRemind = () => storage.set(REMIND_KEY, JSON.stringify(remind));

  function remindStatus() {
    if (!remind.on) return '还没开。开着页面时，到点我会弹一句话；想连关掉页面也收到，就加入手机日历。';
    if (!('Notification' in window)) return `已设为每天 ${remind.time}。这台浏览器不支持通知，建议用「加入手机日历」。`;
    if (Notification.permission === 'granted') return `已设为每天 ${remind.time}（北京时间）。开着页面时会轻敲你一下。`;
    if (Notification.permission === 'denied') return `通知被浏览器拦住了。可以改用「加入手机日历」，到点一样会提醒。`;
    return `已设为每天 ${remind.time}。需要允许通知，才会真的弹出来。`;
  }

  async function sendReminder() {
    const body = current ? `${current.sign.name} · ${current.theme}` : '今天的星空已经准备好了。';
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          await reg.showNotification('今天的星空到了', {
            body, tag: 'zzr520-daily', icon: './icons/icon-192.png', badge: './icons/icon-192.png'
          });
          return true;
        }
      }
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('今天的星空到了', { body, icon: './icons/icon-192.png' });
        return true;
      }
    } catch { }
    return false;
  }

  function checkReminder() {
    if (!remind.on) return;
    const now = beijingNow();
    if (remind.last === now.day) return;
    if (now.minutes < timeToMinutes(remind.time)) return;
    remind.last = now.day;
    remind.time = remind.time || '21:00';
    saveRemind();
    toast('今天的星空到了，来看看吧。');
    sendReminder();
  }

  const pad2 = n => String(n).padStart(2, '0');
  const toICS = d => `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}00Z`;

  function buildCalendar() {
    const [hh, mm] = remind.time.split(':').map(Number);
    const [y, m, d] = beijingNow().day.split('-').map(Number);
    let start = new Date(Date.UTC(y, m - 1, d, (hh || 21) - 8, mm || 0));
    if (start.getTime() < Date.now()) start = new Date(start.getTime() + 86400000);
    const stamp = toICS(new Date());
    const lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ZZR520//A Sky For You//CN',
      'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:写给紫瑞的星空', 'X-WR-TIMEZONE:Asia/Shanghai',
      'BEGIN:VEVENT', 'UID:zzr520-daily@local', `DTSTAMP:${stamp}`, `DTSTART:${toICS(start)}`,
      'DURATION:PT15M', 'RRULE:FREQ=DAILY', 'SUMMARY:今天的星空到了',
      `DESCRIPTION:写给${WHO}的星空 · 每天一封小情书`, `URL:${location.origin}${location.pathname}`,
      'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', 'DESCRIPTION:今天的星空到了', 'END:VALARM', 'END:VEVENT'
    ];
    const specials = [];
    if (CONFIG.anniversary) specials.push([CONFIG.anniversary, '今天是个特别的日子']);
    if (CONFIG.birthday) specials.push([CONFIG.birthday, '生日快乐']);
    specials.forEach(([md, title], i) => {
      const [sm, sd] = md.split('-').map(Number);
      let s = new Date(Date.UTC(y, sm - 1, sd, 1, 0));
      if (s.getTime() < Date.now()) s = new Date(Date.UTC(y + 1, sm - 1, sd, 1, 0));
      lines.push('BEGIN:VEVENT', `UID:zzr520-special-${i}@local`, `DTSTAMP:${stamp}`,
        `DTSTART:${toICS(s)}`, 'RRULE:FREQ=YEARLY', `SUMMARY:${title}`,
        `DESCRIPTION:${location.origin}${location.pathname}`, 'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  function renderCountdown() {
    const el = $('countdown');
    if (!el) return;
    const items = [];
    if (CONFIG.anniversary) items.push(['我们的日子', CONFIG.anniversary]);
    if (CONFIG.birthday) items.push(['你的生日', CONFIG.birthday]);
    if (!items.length) { el.hidden = true; return; }
    const [y, m, d] = beijingNow().day.split('-').map(Number);
    const todayUTC = Date.UTC(y, m - 1, d);
    el.hidden = false;
    el.textContent = items.map(([label, md]) => {
      const [mm2, dd] = md.split('-').map(Number);
      let t = Date.UTC(y, mm2 - 1, dd);
      if (t < todayUTC) t = Date.UTC(y + 1, mm2 - 1, dd);
      const days = Math.round((t - todayUTC) / 86400000);
      return days === 0 ? `今天就是${label}` : `距${label}还有 ${days} 天`;
    }).join('　·　');
  }

  const MOOD_COLORS = { '开心': '#7d9070', '平静': '#a9b79c', '有点累': '#b5a58c', '想被抱抱': '#a97e6b' };

  function renderMoodWeek() {
    const box = $('mood-week');
    if (!box) return;
    const cells = [];
    for (let i = 6; i >= 0; i -= 1) {
      const day = addDays(today, -i);
      const val = storage.get(MOOD_PREFIX + day);
      const color = val && MOOD_COLORS[val];
      const label = `${day} ${val || '没有记录'}`;
      cells.push(`<span class="mood-dot${val ? ' is-set' : ''}" title="${label}" aria-label="${label}"${color ? ` style="background:${color};border-color:${color}"` : ''}></span>`);
    }
    box.innerHTML = cells.join('');
  }

  /* ---------------------------------------------------------------
     跨天：页面一直开着也能自己换到新的一天
     --------------------------------------------------------------- */
  function checkDay() {
    const newDay = dayKey();
    if (newDay === today) return;
    today = newDay;
    visits = recordVisit(today);
    if (followToday) selectedDate = today;
    render(); syncUrl();
  }

  setInterval(checkDay, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkDay(); });
  window.addEventListener('focus', checkDay);

  if (HER) {
    document.querySelectorAll('[data-her]').forEach(el => { el.textContent = HER; });
  }

  /* ---------------- 提醒面板 ---------------- */
  if (/MicroMessenger/i.test(navigator.userAgent)) $('remind-hint').hidden = false;

  $('remind-toggle').checked = remind.on;
  $('remind-time').value = remind.time;
  $('remind-status').textContent = remindStatus();

  $('remind-toggle').addEventListener('change', async e => {
    remind.on = e.target.checked;
    remind.last = beijingNow().day;
    if (remind.on && 'Notification' in window && Notification.permission === 'default') {
      try { await Notification.requestPermission(); } catch { }
    }
    saveRemind();
    $('remind-status').textContent = remindStatus();
    toast(remind.on ? '好，到点我会提醒你。' : '提醒已关掉。');
  });

  $('remind-time').addEventListener('change', e => {
    remind.time = e.target.value || '21:00';
    remind.last = '';
    saveRemind();
    $('remind-status').textContent = remindStatus();
  });

  $('remind-calendar').addEventListener('click', () => {
    const blob = new Blob([buildCalendar()], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zzr520-star.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    toast('日历已下载，用手机打开就能导入。');
  });

  setInterval(checkReminder, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkReminder(); });

  pruneMoods();
  render();
  checkReminder();
})();
