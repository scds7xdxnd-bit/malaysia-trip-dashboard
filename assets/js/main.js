/* ============================================================
   main.js — app state, event wiring, persistence, share URL
   ============================================================ */

/* snapshot of original AHP weights from data.js — used to
   rescore hotels when user adjusts weights */
var origCritWts = {};

/* ---------- state defaults ---------- */
const DEFAULTS = {
  split: 4, kl: 'traders', pg: 'edison', daily: 250,
  pYou:   { amt: 2000000, ccy: 'KRW' },
  pJunxi: { amt: 0,       ccy: 'MYR' },
  flightOut:  150,
  flightBack: 150,
  klRate: 475,
  pgRate: 600,
  krwRate: 0.002662,
  cnyRate: 0.62,
  weights: {L:0.35, V:0.21, R:0.185, Lo:0.14, A:0.11}
};

let st = Object.assign({}, DEFAULTS, { pYou: Object.assign({}, DEFAULTS.pYou), pJunxi: Object.assign({}, DEFAULTS.pJunxi) });

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
      for(var k in parsed){
        if(k === 'pYou' || k === 'pJunxi') continue;
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
      for(var k in parsed){
        if(k === 'pYou' || k === 'pJunxi') continue;
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
  el = document.getElementById('split');  if(el) el.value = st.split;
  el = document.getElementById('daily');  if(el) el.value = st.daily;
  el = document.getElementById('youAmt'); if(el) el.value = st.pYou.amt;
  el = document.getElementById('youCcy'); if(el) el.value = st.pYou.ccy;
  el = document.getElementById('junxiAmt'); if(el) el.value = st.pJunxi.amt;
  el = document.getElementById('junxiCcy'); if(el) el.value = st.pJunxi.ccy;
  el = document.getElementById('flightOut'); if(el) el.value = st.flightOut;
  el = document.getElementById('flightBack'); if(el) el.value = st.flightBack;
  el = document.getElementById('klRateInp');  if(el) el.value = st.klRate;
  el = document.getElementById('pgRateInp');  if(el) el.value = st.pgRate;
  el = document.getElementById('krwRate');  if(el) el.value = st.krwRate;
  el = document.getElementById('cnyRate');  if(el) el.value = st.cnyRate;
}

/* ---------- exchange rate refresh ---------- */
function refreshRates(){
  var btn = document.getElementById('fxBtn');
  var note = document.getElementById('fxNote');
  var origText = btn ? btn.textContent : '';
  if(btn){ btn.textContent = '...'; btn.disabled = true; }

  fetch('https://open.er-api.com/v6/latest/MYR')
    .then(function(res){
      if(!res.ok) throw new Error('bad status');
      return res.json();
    })
    .then(function(data){
      if(data && data.result === 'success' && data.rates){
        var krwPerMYR = +data.rates.KRW || 0;
        var cnyPerMYR = +data.rates.CNY || 0;
        var krwRate = krwPerMYR ? 1 / krwPerMYR : st.krwRate;
        var cnyRate = cnyPerMYR ? 1 / cnyPerMYR : st.cnyRate;
        st.krwRate = Math.round(krwRate * 1e6) / 1e6;
        st.cnyRate = Math.round(cnyRate * 1e4) / 1e4;
        document.getElementById('krwRate').value = st.krwRate;
        document.getElementById('cnyRate').value = st.cnyRate;
        var now = new Date();
        var hh = ('0' + now.getHours()).slice(-2);
        var mm = ('0' + now.getMinutes()).slice(-2);
        if(note){ note.textContent = t('fx.updated', {t: hh + ':' + mm}); note.dataset.set = '1'; }
      } else {
        throw new Error('bad data');
      }
      renderBudget(); saveState();
    })
    .catch(function(){
      if(note){ note.textContent = t('fx.offline'); note.dataset.set = '1'; }
    })
    .finally(function(){
      if(btn){ btn.textContent = origText; btn.disabled = false; }
    });
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
  I18N.initLang();
  CRIT.forEach(function(c){ origCritWts[c.key] = c.w; });
  loadState();
  loadHash();

  syncInputsFromState();

  fillSel(klSel, KL, st.kl);
  fillSel(pgSel, PG, st.pg);

  document.getElementById('split').addEventListener('input', function(e){
    st.split = +e.target.value; renderBudget(); renderItin(); saveState();
  });
  document.getElementById('daily').addEventListener('input', function(e){
    st.daily = +e.target.value; renderBudget(); saveState();
  });
  klSel.addEventListener('change', function(e){
    st.kl = e.target.value;
    st.klRate = find(KL, st.kl).rate;
    var inp = document.getElementById('klRateInp'); if(inp) inp.value = st.klRate;
    renderBudget(); renderAHP(); saveState();
  });
  pgSel.addEventListener('change', function(e){
    st.pg = e.target.value;
    st.pgRate = find(PG, st.pg).rate;
    var inp = document.getElementById('pgRateInp'); if(inp) inp.value = st.pgRate;
    renderBudget(); renderAHP(); saveState();
  });

  /* budget rows */
  document.getElementById('youAmt').addEventListener('input', function(e){
    st.pYou.amt = Math.max(0, +e.target.value || 0); renderBudget(); saveState();
  });
  document.getElementById('youCcy').addEventListener('change', function(e){
    st.pYou.ccy = e.target.value; renderBudget(); saveState();
  });
  document.getElementById('junxiAmt').addEventListener('input', function(e){
    st.pJunxi.amt = Math.max(0, +e.target.value || 0); renderBudget(); saveState();
  });
  document.getElementById('junxiCcy').addEventListener('change', function(e){
    st.pJunxi.ccy = e.target.value; renderBudget(); saveState();
  });

  /* exchange rates */
  document.getElementById('krwRate').addEventListener('input', function(e){
    st.krwRate = +e.target.value || 0; renderBudget(); saveState();
  });
  document.getElementById('cnyRate').addEventListener('input', function(e){
    st.cnyRate = +e.target.value || 0; renderBudget(); saveState();
  });
  document.getElementById('fxBtn').addEventListener('click', function(){ refreshRates(); });

  /* flight costs */
  document.getElementById('flightOut').addEventListener('input', function(e){
    st.flightOut = Math.max(0, +e.target.value || 0); renderBudget(); saveState();
  });
  document.getElementById('flightBack').addEventListener('input', function(e){
    st.flightBack = Math.max(0, +e.target.value || 0); renderBudget(); saveState();
  });

  /* hotel rate overrides */
  document.getElementById('klRateInp').addEventListener('input', function(e){
    st.klRate = Math.max(0, +e.target.value || 0); renderBudget(); renderAHP(); saveState();
  });
  document.getElementById('pgRateInp').addEventListener('input', function(e){
    st.pgRate = Math.max(0, +e.target.value || 0); renderBudget(); renderAHP(); saveState();
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
      renderAHP();
      saveState();
    }
  });

  document.getElementById('langBtn').addEventListener('click', function(){ I18N.toggle(); });

  I18N.apply();
}

init();
