/* ============================================================
   AutóTanács — TUDÁSBÁZIS
   ------------------------------------------------------------
   Motorkód-, modell- és váltó-specifikus, széles körben
   dokumentált tipikus hibák. Ez adja a demó mód valódi értékét:
   nem általánosságokat mond, hanem azt, ami EZT a motort érinti.

   Minden tétel:
     m      – minta, amire illeszkedik (a modell + szabad szöveg alapján)
     name   – emberi név (megjelenik a válaszban)
     faults – tipikus hibák
       from – kb. ettől a km-től szokott jelentkezni
       sev  – "high" (drága/súlyos) | "mid"
       cost – tájékoztató javítási költség

   FIGYELEM: közösségi/szerelői tapasztalat alapján összeállított
   tájékoztatás, nem gyári hibalista. Egyedi darabnál eltérhet.
   ============================================================ */

const KB_ENGINES = [
  /* ---------- VW-csoport dízel ---------- */
  {
    m: /\b1[.,]9\s*(pd\s*)?tdi\b/i, name: "1.9 PD TDI",
    faults: [
      { title: "Vezérműszíj — kihagyva motorkár", from: 90000, sev: "high", cost: "80–200 e Ft",
        detail: "Ennél a motornál kritikus: 90–120 e km-enként kell. Elszakadva a szelepek a dugattyúba érnek." },
      { title: "PD porlasztó (injektor) kopás", from: 200000, sev: "high", cost: "50–120 e Ft / db",
        detail: "Egységporlasztós rendszer: nehéz hidegindítás, kopogás, füstölés a jele. 250 e km felett gyakori." },
      { title: "Turbó tolórúd (VNT) beragadása", from: 180000, sev: "mid", cost: "30–150 e Ft",
        detail: "Kormos állítómű: teljesítményvesztés, hibakód. Tisztítással sokszor menthető." },
      { title: "Kétsúlyú lendkerék + kuplung", from: 200000, sev: "high", cost: "150–350 e Ft",
        detail: "Alapjáraton zörgés, kuplungpedálon rezgés a jele." },
    ],
    note: "A csoport legmegbízhatóbb dízele — de csak rendszeres vezérműszíj-cserével.",
  },
  {
    m: /\b2[.,]0\s*(pd\s*)?tdi\b/i, name: "2.0 TDI",
    faults: [
      { title: "Olajpumpa hatszög-hajtás (PD, BKD/BMM)", from: 120000, sev: "high", cost: "250–800 e Ft",
        detail: "A 2003–2008 közötti PD változat hírhedt hibája: a hatszög elkopik, megszűnik az olajnyomás, a motor tönkremegy. KÉRDEZZ rá, cserélték-e a módosított darabra." },
      { title: "Vezérműszíj + vízpumpa", from: 100000, sev: "high", cost: "90–250 e Ft",
        detail: "120–150 e km-enként. Elmulasztva komoly motorkár." },
      { title: "EGR-hűtő szivárgás / eltömődés", from: 150000, sev: "mid", cost: "80–250 e Ft",
        detail: "Hűtővíz-fogyás vagy fehér füst utalhat rá a CR változatoknál." },
      { title: "DPF (részecskeszűrő) eltömődés", from: 150000, sev: "mid", cost: "tisztítás 50–120 e / csere 250–600 e Ft",
        detail: "Városi, rövid utas használatnál nem tud regenerálódni." },
    ],
  },
  {
    m: /\b1[.,]6\s*tdi\b/i, name: "1.6 TDI CR",
    faults: [
      { title: "DPF + EGR eltömődés", from: 120000, sev: "mid", cost: "80–400 e Ft",
        detail: "Ez a motor különösen érzékeny a rövid, városi utakra." },
      { title: "Vezérműszíj", from: 100000, sev: "high", cost: "80–200 e Ft",
        detail: "Gyári terv szerint kb. 120–180 e km, de sok szerelő korábbi cserét javasol." },
      { title: "Vízpumpa / termosztátház szivárgás", from: 130000, sev: "mid", cost: "60–150 e Ft",
        detail: "Műanyag házas kivitel, szivárgásra hajlamos." },
    ],
  },
  /* ---------- VW-csoport benzin ---------- */
  {
    m: /\b1[.,]4\s*tsi\b|\b1[.,]2\s*tsi\b/i, name: "1.2 / 1.4 TSI (EA111)",
    faults: [
      { title: "VEZÉRMŰLÁNC-FESZÍTŐ hibája", from: 60000, sev: "high", cost: "250–700 e Ft",
        detail: "A 2005–2015 közötti EA111 motorok hírhedt hibája: a feszítő megadja magát, a lánc átugrik, a motor tönkremegy. Hidegindításkor csörgő/kattogó hang a figyelmeztetés. Ez a LEGFONTOSABB ellenőrzési pont ennél a motornál." },
      { title: "Olajfogyás (dugattyúgyűrű)", from: 120000, sev: "high", cost: "felújítás 500 e – 1,5 M Ft",
        detail: "Sok darab literenként fogyaszt olajat 1000 km-en. Kérdezz rá a fogyasztásra." },
      { title: "Vízpumpa / termosztát szivárgás", from: 90000, sev: "mid", cost: "60–160 e Ft",
        detail: "Elektromos vízpumpás kivitel gyakori hibapont." },
      { title: "Szívószelep-koksz (közvetlen befúvás)", from: 120000, sev: "mid", cost: "60–180 e Ft",
        detail: "Rossz alapjárat, teljesítményvesztés; gyöngyfúvatásos tisztítás segít." },
    ],
    note: "Ha az évjárat 2013 utáni, lehet a megbízhatóbb EA211 (szíjas) — ellenőrizd a motorkódot!",
  },
  {
    m: /\b(1[.,]8|2[.,]0)\s*(tfsi|tsi)\b/i, name: "1.8 / 2.0 TFSI (EA888)",
    faults: [
      { title: "Olajfogyás (dugattyúgyűrű, gen1–gen2)", from: 100000, sev: "high", cost: "felújítás 600 e – 1,8 M Ft",
        detail: "A 2008–2012 közötti darabok hírhedt hibája. Kérdezz rá, mennyi olajat fogyaszt 1000 km-en." },
      { title: "Vezérműlánc-feszítő", from: 120000, sev: "high", cost: "250–600 e Ft",
        detail: "Hidegindításkor rövid csörgés a jele." },
      { title: "PCV / karterszellőző membrán", from: 100000, sev: "mid", cost: "40–120 e Ft",
        detail: "Alapjárati hiba, olajszivárgás, sípoló hang." },
      { title: "Szívószelep-koksz", from: 100000, sev: "mid", cost: "60–180 e Ft", detail: "Közvetlen befúvás jellemző problémája." },
    ],
  },
  /* ---------- BMW ---------- */
  {
    m: /\bn47\b|\b(118|120|318|320|520)d\b/i, name: "BMW N47 dízel",
    faults: [
      { title: "VEZÉRMŰLÁNC szakadás (hátsó lánc)", from: 120000, sev: "high", cost: "600 e – 1,5 M Ft",
        detail: "A 2007–2011 közötti N47 hírhedt hibája: a lánc a motor HÁTULJÁN van, javításhoz ki kell szedni a motort. Hidegindításkor mély csörgő/kelepelő hang a figyelmeztetés. Ez a legfontosabb ellenőrzés ennél a motornál." },
      { title: "Örvényszelep (swirl flap) letörés", from: 150000, sev: "high", cost: "150–500 e Ft",
        detail: "A letört szelep beszívódhat a motorba. Sokan kiszerelik/kiiktatják." },
      { title: "EGR-hűtő szivárgás", from: 150000, sev: "mid", cost: "100–300 e Ft", detail: "Hűtővíz-fogyás, füstölés." },
      { title: "DPF eltömődés", from: 150000, sev: "mid", cost: "tisztítás 60–150 e / csere 300–700 e Ft", detail: "Városi használatnál kockázatos." },
    ],
  },
  {
    m: /\bm57\b|\b(330d|530d|730d|X5\s*3[.,]0d)\b/i, name: "BMW M57 dízel",
    faults: [
      { title: "Örvényszelep (swirl flap) letörés", from: 150000, sev: "high", cost: "150–500 e Ft",
        detail: "Klasszikus M57-hiba: letörve beszívódik a motorba. Sok autóban már kiiktatták — kérdezz rá." },
      { title: "Örvénykamra / injektor", from: 200000, sev: "mid", cost: "80–150 e Ft / db", detail: "Nehéz indítás, egyenetlen járás." },
      { title: "Turbó geometria (VNT) beragadás", from: 180000, sev: "mid", cost: "150–500 e Ft", detail: "Teljesítményvesztés, hibakód." },
    ],
    note: "Alapvetően nagyon erős, hosszú életű motor — a swirl flap a fő buktató.",
  },
  {
    m: /\bn20\b|\b(320i|328i|520i|528i)\b/i, name: "BMW N20 benzin",
    faults: [
      { title: "Vezérműlánc vezetősín", from: 120000, sev: "high", cost: "400 e – 1 M Ft",
        detail: "Az N20 ismert hibája; hidegindításkor csörgés a jele." },
      { title: "Olajszűrőház tömítés / szivárgás", from: 100000, sev: "mid", cost: "60–180 e Ft", detail: "Olajfolyás a motor jobb oldalán." },
      { title: "Szelepfedél-tömítés, VANOS mágnesszelep", from: 120000, sev: "mid", cost: "50–200 e Ft", detail: "Olajszivárgás, alapjárati hiba." },
    ],
  },
  /* ---------- PSA (Peugeot / Citroën / és partnerek) ---------- */
  {
    m: /\b1[.,]6\s*(hdi|bluehdi|e-hdi)\b|\bdv6\b|\b1[.,]6\s*(tdci|mz-?cd|ddis|d\b)/i, name: "1.6 HDi / DV6 (PSA)",
    faults: [
      { title: "TURBÓ olajellátó cső eltömődése", from: 120000, sev: "high", cost: "250–600 e Ft",
        detail: "Ennek a motornak A hibája: az elkokszolódott olajcső miatt a turbó olaj nélkül marad és tönkremegy. Kérdezz rá, cserélték-e a csövet és a szűrőt. Ford (TDCi), Volvo, Mazda, Suzuki modellekben is ez a motor." },
      { title: "FAP/DPF + Eolys adalék (PSA)", from: 130000, sev: "mid", cost: "adalék 40–90 e / DPF 250–600 e Ft",
        detail: "A PSA rendszer folyékony adalékot használ; ha kifogy vagy a szűrő tele van, hibát ad." },
      { title: "Vezérműszíj", from: 100000, sev: "high", cost: "80–200 e Ft", detail: "Kb. 120–180 e km; elmulasztva motorkár." },
      { title: "Alacsony olajnyomás / olajszivattyú-szűrő", from: 150000, sev: "high", cost: "100–400 e Ft",
        detail: "Az olajiszap eltömíti a szűrőt — rendszeres, jó minőségű olajcsere létfontosságú." },
    ],
  },
  {
    m: /\b1[.,]6\s*(thp|vti)\b|\bep6\b|\bmini\s*cooper\s*s\b/i, name: "1.6 THP / EP6 (PSA–BMW)",
    faults: [
      { title: "VEZÉRMŰLÁNC nyúlás", from: 80000, sev: "high", cost: "250–600 e Ft",
        detail: "Az EP6 hírhedt hibája: a lánc nyúlik, hidegindításkor csörög. Elhanyagolva a lánc átugrik." },
      { title: "Szívószelep-koksz (THP)", from: 80000, sev: "mid", cost: "60–200 e Ft",
        detail: "Közvetlen befúvás: rossz alapjárat, rángatás. Rendszeres tisztítás kell." },
      { title: "Olajfogyás", from: 100000, sev: "high", cost: "felújítás 500 e – 1,5 M Ft",
        detail: "Sok darab jelentős olajat fogyaszt — MINDIG kérdezz rá." },
      { title: "Turbó és vákuumpumpa", from: 120000, sev: "mid", cost: "150–500 e Ft", detail: "Teljesítményvesztés, kemény fékpedál." },
    ],
    note: "Vezetni élvezetes, fenntartani drága motor — csak teljes szerviztörténettel érdemes.",
  },
  {
    m: /\b1[.,]2\s*(puretech|pt)\b|\beb2\b/i, name: "1.2 PureTech",
    faults: [
      { title: "NEDVES VEZÉRMŰSZÍJ bomlása", from: 60000, sev: "high", cost: "300 e – 1,5 M Ft",
        detail: "A nedves (olajban futó) szíj lemorzsolódik, a darabok eltömítik az olajszűrőt → motorkár. Ez a legfrissebb nagy PSA-probléma; sok gyártó előrehozta a csereintervallumot. MINDIG kérdezz rá." },
      { title: "Olajfogyás, láncfeszítő", from: 100000, sev: "mid", cost: "100–400 e Ft", detail: "Nézd meg az olajszintet és a szerviztörténetet." },
    ],
  },
  {
    m: /\b2[.,]0\s*hdi\b/i, name: "2.0 HDi (PSA)",
    faults: [
      { title: "Vezérműszíj", from: 100000, sev: "high", cost: "80–220 e Ft", detail: "Kb. 120–160 e km-enként." },
      { title: "Turbó és EGR", from: 180000, sev: "mid", cost: "150–500 e Ft", detail: "Teljesítményvesztés, füstölés." },
      { title: "FAP/DPF", from: 150000, sev: "mid", cost: "250–600 e Ft", detail: "Városi használatnál kockázatos." },
    ],
    note: "A 2.0 HDi alapvetően erős, jól bírja a km-et.",
  },
  /* ---------- Renault / Dacia / Nissan ---------- */
  {
    m: /\b1[.,]5\s*dci\b|\bk9k\b/i, name: "1.5 dCi (K9K)",
    faults: [
      { title: "Injektor hiba", from: 150000, sev: "mid", cost: "80–160 e Ft / db",
        detail: "Nehéz indítás, egyenetlen alapjárat, füstölés. A leggyakoribb K9K-panasz." },
      { title: "Vezérműszíj", from: 100000, sev: "high", cost: "80–180 e Ft", detail: "Kb. 120–150 e km-enként." },
      { title: "Turbó (olajellátás, kokszolódás)", from: 160000, sev: "high", cost: "200–500 e Ft",
        detail: "A magasabb teljesítményű változatok érzékenyebbek; rendszeres olajcsere létfontosságú." },
      { title: "EGR / DPF a 2011 utáni darabokon", from: 150000, sev: "mid", cost: "80–400 e Ft", detail: "Városi használatnál gyakori." },
    ],
    note: "Renault, Dacia, Nissan és Mercedes modellekben is ez a motor. Alapvetően szívós, jó alkatrészellátással.",
  },
  {
    m: /\b1[.,]2\s*tce\b|\bh5ft\b/i, name: "1.2 TCe",
    faults: [
      { title: "Olajfogyás és turbó-hiba", from: 80000, sev: "high", cost: "300 e – 1,2 M Ft",
        detail: "A 2012–2016 közötti darabok gyakori panasza: nagy olajfogyás, majd turbó- vagy motorkár. Kérdezz rá az olajfogyasztásra." },
      { title: "Vezérműlánc nyúlás", from: 100000, sev: "high", cost: "250–600 e Ft", detail: "Hidegindításkor csörgés." },
    ],
  },
  /* ---------- Ford ---------- */
  {
    m: /\b1[.,]0\s*ecoboost\b/i, name: "1.0 EcoBoost",
    faults: [
      { title: "Hűtőrendszer / hengerfej-repedés (korai darabok)", from: 80000, sev: "high", cost: "400 e – 1,5 M Ft",
        detail: "A 2012–2017 közötti darabokon ismert probléma a degas-cső és a hengerfej-repedés túlmelegedés után. Nézd meg a hűtővízszintet és a szerviztörténetet." },
      { title: "Nedves vezérműszíj (későbbi darabok)", from: 100000, sev: "high", cost: "250–700 e Ft",
        detail: "Olajban futó szíj: bomlása eltömíti az olajrendszert. Kérdezz rá a cserére." },
    ],
  },
  {
    m: /\b2[.,]0\s*tdci\b/i, name: "2.0 TDCi",
    faults: [
      { title: "Kétsúlyú lendkerék + kuplung", from: 160000, sev: "high", cost: "200–450 e Ft", detail: "Zörgés alapjáraton, rezgés." },
      { title: "Injektorok", from: 180000, sev: "mid", cost: "80–150 e Ft / db", detail: "Nehéz indítás, kopogás." },
      { title: "DPF + EGR", from: 150000, sev: "mid", cost: "100–500 e Ft", detail: "Városi használatnál gyakori." },
    ],
  },
  /* ---------- Toyota / Honda ---------- */
  {
    m: /\b2[.,]2\s*d-?4d\b|\b2ad\b/i, name: "2.2 D-4D (2AD)",
    faults: [
      { title: "Hengerfej / hengerfejtömítés, olajfogyás", from: 150000, sev: "high", cost: "500 e – 1,5 M Ft",
        detail: "A 2.2 D-4D ismert gyengesége (a 2.0 D-4D lényegesen jobb). Kérdezz rá az olajfogyásra és a hűtővízre." },
      { title: "DPF + injektorok", from: 150000, sev: "mid", cost: "150–600 e Ft", detail: "Városi használatnál különösen." },
    ],
  },
  {
    m: /\b(1[.,]4|1[.,]6|1[.,]8|2[.,]0)\s*(vvt-?i|dual\s*vvt|valvematic)\b|\bvalvematic\b|\bcorolla\b|\bauris\b|\byaris\b|\bverso\b|\bavensis\b/i, name: "Toyota VVT-i / Valvematic benzin",
    faults: [
      { title: "Vezérműlánc (a legtöbb VVT-i-nél lánc van)", from: 200000, sev: "mid", cost: "200–500 e Ft",
        detail: "Nagyon hosszú életű, de 250 e km felett érdemes a zajra figyelni." },
      { title: "Vízpumpa, gyújtótekercs", from: 150000, sev: "mid", cost: "40–150 e Ft", detail: "Rutin kopás ebben a km-sávban." },
    ],
    note: "A legmegbízhatóbb kategória — ha van szerviztörténet, kevés kockázattal jár.",
  },
  {
    m: /prius|\bhsd\b|hybrid\s*synergy/i, name: "Toyota hibrid (HSD)",
    faults: [
      { title: "Hajtásakkumulátor kapacitásvesztés", from: 200000, sev: "high", cost: "400 e – 1,2 M Ft",
        detail: "MINDIG kérj akkumulátor-egészség (SoH) mérést. Cellánként is javítható, de tervezz vele." },
      { title: "EGR eltömődés (3. generációs Prius)", from: 150000, sev: "mid", cost: "60–200 e Ft",
        detail: "A gen3 1.8-as ismert problémája: kokszos EGR, ami hengerfejtömítés-hibához vezethet." },
      { title: "Inverter hűtés / vízpumpa", from: 180000, sev: "mid", cost: "100–350 e Ft", detail: "Hibakód, teljesítménycsökkenés." },
    ],
    note: "A hibrid hajtáslánc maga nagyon megbízható; a fékek és a hagyományos részek keveset kopnak.",
  },
  {
    m: /\btesla\b|\bleaf\b|\bzoe\b|\bi3\b|\be-?golf\b|\bid[.\s]?[34]\b|\bkona\s*elektro|\be-?niro\b|\bioniq\s*5\b|\bmodel\s*[3sxy]\b|\belektromos\b|\bev\b|\bbev\b/i,
    name: "Elektromos hajtáslánc",
    faults: [
      { title: "Hajtásakkumulátor kapacitásvesztés (SoH)", from: 120000, sev: "high", cost: "1,5 – 6 M Ft",
        detail: "Ez az autó legdrágább alkatrésze, és nem látszik rajta semmi. A kapacitás évi 1–3%-kal csökken, gyorstöltésre és melegre érzékenyen. 10 év / 150 e km felett 10–20% veszteség normális — 25% felett a hatótáv már használhatatlanul kevés lehet. MINDIG kérj SoH-mérést (a legtöbb szervíz megcsinálja), és nézd meg, van-e még gyári akkugarancia (általában 8 év / 160 e km)." },
      { title: "Fékek berágódása a rekuperáció miatt", from: 60000, sev: "mid", cost: "60–200 e Ft",
        detail: "Elektromosnál a mechanikus fék alig dolgozik, ezért berozsdásodik és megszorul — pont fordítva, mint egy benzinesnél. Nézd meg a tárcsák peremét és a féknyergek mozgását." },
      { title: "12 voltos kisakkumulátor", from: 50000, sev: "mid", cost: "40–120 e Ft",
        detail: "Elektromosnál is van egy hagyományos 12V-os akku, és ha lemerül, az autó nem indul el, hiába teli a nagy akku. 4–5 évente cserélendő." },
      { title: "Töltőcsatlakozó és fedélzeti töltő", from: 100000, sev: "mid", cost: "150–600 e Ft",
        detail: "Próbáld ki élesben: töltsd meg AC-ról ÉS gyorstöltőről is, mielőtt megveszed." },
    ],
    note: "Egy elektromos autónál nincs olaj, vezérműszíj, turbó, kuplung — a szokásos kopó tételek eltűnnek. Cserébe egyetlen tétel dönt mindent el: az akkumulátor állapota. SoH-mérés nélkül ne vegyél elektromos autót.",
  },
  /* ---------- Opel ---------- */
  {
    m: /\b1[.,]7\s*cdti\b/i, name: "1.7 CDTi (Isuzu)",
    faults: [
      { title: "Vezérműszíj", from: 100000, sev: "high", cost: "80–200 e Ft", detail: "Kb. 120–150 e km-enként." },
      { title: "Turbó / EGR kokszolódás", from: 170000, sev: "mid", cost: "150–450 e Ft", detail: "Teljesítményvesztés, hibakód." },
      { title: "DPF a 2010 utáni darabokon", from: 150000, sev: "mid", cost: "250–600 e Ft", detail: "Városi használatnál." },
    ],
    note: "Az Isuzu-eredetű 1.7 CDTi jó hírű, szívós motor.",
  },
  {
    m: /\b1[.,]9\s*cdti\b|\b1[.,]9\s*jtd\b|\b1[.,]3\s*(cdti|multijet|jtd)\b/i, name: "Fiat/Opel JTD–CDTi dízel",
    faults: [
      { title: "Örvényszelep (1.9) / EGR", from: 150000, sev: "mid", cost: "100–350 e Ft", detail: "Kormos szívócsonk, teljesítményvesztés." },
      { title: "Turbó", from: 160000, sev: "high", cost: "200–500 e Ft", detail: "Rendszeres olajcsere létfontosságú." },
      { title: "DPF", from: 150000, sev: "mid", cost: "250–600 e Ft", detail: "Városi használatnál kockázatos." },
    ],
    note: "A 1.9 JTD/CDTi robusztus; a 1.3 MultiJet kisebb, de sokat bír, ha kímélik.",
  },
  /* ---------- Hyundai / Kia ---------- */
  {
    m: /\b1[.,]6\s*crdi\b|\b1[.,]7\s*crdi\b|\b2[.,]0\s*crdi\b/i, name: "Hyundai/Kia CRDi dízel",
    faults: [
      { title: "EGR és DPF eltömődés", from: 130000, sev: "mid", cost: "100–450 e Ft", detail: "Városi használatnál a leggyakoribb panasz." },
      { title: "Vezérműszíj / lánc a típus szerint", from: 120000, sev: "high", cost: "100–300 e Ft",
        detail: "A CRDi-k egy része láncos — ellenőrizd, melyik változat, és mikor volt csere." },
      { title: "Turbó", from: 180000, sev: "mid", cost: "200–500 e Ft", detail: "Teljesítményvesztés, füstölés." },
    ],
    note: "Jó garanciával indultak, alkatrészellátásuk kedvező.",
  },
  {
    m: /\b(1[.,]6|2[.,]0|2[.,]4)\s*gdi\b|\btheta\b/i, name: "Hyundai/Kia GDI benzin",
    faults: [
      { title: "Szívószelep-koksz", from: 100000, sev: "mid", cost: "60–200 e Ft", detail: "Közvetlen befúvás: rángatás, alapjárati hiba." },
      { title: "Motorkár-kockázat a 2.0/2.4 GDI-nél (Theta II)", from: 120000, sev: "high", cost: "1–2,5 M Ft",
        detail: "A Theta II motorok egy részét gyárilag visszahívták forgattyús-csapágy hiba miatt. Kopogó hang esetén NE vedd meg; kérdezz rá a visszahívásra." },
    ],
  },
  /* ---------- Mercedes ---------- */
  {
    m: /\bom651\b|\b(200|220)\s*cdi\b/i, name: "Mercedes OM651 (2.1 CDI)",
    faults: [
      { title: "Injektor hiba", from: 150000, sev: "high", cost: "150–400 e Ft", detail: "Nehéz indítás, kopogás. Gyakori OM651-panasz." },
      { title: "Vezérműlánc (korai darabok)", from: 150000, sev: "high", cost: "400 e – 1 M Ft",
        detail: "A 2009–2012 közötti darabokon jelentkezett; hidegindításkor csörgés." },
      { title: "Örvényszelep-állítómű, EGR", from: 160000, sev: "mid", cost: "100–350 e Ft", detail: "Hibakód, teljesítményvesztés." },
    ],
  },
  {
    m: /\bom642\b|\b(280|320|350)\s*cdi\b/i, name: "Mercedes OM642 (3.0 V6 CDI)",
    faults: [
      { title: "Olajhűtő tömítés szivárgás", from: 150000, sev: "high", cost: "300–700 e Ft",
        detail: "Az OM642 klasszikus hibája: a motor V-ében szivárog, munkaigényes javítás." },
      { title: "Örvényszelep-állítómű", from: 150000, sev: "mid", cost: "100–300 e Ft", detail: "Hibakód, csökkentett teljesítmény." },
      { title: "DPF + EGR", from: 180000, sev: "mid", cost: "200–600 e Ft", detail: "Városi használatnál." },
    ],
    note: "Erős, hosszú életű motor, de a javítások drágák.",
  },
  /* ---------- Mazda / Volvo ---------- */
  {
    m: /skyactiv-?d|\b2[.,]2\s*skyactiv\b|^(?=.*\bmazda\b)(?=.*\b2[.,]2\s*d\b)/i, name: "Mazda 2.2 Skyactiv-D",
    faults: [
      { title: "Olajhígulás (oil dilution) + DPF", from: 100000, sev: "high", cost: "150–600 e Ft",
        detail: "Rövid, városi utakon a gázolaj bekerül az olajba: emelkedő olajszint a jele. Sűrűbb olajcsere kell." },
      { title: "Szívócsonk elkokszolódás", from: 130000, sev: "mid", cost: "80–250 e Ft", detail: "Teljesítményvesztés." },
      { title: "Turbó", from: 160000, sev: "high", cost: "250–600 e Ft", detail: "Az olajhígulás miatt fokozottan érintett." },
    ],
    note: "Autópályán sokat futó példány jóval kevesebb bajjal jár, mint a városi.",
  },
  {
    m: /\bd5\b|\b2[.,]4\s*d5?\b/i, name: "Volvo D5",
    faults: [
      { title: "Vezérműszíj (kritikus)", from: 100000, sev: "high", cost: "120–350 e Ft",
        detail: "Kb. 120–180 e km; elmulasztva komoly motorkár." },
      { title: "Örvényszelep / szívócsonk", from: 150000, sev: "mid", cost: "150–400 e Ft", detail: "Kormosodás, hibakód." },
      { title: "Injektorok, PCV", from: 180000, sev: "mid", cost: "80–300 e Ft", detail: "Egyenetlen járás, olajszivárgás." },
    ],
  },
  /* ---------- Suzuki ---------- */
  {
    m: /\b1[.,]6\s*(vvt)?\b.*(swift|vitara|sx4)|\b(swift|vitara|sx4)\b.*1[.,]6/i, name: "Suzuki 1.6 benzin",
    faults: [
      { title: "Vezérműlánc", from: 180000, sev: "mid", cost: "150–400 e Ft", detail: "Hosszú életű, de a zajra figyelj 200 e km felett." },
      { title: "Gyújtótekercs, lambdaszonda", from: 150000, sev: "mid", cost: "40–150 e Ft", detail: "Rutin kopás." },
    ],
    note: "Egyszerű, megbízható, olcsón tartható motor.",
  },

  /* ============ VW-CSOPORT — további motorok ============ */
  {
    m: /\bea211\b|\b1[.,]0\s*tsi\b|\b1[.,]5\s*tsi\b/i, name: "1.0 / 1.5 TSI (EA211)",
    faults: [
      { title: "Vezérműszíj (itt SZÍJ van, nem lánc)", from: 120000, sev: "high", cost: "100–250 e Ft",
        detail: "Az EA211 az EA111 utódja — szíjas, és ezzel megszűnt a hírhedt láncfeszítő-probléma. A szíjat viszont cserélni kell, kb. 150–210 e km-enként." },
      { title: "Vízpumpa / termosztátház", from: 100000, sev: "mid", cost: "60–160 e Ft", detail: "Műanyag ház, szivárgásra hajlamos." },
      { title: "1.5 TSI: rángatás alacsony fordulaton", from: 40000, sev: "mid", cost: "szoftver 0–60 e Ft",
        detail: "A korai 1.5 TSI EVO ismert panasza; szoftverfrissítéssel javítható. Kérdezz rá, megkapta-e." },
    ],
    note: "Lényegesen megbízhatóbb, mint a láncos EA111 elődje.",
  },
  {
    m: /\b(1[.,]0|1[.,]2|1[.,]4|1[.,]6)\s*mpi\b|\b1[.,]4\s*16v\b|\bbse\b|\bbgu\b|\bchya\b/i, name: "1.0–1.6 MPI (szívó benzin)",
    faults: [
      { title: "Vezérműszíj", from: 90000, sev: "high", cost: "70–160 e Ft", detail: "Kb. 120 e km-enként; elmulasztva motorkár." },
      { title: "Gyújtótekercs, alapjárat-szabályzó", from: 150000, sev: "mid", cost: "30–120 e Ft", detail: "Rángatás, egyenetlen alapjárat." },
    ],
    note: "Egyszerű, turbó nélküli szívómotor — a csoport egyik legolcsóbban tartható darabja.",
  },
  {
    m: /\bea288\b|\b2[.,]0\s*tdi\b.*(201[3-9]|202\d)|\b1[.,]6\s*tdi\b.*(201[5-9]|202\d)/i, name: "2.0 TDI EA288 (2013+)",
    faults: [
      { title: "EGR-hűtő / szívócsonk kokszolódás", from: 140000, sev: "mid", cost: "100–350 e Ft", detail: "Teljesítményvesztés, hibakód." },
      { title: "AdBlue-rendszer (SCR) hibák", from: 120000, sev: "mid", cost: "150–500 e Ft",
        detail: "A 2015 utáni darabokon: adagolószivattyú, szonda. Indításgátlás is lehet belőle." },
      { title: "Vezérműszíj", from: 120000, sev: "high", cost: "100–250 e Ft", detail: "Kb. 180 e km, de sok szerelő korábbi cserét javasol." },
    ],
    note: "Az EA288 jóval megbízhatóbb, mint a hírhedt PD-elődje (nincs olajpumpa-hatszög probléma).",
  },
  {
    m: /\b3[.,]0\s*tdi\b|\bcasa\b|\bcdu\w?\b/i, name: "3.0 TDI V6",
    faults: [
      { title: "VEZÉRMŰLÁNC a motor hátulján", from: 150000, sev: "high", cost: "700 e – 1,8 M Ft",
        detail: "A lánc a váltó felőli oldalon van: javításhoz motort/váltót kell bontani. Hidegindításkor csörgés a jel." },
      { title: "Olajhűtő / hűtőfolyadék-szivárgás", from: 150000, sev: "mid", cost: "200–500 e Ft", detail: "A V-ben szivárog, munkaigényes." },
      { title: "Örvényszelep-állítómű", from: 160000, sev: "mid", cost: "150–400 e Ft", detail: "Hibakód, csökkentett teljesítmény." },
    ],
  },
  {
    m: /\b2[.,]5\s*tdi\b/i, name: "2.5 TDI V6",
    faults: [
      { title: "Vezérműszíj (nagyon drága munka)", from: 100000, sev: "high", cost: "250–600 e Ft",
        detail: "A motor elejét szinte teljesen bontani kell hozzá. Elmulasztva teljes motorkár." },
      { title: "Turbó(k) és szívócsonk", from: 180000, sev: "high", cost: "300–800 e Ft", detail: "Kettős turbós változatnál duplán." },
    ],
    note: "Erős motor, de a karbantartása drága — csak dokumentált szervizzel érdemes.",
  },
  {
    m: /\b(1[.,]6|2[.,]0)\s*fsi\b/i, name: "1.6 / 2.0 FSI (szívó, közvetlen befúvás)",
    faults: [
      { title: "Szívószelep-koksz", from: 100000, sev: "mid", cost: "60–200 e Ft", detail: "Rángatás, alapjárati hiba; gyöngyfúvatás segít." },
      { title: "2.0 FSI: vezérműszíj + szivattyú-görgő (cam follower)", from: 90000, sev: "high", cost: "60–250 e Ft",
        detail: "A nagynyomású szivattyú görgője kilyukadhat, fémforgács kerül az olajba. Olcsó alkatrész, drága következmény — kérdezz rá!" },
    ],
  },

  /* ============ BMW — további motorok ============ */
  {
    m: /\bn43\b|\b(116i|118i|120i|316i|318i|320i)\b.*(200[7-9]|201[0-2])/i, name: "BMW N43 benzin (2007–2011)",
    faults: [
      { title: "Injektorok és lambdaszondák", from: 100000, sev: "high", cost: "80–150 e Ft / db",
        detail: "Az N43 leghírhedtebb hibája: rángatás, remegő alapjárat, hibalámpa. Gyakran több injektor és a szondák is cserére szorulnak — összesen több százezer forint." },
      { title: "Vezérműlánc", from: 150000, sev: "high", cost: "400 e – 1 M Ft", detail: "Csörgés hidegen." },
    ],
    note: "Az N43 sok fejfájást okoz; az azonos korú N46 (befúvás nélküli) sokkal problémamentesebb.",
  },
  {
    m: /\bn4[26]\b|\bn42\b/i, name: "BMW N42 / N46 benzin",
    faults: [
      { title: "Szelepszár-tömítés (kék füst indításkor)", from: 150000, sev: "mid", cost: "150–400 e Ft", detail: "Hidegindításkor kékes füst a kipufogóból." },
      { title: "Vezérműlánc és VANOS", from: 180000, sev: "high", cost: "300–800 e Ft", detail: "Csörgés, teljesítményvesztés." },
      { title: "Szelepfedél-tömítés, olajszivárgás", from: 120000, sev: "mid", cost: "60–180 e Ft", detail: "Olajszag melegen." },
    ],
  },
  {
    m: /\bn5[45]\b|\b(135i|335i|535i|X6\s*35i)\b/i, name: "BMW N54 / N55 (3.0 turbó benzin)",
    faults: [
      { title: "Nagynyomású üzemanyag-szivattyú (HPFP)", from: 100000, sev: "high", cost: "250–600 e Ft",
        detail: "Az N54 hírhedt hibája: akadozó indítás, teljesítményvesztés, hibalámpa. Több visszahívás is volt rá." },
      { title: "Injektorok", from: 120000, sev: "high", cost: "80–150 e Ft / db", detail: "Egyenetlen járás, hidegindítási gond." },
      { title: "Wastegate kopogás / turbó", from: 130000, sev: "high", cost: "300 e – 1 M Ft", detail: "Alapjáraton kelepelő hang a turbó felől." },
    ],
    note: "Nagyon erős motorok, de a fenntartásuk drága — csak tartalékkal érdemes belevágni.",
  },
  {
    m: /\bm54\b|\b(325i|330i|525i|530i)\b.*(199\d|200[0-5])/i, name: "BMW M54 (E46/E39 hathengeres)",
    faults: [
      { title: "Hűtőrendszer (műanyag alkatrészek)", from: 120000, sev: "high", cost: "150–400 e Ft",
        detail: "A műanyag hűtő, termosztátház és tágulási tartály elöregszik és eltörik — túlmelegedés, ami hengerfejet vihet. Preventív csere ajánlott." },
      { title: "VANOS tömítések", from: 150000, sev: "mid", cost: "80–250 e Ft", detail: "Nyomatékvesztés alacsony fordulaton, zörgés." },
      { title: "DISA-szelep szétesése", from: 150000, sev: "mid", cost: "50–150 e Ft", detail: "A szívócsőben lévő lapát letörhet és beszívódhat." },
    ],
  },
  {
    m: /\bb47\b|\bb48\b/i, name: "BMW B47 / B48 (2015+)",
    faults: [
      { title: "Vezérműlánc a korai B47-nél", from: 100000, sev: "high", cost: "500 e – 1,2 M Ft",
        detail: "A 2015–2017 közötti B47 dízeleknél ismét jelentkezett lánchiba (bár ritkábban, mint az N47-nél). Hidegindításkor csörgés." },
      { title: "EGR-hűtő (visszahívás volt)", from: 120000, sev: "mid", cost: "150–400 e Ft",
        detail: "Több európai visszahívás történt EGR-hűtő miatt. Kérdezd meg, elvégezték-e." },
    ],
    note: "Az N47 utódja — összességében megbízhatóbb, de nem hibátlan.",
  },

  /* ============ MERCEDES — további motorok ============ */
  {
    m: /\bm271\b|\b(180|200)\s*(kompressor|cgi)\b/i, name: "Mercedes M271 (1.8 Kompressor / CGI)",
    faults: [
      { title: "KIEGYENSÚLYOZÓ TENGELY fogaskerék kopása", from: 120000, sev: "high", cost: "700 e – 1,8 M Ft",
        detail: "A 2003–2010 közötti M271 hírhedt hibája: a fogaskerék elkopik, hibakód jön, és a javításhoz KI KELL SZEDNI a motort. Ez az egyik legdrágább rejtett hiba ebben a kategóriában." },
      { title: "Vezérműlánc és feszítő", from: 150000, sev: "high", cost: "300–700 e Ft", detail: "Csörgés hidegindításkor." },
      { title: "Kompresszor (Kompressor változat)", from: 180000, sev: "mid", cost: "200–500 e Ft", detail: "Sípolás, teljesítményvesztés." },
    ],
  },
  {
    m: /\bm27[23]\b|^(?=.*\b(?:mercedes|benz)\b)(?=.*\b(?:230|280|300|350|500)\b)/i, name: "Mercedes M272 / M273 (V6 / V8 benzin)",
    faults: [
      { title: "KIEGYENSÚLYOZÓ TENGELY fogaskerék (M272)", from: 120000, sev: "high", cost: "800 e – 2 M Ft",
        detail: "A 2004–2008 közötti M272 motorok ismert hibája; motorbontásos javítás. Az alvázszám alapján megállapítható, érintett-e a példány." },
      { title: "Szívócső örvényszelepek", from: 150000, sev: "mid", cost: "150–400 e Ft", detail: "Hibakód, egyenetlen járás." },
    ],
  },
  {
    m: /\bom640\b|\b(160|180|200)\s*cdi\b.*(a-?klasse|b-?klasse|\ba\b|\bb\b)/i, name: "Mercedes OM640 (2.0 CDI, A/B osztály)",
    faults: [
      { title: "Injektorok", from: 130000, sev: "high", cost: "120–300 e Ft", detail: "Nehéz indítás, kopogás, füstölés." },
      { title: "Turbó és DPF", from: 150000, sev: "high", cost: "250–700 e Ft", detail: "Városi használatnál különösen." },
      { title: "Vezérműlánc", from: 180000, sev: "high", cost: "300–700 e Ft", detail: "Csörgés hidegen." },
    ],
  },
  {
    m: /\bom646\b|\b220\s*cdi\b.*(200[2-8])/i, name: "Mercedes OM646 (2.2 CDI, régebbi)",
    faults: [
      { title: "Injektorok, injektor-akna korrózió", from: 180000, sev: "mid", cost: "100–300 e Ft", detail: "Kormos „sírás” az injektorok körül." },
      { title: "Turbó állítómű", from: 200000, sev: "mid", cost: "150–400 e Ft", detail: "Teljesítményvesztés." },
    ],
    note: "Az OM646 az egyik legmegbízhatóbb Mercedes dízel — sokat bír.",
  },

  /* ============ OPEL ============ */
  {
    m: /\b1[.,]6\s*cdti\b|\bb16dth\b/i, name: "Opel 1.6 CDTi („whisper diesel”)",
    faults: [
      { title: "Vezérműlánc nyúlása", from: 100000, sev: "high", cost: "300–700 e Ft",
        detail: "A 2013 utáni 1.6 CDTi ismert gyengesége: a lánc korán nyúlik, hidegindításkor csörög. Több gyári módosítás is volt rá." },
      { title: "Olajszivattyú / olajnyomás", from: 130000, sev: "high", cost: "200–500 e Ft", detail: "Olajnyomás-figyelmeztetés esetén azonnal állj le." },
      { title: "DPF + AdBlue", from: 130000, sev: "mid", cost: "150–500 e Ft", detail: "Városi használatnál gyakori." },
    ],
  },
  {
    m: /\b1[.,]4\s*turbo\b|\ba14net\b|\ba14xer\b/i, name: "Opel 1.4 Turbo (A14NET)",
    faults: [
      { title: "Vezérműlánc", from: 120000, sev: "high", cost: "250–600 e Ft", detail: "Nyúlásra hajlamos; csörgés hidegen." },
      { title: "Hűtőrendszer / vízpumpa, hengerfej-túlmelegedés", from: 120000, sev: "high", cost: "150–600 e Ft",
        detail: "Hűtővíz-vesztés után túlmelegedés, ami hengerfejet vihet. Figyeld a hűtővízszintet." },
      { title: "Turbó", from: 160000, sev: "mid", cost: "200–500 e Ft", detail: "Sípolás, teljesítményvesztés." },
    ],
  },
  {
    m: /\becotec\b|\b(1[.,]6|1[.,]8)\s*xer\b|\ba1[68]xer\b|\bz1[24]xep\b|\ba1[24]xe[lr]\b/i, name: "Opel Ecotec benzin (1.2–1.8)",
    faults: [
      { title: "Vezérműlánc nyúlása", from: 120000, sev: "high", cost: "250–550 e Ft",
        detail: "Az Ecotec család végigvonuló gyengéje: a lánc és a feszítő elkopik, hidegindításkor pár másodperces csörgés hallatszik. A kisebb Z12XEP/Z14XEP (Corsa, Astra H) és a nagyobb A16XER/A18XER egyaránt érintett. Ha csörög, ne halogasd — az ugró lánc szelepet tör." },
      { title: "Termosztát / hűtőrendszer", from: 120000, sev: "mid", cost: "50–150 e Ft", detail: "Nem melegszik fel, vagy túlmelegszik; a műanyag házak repednek." },
    ],
    note: "Egyszerű, olcsón tartható szívómotor — a lánc az egyetlen komoly tétel rajta.",
  },
  {
    m: /\b2[.,]0\s*cdti\b|\ba20dt/i, name: "Opel 2.0 CDTi",
    faults: [
      { title: "Olajszivattyú-lánc / olajnyomás", from: 150000, sev: "high", cost: "250–600 e Ft", detail: "Ismert gyengeség; olajnyomás-lámpánál azonnal állj le." },
      { title: "DPF + EGR", from: 150000, sev: "mid", cost: "150–500 e Ft", detail: "Városi használatnál." },
      { title: "Vezérműszíj", from: 120000, sev: "high", cost: "100–250 e Ft", detail: "Kb. 150 e km-enként." },
    ],
  },

  /* ============ FORD ============ */
  {
    m: /\b1[.,]6\s*ecoboost\b/i, name: "Ford 1.6 EcoBoost",
    faults: [
      { title: "Hűtőrendszer / hengerfej túlmelegedés", from: 100000, sev: "high", cost: "400 e – 1,5 M Ft",
        detail: "A korai darabok ismert problémája: hűtővíz-vesztés, majd túlmelegedés és hengerfej-károsodás. Volt visszahívás is." },
      { title: "Turbó olajellátás", from: 140000, sev: "high", cost: "250–600 e Ft", detail: "Rendszeres olajcsere létfontosságú." },
    ],
  },
  {
    m: /^(?!.*\b(?:ecoboost|tdci|hdi|dci)\b)(?:(?=.*\bti-?vct\b)|(?=.*\bduratec\b)|(?=.*\b(?:ford|focus|fiesta|c-?max|mondeo)\b)(?=.*\b(?:1[.,]4|1[.,]6|1[.,]8|2[.,]0)\b))/i,
    name: "Ford Duratec / Ti-VCT (szívó benzin)",
    faults: [
      { title: "Vezérműszíj", from: 100000, sev: "high", cost: "70–180 e Ft",
        detail: "Kb. 100–150 e km-enként, a vízpumpával együtt. Szakadás esetén a szelepek nekimennek a dugattyúnak — motorbontás. Kérdezd meg, mikor cserélték, és kérj számlát." },
      { title: "Gyújtótekercs, lambdaszonda", from: 140000, sev: "mid", cost: "30–120 e Ft", detail: "Rángatás, hibás alapjárat, emelkedő fogyasztás." },
      { title: "Termosztát-ház és hűtőcsövek", from: 150000, sev: "mid", cost: "40–140 e Ft", detail: "A műanyag részek elöregednek és szivárogni kezdenek." },
    ],
    note: "Turbó nélküli, egyszerű szerkezet — a kategória egyik legolcsóbban tartható motorja. Szinte minden rajta múló tétel a vezérműszíj rendszeressége.",
  },
  {
    m: /\bd4f\b|\bk4m\b|^(?=.*\b(?:renault|dacia|clio|megane|logan|sandero|twingo)\b)(?=.*\b(?:1[.,]2|1[.,]4|1[.,]6)\s*(?:16v)?\b)(?!.*\b(?:dci|tce|energy)\b)/i,
    name: "Renault / Dacia 1.2–1.6 16V (D4F / K4M)",
    faults: [
      { title: "Vezérműszíj (K4M) / lánc (D4F)", from: 100000, sev: "high", cost: "80–200 e Ft",
        detail: "A K4M szíjas: kb. 120 e km, elmulasztva szelepes motorkár. A 1.2 16V D4F láncos, de a lánc 150 e km felett nyúlni kezd — hidegindításkor csörög." },
      { title: "Gyújtótekercs-léc, alapjárat-motor", from: 140000, sev: "mid", cost: "30–110 e Ft", detail: "Rángatás, akadozó alapjárat." },
      { title: "Hűtőrendszer, termosztát", from: 150000, sev: "mid", cost: "40–130 e Ft", detail: "A műanyag csonkok repednek, lassú hűtővíz-fogyás." },
    ],
    note: "Olcsó, egyszerű motorok — az alkatrész is olcsó hozzájuk. A K4M-nél a vezérműszíj papírja a legfontosabb kérdés.",
  },
  {
    m: /\b1[.,]5\s*(ecoboost|tdci)\b/i, name: "Ford 1.5 EcoBoost / 1.5 TDCi",
    faults: [
      { title: "Nedves vezérműszíj (EcoBoost)", from: 100000, sev: "high", cost: "250–700 e Ft",
        detail: "Olajban futó szíj: bomlása eltömíti az olajrendszert. Kérdezz rá a cserére." },
      { title: "Hűtőrendszer", from: 120000, sev: "mid", cost: "100–350 e Ft", detail: "Figyeld a hűtővízszintet." },
      { title: "1.5 TDCi: DPF + EGR", from: 130000, sev: "mid", cost: "150–450 e Ft", detail: "Városi használatnál." },
    ],
  },
  {
    m: /\b2[.,]2\s*tdci\b|\bdw12\b/i, name: "Ford / PSA 2.2 TDCi (DW12)",
    faults: [
      { title: "Injektorok", from: 170000, sev: "high", cost: "100–200 e Ft / db", detail: "Nehéz indítás, kopogás." },
      { title: "Kétsúlyú lendkerék", from: 180000, sev: "high", cost: "200–450 e Ft", detail: "Zörgés alapjáraton." },
      { title: "DPF", from: 160000, sev: "mid", cost: "250–600 e Ft", detail: "Városi használatnál." },
    ],
  },

  /* ============ PSA (Peugeot / Citroën) ============ */
  {
    m: /\b1[.,]4\s*hdi\b|\bdv4\b/i, name: "PSA 1.4 HDi (DV4)",
    faults: [
      { title: "Turbó és olajellátás", from: 130000, sev: "high", cost: "200–500 e Ft", detail: "Ugyanaz a betegség, mint az 1.6 HDi-nél: kokszos olajcső." },
      { title: "Injektorok, EGR", from: 150000, sev: "mid", cost: "80–300 e Ft", detail: "Egyenetlen járás, füstölés." },
      { title: "Vezérműszíj", from: 100000, sev: "high", cost: "70–180 e Ft", detail: "Kb. 120–160 e km." },
    ],
  },
  {
    m: /\b1[.,]6\s*bluehdi\b/i, name: "PSA 1.6 BlueHDi",
    faults: [
      { title: "AdBlue-rendszer hibái", from: 100000, sev: "high", cost: "200–600 e Ft",
        detail: "Adagolószivattyú, NOx-szonda, tartályfűtés — indításgátlásig is elmehet. Gyakori panasz ezen a motoron." },
      { title: "DPF + EGR", from: 130000, sev: "mid", cost: "150–500 e Ft", detail: "Városi használatnál." },
      { title: "Vezérműszíj", from: 120000, sev: "high", cost: "100–250 e Ft", detail: "Kb. 180 e km." },
    ],
  },
  {
    m: /\btu5\b|\b1[.,]6\s*16v\b.*(peugeot|citro)/i, name: "PSA 1.4 / 1.6 benzin (TU5)",
    faults: [
      { title: "Vezérműszíj", from: 100000, sev: "high", cost: "70–170 e Ft", detail: "Kb. 120 e km-enként." },
      { title: "Gyújtótekercs, alapjárat-motor", from: 150000, sev: "mid", cost: "30–120 e Ft", detail: "Rutin kopás." },
    ],
    note: "Egyszerű, turbó nélküli, olcsón tartható motor.",
  },

  /* ============ RENAULT / NISSAN ============ */
  {
    m: /\b1[.,]9\s*dci\b|\bf9q\b/i, name: "Renault 1.9 dCi (F9Q)",
    faults: [
      { title: "Olajszivattyú / turbó olajellátás", from: 160000, sev: "high", cost: "250–600 e Ft",
        detail: "Ismert gyengesége: az olajozási gond turbót és motort is elvihet. Rendszeres olajcsere kritikus." },
      { title: "Injektorok", from: 170000, sev: "mid", cost: "80–160 e Ft / db", detail: "Nehéz indítás, füstölés." },
      { title: "Kétsúlyú lendkerék", from: 180000, sev: "high", cost: "180–400 e Ft", detail: "Zörgés alapjáraton." },
    ],
  },
  {
    m: /\b2[.,]0\s*dci\b|\bm9r\b/i, name: "Renault / Nissan 2.0 dCi (M9R)",
    faults: [
      { title: "Injektorok", from: 150000, sev: "high", cost: "100–200 e Ft / db", detail: "Nehéz indítás, kopogás, füstölés." },
      { title: "Turbó és EGR", from: 170000, sev: "high", cost: "250–600 e Ft", detail: "Teljesítményvesztés." },
      { title: "DPF", from: 150000, sev: "mid", cost: "250–600 e Ft", detail: "Városi használatnál kockázatos." },
    ],
  },
  {
    m: /\b1[.,]6\s*dci\b|\br9m\b/i, name: "Renault / Nissan 1.6 dCi (R9M)",
    faults: [
      { title: "Vezérműlánc / hajtás", from: 130000, sev: "high", cost: "300–700 e Ft", detail: "Csörgés hidegindításkor." },
      { title: "Olajhígulás rövid utakon", from: 100000, sev: "mid", cost: "sűrűbb olajcsere", detail: "Emelkedő olajszint a jele — nézd meg a nívópálcát." },
      { title: "DPF + EGR", from: 130000, sev: "mid", cost: "150–500 e Ft", detail: "Városi használatnál." },
    ],
  },
  {
    m: /\b1[.,]2\s*(dig-?t|hr12)\b/i, name: "Nissan 1.2 DIG-T (HR12DDT)",
    faults: [
      { title: "Vezérműlánc", from: 110000, sev: "high", cost: "250–600 e Ft", detail: "Nyúlás, csörgés hidegen." },
      { title: "Olajfogyás", from: 100000, sev: "mid", cost: "figyeld az olajszintet", detail: "Rendszeresen ellenőrizd a szintet." },
    ],
  },

  /* ============ FIAT / ALFA ============ */
  {
    m: /\bmultiair\b|\b1[.,]4\s*(t-?jet|turbo)\b/i, name: "Fiat 1.4 T-Jet / MultiAir",
    faults: [
      { title: "MultiAir egység (elektrohidraulikus szelepvezérlés)", from: 120000, sev: "high", cost: "300–700 e Ft",
        detail: "A MultiAir egység a motor ismert gyenge pontja: hibája teljesítményvesztést, rángatást, hibalámpát okoz, és az egység cseréje drága." },
      { title: "Olajfogyás, turbó", from: 130000, sev: "mid", cost: "150–500 e Ft", detail: "Figyeld az olajszintet." },
    ],
  },
  {
    m: /\b1[.,]6\s*multijet\b|\b2[.,]0\s*multijet\b/i, name: "Fiat 1.6 / 2.0 MultiJet",
    faults: [
      { title: "Turbó és EGR", from: 150000, sev: "high", cost: "200–550 e Ft", detail: "Rendszeres olajcsere kritikus." },
      { title: "DPF", from: 140000, sev: "mid", cost: "250–600 e Ft", detail: "Városi használatnál." },
      { title: "Vezérműszíj", from: 110000, sev: "high", cost: "90–220 e Ft", detail: "Kb. 150 e km." },
    ],
  },
  {
    m: /\bfire\b|\b1[.,]2\s*8v\b|\b1[.,]4\s*8v\b/i, name: "Fiat FIRE 1.2 / 1.4 benzin",
    faults: [
      { title: "Vezérműszíj", from: 90000, sev: "high", cost: "60–150 e Ft", detail: "Kb. 100–120 e km-enként." },
      { title: "Gyújtótekercs, lambdaszonda", from: 140000, sev: "mid", cost: "30–100 e Ft", detail: "Rutin kopás." },
    ],
    note: "Egyszerű, olcsón javítható motor — kisautóban jó választás.",
  },

  /* ============ TOYOTA / HONDA ============ */
  {
    m: /\b1[.,]4\s*d-?4d\b|\b1nd\b/i, name: "Toyota 1.4 D-4D (1ND)",
    faults: [
      { title: "Hengerfej-repedés (korai darabok)", from: 150000, sev: "high", cost: "400 e – 1,2 M Ft",
        detail: "A 2002–2008 közötti darabok ismert gyengesége. Hűtővíz-fogyás, fehér füst a jel." },
      { title: "EGR + injektorok", from: 150000, sev: "mid", cost: "80–300 e Ft", detail: "Egyenetlen járás, füstölés." },
    ],
  },
  {
    m: /\b2[.,]0\s*d-?4d\b|\b1cd\b/i, name: "Toyota 2.0 D-4D (1CD-FTV)",
    faults: [
      { title: "Olajiszap / turbó tönkremenetel", from: 160000, sev: "high", cost: "250–700 e Ft",
        detail: "Ha nem cserélték rendszeresen az olajat, az iszap eltömíti a turbó olajvezetékét." },
      { title: "EGR eltömődés, adagoló", from: 170000, sev: "mid", cost: "80–300 e Ft", detail: "Teljesítményvesztés." },
    ],
    note: "Rendszeres olajcserével nagyon sokat bíró motor.",
  },
  {
    m: /\b1[.,]5\s*(vtec\s*turbo|i-?vtec\s*turbo)\b|\bl15\b/i, name: "Honda 1.5 VTEC Turbo",
    faults: [
      { title: "Olajhígulás (üzemanyag az olajban)", from: 60000, sev: "high", cost: "sűrűbb olajcsere / javítás 200–600 e Ft",
        detail: "Hideg éghajlaton, rövid utakon a benzin az olajba kerül: EMELKEDŐ olajszint és benzinszag a nívópálcán. Volt gyári szoftverfrissítés rá — kérdezz rá." },
    ],
  },
  {
    m: /\b(2[.,]2|1[.,]6)\s*i-?[cd]tdi\b|\bn22a\b/i, name: "Honda 2.2 i-CTDi / i-DTEC",
    faults: [
      { title: "DPF (i-DTEC változat)", from: 140000, sev: "mid", cost: "200–600 e Ft", detail: "Városi használatnál eltömődhet." },
      { title: "Kétsúlyú lendkerék", from: 180000, sev: "high", cost: "200–450 e Ft", detail: "Zörgés alapjáraton." },
    ],
    note: "A 2.2 i-CTDi különösen jó hírű, szívós dízel.",
  },

  /* ============ LAND ROVER / JAGUAR / VOLVO ============ */
  {
    m: /\b(2[.,]7|3[.,]0)\s*tdv6\b|\btdv6\b/i, name: "Land Rover / Jaguar 2.7–3.0 TDV6",
    faults: [
      { title: "FŐTENGELY törés / csapágy-berágódás", from: 150000, sev: "high", cost: "1,5–4 M Ft",
        detail: "A TDV6 hírhedt, katasztrofális hibája: a főtengely eltörhet, ami teljes motorcserét jelent. Olajnyomás és a szerviztörténet kritikus." },
      { title: "Turbó(k), EGR-hűtő", from: 160000, sev: "high", cost: "400 e – 1,2 M Ft", detail: "Kettős turbós felépítés, drága javítás." },
      { title: "Vezérműszíj (hátul)", from: 130000, sev: "high", cost: "300–800 e Ft", detail: "Munkaigényes, drága csere." },
    ],
    note: "Erős, kényelmes autók, de a fenntartásuk komoly tartalékot igényel.",
  },
  {
    m: /\bingenium\b|\b2[.,]0\s*d\b.*(jaguar|land\s*rover|discovery|evoque)/i, name: "JLR Ingenium 2.0d",
    faults: [
      { title: "Vezérműlánc nyúlása (korai darabok)", from: 100000, sev: "high", cost: "500 e – 1,2 M Ft",
        detail: "A 2015–2018 közötti Ingenium dízelek ismert hibája; csörgés hidegindításkor." },
      { title: "Olajhígulás + DPF", from: 100000, sev: "mid", cost: "150–500 e Ft", detail: "Rövid, városi utaknál gyakori." },
    ],
  },
  {
    m: /\bvea\b|\b2[.,]0\s*(d[2345]|t[3456])\b|^(?=.*\bvolvo\b)(?!.*\b2[.,][45]\b)(?=.*\b(?:d[2345]|t[3456])\b)/i, name: "Volvo VEA (2.0 D2–D5 / T3–T6, 2014+)",
    faults: [
      { title: "Injektorok (dízel)", from: 130000, sev: "high", cost: "120–300 e Ft / db", detail: "Egyenetlen járás, hidegindítási gond, füstölés." },
      { title: "EGR-hűtő és DPF", from: 140000, sev: "mid", cost: "150–500 e Ft", detail: "Városi használatnál gyorsabban." },
      { title: "Vezérműszíj (dízel is szíjas!)", from: 120000, sev: "high", cost: "120–300 e Ft",
        detail: "A VEA dízelnél a szíj részben OLAJBAN fut. Kb. 150–180 e km-enként cserélendő; ha morzsálódik, a törmelék eltömi az olajszivattyú szűrőjét és megfogja a motort." },
    ],
    note: "Figyelem: a 2015 ELŐTTI V40 D2 nem ez a motor, hanem a PSA 1.6 dízel — ott a turbó olajcsöve a fő kockázat. A 2014 előtti T5 pedig a régi öthengeres benzines.",
  },
  {
    m: /\bb525\d\b|^(?=.*\bvolvo\b)(?=.*\b(?:t5|t6)\b)(?=.*\b(?:200[0-9]|201[0-3])\b)/i, name: "Volvo öthengeres benzin (B5254T, T5 2000–2014)",
    faults: [
      { title: "PCV / olajleválasztó eltömődése", from: 130000, sev: "high", cost: "150–400 e Ft",
        detail: "A kartergáz-szelep eltömődik, a nyomás megemelkedik, és kinyomja a szimmeringeket — olajfolyás mindenhol. Tesztje egyszerű: járó motornál az olajbetöltő sapkát nehéz legyen leemelni." },
      { title: "Turbó és olajellátás", from: 160000, sev: "mid", cost: "250–600 e Ft", detail: "Kék füst, sípolás terhelés alatt." },
    ],
  },

  /* ============ HYUNDAI / KIA / MAZDA / SUBARU ============ */
  {
    m: /\b1[.,]6\s*t-?gdi\b/i, name: "Hyundai / Kia 1.6 T-GDI",
    faults: [
      { title: "Szívószelep-koksz", from: 100000, sev: "mid", cost: "60–200 e Ft", detail: "Közvetlen befúvás jellemzője." },
      { title: "Turbó és olajellátás", from: 140000, sev: "mid", cost: "200–500 e Ft", detail: "Rendszeres olajcsere kritikus." },
    ],
  },
  {
    m: /\bkappa\b|\bgamma\b|\bg4l[abc]\b|\bg4f[acg]\b|^(?=.*\b(?:hyundai|kia)\b)(?!.*\b(?:crdi|t-?gdi|gdi)\b)(?=.*\b(?:1[.,]0|1[.,]1|1[.,]2|1[.,]25|1[.,]4)\b)/i, name: "Hyundai / Kia kisbenzin (Kappa / Gamma 1.0–1.4)",
    faults: [
      { title: "Vezérműlánc", from: 180000, sev: "mid", cost: "150–400 e Ft", detail: "Hosszú életű; figyeld a zajt." },
      { title: "Gyújtótekercs, hűtőrendszer", from: 150000, sev: "mid", cost: "30–120 e Ft", detail: "Rutin kopás." },
    ],
    note: "Egyszerű, megbízható kisautó-motor, olcsó alkatrészekkel.",
  },
  {
    m: /\b(1[.,]5|2[.,]0)\s*skyactiv-?g\b|\bskyactiv-?g\b/i, name: "Mazda Skyactiv-G benzin",
    faults: [
      { title: "Szívószelep-koksz", from: 120000, sev: "mid", cost: "60–200 e Ft", detail: "Közvetlen befúvás; rángatás, alapjárati hiba." },
      { title: "Vezérműlánc", from: 180000, sev: "mid", cost: "200–500 e Ft", detail: "Hosszú életű, de figyeld a zajt." },
    ],
    note: "Turbó nélküli, magas kompressziójú motor — jó hírű megbízhatóság.",
  },
  {
    m: /\bej2[05]\b|\bsubaru\b.*(2[.,]0|2[.,]5)/i, name: "Subaru EJ boxer benzin",
    faults: [
      { title: "Hengerfejtömítés szivárgás", from: 150000, sev: "high", cost: "400 e – 1 M Ft",
        detail: "Az EJ25 klasszikus hibája: külső olaj-/hűtővízszivárgás a hengerfejtömítésnél. A boxer elrendezés miatt munkaigényes." },
      { title: "Vezérműszíj", from: 100000, sev: "high", cost: "120–300 e Ft", detail: "Kb. 120–160 e km." },
    ],
  },
];

/* ---------- Váltó-specifikus tudás ---------- */
const KB_GEARBOXES = [
  {
    m: /\bdsg\s*7\b|\bdq200\b|\b7[- ]?speed\s*dsg\b/i, name: "DSG7 (DQ200, szárazkuplungos)",
    faults: [
      { title: "Mechatronika (vezérlőegység) hibája", from: 100000, sev: "high", cost: "300–800 e Ft",
        detail: "A DQ200 hírhedt hibája: rángatás, késés, hibajelzés. Kérdezz rá, cserélték-e már." },
      { title: "Szárazkuplung kopása", from: 120000, sev: "high", cost: "300–700 e Ft",
        detail: "Elindulásnál rángat, csúszik. A szárazkuplungos DSG érzékenyebb a városi használatra." },
    ],
  },
  {
    m: /\bdsg\b|\bdq250\b|\bs[- ]?tronic\b/i, name: "DSG / S-tronic (nedveskuplungos)",
    faults: [
      { title: "Váltóolaj-csere elmaradása", from: 60000, sev: "high", cost: "80–180 e Ft",
        detail: "60 e km-enként KELL. Kihagyva a mechatronika és a kuplung tönkremegy." },
      { title: "Mechatronika / kuplung felújítás", from: 180000, sev: "high", cost: "400 e – 1 M Ft",
        detail: "Rángatás, csúszás a jele." },
    ],
  },
  {
    m: /powershift|\bdps6\b/i, name: "Ford PowerShift (DPS6)",
    faults: [
      { title: "Kuplung és TCM hibája", from: 60000, sev: "high", cost: "300–900 e Ft",
        detail: "A Fiesta/Focus PowerShift váltó hírhedt problémája: rángatás, csúszás, remegés. Világszerte perek indultak miatta. Ilyen váltóval NAGYON óvatosan." },
    ],
  },
  {
    m: /\bcvt\b|xtronic|multitronic/i, name: "CVT / Multitronic",
    faults: [
      { title: "Variátor-szíj és nyomatékváltó kopása", from: 120000, sev: "high", cost: "400 e – 1,2 M Ft",
        detail: "A CVT-k (Nissan X-Tronic, Audi Multitronic) érzékenyek: gyorsításnál csúszás, zaj a jele. Az olajcsere-történet kritikus." },
    ],
  },
  {
    m: /easytronic|dualogic|\bmta\b|sensodrive/i, name: "Robotizált váltó (Easytronic / Dualogic)",
    faults: [
      { title: "Állítómű (aktuátor) hibája", from: 100000, sev: "high", cost: "150–500 e Ft",
        detail: "Nem kapcsol, hibajelzés, akadozó indulás. Ez a váltótípus általánosan problémás." },
    ],
  },
  {
    m: /\b7g-?tronic\b|\b722\.9\b/i, name: "Mercedes 7G-Tronic",
    faults: [
      { title: "Vezetőlemez (conductor plate)", from: 150000, sev: "high", cost: "250–600 e Ft",
        detail: "Ismert hiba: hibás sebességjelzés, kapcsolási gondok." },
    ],
  },
];

/* ============================================================
   MÉLYSÉGI MAGYARÁZAT a legsúlyosabb hibákhoz
   A fő kockázatnál ezt mutatjuk meg részletesen, hogy a
   felhasználó tényleg dönteni tudjon.
     why   – miért pont ennél az autónál / km-nél
     signs – árulkodó jelek, amit ő is észrevehet
     ask   – mit kérdezzen az eladótól / mit ellenőriztessen
     risk  – mi történik, ha nem foglalkozik vele
   ============================================================ */
const KB_DEEP = {
  "Vezérműszíj": {
    why: "A vezérműszíj tartja szinkronban a főtengelyt és a szelepeket. Gumiból van, ezért nem a kopás öli meg, hanem az IDŐ és a km — ezért van rá kötelező csereintervallum (motortól függően 100–180 e km, vagy 5–8 év, amelyik hamarabb jön). Ez nem hiba, hanem határidő: ha lejárt, az autó él, de menet közben bármikor elszakadhat.",
    signs: "Kívülről semmi. A szíj a burkolat alatt van, és szakadásig tökéletesen működik — pont ettől veszélyes. Ritkán csörgő feszítőgörgő vagy vízpumpa-zúgás árulkodik.",
    ask: "Mikor és hány km-nél cserélték a szíjat, a feszítőt ÉS a vízpumpát? Kérj SZÁMLÁT — ennél a tételnél a szóbeli „biztos cserélve volt” semmit sem ér. Ha nincs papír, számolj úgy, hogy a csere a tiéd lesz, és ezt vond le az árból.",
    risk: "A csere 80–250 e Ft. A szakadás a legtöbb modern motornál azonnali szelep- és dugattyúkárt jelent: 1–2,5 M Ft, azaz sok esetben többet, mint amennyit az autó ér. Ez a legolcsóbban elkerülhető nagy kár a használtautózásban.",
  },
  "Vezérműszíj (K4M) / lánc (D4F)": {
    why: "A Renault 1.4/1.6 16V (K4M) szíjas motor: a szíj kb. 120 e km-enként cserélendő, és szakadás esetén a szelepek nekimennek a dugattyúnak. A kisebb 1.2 16V (D4F) láncos, ott nincs csereintervallum, viszont 150 e km felett a lánc nyúlni kezd.",
    signs: "Szíjas motornál semmi — a burkolat alatt van. Láncosnál hidegindításkor pár másodperces csörgés a motor elejéből.",
    ask: "Szíjas változatnál: mikor cserélték a szíjat, feszítőt, vízpumpát? Kérj számlát. Láncosnál: indítsd be teljesen hidegen, és hallgasd meg — az eladó NE melegítse be előtted.",
    risk: "A szíjcsere 80–200 e Ft; a szakadás utáni motorkár egy 1,5 milliós Clio-nál gazdasági totálkár.",
  },
  "Hajtásakkumulátor kapacitásvesztés (SoH)": {
    why: "Egy elektromos autónál az akkumulátor az autó értékének 30–50%-a, és folyamatosan, láthatatlanul öregszik — évi 1–3%-ot veszít, gyorstöltéstől és melegtől gyorsabban. A műszerfal ezt NEM mutatja meg: teli akkut mutat, csak épp kevesebb fér bele.",
    signs: "Csökkenő valós hatótáv, gyorsabban fogyó százalék autópályán, lassuló gyorstöltés (az autó védi a gyenge cellákat).",
    ask: "Kérj SoH-mérést (State of Health) — ez ma már sok szervizben és diagnosztikai appal is megy, és 15 perc. Kérdezd meg: van-e még gyári akkugarancia (jellemzően 8 év / 160 e km), és milyen gyakran töltötték gyorstöltővel. Töltsd meg élesben AC-ról ÉS DC-ről is.",
    risk: "Akkumulátorcsere 1,5 – 6 M Ft modelltől függően. SoH-mérés nélkül elektromos autót venni olyan, mint motor meghallgatása nélkül benzinest.",
  },
  "KIEGYENSÚLYOZÓ TENGELY fogaskerék kopása": {
    why: "A 2003–2010 közötti Mercedes M271 (C/E 180–200 Kompressor és CGI) egyik legdrágább hibája. A kiegyensúlyozó tengelyt hajtó fogaskerék anyaga túl puha volt: a fogak lekopnak, a vezérlés elcsúszik, és hibakód jön. A javításhoz KI KELL EMELNI és szét kell bontani a motort — ezért kerül annyiba, amennyibe.",
    signs: "Hibakód a vezérlés elállítódására (P0016/P0017), nehéz indulás, egyenetlen alapjárat, csökkent teljesítmény. Sokszor sokáig semmi jele nincs.",
    ask: "Cserélték-e már a megerősített fogaskerékre? Kérj rá SZÁMLÁT — szóbeli állítás itt nem elég. Vizsgálaton kérj hibakód-olvasást is; a vezérlés-eltérés kód azonnal látszik.",
    risk: "Motorbontásos javítás, 800 e – 2 M Ft. Egy 15 éves C-osztálynál ez gyakran több, mint amennyit az autó ér.",
  },
  "KIEGYENSÚLYOZÓ TENGELY fogaskerék (M272)": {
    why: "Ugyanaz a betegség, mint az M271-nél, csak a 2004–2008 közötti V6-os (M272) motorokban: a puha fogaskerék lekopik, a vezérlés elcsúszik. Az érintettség ALVÁZSZÁM alapján megállapítható — a Mercedes megadta a határmotorszámot, ami fölött már a javított alkatrész van benne.",
    signs: "Vezérlés-eltérés hibakód, rossz indulás, rángatás. Sok autónál csak a hibakód-olvasó mutatja meg.",
    ask: "Kérd el az alvázszámot és ellenőriztesd egy Mercedes-szervizzel, hogy érintett-e a példány. Ha érintett és még nem javították: alkudj le vagy lépj tovább.",
    risk: "Motorbontás, 800 e – 2 M Ft. Ez az a hiba, ami miatt olcsó V6-os Mercedeseket lehet találni.",
  },
  "FŐTENGELY törés / csapágy-berágódás": {
    why: "A Land Rover / Jaguar 2.7 és 3.0 TDV6 motorjának hírhedt végzete. Az olajszivattyú hajtása és a csapágyellátás gyenge, ezért a főtengely csapágyai berágódnak — a 3.0-nál előfordult, hogy maga a főtengely eltört. Jellemzően 150 e km felett, elmulasztott olajcserék után.",
    signs: "Kopogó, kalapáló hang alapjáraton (melegen a legjobban hallható), olajnyomás-lámpa villanása, fémszemcsék az olajban vagy az olajszűrőben.",
    ask: "Kérd el a TELJES olajcsere-történetet — ennél a motornál a rövid olajcsere-ciklus az egyetlen védelem. Kérdezz rá: cserélték-e az olajszivattyút vagy a hajtását? Vizsgálaton mérettesd meg az olajnyomást melegen.",
    risk: "Új motor: 2,5 – 5 M Ft. Ez az a hiba, ami miatt egy Discovery vagy Range Rover Sport hirtelen fillérekért kel el.",
  },
  "MultiAir egység (elektrohidraulikus szelepvezérlés)": {
    why: "A Fiat MultiAir motorokban nincs hagyományos szívó-vezérműtengely: egy elektrohidraulikus egység nyitja a szelepeket olajnyomással. Ez az egység érzékeny az olaj minőségére és a lerakódásokra — ha elszennyeződik vagy elektromosan meghibásodik, az egész blokkot cserélni kell.",
    signs: "Hibás alapjárat, teljesítményvesztés, motorhiba-lámpa, hideg indításnál akadozás, néha „limp mode”.",
    ask: "Milyen olajjal és milyen sűrűn szervizelték? (Csak az előírt specifikáció jó.) Cserélték-e már a MultiAir egységet? Indítsd hidegen és figyeld az alapjáratot.",
    risk: "Az egység cseréje 400 e – 900 e Ft, ami egy 8–12 éves kisautónál az autó értékének jelentős része.",
  },
  "Injektorok és lambdaszondák": {
    why: "A BMW N43 (2007–2011, 316i/318i/320i) rétegzett befúvású motor: drága piezo-injektorokkal és több lambdaszondával dolgozik. Az injektorok és a szondák sorra mennek tönkre, és mivel több darabról van szó, a számla összeadódik.",
    signs: "Rángatás, remegő alapjárat, motorhiba-lámpa, hengerkimaradás-hibakód, megugró fogyasztás.",
    ask: "Hány injektort cseréltek már és mikor? Kérj számlát. Hibakód-olvasás KÖTELEZŐ vásárlás előtt — ez a motor szinte mindig „mesél”.",
    risk: "Egy teljes injektor-készlet + szondák 600 e – 1,2 M Ft. Egy N43-as 3-as BMW-t soha ne vegyél meg diagnosztika nélkül.",
  },
  "Nagynyomású üzemanyag-szivattyú (HPFP)": {
    why: "A BMW N54 (135i, 335i, Z4) leggyakoribb panasza. A nagynyomású szivattyú nem tartja a nyomást, ezért a motor nem kap elég üzemanyagot terhelés alatt. A BMW több körben cserélte garanciában, de a használt darabokban gyakran még a régi típus van.",
    signs: "Hosszú indítás, rángatás, hirtelen teljesítményvesztés gyorsításkor („limp mode”), motorhiba-lámpa.",
    ask: "Cserélték-e a HPFP-t, és melyik verzióra? Kérdezz rá az injektorokra és a wastegate-re is — az N54-nél ez a három tétel jár együtt.",
    risk: "A HPFP maga 250–500 e Ft, de ha az injektorok és a turbók is sorra kerülnek, egy N54 éves szinten több százezer forintot eszik.",
  },
  "Olajhígulás (üzemanyag az olajban)": {
    why: "A Honda 1.5 VTEC Turbo (Civic, CR-V) ismert problémája, főleg rövid, hideg utakon: a be nem égett üzemanyag lecsorog az olajteknőbe, felhígítja az olajat, és az elveszíti a kenőképességét. A Honda szoftverfrissítéssel próbálta orvosolni.",
    signs: "Emelkedő olajszint a nívópálcán (!), benzinszag az olajban, hidegben akadozó járás.",
    ask: "Megkapta-e a gyári szoftverfrissítést? Nézd meg a nívópálcát: ha a szint a MAX fölött van és benzinszagú, az árulkodó. Kérdezd meg, milyen utakat futott — a csak városi használat itt kockázat.",
    risk: "Ha hosszú ideig hígított olajjal járt, a csapágyak kopnak — a motorfelújítás 1,5 M Ft feletti tétel.",
  },
  "Vezérműlánc nyúlása": {
    why: "Az Opel 1.6 CDTi és az Ecotec benzines családban a lánc és a feszítő 120 e km körül kezd nyúlni. A lánc a motor elején van, de a javítás így is munkaigényes. Ha a lánc átugrik, a szelepek nekimennek a dugattyúnak.",
    signs: "Hidegindításkor 1–3 másodperces csörgés, kattogás a motor elejéből. Ha ezt hallod, ne halogasd.",
    ask: "Cserélték-e a láncot, a feszítőt és a vezetősíneket? Kérj számlát. Indítsd be TELJESEN hidegen — kérd meg az eladót, hogy ne melegítse be előtted.",
    risk: "A csere 250–550 e Ft; a lánc átugrása utáni motorkár ennek a többszöröse.",
  },
  "Olajszivattyú-lánc / olajnyomás": {
    why: "Az Opel 2.0 CDTi-nél az olajszivattyú láncát hajtó rendszer és a szűrő elszennyeződik. Amikor az olajnyomás leesik, a turbó és a főcsapágyak kapják az első csapást.",
    signs: "Olajnyomás-lámpa villanása (akár csak indításkor), fémes zaj, kék füst a turbó felől.",
    ask: "Milyen sűrűn cserélték az olajat? Mérettesd meg az olajnyomást melegen. Kérdezd meg, cserélték-e már az olajszivattyút.",
    risk: "Turbó + motorfelújítás együtt könnyen 1 M Ft fölé megy.",
  },
  "Hengerfej / hengerfejtömítés, olajfogyás": {
    why: "A Toyota 2.2 D-4D (2AD) motor a márka egyik kivételes gyengéje: a hengerfej és a fejcsavarok gyengék, az injektorok környékén szivárgás alakul ki, a fej megvetemedhet. A Toyota több országban is kiterjesztett garanciát adott rá.",
    signs: "Olajfogyás, hűtővíz-fogyás, fehér füst, túlmelegedés, „fújó” hang a fej felől induláskor.",
    ask: "Volt-e hengerfej-javítás, és megerősített fejcsavarokkal ment-e vissza? Kérj számlát. Nézd meg a hűtővíz szintjét és a tágulási tartályban az esetleges olajos nyomot.",
    risk: "Hengerfej-felújítás 600 e – 1,2 M Ft. Ez az egyetlen Toyota-motor, aminél a márkahűség félrevezet.",
  },
  "Olajiszap / turbó tönkremenetel": {
    why: "A Toyota 2.0 D-4D (1CD-FTV) motorban a hosszúra nyújtott olajcsere-ciklus miatt olajiszap képződik, ami eltömíti az olajjáratokat és a turbó olajellátását. Ha a turbó megeszi magát, a törmelék a motorba kerül.",
    signs: "Kék füst, sípoló turbó, teljesítményvesztés, sötét, sűrű olaj a betöltő nyílásnál.",
    ask: "Milyen sűrűn cserélték az olajat? (Ennél a motornál a 15 e km-es ciklus túl hosszú.) Vedd le az olajbetöltő sapkát és nézd meg, van-e iszap a fedél alatt.",
    risk: "Turbó + motortisztítás 400 e – 1 M Ft; ha törmelék ment a motorba, motorcsere.",
  },
  "Hengerfejtömítés szivárgás": {
    why: "A Subaru boxer (EJ) motorok klasszikus betegsége: a vízszintes elrendezés miatt a hengerfejtömítés máshogy terhelődik, és 150–250 e km között elkezd szivárogni — kifelé olajat, befelé hűtővizet.",
    signs: "Édes szag a motortérből, lassan fogyó hűtővíz, olajos csík a blokk oldalán, túlmelegedés hosszú úton.",
    ask: "Cserélték-e már a tömítéseket, és MOSJ típusra? Kérj számlát. Nézd meg a hűtővíz szintjét hidegen, és keress olajnyomot a blokk alján.",
    risk: "Kétoldali tömítéscsere 400–900 e Ft, mert a motort ki kell emelni.",
  },
  "Hűtőrendszer (műanyag alkatrészek)": {
    why: "A BMW M54 (E46 330i, E39 530i) hűtőrendszerében sok a műanyag: tágulási tartály, termosztátház, vízpumpa lapátkerék. 100–150 e km felett ezek elöregednek és egyszerre, előjel nélkül repednek meg.",
    signs: "Hűtővíz-fogyás, gőz a motorháztető alól, ingadozó hőmérséklet-mutató. Gyakran nincs előjel — egyszer csak elmegy.",
    ask: "Cserélték-e a teljes hűtőkört (vízpumpa, termosztát, tartály, csövek)? Ennél a motornál ez preventív munka, nem hibajavítás.",
    risk: "A hűtőkör felújítása 200–450 e Ft. Ha egyszer túlmelegszik, a hengerfej megvetemedik — az már 1 M Ft körüli tétel.",
  },
  "PCV / olajleválasztó eltömődése": {
    why: "A Volvo öthengeres benzines (B5254T, T5) motorokban a kartergáz-szelep rendszere elkokszolódik. A karterben megnő a nyomás, és mivel valahol utat kell találnia, kinyomja a szimmeringeket és a tömítéseket.",
    signs: "Olajfolyás több helyről egyszerre, olajfogyás, kék füst. Egyszerű teszt: járó motornál az olajbetöltő sapkát nehéz legyen leemelni — ha „szívja”, még jó; ha nyom, baj van.",
    ask: "Cserélték-e a PCV / olajleválasztó készletet? Nézz a motor alá: friss olajfolt árulkodó.",
    risk: "A PCV-felújítás 150–400 e Ft (a szívócsonkot le kell szedni); ha már a főtengely-szimmering is kiment, jön a kuplung-munkadíj is.",
  },
  "Vezérműszíj (dízel is szíjas!)": {
    why: "A Volvo VEA motorcsaládban (2014+, D2–D5 és T3–T6) a vezérműszíj részben OLAJBAN fut, mint a Ford nedves szíjas motorjaiban. Ha a szíj öregszik és morzsálódni kezd, a törmelék eltömíti az olajszivattyú szűrőjét.",
    signs: "Sokszor semmi — ez a lényege. Ritkán olajnyomás-figyelmeztetés vagy fémes zaj.",
    ask: "Mikor cserélték a vezérműszíjat és a vízpumpát? Kérj SZÁMLÁT. A gyári intervallum (kb. 150–180 e km) itt nem javaslat, hanem határidő.",
    risk: "A csere 120–300 e Ft. A szakadás vagy az eltömődött olajszűrő motorkárt jelent, 1,5 M Ft felett.",
  },
  "Vezérműszíj (kritikus)": {
    why: "A Volvo öthengeres D5 dízelnél a vezérműszíj szakadása azonnali, teljes motorkárt okoz — nincs „szabadonfutó” tartalék. A szíj mellett a feszítő és a vezérműtengely-fogaskerekek is kopnak.",
    signs: "Repedések, fényes vagy szálkás szíjfelület (csak leszereléskor látszik), csörgő feszítő.",
    ask: "Mikor és hány km-nél cserélték a szíjat, feszítőt, vízpumpát? Kérj számlát — ennél a motornál ez az EGYETLEN dokumentum, ami igazán számít.",
    risk: "Csere 150–350 e Ft; szakadás után teljes motorfelújítás, 1,5–2,5 M Ft.",
  },
  "Vezetőlemez (conductor plate)": {
    why: "A Mercedes 7G-Tronic (722.9) váltóban egy elektronikus vezetőlemez fut a váltóolajban. Az érintkezői és a forrasztásai idővel meghibásodnak, ezért a váltó nem tud rendesen kapcsolni.",
    signs: "Rángatás kapcsoláskor, „limp mode” (csak egy fokozat marad), sebességmérő kiesése, hibakód a váltóra.",
    ask: "Cserélték-e a vezetőlemezt (és a hozzá tartozó kábelköteg-átvezetőt)? Mikor cserélték a váltóolajat és a szűrőt? Próbálj hosszú, változatos tempójú tesztutat — melegen jönnek elő a hibák.",
    risk: "Vezetőlemez-csere 250–500 e Ft; ha a váltó belseje is károsodott, 1 M Ft felett.",
  },
  "Szárazkuplung kopása": {
    why: "A DQ200 (7 fokozatú, szárazkuplungos DSG) kuplungja nem olajban fut, ezért gyorsabban kopik — főleg városi, dugós használatban és nehezebb autókban. A mechatronika is érzékeny.",
    signs: "Rángatás induláskor, remegés lassú araszoláskor, késleltetett kapcsolás, kuplung-hibakód.",
    ask: "Cserélték-e a kuplungot vagy a mechatronikát? Kérj számlát. Tesztúton araszolj lassan, dugóban — pont ott mutatja meg magát.",
    risk: "Kuplung 350–700 e Ft, mechatronika 400–900 e Ft. Ha az autót főleg városban használták, ez a legvalószínűbb nagy kiadásod.",
  },
  "Variátor-szíj és nyomatékváltó kopása": {
    why: "A CVT (és az Audi Multitronic) fokozatmentes váltó szíja/lánca folyamatosan súrlódik. Ha az olajcserét elmulasztották, vagy sokat vontattak vele, a kopás felgyorsul — és ezeket a váltókat sok helyen nem javítják, csak cserélik.",
    signs: "Rángatás gyorsításkor, „gumiszalag-érzés”, felpörgő motor előrehaladás nélkül, zúgás.",
    ask: "Mikor cserélték a váltóolajat? (60–80 e km-enként kellene.) Tesztúton gyorsíts erősen és figyeld, követi-e a sebesség a fordulatszámot.",
    risk: "Váltócsere 800 e – 1,8 M Ft — sokszor több, mint az autó fele.",
  },
  "Olajpumpa hatszög-hajtás (PD, BKD/BMM)": {
    why: "A 2003–2008 közötti 2.0 PD TDI-ben egy hatszög alakú betét hajtja az olajpumpát a kiegyensúlyozó tengelyről. Ez a betét idővel kikopik (jellemzően 150–250 e km között), és amikor megcsúszik, egy pillanat alatt megszűnik az olajnyomás.",
    signs: "Olajnyomás-figyelmeztetés a műszerfalon (akár csak villanásnyi), fémes zaj, vagy semmi — sokszor előjel nélkül következik be.",
    ask: "Cserélték-e már a módosított (megerősített) olajpumpa-hajtásra? Kérj rá számlát. Ha nem tudják megmondani, számolj a cserével rögtön a vásárlás után.",
    risk: "Ha megcsúszik, a motor másodpercek alatt berágódik — teljes motorcsere vagy -felújítás.",
  },
  "VEZÉRMŰLÁNC-FESZÍTŐ hibája": {
    why: "Az EA111-es 1.2/1.4 TSI motorokban a láncfeszítő nem tartja meg a láncot. Hidegindításkor, amikor még nincs olajnyomás, a lánc megugorhat. Ez tipikusan 60–150 e km között jelentkezik.",
    signs: "Hidegindításkor 1–3 másodpercig csörgő, kattogó, „láncos” hang a motor elejéből. Ha ezt hallod, NE vedd meg vizsgálat nélkül.",
    ask: "Cserélték-e a láncot és a feszítőt a módosított darabra? Kérj számlát. Indítsd be teljesen hidegen — az eladó ne melegítse be előtted!",
    risk: "Ha a lánc átugrik, a szelepek a dugattyúba érnek: a motor tönkremegy, ami sokszor többet ér, mint az autó.",
  },
  "VEZÉRMŰLÁNC szakadás (hátsó lánc)": {
    why: "A BMW N47 dízelben a vezérműlánc a motor HÁTULJÁN van, a váltó felőli oldalon. A lánc és a vezetősín 120–200 e km között kophat el. A javításhoz ki kell emelni a motort — ezért drágább, mint más autóknál.",
    signs: "Hidegindításkor mély, csörgő/kelepelő hang a motor hátuljából, ami melegen halkul. A műszerfal alatt, a váltó felől hallható a legjobban.",
    ask: "Cserélték-e a láncot? (2011 után gyártott, megerősített készlet létezik.) Kérj számlát, és mindenképp hidegen indítsd be.",
    risk: "Szakadáskor a szelepek elgörbülnek — motorfelújítás, a munkadíj a motorkiemelés miatt magas.",
  },
  "TURBÓ olajellátó cső eltömődése": {
    why: "A PSA 1.6 HDi (DV6) motorban a turbó olajellátó csöve vékony, és a nem cserélt/rossz olajtól elkokszolódik. A turbó olaj nélkül marad, és tönkremegy — jellemzően 120–200 e km között. Ez a motor van a Fordokban (1.6 TDCi), Volvókban, Mazdákban és Suzukikban is.",
    signs: "Kék füst, sípoló/süvítő hang gyorsításkor, teljesítményvesztés, emelkedő olajfogyás.",
    ask: "Milyen gyakran cserélték az olajat, és milyet? Cserélték-e az olajellátó csövet és a szívószűrőt? Turbócsere után ezeket KÖTELEZŐ cserélni — ha nem tették, a következő turbó is menni fog.",
    risk: "Turbó tönkremenetel, és a beszívott fémdarabok akár a motort is elvihetik.",
  },
  "VEZÉRMŰLÁNC nyúlás": {
    why: "Az EP6 (1.6 THP/VTi, PSA–BMW közös fejlesztés, a Miniben is) láncának nyúlása a leggyakoribb panasz, jellemzően 80–150 e km között.",
    signs: "Hidegindításkor csörgő hang, rossz alapjárat, hibakód a vezérlésre. Gyakran olajfogyással együtt jelentkezik.",
    ask: "Cserélték-e a láncot? Mennyi olajat fogyaszt 1000 km-en? Van-e teljes szerviztörténet? Ennél a motornál a hiányos szervizkönyv komoly figyelmeztetés.",
    risk: "Átugró lánc = szelepek a dugattyúban = motorfelújítás.",
  },
  "NEDVES VEZÉRMŰSZÍJ bomlása": {
    why: "A PSA 1.2 PureTech motorban a vezérműszíj az olajban fut. Az öregedő szíj lemorzsolódik, a gumidarabok eltömítik az olajszűrőt és az olajszivattyú szűrőjét — így a motor olajnyomás nélkül marad. Ez az elmúlt évek legnagyobb PSA-problémája, több gyártó előrehozta a csereintervallumot.",
    signs: "Olajnyomás-lámpa, motorzaj, de gyakran ELŐJEL NÉLKÜL jön. Az olajbetöltő sapkán fekete, kormos lerakódás gyanús.",
    ask: "Cserélték-e már a szíjat (és mikor, hány km-nél)? Kérj számlát. A gyári intervallum sokszor túl hosszúnak bizonyult — sok szerelő 100 e km-nél cseréltet.",
    risk: "Teljes motorkár. Ez a hiba több autót vitt el, mint bármi más ebben a motorcsaládban.",
  },
  "Mechatronika (vezérlőegység) hibája": {
    why: "A DQ200 (7 fokozatú, SZÁRAZ kuplungos DSG) mechatronikája hőre és rezgésre érzékeny. Városi, sok indulás-megállás melletti használatnál kopik a leggyorsabban.",
    signs: "Rángatás induláskor, késleltetett kapcsolás, hibajelzés, a váltó „N”-be ugrik menet közben.",
    ask: "Cserélték-e a mechatronikát vagy a kuplungot? Mikor volt olajcsere a váltóban? Próbaútnál figyeld a 1–2. fokozat közötti kapcsolást és a lassú gurulást.",
    risk: "A mechatronika cseréje önmagában több százezer forint; kuplunggal együtt közelít az autó értékéhez.",
  },
  "Kuplung és TCM hibája": {
    why: "A Ford PowerShift (DPS6) száraz kettős kuplungos váltó a Fiesta/Focus modellekben világszerte panaszáradatot okozott — perek és visszahívások is voltak. A kuplung és a vezérlő (TCM) egyaránt tipikus hibapont.",
    signs: "Remegés/rázás elinduláskor, csúszás, rángatás, késleltetett kapcsolás, hibajelzés.",
    ask: "Cserélték-e a kuplungot vagy a TCM-et? Van-e rá garancia? Hosszú próbaút KÖTELEZŐ, sok elindulással, dugóban is.",
    risk: "Ismétlődő javítások — sokan több cserén is átestek. Ha teheted, ugyanennek a modellnek a manuális változatát keresd.",
  },
  "Vezérműszíj — kihagyva motorkár": {
    why: "Az 1.9 PD TDI önmagában rendkívül szívós motor, de a vezérműszíj elszakadása azonnali, végzetes kárt okoz. Az intervallum 90–120 e km.",
    signs: "Nincs előjele — ezért kritikus a szerviztörténet. Nézd meg a szíj állapotát, ha látható.",
    ask: "Mikor és hány km-nél cserélték a szíjat, vízpumpát, feszítőt? Kérj SZÁMLÁT — a szóbeli állítás itt nem elég.",
    risk: "Szakadáskor a szelepek a dugattyúba érnek: hengerfej-felújítás vagy motorcsere.",
  },
  "Olajfogyás (dugattyúgyűrű, gen1–gen2)": {
    why: "A 2008–2012 közötti EA888 (1.8/2.0 TFSI) motorok dugattyúgyűrűi nem vezetik el rendesen az olajat. Sok darab 1000 km-enként több deciliter, akár 1 liter olajat fogyaszt.",
    signs: "Gyakori olajutántöltés, kék füst gyorsításkor, kormos gyertyák, katalizátor-hiba.",
    ask: "Mennyi olajat fogyaszt 1000 km-en? Volt-e dugattyú/gyűrű felújítás? Nézd meg az olajszintet a próbaút előtt ÉS után.",
    risk: "Ha nem figyelik az olajszintet, berágódhat a motor; a gyűrűfelújítás motorbontásos munka.",
  },
  "Hajtásakkumulátor kapacitásvesztés": {
    why: "A hibrid/elektromos hajtásakkumulátor kapacitása az évekkel és a km-ekkel csökken. 200 e km felett vagy 10+ évesen már reális, hogy cellák gyengülnek.",
    signs: "Csökkenő elektromos hatótáv, gyakrabban indul a benzinmotor, ingadozó töltöttségjelző, hibakód.",
    ask: "Kérj akkumulátor-egészség (SoH) mérést — ez nem opció, hanem alapkövetelmény ennél az autónál. Cseréltek-e már cellát vagy modult?",
    risk: "A teljes akkupakk cseréje a legdrágább alkatrész; cellánkénti javítás olcsóbb, de szakműhelyt igényel.",
  },
  "Motorkár-kockázat a 2.0/2.4 GDI-nél (Theta II)": {
    why: "A Hyundai/Kia Theta II (2.0 és 2.4 GDI) motorok egy részénél a gyártás során visszamaradt fémforgács rongálta a forgattyús csapágyakat. Emiatt világszerte visszahívások voltak.",
    signs: "Kopogó, kalapáló hang alapjáraton vagy terhelés alatt, olajnyomás-lámpa, olajfogyás.",
    ask: "Érintett-e ez a példány a visszahívásban, és elvégezték-e? Az alvázszámmal a márkakereskedés meg tudja mondani. Ha kopog: NE vedd meg.",
    risk: "Csapágy-berágódás, teljes motorcsere.",
  },
  "Olajhígulás (oil dilution) + DPF": {
    why: "A Mazda 2.2 Skyactiv-D a DPF regenerálásához gázolajat fecskendez be, ami rövid városi utakon nem ég el, hanem az olajba kerül. Az olaj hígul, romlik a kenőképessége — az olajszint EMELKEDIK.",
    signs: "Emelkedő olajszint a nívópálcán, gázolajszagú olaj, DPF-figyelmeztetés, teljesítménycsökkenés.",
    ask: "Milyen utakat futott (város vagy autópálya)? Milyen gyakran cseréltek olajat? Nézd meg a nívópálcát: ha a MAX fölött van és gázolajszagú, az intő jel.",
    risk: "Hígult olaj → turbó- és motorkopás; súlyos esetben motorkár.",
  },
  "Olajfogyás és turbó-hiba": {
    why: "A Renault 1.2 TCe (H5Ft) 2012–2016 közötti darabjai közismerten sok olajat fogyasztanak, ami a turbó, majd a motor tönkremeneteléhez vezethet.",
    signs: "Gyakori olajutántöltés, kék füst, sípoló turbó, teljesítményvesztés.",
    ask: "Mennyi olajat fogyaszt 1000 km-en? Cserélték-e a turbót vagy a motort? Van-e teljes szerviztörténet?",
    risk: "Turbó- és motorkár; a javítás gyakran meghaladja az autó értékét.",
  },
  "Olajhűtő tömítés szivárgás": {
    why: "Az OM642 (3.0 V6 CDI) olajhűtője a hengersorok közti V-ben ül. A tömítése megkeményedik és szivárogni kezd, jellemzően 150 e km felett.",
    signs: "Olajfolt a motor tetején/hátulján, olajszag melegen, csökkenő olajszint.",
    ask: "Javították-e már az olajhűtő tömítését? Kérj számlát. Emeld fel a motorháztetőt és nézd meg a V-t.",
    risk: "Maga az alkatrész nem drága, a MUNKADÍJ igen — a fél motort szét kell szedni hozzá.",
  },
  "Hűtőrendszer / hengerfej-repedés (korai darabok)": {
    why: "Az 1.0 EcoBoost 2012–2017 közötti darabjainál a degas-cső hibája és a hengerfej repedése ismert probléma, ami túlmelegedés után jelentkezik.",
    signs: "Fogyó hűtővíz, túlmelegedés, fűtés nem melegít rendesen, fehér füst.",
    ask: "Volt-e túlmelegedése? Cserélték-e a hengerfejet vagy a degas-csövet? Nézd meg hidegen a kiegyenlítő tartály szintjét és az olajbetöltő sapkát (majonézes lerakódás gyanús).",
    risk: "Hengerfej-repedés = motorfelújítás vagy -csere.",
  },
};

/* Illesztés: a modell + szabad szöveg alapján keresünk motort/váltót */
function kbMatch(list, text) {
  const t = String(text || "");
  return list.filter((e) => e.m.test(t));
}
