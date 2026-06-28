/* ============================================================
   main.js — app state, event wiring, bootstrap
   ============================================================ */

/* ---------- state ---------- */
let st = { split: 4, kl: 'traders', pg: 'edison', daily: 250 };

/* ---------- DOM refs ---------- */
const klSel = document.getElementById('klSel');
const pgSel = document.getElementById('pgSel');

/* ---------- bootstrap ---------- */
function init(){
  I18N.initLang();                 // restore saved language before first paint

  fillSel(klSel, KL, st.kl);
  fillSel(pgSel, PG, st.pg);

  document.getElementById('split').addEventListener('input', e => {
    st.split = +e.target.value; renderBudget(); renderItin();
  });
  document.getElementById('daily').addEventListener('input', e => {
    st.daily = +e.target.value; renderBudget();
  });
  klSel.addEventListener('change', e => { st.kl = e.target.value; renderBudget(); renderAHP(); });
  pgSel.addEventListener('change', e => { st.pg = e.target.value; renderBudget(); renderAHP(); });

  document.getElementById('langBtn').addEventListener('click', () => I18N.toggle());

  I18N.apply();                    // fills static text + title + button, then renderAll()
}

init();
