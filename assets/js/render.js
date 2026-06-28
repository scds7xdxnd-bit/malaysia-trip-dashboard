/* ============================================================
   render.js — pure render functions driven by `st` (see main.js)
   ============================================================ */

/* ---------- hotel <select> options ---------- */
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

  document.getElementById('klRateTxt').textContent = 'RM ' + klh.rate + '/nt';
  document.getElementById('pgRateTxt').textContent = 'RM ' + pgh.rate + '/nt';
  document.getElementById('klArea').textContent = klh.area;
  document.getElementById('pgArea').textContent = pgh.area;
  document.getElementById('splitTxt').textContent = kln + ' KL · ' + pgn + ' Penang';
  document.getElementById('dailyTxt').textContent = 'RM ' + st.daily + '/day';

  const gf = document.getElementById('gfill');
  gf.style.width = Math.min(pct, 1) * 100 + '%';
  gf.classList.toggle('over', remain < 0);
  document.getElementById('pctTxt').textContent = Math.round(pct * 100) + '%';
  document.getElementById('totalBig').textContent = 'RM ' + total.toLocaleString();

  const rEl = document.getElementById('remain');
  if(remain >= 0){ rEl.className = 'remain ok';  rEl.textContent = 'RM ' + remain.toLocaleString() + ' to spare'; }
  else           { rEl.className = 'remain bad'; rEl.textContent = 'RM ' + Math.abs(remain).toLocaleString() + ' over'; }

  const v = document.getElementById('verdict');
  if(remain < 0)        v.textContent = 'Over budget — trim a night, drop daily spend, or pick a cheaper base.';
  else if(remain < 200) v.textContent = 'Fits, but thin — little room for a big splurge meal.';
  else if(remain < 700) v.textContent = 'Comfortable. Headroom for a fine-dining night.';
  else                  v.textContent = 'Lots of slack — upgrade a hotel tier or add an experience.';

  document.getElementById('breakdown').innerHTML = [
    ['var(--kl)',  klh.name, 'RM' + klh.rate + ' × ' + kln + 'nt', klCost],
    ['var(--pg)',  pgh.name, 'RM' + pgh.rate + ' × ' + pgn + 'nt', pgCost],
    ['var(--dim)', 'Flights KUL↔PEN', '2 pax, est', FLIGHTS],
    ['var(--mut)', 'Food · Grab · sights', 'RM' + st.daily + ' × 7d', dailyCost],
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
    const plan = isKL ? KL_PLAN[Math.min(idx, KL_PLAN.length - 1)]
                      : PG_PLAN[Math.min(idx, PG_PLAN.length - 1)];
    const flight = (!isKL && idx === 0) ? '<span class="flag">✈ fly KUL → PEN this morning</span>' : '';
    html += `<div class="day ${city}">
      <div class="dh"><span class="nite">Night ${i + 1}</span><span class="city">${isKL ? 'KL' : 'Penang'}</span></div>
      <div class="date">${DATES[i]}</div>
      <div class="plan">${plan}</div>${flight}
    </div>`;
  }
  document.getElementById('days').innerHTML = html;
  document.getElementById('departStrip').innerHTML =
    `✈ <span><b>Jul 23 · departure</b> — check out, fly home${pgn > 0 ? ' from Penang (open-jaw) or hop back to KUL' : ''}.</span>`;
}

/* ---------- AHP bars ---------- */
function renderBars(containerId, legendId, arr, pickKey){
  const max = Math.max(...arr.map(h => h.score));
  document.getElementById(legendId).innerHTML = CRIT.map(c =>
    `<span class="lg"><i style="background:${c.c}"></i>${c.name} · ${c.w}</span>`).join('');
  document.getElementById(containerId).innerHTML = arr.map((h, i) => {
    const segs = CRIT.map(c => {
      const val = h.seg[c.key], wpct = (val / max) * 100;
      return `<span style="width:${wpct}%;background:${c.c}" title="${c.name}: ${val.toFixed(2)}"></span>`;
    }).join('');
    const isPick = h.k === pickKey;
    const tag = isPick ? `<span class="picktag">your pick</span>` : '';
    return `<div class="bar-row ${isPick ? 'pick' : ''}" data-k="${h.k}">
      <div class="rk">${i + 1}</div>
      <div class="bar-wrap">
        <div class="bar-top"><span class="hn">${h.name}</span><span class="hmeta">${h.star}★ · RM${h.rate} · ${h.area}</span>${tag}</div>
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
    `<div class="wcard"><div class="wt"><i style="background:${c.c}"></i>${c.name}</div><div class="wv">${c.w}</div></div>`
  ).join('');
}

/* ---------- render everything ---------- */
function renderAll(){
  renderBudget();
  renderItin();
  renderAHP();
  renderWeights();
}
