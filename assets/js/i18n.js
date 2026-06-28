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
      'app.title':        'KL × Penang — Trip Console',
      'header.eyebrow':   'AHP decision console · 2 cities · 7 nights',
      'city.kl':          'Kuala Lumpur',
      'city.pg':          'Penang',
      'meta.window':      'Window',
      'meta.windowVal':   'Jul 16 → 23',
      'meta.budget':      'Budget · 2 pax',

      'sec.console':      'Budget console',
      'console.sub':      'Pick a hotel per city + split the nights.<br>The gauge redlines if the plan exceeds RM 5,824.',
      'ctrl.split':       'Night split',
      'marks.moreKL':     'more KL',
      'marks.total7':     '7 nights total',
      'marks.morePG':     'more Penang',
      'ctrl.klHotel':     'Kuala Lumpur hotel',
      'ctrl.pgHotel':     'Penang hotel',
      'ctrl.daily':       'Daily spend · food + Grab + sights',
      'marks.lean':       'lean',
      'marks.perDay':     'both of you, per day',
      'marks.lavish':     'lavish',
      'readout.used':     'Budget used',
      'readout.total':    'Trip total',

      'sec.itin':         'Itinerary',
      'itin.sub':         'Re-flows with the night split. <span style="color:var(--kl)">amber = KL</span> · <span style="color:var(--pg)">teal = Penang</span>',

      'sec.ahpKL':        'AHP — Kuala Lumpur',
      'ahpKL.sub':        'Bar length = weighted score (0–10). Segments show <em>why</em>.',
      'sec.ahpPG':        'AHP — Penang',
      'ahpPG.sub':        'Same weights. Beach resorts take the Location hit — see note.',

      'sec.method':       'Method & caveats',
      'method.h3':        'Criteria weights · pairwise AHP · CR = 0.016 (consistent)',
      'method.p1':        '<b style="color:var(--ink)">Coupled-budget rule.</b> The two AHP winners (Mandarin Oriental + The Edison) overshoot ~RM700 at 4/3 nights. Feasible flagship pairing: <span style="color:var(--kl)">Traders KL</span> (AHP #3, best Petronas view) + <span style="color:var(--pg)">The Edison</span> = ~RM5,730. Or keep MO and drop to 3 KL nights.',
      'method.p2':        '<b style="color:var(--ink)">City vs beach.</b> Location weight (0.14) favours Georgetown boutiques. Want a beach half? Mentally zero Location → <span style="color:var(--pg)">Rasa Sayang</span> leads on Luxury + Amenities.',
      'method.p3':        '<b>Factcheck flags:</b> Park Hyatt = Merdeka 118 (not CBD), budget-breaking at ~RM1,300. Ritz "Michelin-starred" → Li Yen is Michelin <em>Selected</em>, not starred. Majestic / Stripes sit off the tourist core. E&O recent service inconsistency; Rasa Sayang dated + golf/shuttle suspended; Lone Pine now 4.1★.',
      'pill.flights':     'flights KUL↔PEN ~1h',
      'pill.rates':       'rates = approx, Jul 2026',
      'method.disclaim':  'Hotel rates are mid-range estimates and move with dates/availability — confirm at booking. Ratings = Google, fetched Jun 2026. Scores reflect a defensible default weighting; adjust the weights and the order shifts.',

      /* criteria */
      'crit.L':  'Luxury',
      'crit.V':  'Value',
      'crit.R':  'Reviews',
      'crit.Lo': 'Location',
      'crit.A':  'Amenities',

      /* dynamic (rendered) */
      'dyn.split':        '{kl} KL · {pg} Penang',
      'dyn.perNight':     'RM {n}/nt',
      'dyn.perDay':       'RM {n}/day',
      'dyn.spare':        'RM {n} to spare',
      'dyn.over':         'RM {n} over',
      'verdict.over':     'Over budget — trim a night, drop daily spend, or pick a cheaper base.',
      'verdict.thin':     'Fits, but thin — little room for a big splurge meal.',
      'verdict.comfy':    'Comfortable. Headroom for a fine-dining night.',
      'verdict.slack':    'Lots of slack — upgrade a hotel tier or add an experience.',
      'bd.flights':       'Flights KUL↔PEN',
      'bd.food':          'Food · Grab · sights',
      'bd.nightsCalc':    'RM{rate} × {n}nt',
      'bd.flightsCalc':   '2 pax, est',
      'bd.foodCalc':      'RM{daily} × 7d',
      'dyn.night':        'Night {n}',
      'dyn.cityKL':       'KL',
      'dyn.cityPG':       'Penang',
      'dyn.flyFlag':      '✈ fly KUL → PEN this morning',
      'dyn.depart':       '✈ <span><b>Jul 23 · departure</b> — check out, fly home from Penang (open-jaw) or hop back to KUL.</span>',
      'dyn.pick':         'your pick',
    },

    zh: {
      'app.title':        '吉隆坡 × 槟城 · 行程控制台',
      'header.eyebrow':   'AHP 决策控制台 · 2 座城市 · 7 晚',
      'city.kl':          '吉隆坡',
      'city.pg':          '槟城',
      'meta.window':      '时间窗口',
      'meta.windowVal':   '7月16 → 23',
      'meta.budget':      '预算 · 2 人',

      'sec.console':      '预算控制台',
      'console.sub':      '为每座城市选一家酒店，并分配晚数。<br>若方案超过 RM 5,824，仪表将转入红区。',
      'ctrl.split':       '晚数分配',
      'marks.moreKL':     '吉隆坡更多',
      'marks.total7':     '共 7 晚',
      'marks.morePG':     '槟城更多',
      'ctrl.klHotel':     '吉隆坡酒店',
      'ctrl.pgHotel':     '槟城酒店',
      'ctrl.daily':       '每日花费 · 餐饮 + Grab + 景点',
      'marks.lean':       '精简',
      'marks.perDay':     '两人每日合计',
      'marks.lavish':     '奢华',
      'readout.used':     '预算使用',
      'readout.total':    '行程总计',

      'sec.itin':         '行程',
      'itin.sub':         '随晚数分配自动重排。<span style="color:var(--kl)">琥珀 = 吉隆坡</span> · <span style="color:var(--pg)">青色 = 槟城</span>',

      'sec.ahpKL':        'AHP — 吉隆坡',
      'ahpKL.sub':        '条形长度 = 加权得分（0–10）。分段显示<em>原因</em>。',
      'sec.ahpPG':        'AHP — 槟城',
      'ahpPG.sub':        '权重相同。海滩度假村在地段上失分 — 见说明。',

      'sec.method':       '方法与注意事项',
      'method.h3':        '标准权重 · 成对比较 AHP · CR = 0.016（一致）',
      'method.p1':        '<b style="color:var(--ink)">预算耦合规则。</b>两个 AHP 冠军（文华东方 + The Edison）在 4/3 晚下超支约 RM700。可行的旗舰组合：<span style="color:var(--kl)">Traders KL</span>（AHP 第 3，双子塔最佳视野）+ <span style="color:var(--pg)">The Edison</span> = 约 RM5,730。或保留文华东方，把吉隆坡减至 3 晚。',
      'method.p2':        '<b style="color:var(--ink)">城市还是海滩。</b>地段权重（0.14）偏向乔治市精品店。想要海滩那一半？把地段心算归零 → <span style="color:var(--pg)">Rasa Sayang</span> 在豪华与设施上领先。',
      'method.p3':        '<b>事实核查标记：</b>Park Hyatt = Merdeka 118（非市中心），约 RM1,300 会击穿预算。Ritz “米其林星级” → Li Yen 实为米其林<em>入选</em>，并非星级。Majestic / Stripes 位于游客核心区之外。E&O 近期服务不稳定；Rasa Sayang 装潢老旧、高尔夫/接驳暂停；Lone Pine 现为 4.1★。',
      'pill.flights':     '吉隆坡↔槟城航班 ~1h',
      'pill.rates':       '费率 = 约值，2026年7月',
      'method.disclaim':  '酒店价格为中档估算，随日期/供应情况变动 — 预订时请确认。评分 = Google，2026年6月获取。得分反映一套合理的默认权重；调整权重，排序便会改变。',

      /* criteria */
      'crit.L':  '豪华',
      'crit.V':  '性价比',
      'crit.R':  '评价',
      'crit.Lo': '地段',
      'crit.A':  '设施',

      /* dynamic (rendered) */
      'dyn.split':        '吉隆坡 {kl} · 槟城 {pg}',
      'dyn.perNight':     'RM {n}/晚',
      'dyn.perDay':       'RM {n}/天',
      'dyn.spare':        '富余 RM {n}',
      'dyn.over':         '超出 RM {n}',
      'verdict.over':     '超出预算 — 减少一晚、降低每日花费，或选更经济的住宿。',
      'verdict.thin':     '勉强够 — 没什么空间安排一顿大餐。',
      'verdict.comfy':    '宽裕。有余地安排一顿精致晚餐。',
      'verdict.slack':    '余裕充足 — 可升级酒店档次或增加一项体验。',
      'bd.flights':       '机票 吉隆坡↔槟城',
      'bd.food':          '餐饮 · Grab · 景点',
      'bd.nightsCalc':    'RM{rate} × {n}晚',
      'bd.flightsCalc':   '2 人，估算',
      'bd.foodCalc':      'RM{daily} × 7天',
      'dyn.night':        '第 {n} 晚',
      'dyn.cityKL':       '吉隆坡',
      'dyn.cityPG':       '槟城',
      'dyn.flyFlag':      '✈ 今早飞 吉隆坡 → 槟城',
      'dyn.depart':       '✈ <span><b>7月23 · 离程</b> — 退房，从槟城直飞回家（开口程），或先返回吉隆坡。</span>',
      'dyn.pick':         '你的选择',
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
