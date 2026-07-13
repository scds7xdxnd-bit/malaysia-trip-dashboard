/* ============================================================
   render.js — pure render functions for the BOOKED trip console

   All user-facing copy goes through t() (UI keys) or L() (bilingual
   data fields), so re-rendering in another language is automatic.
   ============================================================ */

function fmtMYR(n){ return 'RM ' + Math.round(n).toLocaleString(); }
/* exact amount — keeps cents on actual payments (RM 4,631.36) */
function fmtMYRexact(n){
  return 'RM ' + n.toLocaleString('en-US', {minimumFractionDigits: (n % 1 ? 2 : 0), maximumFractionDigits: 2});
}

/* ---------- budget & payments (static — actuals) ---------- */
function renderBudget(){
  /* left column: fund + prepaid bookings */
  var fund = '';
  FUND_ROWS.forEach(function(r){
    fund += '<div class="brow"><span class="dot" style="background:var(--green)"></span>' +
      '<span class="name">' + L(r.who) + ' · ' + r.src + '</span>' +
      '<span class="calc">' + r.rate + '</span>' +
      '<span class="amt">' + fmtMYR(r.myr) + '</span></div>';
  });
  var fundEl = document.getElementById('fundRows');
  if(fundEl) fundEl.innerHTML = fund;
  var ftl = document.getElementById('fundTotalLine');
  if(ftl) ftl.textContent = t('fund.total', {n: FUND_TOTAL.toLocaleString()});

  var payStatus = document.getElementById('payStatus');
  if(payStatus) payStatus.textContent = t('pay.status',
    {paid: PAID_SO_FAR.toLocaleString(), left: PAID_REMAINING.toLocaleString()});

  var hdrEl = document.getElementById('budgetHdr');
  if(hdrEl) hdrEl.textContent = fmtMYR(FUND_TOTAL);

  /* right column: gauge + verdict + full breakdown */
  var pct = FUND_TOTAL > 0 ? SPEND_TOTAL / FUND_TOTAL : 0;
  var remain = FUND_TOTAL - SPEND_TOTAL;

  var gf = document.getElementById('gfill');
  gf.style.width = Math.min(Math.max(pct, 0), 1) * 100 + '%';
  gf.classList.toggle('over', remain < 0);
  document.getElementById('pctTxt').textContent = Math.round(pct * 100) + '%';
  document.getElementById('totalBig').textContent = fmtMYR(SPEND_TOTAL);

  var rEl = document.getElementById('remain');
  if(remain >= 0){ rEl.className = 'remain ok';  rEl.textContent = t('dyn.spare', {n: remain.toLocaleString()}); }
  else           { rEl.className = 'remain bad'; rEl.textContent = t('dyn.over',  {n: Math.abs(remain).toLocaleString()}); }
  document.getElementById('verdict').textContent = remain >= 0 ? t('verdict.ok') : t('verdict.over');

  function rows(arr, fmt){
    return arr.map(function(r){
      return '<div class="brow"><span class="dot" style="background:' + r.c + '"></span>' +
        '<span class="name">' + L(r.name) + '</span>' +
        '<span class="calc">' + L(r.calc) + '</span>' +
        '<span class="amt">' + fmt(r.amt) + '</span></div>';
    }).join('');
  }
  document.getElementById('breakdown').innerHTML =
    '<div class="bd-group">' + t('pay.prepaid') + '</div>' + rows(SPEND_PREPAID, fmtMYRexact) +
    '<div class="bd-group">' + t('pay.ontrip') + '</div>' + rows(SPEND_TRIP, fmtMYR);
}

/* ---------- itinerary — 10 fixed booked days ---------- */
function renderItin(){
  var html = '';
  ITIN.forEach(function(plan, i){
    var city = plan.city;
    var cityLabel = city === 'kl' ? t('dyn.cityKL') : city === 'pg' ? t('dyn.cityPG') : t('dyn.cityDepart');

    var flightBlock = '';
    if(plan.flight){
      flightBlock = '<div class="dday-flight">' + t('day.flight') +
        '<div class="seg"><span class="seglab">' + t('flight.route') + '</span><span class="segtxt"><b>' + L(plan.flight.route) + '</b></span></div>' +
        '<div class="seg"><span class="seglab">' + t('flight.airline') + '</span><span class="segtxt">' + L(plan.flight.airline) + '</span></div>' +
        '<div class="seg"><span class="seglab">' + t('flight.time') + '</span><span class="segtxt">' + L(plan.flight.time) + '</span></div>' +
        '<div class="seg"><span class="seglab">' + t('flight.ref') + '</span><span class="segtxt">' + L(plan.flight.ref) + '</span></div>' +
      '</div>';
    }

    var schedHtml = plan.sched.map(function(row){
      return '<div class="seg"><span class="seglab mono">' + row.t + '</span><span class="segtxt">' + L(row.txt) + '</span></div>';
    }).join('');

    html += '<div class="dday ' + city + '">' +
      '<button class="dday-head" type="button" aria-expanded="false">' +
        '<span class="dday-meta">' + t('dyn.day', {n: i + 1}) + ' · ' + cityLabel + ' · ' + L(plan.date) + '</span>' +
        '<span class="dday-title">' + L(plan.title) + '</span>' +
        '<span class="dday-toggle">' + t('day.toggleShow') + '</span>' +
      '</button>' +
      '<div class="dday-body" hidden>' +
        schedHtml +
        flightBlock +
        '<div class="seg"><span class="seglab">' + t('day.tips') + '</span><span class="segtxt">' + L(plan.tips) + '</span></div>' +
        '<div class="dday-cost"><span>' + t('day.cost') + '</span> ' + L(plan.cost) + '</div>' +
      '</div>' +
    '</div>';
  });
  document.getElementById('daysDetail').innerHTML = html;
}

/* ---------- trip details grid ---------- */
function renderDetails(){
  function card(headingKey, body){ return '<div class="detailcard"><h4>' + t(headingKey) + '</h4>' + body + '</div>'; }
  function dot(city){ return city ? '<span class="citydot ' + city + '">●</span>' : ''; }

  /* Flights — stacked */
  var flights = '';
  FLIGHTS_REF.forEach(function(f){
    flights += '<div class="dc-row" style="display:block">' +
      '<div class="dc-line head">' + L(f.route) + '</div>' +
      '<div class="dc-line">' + L(f.date) + '</div>' +
      '<div class="dc-line">' + L(f.detail) + '</div>' +
      '<div class="dc-line">' + L(f.cost) + '</div>' +
    '</div>';
  });

  /* Transfers & ground */
  var transport = '';
  TRANSPORT_REF.forEach(function(tr){
    transport += '<div class="dc-row"><div class="dc-main">' +
      '<div class="dc-name">' + L(tr.name) + '</div>' +
      (tr.sub ? '<div class="dc-sub">' + L(tr.sub) + '</div>' : '') +
    '</div><div class="dc-cost">' + L(tr.cost) + '</div></div>';
  });

  /* Stays */
  var stays = '';
  STAYS_REF.forEach(function(s){
    stays += '<div class="staycard"><span class="staydot ' + s.city + '">●</span>' +
      '<span class="sc-name">' + s.name + '</span>' +
      '<div class="sc-area">' + L(s.room) + '</div>' +
      '<div class="sc-line">' + L(s.dates) + '</div>' +
      '<div class="sc-line"><span class="sc-cost">' + L(s.cost) + '</span></div>' +
    '</div>';
  });

  /* Dining + Experiences share one renderer */
  function refList(arr){
    var html = '';
    arr.forEach(function(x){
      var chip = x.booked ? ' <span class="bookedchip">' + t('chip.booked') + '</span>' : '';
      html += '<div class="dc-row"><div class="dc-main">' +
        '<div class="dc-name">' + L(x.name) + dot(x.city) + chip + '</div>' +
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

  /* Packing (open boxes) + Checklist (done items ticked) */
  function checks(arr){
    return arr.map(function(it){
      var done = it.done === true;
      return '<div class="dc-check' + (done ? ' done' : '') + '">' +
        '<span class="gly">' + (done ? '☑' : '▢') + '</span><span>' + L(it) + '</span></div>';
    }).join('');
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
  renderDetails();
}
