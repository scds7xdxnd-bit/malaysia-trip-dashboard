/* ============================================================
   data.js — trip constants, criteria, hotels, itinerary plans

   Translatable free-text fields (hotel `area`, itinerary plans, dates)
   are stored as { en, zh } pairs; read them through I18N.L() so the
   active language is picked automatically. Proper nouns (hotel brand
   names, currency, ratings) stay language-neutral.

   NOTE: the second-city slot keeps its legacy `PG` / `pg` / `--pg`
   (teal) identifiers throughout the codebase, but now holds
   KOTA KINABALU. Only data + user-facing copy changed.
   ============================================================ */

/* ---------- budget constants ---------- */
const BUDGET = 6600;   // RM, 2 pax core ≈ 2,000,000 KRW @ 0.0033 (+ alpha)
const FLIGHTS_BUDGET = 1400;  // RM, KUL <-> BKI, 2 pax premium estimate
const NIGHTS = 7;      // shared window Jul 16 → 23 (friend's solo tail is separate)
const PAX = 2;          // travellers sharing costs

/* ---------- AHP criteria (weights sum to 1.0) ----------
   Luxury-tilted re-weight (pairwise AHP, CR = 0.004):
   Value drops 0.21 → 0.10, Luxury 0.35 → 0.39, Amenities 0.11 → 0.18.
   Names are resolved at render time via t('crit.' + key).
   seg values below are pre-baked = weight × raw(0–10).

   PRICE-ANCHORED VALUE: every hotel's Value raw score is computed from its
   researched nightly rate via an inverse law  Value_raw = C / rate  (clamped
   0–10), so the cheaper a room is for its tier the higher it scores on Value.
   Anchors: C_KL = 3900, C_KK = 2500 (calibrated so the cheapest luxury option
   ≈ 9 and the flagship ≈ 2.5). seg.V = 0.10 × Value_raw = C / (10·rate). This
   is the SAME inverse law render.js's recalcHotel() applies when you edit a
   rate, so live edits stay consistent with these baselines.
   Rates = representative July-2026 nightly estimates (researched Jun 2026 across
   Booking/Agoda/KAYAK/official; a nice room in peak season, not promo floor).  */
const CRIT = [
  {key:'L',  w:0.39, c:'var(--c-lux)'},
  {key:'V',  w:0.10, c:'var(--c-val)'},
  {key:'R',  w:0.17, c:'var(--c-rev)'},
  {key:'Lo', w:0.16, c:'var(--c-loc)'},
  {key:'A',  w:0.18, c:'var(--c-amen)'},
];

/* weighted segments per hotel already = weight×raw, summing to score */
const KL = [
  {k:'mo',   name:'Mandarin Oriental', area:{en:'KLCC · at the Petronas Towers',  zh:'KLCC · 紧邻双子塔'},       rate:950, star:4.6, score:8.76, seg:{L:3.51,V:0.4105,R:1.53,Lo:1.60,A:1.71}},
  {k:'banyan',name:'Banyan Tree',      area:{en:'Jln Conlay · sky-high resort',   zh:'Jln Conlay · 高空度假村'},  rate:900, star:4.7, score:8.54, seg:{L:3.51,V:0.4333,R:1.615,Lo:1.36,A:1.62}},
  {k:'ph',   name:'Park Hyatt',        area:{en:'Merdeka 118 · floors 75–115',    zh:'Merdeka 118 · 75–115 层'}, rate:1600,star:4.4, score:8.26, seg:{L:3.90,V:0.2438,R:1.36,Lo:0.96,A:1.80}},
  {k:'ritz', name:'Ritz-Carlton',      area:{en:'Bukit Bintang · Starhill',       zh:'Bukit Bintang · 邻 Starhill'},rate:750, star:4.5, score:8.25, seg:{L:3.315,V:0.52,R:1.445,Lo:1.44,A:1.53}},
  {k:'traders',name:'Traders',         area:{en:'KLCC · SkyBar · best tower view',zh:'KLCC · SkyBar · 双子塔最佳视野'},rate:480, star:4.5, score:7.83, seg:{L:2.535,V:0.8125,R:1.445,Lo:1.60,A:1.44}},
  {k:'jw',   name:'JW Marriott',       area:{en:'Bukit Bintang · Pavilion',       zh:'Bukit Bintang · 邻 Pavilion'},rate:680, star:4.5, score:7.73, seg:{L:2.925,V:0.5735,R:1.445,Lo:1.44,A:1.35}},
  {k:'westin',name:'The Westin',       area:{en:'Bukit Bintang · opp. Pavilion',  zh:'Bukit Bintang · Pavilion 对面'},rate:520, star:4.4, score:7.63, seg:{L:2.73,V:0.75,R:1.36,Lo:1.44,A:1.35}},
  {k:'majestic',name:'The Majestic',   area:{en:'Lake Gardens · heritage',        zh:'Lake Gardens · 古迹酒店'}, rate:650, star:4.4, score:7.40, seg:{L:3.12,V:0.60,R:1.36,Lo:0.88,A:1.44}},
  {k:'gm',   name:'Grand Millennium',  area:{en:'Bukit Bintang · older bldg',     zh:'Bukit Bintang · 楼龄较旧'},rate:430, star:4.5, score:7.30, seg:{L:2.34,V:0.9070,R:1.445,Lo:1.44,A:1.17}},
  {k:'ic',   name:'InterContinental',  area:{en:'Jln Ampang · dated decor',       zh:'Jln Ampang · 装潢偏旧'},   rate:520, star:4.4, score:7.03, seg:{L:2.535,V:0.75,R:1.36,Lo:1.12,A:1.26}},
  {k:'stripes',name:'Hotel Stripes',   area:{en:'Chow Kit · off-core boutique',   zh:'Chow Kit · 非核心精品店'}, rate:450, star:4.3, score:6.82, seg:{L:2.535,V:0.8667,R:1.275,Lo:0.88,A:1.26}},
];

/* second-city slot (teal `pg`) — KOTA KINABALU, SABAH */
const PG = [
  {k:'tanjung', name:'Shangri-La Tanjung Aru', area:{en:'Tanjung Aru · beachfront',          zh:'丹绒亚路 · 海滨'},          rate:800, star:4.6, score:8.50, seg:{L:3.51,V:0.3125,R:1.53,Lo:1.44,A:1.71}},
  {k:'gaya',    name:'Gaya Island Resort',     area:{en:'Gaya Island · private resort (boat)',zh:'加雅岛 · 私人度假村（需船）'},rate:950, star:4.6, score:8.24, seg:{L:3.705,V:0.2632,R:1.53,Lo:1.12,A:1.62}},
  {k:'bunga',   name:'Bunga Raya Island Resort',area:{en:'Gaya Island · villa resort (boat)', zh:'加雅岛 · 别墅度假村（需船）'},rate:1000,star:4.7, score:8.04, seg:{L:3.51,V:0.25,R:1.615,Lo:1.04,A:1.62}},
  {k:'magellan',name:'The Magellan Sutera',    area:{en:'Sutera Harbour · marina resort',    zh:'苏特拉港 · 游艇度假村'},     rate:560, star:4.4, score:7.75, seg:{L:3.12,V:0.4464,R:1.36,Lo:1.20,A:1.62}},
  {k:'pacific', name:'The Pacific Sutera',      area:{en:'Sutera Harbour · resort wing',      zh:'苏特拉港 · 度假翼'},         rate:460, star:4.4, score:7.56, seg:{L:2.925,V:0.5435,R:1.36,Lo:1.20,A:1.53}},
  {k:'hyatt',   name:'Hyatt Centric KK',       area:{en:'City centre · waterfront',          zh:'市中心 · 海滨'},            rate:390, star:4.5, score:7.44, seg:{L:2.73,V:0.6410,R:1.445,Lo:1.36,A:1.26}},
  {k:'meridien',name:'Le Méridien KK',         area:{en:'City centre · waterfront',          zh:'市中心 · 海滨'},            rate:350, star:4.4, score:7.42, seg:{L:2.73,V:0.7143,R:1.36,Lo:1.36,A:1.26}},
  {k:'hilton',  name:'Hilton Kota Kinabalu',   area:{en:'City centre · near Imago',          zh:'市中心 · 邻 Imago'},        rate:370, star:4.5, score:7.39, seg:{L:2.73,V:0.6757,R:1.445,Lo:1.28,A:1.26}},
  {k:'nexus',   name:'Nexus Karambunai',       area:{en:'Karambunai · far beach (~45 min)',  zh:'卡兰布奈 · 较远海滩（约45分钟）'},rate:480, star:4.4, score:7.39, seg:{L:2.925,V:0.5208,R:1.36,Lo:0.96,A:1.62}},
  {k:'jesselton',name:'The Jesselton Hotel',   area:{en:'City centre · heritage boutique',   zh:'市中心 · 古迹精品'},        rate:270, star:4.4, score:7.09, seg:{L:2.535,V:0.9259,R:1.36,Lo:1.28,A:0.99}},
];



/* ---------- itinerary plans (LUXURY) ---------- */
const KL_PLAN = [
  { /* slot 0 — Jul 16 · arrival + Junxi 18:30 KLIA T1 */
    title:{en:'Arrival · Welcome Night', zh:'抵达 · 迎宾之夜'},
    morning:{en:'Taeyang arrives at KLIA in the morning; private transfer to your hotel (~45 min). Check in, settle, and rest.', zh:'凯鲁上午抵达吉隆坡国际机场；专车前往酒店（约45分钟）。办理入住、安顿、休息。'},
    afternoon:{en:'At leisure — the hotel pool, club lounge, or a stroll through KLCC Park beneath the Petronas Towers while waiting for Junxi.', zh:'悠闲时光 —— 酒店泳池、行政酒廊，或漫步双子塔下的 KLCC 公园，等候君熙。'},
    evening:{en:'Junxi lands 18:30 at KLIA Terminal 1 — private transfer to the hotel (~45 min). Welcome dinner: Jalan Alor street-food crawl, then cocktails at a rooftop bar overlooking the Petronas Towers.', zh:'君熙 18:30 抵达吉隆坡国际机场 1 号航站楼 —— 专车前往酒店（约45分钟）。迎宾晚餐：亚罗街美食巡礼，随后在屋顶酒吧俯瞰双子塔小酌。'},
    meals:{ breakfast:{en:'In-flight / on arrival', zh:'机上 / 抵达后'}, lunch:{en:'Hotel or KLCC (Taeyang)', zh:'酒店或 KLCC（凯鲁）'}, dinner:{en:'Jalan Alor street-food crawl + rooftop cocktails · ~RM200/pax', zh:'亚罗街美食巡礼 + 屋顶鸡尾酒 · 约RM200/人'} },
    transport:{en:'Two private KLIA → hotel transfers (Taeyang morning; Junxi 18:30 from Terminal 1) — ~RM120 each.', zh:'两次 吉隆坡国际机场 → 酒店 专车（凯鲁上午；君熙 18:30 从 1 号航站楼）—— 每次约RM120。'},
    tips:{en:'Junxi lands at KLIA Terminal 1 at 18:30 — pre-book the transfer. Grab a SIM/eSIM and cash at the airport. Jalan Alor is cash-friendly.', zh:'君熙 18:30 降落吉隆坡国际机场 1 号航站楼 —— 请预订接送。在机场购买 SIM/eSIM 与现金。亚罗街以现金为主。'},
    cost:{en:'~RM 200/pax (food + drinks)', zh:'约RM 200/人（餐饮）'}, costPerPax:200 },
  { /* slot 1 — Jul 17 */
    title:{en:'KL City Immersion', zh:'吉隆坡城市深度游'},
    morning:{en:'Petronas Twin Towers — Skybridge + Level 86 observation deck (pre-book the early slot).', zh:'双子塔 —— 空中天桥 + 86 层观景台（建议预订上午时段）。'},
    afternoon:{en:"Private-shopper afternoon at Pavilion KL and Bukit Bintang's luxury halls.", zh:'下午在 Pavilion KL 与武吉免登的奢华商场享受私人导购。'},
    evening:{en:'Street-food crawl along Jalan Alor, then cocktails on a rooftop terrace.', zh:'亚罗街美食巡礼，随后在屋顶露台小酌。'},
    meals:{ breakfast:{en:'Hotel', zh:'酒店'}, lunch:{en:'Pavilion / Bukit Bintang', zh:'Pavilion / 武吉免登'}, dinner:{en:'Jalan Alor street food', zh:'亚罗街街头美食'} },
    transport:{en:'Grab around the city centre (~RM60 for the day).', zh:'市区内使用 Grab（全天约RM60）。'},
    tips:{en:'Tower tickets sell out — book online ahead. Jalan Alor is cash-friendly.', zh:'双子塔门票常售罄 —— 请提前网上预订。亚罗街以现金为主。'},
    cost:{en:'~RM 180/pax (towers) + shopping', zh:'约RM 180/人（双子塔）+ 购物'}, costPerPax:180 },
  { /* slot 2 — Jul 18 */
    title:{en:'Culture & Rooftop Dinner', zh:'人文与屋顶晚餐'},
    morning:{en:'Batu Caves at dawn — 272 rainbow steps and the cave temples before the heat and crowds.', zh:'清晨黑风洞 —— 趁炎热与人潮前登 272 级彩虹阶梯，参观洞穴神庙。'},
    afternoon:{en:'Islamic Arts Museum & Perdana Botanical Gardens — a quiet cultural afternoon in the lake gardens.', zh:'伊斯兰艺术博物馆与湖滨公园 —— 在湖园中度过宁静的文化午后。'},
    evening:{en:'Rooftop dinner at Envi Skydining — modern European with KL skyline views.', zh:'在 Envi Skydining 享用屋顶晚餐 —— 现代欧陆料理，尽览吉隆坡天际线。'},
    meals:{ breakfast:{en:'Hotel', zh:'酒店'}, lunch:{en:'Light — near Batu Caves', zh:'简餐 —— 黑风洞附近'}, dinner:{en:'Envi Skydining · Modern European rooftop · ~RM220/pax', zh:'Envi Skydining · 现代欧陆屋顶 · 约RM220/人'} },
    transport:{en:'Private car to Batu Caves (~RM90 return). Museum & gardens are nearby by Grab (~RM20).', zh:'专车往返黑风洞（约RM90）。博物馆与公园相距不远，Grab 约RM20。'},
    tips:{en:'Cover shoulders & knees at Batu Caves (sarong available). Book Envi for sunset.', zh:'黑风洞需遮盖肩膝（现场提供纱笼）。Envi 建议预订日落时段。'},
    cost:{en:'~RM 240/pax (dinner + museum)', zh:'约RM 240/人（晚餐 + 博物馆）'}, costPerPax:240 },
  { /* slot 3 — the FIXED return-to-KL night (Jul 22) */
    title:{en:'Return to Kuala Lumpur', zh:'返回吉隆坡'},
    morning:{en:'Late-morning flight BKI → KUL (~2h 45m). Private transfer back to the hotel.', zh:'上午晚些时候搭机 亚庇 → 吉隆坡（约2小时45分）。专车返回酒店。'},
    afternoon:{en:'Last-minute KLCC or Bukit Bintang shopping, or a rooftop-pool afternoon.', zh:'最后的 KLCC 或武吉免登购物，或享受屋顶泳池的午后。'},
    evening:{en:'Farewell skyline dinner at Envi Skydining — modern European on a rooftop terrace.', zh:'在 Envi Skydining 享用告别天际线晚餐 —— 屋顶露台现代欧陆料理。'},
    meals:{ breakfast:{en:'Resort, before checkout', zh:'退房前于度假村用餐'}, lunch:{en:'Airport / on arrival', zh:'机场 / 抵达后'}, dinner:{en:'Envi Skydining · Modern European · ~RM220/pax', zh:'Envi Skydining · 现代欧陆 · 约RM220/人'} },
    transport:{en:'BKI → KUL flight + airport transfers (~RM120).', zh:'亚庇 → 吉隆坡 航班 + 机场接送（约RM120）。'},
    tips:{en:'Keep your passport handy — leaving Sabah passes an immigration checkpoint.', zh:'随身携带护照 —— 离开沙巴需过移民检查。'},
    cost:{en:'~RM 220/pax (dinner)', zh:'约RM 220/人（晚餐）'}, costPerPax:220 },
  { /* slot 4 — spare KL day-trip (high front-KL splits) */
    title:{en:'Day Trip · Putrajaya or Genting', zh:'一日游 · 布城或云顶'},
    morning:{en:"Choose your day: Putrajaya's pink mosque and garden city, or the Genting cable car up to the highlands.", zh:'二选一：布城的粉红清真寺与花园城市，或搭乘云顶缆车上高原。'},
    afternoon:{en:'Lakeside lunch in Putrajaya, or casino-resort indulgence at Genting.', zh:'布城湖畔午餐，或云顶赌场度假村尽兴。'},
    evening:{en:'Final skyline dinner back in the city.', zh:'返回市区，享用最后的天际线晚餐。'},
    meals:{ breakfast:{en:'Hotel', zh:'酒店'}, lunch:{en:'Putrajaya / Genting', zh:'布城 / 云顶'}, dinner:{en:'City skyline restaurant', zh:'市区天际线餐厅'} },
    transport:{en:'Full-day private car (~RM300).', zh:'全日专车（约RM300）。'},
    tips:{en:'Genting is cool (~18°C) — bring a layer. Putrajaya mosques need modest dress.', zh:'云顶气温较低（约18°C）—— 请备外套。布城清真寺需着装得体。'},
    cost:{en:'~RM 200/pax + dining', zh:'约RM 200/人 + 餐饮'}, costPerPax:200 },
];
const PG_PLAN = [
  { title:{en:'Fly to Kota Kinabalu', zh:'飞往亚庇'},
    morning:{en:'Midday flight KUL → BKI (~2h 45m). Sit on the left for Borneo coastline views on descent.', zh:'中午搭机 吉隆坡 → 亚庇（约2小时45分）。下降时坐左侧可赏婆罗洲海岸线。'},
    afternoon:{en:'Private transfer to your resort. Check in and settle into the resort.', zh:'专车前往度假村。办理入住，安顿于度假村。'},
    evening:{en:"Sunset beach walk over the South China Sea — Sabah's signature golden hour.", zh:'南海畔日落沙滩漫步 —— 沙巴标志性的黄金时刻。'},
    meals:{ breakfast:{en:'Hotel, before flight', zh:'航班前于酒店用餐'}, lunch:{en:'Airport / on arrival', zh:'机场 / 抵达后'}, dinner:{en:'Resort beachfront dining', zh:'度假村海滨餐饮'} },
    transport:{en:'KUL → BKI flight + BKI → resort transfer (~RM120).', zh:'吉隆坡 → 亚庇 航班 + 机场 → 度假村接送（约RM120）。'},
    tips:{en:'Sabah has its own immigration checkpoint — passport required even on a domestic flight.', zh:'沙巴设独立移民检查 —— 即便国内航班也需护照。'},
    cost:{en:'~RM 150/pax (dinner)', zh:'约RM 150/人（晚餐）'}, costPerPax:150 },
  { title:{en:'Island Hopping & Seafood', zh:'跳岛与海鲜'},
    morning:{en:'Shared group boat tour to Manukan, Mamutik & Sapi — snorkelling over coral in the Tunku Abdul Rahman Marine Park.', zh:'拼团快艇前往 Manukan、Mamutik、Sapi —— 在东姑阿都拉曼海洋公园浮潜赏珊瑚。'},
    afternoon:{en:'Beach time, parasailing over the bay, and a shared sunset cruise back.', zh:'沙滩时光、海湾帆伞滑翔，乘共享日落巡航返回。'},
    evening:{en:'Seafood feast at Gayang — fresh daily catch cooked over the water.', zh:'Gayang 海鲜大餐 —— 水上现捞现做。'},
    meals:{ breakfast:{en:'Resort', zh:'度假村'}, lunch:{en:'On the islands / boat', zh:'岛上 / 船上'}, dinner:{en:'Gayang Seafood · Sabahan · ~RM130/pax', zh:'Gayang 海鲜 · 沙巴风味 · 约RM130/人'} },
    transport:{en:'Shared boat + transfers (part of the ~RM200/pax package).', zh:'拼船 + 接送（含于约RM200/人套餐）。'},
    tips:{en:'Reef-safe sunscreen, dry bag, water shoes. Seas are usually calm in July.', zh:'珊瑚友好防晒霜、防水袋、涉水鞋。七月海面通常平静。'},
    cost:{en:'~RM 200/pax (island) + RM130 dinner', zh:'约RM 200/人（跳岛）+ RM130 晚餐'}, costPerPax:330 },
  { title:{en:'Resort Day', zh:'度假日'},
    morning:{en:'Late breakfast, then the infinity pool and a beach walk with the South China Sea breeze.', zh:'晚早餐，随后在无边泳池与南海海风中沙滩漫步。'},
    afternoon:{en:'Poolside reading, sun-lounger naps, or a snooze in the air-conditioned villa — your call.', zh:'池畔阅读、日光躺椅小憩，或在空调别墅里补觉 —— 由你决定。'},
    evening:{en:'Resort beachfront dinner — toes in the sand, sunset over the water.', zh:'度假村海滨晚餐 —— 脚踩沙滩，日落映海。'},
    meals:{ breakfast:{en:'Resort', zh:'度假村'}, lunch:{en:'Resort', zh:'度假村'}, dinner:{en:'Resort beachfront · ~RM160/pax', zh:'度假村海滨 · 约RM160/人'} },
    transport:{en:'None — everything is on-site.', zh:'无需出行 —— 一切均在度假村内。'},
    tips:{en:'Book the beachfront table for sunset. The resort spa is there if you change your mind.', zh:'预订日落海滨餐位。如需水疗，度假村内即有点选。'},
    cost:{en:'~RM 200/pax', zh:'约RM 200/人'}, costPerPax:200 },
  { title:{en:'City & Culture', zh:'城市与人文'},
    morning:{en:'Signal Hill Observatory and the Atkinson Clock Tower for the harbour panorama.', zh:'信号山观景台与爱迪生钟楼，俯瞰海港全景。'},
    afternoon:{en:'Gaya Street market browsing and waterfront cafés.', zh:'逛加雅街市集与海滨咖啡馆。'},
    evening:{en:'Waterfront sunset and dinner along the KK seafront.', zh:'海滨日落，沿亚庇海滨用晚餐。'},
    meals:{ breakfast:{en:'Resort', zh:'度假村'}, lunch:{en:'Gaya Street', zh:'加雅街'}, dinner:{en:'Waterfront · Little Italy KK · ~RM140/pax', zh:'海滨 · Little Italy KK · 约RM140/人'} },
    transport:{en:'Grab around the city (~RM50).', zh:'市区 Grab（约RM50）。'},
    tips:{en:'The Sunday Gaya Street fair is the liveliest if your dates align.', zh:'若日期吻合，周日加雅街集市最为热闹。'},
    cost:{en:'~RM 140/pax + market finds', zh:'约RM 140/人 + 市集购物'}, costPerPax:140 },
  { title:{en:'Culture Village & River Cruise', zh:'文化村与河上巡航'},
    morning:{en:"Mari Mari Cultural Village — Sabah's indigenous longhouses, crafts and traditions.", zh:'Mari Mari 文化村 —— 沙巴原住民长屋、手工艺与传统。'},
    afternoon:{en:'Drive out to the Klias wetlands.', zh:'驱车前往 Klias 湿地。'},
    evening:{en:'Klias River cruise — proboscis monkeys at dusk and fireflies after dark.', zh:'Klias 河巡航 —— 黄昏赏长鼻猴，入夜观萤火虫。'},
    meals:{ breakfast:{en:'Resort', zh:'度假村'}, lunch:{en:'Cultural village', zh:'文化村'}, dinner:{en:'Cruise buffet / local', zh:'巡航自助 / 当地料理'} },
    transport:{en:'Full-day private car & driver (~RM320).', zh:'全日专车与司机（约RM320）。'},
    tips:{en:'Insect repellent is essential for the river. Long day — expect a late return.', zh:'河区务必携带驱蚊剂。行程较长 —— 预计较晚返回。'},
    cost:{en:'~RM 300/pax', zh:'约RM 300/人'}, costPerPax:300 },
];

const DEPART_PLAN = {
  title:{en:'Final Day Together', zh:'同游的最后一天'},
  morning:{en:'Late checkout and a slow brunch — the hotel Living Room or KLCC Park one more time.', zh:'延迟退房，悠闲早午餐 —— 再访酒店 Living Room 或 KLCC 公园。'},
  afternoon:{en:"Lunch in the clouds at Atmosphere 360, KL Tower's revolving restaurant.", zh:'在吉隆坡塔旋转餐厅 Atmosphere 360 享用云端午餐。'},
  evening:{en:'Taeyang heads to KLIA to fly home. Junxi checks into The St. Regis KL to begin his solo tail.', zh:'凯鲁前往机场回家。君熙入住圣瑞吉吉隆坡，开始独自的行程。'},
  meals:{ breakfast:{en:'Hotel brunch', zh:'酒店早午餐'}, lunch:{en:'Atmosphere 360 · revolving · ~RM350/pax', zh:'Atmosphere 360 · 旋转餐厅 · 约RM350/人'}, dinner:{en:'Separate — travel / St Regis', zh:'各自 —— 旅途 / 圣瑞吉'} },
  transport:{en:'Hotel → KLIA transfer; Junxi → St Regis (~RM120 total).', zh:'酒店 → 机场接送；君熙 → 圣瑞吉（合计约RM120）。'},
  tips:{en:"Re-confirm Taeyang's outbound flight and Junxi's St Regis booking (Jul 23–25).", zh:'再次确认凯鲁的回程航班与君熙的圣瑞吉预订（7月23–25）。'},
  cost:{en:'~RM 350/pax (lunch)', zh:'约RM 350/人（午餐）'}, costPerPax:350,
};

const DATES = [
  {en:'Jul 16', zh:'7月16'}, {en:'Jul 17', zh:'7月17'}, {en:'Jul 18', zh:'7月18'},
  {en:'Jul 19', zh:'7月19'}, {en:'Jul 20', zh:'7月20'}, {en:'Jul 21', zh:'7月21'},
  {en:'Jul 22', zh:'7月22'},
];
const DEPART_DATE = {en:'Jul 23', zh:'7月23'};

/* ---------- flight detail blocks (LUXURY) ---------- */
const FLIGHT_OUT = {
  route:{en:'Kuala Lumpur (KUL) → Kota Kinabalu (BKI)', zh:'吉隆坡 (KUL) → 亚庇 (BKI)'},
  date:{en:'Sun, Jul 19, 2026', zh:'2026年7月19日 周日'},
  airline:{en:'AirAsia · premium flatbed', zh:'亚航 · 商务平躺座'},
  terminal:{en:'Depart klia2 (T2) · Arrive BKI T1', zh:'klia2（T2）出发 · BKI T1 抵达'},
  duration:{en:'~2h 45m', zh:'约2小时45分'},
  cost:{en:'~RM 305 × 2 = RM 610', zh:'约RM 305 × 2 = RM 610'},
  q:'KUL+to+BKI+on+2026-07-19',
};
const FLIGHT_BACK = {
  route:{en:'Kota Kinabalu (BKI) → Kuala Lumpur (KUL)', zh:'亚庇 (BKI) → 吉隆坡 (KUL)'},
  date:{en:'Wed, Jul 22, 2026', zh:'2026年7月22日 周三'},
  airline:{en:'Malaysia Airlines · business', zh:'马来西亚航空 · 商务舱'},
  terminal:{en:'Depart BKI T1 · Arrive KLIA T1', zh:'BKI T1 出发 · KLIA T1 抵达'},
  duration:{en:'~2h 45m', zh:'约2小时45分'},
  cost:{en:'~RM 420 × 2 = RM 840', zh:'约RM 420 × 2 = RM 840'},
  q:'BKI+to+KUL+on+2026-07-22',
};
const FLIGHTS_REF = [FLIGHT_OUT, FLIGHT_BACK];

/* ---------- ground transport ({name,cost}) ---------- */
const TRANSPORT_REF = [
  { name:{en:'Airport transfers (all legs)', zh:'机场接送（全部航段）'}, cost:{en:'~RM 240', zh:'约RM 240'} },
  { name:{en:'Private car + driver in KK (3 days)', zh:'亚庇专车 + 司机（3天）'}, cost:{en:'~RM 320 × 3 = RM 960', zh:'约RM 320 × 3 = RM 960'} },
  { name:{en:'Ride-hailing (Grab) around KL', zh:'吉隆坡 Grab 网约车'}, cost:{en:'~RM 480', zh:'约RM 480'} },
];

/* ---------- dining ({name string, city, sub, cost, note}) ---------- */
const DINING_REF = [
  { name:'Dewakan',         city:'kl', sub:{en:'Michelin-starred contemporary Malaysian', zh:'米其林星级当代马来料理'}, cost:{en:'~RM 870/pax', zh:'约RM 870/人'}, note:{en:'Reserve weeks ahead', zh:'需提前数周预订'} },
  { name:"Marini's on 57",  city:'kl', sub:{en:'Italian fine dining · KLCC skyline', zh:'意式精致料理 · KLCC 天际线'}, cost:{en:'~RM 500/pax', zh:'约RM 500/人'}, note:{en:'Smart-casual; book a tower-view table', zh:'时尚休闲；预订双子塔景观位'} },
  { name:'Envi Skydining',  city:'kl', sub:{en:'Modern European · rooftop terrace', zh:'现代欧陆 · 屋顶露台'}, cost:{en:'~RM 220/pax', zh:'约RM 220/人'}, note:{en:'Best at sunset', zh:'日落时最佳'} },
  { name:'Atmosphere 360',  city:'kl', sub:{en:'Revolving restaurant · KL Tower', zh:'旋转餐厅 · 吉隆坡塔'}, cost:{en:'~RM 350/pax', zh:'约RM 350/人'}, note:{en:'Lunch buffet; one rotation ~90 min', zh:'午餐自助；旋转一圈约90分钟'} },
  { name:'Gayang Seafood',  city:'pg', sub:{en:'Sabahan seafood · fresh daily catch', zh:'沙巴海鲜 · 每日现捞'}, cost:{en:'~RM 130/pax', zh:'约RM 130/人'}, note:{en:'Order live seafood by weight', zh:'按重量点活海鲜'} },
  { name:'El Centro',       city:'pg', sub:{en:'Spanish tapas · waterfront', zh:'西班牙小食 · 海滨'}, cost:{en:'~RM 160/pax', zh:'约RM 160/人'}, note:{en:'Lively evenings', zh:'夜晚气氛热闹'} },
  { name:'Little Italy KK', city:'pg', sub:{en:'Italian · curated wine list', zh:'意大利菜 · 精选酒单'}, cost:{en:'~RM 140/pax', zh:'约RM 140/人'}, note:{en:'Long-running local favourite', zh:'经营多年的本地人气店'} },
];

/* ---------- experiences ({name {en,zh}, city, sub, cost, note}) ---------- */
const EXPERIENCES_REF = [
  { name:{en:'Petronas Skybridge + Level 86', zh:'双子塔天桥 + 86层'}, city:'kl', sub:{en:'Skybridge & observation deck', zh:'空中天桥与观景台'}, cost:{en:'~RM 180/pax', zh:'约RM 180/人'}, note:{en:'Pre-book online; slots sell out', zh:'提前网上预订；时段常售罄'} },
  { name:{en:'Balinese Spa — Grand Hyatt', zh:'巴厘水疗 —— 君悦'}, city:'kl', sub:{en:'Mandara Spa massage & ritual', zh:'Mandara Spa 按摩与仪式'}, cost:{en:'~RM 450/pax', zh:'约RM 450/人'}, note:{en:"Book a couples' suite", zh:'预订双人套房'} },
  { name:{en:'Batu Caves', zh:'黑风洞'}, city:'kl', sub:{en:'272 steps & cave temples', zh:'272级阶梯与洞穴神庙'}, cost:{en:'Free (temple)', zh:'免费（神庙）'}, note:{en:'Go at dawn; modest dress', zh:'清晨前往；着装得体'} },
  { name:{en:'Private Shopping — Pavilion KL', zh:'私人导购 —— Pavilion KL'}, city:'kl', sub:{en:'Personal shopper, luxury halls', zh:'私人导购，奢侈品区'}, cost:{en:'Varies', zh:'视消费而定'}, note:{en:'Arrange via hotel concierge', zh:'经酒店礼宾安排'} },
  { name:{en:'Island Hopping & Snorkelling', zh:'跳岛浮潜'}, city:'pg', sub:{en:'Manukan, Mamutik & Sapi — shared group boat + parasailing', zh:'Manukan、Mamutik、Sapi — 拼团快艇 + 帆伞'}, cost:{en:'~RM 200/pax', zh:'约RM 200/人'}, note:{en:'Reef-safe sunscreen, dry bag', zh:'珊瑚友好防晒霜、防水袋'} },
  { name:{en:'Mount Kinabalu Viewpoint Drive', zh:'京那巴鲁山观景之旅'}, city:'pg', sub:{en:'Foothills, Desa dairy, Poring canopy & hot springs', zh:'山麓、Desa 牧场、Poring 树冠与温泉'}, cost:{en:'~RM 550/pax', zh:'约RM 550/人'}, note:{en:'Start early; cooler up top', zh:'宜早出发；山上较凉'} },
  { name:{en:'Gayang Seafood Feast', zh:'Gayang 海鲜盛宴'}, city:'pg', sub:{en:'Fresh catch cooked over the water', zh:'水上现捞现做'}, cost:{en:'~RM 130/pax', zh:'约RM 130/人'}, note:{en:'Sunset seating', zh:'日落时段座位'} },
  { name:{en:'Tanjung Aru Beach Sunset', zh:'丹绒亚路海滩日落'}, city:'pg', sub:{en:"Sabah's signature golden hour", zh:'沙巴标志性黄金时刻'}, cost:{en:'Free', zh:'免费'}, note:{en:'Arrive ~30 min before sunset', zh:'日落前约30分钟抵达'} },
];

/* ---------- know before you go ({label,value}) ---------- */
const ESSENTIALS_REF = [
  { label:{en:'Visa', zh:'签证'}, value:{en:'Malaysia: visa-free for Korean (90 days) & Chinese passports (through 2026). Passport valid 6+ months.', zh:'马来西亚：韩国（90天）与中国护照（至2026年）免签。护照有效期需6个月以上。'} },
  { label:{en:'Sabah entry', zh:'沙巴入境'}, value:{en:'Sabah has its own immigration checkpoint — carry your passport even on the domestic KUL–BKI flight.', zh:'沙巴设独立移民检查 —— 即便国内 吉隆坡–亚庇 航班也需随身携带护照。'} },
  { label:{en:'Currency', zh:'货币'}, value:{en:'Malaysian Ringgit (RM/MYR). Cards in hotels & malls; cash for markets, street food, taxis. ATMs everywhere.', zh:'马来西亚林吉特（RM/MYR）。酒店商场可刷卡；市集、街食、出租车用现金。ATM 普及。'} },
  { label:{en:'Connectivity', zh:'网络'}, value:{en:'Buy a local eSIM/SIM (CelcomDigi, Maxis, Yes) or Airalo at the airport. Grab app for rides & food.', zh:'在机场购买本地 eSIM/SIM（CelcomDigi、Maxis、Yes）或 Airalo。叫车与外卖用 Grab。'} },
  { label:{en:'Power', zh:'电源'}, value:{en:'Type G plug, 230V / 50Hz. Bring a UK-style adapter.', zh:'Type G 插头，230V / 50Hz。请备英式转换插头。'} },
  { label:{en:'Emergency', zh:'紧急电话'}, value:{en:'999 (police/ambulance), 994 (fire), 112 from any mobile.', zh:'999（警察/救护），994（消防），手机拨 112。'} },
  { label:{en:'Language', zh:'语言'}, value:{en:'Bahasa Malaysia official; English widely spoken; Mandarin & Cantonese common.', zh:'官方语言为马来语；英语通用；华语与粤语常见。'} },
  { label:{en:'Time zone', zh:'时区'}, value:{en:'MYT, UTC+8 (same as China; Korea is 1h ahead). No KL–KK difference.', zh:'马来西亚时间 UTC+8（与中国相同；韩国快1小时）。吉隆坡与亚庇无时差。'} },
  { label:{en:'Tipping', zh:'小费'}, value:{en:'Not customary; a service charge is often included. Rounding up is appreciated.', zh:'非惯例；账单常含服务费。凑整即可。'} },
  { label:{en:'Water & health', zh:'饮水与健康'}, value:{en:'Drink bottled water. Mosquito repellent for river/jungle outings.', zh:'饮用瓶装水。河流/丛林行程请用驱蚊剂。'} },
  { label:{en:'Dress code', zh:'着装'}, value:{en:'Cover shoulders & knees at Batu Caves and mosques (sarongs provided).', zh:'黑风洞与清真寺需遮盖肩膝（现场提供纱笼）。'} },
];

/* ---------- packing ({en,zh} strings) ---------- */
const PACKING_REF = [
  {en:'Lightweight linen & cotton clothing', zh:'轻薄棉麻衣物'},
  {en:'Swimwear & reef-safe sunscreen', zh:'泳装与珊瑚友好防晒霜'},
  {en:'Light rain shell or compact umbrella', zh:'轻便雨衣或折叠伞'},
  {en:'Insect repellent (DEET)', zh:'驱蚊剂（含避蚊胺）'},
  {en:'Comfortable walking shoes + water shoes/sandals', zh:'舒适步行鞋 + 涉水鞋/凉鞋'},
  {en:'Sunglasses & sun hat', zh:'太阳镜与遮阳帽'},
  {en:'Type-G power adapter & power bank', zh:'Type-G 转换插头与充电宝'},
  {en:'Smart-casual outfit for fine dining', zh:'精致晚餐的时尚休闲装'},
  {en:'Modest layer for temples (shoulders/knees)', zh:'参观寺庙的得体披肩（遮肩膝）'},
  {en:'Dry bag for island hopping', zh:'跳岛用防水袋'},
  {en:'Light layer for the Genting / Kinabalu highlands', zh:'云顶 / 神山高原的保暖外套'},
];

/* ---------- pre-trip checklist ({en,zh} strings) ---------- */
const CHECKLIST_REF = [
  {en:'Confirm both flights: KUL→BKI (Jul 19), BKI→KUL (Jul 22)', zh:'确认两段航班：吉隆坡→亚庇（7月19）、亚庇→吉隆坡（7月22）'},
  {en:'Confirm hotel bookings & dates (KL front + KK + KL return night)', zh:'确认酒店预订与日期（吉隆坡前段 + 亚庇 + 吉隆坡返程夜）'},
  {en:"Confirm Junxi's St. Regis KL solo tail (Jul 23–25)", zh:'确认君熙圣瑞吉吉隆坡的独自行程（7月23–25）'},
  {en:"Reserve restaurants: Envi Skydining, Atmosphere 360", zh:"预订餐厅：Envi Skydining、Atmosphere 360"},
  {en:'Book experiences: Petronas towers, island hopping, KK driver', zh:'预订体验：双子塔、跳岛、亚庇司机'},
  {en:'Arrange airport transfers (all legs)', zh:'安排机场接送（全部航段）'},
  {en:'Travel insurance for two', zh:'为两人购买旅行保险'},
  {en:'eSIM/SIM + some MYR cash', zh:'eSIM/SIM + 部分林吉特现金'},
  {en:'Passport valid 6+ months; photo/scan backups', zh:'护照有效期6个月以上；备份照片/扫描件'},
  {en:'Check return flights home: Taeyang (Korea), Junxi (China)', zh:'确认回程航班：凯鲁（韩国）、君熙（中国）'},
];

const find = (arr, k) => arr.find(h => h.k === k);
