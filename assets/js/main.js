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

  renderAll();
}

init();
