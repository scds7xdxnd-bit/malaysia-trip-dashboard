/* ============================================================
   i18n.js — tiny dictionary-based internationalization

   - t(key, params)   → translated UI string, with {token} interpolation
   - L(field)         → picks .en / .zh from a { en, zh } data field
   - I18N.set(lang) / I18N.toggle()  → switch language + persist + re-render
   - I18N.apply()     → fills [data-i18n] / [data-i18n-html] nodes, <title>,
                        the toggle button, then re-renders dynamic content

   Two languages: 'en' (English) and 'zh' (Simplified Chinese / Mandarin).
   Choice persists in localStorage('trip-lang').
   ============================================================ */

const I18N = (function(){
  const DICT = {
    en: {
      'app.title':        'KL × Kota Kinabalu — Luxury Trip Console',
      'header.eyebrow':   'AHP luxury console · KL × Kota Kinabalu · Jul 16–25',
      'city.kl':          'Kuala Lumpur',
      'city.pg':          'Kota Kinabalu',
      'meta.window':      'Window',
      'meta.windowVal':   'Jul 16 → 25',
      'meta.budget':      'Budget · 2 pax',

      'sec.console':      'Budget console',
      'console.sub':      'Pick a hotel per city + split the nights.',
      'ctrl.split':       'Night split',
      'marks.moreKL':     'more KL',
      'marks.total7':     '7 nights · 8 days',
      'marks.morePG':     'more KK',
      'ctrl.klHotel':     'Kuala Lumpur hotel',
      'ctrl.pgHotel':     'Kota Kinabalu hotel',
      'ctrl.itinerary':   'Itinerary · food · local',
      'readout.used':     'Budget used',
      'readout.total':    'Trip total',

      'sec.itin':         'Itinerary',
      'itin.sub':         '8 days total — 7 hotel nights + 1 day together. Re-flows with the night split. <span style="color:var(--kl)">amber = KL</span> · <span style="color:var(--pg)">teal = Kota Kinabalu</span> · <span style="color:var(--red)">red = together, then part ways</span>',

      'sec.ahpKL':        'AHP — Kuala Lumpur',
      'ahpKL.sub':        'Bar length = weighted score (0–10). Segments show <em>why</em>.',
      'sec.ahpPG':        'AHP — Kota Kinabalu',
      'ahpPG.sub':        'Same weights. Island resorts win on luxury but lose Location &amp; Value — see note.',

      'sec.method':       'Method & caveats',
      'method.h3':        'Luxury-tilted weights · pairwise AHP · CR = 0.004 (consistent)',
      'method.p1':        '<b style="color:var(--ink)">Core + alpha.</b> The {coreSrc} core (≈ {core}) covers roughly one flagship, not two. Your picks — <span style="color:var(--kl)">{klPick}</span> (RM{klRate}/nt) + <span style="color:var(--pg)">{pgPick}</span> (RM{pgRate}/nt) — run {total} all-in for two over {nights} nights / {days} days; {alphaClause}. {leaderNote} For the ultra-splurge, <span style="color:var(--kl)">{klSplurge}</span> (~RM{klSplurgeRate}) is KL\'s priciest tier here — it lifts the KL room bill ~{splurgePct}%.',
      'method.p2':        '<b style="color:var(--ink)">Island, beach, or city?</b> Your weights set Value {wV}, Location {wLo} and Luxury {wL}. Under them <span style="color:var(--pg)">{pgWin}</span> leads Kota Kinabalu at {pgWinScore}, with <span style="color:var(--pg)">{pgRunner}</span> ({pgRunnerScore}) the closest challenger. Boat-only resorts (Gaya Island, Bunga Raya) edge ahead on raw luxury but lose Location &amp; Value; Tanjung Aru is the one pick that is genuinely beachfront <em>and</em> ~15 min from town and the airport.',
      'method.p3':        '<b>Factcheck flags:</b> Gaya Island &amp; Bunga Raya are boat-access only from Jesselton Point (~15–20 min) — no walk-in or late arrivals. Nexus Karambunai is ~45 min out, effectively stay-put. Park Hyatt KL is in Merdeka 118 (not KLCC) and budget-breaking at ~RM1,600. City hotels (Hyatt Centric, Le Méridien, Hilton) have rooftop pools but no swimmable beach.',
      'pill.flights':     'flights KUL↔BKI ~2h 45m',
      'pill.rates':       'rates = approx, Jul 2026',
      'method.disclaim':  'Nightly rates are representative July-2026 estimates (researched Jun 2026 across Booking / Agoda / KAYAK / official sites) and move with dates/availability — confirm at booking. The Value criterion is derived directly from price (Value = C ÷ rate), so editing a rate re-scores that hotel live. Ratings = Google, fetched Jun 2026. Adjust the weights and the order shifts.',

      /* criteria */
      'crit.L':  'Luxury',
      'crit.V':  'Value',
      'crit.R':  'Reviews',
      'crit.Lo': 'Location',
      'crit.A':  'Amenities',

      /* dynamic (rendered) */
      'dyn.split':        '{kl} KL · {pg} KK',
      'dyn.perNight':     'RM {n}/nt',
      'dyn.perDay':       'RM {n}/day',
      'dyn.spare':        'RM {n} to spare',
      'dyn.over':         'RM {n} over budget',
      'verdict.over':     'Flagship luxury — the overage is your alpha. Expected for two five-star stays.',
      'verdict.thin':     'Right at core — minimal alpha needed.',
      'verdict.comfy':    'Comfortable — room for a fine-dining night within core.',
      'verdict.slack':    'Lots of core slack — upgrade a tier or add an experience.',
      'bd.flights':       'Flights KUL↔BKI',
      'bd.food':          'Food · Grab · sights',
      'bd.nightsCalc':    'RM{rate} × {n}nt',
      'bd.flightsCalc':   '2 pax, est',
      'bd.foodCalc':      '~RM{perDay}/d · {pax}pax × {n}d',
      'dyn.night':        'Night {n}',
      'dyn.day':          'Day {n}',
      'dyn.cityKL':       'KL',
      'dyn.cityPG':       'Kota Kinabalu',
      'dyn.cityDepart':   'Together → depart',
      'dyn.flyFlag':      '✈ fly KUL → BKI this morning',
      'dyn.flyBack':      '✈ fly BKI → KUL',
      'dyn.pick':         'your pick',
      /* new — phase 1 */
      'budget.group':    'Your budgets',
      'budget.you':      'Taeyang',
      'budget.junxi':    'Junxi',
      'budget.totalLine': '= RM {n} total budget',
      'flights.group':   'Flights',
      'flights.out':     'KUL → BKI',
      'flights.back':    'BKI → KUL',
      'bd.flightsOut':   'Flights KUL→BKI',
      'bd.flightsBack':  'Flights BKI→KUL',
      'share.btn':       'Share plan',
      'share.copied':    'Copied!',
      'links.book':      '↗ book',
      'links.verify':    '↗ verify',
      'rate.label':      'Rate / night',
      'rate.rm':         'RM',
      'rate.perSuffix':  '/nt',
      'reset.btn':       'Reset to defaults',
      'print.btn':       'Print plan',
      'method.weather':  '<b style="color:var(--ink)">Weather &amp; packing.</b> July in KL &amp; Kota Kinabalu: hot (28–33°C), humid, short afternoon downpours; Sabah seas are usually calm — good for island hopping. Pack: linen/cotton, swimwear &amp; reef-safe sunscreen, rain shell, insect repellent, walking shoes, Type-G adapter.',
      'method.alphaGap':    'the {n} gap is your alpha',
      'method.underCore':   'you are {n} under core',
      'method.bothLead':    'Both your picks are the current AHP leaders.',
      'method.leadersAre':  'Right now the AHP leaders are <span style="color:var(--kl)">{kl}</span> ({kls}) in KL and <span style="color:var(--pg)">{pg}</span> ({pgs}) in KK.',
      'sec.details':        'Trip details & essentials',
      'details.sub':        'Flights, transport, stays, dining, experiences & know-before-you-go.',
      'detail.flights':     'Flights',
      'detail.transport':   'Ground transport',
      'detail.stays':       'Stays',
      'detail.dining':      'Dining',
      'detail.experiences': 'Experiences',
      'detail.essentials':  'Know before you go',
      'detail.packing':     'Packing list',
      'detail.checklist':   'Pre-trip checklist',
      'day.morning':        'Morning',
      'day.afternoon':      'Afternoon',
      'day.evening':        'Evening',
      'day.meals':          'Meals',
      'day.breakfast':      'Breakfast',
      'day.lunch':          'Lunch',
      'day.dinner':         'Dinner',
      'day.flight':         'Flight',
      'day.transport':      'Transport',
      'day.tips':           'Tips',
      'day.cost':           'Est. cost',
      'day.toggleShow':     'Show details',
      'day.toggleHide':     'Hide details',
      'stays.guests':       '2 guests',
      'stays.nights':       '{n} nights',
      'flight.route':       'Route',
      'flight.airline':     'Airline',
      'flight.terminal':    'Terminal',
      'flight.duration':    'Duration',
      'flight.cost':        'Cost',
    },

    zh: {
      'app.title':        '吉隆坡 × 亚庇 · 奢华行程控制台',
      'header.eyebrow':   'AHP 奢华决策台 · 吉隆坡 × 亚庇 · 7月16–25',
      'city.kl':          '吉隆坡',
      'city.pg':          '亚庇',
      'meta.window':      '时间窗口',
      'meta.windowVal':   '7月16 → 25',
      'meta.budget':      '预算 · 2 人',

      'sec.console':      '预算控制台',
      'console.sub':      '为每座城市选一家酒店，并分配晚数。',
      'ctrl.split':       '晚数分配',
      'marks.moreKL':     '吉隆坡更多',
      'marks.total7':     '7 晚 · 8 天',
      'marks.morePG':     '亚庇更多',
      'ctrl.klHotel':     '吉隆坡酒店',
      'ctrl.pgHotel':     '亚庇酒店',
      'ctrl.itinerary':   '行程 · 餐饮 · 当地',
      'readout.used':     '预算使用',
      'readout.total':    '行程总计',

      'sec.itin':         '行程',
      'itin.sub':         '共 8 天 —— 7 晚住宿 + 1 天同游。随晚数分配自动重排。<span style="color:var(--kl)">琥珀 = 吉隆坡</span> · <span style="color:var(--pg)">青色 = 亚庇</span> · <span style="color:var(--red)">红色 = 一起度过，随后分别</span>',

      'sec.ahpKL':        'AHP — 吉隆坡',
      'ahpKL.sub':        '条形长度 = 加权得分（0–10）。分段显示<em>原因</em>。',
      'sec.ahpPG':        'AHP — 亚庇',
      'ahpPG.sub':        '权重相同。岛屿度假村豪华领先，但在地段与性价比失分 — 见说明。',

      'sec.method':       '方法与注意事项',
      'method.h3':        '奢华倾向权重 · 成对比较 AHP · CR = 0.004（一致）',
      'method.p1':        '<b style="color:var(--ink)">核心 + alpha。</b>{coreSrc} 核心预算（≈ {core}）大约只够一家旗舰酒店，而非两家。你的选择 —— <span style="color:var(--kl)">{klPick}</span>（RM{klRate}/晚）+ <span style="color:var(--pg)">{pgPick}</span>（RM{pgRate}/晚）—— 两人 {nights} 晚 / {days} 天全包约 {total}；{alphaClause}。{leaderNote} 若想极致挥霍，<span style="color:var(--kl)">{klSplurge}</span>（约 RM{klSplurgeRate}）是此处吉隆坡最高价位 —— 会让吉隆坡房费提高约 {splurgePct}%。',
      'method.p2':        '<b style="color:var(--ink)">海岛、海滩还是城市？</b>你的权重设定性价比 {wV}、地段 {wLo}、豪华 {wL}。据此 <span style="color:var(--pg)">{pgWin}</span> 以 {pgWinScore} 领跑亚庇，<span style="color:var(--pg)">{pgRunner}</span>（{pgRunnerScore}）紧随其后。仅限船只抵达的度假村（加雅岛、Bunga Raya）在纯豪华上略胜，却在地段与性价比失分；丹绒亚路是唯一既真正临海、又距市区与机场约 15 分钟的选择。',
      'method.p3':        '<b>事实核查标记：</b>加雅岛与 Bunga Raya 仅能从 Jesselton Point 乘船抵达（约 15–20 分钟）—— 不接受步入或夜间抵达。Nexus Karambunai 距市区约 45 分钟，基本是“足不出村”型。Park Hyatt 位于 Merdeka 118（非 KLCC），约 RM1,600 会击穿预算。市区酒店（Hyatt Centric、艾美、希尔顿）有屋顶泳池但没有可下水的海滩。',
      'pill.flights':     '吉隆坡↔亚庇航班 ~2h 45m',
      'pill.rates':       '费率 = 约值，2026年7月',
      'method.disclaim':  '每晚房价为 2026 年 7 月的代表性估算（2026 年 6 月查自 Booking / Agoda / KAYAK / 官网），随日期/供应情况变动 — 预订时请确认。「性价比」一项直接由价格推导（性价比 = C ÷ 房价），因此修改房价会即时重算该酒店得分。评分 = Google，2026 年 6 月获取。调整权重，排序便会改变。',

      /* criteria */
      'crit.L':  '豪华',
      'crit.V':  '性价比',
      'crit.R':  '评价',
      'crit.Lo': '地段',
      'crit.A':  '设施',

      /* dynamic (rendered) */
      'dyn.split':        '吉隆坡 {kl} · 亚庇 {pg}',
      'dyn.perNight':     'RM {n}/晚',
      'dyn.perDay':       'RM {n}/天',
      'dyn.spare':        '富余 RM {n}',
      'dyn.over':         'RM {n} 超出预算',
      'verdict.over':     '旗舰级奢华 — 超出部分即你的 alpha。两家五星酒店本就如此。',
      'verdict.thin':     '正好贴近核心预算 — 几乎不需 alpha。',
      'verdict.comfy':    '宽裕 — 核心预算内仍有余地安排一顿精致晚餐。',
      'verdict.slack':    '核心预算余裕充足 — 可升级档次或增加一项体验。',
      'bd.flights':       '机票 吉隆坡↔亚庇',
      'bd.food':          '餐饮 · Grab · 景点',
      'bd.nightsCalc':    'RM{rate} × {n}晚',
      'bd.flightsCalc':   '2 人，估算',
      'bd.foodCalc':      '~RM{perDay}/天 · {pax}人 × {n}天',
      'dyn.night':        '第 {n} 晚',
      'dyn.day':          '第 {n} 天',
      'dyn.cityKL':       '吉隆坡',
      'dyn.cityPG':       '亚庇',
      'dyn.cityDepart':   '同游 → 分别',
      'dyn.flyFlag':      '✈ 今早飞 吉隆坡 → 亚庇',
      'dyn.flyBack':      '✈ 飞 亚庇 → 吉隆坡',
      'dyn.pick':         '你的选择',
      /* new — phase 1 */
      'budget.group':    '你们的预算',
      'budget.you':      '凯鲁',
      'budget.junxi':    '君熙',
      'budget.totalLine': '= 总预算 RM {n}',
      'flights.group':   '机票',
      'flights.out':     '吉隆坡 → 亚庇',
      'flights.back':    '亚庇 → 吉隆坡',
      'bd.flightsOut':   '机票 吉隆坡→亚庇',
      'bd.flightsBack':  '机票 亚庇→吉隆坡',
      'share.btn':       '分享方案',
      'share.copied':    '已复制！',
      'links.book':      '↗ 预订',
      'links.verify':    '↗ 验证票价',
      'rate.label':      '房价 / 晚',
      'rate.rm':         'RM',
      'rate.perSuffix':  '/晚',
      'reset.btn':       '恢复默认设置',
      'print.btn':       '打印方案',
      'method.weather':  '<b style="color:var(--ink)">天气与打包。</b>七月吉隆坡与亚庇：炎热 (28–33°C)、潮湿、午后短时阵雨；沙巴海面通常平静 —— 适合跳岛。携带：棉麻衣物、泳装与珊瑚友好防晒霜、防雨外套、驱蚊剂、步行鞋、Type-G 转换插头。',
      'method.alphaGap':    '约 {n} 的差额即你的 alpha',
      'method.underCore':   '你比核心预算还省 {n}',
      'method.bothLead':    '你的两项选择正是当前 AHP 冠军。',
      'method.leadersAre':  '当前 AHP 冠军为吉隆坡 <span style="color:var(--kl)">{kl}</span>（{kls}）与亚庇 <span style="color:var(--pg)">{pg}</span>（{pgs}）。',
      'sec.details':        '行程详情与须知',
      'details.sub':        '航班、交通、住宿、餐饮、体验与出行须知。',
      'detail.flights':     '航班',
      'detail.transport':   '地面交通',
      'detail.stays':       '住宿',
      'detail.dining':      '餐饮',
      'detail.experiences': '体验',
      'detail.essentials':  '出行须知',
      'detail.packing':     '行李清单',
      'detail.checklist':   '行前清单',
      'day.morning':        '上午',
      'day.afternoon':      '下午',
      'day.evening':        '晚间',
      'day.meals':          '餐食',
      'day.breakfast':      '早餐',
      'day.lunch':          '午餐',
      'day.dinner':         '晚餐',
      'day.flight':         '航班',
      'day.transport':      '交通',
      'day.tips':           '提示',
      'day.cost':           '预估花费',
      'day.toggleShow':     '展开详情',
      'day.toggleHide':     '收起详情',
      'stays.guests':       '2 位住客',
      'stays.nights':       '{n} 晚',
      'flight.route':       '航线',
      'flight.airline':     '航空',
      'flight.terminal':    '航站楼',
      'flight.duration':    '时长',
      'flight.cost':        '费用',
    },
  };

  const STORE_KEY = 'trip-lang';
  let lang = 'en';

  function read(key){
    const table = DICT[lang] || DICT.en;
    return (key in table) ? table[key]
         : (key in DICT.en) ? DICT.en[key]
         : key;
  }

  /* translate a UI key, interpolating {token} params */
  function t(key, params){
    let s = read(key);
    if(params){
      for(const p in params){
        s = s.split('{' + p + '}').join(params[p]);
      }
    }
    return s;
  }

  /* pick the active-language string from a { en, zh } data field */
  function L(field){
    if(field == null) return '';
    if(typeof field === 'string') return field;
    return (field[lang] != null) ? field[lang] : field.en;
  }

  function persist(){ try{ localStorage.setItem(STORE_KEY, lang); }catch(e){} }
  function htmlLang(){ document.documentElement.lang = (lang === 'zh') ? 'zh-CN' : 'en'; }

  /* fill the static DOM, the title, the toggle button, then re-render */
  function apply(){
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    document.title = t('app.title');

    const btn = document.getElementById('langBtn');
    if(btn){
      btn.querySelector('.next').textContent = (lang === 'en') ? '中文' : 'EN';
      btn.setAttribute('aria-label', (lang === 'en') ? 'Switch to Chinese · 切换到中文' : 'Switch to English · 切换到英文');
    }

    if(typeof renderAll === 'function') renderAll();
  }

  function set(next){
    lang = (next === 'zh') ? 'zh' : 'en';
    persist(); htmlLang(); apply();
  }
  function toggle(){ set(lang === 'en' ? 'zh' : 'en'); }

  /* read the persisted choice once, before first render */
  function initLang(){
    let saved = null;
    try{ saved = localStorage.getItem(STORE_KEY); }catch(e){}
    lang = (saved === 'zh') ? 'zh' : 'en';
    htmlLang();
  }

  function get(){ return lang; }

  return { t, L, set, toggle, apply, initLang, get };
})();

/* convenience globals used across render.js */
const t = (k, p) => I18N.t(k, p);
const L = (f) => I18N.L(f);
