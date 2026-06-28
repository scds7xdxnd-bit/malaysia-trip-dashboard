/* ============================================================
   data.js — trip constants, criteria, hotels, itinerary plans
   Loaded as a classic script; everything here is shared globally.
   ============================================================ */

/* ---------- budget constants ---------- */
const BUDGET = 5824;   // RM, 2 pax (2,000,000 KRW + RM 500)
const FLIGHTS = 300;   // RM, KUL <-> PEN, 2 pax estimate
const NIGHTS = 7;

/* ---------- AHP criteria (weights sum to 1.0) ---------- */
const CRIT = [
  {key:'L',  name:'Luxury',    w:0.35,  c:'var(--c-lux)'},
  {key:'V',  name:'Value',     w:0.21,  c:'var(--c-val)'},
  {key:'R',  name:'Reviews',   w:0.185, c:'var(--c-rev)'},
  {key:'Lo', name:'Location',  w:0.14,  c:'var(--c-loc)'},
  {key:'A',  name:'Amenities', w:0.11,  c:'var(--c-amen)'},
];

/* weighted segments per hotel already = weight×raw, summing to score */
const KL = [
  {k:'mo',   name:'Mandarin Oriental', area:'KLCC · at the Petronas Towers', rate:675, star:4.6, score:8.94, seg:{L:3.15,V:1.68,R:1.665,Lo:1.40,A:1.045}},
  {k:'banyan',name:'Banyan Tree',      area:'Jln Conlay · sky-high resort',  rate:725, star:4.7, score:8.66, seg:{L:3.15,V:1.575,R:1.7575,Lo:1.19,A:0.99}},
  {k:'traders',name:'Traders',         area:'KLCC · SkyBar · best tower view',rate:475, star:4.5, score:8.02, seg:{L:2.275,V:1.89,R:1.5725,Lo:1.40,A:0.88}},
  {k:'ritz', name:'Ritz-Carlton',      area:'Bukit Bintang · Starhill',      rate:800, star:4.5, score:8.00, seg:{L:2.975,V:1.26,R:1.5725,Lo:1.26,A:0.935}},
  {k:'jw',   name:'JW Marriott',       area:'Bukit Bintang · Pavilion',      rate:575, star:4.5, score:7.96, seg:{L:2.625,V:1.68,R:1.5725,Lo:1.26,A:0.825}},
  {k:'westin',name:'The Westin',       area:'Bukit Bintang · opp. Pavilion', rate:525, star:4.4, score:7.70, seg:{L:2.45,V:1.68,R:1.48,Lo:1.26,A:0.825}},
  {k:'majestic',name:'The Majestic',   area:'Lake Gardens · heritage',       rate:625, star:4.4, score:7.40, seg:{L:2.80,V:1.47,R:1.48,Lo:0.77,A:0.88}},
  {k:'ph',   name:'Park Hyatt',        area:'Merdeka 118 · floors 75–115',   rate:1300,star:4.4, score:7.34, seg:{L:3.50,V:0.42,R:1.48,Lo:0.84,A:1.10}},
  {k:'gm',   name:'Grand Millennium',  area:'Bukit Bintang · older bldg',    rate:400, star:4.5, score:7.33, seg:{L:2.10,V:1.68,R:1.5725,Lo:1.26,A:0.715}},
  {k:'ic',   name:'InterContinental',  area:'Jln Ampang · dated decor',      rate:525, star:4.4, score:6.98, seg:{L:2.275,V:1.47,R:1.48,Lo:0.98,A:0.77}},
  {k:'stripes',name:'Hotel Stripes',   area:'Chow Kit · off-core boutique',  rate:430, star:4.3, score:6.67, seg:{L:2.275,V:1.47,R:1.3875,Lo:0.77,A:0.77}},
];

const PG = [
  {k:'edison',name:'The Edison George Town', area:'Georgetown core · heritage', rate:600, star:4.7, score:8.67, seg:{L:2.975,V:1.785,R:1.7575,Lo:1.33,A:0.825}},
  {k:'prestige',name:'The Prestige',         area:'Georgetown · design hotel',  rate:480, star:4.6, score:8.50, seg:{L:2.80,V:1.89,R:1.665,Lo:1.26,A:0.88}},
  {k:'eo',   name:'Eastern & Oriental',      area:'Georgetown seafront · icon', rate:700, star:4.5, score:8.30, seg:{L:3.15,V:1.47,R:1.48,Lo:1.26,A:0.935}},
  {k:'mac',  name:'Macalister Mansion',      area:'Macalister Rd · 8-room',     rate:850, star:4.5, score:8.00, seg:{L:3.15,V:1.26,R:1.5725,Lo:1.19,A:0.825}},
  {k:'seven',name:'Seven Terraces',          area:'Georgetown core · Peranakan',rate:650, star:4.6, score:7.94, seg:{L:2.80,V:1.47,R:1.5725,Lo:1.33,A:0.77}},
  {k:'rasa', name:'Shangri-La Rasa Sayang',  area:'Batu Ferringhi · beach',     rate:750, star:4.6, score:7.75, seg:{L:2.975,V:1.365,R:1.665,Lo:0.70,A:1.045}},
  {k:'pr',   name:'PARKROYAL Resort',        area:'Batu Ferringhi · beach',     rate:520, star:4.5, score:7.50, seg:{L:2.45,V:1.785,R:1.5725,Lo:0.70,A:0.99}},
  {k:'angsana',name:'Angsana Teluk Bahang',  area:'Teluk Bahang · far beach',   rate:550, star:4.5, score:7.37, seg:{L:2.625,V:1.68,R:1.5725,Lo:0.56,A:0.935}},
  {k:'g',    name:'G Hotel Gurney',          area:'Gurney Dr · mall-linked',    rate:450, star:4.4, score:7.24, seg:{L:2.275,V:1.68,R:1.48,Lo:0.98,A:0.825}},
  {k:'lone', name:'Lone Pine',               area:'Batu Ferringhi · beach',     rate:520, star:4.1, score:6.90, seg:{L:2.45,V:1.575,R:1.295,Lo:0.70,A:0.88}},
];

/* ---------- itinerary plans ---------- */
const KL_PLAN = [
  'Petronas Twin Towers + KLCC Park. Sunset at SkyBar / Vertigo, dinner Bukit Bintang.',
  'Bukit Bintang + Pavilion + Jalan Alor street food. Menara KL deck after dark.',
  'Batu Caves at dawn, Thean Hou Temple, then Merdeka Square + Central Market heritage.',
  'Slow morning + hotel pool/spa. Merdeka 118 view deck, Chinatown (Petaling St) crawl.',
  'Day trip: Putrajaya mosques or Genting cable car. Farewell dinner KLCC.',
];
const PG_PLAN = [
  'Georgetown UNESCO walk — Armenian St murals, Khoo Kongsi, Blue Mansion, Little India. Char kway teow.',
  'Penang Hill funicular + Kek Lok Si temple. Gurney Drive hawker night.',
  'Batu Ferringhi beach + Tropical Spice Garden / ESCAPE. Sunset on the sand.',
  'Cafés + Hin Bus Depot art, Chowrasta market, nasi kandar lunch, last shopping.',
];
const DATES = ['Jul 16','Jul 17','Jul 18','Jul 19','Jul 20','Jul 21','Jul 22'];

/* ---------- helper ---------- */
const find = (arr, k) => arr.find(h => h.k === k);
