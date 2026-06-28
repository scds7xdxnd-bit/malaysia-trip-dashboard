/* ============================================================
   render.js — pure render functions driven by `st` (see main.js)

   All user-facing copy goes through t() (UI keys) or L() (bilingual
   data fields), so re-rendering in another language is automatic.
   ============================================================ */

/* ---------- hotel <select> options (brand names: language-neutral) ---------- */
function fillSel(el, arr, sel){
  el.innerHTML = arr.map(h =>
    `<option value="${h.k}" ${h.k === sel ? 'selected' : ''}>${h.name} — ${h.star}★</option>`
  ).join('');
}

/* ---------- helpers ---------- */
function toMYR(p, krwRate, cnyRate){
  if(!p) return 0;
  const amt = +p.amt || 0;
  const ccy = p.ccy || 'MYR';
  if(ccy === 'KRW') return amt * (krwRate || 0);
  if(ccy === 'CNY') return amt * (cnyRate || 0);
  return amt;
}
function fmtMYR(n){ return 'RM ' + Math.round(n).toLocaleString(); }

/* ---------- AHP Value recalculation ---------- */
function recalcHotel(hotel, origRate, newRate, curVWeight){
  if(!newRate || newRate <= 0 || origRate === newRate) return hotel;
  var ratio = origRate / newRate;
  var oldVRaw = hotel.seg['V'] / (curVWeight || origCritWts['V']);
  var newVRaw = Math.min(Math.max(oldVRaw * ratio, 0), 10);
  var newSeg = {};
  for(var k in hotel.seg){ newSeg[k] = hotel.seg[k]; }
  newSeg['V'] = Math.round(newVRaw * (curVWeight || origCritWts['V']) * 1e4) / 1e4;
  var newScore = 0;
  for(var k in newSeg){ newScore += newSeg[k]; }
  newScore = Math.round(newScore * 100) / 100;
  return {
    k: hotel.k, name: hotel.name, area: hotel.area,
    rate: hotel.rate, star: hotel.star,
    score: newScore, seg: newSeg
  };
}

/* ---------- AHP weight recalculation ---------- */
function recalcWeights(arr, origWeights, curWeights){
  return arr.map(function(h){
    var newSeg = {};
    var newScore = 0;
    CRIT.forEach(function(c){
      var raw = h.seg[c.key] / origWeights[c.key];
      var val = Math.round(raw * curWeights[c.key] * 1e4) / 1e4;
      newSeg[c.key] = val;
      newScore += val;
    });
    return {
      k: h.k, name: h.name, area: h.area,
      rate: h.rate, star: h.star,
      score: Math.round(newScore * 100) / 100,
      seg: newSeg
    };
  });
}

/* ---------- budget console ---------- */
function renderBudget(){
  const kln = st.split, pgn = NIGHTS - kln;
  const klh = find(KL, st.kl), pgh = find(PG, st.pg);
  const kr = +st.krwRate || 0, cr = +st.cnyRate || 0;
  const budgetMYR = toMYR(st.pYou, kr, cr) + toMYR(st.pJunxi, kr, cr);
  const flightsMYR = (+st.flightOut || 0) + (+st.flightBack || 0);
  const klRate = (st.klRate != null && st.klRate > 0) ? st.klRate : klh.rate;
  const pgRate = (st.pgRate != null && st.pgRate > 0) ? st.pgRate : pgh.rate;
  const klCost = klRate * kln, pgCost = pgRate * pgn, dailyCost = st.daily * NIGHTS;
  const total = klCost + pgCost + flightsMYR + dailyCost;
  const remain = budgetMYR - total, pct = budgetMYR > 0 ? total / budgetMYR : 0;

  var klRI = document.getElementById('klRateInp');
  if(klRI) klRI.value = klRate;
  var pgRI = document.getElementById('pgRateInp');
  if(pgRI) pgRI.value = pgRate;
  document.getElementById('klArea').textContent = L(klh.area);
  document.getElementById('pgArea').textContent = L(pgh.area);
  document.getElementById('splitTxt').textContent = t('dyn.split', {kl: kln, pg: pgn});
  document.getElementById('dailyTxt').textContent = t('dyn.perDay', {n: st.daily});

  var hdrEl = document.getElementById('budgetHdr');
  if(hdrEl) hdrEl.textContent = fmtMYR(budgetMYR);

  var tlEl = document.getElementById('budgetTotalLine');
  if(tlEl) tlEl.textContent = t('budget.totalLine', {n: Math.round(budgetMYR).toLocaleString()});

  var fxN = document.getElementById('fxNote');
  if(fxN && (!fxN.dataset.set || fxN.dataset.set !== '1')){
    fxN.textContent = ''; fxN.dataset.set = '0';
  }

  const gf = document.getElementById('gfill');
  gf.style.width = Math.min(Math.max(pct, 0), 1) * 100 + '%';
  gf.classList.toggle('over', remain < 0);
  document.getElementById('pctTxt').textContent = Math.round(Math.max(pct, 0) * 100) + '%';
  document.getElementById('totalBig').textContent = fmtMYR(total);

  const rEl = document.getElementById('remain');
  if(remain >= 0){ rEl.className = 'remain ok';  rEl.textContent = t('dyn.spare', {n: remain.toLocaleString()}); }
  else           { rEl.className = 'remain bad'; rEl.textContent = t('dyn.over',  {n: Math.abs(remain).toLocaleString()}); }

  const v = document.getElementById('verdict');
  if(remain < 0)        v.textContent = t('verdict.over');
  else if(remain < 200) v.textContent = t('verdict.thin');
  else if(remain < 700) v.textContent = t('verdict.comfy');
  else                  v.textContent = t('verdict.slack');

  document.getElementById('breakdown').innerHTML = [
    ['var(--kl)',  klh.name,                t('bd.nightsCalc', {rate: klRate, n: kln}), klCost],
    ['var(--pg)',  pgh.name,                t('bd.nightsCalc', {rate: pgRate, n: pgn}), pgCost],
    ['var(--dim)', t('bd.flightsOut'),
      t('bd.flightsCalc') + ' · <a href="https://www.google.com/travel/flights?q=KUL+to+PEN+on+2026-07-20" target="_blank" rel="noopener" class="verifylink">' + t('links.verify') + '</a>',
      (+st.flightOut || 0)],
    ['var(--dim)', t('bd.flightsBack'),
      t('bd.flightsCalc') + ' · <a href="https://www.google.com/travel/flights?q=PEN+to+KUL+on+2026-07-22" target="_blank" rel="noopener" class="verifylink">' + t('links.verify') + '</a>',
      (+st.flightBack || 0)],
    ['var(--mut)', t('bd.food'),            t('bd.foodCalc', {daily: st.daily}),         dailyCost],
  ].map(r => `<div class="brow"><span class="dot" style="background:${r[0]}"></span>
     <span class="name">${r[1]}</span><span class="calc">${r[2]}</span>
     <span class="amt">${fmtMYR(r[3])}</span></div>`).join('');

  // F. Booking deep-links
  var klBL = document.getElementById('klBookLink');
  var pgBL = document.getElementById('pgBookLink');
  if(klBL){
    klBL.href = 'https://www.booking.com/searchresults.html' +
      '?ss=' + encodeURIComponent(klh.name + ' Kuala Lumpur') +
      '&checkin=2026-07-16&checkout=2026-07-' + (16 + kln) +
      '&group_adults=2&no_rooms=1';
  }
  if(pgBL){
    pgBL.href = 'https://www.booking.com/searchresults.html' +
      '?ss=' + encodeURIComponent(pgh.name + ' Penang') +
      '&checkin=2026-07-' + (16 + kln) + '&checkout=2026-07-23' +
      '&group_adults=2&no_rooms=1';
  }
}

/* ---------- itinerary ---------- */
function renderItin(){
  const kln = st.split, pgn = NIGHTS - kln;
  let html = '';
  for(let i = 0; i < NIGHTS; i++){
    const isKL = i < kln, city = isKL ? 'kl' : 'pg';
    const idx = isKL ? i : (i - kln);
    const plan = L(isKL ? KL_PLAN[Math.min(idx, KL_PLAN.length - 1)]
                        : PG_PLAN[Math.min(idx, PG_PLAN.length - 1)]);
    const flight = (!isKL && idx === 0) ? `<span class="flag">${t('dyn.flyFlag')}</span>` : '';
    const returnFlight = (i === NIGHTS - 1) ? `<span class="flag">${t('dyn.flyBack')}</span>` : '';
    html += `<div class="day ${city}">
      <div class="dh"><span class="nite">${t('dyn.night', {n: i + 1})}</span><span class="city">${isKL ? t('dyn.cityKL') : t('dyn.cityPG')}</span></div>
      <div class="date">${L(DATES[i])}</div>
      <div class="plan">${plan}</div>${flight}${returnFlight}
    </div>`;
  }
  document.getElementById('days').innerHTML = html;
  document.getElementById('departStrip').innerHTML = t('dyn.depart');
}

/* ---------- AHP bars ---------- */
function renderBars(containerId, legendId, arr, pickKey, pickRate, curWeights){
  var curVWeight = curWeights['V'];
  var weightAdjArr = recalcWeights(arr, origCritWts, curWeights);
  var adjArr = weightAdjArr.map(function(h){
    if(h.k === pickKey && pickRate != null && pickRate > 0 && pickRate !== h.rate){
      return recalcHotel(h, h.rate, pickRate, curVWeight);
    }
    return h;
  });
  adjArr.sort(function(a, b){ return b.score - a.score; });
  var max = Math.max.apply(null, adjArr.map(function(h){ return h.score; }));
  document.getElementById(legendId).innerHTML = CRIT.map(c =>
    `<span class="lg"><i style="background:${c.c}"></i>${t('crit.' + c.key)} · ${curWeights[c.key]}</span>`).join('');
  document.getElementById(containerId).innerHTML = adjArr.map((h, i) => {
    const segs = CRIT.map(c => {
      const val = h.seg[c.key], wpct = (val / max) * 100;
      return `<span style="width:${wpct}%;background:${c.c}" title="${t('crit.' + c.key)}: ${val.toFixed(2)}"></span>`;
    }).join('');
    const isPick = h.k === pickKey;
    const tag = isPick ? `<span class="picktag">${t('dyn.pick')}</span>` : '';
    return `<div class="bar-row ${isPick ? 'pick' : ''}" data-k="${h.k}">
      <div class="rk">${i + 1}</div>
      <div class="bar-wrap">
        <div class="bar-top"><span class="hn">${h.name}</span><span class="hmeta">${h.star}★ · ${L(h.area)}</span>${tag}</div>
        <div class="bar">${segs}</div>
      </div>
      <div class="sc">${h.score.toFixed(2)}</div>
    </div>`;
  }).join('');
}
function renderAHP(){
  var w = st.weights || {};
  CRIT.forEach(function(c){ if(!(c.key in w)) w[c.key] = c.w; });
  renderBars('barsKL', 'legendKL', KL, st.kl, st.klRate, w);
  renderBars('barsPG', 'legendPG', PG, st.pg, st.pgRate, w);
}

/* ---------- criteria weights footer ---------- */
function renderWeights(){
  var w = st.weights || {};
  document.getElementById('wgrid').innerHTML = CRIT.map(c =>
    `<div class="wcard"><div class="wt"><i style="background:${c.c}"></i>${t('crit.' + c.key)}</div>
    <input class="wvinp" data-k="${c.key}" type="number" value="${(w[c.key] != null) ? w[c.key] : c.w}" step="0.001" min="0" max="2" inputmode="decimal"></div>`
  ).join('');
}

/* ---------- render everything ---------- */
function renderAll(){
  renderBudget();
  renderItin();
  renderAHP();
  renderWeights();
}
