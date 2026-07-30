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
  {
    m: /\b1[.,]6\s*16v\b|\bk4m\b/i, name: "1.6 16V (K4M)",
    faults: [
      { title: "Vezérműszíj", from: 90000, sev: "high", cost: "70–160 e Ft", detail: "Kb. 120 e km-enként; elmulasztva motorkár." },
      { title: "Gyújtótekercs, szelephézag", from: 150000, sev: "mid", cost: "30–100 e Ft", detail: "Rángatás, egyenetlen járás." },
    ],
    note: "Egyszerű, megbízható szívómotor — jó választás első autóként.",
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
    m: /\b(1[.,]4|1[.,]6|1[.,]8)\s*(vvt-?i|dual\s*vvt)\b|\bcorolla\b|\bauris\b|\byaris\b/i, name: "Toyota VVT-i benzin",
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
    m: /\b2[.,]2\s*(skyactiv|d\b)|skyactiv-?d/i, name: "Mazda 2.2 Skyactiv-D",
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
