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
      'app.title':        'KL × Kota Kinabalu — Booked Trip Console',
      'header.eyebrow':   'Booked itinerary · KL × Kota Kinabalu · Jul 16–25, 2026',
      'city.kl':          'Kuala Lumpur',
      'city.pg':          'Kota Kinabalu',
      'meta.window':      'Window',
      'meta.windowVal':   'Jul 16 → 25',
      'meta.budget':      'Trip fund · 2 pax',

      'sec.console':      'Budget & payments',
      'console.sub':      'Prepaid bookings are actual amounts paid; on-trip spending and day costs are predictions.',
      'fund.title':       'Trip fund',
      'fund.total':       '= RM {n} pooled',
      'pay.prepaid':      'Prepaid bookings (paid)',
      'pay.ontrip':       'On-trip spending (predicted)',
      'pay.status':       'RM {paid} settled · RM {left} still to spend',
      'readout.used':     'Fund used',
      'readout.total':    'Trip total',
      'dyn.spare':        'RM {n} buffer left',
      'dyn.over':         'RM {n} over the fund',
      'verdict.ok':       'Fully booked and inside the pooled fund — RM buffer intact; Jul 23–25 runs on separate plans.',
      'verdict.over':     'Planned spend exceeds the pooled fund — trim the on-trip categories.',

      'sec.itin':         'Itinerary',
      'itin.sub':         '7 days together · Jul 16–22 · booked. Jul 23–25 (Le Méridien PJ) runs on separate plans. <span style="color:var(--kl)">amber = KL / PJ</span> · <span style="color:var(--pg)">teal = Kota Kinabalu</span>',

      'sec.details':      'Trip details & essentials',
      'details.sub':      'Flights, transfers, stays, dining, experiences & know-before-you-go — everything confirmed.',
      'detail.flights':     'Flights',
      'detail.transport':   'Transfers & ground',
      'detail.stays':       'Stays',
      'detail.dining':      'Dining',
      'detail.experiences': 'Experiences',
      'detail.essentials':  'Know before you go',
      'detail.packing':     'Packing list',
      'detail.checklist':   'Checklist',
      'day.flight':         'Flight',
      'day.tips':           'Tips',
      'day.cost':           'Est. day cost',
      'day.toggleShow':     'Show details',
      'day.toggleHide':     'Hide details',
      'dyn.day':            'Day {n}',
      'dyn.cityKL':         'KL',
      'dyn.cityPG':         'Kota Kinabalu',
      'dyn.cityDepart':     'Depart',
      'chip.booked':        'booked ✓',

      'flight.route':       'Route',
      'flight.airline':     'Flight',
      'flight.time':        'Time',
      'flight.ref':         'Ref',

      'share.btn':       'Share plan',
      'share.copied':    'Copied!',
      'print.btn':       'Print plan',
    },

    zh: {
      'app.title':        '吉隆坡 × 亚庇 · 已订行程控制台',
      'header.eyebrow':   '已订行程 · 吉隆坡 × 亚庇 · 2026年7月16–25',
      'city.kl':          '吉隆坡',
      'city.pg':          '亚庇',
      'meta.window':      '时间窗口',
      'meta.windowVal':   '7月16 → 25',
      'meta.budget':      '旅行资金 · 2 人',

      'sec.console':      '预算与付款',
      'console.sub':      '已预付订单为实际支付金额；行程内开销与当日花费为预估。',
      'fund.title':       '旅行资金',
      'fund.total':       '= 共 RM {n}',
      'pay.prepaid':      '已预付订单（实付）',
      'pay.ontrip':       '行程内开销（预估）',
      'pay.status':       '已结清 RM {paid} · 待支出 RM {left}',
      'readout.used':     '资金使用',
      'readout.total':    '行程总计',
      'dyn.spare':        '剩余富余 RM {n}',
      'dyn.over':         '超出资金 RM {n}',
      'verdict.ok':       '全部订妥且在共同资金之内 —— 富余保留；7月23–25 另行安排。',
      'verdict.over':     '计划支出超出共同资金 —— 请压缩行程内开销。',

      'sec.itin':         '行程',
      'itin.sub':         '同游 7 天 · 7月16–22 · 已预订。7月23–25（艾美）另行安排。<span style="color:var(--kl)">琥珀 = 吉隆坡 / 八打灵</span> · <span style="color:var(--pg)">青色 = 亚庇</span>',

      'sec.details':      '行程详情与须知',
      'details.sub':      '航班、接送、住宿、餐饮、体验与出行须知 —— 全部已确认。',
      'detail.flights':     '航班',
      'detail.transport':   '接送与交通',
      'detail.stays':       '住宿',
      'detail.dining':      '餐饮',
      'detail.experiences': '体验',
      'detail.essentials':  '出行须知',
      'detail.packing':     '行李清单',
      'detail.checklist':   '清单',
      'day.flight':         '航班',
      'day.tips':           '提示',
      'day.cost':           '预估当日花费',
      'day.toggleShow':     '展开详情',
      'day.toggleHide':     '收起详情',
      'dyn.day':            '第 {n} 天',
      'dyn.cityKL':         '吉隆坡',
      'dyn.cityPG':         '亚庇',
      'dyn.cityDepart':     '回程',
      'chip.booked':        '已订 ✓',

      'flight.route':       '航线',
      'flight.airline':     '航班',
      'flight.time':        '时间',
      'flight.ref':         '备注',

      'share.btn':       '分享方案',
      'share.copied':    '已复制！',
      'print.btn':       '打印方案',
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
