/* ============================================================
   main.js — theme, language, print/share, itinerary accordion.
   The trip is fully booked, so there is no editable state left —
   only presentation toggles persist.
   ============================================================ */

/* ---------- theme ---------- */
var THEME_KEY = 'trip-theme';
function applyTheme(mode){
  document.documentElement.setAttribute('data-theme', mode);
  var b = document.getElementById('themeBtn');
  if(b){
    b.querySelector('.ticon').textContent = (mode === 'light') ? '☀️' : '🌙';
    b.setAttribute('aria-label', (mode === 'light') ? 'Switch to dark theme · 切换到深色' : 'Switch to light theme · 切换到浅色');
  }
}
function initTheme(){
  var saved = null; try{ saved = localStorage.getItem(THEME_KEY); }catch(e){}
  var mode = saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  applyTheme(mode);
}
function toggleTheme(){
  var cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  var next = cur === 'light' ? 'dark' : 'light';
  applyTheme(next);
  try{ localStorage.setItem(THEME_KEY, next); }catch(e){}
}

/* ---------- share URL ---------- */
function sharePlan(){
  var url = location.origin + location.pathname;
  var btn = document.getElementById('shareBtn');
  function flash(){
    if(btn){ btn.textContent = t('share.copied'); setTimeout(function(){ btn.textContent = t('share.btn'); }, 2000); }
  }
  try {
    navigator.clipboard.writeText(url).then(flash).catch(flash);
  } catch(e){ flash(); }
}

/* ---------- bootstrap ---------- */
function init(){
  initTheme();
  I18N.initLang();

  document.getElementById('themeBtn').addEventListener('click', toggleTheme);
  document.getElementById('langBtn').addEventListener('click', function(){ I18N.toggle(); });
  document.getElementById('shareBtn').addEventListener('click', sharePlan);
  document.getElementById('printBtn').addEventListener('click', function(){ window.print(); });

  /* detailed itinerary toggle — event delegation on #daysDetail */
  document.getElementById('daysDetail').addEventListener('click', function(e){
    var head = e.target.closest('.dday-head');
    if(!head) return;
    var dday = head.closest('.dday');
    var body = dday.querySelector('.dday-body');
    var toggle = head.querySelector('.dday-toggle');
    var expanded = head.getAttribute('aria-expanded') === 'true';
    if(expanded){
      head.setAttribute('aria-expanded', 'false');
      body.setAttribute('hidden', '');
      if(toggle) toggle.textContent = t('day.toggleShow');
    } else {
      head.setAttribute('aria-expanded', 'true');
      body.removeAttribute('hidden');
      if(toggle) toggle.textContent = t('day.toggleHide');
    }
  });

  I18N.apply();
}

init();
