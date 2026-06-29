/* ============================================================
   main.js — app state, event wiring, persistence, share URL
   ============================================================ */

/* snapshot of original AHP weights from data.js — used to
   rescore hotels when user adjusts weights */
var origCritWts = {};

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

/* ---------- state defaults ---------- */
const DEFAULTS = {
  split: 4, kl: 'mo', pg: 'magellan',
  pYou:   { amt: 2000000, ccy: 'KRW' },
  pJunxi: { amt: 0,       ccy: 'MYR' },
  flightOut:  610,
  flightBack: 610,
  klRate: 950,
  pgRate: 560,
  /* per-hotel nightly-rate overrides, keyed by hotel key. An edit to the
     rate box is stored here for the *currently selected* hotel, so it sticks
     when you switch away and come back. Empty = use the hotel's data.js rate. */
  klRates: {},
  pgRates: {},
  krwRate: 0.0033,
  cnyRate: 0.62,
  weights: {L:0.39, V:0.10, R:0.17, Lo:0.16, A:0.18}
};

let st = Object.assign({}, DEFAULTS, {
  pYou: Object.assign({}, DEFAULTS.pYou),
  pJunxi: Object.assign({}, DEFAULTS.pJunxi),
  klRates: {}, pgRates: {}
});

/* effective nightly rate for a hotel = user override if present, else its
   data.js rate. Single source of truth used by render + event handlers. */
function effRate(arr, ratesMap, key){
  var ov = ratesMap[key];
  if(ov != null && ov > 0) return ov;
  var h = find(arr, key);
  return h ? h.rate : 0;
}

/* ---------- persistence ---------- */
var STORE_KEY = 'trip-state';

function saveState(){
  try { localStorage.setItem(STORE_KEY, JSON.stringify(st)); } catch(e) {}
}

function loadState(){
  try {
    var saved = localStorage.getItem(STORE_KEY);
    if(saved){
      var parsed = JSON.parse(saved);
      if(parsed.pYou && typeof parsed.pYou === 'object') st.pYou = Object.assign({}, DEFAULTS.pYou, parsed.pYou);
      if(parsed.pJunxi && typeof parsed.pJunxi === 'object') st.pJunxi = Object.assign({}, DEFAULTS.pJunxi, parsed.pJunxi);
      if(parsed.klRates && typeof parsed.klRates === 'object') st.klRates = Object.assign({}, parsed.klRates);
      if(parsed.pgRates && typeof parsed.pgRates === 'object') st.pgRates = Object.assign({}, parsed.pgRates);
      for(var k in parsed){
        if(k === 'pYou' || k === 'pJunxi' || k === 'klRates' || k === 'pgRates') continue;
        if(k in DEFAULTS) st[k] = parsed[k];
      }
    }
  } catch(e) {}
}

function loadHash(){
  try {
    if(location.hash && location.hash.indexOf('#p=') === 0){
      var encoded = location.hash.slice(3);
      var json = atob(decodeURIComponent(encoded));
      var parsed = JSON.parse(json);
      if(parsed.pYou && typeof parsed.pYou === 'object') st.pYou = Object.assign({}, DEFAULTS.pYou, parsed.pYou);
      if(parsed.pJunxi && typeof parsed.pJunxi === 'object') st.pJunxi = Object.assign({}, DEFAULTS.pJunxi, parsed.pJunxi);
      if(parsed.klRates && typeof parsed.klRates === 'object') st.klRates = Object.assign({}, parsed.klRates);
      if(parsed.pgRates && typeof parsed.pgRates === 'object') st.pgRates = Object.assign({}, parsed.pgRates);
      for(var k in parsed){
        if(k === 'pYou' || k === 'pJunxi' || k === 'klRates' || k === 'pgRates') continue;
        if(k in DEFAULTS) st[k] = parsed[k];
      }
    }
  } catch(e) {}
}

/* ---------- DOM refs & sync ---------- */
var klSel = document.getElementById('klSel');
var pgSel = document.getElementById('pgSel');

function syncInputsFromState(){
  var el;
  if(klSel) klSel.value = st.kl;   // keep dropdowns in step after reset/load
  if(pgSel) pgSel.value = st.pg;
  el = document.getElementById('split');  if(el) el.value = st.split;
  el = document.getElementById('youAmt'); if(el) el.value = st.pYou.amt;
  el = document.getElementById('youCcy'); if(el) el.value = st.pYou.ccy;
  el = document.getElementById('junxiAmt'); if(el) el.value = st.pJunxi.amt;
  el = document.getElementById('junxiCcy'); if(el) el.value = st.pJunxi.ccy;
  el = document.getElementById('flightOut'); if(el) el.value = st.flightOut;
  el = document.getElementById('flightBack'); if(el) el.value = st.flightBack;
  el = document.getElementById('klRateInp');  if(el) el.value = st.klRate;
  el = document.getElementById('pgRateInp');  if(el) el.value = st.pgRate;
}

/* ---------- share URL ---------- */
function sharePlan(){
  var encoded = encodeURIComponent(btoa(JSON.stringify(st)));
  var url = location.origin + location.pathname + '#p=' + encoded;
  var btn = document.getElementById('shareBtn');
  try {
    navigator.clipboard.writeText(url).then(function(){
      if(btn){ btn.textContent = t('share.copied'); setTimeout(function(){ btn.textContent = t('share.btn'); }, 2000); }
    }).catch(function(){
      if(btn){ btn.textContent = t('share.copied'); setTimeout(function(){ btn.textContent = t('share.btn'); }, 2000); }
    });
  } catch(e){
    if(btn){ btn.textContent = t('share.copied'); setTimeout(function(){ btn.textContent = t('share.btn'); }, 2000); }
  }
}

/* ---------- bootstrap ---------- */
function init(){
  initTheme();
  I18N.initLang();
  CRIT.forEach(function(c){ origCritWts[c.key] = c.w; });
  loadState();
  loadHash();

  /* guard: stale saved hotel keys (e.g. an old Penang pick) must fall
     back to defaults, or find() returns undefined and render crashes */
  if(!find(KL, st.kl)) st.kl = DEFAULTS.kl;
  if(!find(PG, st.pg)) st.pg = DEFAULTS.pg;

  /* migrate legacy state: a pre-map saved klRate/pgRate that differs from the
     selected hotel's data.js rate was a user override — seed it into the map */
  var klDef = find(KL, st.kl).rate;
  if(st.klRate != null && st.klRate > 0 && st.klRate !== klDef && st.klRates[st.kl] == null) st.klRates[st.kl] = st.klRate;
  var pgDef = find(PG, st.pg).rate;
  if(st.pgRate != null && st.pgRate > 0 && st.pgRate !== pgDef && st.pgRates[st.pg] == null) st.pgRates[st.pg] = st.pgRate;

  /* keep the single active-rate mirror in step with the override map */
  st.klRate = effRate(KL, st.klRates, st.kl);
  st.pgRate = effRate(PG, st.pgRates, st.pg);

  syncInputsFromState();

  fillSel(klSel, KL, st.kl);
  fillSel(pgSel, PG, st.pg);

  document.getElementById('split').addEventListener('input', function(e){
    st.split = +e.target.value; renderBudget(); renderItin(); renderMethod(); renderDetails(); saveState();
  });
  klSel.addEventListener('change', function(e){
    st.kl = e.target.value;
    st.klRate = effRate(KL, st.klRates, st.kl);   // override sticks, else data.js rate
    var inp = document.getElementById('klRateInp'); if(inp) inp.value = st.klRate;
    renderBudget(); renderAHP(); renderMethod(); renderDetails(); saveState();
  });
  pgSel.addEventListener('change', function(e){
    st.pg = e.target.value;
    st.pgRate = effRate(PG, st.pgRates, st.pg);
    var inp = document.getElementById('pgRateInp'); if(inp) inp.value = st.pgRate;
    renderBudget(); renderAHP(); renderMethod(); renderDetails(); saveState();
  });

  /* budget rows */
  document.getElementById('youAmt').addEventListener('input', function(e){
    st.pYou.amt = Math.max(0, +e.target.value || 0); renderBudget(); renderMethod(); renderDetails(); saveState();
  });
  document.getElementById('youCcy').addEventListener('change', function(e){
    st.pYou.ccy = e.target.value; renderBudget(); renderMethod(); renderDetails(); saveState();
  });
  document.getElementById('junxiAmt').addEventListener('input', function(e){
    st.pJunxi.amt = Math.max(0, +e.target.value || 0); renderBudget(); renderMethod(); renderDetails(); saveState();
  });
  document.getElementById('junxiCcy').addEventListener('change', function(e){
    st.pJunxi.ccy = e.target.value; renderBudget(); renderMethod(); renderDetails(); saveState();
  });

  /* flight costs */
  document.getElementById('flightOut').addEventListener('input', function(e){
    st.flightOut = Math.max(0, +e.target.value || 0); renderBudget(); renderMethod(); renderDetails(); saveState();
  });
  document.getElementById('flightBack').addEventListener('input', function(e){
    st.flightBack = Math.max(0, +e.target.value || 0); renderBudget(); renderMethod(); renderDetails(); saveState();
  });

  /* hotel rate overrides — persist per hotel so the edit survives switching */
  document.getElementById('klRateInp').addEventListener('input', function(e){
    st.klRate = Math.max(0, +e.target.value || 0);
    st.klRates[st.kl] = st.klRate;
    renderBudget(); renderAHP(); renderMethod(); renderDetails(); saveState();
  });
  document.getElementById('pgRateInp').addEventListener('input', function(e){
    st.pgRate = Math.max(0, +e.target.value || 0);
    st.pgRates[st.pg] = st.pgRate;
    renderBudget(); renderAHP(); renderMethod(); renderDetails(); saveState();
  });

  /* share button */
  document.getElementById('shareBtn').addEventListener('click', function(){ sharePlan(); });

  /* reset button */
  document.getElementById('resetBtn').addEventListener('click', function(){
    st = JSON.parse(JSON.stringify(DEFAULTS));
    try { localStorage.removeItem(STORE_KEY); } catch(e) {}
    syncInputsFromState();
    renderAll();
    saveState();
  });

  /* print button */
  document.getElementById('printBtn').addEventListener('click', function(){
    window.print();
  });

  /* weight card inputs — event delegation on wgrid so typing doesn't destroy the input */
  document.getElementById('wgrid').addEventListener('input', function(e){
    if(e.target.classList.contains('wvinp')){
      var k = e.target.dataset.k;
      st.weights[k] = Math.max(0, Math.min(2, +e.target.value || 0));
      renderAHP(); renderMethod();
      saveState();
    }
  });

  document.getElementById('themeBtn').addEventListener('click', toggleTheme);
  document.getElementById('langBtn').addEventListener('click', function(){ I18N.toggle(); });


  /* detailed itinerary toggle — event delegation on #daysDetail */
  document.getElementById("daysDetail").addEventListener("click", function(e){
    var head = e.target.closest(".dday-head");
    if(!head) return;
    var dday = head.closest(".dday");
    var body = dday.querySelector(".dday-body");
    var toggle = head.querySelector(".dday-toggle");
    var expanded = head.getAttribute("aria-expanded") === "true";
    if(expanded){
      head.setAttribute("aria-expanded", "false");
      body.setAttribute("hidden", "");
      if(toggle) toggle.textContent = t("day.toggleShow");
    } else {
      head.setAttribute("aria-expanded", "true");
      body.removeAttribute("hidden");
      if(toggle) toggle.textContent = t("day.toggleHide");
    }
  });
  I18N.apply();
}

init();
