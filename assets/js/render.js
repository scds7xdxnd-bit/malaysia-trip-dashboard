/* ============================================================
   render.js — pure render functions for the BOOKED trip console

   All user-facing copy goes through t() (UI keys) or L() (bilingual
   data fields), so re-rendering in another language is automatic.
   ============================================================ */

function fmtMYR(n){ return 'RM ' + Math.round(n).toLocaleString(); }
function fmtMYRexact(n){
  return 'RM ' + n.toLocaleString('en-US', {minimumFractionDigits: (n % 1 ? 2 : 0), maximumFractionDigits: 2});
}

/* ---------- activity type icon map ---------- */
var TYPE_ICON = {};
TYPE_ICON[TYPE.FLIGHT]      = '\u2708\uFE0F';
TYPE_ICON[TYPE.TRANSPORT]   = '\uD83D\uDE97';
TYPE_ICON[TYPE.MEAL]        = '\uD83C\uDF74';
TYPE_ICON[TYPE.SIGHTSEEING] = '\uD83D\uDCF7';
TYPE_ICON[TYPE.STAY]        = '\uD83C\uDFE8';
TYPE_ICON[TYPE.LEISURE]     = '\u2615';
TYPE_ICON[TYPE.SHOPPING]    = '\uD83D\uDECD\uFE0F';

/* ---------- budget & payments (static - actuals) ---------- */
function renderBudget(){
  var fund = '';
  FUND_ROWS.forEach(function(r){
    fund += '<div class="brow"><span class="dot" style="background:var(--green)"></span>' +
      '<span class="name">' + L(r.who) + ' &middot; ' + r.src + '</span>' +
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

/* ---------- itinerary - 10 days with enhanced details ---------- */
function renderItin(){
  var html = '';
  ITIN.forEach(function(plan, i){
    var city = plan.city;
    var cityLabel = city === 'kl' ? t('dyn.cityKL') : city === 'pg' ? t('dyn.cityPG') : t('dyn.cityDepart');

    /* flight block with verify link */
    var flightBlock = '';
    if(plan.flight){
      flightBlock = '<div class="dday-flight">' +
        '<div class="dday-flight-head">' + t('day.flight') + '</div>' +
        '<div class="seg"><span class="seglab">' + t('flight.route') + '</span><span class="segtxt"><b>' + L(plan.flight.route) + '</b></span></div>' +
        '<div class="seg"><span class="seglab">' + t('flight.airline') + '</span><span class="segtxt">' + L(plan.flight.airline) + '</span></div>' +
        '<div class="seg"><span class="seglab">' + t('flight.time') + '</span><span class="segtxt">' + L(plan.flight.time) + '</span></div>' +
        '<div class="seg"><span class="seglab">' + t('flight.ref') + '</span><span class="segtxt">' + L(plan.flight.ref) + '</span></div>';
      if(plan.flight.verifyUrl){
        flightBlock += '<a class="verifylink" href="' + plan.flight.verifyUrl + '" target="_blank" rel="noopener">\u2705 ' + t('day.verify') + '</a>';
      }
      flightBlock += '</div>';
    }

    /* schedule entries with type icons, costs, map links, confirm numbers */
    var schedHtml = plan.sched.map(function(row){
      var icon = TYPE_ICON[row.type] || '';
      var doneMark = row.done ? ' <span class="idcheck" title="confirmed">\u2705</span>' : '';
      var costBadge = row.cost ? ' <span class="idcost">' + row.cost + '</span>' : '';
      var mapLink = row.mapUrl ? ' <a class="imap" href="' + row.mapUrl + '" target="_blank" rel="noopener" title="' + t('day.mapLink') + '">\uD83D\uDCCD</a>' : '';
      var confirmBadge = row.confirm ? ' <span class="iconfirm">#' + (typeof row.confirm === 'string' ? row.confirm : L(row.confirm)) + '</span>' : '';

      var doneClass = row.done ? ' seg-done' : '';
      return '<div class="seg' + doneClass + '"><span class="seglab mono">' +
        icon + ' ' + row.t + '</span><span class="segtxt">' + L(row.txt) +
        doneMark + costBadge + confirmBadge + mapLink + '</span></div>';
    }).join('');

    /* day map link */
    var dayMapLink = plan.mapUrl ? '<a class="dday-map" href="' + plan.mapUrl + '" target="_blank" rel="noopener">\uD83D\uDCCD ' + t('day.mapLink') + '</a>' : '';

    html += '<div class="dday ' + city + '">' +
      '<button class="dday-head" type="button" aria-expanded="false">' +
        '<span class="dday-meta">' + t('dyn.day', {n: i + 1}) + ' &middot; ' + cityLabel + ' &middot; ' + L(plan.date) + '</span>' +
        '<span class="dday-title">' + L(plan.title) + '</span>' +
        '<span class="dday-toggle">' + t('day.toggleShow') + '</span>' +
      '</button>' +
      '<div class="dday-body" hidden>' +
        schedHtml +
        flightBlock +
        '<div class="seg"><span class="seglab">' + t('day.tips') + '</span><span class="segtxt">' + L(plan.tips) + '</span></div>' +
        '<div class="dday-cost"><span>' + t('day.cost') + '</span><span>' + L(plan.cost) + '</span>' + dayMapLink + '</div>' +
      '</div>' +
    '</div>';
  });
  document.getElementById('daysDetail').innerHTML = html;
}

/* ---------- expense summary section ---------- */
function renderExpenses(){
  var html = '';

  /* on-trip expense cards by category */
  var catColors = ['#F2A93E', '#5AAEEF', '#BD8BEA', '#41C5A2'];
  var catIcons = ['\uD83C\uDF74', '\uD83D\uDE97', '\uD83C\uDFAD', '\uD83D\uDCB0'];
  SPEND_TRIP.forEach(function(cat, i){
    html += '<div class="expcat">' +
      '<div class="expcat-bar" style="background:' + catColors[i] + '"></div>' +
      '<div class="expcat-body">' +
        '<div class="expcat-head">' +
          '<span class="expcat-icon">' + catIcons[i] + '</span>' +
          '<span class="expcat-name">' + L(cat.name) + '</span>' +
          '<span class="expcat-amt mono">' + fmtMYR(cat.amt) + '</span>' +
        '</div>' +
        '<div class="expcat-sub">' + L(cat.calc) + '</div>' +
      '</div>' +
    '</div>';
  });

  /* totals row */
  html += '<div class="exptotal">' +
    '<div class="exptotal-row"><span>' + t('expense.total') + '</span><span class="mono">' + fmtMYR(SPEND_TRIP.reduce(function(s,c){return s+c.amt;},0)) + '</span></div>' +
    '<div class="exptotal-row"><span>' + t('expense.prepaid') + '</span><span class="mono">' + fmtMYRexact(SPEND_PREPAID.reduce(function(s,c){return s+c.amt;},0)) + '</span></div>' +
    '<div class="exptotal-row grand"><span>' + t('expense.grand') + '</span><span class="mono">' + fmtMYR(SPEND_TOTAL) + '</span></div>' +
  '</div>';

  /* grab trip cards */
  html += '<div class="expsubhead">' + t('grab.title') + '</div>';
  GRAB_TRIPS.forEach(function(g){
    html += '<div class="grabrow">' +
      '<span class="grabdate">' + L(g.date) + '</span>' +
      '<span class="grabroute">' + L(g.route) + '</span>' +
      '<span class="grabcost mono">' + g.cost + '</span>' +
    '</div>';
  });

  var el = document.getElementById('expenseDetail');
  if(el) el.innerHTML = html;
}

/* ---------- payment breakdown ---------- */
function renderPayments(){
  var html = '';
  PAYMENT_INFO.contributors.forEach(function(c){
    html += '<div class="payrow">' +
      '<span class="payname">' + L(c.name) + '</span>' +
      '<span class="paycur mono">' + c.currency + ' ' + c.amount + '</span>' +
      '<span class="payrate mono">&times; ' + c.rate + '</span>' +
      '<span class="paymyr mono">' + fmtMYR(c.myr) + '</span>' +
    '</div>';
  });
  html += '<div class="paytotal mono">= ' + fmtMYR(PAYMENT_INFO.fundTotal) + ' pooled</div>';

  var diff = PAYMENT_INFO.fundTotal - PAYMENT_INFO.spendTotal;
  html += '<div class="paydiff mono">' + t('dyn.spare', {n: diff.toLocaleString()}) + '</div>';

  var el = document.getElementById('paymentDetail');
  if(el) el.innerHTML = html;
}

/* ---------- trip details grid ---------- */
function renderDetails(){
  function card(headingKey, body){ return '<div class="detailcard"><h4>' + t(headingKey) + '</h4>' + body + '</div>'; }
  function dot(city){ return city ? '<span class="citydot ' + city + '">\u25CF</span>' : ''; }

  /* Flights */
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

  /* Stays - with map links */
  var stays = '';
  STAYS_REF.forEach(function(s){
    var mapLink = s.mapUrl ? ' <a class="booklink ' + s.city + '" href="' + s.mapUrl + '" target="_blank" rel="noopener">\uD83D\uDCCD Maps</a>' : '';
    stays += '<div class="staycard"><span class="staydot ' + s.city + '">\u25CF</span>' +
      '<span class="sc-name">' + s.name + '</span>' +
      '<div class="sc-area">' + L(s.room) + '</div>' +
      '<div class="sc-line">' + L(s.dates) + '</div>' +
      '<div class="sc-line"><span class="sc-cost">' + L(s.cost) + '</span>' + mapLink + '</div>' +
    '</div>';
  });

  /* Dining + Experiences */
  function refList(arr){
    var html = '';
    arr.forEach(function(x){
      var chip = x.booked ? ' <span class="bookedchip">' + t('chip.booked') + '</span>' : '';
      var mapLink = x.mapUrl ? ' <a class="booklink ' + x.city + '" href="' + x.mapUrl + '" target="_blank" rel="noopener">\uD83D\uDCCD</a>' : '';
      html += '<div class="dc-row"><div class="dc-main">' +
        '<div class="dc-name">' + L(x.name) + dot(x.city) + chip + mapLink + '</div>' +
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
    return arr.map(function(it){
      var done = it.done === true;
      return '<div class="dc-check' + (done ? ' done' : '') + '">' +
        '<span class="gly">' + (done ? '\u2611' : '\u25A2') + '</span><span>' + L(it) + '</span></div>';
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
  renderExpenses();
  renderPayments();
  renderDetails();
}
