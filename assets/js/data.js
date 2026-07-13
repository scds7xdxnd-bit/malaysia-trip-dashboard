/* ============================================================
   data.js — BOOKED trip data · KL × Kota Kinabalu · Jul 16–25, 2026

   Everything here mirrors the actual confirmations in the repo root
   (Trip.com receipts, restaurant bookings, Daeng Travel order,
   Generali policy). Translatable free-text fields are { en, zh }
   pairs read through I18N.L(); proper nouns stay language-neutral.

   NOTE: the second-city slot keeps its legacy `pg` (teal) identifier
   but holds KOTA KINABALU.
   ============================================================ */

/* ---------- money: trip fund & spend (RM unless stated) ---------- */
const FUND_ROWS = [
  { who:{en:'Junxi', zh:'君熙'},   src:'¥8,600 CNY',        rate:'× 0.5437',  myr:4676 },
  { who:{en:'Taeyang', zh:'凯鲁'}, src:'₩3,880,000 KRW',    rate:'× 0.00276', myr:10724 },
];
const FUND_TOTAL = 15400;

/* prepaid bookings (already paid by card) */
const SPEND_PREPAID = [
  { c:'var(--kl)', name:{en:'Park Hyatt Kuala Lumpur', zh:'吉隆坡柏悦酒店'},
    calc:{en:'Jul 16–19 · 3 nts · breakfast', zh:'7月16–19 · 3晚 · 含早'}, amt:4631.36 },
  { c:'var(--pg)', name:{en:'Batik Air OD1004 + Rasa Ria', zh:'峇迪航空 OD1004 + 莎利雅香格里拉'},
    calc:{en:'Jul 19 · business + 1 nt pkg', zh:'7月19 · 商务舱 + 1晚套票'}, amt:2796 },
  { c:'var(--pg)', name:{en:'The Shore Kota Kinabalu', zh:'The Shore 亚庇'},
    calc:{en:'Jul 20–22 · 2 nts · suite', zh:'7月20–22 · 2晚 · 套房'}, amt:338.27 },
  { c:'var(--kl)', name:{en:'Batik Air OD1017 + Le Méridien PJ', zh:'峇迪航空 OD1017 + 八打灵再也艾美'},
    calc:{en:'Jul 22 · business + 3 nts pkg', zh:'7月22 · 商务舱 + 3晚套票'}, amt:3154 },
];

/* on-trip spending, per plan (2 pax, Jul 16–22) */
const SPEND_TRIP = [
  { c:'var(--mut)', name:{en:'Food & dining', zh:'饮食'},           calc:{en:'incl. 5 reserved dinners', zh:'含 5 顿已订晚餐'}, amt:2499 },
  { c:'var(--mut)', name:{en:'Local transport', zh:'当地交通'},     calc:{en:'Grab + booked transfers', zh:'Grab + 已订接送'}, amt:770 },
  { c:'var(--mut)', name:{en:'Entertainment', zh:'娱乐'},           calc:{en:'island trip, tickets', zh:'跳岛、门票'}, amt:440 },
  { c:'var(--mut)', name:{en:'Other', zh:'其他'},                   calc:{en:'buffer for extras', zh:'杂项备用'}, amt:300 },
];
const SPEND_TOTAL = 14929;   /* prepaid + on-trip, rounded per plan */
const PAID_SO_FAR = 11900;   /* settled so far */
const PAID_REMAINING = 3029; /* still to pay / spend on the trip */

/* ---------- itinerary — 10 fixed days ---------- */
const ITIN = [
  { date:{en:'Jul 16 · Thu', zh:'7月16 · 周四'}, city:'kl',
    title:{en:'Arrival · Park Hyatt check-in', zh:'抵达 · 柏悦入住'},
    morning:{en:'Travel day — pack, head to the airport and fly to Kuala Lumpur.', zh:'出行日 —— 整装出发，飞往吉隆坡。'},
    afternoon:{en:'In the air. Land at KLIA Terminal 1 in the evening (flight MH377).', zh:'飞行途中。傍晚抵达吉隆坡国际机场 1 号航站楼（航班 MH377）。'},
    evening:{en:'19:20 booked premium transfer to Park Hyatt Kuala Lumpur (Merdeka 118) — check in for 3 nights, breakfast included (booked). ~21:00 dinner at Seoul Garden, LaLaport BBCC — a short walk from the hotel.', zh:'19:20 已订高级专车前往吉隆坡柏悦酒店（Merdeka 118）—— 入住 3 晚，含早餐（已预订）。约 21:00 在酒店旁 LaLaport BBCC 的 Seoul Garden 用晚餐。'},
    meals:{ breakfast:{en:'In transit', zh:'旅途中'}, lunch:{en:'In-flight', zh:'机上'}, dinner:{en:'Seoul Garden · LaLaport BBCC · ~RM220', zh:'Seoul Garden · LaLaport BBCC · 约RM220'} },
    transport:{en:'Booked: Trip.com premium 7-seater, pickup 19:20 at KLIA T1 → Park Hyatt (KRW 66,596).', zh:'已订：Trip.com 高级 7 座车，19:20 于 KLIA T1 接机 → 柏悦（KRW 66,596）。'},
    tips:{en:'Driver details appear in the Trip.com app before 17:20. Grab an eSIM and some MYR cash at the airport.', zh:'司机信息将于 17:20 前在 Trip.com App 更新。在机场购买 eSIM 与部分林吉特现金。'},
    cost:{en:'~RM 460 · 2 pax on-trip', zh:'约RM 460 · 两人当日花费'} },

  { date:{en:'Jul 17 · Fri', zh:'7月17 · 周五'}, city:'kl',
    title:{en:'Chinatown & Park Lounge dinner', zh:'茨厂街与 Park Lounge 晚餐'},
    morning:{en:'Hotel breakfast (included), slow morning at Park Hyatt.', zh:'酒店早餐（已含），柏悦悠闲上午。'},
    afternoon:{en:'12:00 lunch + Pasar Seni (Central Market). 14:30 heritage walk: Guan Di Temple, Sri Maha Mariamman Temple, Kwai Chai Hong, Chan See Shu Yuen clan house. Back to the hotel to rest by 15:30.', zh:'12:00 午餐 + 逛中央艺术坊（Pasar Seni）。14:30 古迹漫步：关帝庙、斯里玛哈马里安曼兴都庙、鬼仔巷、陈氏书院。15:30 回酒店休息。'},
    evening:{en:'18:00 dinner at Park Lounge, Park Hyatt (booked, 2 pax) — Umai Ikan Merah, Daging Dendeng Cili Berapi, Butter Chicken, Nasi Goreng Ketam Bunga, Bendi Cabai Tumbuk (~RM343). 20:00 night walk: River of Life, Dataran Merdeka, I Love KL sign, Kolam Biru.', zh:'18:00 于柏悦 Park Lounge 晚餐（已预订，2 人）—— Umai Ikan Merah、Daging Dendeng Cili Berapi、黄油鸡、花蟹炒饭、Bendi Cabai Tumbuk（约RM343）。20:00 夜游：生命之河、独立广场、I Love KL 打卡点、蓝池。'},
    meals:{ breakfast:{en:'Hotel (included)', zh:'酒店（已含）'}, lunch:{en:'Pasar Seni area', zh:'中央艺术坊一带'}, dinner:{en:'Park Lounge · booked 18:00 · ~RM343', zh:'Park Lounge · 已订 18:00 · 约RM343'} },
    transport:{en:'On foot + short Grab hops (~RM60 for the day).', zh:'步行 + 短程 Grab（全天约RM60）。'},
    tips:{en:'Temples ask for modest dress. The night-walk loop around Dataran Merdeka is best after 20:00 when it cools down.', zh:'寺庙需着装得体。独立广场夜游最好 20:00 之后，天气转凉。'},
    cost:{en:'~RM 553 · 2 pax on-trip', zh:'约RM 553 · 两人当日花费'} },

  { date:{en:'Jul 18 · Sat', zh:'7月18 · 周六'}, city:'kl',
    title:{en:'Heritage, KL Tower & Arté 66', zh:'古迹、吉隆坡塔与 Arté 66'},
    morning:{en:'Old KL Railway Station → Masjid Negara → Islamic Arts Museum (RM40, student RM10) → Royal Police Museum → Perdana gardens (Heliconia walk, Oasis Garden).', zh:'吉隆坡旧火车站 → 国家清真寺 → 伊斯兰艺术博物馆（RM40，学生 RM10）→ 皇家警察博物馆 → 湖滨公园（Heliconia 步道、Oasis 花园）。'},
    afternoon:{en:'14:00 KL Tower + Malay-Thai lunch nearby. 15:30 The Exchange TRX — luxury-mall browsing (take the LRT).', zh:'14:00 吉隆坡塔 + 附近马来-泰式午餐。15:30 逛 TRX Exchange 奢侈品商场（乘 LRT）。'},
    evening:{en:'20:00 dinner at Arté 66 Restaurant & Bar — confirmed for 2 adults (~RM500).', zh:'20:00 于 Arté 66 Restaurant & Bar 晚餐 —— 已确认 2 位成人（约RM500）。'},
    meals:{ breakfast:{en:'Hotel (included)', zh:'酒店（已含）'}, lunch:{en:'Malay-Thai near KL Tower', zh:'吉隆坡塔附近马泰餐'}, dinner:{en:'Arté 66 · booked 20:00 · ~RM500', zh:'Arté 66 · 已订 20:00 · 约RM500'} },
    transport:{en:'Grab to the museums quarter; LRT to TRX (~RM65 for the day).', zh:'Grab 往博物馆区；LRT 往 TRX（全天约RM65）。'},
    tips:{en:'Bring the student ID for museum discounts. Book-free evening — pack for tomorrow\'s checkout before dinner.', zh:'携带学生证享博物馆折扣。晚餐前先为明日退房收拾行李。'},
    cost:{en:'~RM 705 · 2 pax on-trip', zh:'约RM 705 · 两人当日花费'} },

  { date:{en:'Jul 19 · Sun', zh:'7月19 · 周日'}, city:'pg',
    title:{en:'Fly to Kota Kinabalu · Rasa Ria', zh:'飞往亚庇 · 莎利雅香格里拉'},
    morning:{en:'Breakfast, check out. 10:35 booked transfer Park Hyatt → KLIA Terminal 1.', zh:'早餐后退房。10:35 已订专车 柏悦 → 吉隆坡国际机场 1 号航站楼。'},
    afternoon:{en:'13:30–16:00 Batik Air OD1004, business class, KUL T1 → BKI T1. Grab (~1 h) to Shangri-La Rasa Ria, Pantai Dalit, Tuaran — Garden Wing Deluxe Sea View Twin, 1 night with breakfast.', zh:'13:30–16:00 峇迪航空 OD1004 商务舱，KUL T1 → BKI T1。Grab（约 1 小时）前往杜亚兰莎利雅香格里拉 —— 花园翼豪华海景双床房，1 晚含早。'},
    evening:{en:'19:30 Tepi Laut “Roast Night” buffet dinner, poolside at the resort (booked, ~RM316).', zh:'19:30 于度假村池畔 Tepi Laut 「Roast Night」自助晚餐（已预订，约RM316）。'},
    meals:{ breakfast:{en:'Hotel, before checkout', zh:'退房前酒店早餐'}, lunch:{en:'In-flight / airport', zh:'机上 / 机场'}, dinner:{en:'Tepi Laut buffet · booked 19:30 · ~RM316', zh:'Tepi Laut 自助 · 已订 19:30 · 约RM316'} },
    transport:{en:'Booked: minivan pickup 10:35 to KLIA T1 (KRW 34,974). BKI → Rasa Ria by Grab (~RM100).', zh:'已订：10:35 小型车前往 KLIA T1（KRW 34,974）。亚庇机场 → 莎利雅乘 Grab（约RM100）。'},
    tips:{en:'Sabah runs its own immigration — passports required even on this domestic flight. Sit on the left for coastline views on descent.', zh:'沙巴设独立移民检查 —— 国内航班也需护照。下降时坐左侧可赏海岸线。'},
    cost:{en:'~RM 516 · 2 pax on-trip', zh:'约RM 516 · 两人当日花费'},
    flight:{ route:{en:'Kuala Lumpur (KUL T1) → Kota Kinabalu (BKI T1)', zh:'吉隆坡（KUL T1）→ 亚庇（BKI T1）'},
             airline:{en:'Batik Air OD1004 · business class', zh:'峇迪航空 OD1004 · 商务舱'},
             time:{en:'13:30 → 16:00 · ~2h 30m', zh:'13:30 → 16:00 · 约2小时30分'},
             ref:{en:'Booked · pkg RM 2,796 w/ Rasa Ria', zh:'已出票 · 与莎利雅套票 RM 2,796'} } },

  { date:{en:'Jul 20 · Mon', zh:'7月20 · 周一'}, city:'pg',
    title:{en:'Into the city · The Shore', zh:'进城 · The Shore'},
    morning:{en:'Resort breakfast, checkout by 12:00. Grab into the city — The Shore Kota Kinabalu by Meetstay: Family Suite “Lux Balcony & Seaview” B1613, 2 nights (check-in from 15:00).', zh:'度假村早餐，12:00 前退房。Grab 进城 —— The Shore Kota Kinabalu by Meetstay：家庭套房「Lux Balcony & Seaview」B1613，2 晚（15:00 起入住）。'},
    afternoon:{en:'13:30 lunch at Todak Waterfront. Afternoon along the seafront: I Love KK sign, Todak & KK Waterfront.', zh:'13:30 于 Todak Waterfront 午餐。下午沿海滨游览：我爱亚庇打卡点、Todak 与亚庇海滨。'},
    evening:{en:'Filipino Night Market + Handicraft Market — grilled-seafood dinner and souvenir browsing (~RM200).', zh:'菲律宾夜市 + 手工艺市场 —— 炭烤海鲜晚餐与手信采购（约RM200）。'},
    meals:{ breakfast:{en:'Rasa Ria (included)', zh:'莎利雅（已含）'}, lunch:{en:'Todak Waterfront · ~RM120', zh:'Todak Waterfront · 约RM120'}, dinner:{en:'Filipino Night Market · ~RM150', zh:'菲律宾夜市 · 约RM150'} },
    transport:{en:'Grab Rasa Ria → city (~RM100); the waterfront is walkable from The Shore.', zh:'Grab 莎利雅 → 市区（约RM100）；海滨自 The Shore 步行可达。'},
    tips:{en:'Early night — tomorrow\'s island boat leaves at 08:30 and breakfast is at 06:00.', zh:'早点休息 —— 明日 08:30 出海，06:00 早餐。'},
    cost:{en:'~RM 420 · 2 pax on-trip', zh:'约RM 420 · 两人当日花费'} },

  { date:{en:'Jul 21 · Tue', zh:'7月21 · 周二'}, city:'pg',
    title:{en:'Islands — Sapi & Manukan', zh:'跳岛 —— 沙庇岛与马努干岛'},
    morning:{en:'06:00 early breakfast. 07:30 to Jesselton Point Port. 08:30–15:30 day trip to Sapi & Manukan islands — snorkelling + parasailing (Daeng Travel, RM356 for two, entry & boat fees included).', zh:'06:00 早餐。07:30 前往 Jesselton Point 码头。08:30–15:30 沙庇岛与马努干岛一日游 —— 浮潜 + 帆伞（Daeng Travel，两人 RM356，含门票与船票）。'},
    afternoon:{en:'15:30 back to The Shore — shower, rest, balcony sunset.', zh:'15:30 返回 The Shore —— 冲洗、休息、阳台看日落。'},
    evening:{en:'20:00 dinner at Rooftop Bar & Grill, Hilton Kota Kinabalu (booked, à la carte, ~RM150).', zh:'20:00 于亚庇希尔顿 Rooftop Bar & Grill 晚餐（已预订，单点，约RM150）。'},
    meals:{ breakfast:{en:'Early, at the hotel', zh:'酒店早班早餐'}, lunch:{en:'On the islands', zh:'岛上'}, dinner:{en:'Rooftop Bar & Grill · booked 20:00 · ~RM150', zh:'Rooftop Bar & Grill · 已订 20:00 · 约RM150'} },
    transport:{en:'Grab to Jesselton Point (~RM15 each way); boat included in the package.', zh:'Grab 往 Jesselton Point（单程约RM15）；船票已含于套餐。'},
    tips:{en:'Reef-safe sunscreen, dry bag, water shoes. Lounge passes become valid today — keep the QR codes handy for tomorrow.', zh:'珊瑚友好防晒霜、防水袋、涉水鞋。贵宾室通行证今日起生效 —— 明日备好 QR 码。'},
    cost:{en:'~RM 580 · 2 pax on-trip', zh:'约RM 580 · 两人当日花费'} },

  { date:{en:'Jul 22 · Wed', zh:'7月22 · 周三'}, city:'kl',
    title:{en:'Back to KL · Curate at Four Seasons', zh:'返回吉隆坡 · 四季 Curate'},
    morning:{en:'Breakfast, checkout by 12:00. ~13:00 Grab to BKI Terminal 1. LoungeKey lounge before the flight (Collinson QR codes, both travellers).', zh:'早餐后 12:00 前退房。约 13:00 Grab 前往亚庇机场 1 号航站楼。登机前使用 LoungeKey 贵宾室（Collinson QR 码，两人均有）。'},
    afternoon:{en:'15:10–17:45 Batik Air OD1017, business class, BKI T1 → Subang (SZB) — note: not KLIA. 18:25 booked transfer to Le Méridien Petaling Jaya — Executive Twin, 3 nights (Jul 22–25).', zh:'15:10–17:45 峇迪航空 OD1017 商务舱，BKI T1 → 梳邦机场（SZB）—— 注意：并非 KLIA。18:25 已订专车前往八打灵再也艾美酒店 —— 行政双床房，3 晚（7月22–25）。'},
    evening:{en:'20:30 dinner at Curate, Four Seasons Hotel Kuala Lumpur — table for 2 (booked via OpenTable). KLCC / Petronas Towers night stroll after, time permitting.', zh:'20:30 于吉隆坡四季酒店 Curate 晚餐 —— 2 人桌（已通过 OpenTable 预订）。若时间允许，饭后夜游 KLCC / 双子塔。'},
    meals:{ breakfast:{en:'Hotel', zh:'酒店'}, lunch:{en:'Airport lounge', zh:'机场贵宾室'}, dinner:{en:'Curate · booked 20:30 · ~RM500', zh:'Curate · 已订 20:30 · 约RM500'} },
    transport:{en:'Booked: minivan pickup 18:25 SZB → Le Méridien PJ (KRW 35,925). Grab to/from Four Seasons (~RM100).', zh:'已订：18:25 小型车 SZB → 艾美（KRW 35,925）。往返四季乘 Grab（约RM100）。'},
    tips:{en:'Passport ready for the Sabah exit checkpoint. Curate is in KLCC — allow ~40 min from PJ in evening traffic.', zh:'离开沙巴需过移民检查，护照随身。Curate 位于 KLCC —— 晚高峰自八打灵出发预留约 40 分钟。'},
    cost:{en:'~RM 775 · 2 pax on-trip', zh:'约RM 775 · 两人当日花费'},
    flight:{ route:{en:'Kota Kinabalu (BKI T1) → Kuala Lumpur Subang (SZB)', zh:'亚庇（BKI T1）→ 吉隆坡梳邦机场（SZB）'},
             airline:{en:'Batik Air OD1017 · business class', zh:'峇迪航空 OD1017 · 商务舱'},
             time:{en:'15:10 → 17:45 · ~2h 35m', zh:'15:10 → 17:45 · 约2小时35分'},
             ref:{en:'Booked · pkg RM 3,154 w/ Le Méridien', zh:'已出票 · 与艾美套票 RM 3,154'} } },

];

/* ---------- flights (reference card) ---------- */
const FLIGHTS_REF = [
  { route:{en:'→ Kuala Lumpur (KUL T1)', zh:'→ 吉隆坡（KUL T1）'},
    date:{en:'Thu, Jul 16 · MH377', zh:'7月16 周四 · MH377'},
    detail:{en:'Arrival flight — booked transfer waits from 19:20', zh:'抵达航班 —— 专车 19:20 起等候'},
    cost:{en:'—', zh:'—'} },
  { route:{en:'KUL T1 → BKI T1', zh:'KUL T1 → BKI T1'},
    date:{en:'Sun, Jul 19 · Batik Air OD1004 · business', zh:'7月19 周日 · 峇迪 OD1004 · 商务舱'},
    detail:{en:'13:30 → 16:00 · booked', zh:'13:30 → 16:00 · 已出票'},
    cost:{en:'RM 2,796 pkg (with Rasa Ria)', zh:'套票 RM 2,796（含莎利雅）'} },
  { route:{en:'BKI T1 → Subang (SZB)', zh:'BKI T1 → 梳邦（SZB）'},
    date:{en:'Wed, Jul 22 · Batik Air OD1017 · business', zh:'7月22 周三 · 峇迪 OD1017 · 商务舱'},
    detail:{en:'15:10 → 17:45 · lands at Subang, NOT KLIA', zh:'15:10 → 17:45 · 降落梳邦机场，非 KLIA'},
    cost:{en:'RM 3,154 pkg (with Le Méridien)', zh:'套票 RM 3,154（含艾美）'} },
];

/* ---------- booked transfers + ground ---------- */
const TRANSPORT_REF = [
  { name:{en:'Jul 16 · 19:20 · KLIA T1 → Park Hyatt', zh:'7月16 · 19:20 · KLIA T1 → 柏悦'},
    sub:{en:'Premium 7-seater · Trip.com', zh:'高级 7 座车 · Trip.com'},
    cost:{en:'KRW 66,596 · paid', zh:'KRW 66,596 · 已付'} },
  { name:{en:'Jul 19 · 10:35 · Park Hyatt → KLIA T1', zh:'7月19 · 10:35 · 柏悦 → KLIA T1'},
    sub:{en:'Minivan · Trip.com', zh:'小型车 · Trip.com'},
    cost:{en:'KRW 34,974 · paid', zh:'KRW 34,974 · 已付'} },
  { name:{en:'Jul 22 · 18:25 · Subang (SZB) → Le Méridien PJ', zh:'7月22 · 18:25 · 梳邦（SZB）→ 艾美'},
    sub:{en:'Minivan · Trip.com', zh:'小型车 · Trip.com'},
    cost:{en:'KRW 35,925 · paid', zh:'KRW 35,925 · 已付'} },
  { name:{en:'Everything else — Grab', zh:'其余行程 —— Grab'},
    sub:{en:'BKI↔hotels, city hops, PJ tail days', zh:'亚庇机场↔酒店、市内、尾段八打灵'},
    cost:{en:'~RM 770 budgeted', zh:'预算约RM 770'} },
];

/* ---------- stays ({name, city, dates, room, refline, cost}) ---------- */
const STAYS_REF = [
  { name:'Park Hyatt Kuala Lumpur', city:'kl',
    dates:{en:'Jul 16–19 · 3 nights · breakfast included', zh:'7月16–19 · 3晚 · 含早餐'},
    room:{en:'Merdeka 118 tower', zh:'Merdeka 118 大楼'},
    cost:'RM 4,631.36' },
  { name:'Shangri-La Rasa Ria', city:'pg',
    dates:{en:'Jul 19–20 · 1 night · breakfast included', zh:'7月19–20 · 1晚 · 含早餐'},
    room:{en:'Garden Wing Deluxe Sea View Twin · Pantai Dalit, Tuaran', zh:'花园翼豪华海景双床房 · 杜亚兰 Pantai Dalit'},
    cost:{en:'in RM 2,796 pkg', zh:'含于 RM 2,796 套票'} },
  { name:'The Shore Kota Kinabalu by Meetstay', city:'pg',
    dates:{en:'Jul 20–22 · 2 nights', zh:'7月20–22 · 2晚'},
    room:{en:'Family Suite “Lux Balcony & Seaview” B1613', zh:'家庭套房「Lux Balcony & Seaview」B1613'},
    cost:'RM 338.27' },
  { name:'Le Méridien Petaling Jaya', city:'kl',
    dates:{en:'Jul 22–25 · 3 nights', zh:'7月22–25 · 3晚'},
    room:{en:'Executive Twin Room', zh:'行政双床房'},
    cost:{en:'in RM 3,154 pkg', zh:'含于 RM 3,154 套票'} },
];

/* ---------- dining ({name, city, sub, cost, note}) ---------- */
const DINING_REF = [
  { name:'Park Lounge · Park Hyatt', city:'kl', booked:true,
    sub:{en:'Malaysian set · in-hotel', zh:'马来风味 · 酒店内'},
    cost:{en:'~RM 343', zh:'约RM 343'},
    note:{en:'Booked ✓ Jul 17, 18:00', zh:'已订 ✓ 7月17 18:00'} },
  { name:'Arté 66 Restaurant & Bar', city:'kl', booked:true,
    sub:{en:'Dinner / couple set', zh:'晚餐 / 双人套餐'},
    cost:{en:'~RM 500', zh:'约RM 500'},
    note:{en:'Booked ✓ Jul 18, 20:00 · 2 adults', zh:'已订 ✓ 7月18 20:00 · 2 位成人'} },
  { name:'Tepi Laut · Rasa Ria', city:'pg', booked:true,
    sub:{en:'“Roast Night” poolside buffet', zh:'「Roast Night」池畔自助'},
    cost:{en:'~RM 316', zh:'约RM 316'},
    note:{en:'Booked ✓ Jul 19, 19:30', zh:'已订 ✓ 7月19 19:30'} },
  { name:'Rooftop Bar & Grill · Hilton KK', city:'pg', booked:true,
    sub:{en:'À la carte dining', zh:'单点晚餐'},
    cost:{en:'~RM 150', zh:'约RM 150'},
    note:{en:'Booked ✓ Jul 21, 20:00', zh:'已订 ✓ 7月21 20:00'} },
  { name:'Curate · Four Seasons KL', city:'kl', booked:true,
    sub:{en:'Hotel signature restaurant · 145 Jalan Ampang', zh:'酒店招牌餐厅 · 145 Jalan Ampang'},
    cost:{en:'~RM 500', zh:'约RM 500'},
    note:{en:'Booked ✓ Jul 22, 20:30 · via OpenTable', zh:'已订 ✓ 7月22 20:30 · 经 OpenTable'} },
  { name:'Seoul Garden · LaLaport BBCC', city:'kl',
    sub:{en:'Arrival-night dinner, walk from Park Hyatt', zh:'抵达夜晚餐，柏悦步行可达'},
    cost:{en:'~RM 220', zh:'约RM 220'},
    note:{en:'Jul 16 · walk-in', zh:'7月16 · 无需预订'} },
  { name:'Todak Waterfront', city:'pg',
    sub:{en:'Seafront lunch, KK waterfront', zh:'亚庇海滨午餐'},
    cost:{en:'~RM 120', zh:'约RM 120'},
    note:{en:'Jul 20 · walk-in', zh:'7月20 · 无需预订'} },
  { name:{en:'Filipino Night Market', zh:'菲律宾夜市'}, city:'pg',
    sub:{en:'Grilled seafood + handicraft market', zh:'炭烤海鲜 + 手工艺市场'},
    cost:{en:'~RM 150', zh:'约RM 150'},
    note:{en:'Jul 20 · cash', zh:'7月20 · 现金'} },
];

/* ---------- experiences ---------- */
const EXPERIENCES_REF = [
  { name:{en:'Sapi & Manukan island day trip', zh:'沙庇岛与马努干岛一日游'}, city:'pg', booked:true,
    sub:{en:'Snorkelling + parasailing · Jesselton Point 07:30', zh:'浮潜 + 帆伞 · 07:30 Jesselton Point'},
    cost:{en:'RM 356 · paid', zh:'RM 356 · 已付'},
    note:{en:'Booked ✓ Jul 21 · Daeng Travel · fees included', zh:'已订 ✓ 7月21 · Daeng Travel · 含门票船票'} },
  { name:{en:'Chinatown heritage walk', zh:'茨厂街古迹漫步'}, city:'kl',
    sub:{en:'Pasar Seni, temples, Kwai Chai Hong', zh:'中央艺术坊、庙宇、鬼仔巷'},
    cost:{en:'~RM 50', zh:'约RM 50'},
    note:{en:'Jul 17', zh:'7月17'} },
  { name:{en:'Museums & Masjid Negara', zh:'博物馆与国家清真寺'}, city:'kl',
    sub:{en:'Islamic Arts Museum RM40 (student RM10)', zh:'伊斯兰艺术博物馆 RM40（学生 RM10）'},
    cost:{en:'~RM 50', zh:'约RM 50'},
    note:{en:'Jul 18 morning', zh:'7月18 上午'} },
  { name:{en:'KL Tower & TRX Exchange', zh:'吉隆坡塔与 TRX'}, city:'kl',
    sub:{en:'Tower views, then luxury-mall stroll', zh:'塔上观景，随后逛奢侈品商场'},
    cost:{en:'~RM 65', zh:'约RM 65'},
    note:{en:'Jul 18 afternoon', zh:'7月18 下午'} },
  { name:{en:'River of Life & Dataran Merdeka by night', zh:'夜游生命之河与独立广场'}, city:'kl',
    sub:{en:'I Love KL sign, Kolam Biru', zh:'I Love KL 打卡点、蓝池'},
    cost:{en:'Free', zh:'免费'},
    note:{en:'Jul 17 evening', zh:'7月17 晚间'} },
  { name:{en:'KK waterfront & I Love KK', zh:'亚庇海滨与我爱亚庇'}, city:'pg',
    sub:{en:'Seafront walk, markets', zh:'海滨漫步、市集'},
    cost:{en:'Free', zh:'免费'},
    note:{en:'Jul 20', zh:'7月20'} },
];

/* ---------- know before you go ({label,value}) ---------- */
const ESSENTIALS_REF = [
  { label:{en:'Insurance', zh:'保险'}, value:{en:'Generali Travel PA Domestic — both travellers, Jul 16–25 (RM 34.56). 24-h emergency: +603 7628 3658.', zh:'Generali 国内旅行险 —— 两人，7月16–25（RM 34.56）。24 小时紧急电话：+603 7628 3658。'} },
  { label:{en:'Lounge', zh:'贵宾室'}, value:{en:'LoungeKey QR passes (Collinson) for both travellers, valid Jul 21 – Aug 6 — use at BKI on Jul 22. Save the QR codes offline.', zh:'LoungeKey QR 通行证（Collinson），两人均有，7月21 – 8月6 有效 —— 7月22 在亚庇机场使用。请离线保存 QR 码。'} },
  { label:{en:'Sabah entry', zh:'沙巴入境'}, value:{en:'Sabah has its own immigration checkpoint — carry passports even on the domestic KUL–BKI legs.', zh:'沙巴设独立移民检查 —— 即便国内航段也需随身携带护照。'} },
  { label:{en:'Return airport', zh:'回程机场'}, value:{en:'OD1017 lands at Subang (SZB), NOT KLIA — the booked transfer waits there at 18:25.', zh:'OD1017 降落梳邦机场（SZB），并非 KLIA —— 已订专车 18:25 在此等候。'} },
  { label:{en:'Currency', zh:'货币'}, value:{en:'Malaysian Ringgit (RM). Cards in hotels & malls; cash for markets, street food, island stalls. ATMs everywhere.', zh:'马来西亚林吉特（RM）。酒店商场可刷卡；市集、街食、岛上小摊用现金。ATM 普及。'} },
  { label:{en:'Connectivity', zh:'网络'}, value:{en:'Local eSIM/SIM (CelcomDigi, Maxis) or Airalo at the airport. Grab app for rides & food.', zh:'机场购本地 eSIM/SIM（CelcomDigi、Maxis）或 Airalo。叫车与外卖用 Grab。'} },
  { label:{en:'Power', zh:'电源'}, value:{en:'Type G plug, 230V / 50Hz — bring a UK-style adapter.', zh:'Type G 插头，230V / 50Hz —— 请备英式转换插头。'} },
  { label:{en:'Emergency', zh:'紧急电话'}, value:{en:'999 (police/ambulance), 994 (fire), 112 from any mobile.', zh:'999（警察/救护），994（消防），手机拨 112。'} },
  { label:{en:'Time zone', zh:'时区'}, value:{en:'MYT, UTC+8 (same as China; Korea is 1h ahead). No KL–KK difference.', zh:'马来西亚时间 UTC+8（与中国相同；韩国快 1 小时）。吉隆坡与亚庇无时差。'} },
  { label:{en:'Tipping', zh:'小费'}, value:{en:'Not customary; service charge usually included.', zh:'非惯例；账单常含服务费。'} },
];

/* ---------- packing ({en,zh} strings) ---------- */
const PACKING_REF = [
  {en:'Lightweight linen & cotton clothing', zh:'轻薄棉麻衣物'},
  {en:'Swimwear & reef-safe sunscreen', zh:'泳装与珊瑚友好防晒霜'},
  {en:'Dry bag + water shoes for the island day', zh:'跳岛用防水袋 + 涉水鞋'},
  {en:'Light rain shell or compact umbrella', zh:'轻便雨衣或折叠伞'},
  {en:'Insect repellent', zh:'驱蚊剂'},
  {en:'Comfortable walking shoes', zh:'舒适步行鞋'},
  {en:'Sunglasses & sun hat', zh:'太阳镜与遮阳帽'},
  {en:'Type-G power adapter & power bank', zh:'Type-G 转换插头与充电宝'},
  {en:'Smart-casual outfit for the reserved dinners', zh:'已订晚餐所需的时尚休闲装'},
  {en:'Modest layer for temples & Masjid Negara', zh:'参观庙宇与清真寺的得体披肩'},
  {en:'Student ID (museum discounts)', zh:'学生证（博物馆折扣）'},
];

/* ---------- pre-trip checklist ({en,zh}, done flag) ---------- */
const CHECKLIST_REF = [
  { done:true,  en:'Hotels booked: Park Hyatt · Rasa Ria · The Shore · Le Méridien', zh:'酒店已订：柏悦 · 莎利雅 · The Shore · 艾美' },
  { done:true,  en:'Flights booked: OD1004 (Jul 19) & OD1017 (Jul 22), business', zh:'机票已订：OD1004（7月19）与 OD1017（7月22），商务舱' },
  { done:true,  en:'Transfers booked: Jul 16 / 19 / 22 (Trip.com)', zh:'接送已订：7月16 / 19 / 22（Trip.com）' },
  { done:true,  en:'Dinners reserved: Park Lounge · Arté 66 · Tepi Laut · Rooftop B&G · Curate', zh:'晚餐已订：Park Lounge · Arté 66 · Tepi Laut · Rooftop B&G · Curate' },
  { done:true,  en:'Island trip paid: Daeng Travel, Jul 21', zh:'跳岛已付：Daeng Travel，7月21' },
  { done:true,  en:'Travel insurance issued: Generali (Jul 16–25)', zh:'旅行保险已出单：Generali（7月16–25）' },
  { done:true,  en:'Lounge passes issued (LoungeKey QR, both pax)', zh:'贵宾室通行证已出（LoungeKey QR，两人）' },
  { done:false, en:'Online check-in for OD1004 & OD1017', zh:'为 OD1004 与 OD1017 办理网上值机' },
  { done:false, en:'Save booking PDFs + lounge QRs offline on both phones', zh:'两部手机离线保存预订 PDF 与贵宾室 QR 码' },
  { done:false, en:'MYR cash + eSIM on arrival', zh:'抵达后备林吉特现金 + eSIM' },
  { done:false, en:'Passports (6+ months) — needed again at the Sabah checkpoint', zh:'护照（有效期 6 个月以上）—— 沙巴检查站需再次出示' },
  { done:false, en:'Watch Trip.com app for driver details before each pickup', zh:'每次接送前在 Trip.com App 查看司机信息' },
];
