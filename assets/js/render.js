/* ============================================================
   render.js — pure render functions driven by `st` (see main.js)

   All user-facing copy goes through t() (UI keys) or L() (bilingual
   data fields), so re-rendering in another language is automatic.
   ============================================================ */

/* ---------- hotel <select> options (brand names: language-neutral) ---------- */
function fillSel(el, arr, sel){
  el.innerHTML = arr.map(h =>
    `<option value="${h.k}" ${h.k === sel ? 'selected' : ''}>${h.name} — RM${h.rate} · ${h.star}★</option>`
  ).join('');
}

/* ---------- budget console ---------- */
function renderBudget(){
  const kln = st.split, pgn = NIGHTS - kln;
  const klh = find(KL, st.kl), pgh = find(PG, st.pg);
  const klCost = klh.rate * kln, pgCost = pgh.rate * pgn, dailyCost = st.daily * NIGHTS;
  const total = klCost + pgCost + FLIGHTS + dailyCost;
  const remain = BUDGET - total, pct = total / BUDGET;

  document.getElementById('klRateTxt').textContent = t('dyn.perNight', {n: klh.rate});
  document.getElementById('pgRateTxt').textContent = t('dyn.perNight', {n: pgh.rate});
  document.getElementById('klArea').textContent = L(klh.area);
  document.getElementById('pgArea').textContent = L(pgh.area);
  document.getElementById('splitTxt').textContent = t('dyn.split', {kl: kln, pg: pgn});
  document.getElementById('dailyTxt').textContent = t('dyn.perDay', {n: st.daily});

  const gf = document.getElementById('gfill');
  gf.style.width = Math.min(pct, 1) * 100 + '%';
  gf.classList.toggle('over', remain < 0);
  document.getElementById('pctTxt').textContent = Math.round(pct * 100) + '%';
  document.getElementById('totalBig').textContent = 'RM ' + total.toLocaleString();

  const rEl = document.getElementById('remain');
  if(remain >= 0){ rEl.className = 'remain ok';  rEl.textContent = t('dyn.spare', {n: remain.toLocaleString()}); }
  else           { rEl.className = 'remain bad'; rEl.textContent = t('dyn.over',  {n: Math.abs(remain).toLocaleString()}); }

  const v = document.getElementById('verdict');
  if(remain < 0)        v.textContent = t('verdict.over');
  else if(remain < 200) v.textContent = t('verdict.thin');
  else if(remain < 700) v.textContent = t('verdict.comfy');
  else                  v.textContent = t('verdict.slack');

  document.getElementById('breakdown').innerHTML = [
    ['var(--kl)',  klh.name,         t('bd.nightsCalc', {rate: klh.rate, n: kln}), klCost],
    ['var(--pg)',  pgh.name,         t('bd.nightsCalc', {rate: pgh.rate, n: pgn}), pgCost],
    ['var(--dim)', t('bd.flights'),  t('bd.flightsCalc'),                          FLIGHTS],
    ['var(--mut)', t('bd.food'),     t('bd.foodCalc', {daily: st.daily}),          dailyCost],
  ].map(r => `<div class="brow"><span class="dot" style="background:${r[0]}"></span>
     <span class="name">${r[1]}</span><span class="calc">${r[2]}</span>
     <span class="amt">RM ${r[3].toLocaleString()}</span></div>`).join('');
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
    html += `<div class="day ${city}">
      <div class="dh"><span class="nite">${t('dyn.night', {n: i + 1})}</span><span class="city">${isKL ? t('dyn.cityKL') : t('dyn.cityPG')}</span></div>
      <div class="date">${L(DATES[i])}</div>
      <div class="plan">${plan}</div>${flight}
    </div>`;
  }
  document.getElementById('days').innerHTML = html;
  document.getElementById('departStrip').innerHTML = t('dyn.depart');
}

/* ---------- AHP bars ---------- */
function renderBars(containerId, legendId, arr, pickKey){
  const max = Math.max(...arr.map(h => h.score));
  document.getElementById(legendId).innerHTML = CRIT.map(c =>
    `<span class="lg"><i style="background:${c.c}"></i>${t('crit.' + c.key)} · ${c.w}</span>`).join('');
  document.getElementById(containerId).innerHTML = arr.map((h, i) => {
    const segs = CRIT.map(c => {
      const val = h.seg[c.key], wpct = (val / max) * 100;
      return `<span style="width:${wpct}%;background:${c.c}" title="${t('crit.' + c.key)}: ${val.toFixed(2)}"></span>`;
    }).join('');
    const isPick = h.k === pickKey;
    const tag = isPick ? `<span class="picktag">${t('dyn.pick')}</span>` : '';
    return `<div class="bar-row ${isPick ? 'pick' : ''}" data-k="${h.k}">
      <div class="rk">${i + 1}</div>
      <div class="bar-wrap">
        <div class="bar-top"><span class="hn">${h.name}</span><span class="hmeta">${h.star}★ · RM${h.rate} · ${L(h.area)}</span>${tag}</div>
        <div class="bar">${segs}</div>
      </div>
      <div class="sc">${h.score.toFixed(2)}</div>
    </div>`;
  }).join('');
}
function renderAHP(){
  renderBars('barsKL', 'legendKL', KL, st.kl);
  renderBars('barsPG', 'legendPG', PG, st.pg);
}

/* ---------- criteria weights footer ---------- */
function renderWeights(){
  document.getElementById('wgrid').innerHTML = CRIT.map(c =>
    `<div class="wcard"><div class="wt"><i style="background:${c.c}"></i>${t('crit.' + c.key)}</div><div class="wv">${c.w}</div></div>`
  ).join('');
}

/* ---------- render everything ---------- */
function renderAll(){
  renderBudget();
  renderItin();
  renderAHP();
  renderWeights();
}
