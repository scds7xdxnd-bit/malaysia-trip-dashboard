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

function computeRanked(arr, ratesMap, weights){
  var adj = recalcWeights(arr, origCritWts, weights).map(function(h){
    var ov = ratesMap ? ratesMap[h.k] : null;
    if(ov != null && ov > 0 && ov !== h.rate){
      return recalcHotel(h, h.rate, ov, weights['V']);
    }
    return h;
  });
  adj.sort(function(a, b){ return b.score - a.score; });
  return adj;
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
  const days = NIGHTS + 1;
  const klCost = klRate * kln, pgCost = pgRate * pgn;

  var itineraryCost = 0;
  for(var i = 0; i < NIGHTS; i++){
    var isLast = (i === NIGHTS - 1);
    var isKLPlan = isLast || (i < kln - 1);
    var plan;
    if(isLast) plan = KL_PLAN[Math.min(3, KL_PLAN.length - 1)];
    else if(isKLPlan) plan = KL_PLAN[Math.min(i, KL_PLAN.length - 1)];
    else plan = PG_PLAN[Math.min(i - (kln - 1), PG_PLAN.length - 1)];
    itineraryCost += +(plan.costPerPax || 0);
  }
  itineraryCost += +(DEPART_PLAN.costPerPax || 0);
  var dailyCost = itineraryCost * PAX;
  var total = klCost + pgCost + flightsMYR + dailyCost;
  const remain = budgetMYR - total, pct = budgetMYR > 0 ? total / budgetMYR : 0;

  var klRI = document.getElementById('klRateInp');
  if(klRI) klRI.value = klRate;
  var pgRI = document.getElementById('pgRateInp');
  if(pgRI) pgRI.value = pgRate;
  document.getElementById('klArea').textContent = L(klh.area);
  document.getElementById('pgArea').textContent = L(pgh.area);
  document.getElementById('splitTxt').textContent = t('dyn.split', {kl: kln, pg: pgn});
  var perDay = Math.round(itineraryCost / days);
  document.getElementById('dailyTxt').textContent = fmtMYR(dailyCost);

  var hdrEl = document.getElementById('budgetHdr');
  if(hdrEl) hdrEl.textContent = fmtMYR(budgetMYR);

  var tlEl = document.getElementById('budgetTotalLine');
  if(tlEl) tlEl.textContent = t('budget.totalLine', {n: Math.round(budgetMYR).toLocaleString()});

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
      t('bd.flightsCalc') + ' · <a href="https://www.google.com/travel/flights?q=KUL+to+BKI+on+2026-07-19" target="_blank" rel="noopener" class="verifylink">' + t('links.verify') + '</a>',
      (+st.flightOut || 0)],
    ['var(--dim)', t('bd.flightsBack'),
      t('bd.flightsCalc') + ' · <a href="https://www.google.com/travel/flights?q=BKI+to+KUL+on+2026-07-22" target="_blank" rel="noopener" class="verifylink">' + t('links.verify') + '</a>',
      (+st.flightBack || 0)],
    ['var(--mut)', t('bd.food'),            t('bd.foodCalc', {pax: PAX, perDay: perDay, n: days}), dailyCost],
  ].map(r => `<div class="brow"><span class="dot" style="background:${r[0]}"></span>
     <span class="name">${r[1]}</span><span class="calc">${r[2]}</span>
     <span class="amt">${fmtMYR(r[3])}</span></div>`).join('');

  // F. Booking deep-links
  var klBL = document.getElementById('klBookLink');
  var pgBL = document.getElementById('pgBookLink');
  if(klBL){
    var klFrontEndDay = 16 + (kln - 1); // front KL segment checkout, split-aware
    klBL.href = 'https://www.booking.com/searchresults.html' +
      '?ss=' + encodeURIComponent(klh.name + ' Kuala Lumpur') +
      '&checkin=2026-07-16&checkout=2026-07-' + klFrontEndDay +
      '&group_adults=2&no_rooms=1';
  }
  if(pgBL){
    pgBL.href = 'https://www.booking.com/searchresults.html' +
      '?ss=' + encodeURIComponent(pgh.name + ' Kota Kinabalu') +
      '&checkin=2026-07-19&checkout=2026-07-22' +
      '&group_adults=2&no_rooms=1';
  }
  window.BUDGET_CALC = {total:total, budgetMYR:budgetMYR, remain:remain,
    klRate:klRate, pgRate:pgRate, kln:kln, pgn:pgn, days:days};
}

/* ---------- itinerary ----------
   Hop-back, not contiguous: fly KUL->BKI early, so the night of the
   outbound flight day is already in KK; fly BKI->KUL on the return day,
   so that night is back in KL, not KK. Structure is always
   [front KL nights] + [KK nights] + [1 back-KL return night] —
   the trailing KL night is fixed by the actual return flight, regardless
   of where the split slider sits. KL_PLAN[3] is written specifically as
   that "return to KL" night, so it's used directly, not via a running
   index that would drift past it on other slider positions. */
function renderItin(){
  const kln = st.split, pgn = NIGHTS - kln;
  const frontKL = kln - 1;
  let detailHtml = '';
  for(let i = 0; i < NIGHTS; i++){
    const isLast = (i === NIGHTS - 1);
    const isKL = isLast || (i < frontKL);
    const city = isKL ? 'kl' : 'pg';
    let plan;
    if(isLast){
      plan = KL_PLAN[Math.min(3, KL_PLAN.length - 1)];
    } else if(isKL){
      plan = KL_PLAN[Math.min(i, KL_PLAN.length - 1)];
    } else {
      plan = PG_PLAN[Math.min(i - frontKL, PG_PLAN.length - 1)];
    }
    var title = L(plan.title);

    /* detailed day card */
    var flightBlock = '';
    var flightObj = null;
    if(!isKL && i === frontKL) flightObj = FLIGHT_OUT;
    else if(isLast) flightObj = FLIGHT_BACK;
    if(flightObj){
      var fq = flightObj.q || '';
      var furl = 'https://www.google.com/travel/flights?q=' + fq;
      flightBlock = '<div class="seg"><span class="seglab">' + t('flight.route') + '</span><span class="segtxt"><b>' + L(flightObj.route) + '</b></span></div>' +
        '<div class="seg"><span class="seglab">' + t('flight.airline') + '</span><span class="segtxt">' + L(flightObj.airline) + '</span></div>' +
        '<div class="seg"><span class="seglab">' + t('flight.terminal') + '</span><span class="segtxt">' + L(flightObj.terminal) + '</span></div>' +
        '<div class="seg"><span class="seglab">' + t('flight.duration') + '</span><span class="segtxt">' + L(flightObj.duration) + '</span></div>' +
        '<div class="seg"><span class="seglab">' + t('flight.cost') + '</span><span class="segtxt">' + fmtMYR(isLast ? st.flightBack : st.flightOut) + '</span></div>' +
        '<a class="verifylink" href="' + furl + '" target="_blank" rel="noopener">' + t('links.verify') + '</a>';
    }
    var mealsHtml = '<div class="seg"><span class="seglab">' + t('day.meals') + '</span><span class="segtxt">' +
      '<span class="mealtag">' + t('day.breakfast') + '</span> ' + L(plan.meals.breakfast) + '<br>' +
      '<span class="mealtag">' + t('day.lunch') + '</span> ' + L(plan.meals.lunch) + '<br>' +
      '<span class="mealtag">' + t('day.dinner') + '</span> ' + L(plan.meals.dinner) +
    '</span></div>';
    var costHtml = '<div class="dday-cost"><span>' + t('day.cost') + '</span> ' + L(plan.cost) + '</div>';
    detailHtml += '<div class="dday ' + city + '">' +
      '<button class="dday-head" type="button" aria-expanded="false">' +
        '<span class="dday-meta">' + t('dyn.night', {n: i + 1}) + ' · ' + (isKL ? t('dyn.cityKL') : t('dyn.cityPG')) + ' · ' + L(DATES[i]) + '</span>' +
        '<span class="dday-title">' + title + '</span>' +
        '<span class="dday-toggle">' + t('day.toggleShow') + '</span>' +
      '</button>' +
      '<div class="dday-body" hidden>' +
        '<div class="seg"><span class="seglab">' + t('day.morning') + '</span><span class="segtxt">' + L(plan.morning) + '</span></div>' +
        '<div class="seg"><span class="seglab">' + t('day.afternoon') + '</span><span class="segtxt">' + L(plan.afternoon) + '</span></div>' +
        '<div class="seg"><span class="seglab">' + t('day.evening') + '</span><span class="segtxt">' + L(plan.evening) + '</span></div>' +
        mealsHtml +
        (flightBlock ? '<div class="dday-flight">' + t('day.flight') + flightBlock + '</div>' : '') +
        '<div class="seg"><span class="seglab">' + t('day.transport') + '</span><span class="segtxt">' + L(plan.transport) + '</span></div>' +
        '<div class="seg"><span class="seglab">' + t('day.tips') + '</span><span class="segtxt">' + L(plan.tips) + '</span></div>' +
        costHtml +
      '</div>' +
    '</div>';
  }
  /* depart day detail */
  var departPlan = DEPART_PLAN;
  var departDetailHtml = '<div class="dday split">' +
    '<button class="dday-head" type="button" aria-expanded="false">' +
      '<span class="dday-meta">' + t('dyn.day', {n: NIGHTS + 1}) + ' · ' + t('dyn.cityDepart') + ' · ' + L(DEPART_DATE) + '</span>' +
      '<span class="dday-title">' + L(departPlan.title) + '</span>' +
      '<span class="dday-toggle">' + t('day.toggleShow') + '</span>' +
    '</button>' +
    '<div class="dday-body" hidden>' +
      '<div class="seg"><span class="seglab">' + t('day.morning') + '</span><span class="segtxt">' + L(departPlan.morning) + '</span></div>' +
      '<div class="seg"><span class="seglab">' + t('day.afternoon') + '</span><span class="segtxt">' + L(departPlan.afternoon) + '</span></div>' +
      '<div class="seg"><span class="seglab">' + t('day.evening') + '</span><span class="segtxt">' + L(departPlan.evening) + '</span></div>' +
      '<div class="seg"><span class="seglab">' + t('day.meals') + '</span><span class="segtxt">' +
        '<span class="mealtag">' + t('day.breakfast') + '</span> ' + L(departPlan.meals.breakfast) + '<br>' +
        '<span class="mealtag">' + t('day.lunch') + '</span> ' + L(departPlan.meals.lunch) + '<br>' +
        '<span class="mealtag">' + t('day.dinner') + '</span> ' + L(departPlan.meals.dinner) +
      '</span></div>' +
      '<div class="seg"><span class="seglab">' + t('day.transport') + '</span><span class="segtxt">' + L(departPlan.transport) + '</span></div>' +
      '<div class="seg"><span class="seglab">' + t('day.tips') + '</span><span class="segtxt">' + L(departPlan.tips) + '</span></div>' +
      '<div class="dday-cost"><span>' + t('day.cost') + '</span> ' + L(departPlan.cost) + '</div>' +
    '</div>' +
  '</div>';
  detailHtml += departDetailHtml;

  document.getElementById('daysDetail').innerHTML = detailHtml;
}

/* ---------- AHP bars ---------- */
function renderBars(containerId, legendId, arr, pickKey, ratesMap, curWeights){
  var adjArr = computeRanked(arr, ratesMap, curWeights);
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
  renderBars('barsKL', 'legendKL', KL, st.kl, st.klRates, w);
  renderBars('barsPG', 'legendPG', PG, st.pg, st.pgRates, w);
}

/* ---------- criteria weights footer ---------- */
function renderWeights(){
  var w = st.weights || {};
  document.getElementById('wgrid').innerHTML = CRIT.map(c =>
    `<div class="wcard"><div class="wt"><i style="background:${c.c}"></i>${t('crit.' + c.key)}</div>
    <input class="wvinp" data-k="${c.key}" type="number" value="${(w[c.key] != null) ? w[c.key] : c.w}" step="0.001" min="0" max="2" inputmode="decimal"></div>`
  ).join('');
}

function renderMethod(){
  var w = st.weights || {}; CRIT.forEach(function(c){ if(!(c.key in w)) w[c.key]=c.w; });
  var bc = window.BUDGET_CALC || {};
  var klRanked = computeRanked(KL, st.klRates, w);
  var pgRanked = computeRanked(PG, st.pgRates, w);
  var klWin = klRanked[0], pgWin = pgRanked[0], pgRunner = pgRanked[1];
  var klPick = find(KL, st.kl), pgPick = find(PG, st.pg);
  var klRate = bc.klRate, pgRate = bc.pgRate;

  var klSplurge = null, maxRate = -1;
  KL.forEach(function(h){
    var r = effRate(KL, st.klRates, h.k);
    if(h.k !== st.kl && r > maxRate){ maxRate = r; klSplurge = h; }
  });
  var splurgePct = (klRate > 0) ? Math.round((maxRate - klRate) / klRate * 100) : 0;

  var src = st.pYou || {amt:0, ccy:'MYR'};
  var amtStr = (+src.amt || 0).toLocaleString();
  var coreSrc = src.ccy === 'KRW' ? ('₩' + amtStr)
              : src.ccy === 'CNY' ? ('¥' + amtStr)
              : ('RM ' + amtStr);

  var alphaClause = (bc.remain < 0)
    ? t('method.alphaGap',  {n: fmtMYR(Math.abs(bc.remain))})
    : t('method.underCore', {n: fmtMYR(bc.remain)});

  var leaderNote = (klPick.k === klWin.k && pgPick.k === pgWin.k)
    ? t('method.bothLead')
    : t('method.leadersAre', {kl: klWin.name, kls: klWin.score.toFixed(2),
                              pg: pgWin.name, pgs: pgWin.score.toFixed(2)});

  document.getElementById('methodP1').innerHTML = t('method.p1', {
    coreSrc: coreSrc, core: fmtMYR(bc.budgetMYR),
    klPick: klPick.name, klRate: klRate, pgPick: pgPick.name, pgRate: pgRate,
    total: fmtMYR(bc.total), nights: NIGHTS, days: bc.days,
    alphaClause: alphaClause, leaderNote: leaderNote,
    klSplurge: klSplurge ? klSplurge.name : '', klSplurgeRate: maxRate, splurgePct: splurgePct
  });
  document.getElementById('methodP2').innerHTML = t('method.p2', {
    wV: w.V, wLo: w.Lo, wL: w.L,
    pgWin: pgWin.name, pgWinScore: pgWin.score.toFixed(2),
    pgRunner: pgRunner.name, pgRunnerScore: pgRunner.score.toFixed(2)
  });
}

function renderDetails(){
  var bc = window.BUDGET_CALC || {};
  var kln = st.split, pgn = NIGHTS - kln, frontKL = kln - 1;
  var klh = find(KL, st.kl), pgh = find(PG, st.pg);
  var klRate = bc.klRate, pgRate = bc.pgRate;
  var klTotal = klRate * kln, pgTotal = pgRate * pgn;

  var klFrontEnd = 16 + frontKL;
  var klDateLabel = 'Jul 16' + (frontKL === 1 ? '' : '-' + klFrontEnd) + ' & Jul 22–23';
  var pgStart = 16 + frontKL, pgEnd = 16 + frontKL + pgn - 1;
  var pgDateLabel = 'Jul ' + pgStart + '-' + pgEnd;

  var klBookUrl = 'https://www.booking.com/searchresults.html?ss=' +
    encodeURIComponent(klh.name + ' Kuala Lumpur') +
    '&checkin=2026-07-16&checkout=2026-07-' + klFrontEnd + '&group_adults=2&no_rooms=1';
  var pgBookUrl = 'https://www.booking.com/searchresults.html?ss=' +
    encodeURIComponent(pgh.name + ' Kota Kinabalu') +
    '&checkin=2026-07-' + pgStart + '&checkout=2026-07-' + (pgStart + pgn - 1) + '&group_adults=2&no_rooms=1';

  function card(headingKey, body){ return '<div class="detailcard"><h4>' + t(headingKey) + '</h4>' + body + '</div>'; }
  function dot(city){ return city ? '<span class="citydot ' + city + '">●</span>' : ''; }

  /* Flights — stacked */
  var flights = '';
  FLIGHTS_REF.forEach(function(f, i){
    var url = 'https://www.google.com/travel/flights?q=' + (f.q || '');
    var flightCost = i === 0 ? (+st.flightOut || 0) : (+st.flightBack || 0);
    flights += '<div class="dc-row" style="display:block">' +
      '<div class="dc-line head">' + L(f.route) + '</div>' +
      '<div class="dc-line">' + L(f.date) + '</div>' +
      '<div class="dc-line">' + L(f.airline) + '</div>' +
      '<div class="dc-line">' + L(f.terminal) + '</div>' +
      '<div class="dc-line">' + L(f.duration) + ' · ' + fmtMYR(flightCost) +
        ' <a class="verifylink" href="' + url + '" target="_blank" rel="noopener">' + t('links.verify') + '</a></div>' +
    '</div>';
  });

  /* Transport */
  var transport = '';
  TRANSPORT_REF.forEach(function(tr){
    transport += '<div class="dc-row"><div class="dc-main"><div class="dc-name">' + L(tr.name) + '</div></div>' +
      '<div class="dc-cost">' + L(tr.cost) + '</div></div>';
  });

  /* Stays (live) */
  function stay(h, dotCls, dateLabel, rate, nights, total, url){
    return '<div class="staycard"><span class="staydot ' + dotCls + '">●</span>' +
      '<span class="sc-name">' + h.name + '</span> ' + h.star + '★' +
      '<div class="sc-area">' + L(h.area) + '</div>' +
      '<div class="sc-line">' + dateLabel + '</div>' +
      '<div class="sc-line">' + t('stays.guests') + ' · ' + t('stays.nights', {n: nights}) + '</div>' +
      '<div class="sc-line">RM' + rate + '/nt · <span class="sc-cost">' + fmtMYR(total) + '</span></div>' +
      '<a class="booklink ' + dotCls + '" href="' + url + '" target="_blank" rel="noopener">' + t('links.book') + '</a></div>';
  }
  var stays = stay(klh, 'kl', klDateLabel, klRate, kln, klTotal, klBookUrl) +
              stay(pgh, 'pg', pgDateLabel, pgRate, pgn, pgTotal, pgBookUrl);

  /* Dining + Experiences share one renderer */
  function refList(arr){
    var html = '';
    arr.forEach(function(x){
      html += '<div class="dc-row"><div class="dc-main">' +
        '<div class="dc-name">' + L(x.name) + dot(x.city) + '</div>' +
        (x.sub ? '<div class="dc-sub">' + L(x.sub) + '</div>' : '') +
        (x.note ? '<div class="dc-note">' + L(x.note) + '</div>' : '') +
      '</div><div class="dc-cost">' + L(x.cost) + '</div></div>';
    });
    return html;
  }

  /* Essentials */
  var ess = '';
  ESSENTIALS_REF.forEach(function(e){
    ess += '<div class="dc-erow"><span class="dc-label">' + L(e.label) + '</span>' +
      '<span class="dc-value">' + L(e.value) + '</span></div>';
  });

  /* Packing + Checklist */
  function checks(arr){
    return arr.map(function(it){ return '<div class="dc-check"><span class="gly">▢</span><span>' + L(it) + '</span></div>'; }).join('');
  }

  document.getElementById('detailgrid').innerHTML =
    card('detail.flights', flights) +
    card('detail.transport', transport) +
    card('detail.stays', stays) +
    card('detail.dining', refList(DINING_REF)) +
    card('detail.experiences', refList(EXPERIENCES_REF)) +
    card('detail.essentials', ess) +
    card('detail.packing', checks(PACKING_REF)) +
    card('detail.checklist', checks(CHECKLIST_REF));
}

/* ---------- render everything ---------- */
function renderAll(){
  renderBudget();
  renderItin();
  renderAHP();
  renderWeights();
  renderMethod();
  renderDetails();
}
