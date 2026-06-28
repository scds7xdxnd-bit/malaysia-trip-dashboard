/* ============================================================
   data.js — trip constants, criteria, hotels, itinerary plans

   Translatable free-text fields (hotel `area`, itinerary plans, dates)
   are stored as { en, zh } pairs; read them through I18N.L() so the
   active language is picked automatically. Proper nouns (hotel brand
   names, currency, ratings) stay language-neutral.
   ============================================================ */

/* ---------- budget constants ---------- */
const BUDGET = 5824;   // RM, 2 pax (2,000,000 KRW + RM 500)
const FLIGHTS = 300;   // RM, KUL <-> PEN, 2 pax estimate
const NIGHTS = 7;

/* ---------- AHP criteria (weights sum to 1.0) ----------
   Names are resolved at render time via t('crit.' + key).          */
const CRIT = [
  {key:'L',  w:0.35,  c:'var(--c-lux)'},
  {key:'V',  w:0.21,  c:'var(--c-val)'},
  {key:'R',  w:0.185, c:'var(--c-rev)'},
  {key:'Lo', w:0.14,  c:'var(--c-loc)'},
  {key:'A',  w:0.11,  c:'var(--c-amen)'},
];

/* weighted segments per hotel already = weight×raw, summing to score */
const KL = [
  {k:'mo',   name:'Mandarin Oriental', area:{en:'KLCC · at the Petronas Towers',  zh:'KLCC · 紧邻双子塔'},       rate:675, star:4.6, score:8.94, seg:{L:3.15,V:1.68,R:1.665,Lo:1.40,A:1.045}},
  {k:'banyan',name:'Banyan Tree',      area:{en:'Jln Conlay · sky-high resort',   zh:'Jln Conlay · 高空度假村'},  rate:725, star:4.7, score:8.66, seg:{L:3.15,V:1.575,R:1.7575,Lo:1.19,A:0.99}},
  {k:'traders',name:'Traders',         area:{en:'KLCC · SkyBar · best tower view',zh:'KLCC · SkyBar · 双子塔最佳视野'},rate:475, star:4.5, score:8.02, seg:{L:2.275,V:1.89,R:1.5725,Lo:1.40,A:0.88}},
  {k:'ritz', name:'Ritz-Carlton',      area:{en:'Bukit Bintang · Starhill',       zh:'Bukit Bintang · 邻 Starhill'},rate:800, star:4.5, score:8.00, seg:{L:2.975,V:1.26,R:1.5725,Lo:1.26,A:0.935}},
  {k:'jw',   name:'JW Marriott',       area:{en:'Bukit Bintang · Pavilion',       zh:'Bukit Bintang · 邻 Pavilion'},rate:575, star:4.5, score:7.96, seg:{L:2.625,V:1.68,R:1.5725,Lo:1.26,A:0.825}},
  {k:'westin',name:'The Westin',       area:{en:'Bukit Bintang · opp. Pavilion',  zh:'Bukit Bintang · Pavilion 对面'},rate:525, star:4.4, score:7.70, seg:{L:2.45,V:1.68,R:1.48,Lo:1.26,A:0.825}},
  {k:'majestic',name:'The Majestic',   area:{en:'Lake Gardens · heritage',        zh:'Lake Gardens · 古迹酒店'}, rate:625, star:4.4, score:7.40, seg:{L:2.80,V:1.47,R:1.48,Lo:0.77,A:0.88}},
  {k:'ph',   name:'Park Hyatt',        area:{en:'Merdeka 118 · floors 75–115',    zh:'Merdeka 118 · 75–115 层'}, rate:1300,star:4.4, score:7.34, seg:{L:3.50,V:0.42,R:1.48,Lo:0.84,A:1.10}},
  {k:'gm',   name:'Grand Millennium',  area:{en:'Bukit Bintang · older bldg',     zh:'Bukit Bintang · 楼龄较旧'},rate:400, star:4.5, score:7.33, seg:{L:2.10,V:1.68,R:1.5725,Lo:1.26,A:0.715}},
  {k:'ic',   name:'InterContinental',  area:{en:'Jln Ampang · dated decor',       zh:'Jln Ampang · 装潢偏旧'},   rate:525, star:4.4, score:6.98, seg:{L:2.275,V:1.47,R:1.48,Lo:0.98,A:0.77}},
  {k:'stripes',name:'Hotel Stripes',   area:{en:'Chow Kit · off-core boutique',   zh:'Chow Kit · 非核心精品店'}, rate:430, star:4.3, score:6.67, seg:{L:2.275,V:1.47,R:1.3875,Lo:0.77,A:0.77}},
];

const PG = [
  {k:'edison',name:'The Edison George Town', area:{en:'Georgetown core · heritage', zh:'乔治市核心 · 古迹'},     rate:600, star:4.7, score:8.67, seg:{L:2.975,V:1.785,R:1.7575,Lo:1.33,A:0.825}},
  {k:'prestige',name:'The Prestige',         area:{en:'Georgetown · design hotel',  zh:'乔治市 · 设计酒店'},     rate:480, star:4.6, score:8.50, seg:{L:2.80,V:1.89,R:1.665,Lo:1.26,A:0.88}},
  {k:'eo',   name:'Eastern & Oriental',      area:{en:'Georgetown seafront · icon', zh:'乔治市海滨 · 地标'},     rate:700, star:4.5, score:8.30, seg:{L:3.15,V:1.47,R:1.48,Lo:1.26,A:0.935}},
  {k:'mac',  name:'Macalister Mansion',      area:{en:'Macalister Rd · 8-room',     zh:'Macalister 路 · 8 间客房'},rate:850, star:4.5, score:8.00, seg:{L:3.15,V:1.26,R:1.5725,Lo:1.19,A:0.825}},
  {k:'seven',name:'Seven Terraces',          area:{en:'Georgetown core · Peranakan',zh:'乔治市核心 · 娘惹风'},   rate:650, star:4.6, score:7.94, seg:{L:2.80,V:1.47,R:1.5725,Lo:1.33,A:0.77}},
  {k:'rasa', name:'Shangri-La Rasa Sayang',  area:{en:'Batu Ferringhi · beach',     zh:'Batu Ferringhi · 海滩'}, rate:750, star:4.6, score:7.75, seg:{L:2.975,V:1.365,R:1.665,Lo:0.70,A:1.045}},
  {k:'pr',   name:'PARKROYAL Resort',        area:{en:'Batu Ferringhi · beach',     zh:'Batu Ferringhi · 海滩'}, rate:520, star:4.5, score:7.50, seg:{L:2.45,V:1.785,R:1.5725,Lo:0.70,A:0.99}},
  {k:'angsana',name:'Angsana Teluk Bahang',  area:{en:'Teluk Bahang · far beach',   zh:'Teluk Bahang · 较远海滩'},rate:550, star:4.5, score:7.37, seg:{L:2.625,V:1.68,R:1.5725,Lo:0.56,A:0.935}},
  {k:'g',    name:'G Hotel Gurney',          area:{en:'Gurney Dr · mall-linked',    zh:'Gurney Dr · 连通商场'},  rate:450, star:4.4, score:7.24, seg:{L:2.275,V:1.68,R:1.48,Lo:0.98,A:0.825}},
  {k:'lone', name:'Lone Pine',               area:{en:'Batu Ferringhi · beach',     zh:'Batu Ferringhi · 海滩'}, rate:520, star:4.1, score:6.90, seg:{L:2.45,V:1.575,R:1.295,Lo:0.70,A:0.88}},
];

/* ---------- itinerary plans ---------- */
const KL_PLAN = [
  {en:'Petronas Twin Towers + KLCC Park. Sunset at SkyBar / Vertigo, dinner Bukit Bintang.',
   zh:'双子塔 + KLCC 公园。SkyBar / Vertigo 看日落，Bukit Bintang 晚餐。'},
  {en:'Bukit Bintang + Pavilion + Jalan Alor street food. Menara KL deck after dark.',
   zh:'Bukit Bintang + Pavilion + 亚罗街美食。入夜登 Menara KL 观景台。'},
  {en:'Batu Caves at dawn, Thean Hou Temple, then Merdeka Square + Central Market heritage.',
   zh:'清晨黑风洞，天后宫，再到独立广场 + 中央艺术坊古迹区。'},
  {en:'Slow morning + hotel pool/spa. Merdeka 118 view deck, Chinatown (Petaling St) crawl.',
   zh:'悠闲早晨 + 酒店泳池/水疗。Merdeka 118 观景台，茨厂街唐人街漫步。'},
  {en:'Day trip: Putrajaya mosques or Genting cable car. Farewell dinner KLCC.',
   zh:'一日游：布城清真寺或云顶缆车。KLCC 告别晚餐。'},
];
const PG_PLAN = [
  {en:'Georgetown UNESCO walk — Armenian St murals, Khoo Kongsi, Blue Mansion, Little India. Char kway teow.',
   zh:'乔治市世遗漫步 — 打铜仔街壁画、邱公司、蓝屋、小印度。炒粿条。'},
  {en:'Penang Hill funicular + Kek Lok Si temple. Gurney Drive hawker night.',
   zh:'升旗山缆车 + 极乐寺。Gurney Drive 夜市小吃。'},
  {en:'Batu Ferringhi beach + Tropical Spice Garden / ESCAPE. Sunset on the sand.',
   zh:'Batu Ferringhi 海滩 + 热带香料园 / ESCAPE。沙滩看日落。'},
  {en:'Cafés + Hin Bus Depot art, Chowrasta market, nasi kandar lunch, last shopping.',
   zh:'咖啡馆 + Hin Bus Depot 艺术空间、Chowrasta 巴刹、nasi kandar 午餐，最后采购。'},
];
const DATES = [
  {en:'Jul 16', zh:'7月16'}, {en:'Jul 17', zh:'7月17'}, {en:'Jul 18', zh:'7月18'},
  {en:'Jul 19', zh:'7月19'}, {en:'Jul 20', zh:'7月20'}, {en:'Jul 21', zh:'7月21'},
  {en:'Jul 22', zh:'7月22'},
];

/* ---------- helper ---------- */
const find = (arr, k) => arr.find(h => h.k === k);
