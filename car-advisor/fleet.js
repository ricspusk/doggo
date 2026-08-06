/* ============================================================
   AutóTanács — FLOTTA-ADATBÁZIS (márka → modell → motor)
   ------------------------------------------------------------
   Ez az adatbázis hajtja a három egymásra épülő legördülő mezőt:
     1. Márka        → csak a létező márkák
     2. Modell       → csak az adott márka modelljei
     3. Motor        → csak az adott modellhez ÉS évjárathoz létező
                       motorok, hengerűrtartalommal és teljesítménnyel

   Így nem lehet nem létező kombinációt megadni.

   FELÉPÍTÉS
   ---------
   ENGINES: minden motor egyszer szerepel, kóddal:
       "kód": [liter, üzemanyag, LE, [gyártástól, gyártásig], váltó?]
   A `váltó` elhagyható; ha meg van adva, csak azzal a váltóval létezett.

   MODELS: modellenként egyetlen sor, a motorok kódjainak felsorolásával.
   A motor akkor választható, ha a gyártási időszaka ÉS a modell gyártási
   időszaka ÉS a megadott évjárat egyszerre stimmel.

   A motorkódok SZÁNDÉKOSAN úgy vannak elnevezve, ahogy a tudásbázis
   (knowledge.js) felismeri őket — így a kiválasztott motorhoz azonnal
   megjön a típushiba-elemzés is.
   ============================================================ */

/* A neveket szándékosan prefixeljük: az app.js-ben is van EV nevű konstans,
   és a klasszikus <script>-ek közös globális hatókörön osztoznak — prefix nélkül
   a duplikált deklaráció az egész app.js-t megölné. */
const F_B = "Benzin", F_D = "Dízel", F_HY = "Hibrid", F_EV = "Elektromos", F_LPG = "LPG / gáz";
const F_MAN = ["Manuális"], F_AUT = ["Automata"];

/* ---------- MOTOROK ---------- */
/* kód: [liter, üzemanyag, jellemző LE, [tól, ig], csak-ez-a-váltó?] */
const ENGINES = {
  /* ===== VW-csoport (VW, Škoda, Seat, Audi, Cupra) ===== */
  "1.0 MPI":            [1.0, F_B, 75,  [2011, 2021]],
  "1.0 TSI":            [1.0, F_B, 110, [2015, 2024]],
  "1.2 HTP":            [1.2, F_B, 70,  [2001, 2015]],
  "1.2 TSI":            [1.2, F_B, 105, [2010, 2017]],
  "1.4 16V":            [1.4, F_B, 85,  [1997, 2012]],
  "1.4 TSI":            [1.4, F_B, 140, [2006, 2019]],
  "1.5 TSI":            [1.5, F_B, 150, [2017, 2024]],
  "1.6 MPI":            [1.6, F_B, 102, [1997, 2016]],
  "1.6 FSI":            [1.6, F_B, 115, [2002, 2009]],
  "1.8 TSI":            [1.8, F_B, 170, [2007, 2021]],
  "1.8 20V Turbo":      [1.8, F_B, 150, [1997, 2006]],
  "2.0 FSI":            [2.0, F_B, 150, [2002, 2009]],
  "2.0 TSI":            [2.0, F_B, 220, [2005, 2024]],
  "1.4 TDI":            [1.4, F_D, 80,  [1999, 2011]],
  "1.6 TDI":            [1.6, F_D, 105, [2009, 2021]],
  "1.9 PD TDI":         [1.9, F_D, 105, [1997, 2010]],
  "2.0 PD TDI":         [2.0, F_D, 140, [2003, 2011]],
  "2.0 TDI":            [2.0, F_D, 150, [2008, 2024]],
  "2.5 TDI V6":         [2.5, F_D, 163, [1997, 2007]],
  "3.0 TDI":            [3.0, F_D, 240, [2004, 2021]],
  "4.0 TDI":            [4.0, F_D, 340, [2010, 2020]],
  "1.4 TSI e-Hybrid":   [1.4, F_HY, 204, [2020, 2024], F_AUT],

  /* ===== BMW / Mini ===== */
  "N43 benzin (1.6/2.0)": [2.0, F_B, 143, [2007, 2012]],
  "N46 benzin (1.8/2.0)": [2.0, F_B, 143, [2004, 2011]],
  "N20 benzin (2.0)":     [2.0, F_B, 184, [2011, 2016]],
  "B38 benzin (1.5)":     [1.5, F_B, 136, [2014, 2024]],
  "B48 benzin (2.0)":     [2.0, F_B, 192, [2014, 2024]],
  "N54 / N55 (3.0)":      [3.0, F_B, 306, [2006, 2016]],
  "B58 benzin (3.0)":     [3.0, F_B, 340, [2015, 2024]],
  "M54 (2.2–3.0)":        [2.5, F_B, 192, [2000, 2006]],
  "N47 dízel (2.0)":      [2.0, F_D, 143, [2007, 2015]],
  "B47 dízel (2.0)":      [2.0, F_D, 190, [2014, 2024]],
  "N57 dízel (3.0)":      [3.0, F_D, 258, [2008, 2019]],
  "M47 dízel (2.0)":      [2.0, F_D, 150, [1998, 2007]],

  /* ===== Mercedes ===== */
  "M271 (1.8 Kompressor)": [1.8, F_B, 156, [2002, 2011]],
  "M274 (1.6/2.0 turbó)":  [2.0, F_B, 184, [2011, 2021]],
  "M272 V6 benzin":        [3.0, F_B, 231, [2004, 2012]],
  "M264 (1.5/2.0 turbó)":  [2.0, F_B, 197, [2018, 2024]],
  "OM640 (2.0 CDI)":       [2.0, F_D, 140, [2004, 2012]],
  "OM646 (2.2 CDI)":       [2.2, F_D, 150, [2002, 2009]],
  "OM651 (2.1 CDI)":       [2.1, F_D, 170, [2008, 2019]],
  "OM654 (2.0 d)":         [2.0, F_D, 194, [2016, 2024]],
  "OM642 V6 CDI (3.0)":    [3.0, F_D, 224, [2005, 2019]],

  /* ===== Opel ===== */
  "1.0 Turbo":          [1.0, F_B, 105, [2014, 2021]],
  "1.2 Twinport":       [1.2, F_B, 80,  [2003, 2014]],
  "1.4 Twinport":       [1.4, F_B, 90,  [2003, 2014]],
  "1.4 Turbo":          [1.4, F_B, 140, [2009, 2021]],
  "1.6 Ecotec":         [1.6, F_B, 115, [2004, 2018]],
  "1.8 Ecotec":         [1.8, F_B, 140, [2004, 2015]],
  "1.3 CDTi":           [1.3, F_D, 95,  [2003, 2015]],
  "1.6 CDTi":           [1.6, F_D, 136, [2013, 2021]],
  "1.7 CDTi":           [1.7, F_D, 125, [2003, 2015]],
  "1.9 CDTi":           [1.9, F_D, 150, [2004, 2011]],
  "2.0 CDTi":           [2.0, F_D, 170, [2008, 2018]],

  /* ===== Ford ===== */
  "1.0 EcoBoost":       [1.0, F_B, 125, [2012, 2023]],
  "1.5 EcoBoost":       [1.5, F_B, 150, [2014, 2023]],
  "1.6 EcoBoost":       [1.6, F_B, 150, [2010, 2017]],
  "1.25 Duratec":       [1.25, F_B, 82, [2002, 2017]],
  "1.6 Ti-VCT":         [1.6, F_B, 125, [2004, 2018]],
  "1.8 Duratec":        [1.8, F_B, 125, [1998, 2011]],
  "2.0 Duratec":        [2.0, F_B, 145, [1998, 2014]],
  "1.5 TDCi":           [1.5, F_D, 120, [2014, 2021]],
  "1.6 TDCi":           [1.6, F_D, 115, [2003, 2018]],
  "1.8 TDCi":           [1.8, F_D, 125, [2001, 2011]],
  "2.0 TDCi":           [2.0, F_D, 150, [2004, 2021]],
  "2.0 EcoBlue":        [2.0, F_D, 190, [2018, 2024]],
  "2.2 TDCi":           [2.2, F_D, 175, [2006, 2016]],

  /* ===== PSA (Peugeot, Citroën, DS, Opel 2019+) ===== */
  "1.0 VTi":            [1.0, F_B, 68,  [2012, 2019]],
  "1.2 VTi":            [1.2, F_B, 82,  [2012, 2019]],
  "1.2 PureTech":       [1.2, F_B, 130, [2014, 2024]],
  "1.4 VTi":            [1.4, F_B, 95,  [2004, 2016]],
  "1.6 VTi":            [1.6, F_B, 120, [2007, 2018]],
  "1.6 THP":            [1.6, F_B, 165, [2006, 2019]],
  "1.4 HDi":            [1.4, F_D, 70,  [2001, 2014]],
  "1.5 BlueHDi":        [1.5, F_D, 130, [2018, 2024]],
  "1.6 HDi":            [1.6, F_D, 110, [2004, 2018]],
  "1.6 BlueHDi":        [1.6, F_D, 120, [2013, 2021]],
  "2.0 HDi":            [2.0, F_D, 140, [1999, 2016]],
  "2.0 BlueHDi":        [2.0, F_D, 177, [2013, 2024]],

  /* ===== Renault / Dacia / Nissan ===== */
  "1.0 SCe":            [1.0, F_B, 75,  [2017, 2024]],
  "1.2 16V":            [1.2, F_B, 75,  [1998, 2016]],
  "1.2 TCe":            [1.2, F_B, 120, [2012, 2019]],
  "1.3 TCe":            [1.3, F_B, 140, [2018, 2024]],
  "1.4 16V (Renault)":  [1.4, F_B, 98,  [1998, 2012]],
  "1.6 16V":            [1.6, F_B, 110, [1999, 2016]],
  "0.9 TCe":            [0.9, F_B, 90,  [2012, 2020]],
  "2.0 16V":            [2.0, F_B, 140, [2000, 2012]],
  "1.5 dCi":            [1.5, F_D, 110, [2001, 2023]],
  "1.6 dCi":            [1.6, F_D, 130, [2011, 2020]],
  "1.9 dCi":            [1.9, F_D, 120, [2001, 2010]],
  "2.0 dCi":            [2.0, F_D, 150, [2005, 2019]],
  "2.3 dCi":            [2.3, F_D, 190, [2014, 2024]],
  "1.2 DIG-T":          [1.2, F_B, 115, [2013, 2019]],
  "1.6 HR16DE":         [1.6, F_B, 117, [2006, 2019]],
  "2.0 MR20DE":         [2.0, F_B, 141, [2007, 2019]],

  /* ===== Toyota / Lexus ===== */
  "1.0 VVT-i":          [1.0, F_B, 69,  [2005, 2022]],
  "1.33 Dual VVT-i":    [1.33, F_B, 101, [2009, 2019]],
  "1.4 VVT-i":          [1.4, F_B, 97,  [1999, 2010]],
  "1.6 Valvematic":     [1.6, F_B, 132, [2009, 2019]],
  "1.8 Valvematic":     [1.8, F_B, 147, [2008, 2018]],
  "2.0 Valvematic":     [2.0, F_B, 152, [2008, 2018]],
  "1.5 Hybrid":         [1.5, F_HY, 100, [2012, 2024], F_AUT],
  "1.8 Hybrid":         [1.8, F_HY, 122, [2003, 2024], F_AUT],
  "2.0 Hybrid":         [2.0, F_HY, 184, [2018, 2024], F_AUT],
  "2.5 Hybrid":         [2.5, F_HY, 218, [2012, 2024], F_AUT],
  "1.4 D-4D":           [1.4, F_D, 90,  [2001, 2018]],
  "2.0 D-4D":           [2.0, F_D, 126, [1999, 2018]],
  "2.2 D-4D":           [2.2, F_D, 150, [2005, 2018]],
  "2.4 D-4D":           [2.4, F_D, 150, [2015, 2023]],
  "2.8 D-4D":           [2.8, F_D, 204, [2018, 2024]],
  "2.5 D-4D":           [2.5, F_D, 144, [2001, 2016]],

  /* ===== Honda ===== */
  "1.2 i-VTEC":         [1.2, F_B, 90,  [2008, 2015]],
  "1.4 i-VTEC":         [1.4, F_B, 100, [2006, 2017]],
  "1.5 i-VTEC":         [1.5, F_B, 130, [2008, 2020]],
  "1.5 VTEC Turbo":     [1.5, F_B, 182, [2016, 2024]],
  "1.8 i-VTEC":         [1.8, F_B, 142, [2006, 2017]],
  "2.0 i-VTEC":         [2.0, F_B, 155, [2002, 2019]],
  "1.6 i-DTEC":         [1.6, F_D, 120, [2012, 2020]],
  "2.2 i-CTDi":         [2.2, F_D, 140, [2003, 2015]],

  /* ===== Mazda ===== */
  "1.3 MZR":            [1.3, F_B, 84,  [2003, 2014]],
  "1.5 Skyactiv-G":     [1.5, F_B, 100, [2014, 2024]],
  "1.6 MZR":            [1.6, F_B, 105, [2002, 2014]],
  "2.0 MZR":            [2.0, F_B, 145, [2002, 2013]],
  "2.0 Skyactiv-G":     [2.0, F_B, 150, [2011, 2024]],
  "2.5 Skyactiv-G":     [2.5, F_B, 194, [2012, 2024]],
  "1.5 Skyactiv-D":     [1.5, F_D, 105, [2014, 2021]],
  "2.2 Skyactiv-D":     [2.2, F_D, 150, [2012, 2023]],

  /* ===== Hyundai / Kia ===== */
  "1.0 T-GDI":          [1.0, F_B, 120, [2015, 2024]],
  "1.2 Kappa":          [1.2, F_B, 84,  [2011, 2024]],
  "1.4 MPI":            [1.4, F_B, 100, [2007, 2022]],
  "1.4 T-GDI":          [1.4, F_B, 140, [2016, 2022]],
  "1.6 GDI":            [1.6, F_B, 135, [2010, 2021]],
  "1.6 MPI Gamma":      [1.6, F_B, 124, [2010, 2021]],
  "1.6 T-GDI":          [1.6, F_B, 177, [2011, 2024]],
  "2.0 MPI":            [2.0, F_B, 155, [2006, 2021]],
  "1.1 CRDi":           [1.1, F_D, 75,  [2011, 2019]],
  "1.4 CRDi":           [1.4, F_D, 90,  [2008, 2020]],
  "1.6 CRDi":           [1.6, F_D, 136, [2005, 2022]],
  "1.7 CRDi":           [1.7, F_D, 141, [2010, 2019]],
  "2.0 CRDi":           [2.0, F_D, 185, [2004, 2021]],
  "2.2 CRDi":           [2.2, F_D, 200, [2005, 2022]],
  "1.6 GDI Hybrid":     [1.6, F_HY, 141, [2016, 2023], F_AUT],

  /* ===== Suzuki ===== */
  "1.0 BoosterJet":     [1.0, F_B, 111, [2015, 2022]],
  "1.2 Dualjet":        [1.2, F_B, 90,  [2010, 2024]],
  "1.3 benzin":         [1.3, F_B, 92,  [2000, 2017]],
  "1.4 BoosterJet":     [1.4, F_B, 140, [2015, 2024]],
  "1.5 benzin":         [1.5, F_B, 102, [2005, 2018]],
  "1.6 benzin":         [1.6, F_B, 120, [2005, 2019]],
  "1.6 DDiS":           [1.6, F_D, 120, [2013, 2019]],
  "1.9 DDiS":           [1.9, F_D, 130, [2005, 2013]],

  /* ===== Fiat / Alfa / Lancia / Jeep ===== */
  "1.2 FIRE":           [1.2, F_B, 69,  [1998, 2020]],
  "1.4 FIRE":           [1.4, F_B, 77,  [2003, 2020]],
  "1.4 T-Jet":          [1.4, F_B, 120, [2007, 2020]],
  "1.4 MultiAir":       [1.4, F_B, 140, [2009, 2021]],
  "1.6 E-Torq":         [1.6, F_B, 110, [2015, 2022]],
  "0.9 TwinAir":        [0.9, F_B, 85,  [2010, 2020]],
  "1.3 MultiJet":       [1.3, F_D, 95,  [2003, 2021]],
  "1.6 MultiJet":       [1.6, F_D, 120, [2008, 2021]],
  "1.9 JTD":            [1.9, F_D, 150, [2002, 2011]],
  "2.0 MultiJet":       [2.0, F_D, 170, [2009, 2021]],
  "2.2 JTD":            [2.2, F_D, 180, [2016, 2022]],

  /* ===== Volvo ===== */
  "1.6 T3/T4":          [1.6, F_B, 150, [2010, 2016]],
  "2.0 T4/T5 (VEA)":    [2.0, F_B, 245, [2014, 2024]],
  "2.5 T5 öthengeres":  [2.5, F_B, 230, [2000, 2014]],
  "1.6 D2":             [1.6, F_D, 115, [2011, 2015]],
  "2.0 D3/D4 (VEA)":    [2.0, F_D, 190, [2014, 2024]],
  "2.0 D3/D4 (5 henger)": [2.0, F_D, 163, [2001, 2015]],
  "2.4 D5":             [2.4, F_D, 205, [2001, 2015]],

  /* ===== Subaru / Mitsubishi / SsangYong ===== */
  "2.0 boxer":          [2.0, F_B, 150, [1998, 2024]],
  "2.5 boxer":          [2.5, F_B, 175, [1998, 2020]],
  "1.6 MIVEC":          [1.6, F_B, 117, [2010, 2020]],
  "1.8 MIVEC":          [1.8, F_B, 143, [2007, 2018]],
  "2.0 MIVEC":          [2.0, F_B, 150, [2003, 2020]],
  "1.6 DI-D":           [1.6, F_D, 114, [2010, 2019]],
  "2.2 DI-D":           [2.2, F_D, 150, [2006, 2019]],
  "2.0 DI-D":           [2.0, F_D, 140, [2003, 2016]],
  "2.0 PHEV":           [2.0, F_HY, 203, [2013, 2021], F_AUT],
  "2.4 PHEV":           [2.4, F_HY, 224, [2018, 2022], F_AUT],

  /* ===== Land Rover / Jaguar ===== */
  "2.0 Ingenium benzin": [2.0, F_B, 250, [2017, 2024]],
  "2.0 Ingenium dízel":  [2.0, F_D, 180, [2015, 2024]],
  "2.2 TD4":             [2.2, F_D, 150, [2006, 2015]],
  "2.7 TDV6":            [2.7, F_D, 190, [2004, 2011]],
  "3.0 TDV6":            [3.0, F_D, 245, [2009, 2018]],

  /* ===== Elektromos ===== */
  "26,8 kWh elektromos": [0, F_EV, 65,  [2021, 2024], F_AUT],
  "32 kWh elektromos":   [0, F_EV, 83,  [2019, 2023], F_AUT],
  "40 kWh elektromos":   [0, F_EV, 150, [2017, 2022], F_AUT],
  "42 kWh elektromos":   [0, F_EV, 170, [2018, 2022], F_AUT],
  "50 kWh elektromos":   [0, F_EV, 136, [2019, 2024], F_AUT],
  "52 kWh elektromos":   [0, F_EV, 135, [2019, 2024], F_AUT],
  "58 kWh elektromos":   [0, F_EV, 204, [2020, 2024], F_AUT],
  "62 kWh elektromos":   [0, F_EV, 217, [2019, 2023], F_AUT],
  "64 kWh elektromos":   [0, F_EV, 204, [2018, 2024], F_AUT],
  "77 kWh elektromos":   [0, F_EV, 299, [2021, 2024], F_AUT],
  "Standard Range":      [0, F_EV, 325, [2017, 2024], F_AUT],
  "Long Range AWD":      [0, F_EV, 440, [2017, 2024], F_AUT],
  "Performance":         [0, F_EV, 460, [2017, 2024], F_AUT],
};

/* ---------- MODELLEK ---------- */
/* Egy sor = egy modell. A motorok kódjait `|` választja el.
   A motor akkor jelenik meg, ha a saját és a modell gyártási időszaka
   is lefedi a megadott évjáratot. */
const FLEET = {
  "Volkswagen": {
    "up!":        [[2011, 2023], "1.0 MPI"],
    "e-up!":      [[2013, 2023], "32 kWh elektromos"],
    "Polo":       [[1997, 2024], "1.0 MPI|1.0 TSI|1.2 HTP|1.2 TSI|1.4 16V|1.4 TSI|1.6 MPI|2.0 TSI|1.4 TDI|1.6 TDI|1.9 PD TDI"],
    "Golf":       [[1997, 2024], "1.0 TSI|1.2 TSI|1.4 16V|1.4 TSI|1.5 TSI|1.6 MPI|1.6 FSI|1.8 TSI|2.0 TSI|1.4 TDI|1.6 TDI|1.9 PD TDI|2.0 PD TDI|2.0 TDI"],
    "Golf Plus":  [[2005, 2014], "1.4 TSI|1.6 MPI|1.6 FSI|1.9 PD TDI|2.0 PD TDI|1.6 TDI|2.0 TDI"],
    "Jetta":      [[2005, 2018], "1.2 TSI|1.4 TSI|1.6 MPI|2.0 TSI|1.6 TDI|1.9 PD TDI|2.0 PD TDI|2.0 TDI"],
    "Passat":     [[1997, 2024], "1.4 TSI|1.5 TSI|1.6 MPI|1.6 FSI|1.8 TSI|2.0 TSI|1.9 PD TDI|2.0 PD TDI|1.6 TDI|2.0 TDI|2.5 TDI V6|3.0 TDI|1.4 TSI e-Hybrid"],
    "Arteon":     [[2017, 2024], "1.5 TSI|2.0 TSI|2.0 TDI"],
    "Scirocco":   [[2008, 2017], "1.4 TSI|2.0 TSI|2.0 TDI"],
    "Touran":     [[2003, 2023], "1.2 TSI|1.4 TSI|1.5 TSI|1.6 MPI|2.0 TSI|1.6 TDI|1.9 PD TDI|2.0 PD TDI|2.0 TDI"],
    "Sharan":     [[1995, 2022], "1.4 TSI|2.0 TSI|1.9 PD TDI|2.0 TDI"],
    "Caddy":      [[2004, 2024], "1.2 TSI|1.4 TSI|1.6 MPI|1.6 TDI|1.9 PD TDI|2.0 TDI"],
    "Transporter":[[2003, 2024], "2.0 TSI|1.9 PD TDI|2.0 TDI|2.5 TDI V6"],
    "T-Cross":    [[2019, 2024], "1.0 TSI|1.5 TSI|1.6 TDI"],
    "T-Roc":      [[2017, 2024], "1.0 TSI|1.5 TSI|2.0 TSI|1.6 TDI|2.0 TDI"],
    "Tiguan":     [[2007, 2024], "1.4 TSI|1.5 TSI|2.0 TSI|2.0 TDI"],
    "Touareg":    [[2002, 2024], "3.0 TDI|2.5 TDI V6"],
    "ID.3":       [[2020, 2024], "58 kWh elektromos|77 kWh elektromos"],
    "ID.4":       [[2021, 2024], "58 kWh elektromos|77 kWh elektromos"],
  },
  "Škoda": {
    "Citigo":     [[2012, 2020], "1.0 MPI"],
    "Fabia":      [[2000, 2024], "1.0 MPI|1.0 TSI|1.2 HTP|1.2 TSI|1.4 16V|1.4 TSI|1.6 MPI|1.4 TDI|1.6 TDI|1.9 PD TDI"],
    "Roomster":   [[2006, 2015], "1.2 HTP|1.2 TSI|1.4 16V|1.6 MPI|1.4 TDI|1.6 TDI|1.9 PD TDI"],
    "Rapid":      [[2012, 2019], "1.0 TSI|1.2 TSI|1.4 TSI|1.6 MPI|1.6 TDI"],
    "Scala":      [[2019, 2024], "1.0 TSI|1.5 TSI|1.6 TDI"],
    "Octavia":    [[1997, 2024], "1.0 TSI|1.2 TSI|1.4 TSI|1.5 TSI|1.6 MPI|1.6 FSI|1.8 TSI|2.0 TSI|1.9 PD TDI|2.0 PD TDI|1.6 TDI|2.0 TDI"],
    "Superb":     [[2001, 2024], "1.4 TSI|1.5 TSI|1.8 TSI|2.0 TSI|1.9 PD TDI|2.0 PD TDI|1.6 TDI|2.0 TDI|2.5 TDI V6"],
    "Yeti":       [[2009, 2017], "1.2 TSI|1.4 TSI|1.8 TSI|1.6 TDI|2.0 TDI"],
    "Kamiq":      [[2019, 2024], "1.0 TSI|1.5 TSI|1.6 TDI"],
    "Karoq":      [[2017, 2024], "1.0 TSI|1.5 TSI|2.0 TSI|1.6 TDI|2.0 TDI"],
    "Kodiaq":     [[2016, 2024], "1.4 TSI|1.5 TSI|2.0 TSI|2.0 TDI"],
    "Enyaq":      [[2021, 2024], "58 kWh elektromos|77 kWh elektromos"],
  },
  "Seat": {
    "Mii":        [[2012, 2020], "1.0 MPI"],
    "Ibiza":      [[1997, 2024], "1.0 MPI|1.0 TSI|1.2 HTP|1.2 TSI|1.4 16V|1.4 TSI|1.5 TSI|1.6 MPI|1.4 TDI|1.6 TDI|1.9 PD TDI"],
    "Leon":       [[1999, 2024], "1.0 TSI|1.2 TSI|1.4 TSI|1.5 TSI|1.6 MPI|1.8 20V Turbo|1.8 TSI|2.0 TSI|1.9 PD TDI|2.0 PD TDI|1.6 TDI|2.0 TDI"],
    "Toledo":     [[1999, 2019], "1.0 TSI|1.2 TSI|1.4 TSI|1.6 MPI|1.6 TDI|1.9 PD TDI"],
    "Arona":      [[2017, 2024], "1.0 TSI|1.5 TSI|1.6 TDI"],
    "Ateca":      [[2016, 2024], "1.0 TSI|1.5 TSI|2.0 TSI|1.6 TDI|2.0 TDI"],
    "Tarraco":    [[2018, 2024], "1.5 TSI|2.0 TSI|2.0 TDI"],
    "Alhambra":   [[1996, 2020], "1.4 TSI|2.0 TSI|1.9 PD TDI|2.0 TDI"],
  },
  "Audi": {
    "A1":         [[2010, 2024], "1.0 TSI|1.2 TSI|1.4 TSI|1.5 TSI|2.0 TSI|1.6 TDI|2.0 TDI"],
    "A3":         [[1996, 2024], "1.0 TSI|1.2 TSI|1.4 TSI|1.5 TSI|1.6 MPI|1.6 FSI|1.8 20V Turbo|1.8 TSI|2.0 FSI|2.0 TSI|1.9 PD TDI|2.0 PD TDI|1.6 TDI|2.0 TDI"],
    "A4":         [[1995, 2024], "1.8 20V Turbo|1.8 TSI|2.0 FSI|2.0 TSI|1.9 PD TDI|2.0 PD TDI|2.0 TDI|2.5 TDI V6|3.0 TDI"],
    "A5":         [[2007, 2024], "1.8 TSI|2.0 TSI|2.0 TDI|3.0 TDI"],
    "A6":         [[1997, 2024], "1.8 20V Turbo|1.8 TSI|2.0 TSI|1.9 PD TDI|2.0 PD TDI|2.0 TDI|2.5 TDI V6|3.0 TDI"],
    "A7":         [[2010, 2024], "2.0 TSI|2.0 TDI|3.0 TDI"],
    "A8":         [[2002, 2024], "3.0 TDI|4.0 TDI"],
    "Q2":         [[2016, 2024], "1.0 TSI|1.5 TSI|2.0 TSI|1.6 TDI|2.0 TDI"],
    "Q3":         [[2011, 2024], "1.4 TSI|1.5 TSI|2.0 TSI|2.0 TDI"],
    "Q5":         [[2008, 2024], "2.0 TSI|2.0 TDI|3.0 TDI"],
    "Q7":         [[2005, 2024], "3.0 TDI"],
    "TT":         [[1998, 2023], "1.8 20V Turbo|1.8 TSI|2.0 TSI|2.0 TDI"],
  },
  "BMW": {
    "1-es":       [[2004, 2024], "N43 benzin (1.6/2.0)|N46 benzin (1.8/2.0)|N20 benzin (2.0)|B38 benzin (1.5)|B48 benzin (2.0)|M47 dízel (2.0)|N47 dízel (2.0)|B47 dízel (2.0)"],
    "2-es":       [[2014, 2024], "B38 benzin (1.5)|B48 benzin (2.0)|B58 benzin (3.0)|B47 dízel (2.0)"],
    "3-as":       [[1998, 2024], "M54 (2.2–3.0)|N43 benzin (1.6/2.0)|N46 benzin (1.8/2.0)|N20 benzin (2.0)|N54 / N55 (3.0)|B48 benzin (2.0)|B58 benzin (3.0)|M47 dízel (2.0)|N47 dízel (2.0)|B47 dízel (2.0)|N57 dízel (3.0)"],
    "4-es":       [[2013, 2024], "N20 benzin (2.0)|B48 benzin (2.0)|B58 benzin (3.0)|N47 dízel (2.0)|B47 dízel (2.0)|N57 dízel (3.0)"],
    "5-ös":       [[1996, 2024], "M54 (2.2–3.0)|N20 benzin (2.0)|N54 / N55 (3.0)|B48 benzin (2.0)|B58 benzin (3.0)|M47 dízel (2.0)|N47 dízel (2.0)|B47 dízel (2.0)|N57 dízel (3.0)"],
    "6-os":       [[2003, 2018], "N54 / N55 (3.0)|N57 dízel (3.0)"],
    "7-es":       [[2001, 2024], "N54 / N55 (3.0)|B58 benzin (3.0)|N57 dízel (3.0)"],
    "X1":         [[2009, 2024], "N20 benzin (2.0)|B38 benzin (1.5)|B48 benzin (2.0)|N47 dízel (2.0)|B47 dízel (2.0)"],
    "X3":         [[2003, 2024], "M54 (2.2–3.0)|N20 benzin (2.0)|B48 benzin (2.0)|B58 benzin (3.0)|M47 dízel (2.0)|N47 dízel (2.0)|B47 dízel (2.0)|N57 dízel (3.0)"],
    "X4":         [[2014, 2024], "B48 benzin (2.0)|B58 benzin (3.0)|B47 dízel (2.0)|N57 dízel (3.0)"],
    "X5":         [[1999, 2024], "N54 / N55 (3.0)|B58 benzin (3.0)|N57 dízel (3.0)"],
    "X6":         [[2008, 2024], "N54 / N55 (3.0)|B58 benzin (3.0)|N57 dízel (3.0)"],
    "Z4":         [[2002, 2024], "M54 (2.2–3.0)|N20 benzin (2.0)|B48 benzin (2.0)|B58 benzin (3.0)"],
    "i3":         [[2013, 2022], "42 kWh elektromos"],
  },
  "Mercedes": {
    "A-osztály":  [[1997, 2024], "M271 (1.8 Kompressor)|M274 (1.6/2.0 turbó)|M264 (1.5/2.0 turbó)|OM640 (2.0 CDI)|OM651 (2.1 CDI)|OM654 (2.0 d)"],
    "B-osztály":  [[2005, 2024], "M271 (1.8 Kompressor)|M274 (1.6/2.0 turbó)|OM640 (2.0 CDI)|OM651 (2.1 CDI)|OM654 (2.0 d)"],
    "C-osztály":  [[2000, 2024], "M271 (1.8 Kompressor)|M274 (1.6/2.0 turbó)|M272 V6 benzin|M264 (1.5/2.0 turbó)|OM646 (2.2 CDI)|OM651 (2.1 CDI)|OM654 (2.0 d)|OM642 V6 CDI (3.0)"],
    "E-osztály":  [[2002, 2024], "M271 (1.8 Kompressor)|M274 (1.6/2.0 turbó)|M272 V6 benzin|M264 (1.5/2.0 turbó)|OM646 (2.2 CDI)|OM651 (2.1 CDI)|OM654 (2.0 d)|OM642 V6 CDI (3.0)"],
    "S-osztály":  [[1998, 2024], "M272 V6 benzin|OM642 V6 CDI (3.0)|OM654 (2.0 d)"],
    "CLA":        [[2013, 2024], "M274 (1.6/2.0 turbó)|M264 (1.5/2.0 turbó)|OM651 (2.1 CDI)|OM654 (2.0 d)"],
    "GLA":        [[2013, 2024], "M274 (1.6/2.0 turbó)|M264 (1.5/2.0 turbó)|OM651 (2.1 CDI)|OM654 (2.0 d)"],
    "GLB":        [[2019, 2024], "M264 (1.5/2.0 turbó)|OM654 (2.0 d)"],
    "GLC":        [[2015, 2024], "M274 (1.6/2.0 turbó)|M264 (1.5/2.0 turbó)|OM651 (2.1 CDI)|OM654 (2.0 d)|OM642 V6 CDI (3.0)"],
    "GLE / ML":   [[2005, 2024], "M272 V6 benzin|OM642 V6 CDI (3.0)|OM654 (2.0 d)"],
    "Vito":       [[2003, 2024], "OM646 (2.2 CDI)|OM651 (2.1 CDI)|OM654 (2.0 d)|OM642 V6 CDI (3.0)"],
    "V-osztály":  [[2014, 2024], "OM651 (2.1 CDI)|OM654 (2.0 d)"],
  },
  "Opel": {
    "Corsa":      [[2000, 2024], "1.0 Turbo|1.2 Twinport|1.4 Twinport|1.4 Turbo|1.6 Ecotec|1.3 CDTi|1.7 CDTi|50 kWh elektromos"],
    "Adam":       [[2013, 2019], "1.2 Twinport|1.4 Twinport|1.0 Turbo"],
    "Astra":      [[1998, 2024], "1.2 Twinport|1.4 Twinport|1.4 Turbo|1.6 Ecotec|1.8 Ecotec|1.3 CDTi|1.6 CDTi|1.7 CDTi|1.9 CDTi|2.0 CDTi"],
    "Insignia":   [[2008, 2022], "1.4 Turbo|1.6 Ecotec|1.8 Ecotec|1.6 CDTi|2.0 CDTi"],
    "Vectra":     [[1995, 2008], "1.6 Ecotec|1.8 Ecotec|1.9 CDTi"],
    "Meriva":     [[2003, 2017], "1.2 Twinport|1.4 Twinport|1.4 Turbo|1.6 Ecotec|1.3 CDTi|1.7 CDTi"],
    "Zafira":     [[1999, 2019], "1.4 Turbo|1.6 Ecotec|1.8 Ecotec|1.7 CDTi|1.9 CDTi|2.0 CDTi"],
    "Mokka":      [[2012, 2024], "1.4 Turbo|1.6 Ecotec|1.6 CDTi|1.2 PureTech|1.5 BlueHDi|50 kWh elektromos"],
    "Crossland":  [[2017, 2024], "1.2 PureTech|1.5 BlueHDi|1.6 CDTi"],
    "Grandland":  [[2017, 2024], "1.2 PureTech|1.5 BlueHDi|2.0 BlueHDi"],
    "Combo":      [[2001, 2024], "1.4 Twinport|1.3 CDTi|1.6 CDTi|1.5 BlueHDi"],
  },
  "Ford": {
    "Ka":         [[1996, 2020], "1.25 Duratec|1.2 FIRE"],
    "Fiesta":     [[2002, 2023], "1.25 Duratec|1.0 EcoBoost|1.6 Ti-VCT|1.5 EcoBoost|1.5 TDCi|1.6 TDCi"],
    "Focus":      [[1998, 2024], "1.0 EcoBoost|1.5 EcoBoost|1.6 EcoBoost|1.6 Ti-VCT|1.8 Duratec|2.0 Duratec|1.5 TDCi|1.6 TDCi|1.8 TDCi|2.0 TDCi|2.0 EcoBlue"],
    "C-Max":      [[2003, 2019], "1.0 EcoBoost|1.6 Ti-VCT|1.8 Duratec|1.5 TDCi|1.6 TDCi|1.8 TDCi|2.0 TDCi"],
    "Mondeo":     [[2000, 2022], "1.0 EcoBoost|1.5 EcoBoost|1.6 EcoBoost|2.0 Duratec|1.6 TDCi|1.8 TDCi|2.0 TDCi|2.2 TDCi|2.0 EcoBlue"],
    "S-Max":      [[2006, 2023], "1.5 EcoBoost|1.6 EcoBoost|2.0 Duratec|1.6 TDCi|2.0 TDCi|2.2 TDCi|2.0 EcoBlue"],
    "Galaxy":     [[2006, 2023], "1.5 EcoBoost|2.0 TDCi|2.2 TDCi|2.0 EcoBlue"],
    "Kuga":       [[2008, 2024], "1.5 EcoBoost|1.6 EcoBoost|1.5 TDCi|2.0 TDCi|2.0 EcoBlue"],
    "EcoSport":   [[2013, 2022], "1.0 EcoBoost|1.5 TDCi|1.6 Ti-VCT"],
    "Puma":       [[2019, 2024], "1.0 EcoBoost"],
    "Ranger":     [[2011, 2024], "2.2 TDCi|2.0 EcoBlue"],
    "Tourneo Connect": [[2013, 2023], "1.0 EcoBoost|1.5 TDCi|1.6 TDCi"],
    "Transit / Tourneo Custom": [[2012, 2024], "2.0 EcoBlue|2.2 TDCi"],
  },
  "Peugeot": {
    "107 / 108":  [[2005, 2021], "1.0 VTi"],
    "206":        [[1998, 2012], "1.4 VTi|1.6 VTi|1.4 HDi|1.6 HDi|2.0 HDi"],
    "207":        [[2006, 2014], "1.4 VTi|1.6 VTi|1.6 THP|1.4 HDi|1.6 HDi"],
    "208":        [[2012, 2024], "1.0 VTi|1.2 VTi|1.2 PureTech|1.4 HDi|1.6 HDi|1.5 BlueHDi|1.6 BlueHDi|50 kWh elektromos"],
    "307":        [[2001, 2008], "1.4 VTi|1.6 VTi|1.6 HDi|2.0 HDi"],
    "308":        [[2007, 2024], "1.2 PureTech|1.6 VTi|1.6 THP|1.6 HDi|1.5 BlueHDi|1.6 BlueHDi|2.0 BlueHDi"],
    "407":        [[2004, 2011], "1.8 20V Turbo|1.6 HDi|2.0 HDi"],
    "508":        [[2010, 2024], "1.6 THP|1.2 PureTech|1.6 HDi|1.6 BlueHDi|2.0 BlueHDi"],
    "2008":       [[2013, 2024], "1.2 VTi|1.2 PureTech|1.6 HDi|1.5 BlueHDi|1.6 BlueHDi|50 kWh elektromos"],
    "3008":       [[2008, 2024], "1.6 THP|1.2 PureTech|1.6 HDi|1.5 BlueHDi|2.0 BlueHDi"],
    "5008":       [[2009, 2024], "1.6 THP|1.2 PureTech|1.6 HDi|1.5 BlueHDi|2.0 BlueHDi"],
    "Partner / Rifter": [[2002, 2024], "1.6 VTi|1.2 PureTech|1.6 HDi|1.5 BlueHDi"],
  },
  "Citroën": {
    "C1":         [[2005, 2021], "1.0 VTi"],
    "C3":         [[2002, 2024], "1.2 VTi|1.2 PureTech|1.4 VTi|1.6 VTi|1.4 HDi|1.6 HDi|1.5 BlueHDi"],
    "C4":         [[2004, 2024], "1.6 VTi|1.6 THP|1.2 PureTech|1.6 HDi|1.5 BlueHDi|2.0 BlueHDi|50 kWh elektromos"],
    "C4 Picasso": [[2006, 2022], "1.6 VTi|1.6 THP|1.2 PureTech|1.6 HDi|1.6 BlueHDi|2.0 BlueHDi"],
    "C5":         [[2001, 2017], "1.6 THP|1.6 HDi|2.0 HDi|2.0 BlueHDi"],
    "C3 Aircross":[[2017, 2024], "1.2 PureTech|1.5 BlueHDi"],
    "C5 Aircross":[[2018, 2024], "1.2 PureTech|1.5 BlueHDi|2.0 BlueHDi"],
    "Berlingo":   [[2002, 2024], "1.6 VTi|1.2 PureTech|1.6 HDi|1.5 BlueHDi"],
  },
  "Renault": {
    "Twingo":     [[1998, 2024], "1.2 16V|0.9 TCe|1.0 SCe"],
    "Clio":       [[1998, 2024], "1.2 16V|1.2 TCe|0.9 TCe|1.3 TCe|1.4 16V (Renault)|1.6 16V|1.5 dCi|1.9 dCi"],
    "Captur":     [[2013, 2024], "1.2 TCe|0.9 TCe|1.3 TCe|1.5 dCi"],
    "Mégane":     [[1999, 2024], "1.2 TCe|1.3 TCe|1.4 16V (Renault)|1.6 16V|2.0 16V|1.5 dCi|1.6 dCi|1.9 dCi|2.0 dCi"],
    "Scénic":     [[1999, 2022], "1.2 TCe|1.4 16V (Renault)|1.6 16V|2.0 16V|1.5 dCi|1.6 dCi|1.9 dCi"],
    "Kadjar":     [[2015, 2022], "1.2 TCe|1.3 TCe|1.5 dCi|1.6 dCi"],
    "Laguna":     [[2001, 2015], "1.6 16V|2.0 16V|1.5 dCi|1.9 dCi|2.0 dCi"],
    "Talisman":   [[2015, 2022], "1.3 TCe|1.5 dCi|1.6 dCi"],
    "Espace":     [[2002, 2023], "2.0 16V|1.6 dCi|2.0 dCi"],
    "Kangoo":     [[2001, 2024], "1.2 TCe|1.6 16V|1.5 dCi|1.9 dCi"],
    "Trafic":     [[2001, 2024], "1.6 dCi|2.0 dCi"],
    "Zoe":        [[2013, 2024], "52 kWh elektromos"],
  },
  "Dacia": {
    "Sandero":    [[2008, 2024], "1.0 SCe|1.2 16V|0.9 TCe|1.4 16V (Renault)|1.6 16V|1.5 dCi"],
    "Logan":      [[2004, 2024], "1.0 SCe|1.2 16V|1.4 16V (Renault)|1.6 16V|1.5 dCi"],
    "Duster":     [[2010, 2024], "1.2 TCe|1.3 TCe|1.6 16V|1.5 dCi"],
    "Lodgy":      [[2012, 2022], "1.2 TCe|1.6 16V|1.5 dCi"],
    "Dokker":     [[2012, 2021], "1.2 TCe|1.6 16V|1.5 dCi"],
    "Jogger":     [[2022, 2024], "1.0 SCe|1.0 BoosterJet|1.3 TCe"],
    "Spring":     [[2021, 2024], "26,8 kWh elektromos"],
  },
  "Toyota": {
    "Aygo":       [[2005, 2024], "1.0 VVT-i"],
    "Yaris":      [[1999, 2024], "1.0 VVT-i|1.33 Dual VVT-i|1.4 VVT-i|1.5 Hybrid|1.4 D-4D"],
    "Auris":      [[2007, 2018], "1.33 Dual VVT-i|1.4 VVT-i|1.6 Valvematic|1.8 Hybrid|1.4 D-4D|2.0 D-4D"],
    "Corolla":    [[1997, 2024], "1.33 Dual VVT-i|1.4 VVT-i|1.6 Valvematic|1.8 Hybrid|2.0 Hybrid|1.4 D-4D|2.0 D-4D"],
    "Avensis":    [[1997, 2018], "1.6 Valvematic|1.8 Valvematic|2.0 Valvematic|2.0 D-4D|2.2 D-4D"],
    "Prius":      [[2000, 2024], "1.8 Hybrid"],
    "C-HR":       [[2016, 2024], "1.8 Hybrid|2.0 Hybrid"],
    "Verso":      [[2009, 2018], "1.6 Valvematic|1.8 Valvematic|2.0 D-4D|2.2 D-4D"],
    "RAV4":       [[2000, 2024], "2.0 Valvematic|2.5 Hybrid|2.0 D-4D|2.2 D-4D"],
    "Camry":      [[2019, 2024], "2.5 Hybrid"],
    "Land Cruiser": [[2003, 2024], "2.8 D-4D|3.0 TDI"],
    "Hilux":      [[2005, 2024], "2.4 D-4D|2.8 D-4D|2.5 D-4D"],
    "Yaris Cross":[[2021, 2024], "1.5 Hybrid"],
  },
  "Honda": {
    "Jazz":       [[2002, 2024], "1.2 i-VTEC|1.4 i-VTEC|1.5 i-VTEC"],
    "Civic":      [[2001, 2024], "1.4 i-VTEC|1.8 i-VTEC|2.0 i-VTEC|1.5 VTEC Turbo|1.6 i-DTEC|2.2 i-CTDi"],
    "Accord":     [[2003, 2015], "2.0 i-VTEC|2.2 i-CTDi"],
    "CR-V":       [[2002, 2024], "2.0 i-VTEC|1.5 VTEC Turbo|1.6 i-DTEC|2.2 i-CTDi"],
    "HR-V":       [[2015, 2024], "1.5 i-VTEC|1.6 i-DTEC"],
  },
  "Nissan": {
    "Micra":      [[2003, 2024], "1.2 16V|1.0 SCe|1.5 dCi"],
    "Note":       [[2006, 2017], "1.2 DIG-T|1.6 HR16DE|1.5 dCi"],
    "Juke":       [[2010, 2024], "1.2 DIG-T|1.6 HR16DE|1.5 dCi"],
    "Qashqai":    [[2007, 2024], "1.2 DIG-T|1.6 HR16DE|2.0 MR20DE|1.5 dCi|1.6 dCi|2.0 dCi"],
    "X-Trail":    [[2001, 2024], "2.0 MR20DE|1.6 dCi|2.0 dCi"],
    "Leaf":       [[2011, 2024], "40 kWh elektromos|62 kWh elektromos"],
    "Navara":     [[2005, 2021], "2.5 D-4D|2.3 dCi"],
  },
  "Mazda": {
    "2":          [[2003, 2024], "1.3 MZR|1.5 Skyactiv-G|1.5 Skyactiv-D"],
    "3":          [[2003, 2024], "1.6 MZR|2.0 MZR|1.5 Skyactiv-G|2.0 Skyactiv-G|1.5 Skyactiv-D|2.2 Skyactiv-D"],
    "6":          [[2002, 2024], "2.0 MZR|2.0 Skyactiv-G|2.5 Skyactiv-G|2.2 Skyactiv-D"],
    "CX-3":       [[2015, 2021], "2.0 Skyactiv-G|1.5 Skyactiv-D"],
    "CX-30":      [[2019, 2024], "2.0 Skyactiv-G"],
    "CX-5":       [[2012, 2024], "2.0 Skyactiv-G|2.5 Skyactiv-G|2.2 Skyactiv-D"],
    "MX-5":       [[1998, 2024], "1.5 Skyactiv-G|2.0 Skyactiv-G|1.6 MZR|2.0 MZR"],
  },
  "Hyundai": {
    "i10":        [[2008, 2024], "1.2 Kappa|1.0 T-GDI"],
    "i20":        [[2008, 2024], "1.2 Kappa|1.4 MPI|1.0 T-GDI|1.1 CRDi|1.4 CRDi"],
    "i30":        [[2007, 2024], "1.4 MPI|1.6 MPI Gamma|1.0 T-GDI|1.4 T-GDI|1.6 T-GDI|1.4 CRDi|1.6 CRDi"],
    "i40":        [[2011, 2019], "1.6 GDI|2.0 MPI|1.7 CRDi"],
    "ix20":       [[2010, 2019], "1.4 MPI|1.6 GDI|1.4 CRDi|1.6 CRDi"],
    "ix35":       [[2010, 2015], "1.6 GDI|2.0 MPI|1.7 CRDi|2.0 CRDi"],
    "Tucson":     [[2004, 2024], "1.6 GDI|1.6 T-GDI|2.0 MPI|1.6 CRDi|1.7 CRDi|2.0 CRDi"],
    "Santa Fe":   [[2001, 2024], "2.0 MPI|2.0 CRDi|2.2 CRDi"],
    "Kona":       [[2017, 2024], "1.0 T-GDI|1.6 T-GDI|1.6 CRDi|64 kWh elektromos"],
    "Ioniq":      [[2016, 2022], "1.6 GDI Hybrid|40 kWh elektromos"],
    "Ioniq 5":    [[2021, 2024], "58 kWh elektromos|77 kWh elektromos"],
  },
  "Kia": {
    "Picanto":    [[2004, 2024], "1.2 Kappa|1.0 T-GDI"],
    "Rio":        [[2005, 2024], "1.2 Kappa|1.4 MPI|1.0 T-GDI|1.1 CRDi|1.4 CRDi"],
    "Ceed":       [[2006, 2024], "1.4 MPI|1.6 MPI Gamma|1.0 T-GDI|1.4 T-GDI|1.6 T-GDI|1.4 CRDi|1.6 CRDi"],
    "Stonic":     [[2017, 2024], "1.0 T-GDI|1.2 Kappa|1.6 CRDi"],
    "Sportage":   [[2004, 2024], "1.6 GDI|1.6 T-GDI|2.0 MPI|1.6 CRDi|1.7 CRDi|2.0 CRDi"],
    "Sorento":    [[2002, 2024], "2.0 CRDi|2.2 CRDi"],
    "Niro":       [[2016, 2024], "1.6 GDI Hybrid|64 kWh elektromos"],
    "Soul":       [[2009, 2024], "1.6 GDI|1.6 CRDi|64 kWh elektromos"],
    "Carens":     [[2006, 2019], "1.6 GDI|2.0 MPI|1.7 CRDi"],
    "EV6":        [[2021, 2024], "58 kWh elektromos|77 kWh elektromos"],
  },
  "Suzuki": {
    "Alto":       [[2002, 2015], "1.0 VVT-i|1.2 Dualjet"],
    "Swift":      [[2005, 2024], "1.2 Dualjet|1.3 benzin|1.5 benzin|1.0 BoosterJet|1.4 BoosterJet|1.3 MultiJet"],
    "Ignis":      [[2000, 2024], "1.2 Dualjet|1.3 benzin"],
    "Baleno":     [[2016, 2019], "1.0 BoosterJet|1.2 Dualjet"],
    "SX4":        [[2006, 2014], "1.6 benzin|1.9 DDiS|1.6 DDiS"],
    "S-Cross":    [[2013, 2024], "1.6 benzin|1.0 BoosterJet|1.4 BoosterJet|1.6 DDiS"],
    "Vitara":     [[1988, 2024], "1.6 benzin|1.4 BoosterJet|1.0 BoosterJet|1.6 DDiS|1.9 DDiS"],
    "Jimny":      [[1998, 2024], "1.3 benzin|1.5 benzin"],
  },
  "Fiat": {
    "Panda":      [[2003, 2024], "1.2 FIRE|1.4 FIRE|0.9 TwinAir|1.3 MultiJet"],
    "Punto":      [[1999, 2018], "1.2 FIRE|1.4 FIRE|1.4 T-Jet|1.4 MultiAir|1.3 MultiJet|1.6 MultiJet"],
    "500":        [[2007, 2024], "1.2 FIRE|1.4 FIRE|0.9 TwinAir|1.4 MultiAir|1.3 MultiJet"],
    "500X":       [[2015, 2024], "1.4 MultiAir|1.6 E-Torq|1.3 MultiJet|1.6 MultiJet|2.0 MultiJet"],
    "500L":       [[2012, 2022], "1.4 FIRE|0.9 TwinAir|1.3 MultiJet|1.6 MultiJet"],
    "Bravo":      [[2007, 2014], "1.4 T-Jet|1.4 FIRE|1.6 MultiJet|2.0 MultiJet"],
    "Tipo":       [[2016, 2024], "1.4 FIRE|1.6 E-Torq|1.3 MultiJet|1.6 MultiJet"],
    "Doblo":      [[2001, 2022], "1.4 FIRE|1.3 MultiJet|1.6 MultiJet|2.0 MultiJet"],
  },
  "Alfa Romeo": {
    "MiTo":       [[2008, 2018], "1.4 T-Jet|1.4 MultiAir|1.3 MultiJet|1.6 MultiJet"],
    "Giulietta":  [[2010, 2020], "1.4 T-Jet|1.4 MultiAir|1.6 MultiJet|2.0 MultiJet"],
    "Giulia":     [[2016, 2024], "2.0 TSI|2.2 JTD"],
    "Stelvio":    [[2017, 2024], "2.0 TSI|2.2 JTD"],
    "159":        [[2005, 2011], "1.9 JTD|2.0 MultiJet"],
    "147":        [[2000, 2010], "1.6 16V|1.9 JTD"],
  },
  "Volvo": {
    "V40":        [[2012, 2019], "1.6 T3/T4|2.0 T4/T5 (VEA)|1.6 D2|2.0 D3/D4 (VEA)"],
    "S60 / V60":  [[2010, 2024], "1.6 T3/T4|2.0 T4/T5 (VEA)|2.5 T5 öthengeres|2.0 D3/D4 (5 henger)|2.0 D3/D4 (VEA)|2.4 D5"],
    "S80 / V70":  [[1998, 2016], "2.5 T5 öthengeres|2.0 D3/D4 (5 henger)|2.4 D5"],
    "XC40":       [[2017, 2024], "2.0 T4/T5 (VEA)|2.0 D3/D4 (VEA)"],
    "XC60":       [[2008, 2024], "2.0 T4/T5 (VEA)|2.5 T5 öthengeres|2.0 D3/D4 (VEA)|2.4 D5"],
    "XC90":       [[2002, 2024], "2.0 T4/T5 (VEA)|2.0 D3/D4 (VEA)|2.4 D5"],
  },
  "Mitsubishi": {
    "Space Star": [[2013, 2024], "1.2 16V|1.0 SCe"],
    "Colt":       [[2004, 2013], "1.2 16V|1.3 MultiJet|1.5 benzin"],
    "Lancer":     [[2003, 2017], "1.6 MIVEC|1.8 MIVEC|2.0 MIVEC|2.0 DI-D"],
    "ASX":        [[2010, 2024], "1.6 MIVEC|1.8 MIVEC|1.6 DI-D|2.2 DI-D"],
    "Outlander":  [[2003, 2022], "2.0 MIVEC|2.0 PHEV|2.4 PHEV|2.2 DI-D"],
    "Eclipse Cross": [[2017, 2024], "1.5 TSI|2.2 DI-D"],
  },
  "Subaru": {
    "Impreza":    [[2000, 2024], "1.6 MIVEC|2.0 boxer|2.5 boxer"],
    "XV":         [[2012, 2024], "1.6 MIVEC|2.0 boxer"],
    "Forester":   [[2002, 2024], "2.0 boxer|2.5 boxer"],
    "Outback":    [[2003, 2024], "2.0 boxer|2.5 boxer"],
    "Legacy":     [[2003, 2015], "2.0 boxer|2.5 boxer"],
  },
  "Land Rover": {
    "Freelander":  [[2006, 2015], "2.2 TD4"],
    "Discovery Sport": [[2015, 2024], "2.0 Ingenium benzin|2.0 Ingenium dízel|2.2 TD4"],
    "Discovery":   [[2004, 2024], "2.7 TDV6|3.0 TDV6|2.0 Ingenium dízel"],
    "Range Rover Evoque": [[2011, 2024], "2.0 Ingenium benzin|2.0 Ingenium dízel|2.2 TD4"],
    "Range Rover Sport": [[2005, 2024], "2.7 TDV6|3.0 TDV6|2.0 Ingenium dízel"],
    "Range Rover": [[2002, 2024], "3.0 TDV6|3.0 TDI"],
  },
  "Jaguar": {
    "XE":         [[2015, 2024], "2.0 Ingenium benzin|2.0 Ingenium dízel"],
    "XF":         [[2008, 2024], "2.0 Ingenium benzin|2.0 Ingenium dízel|2.7 TDV6|3.0 TDV6"],
    "F-Pace":     [[2016, 2024], "2.0 Ingenium benzin|2.0 Ingenium dízel|3.0 TDV6"],
  },
  "Lexus": {
    "CT":         [[2011, 2020], "1.8 Hybrid"],
    "IS":         [[2005, 2024], "2.5 Hybrid|2.2 D-4D"],
    "UX":         [[2019, 2024], "2.0 Hybrid"],
    "NX":         [[2014, 2024], "2.5 Hybrid"],
    "RX":         [[2003, 2024], "2.5 Hybrid"],
    "ES":         [[2018, 2024], "2.5 Hybrid"],
  },
  "Mini": {
    "Cooper":     [[2001, 2024], "B38 benzin (1.5)|B48 benzin (2.0)|1.6 VTi|1.6 THP|B47 dízel (2.0)|1.6 HDi"],
    "Countryman": [[2010, 2024], "B38 benzin (1.5)|B48 benzin (2.0)|1.6 THP|B47 dízel (2.0)|1.6 HDi"],
    "Clubman":    [[2007, 2024], "B38 benzin (1.5)|B48 benzin (2.0)|1.6 THP|B47 dízel (2.0)"],
  },
  "Tesla": {
    "Model 3":    [[2017, 2024], "Standard Range|Long Range AWD|Performance"],
    "Model Y":    [[2020, 2024], "Long Range AWD|Performance"],
    "Model S":    [[2012, 2024], "Long Range AWD|Performance"],
    "Model X":    [[2015, 2024], "Long Range AWD|Performance"],
  },
  "Cupra": {
    "Leon":       [[2018, 2024], "1.5 TSI|2.0 TSI|2.0 TDI"],
    "Formentor":  [[2020, 2024], "1.5 TSI|2.0 TSI|2.0 TDI"],
    "Ateca":      [[2018, 2024], "2.0 TSI"],
  },
  "Chevrolet": {
    "Spark":      [[2005, 2016], "1.0 VVT-i|1.2 Twinport"],
    "Aveo":       [[2005, 2015], "1.2 Twinport|1.4 Twinport|1.3 CDTi"],
    "Cruze":      [[2009, 2016], "1.6 Ecotec|1.8 Ecotec|1.7 CDTi|2.0 CDTi"],
    "Captiva":    [[2006, 2018], "2.4 D-4D|2.0 CDTi|2.2 CRDi"],
    "Orlando":    [[2011, 2018], "1.8 Ecotec|2.0 CDTi"],
  },
  "SsangYong": {
    "Tivoli":     [[2015, 2023], "1.6 MPI Gamma|1.6 CRDi"],
    "Korando":    [[2011, 2024], "2.0 MPI|2.0 CRDi|2.2 CRDi"],
    "Rexton":     [[2003, 2024], "2.0 CRDi|2.2 CRDi"],
  },
  "MG": {
    "ZS":         [[2019, 2024], "1.0 T-GDI|1.5 Skyactiv-G|50 kWh elektromos"],
    "MG4":        [[2022, 2024], "50 kWh elektromos|64 kWh elektromos"],
    "MG5":        [[2021, 2024], "50 kWh elektromos"],
    "HS":         [[2019, 2024], "1.5 TSI"],
  },
  "Smart": {
    "Fortwo":     [[1998, 2024], "1.0 VVT-i|32 kWh elektromos"],
    "Forfour":    [[2004, 2021], "1.0 VVT-i|32 kWh elektromos"],
  },
  "Porsche": {
    "Cayenne":    [[2002, 2024], "3.0 TDI|2.0 TSI"],
    "Macan":      [[2014, 2024], "2.0 TSI|3.0 TDI"],
    "Panamera":   [[2009, 2024], "3.0 TDI|2.0 TSI"],
  },
  "Jeep": {
    "Renegade":   [[2014, 2024], "1.4 MultiAir|1.6 E-Torq|1.6 MultiJet|2.0 MultiJet"],
    "Compass":    [[2006, 2024], "1.4 MultiAir|1.6 MultiJet|2.0 MultiJet|2.2 CRDi"],
    "Cherokee":   [[2001, 2024], "2.0 MultiJet|2.2 JTD|2.8 D-4D"],
    "Grand Cherokee": [[1999, 2024], "3.0 TDI|3.0 TDV6"],
    "Wrangler":   [[2007, 2024], "2.8 D-4D|2.0 TSI"],
  },
};

/* ============================================================
   2025-ÖS MODELLÉV — hajtáslánc-bővítés
   ------------------------------------------------------------
   A fenti tábla a 2024-es állapotot fedte le. Ez a blokk hozzáadja
   az Európában 2025-ben forgalmazott hajtásláncokat:
     - 48 voltos mild hibrid (MHEV) változatok
     - új generációs full hibridek (e:HEV, E-Tech, e-Power, 5. gen HSD)
     - tölthető hibridek (PHEV)
     - a friss elektromos modellek és akkumulátor-méretek
   Egyben kiterjeszti a még gyártásban lévő modellek évjárat-sávját.
   ============================================================ */

const ENGINES_2025 = {
  /* ----- VW-csoport ----- */
  "1.0 eTSI (48V)":        [1.0, F_B, 116, [2020, 2026]],
  "1.5 eTSI (48V)":        [1.5, F_B, 150, [2019, 2026]],
  "2.0 TSI evo":           [2.0, F_B, 265, [2019, 2026]],
  "2.0 TDI evo":           [2.0, F_D, 150, [2020, 2026]],
  "1.4 eHybrid (PHEV)":    [1.4, F_HY, 204, [2020, 2024], F_AUT],
  "1.5 eHybrid (PHEV)":    [1.5, F_HY, 204, [2024, 2026], F_AUT],
  "1.5 TSI mHEV":          [1.5, F_B, 150, [2023, 2026]],

  /* ----- Hyundai / Kia ----- */
  "1.0 T-GDI MHEV (48V)":  [1.0, F_B, 120, [2020, 2026]],
  "1.5 T-GDI MHEV (48V)":  [1.5, F_B, 160, [2022, 2026]],
  "1.6 CRDi MHEV (48V)":   [1.6, F_D, 136, [2019, 2026]],
  "1.6 T-GDI Hybrid":      [1.6, F_HY, 141, [2020, 2026], F_AUT],
  "1.6 T-GDI PHEV":        [1.6, F_HY, 265, [2020, 2026], F_AUT],
  "2.0 T-GDI N":           [2.0, F_B, 280, [2017, 2026]],
  "1.0 T-GDI 48V Bayon":   [1.0, F_B, 100, [2021, 2026]],

  /* ----- Toyota / Lexus ----- */
  "1.5 Hybrid (5. gen)":   [1.5, F_HY, 116, [2020, 2026], F_AUT],
  "1.8 Hybrid (5. gen)":   [1.8, F_HY, 140, [2022, 2026], F_AUT],
  "2.0 Hybrid (5. gen)":   [2.0, F_HY, 196, [2022, 2026], F_AUT],
  "2.5 Plug-in Hybrid":    [2.5, F_HY, 306, [2020, 2026], F_AUT],

  /* ----- Renault / Dacia / Nissan ----- */
  "1.2 E-Tech Hybrid":     [1.2, F_HY, 160, [2024, 2026], F_AUT],
  "1.6 E-Tech Hybrid":     [1.6, F_HY, 145, [2020, 2026], F_AUT],
  "1.3 TCe MHEV (48V)":    [1.3, F_B, 160, [2022, 2026]],
  "1.2 TCe MHEV (48V)":    [1.2, F_B, 130, [2024, 2026]],
  "1.6 Hybrid 140":        [1.6, F_HY, 140, [2022, 2026], F_AUT],
  "1.0 TCe ECO-G (LPG)":   [1.0, F_LPG, 100, [2019, 2026]],
  "1.5 e-Power":           [1.5, F_HY, 190, [2021, 2026], F_AUT],
  "1.3 DIG-T MHEV":        [1.3, F_B, 158, [2021, 2026]],

  /* ----- Stellantis (Peugeot, Citroën, Opel, Fiat, Jeep, Alfa) ----- */
  "1.2 PureTech Hybrid":   [1.2, F_HY, 145, [2023, 2026], F_AUT],
  "1.6 PHEV":              [1.6, F_HY, 225, [2019, 2026], F_AUT],
  "1.5 BlueHDi 130":       [1.5, F_D, 130, [2018, 2026]],
  "1.3 MultiJet MHEV":     [1.3, F_B, 130, [2020, 2026]],

  /* ----- Ford ----- */
  "1.0 EcoBoost mHEV":     [1.0, F_B, 155, [2020, 2026]],
  "2.5 Duratec Hybrid":    [2.5, F_HY, 190, [2019, 2026], F_AUT],
  "2.5 Duratec PHEV":      [2.5, F_HY, 225, [2020, 2026], F_AUT],

  /* ----- BMW / Mini ----- */
  "B48 TU benzin (2.0)":   [2.0, F_B, 204, [2021, 2026]],
  "B47 TU dízel (2.0)":    [2.0, F_D, 197, [2020, 2026]],
  "B58 TU benzin (3.0)":   [3.0, F_B, 381, [2019, 2026]],

  /* ----- Mercedes ----- */
  "M254 (2.0 turbó 48V)":  [2.0, F_B, 258, [2021, 2026]],
  "OM654M (2.0 d 48V)":    [2.0, F_D, 265, [2020, 2026]],

  /* ----- Volvo ----- */
  "B3/B4 (48V benzin)":    [2.0, F_B, 197, [2020, 2026]],
  "B5 (48V benzin)":       [2.0, F_B, 250, [2020, 2026]],
  "T6/T8 PHEV":            [2.0, F_HY, 350, [2019, 2026], F_AUT],

  /* ----- Japán / kínai gyártók ----- */
  "1.2 Dualjet Hybrid":    [1.2, F_HY, 83,  [2020, 2026]],
  "1.4 BoosterJet MHEV":   [1.4, F_B, 129, [2018, 2026]],
  "1.5 e:HEV":             [1.5, F_HY, 131, [2020, 2026], F_AUT],
  "2.0 e:HEV":             [2.0, F_HY, 184, [2019, 2026], F_AUT],
  "2.0 e-Skyactiv G MHEV": [2.0, F_B, 150, [2019, 2026]],
  "2.5 e-Skyactiv PHEV":   [2.5, F_HY, 327, [2022, 2026], F_AUT],
  "3.3 e-Skyactiv D":      [3.3, F_D, 254, [2022, 2026]],
  "1.5 Hybrid+":           [1.5, F_HY, 194, [2023, 2026], F_AUT],
  "1.6 PHEV MG":           [1.6, F_HY, 258, [2020, 2026], F_AUT],

  /* ----- Elektromos: friss akkumulátor-méretek ----- */
  "48 kWh elektromos":     [0, F_EV, 156, [2023, 2026], F_AUT],
  "51 kWh elektromos":     [0, F_EV, 156, [2023, 2026], F_AUT],
  "54 kWh elektromos":     [0, F_EV, 156, [2023, 2026], F_AUT],
  "60 kWh elektromos":     [0, F_EV, 220, [2022, 2026], F_AUT],
  "63 kWh elektromos":     [0, F_EV, 204, [2023, 2026], F_AUT],
  "65 kWh elektromos":     [0, F_EV, 218, [2023, 2026], F_AUT],
  "66 kWh elektromos":     [0, F_EV, 313, [2022, 2026], F_AUT],
  "69 kWh elektromos":     [0, F_EV, 272, [2023, 2026], F_AUT],
  "71 kWh elektromos":     [0, F_EV, 218, [2022, 2026], F_AUT],
  "73 kWh elektromos":     [0, F_EV, 213, [2023, 2026], F_AUT],
  "79 kWh elektromos":     [0, F_EV, 286, [2023, 2026], F_AUT],
  "82 kWh elektromos":     [0, F_EV, 231, [2021, 2026], F_AUT],
  "84 kWh elektromos":     [0, F_EV, 340, [2022, 2026], F_AUT],
  "86 kWh elektromos":     [0, F_EV, 286, [2023, 2026], F_AUT],
  "87 kWh elektromos":     [0, F_EV, 220, [2024, 2026], F_AUT],
  "89 kWh elektromos":     [0, F_EV, 292, [2021, 2026], F_AUT],
  "99 kWh elektromos":     [0, F_EV, 384, [2023, 2026], F_AUT],
};

/* Modellenként: [évjárat-sáv 2025-re kiterjesztve, hozzáadandó motorkódok] */
const FLEET_2025 = {
  "Volkswagen": {
    "Polo":     [[1997, 2026], "1.0 TSI|1.0 eTSI (48V)"],
    "Golf":     [[1997, 2026], "1.0 eTSI (48V)|1.5 eTSI (48V)|1.5 TSI mHEV|2.0 TSI evo|2.0 TDI evo|1.4 eHybrid (PHEV)|1.5 eHybrid (PHEV)"],
    "Passat":   [[1973, 2026], "1.5 eTSI (48V)|2.0 TSI evo|2.0 TDI evo|1.5 eHybrid (PHEV)"],
    "Arteon":   [[2017, 2025], "1.5 eTSI (48V)|2.0 TSI evo|2.0 TDI evo"],
    "Touran":   [[2003, 2026], "1.5 eTSI (48V)|2.0 TDI evo"],
    "T-Cross":  [[2019, 2026], "1.0 TSI|1.5 eTSI (48V)"],
    "T-Roc":    [[2017, 2026], "1.0 TSI|1.5 eTSI (48V)|2.0 TSI evo|2.0 TDI evo"],
    "Taigo":    [[2021, 2026], "1.0 TSI|1.5 eTSI (48V)"],
    "Tiguan":   [[2007, 2026], "1.5 eTSI (48V)|2.0 TSI evo|2.0 TDI evo|1.5 eHybrid (PHEV)"],
    "Tayron":   [[2024, 2026], "1.5 eTSI (48V)|2.0 TSI evo|2.0 TDI evo|1.5 eHybrid (PHEV)"],
    "Touareg":  [[2002, 2026], "3.0 TDI"],
    "Caddy":    [[2004, 2026], "1.5 TSI|2.0 TDI evo"],
    "Transporter": [[2003, 2026], "2.0 TDI evo|77 kWh elektromos"],
    "ID.3":     [[2020, 2026], "58 kWh elektromos|63 kWh elektromos|77 kWh elektromos|79 kWh elektromos"],
    "ID.4":     [[2021, 2026], "52 kWh elektromos|77 kWh elektromos|79 kWh elektromos"],
    "ID.5":     [[2022, 2026], "77 kWh elektromos|79 kWh elektromos"],
    "ID.7":     [[2023, 2026], "77 kWh elektromos|86 kWh elektromos"],
  },
  "Škoda": {
    "Fabia":    [[2000, 2026], "1.0 TSI"],
    "Scala":    [[2019, 2026], "1.0 TSI|1.5 TSI"],
    "Octavia":  [[1997, 2026], "1.0 eTSI (48V)|1.5 eTSI (48V)|2.0 TSI evo|2.0 TDI evo|1.5 eHybrid (PHEV)"],
    "Superb":   [[2001, 2026], "1.5 eTSI (48V)|2.0 TSI evo|2.0 TDI evo|1.5 eHybrid (PHEV)"],
    "Kamiq":    [[2019, 2026], "1.0 TSI|1.5 TSI"],
    "Karoq":    [[2017, 2026], "1.5 TSI|2.0 TSI evo|2.0 TDI evo"],
    "Kodiaq":   [[2016, 2026], "1.5 eTSI (48V)|2.0 TSI evo|2.0 TDI evo|1.5 eHybrid (PHEV)"],
    "Enyaq":    [[2021, 2026], "58 kWh elektromos|63 kWh elektromos|77 kWh elektromos|79 kWh elektromos"],
    "Elroq":    [[2024, 2026], "51 kWh elektromos|63 kWh elektromos|77 kWh elektromos"],
  },
  "Seat": {
    "Ibiza":    [[1997, 2026], "1.0 TSI|1.5 TSI"],
    "Arona":    [[2017, 2026], "1.0 TSI|1.5 TSI"],
    "Leon":     [[1999, 2026], "1.0 eTSI (48V)|1.5 eTSI (48V)|2.0 TSI evo|2.0 TDI evo|1.5 eHybrid (PHEV)"],
    "Ateca":    [[2016, 2026], "1.5 TSI|2.0 TSI evo|2.0 TDI evo"],
    "Tarraco":  [[2018, 2026], "1.5 TSI|2.0 TSI evo|2.0 TDI evo|1.4 eHybrid (PHEV)"],
  },
  "Cupra": {
    "Leon":       [[2018, 2026], "1.5 eTSI (48V)|2.0 TSI evo|1.5 eHybrid (PHEV)"],
    "Formentor":  [[2020, 2026], "1.5 eTSI (48V)|2.0 TSI evo|1.5 eHybrid (PHEV)"],
    "Terramar":   [[2024, 2026], "1.5 eTSI (48V)|2.0 TSI evo|1.5 eHybrid (PHEV)"],
    "Born":       [[2021, 2026], "58 kWh elektromos|77 kWh elektromos|79 kWh elektromos"],
    "Tavascan":   [[2024, 2026], "77 kWh elektromos|79 kWh elektromos"],
  },
  "Audi": {
    "A1":  [[2010, 2026], "1.0 TSI|1.5 TSI"],
    "A3":  [[1996, 2026], "1.0 eTSI (48V)|1.5 eTSI (48V)|2.0 TSI evo|2.0 TDI evo|1.4 eHybrid (PHEV)"],
    "A4":  [[1995, 2026], "2.0 TSI evo|2.0 TDI evo"],
    "A5":  [[2007, 2026], "2.0 TSI evo|2.0 TDI evo"],
    "A6":  [[1997, 2026], "2.0 TSI evo|2.0 TDI evo|3.0 TDI"],
    "Q2":  [[2016, 2026], "1.0 TSI|1.5 TSI|2.0 TDI evo"],
    "Q3":  [[2011, 2026], "1.5 eTSI (48V)|2.0 TSI evo|2.0 TDI evo|1.4 eHybrid (PHEV)"],
    "Q5":  [[2008, 2026], "2.0 TSI evo|2.0 TDI evo|3.0 TDI"],
    "Q4 e-tron": [[2021, 2026], "52 kWh elektromos|77 kWh elektromos|79 kWh elektromos"],
    "Q8 e-tron": [[2019, 2026], "89 kWh elektromos|99 kWh elektromos"],
  },
  "BMW": {
    "1-es": [[2004, 2026], "B48 TU benzin (2.0)|B47 TU dízel (2.0)"],
    "2-es": [[2014, 2026], "B48 TU benzin (2.0)|B58 TU benzin (3.0)|B47 TU dízel (2.0)"],
    "3-as": [[1998, 2026], "B48 TU benzin (2.0)|B58 TU benzin (3.0)|B47 TU dízel (2.0)"],
    "4-es": [[2013, 2026], "B48 TU benzin (2.0)|B58 TU benzin (3.0)|B47 TU dízel (2.0)"],
    "5-ös": [[1996, 2026], "B48 TU benzin (2.0)|B58 TU benzin (3.0)|B47 TU dízel (2.0)"],
    "X1":   [[2009, 2026], "B48 TU benzin (2.0)|B47 TU dízel (2.0)"],
    "X3":   [[2003, 2026], "B48 TU benzin (2.0)|B58 TU benzin (3.0)|B47 TU dízel (2.0)"],
    "iX1":  [[2022, 2026], "66 kWh elektromos"],
    "i4":   [[2021, 2026], "84 kWh elektromos"],
    "i5":   [[2023, 2026], "84 kWh elektromos"],
    "iX":   [[2021, 2026], "77 kWh elektromos|99 kWh elektromos"],
  },
  "Mercedes": {
    "A-osztály": [[1997, 2026], "M254 (2.0 turbó 48V)|OM654M (2.0 d 48V)"],
    "B-osztály": [[2005, 2026], "M254 (2.0 turbó 48V)|OM654M (2.0 d 48V)"],
    "C-osztály": [[2000, 2026], "M254 (2.0 turbó 48V)|OM654M (2.0 d 48V)"],
    "E-osztály": [[2002, 2026], "M254 (2.0 turbó 48V)|OM654M (2.0 d 48V)"],
    "CLA":       [[2013, 2026], "M254 (2.0 turbó 48V)|OM654M (2.0 d 48V)"],
    "GLA":       [[2013, 2026], "M254 (2.0 turbó 48V)|OM654M (2.0 d 48V)"],
    "GLB":       [[2019, 2026], "M254 (2.0 turbó 48V)|OM654M (2.0 d 48V)"],
    "GLC":       [[2015, 2026], "M254 (2.0 turbó 48V)|OM654M (2.0 d 48V)"],
    "EQA":       [[2021, 2026], "66 kWh elektromos|69 kWh elektromos"],
    "EQB":       [[2021, 2026], "66 kWh elektromos|69 kWh elektromos"],
    "EQE":       [[2022, 2026], "89 kWh elektromos"],
  },
  "Toyota": {
    "Aygo X":       [[2022, 2026], "1.0 VVT-i|1.5 Hybrid (5. gen)"],
    "Yaris":        [[1999, 2026], "1.5 Hybrid (5. gen)"],
    "Yaris Cross":  [[2021, 2026], "1.5 Hybrid (5. gen)"],
    "Corolla":      [[1997, 2026], "1.8 Hybrid (5. gen)|2.0 Hybrid (5. gen)"],
    "Corolla Cross":[[2022, 2026], "1.8 Hybrid (5. gen)|2.0 Hybrid (5. gen)"],
    "C-HR":         [[2016, 2026], "1.8 Hybrid (5. gen)|2.0 Hybrid (5. gen)|2.0 Hybrid (5. gen)"],
    "RAV4":         [[2000, 2026], "2.5 Hybrid|2.5 Plug-in Hybrid"],
    "Camry":        [[2019, 2026], "2.5 Hybrid"],
    "bZ4X":         [[2022, 2026], "71 kWh elektromos"],
    "Hilux":        [[2005, 2026], "2.8 D-4D"],
    "Land Cruiser": [[2003, 2026], "2.8 D-4D"],
  },
  "Lexus": {
    "UX": [[2019, 2026], "2.0 Hybrid (5. gen)|71 kWh elektromos"],
    "NX": [[2014, 2026], "2.5 Hybrid|2.5 Plug-in Hybrid"],
    "RX": [[2003, 2026], "2.5 Hybrid|2.5 Plug-in Hybrid"],
    "ES": [[2018, 2026], "2.5 Hybrid"],
  },
  "Hyundai": {
    "i10":      [[2008, 2026], "1.2 Kappa|1.0 T-GDI"],
    "i20":      [[2008, 2026], "1.0 T-GDI MHEV (48V)"],
    "i30":      [[2007, 2026], "1.0 T-GDI MHEV (48V)|1.5 T-GDI MHEV (48V)|1.6 CRDi MHEV (48V)|2.0 T-GDI N"],
    "Bayon":    [[2021, 2026], "1.0 T-GDI 48V Bayon|1.2 Kappa"],
    "Kona":     [[2017, 2026], "1.0 T-GDI MHEV (48V)|1.6 T-GDI Hybrid|48 kWh elektromos|65 kWh elektromos"],
    "Tucson":   [[2004, 2026], "1.6 T-GDI MHEV (48V)|1.6 T-GDI Hybrid|1.6 T-GDI PHEV|1.6 CRDi MHEV (48V)"],
    "Santa Fe": [[2001, 2026], "1.6 T-GDI Hybrid|1.6 T-GDI PHEV|2.2 CRDi"],
    "Ioniq 5":  [[2021, 2026], "58 kWh elektromos|63 kWh elektromos|77 kWh elektromos|84 kWh elektromos"],
    "Ioniq 6":  [[2022, 2026], "53 kWh elektromos|77 kWh elektromos"],
  },
  "Kia": {
    "Picanto":  [[2004, 2026], "1.0 T-GDI|1.2 Kappa"],
    "Rio":      [[2005, 2024], "1.0 T-GDI MHEV (48V)"],
    "Ceed":     [[2006, 2026], "1.0 T-GDI MHEV (48V)|1.5 T-GDI MHEV (48V)|1.6 CRDi MHEV (48V)"],
    "XCeed":    [[2019, 2026], "1.0 T-GDI MHEV (48V)|1.5 T-GDI MHEV (48V)|1.6 T-GDI PHEV"],
    "Stonic":   [[2017, 2026], "1.0 T-GDI MHEV (48V)"],
    "Sportage": [[2004, 2026], "1.6 T-GDI MHEV (48V)|1.6 T-GDI Hybrid|1.6 T-GDI PHEV|1.6 CRDi MHEV (48V)"],
    "Sorento":  [[2002, 2026], "1.6 T-GDI Hybrid|1.6 T-GDI PHEV|2.2 CRDi"],
    "Niro":     [[2016, 2026], "1.6 GDI Hybrid|1.6 T-GDI PHEV|65 kWh elektromos"],
    "EV3":      [[2024, 2026], "58 kWh elektromos|81 kWh elektromos"],
    "EV6":      [[2021, 2026], "63 kWh elektromos|77 kWh elektromos|84 kWh elektromos"],
    "EV9":      [[2023, 2026], "99 kWh elektromos"],
  },
  "Renault": {
    "Clio":      [[1998, 2026], "1.0 TCe ECO-G (LPG)|1.3 TCe MHEV (48V)|1.6 E-Tech Hybrid"],
    "Captur":    [[2013, 2026], "1.0 TCe ECO-G (LPG)|1.3 TCe MHEV (48V)|1.6 E-Tech Hybrid"],
    "Symbioz":   [[2024, 2026], "1.6 E-Tech Hybrid"],
    "Arkana":    [[2021, 2026], "1.3 TCe MHEV (48V)|1.6 E-Tech Hybrid"],
    "Austral":   [[2022, 2026], "1.2 E-Tech Hybrid|1.3 TCe MHEV (48V)"],
    "Rafale":    [[2023, 2026], "1.2 E-Tech Hybrid"],
    "Espace":    [[2002, 2026], "1.2 E-Tech Hybrid"],
    "Mégane":    [[1999, 2026], "1.3 TCe MHEV (48V)|1.6 E-Tech Hybrid|60 kWh elektromos"],
    "Scénic":    [[1999, 2026], "60 kWh elektromos|87 kWh elektromos"],
    "R5 E-Tech": [[2024, 2026], "40 kWh elektromos|52 kWh elektromos"],
    "Zoe":       [[2013, 2024], "52 kWh elektromos"],
    "Kangoo":    [[2001, 2026], "1.3 TCe MHEV (48V)|1.5 dCi|45 kWh elektromos"],
    "Trafic":    [[2001, 2026], "2.0 dCi"],
  },
  "Dacia": {
    "Sandero":  [[2008, 2026], "1.0 TCe ECO-G (LPG)|1.0 SCe|1.2 TCe MHEV (48V)"],
    "Duster":   [[2010, 2026], "1.0 TCe ECO-G (LPG)|1.2 TCe MHEV (48V)|1.6 Hybrid 140"],
    "Jogger":   [[2022, 2026], "1.0 TCe ECO-G (LPG)|1.6 Hybrid 140"],
    "Bigster":  [[2025, 2026], "1.2 TCe MHEV (48V)|1.6 Hybrid 140"],
    "Spring":   [[2021, 2026], "26,8 kWh elektromos"],
  },
  "Peugeot": {
    "208":   [[2012, 2026], "1.2 PureTech Hybrid|1.5 BlueHDi 130|51 kWh elektromos|54 kWh elektromos"],
    "2008":  [[2013, 2026], "1.2 PureTech Hybrid|1.5 BlueHDi 130|51 kWh elektromos|54 kWh elektromos"],
    "308":   [[2007, 2026], "1.2 PureTech Hybrid|1.5 BlueHDi 130|1.6 PHEV|54 kWh elektromos"],
    "408":   [[2022, 2026], "1.2 PureTech Hybrid|1.6 PHEV|73 kWh elektromos"],
    "3008":  [[2008, 2026], "1.2 PureTech Hybrid|1.5 BlueHDi 130|1.6 PHEV|73 kWh elektromos|82 kWh elektromos"],
    "5008":  [[2009, 2026], "1.2 PureTech Hybrid|1.5 BlueHDi 130|73 kWh elektromos|82 kWh elektromos"],
    "Partner / Rifter": [[2002, 2026], "1.5 BlueHDi 130|54 kWh elektromos"],
  },
  "Citroën": {
    "C3":          [[2002, 2026], "1.2 PureTech Hybrid|1.5 BlueHDi 130|44 kWh elektromos"],
    "C3 Aircross": [[2017, 2026], "1.2 PureTech Hybrid|1.5 BlueHDi 130|44 kWh elektromos"],
    "C4":          [[2004, 2026], "1.2 PureTech Hybrid|1.5 BlueHDi 130|51 kWh elektromos|54 kWh elektromos"],
    "C5 Aircross": [[2018, 2026], "1.2 PureTech Hybrid|1.5 BlueHDi 130|1.6 PHEV|73 kWh elektromos"],
    "Berlingo":    [[2002, 2026], "1.5 BlueHDi 130|54 kWh elektromos"],
  },
  "Opel": {
    "Corsa":      [[2000, 2026], "1.2 PureTech Hybrid|1.5 BlueHDi 130|51 kWh elektromos|54 kWh elektromos"],
    "Astra":      [[1998, 2026], "1.2 PureTech Hybrid|1.5 BlueHDi 130|1.6 PHEV|54 kWh elektromos"],
    "Mokka":      [[2012, 2026], "1.2 PureTech Hybrid|1.5 BlueHDi 130|51 kWh elektromos|54 kWh elektromos"],
    "Crossland":  [[2017, 2024], "1.2 PureTech Hybrid"],
    "Frontera":   [[2024, 2026], "1.2 PureTech Hybrid|44 kWh elektromos"],
    "Grandland":  [[2017, 2026], "1.2 PureTech Hybrid|1.5 BlueHDi 130|1.6 PHEV|73 kWh elektromos|82 kWh elektromos"],
    "Combo":      [[2001, 2026], "1.5 BlueHDi 130|54 kWh elektromos"],
  },
  "Fiat": {
    "500":          [[2007, 2026], "1.0 FireFly Hybrid|42 kWh elektromos"],
    "Grande Panda": [[2024, 2026], "1.2 PureTech Hybrid|44 kWh elektromos"],
    "600":          [[2023, 2026], "1.2 PureTech Hybrid|54 kWh elektromos"],
    "Tipo":         [[2016, 2026], "1.5 BlueHDi 130|1.3 MultiJet MHEV"],
  },
  "Alfa Romeo": {
    "Junior":  [[2024, 2026], "1.2 PureTech Hybrid|54 kWh elektromos"],
    "Tonale":  [[2022, 2026], "1.5 BlueHDi 130|1.3 MultiJet MHEV|1.6 PHEV"],
    "Giulia":  [[2016, 2026], "2.0 TSI evo"],
    "Stelvio": [[2017, 2026], "2.0 TSI evo"],
  },
  "Jeep": {
    "Avenger":  [[2023, 2026], "1.2 PureTech Hybrid|54 kWh elektromos"],
    "Renegade": [[2014, 2026], "1.3 MultiJet MHEV|1.6 PHEV"],
    "Compass":  [[2006, 2026], "1.3 MultiJet MHEV|1.6 PHEV|54 kWh elektromos"],
  },
  "Ford": {
    "Puma":     [[2019, 2026], "1.0 EcoBoost mHEV|43 kWh elektromos"],
    "Focus":    [[1998, 2026], "1.0 EcoBoost mHEV"],
    "Kuga":     [[2008, 2026], "1.0 EcoBoost mHEV|2.5 Duratec Hybrid|2.5 Duratec PHEV"],
    "Explorer": [[2024, 2026], "52 kWh elektromos|77 kWh elektromos"],
    "Capri":    [[2024, 2026], "52 kWh elektromos|77 kWh elektromos"],
    "Ranger":   [[2011, 2026], "2.0 EcoBlue"],
    "Transit / Tourneo Custom": [[2012, 2026], "2.0 EcoBlue|64 kWh elektromos"],
    "Tourneo Courier": [[2023, 2026], "1.0 EcoBoost mHEV|43 kWh elektromos"],
  },
  "Nissan": {
    "Micra":   [[2003, 2026], "1.0 SCe|40 kWh elektromos"],
    "Juke":    [[2010, 2026], "1.0 T-GDI|1.5 e-Power"],
    "Qashqai": [[2007, 2026], "1.3 DIG-T MHEV|1.5 e-Power"],
    "X-Trail": [[2001, 2026], "1.5 e-Power|1.3 DIG-T MHEV"],
    "Ariya":   [[2022, 2026], "63 kWh elektromos|87 kWh elektromos"],
    "Leaf":    [[2011, 2026], "40 kWh elektromos|62 kWh elektromos"],
  },
  "Honda": {
    "Jazz":  [[2002, 2026], "1.5 e:HEV"],
    "Civic": [[2001, 2026], "2.0 e:HEV"],
    "HR-V":  [[2015, 2026], "1.5 e:HEV"],
    "ZR-V":  [[2023, 2026], "2.0 e:HEV"],
    "CR-V":  [[2002, 2026], "2.0 e:HEV"],
  },
  "Mazda": {
    "2":     [[2003, 2026], "1.5 Skyactiv-G|1.5 Hybrid (5. gen)"],
    "3":     [[2003, 2026], "2.0 e-Skyactiv G MHEV"],
    "CX-30": [[2019, 2026], "2.0 e-Skyactiv G MHEV"],
    "CX-5":  [[2012, 2026], "2.0 e-Skyactiv G MHEV|2.2 Skyactiv-D"],
    "CX-60": [[2022, 2026], "3.3 e-Skyactiv D|2.5 e-Skyactiv PHEV"],
    "MX-30": [[2020, 2026], "35 kWh elektromos"],
    "MX-5":  [[1998, 2026], "1.5 Skyactiv-G|2.0 Skyactiv-G"],
  },
  "Suzuki": {
    "Swift":   [[2005, 2026], "1.2 Dualjet Hybrid"],
    "Ignis":   [[2000, 2026], "1.2 Dualjet Hybrid"],
    "Vitara":  [[1988, 2026], "1.4 BoosterJet MHEV|1.5 Hybrid (5. gen)"],
    "S-Cross": [[2013, 2026], "1.4 BoosterJet MHEV|1.5 Hybrid (5. gen)"],
    "Across":  [[2020, 2025], "2.5 Plug-in Hybrid"],
    "Jimny":   [[1998, 2026], "1.5 benzin"],
  },
  "Volvo": {
    "S60 / V60": [[2010, 2026], "B3/B4 (48V benzin)|B5 (48V benzin)|T6/T8 PHEV"],
    "XC40":      [[2017, 2026], "B3/B4 (48V benzin)|T6/T8 PHEV|69 kWh elektromos|82 kWh elektromos"],
    "XC60":      [[2008, 2026], "B3/B4 (48V benzin)|B5 (48V benzin)|T6/T8 PHEV"],
    "XC90":      [[2002, 2026], "B5 (48V benzin)|T6/T8 PHEV"],
    "EX30":      [[2023, 2026], "51 kWh elektromos|69 kWh elektromos"],
    "EC40 / EX40": [[2023, 2026], "69 kWh elektromos|82 kWh elektromos"],
  },
  "MG": {
    "MG3":  [[2024, 2026], "1.5 Hybrid+"],
    "ZS":   [[2019, 2026], "1.5 Hybrid+|51 kWh elektromos"],
    "HS":   [[2019, 2026], "1.5 TSI|1.6 PHEV MG"],
    "MG4":  [[2022, 2026], "51 kWh elektromos|64 kWh elektromos"],
    "MG5":  [[2021, 2026], "61 kWh elektromos"],
  },
  "BYD": {
    "Dolphin": [[2023, 2026], "45 kWh elektromos|60 kWh elektromos"],
    "Atto 3":  [[2022, 2026], "60 kWh elektromos"],
    "Seal":    [[2023, 2026], "61 kWh elektromos|82 kWh elektromos"],
    "Seal U":  [[2024, 2026], "71 kWh elektromos|87 kWh elektromos"],
  },
  "Tesla": {
    "Model 3": [[2017, 2026], "Standard Range|Long Range AWD|Performance"],
    "Model Y": [[2020, 2026], "Standard Range|Long Range AWD|Performance"],
  },
  "Mitsubishi": {
    "ASX":           [[2010, 2026], "1.3 TCe MHEV (48V)|1.6 E-Tech Hybrid"],
    "Colt":          [[2004, 2026], "1.0 SCe|1.6 E-Tech Hybrid"],
    "Eclipse Cross": [[2017, 2026], "2.4 PHEV"],
    "Outlander":     [[2003, 2026], "2.4 PHEV"],
  },
  "Mini": {
    "Cooper":     [[2001, 2026], "B48 TU benzin (2.0)|54 kWh elektromos|66 kWh elektromos"],
    "Countryman": [[2010, 2026], "B48 TU benzin (2.0)|66 kWh elektromos"],
    "Aceman":     [[2024, 2026], "54 kWh elektromos|66 kWh elektromos"],
  },
};

/* További akkumulátor-méretek, amiket a fenti modellek hivatkoznak */
ENGINES_2025["35 kWh elektromos"] = [0, F_EV, 145, [2020, 2026], F_AUT];
ENGINES_2025["43 kWh elektromos"] = [0, F_EV, 168, [2023, 2026], F_AUT];
ENGINES_2025["44 kWh elektromos"] = [0, F_EV, 113, [2023, 2026], F_AUT];
ENGINES_2025["45 kWh elektromos"] = [0, F_EV, 122, [2021, 2026], F_AUT];
ENGINES_2025["53 kWh elektromos"] = [0, F_EV, 151, [2022, 2026], F_AUT];
ENGINES_2025["61 kWh elektromos"] = [0, F_EV, 204, [2021, 2026], F_AUT];
ENGINES_2025["64 kWh elektromos"] = [0, F_EV, 204, [2018, 2026], F_AUT];
ENGINES_2025["81 kWh elektromos"] = [0, F_EV, 204, [2024, 2026], F_AUT];
ENGINES_2025["1.6 T-GDI MHEV (48V)"] = [1.6, F_B, 180, [2021, 2026]];
ENGINES_2025["1.0 FireFly Hybrid"] = [1.0, F_HY, 70, [2020, 2026]];

/* ----- Hyundai/Kia szívó benzinesek és további változatok ----- */
ENGINES_2025["1.5 DPi"]              = [1.5, F_B, 110, [2020, 2026]];
ENGINES_2025["1.6 MPi"]              = [1.6, F_B, 123, [2010, 2026]];
ENGINES_2025["1.2 MPi"]              = [1.2, F_B, 84,  [2011, 2026]];
ENGINES_2025["1.0 T-GDI 48V (100 LE)"] = [1.0, F_B, 100, [2020, 2026]];
ENGINES_2025["1.6 GDI PHEV"]         = [1.6, F_HY, 265, [2019, 2026], F_AUT];
ENGINES_2025["2.5 T-GDI"]            = [2.5, F_B, 281, [2020, 2026]];
ENGINES_2025["2.2 CRDi (4. gen)"]    = [2.2, F_D, 199, [2018, 2026]];

/* ----- NÉMET TÖLTHETŐ HIBRIDEK (PHEV) ----- */
ENGINES_2025["2.0 TFSI e (PHEV)"]    = [2.0, F_HY, 299, [2019, 2026], F_AUT];
ENGINES_2025["3.0 TFSI e (PHEV)"]    = [3.0, F_HY, 462, [2019, 2026], F_AUT];
ENGINES_2025["B48 PHEV (xDrive25e/30e)"] = [2.0, F_HY, 292, [2019, 2026], F_AUT];
ENGINES_2025["B58 PHEV (45e/545e)"]  = [3.0, F_HY, 394, [2019, 2026], F_AUT];
ENGINES_2025["B38 PHEV (225xe/330e)"] = [1.5, F_HY, 220, [2015, 2026], F_AUT];
ENGINES_2025["M254 PHEV (300e)"]     = [2.0, F_HY, 313, [2019, 2026], F_AUT];
ENGINES_2025["OM654 PHEV (300de)"]   = [2.0, F_HY, 306, [2019, 2026], F_AUT];
ENGINES_2025["M264 PHEV (250e)"]     = [1.3, F_HY, 218, [2019, 2026], F_AUT];
ENGINES_2025["2.0 TSI GTE (PHEV)"]   = [2.0, F_HY, 245, [2014, 2026], F_AUT];
ENGINES_2025["3.0 V6 PHEV"]          = [3.0, F_HY, 462, [2017, 2026], F_AUT];

/* ----- További európai motorok, amik eddig kimaradtak ----- */
ENGINES_2025["1.0 EcoBoost Hybrid"]  = [1.0, F_HY, 125, [2020, 2026]];
ENGINES_2025["1.6 Ti-VCT Hybrid"]    = [1.6, F_HY, 125, [2019, 2026], F_AUT];
ENGINES_2025["1.2 TSI evo"]          = [1.2, F_B, 116, [2023, 2026]];
ENGINES_2025["1.6 THP PHEV"]         = [1.6, F_HY, 300, [2019, 2026], F_AUT];
ENGINES_2025["2.0 Skyactiv-X"]       = [2.0, F_B, 186, [2019, 2026]];
ENGINES_2025["1.8 Hybrid (PHEV)"]    = [1.8, F_HY, 122, [2012, 2026], F_AUT];
ENGINES_2025["1.5 TSI evo2 (mHEV)"]  = [1.5, F_B, 150, [2022, 2026]];
ENGINES_2025["1.5 Blue dCi"]         = [1.5, F_D, 115, [2018, 2026]];
ENGINES_2025["2.0 Blue dCi"]         = [2.0, F_D, 170, [2018, 2026]];
ENGINES_2025["1.6 BlueHDi 100"]      = [1.6, F_D, 100, [2013, 2026]];
ENGINES_2025["2.2 BlueHDi"]          = [2.2, F_D, 165, [2016, 2026]];
ENGINES_2025["1.5 T-GDI Hybrid"]     = [1.5, F_HY, 141, [2023, 2026], F_AUT];
ENGINES_2025["1.6 CRDi 136"]         = [1.6, F_D, 136, [2015, 2026]];
ENGINES_2025["2.0 TDI 200"]          = [2.0, F_D, 200, [2020, 2026]];
ENGINES_2025["1.6 dCi 130"]          = [1.6, F_D, 130, [2011, 2022]];
ENGINES_2025["2.0 BlueHDi 180"]      = [2.0, F_D, 177, [2017, 2026]];

/* Motorok, amelyek 2025-ben is gyártásban vannak: a gyártási sáv végét
   kitoljuk 2026-ig. SZÁNDÉKOSAN tételes a lista — blanket-kiterjesztéssel
   nem létező párosítások jönnének létre (pl. 1.9 PD TDI egy 2025-ös Golfban). */
const STILL_MADE_2026 = [
  "1.0 TSI", "1.5 TSI", "2.0 TSI", "2.0 TDI", "3.0 TDI",
  "1.0 VVT-i", "2.5 Hybrid", "2.8 D-4D", "1.8 Hybrid",
  "1.2 Kappa", "1.0 T-GDI", "1.6 GDI Hybrid", "2.2 CRDi",
  "1.0 SCe", "1.5 dCi", "2.0 dCi", "1.3 TCe",
  "2.0 EcoBlue", "1.5 Skyactiv-G", "2.0 Skyactiv-G", "2.2 Skyactiv-D",
  "1.5 benzin", "1.4 BoosterJet", "2.4 PHEV",
  "Standard Range", "Long Range AWD", "Performance",
  "26,8 kWh elektromos", "40 kWh elektromos", "42 kWh elektromos",
  "50 kWh elektromos", "52 kWh elektromos", "58 kWh elektromos",
  "62 kWh elektromos", "64 kWh elektromos", "77 kWh elektromos",
];

/* Második kör: a fenti motorok hozzárendelése a modellekhez.
   Külön blokk, hogy a fő tábla olvasható maradjon; ugyanaz a merge fut rá. */
const FLEET_2025_B = {
  "Hyundai": {
    "i20":      [[2008, 2026], "1.2 MPi|1.0 T-GDI 48V (100 LE)"],
    "i30":      [[2007, 2026], "1.5 DPi|1.6 MPi|1.6 CRDi 136"],
    "Bayon":    [[2021, 2026], "1.2 MPi|1.0 T-GDI 48V (100 LE)"],
    "Kona":     [[2017, 2026], "1.6 GDI PHEV|1.0 T-GDI 48V (100 LE)"],
    "Tucson":   [[2004, 2026], "1.6 GDI PHEV|2.0 CRDi"],
    "Santa Fe": [[2001, 2026], "1.6 GDI PHEV|2.2 CRDi (4. gen)|2.5 T-GDI"],
    "i10":      [[2008, 2026], "1.2 MPi"],
  },
  "Kia": {
    "Ceed":     [[2006, 2026], "1.5 DPi|1.6 MPi|1.6 CRDi 136"],
    "XCeed":    [[2019, 2026], "1.5 DPi|1.6 GDI PHEV"],
    "Stonic":   [[2017, 2026], "1.2 MPi|1.0 T-GDI 48V (100 LE)"],
    "Sportage": [[2004, 2026], "1.6 GDI PHEV|2.0 CRDi"],
    "Sorento":  [[2002, 2026], "1.6 GDI PHEV|2.2 CRDi (4. gen)"],
    "Niro":     [[2016, 2026], "1.6 GDI PHEV|1.5 T-GDI Hybrid"],
    "Picanto":  [[2004, 2026], "1.2 MPi"],
  },
  "Volkswagen": {
    "Golf":    [[1997, 2026], "1.2 TSI evo|2.0 TSI GTE (PHEV)|2.0 TDI 200"],
    "Passat":  [[1973, 2026], "2.0 TSI GTE (PHEV)|2.0 TDI 200"],
    "Tiguan":  [[2007, 2026], "2.0 TSI GTE (PHEV)|2.0 TDI 200"],
    "Tayron":  [[2024, 2026], "2.0 TSI GTE (PHEV)|2.0 TDI 200"],
    "Touareg": [[2002, 2026], "3.0 V6 PHEV"],
    "Polo":    [[1997, 2026], "1.2 TSI evo"],
    "T-Roc":   [[2017, 2026], "1.2 TSI evo"],
    "T-Cross": [[2019, 2026], "1.2 TSI evo"],
  },
  "Škoda": {
    "Octavia": [[1997, 2026], "1.2 TSI evo|2.0 TSI GTE (PHEV)|2.0 TDI 200"],
    "Superb":  [[2001, 2026], "2.0 TSI GTE (PHEV)|2.0 TDI 200"],
    "Kodiaq":  [[2016, 2026], "2.0 TSI GTE (PHEV)|2.0 TDI 200"],
    "Scala":   [[2019, 2026], "1.2 TSI evo"],
    "Kamiq":   [[2019, 2026], "1.2 TSI evo"],
    "Fabia":   [[2000, 2026], "1.2 TSI evo"],
  },
  "Seat": {
    "Leon":  [[1999, 2026], "1.2 TSI evo|2.0 TSI GTE (PHEV)|2.0 TDI 200"],
    "Ibiza": [[1997, 2026], "1.2 TSI evo"],
    "Arona": [[2017, 2026], "1.2 TSI evo"],
  },
  "Cupra": {
    "Leon":      [[2018, 2026], "2.0 TSI GTE (PHEV)"],
    "Formentor": [[2020, 2026], "2.0 TSI GTE (PHEV)"],
    "Terramar":  [[2024, 2026], "2.0 TSI GTE (PHEV)"],
  },
  "Audi": {
    "A3": [[1996, 2026], "2.0 TFSI e (PHEV)|1.2 TSI evo"],
    "A4": [[1995, 2026], "2.0 TFSI e (PHEV)|2.0 TDI 200"],
    "A5": [[2007, 2026], "2.0 TFSI e (PHEV)|2.0 TDI 200"],
    "A6": [[1997, 2026], "2.0 TFSI e (PHEV)|3.0 TFSI e (PHEV)|2.0 TDI 200"],
    "A7": [[2010, 2026], "3.0 TFSI e (PHEV)|3.0 TDI"],
    "A8": [[2002, 2026], "3.0 TFSI e (PHEV)"],
    "Q3": [[2011, 2026], "2.0 TFSI e (PHEV)|2.0 TDI 200"],
    "Q5": [[2008, 2026], "2.0 TFSI e (PHEV)|2.0 TDI 200"],
    "Q7": [[2005, 2026], "3.0 TFSI e (PHEV)|3.0 TDI"],
    "Q8": [[2018, 2026], "3.0 TFSI e (PHEV)|3.0 TDI"],
  },
  "BMW": {
    "2-es": [[2014, 2026], "B38 PHEV (225xe/330e)"],
    "3-as": [[1998, 2026], "B38 PHEV (225xe/330e)|B48 PHEV (xDrive25e/30e)"],
    "5-ös": [[1996, 2026], "B48 PHEV (xDrive25e/30e)|B58 PHEV (45e/545e)"],
    "7-es": [[2001, 2026], "B58 PHEV (45e/545e)"],
    "X1":   [[2009, 2026], "B48 PHEV (xDrive25e/30e)"],
    "X3":   [[2003, 2026], "B48 PHEV (xDrive25e/30e)"],
    "X5":   [[1999, 2026], "B58 PHEV (45e/545e)|N57 dízel (3.0)"],
  },
  "Mercedes": {
    "A-osztály": [[1997, 2026], "M264 PHEV (250e)"],
    "B-osztály": [[2005, 2026], "M264 PHEV (250e)"],
    "C-osztály": [[2000, 2026], "M254 PHEV (300e)|OM654 PHEV (300de)"],
    "E-osztály": [[2002, 2026], "M254 PHEV (300e)|OM654 PHEV (300de)"],
    "CLA":       [[2013, 2026], "M264 PHEV (250e)"],
    "GLA":       [[2013, 2026], "M264 PHEV (250e)"],
    "GLC":       [[2015, 2026], "M254 PHEV (300e)|OM654 PHEV (300de)"],
    "GLE / ML":  [[2005, 2026], "M254 PHEV (300e)|OM654 PHEV (300de)|OM654M (2.0 d 48V)"],
  },
  "Ford": {
    "Puma":  [[2019, 2026], "1.0 EcoBoost Hybrid"],
    "Focus": [[1998, 2026], "1.0 EcoBoost Hybrid"],
    "Kuga":  [[2008, 2026], "1.6 Ti-VCT Hybrid"],
  },
  "Peugeot": {
    "308":  [[2007, 2026], "1.6 THP PHEV|1.6 BlueHDi 100"],
    "408":  [[2022, 2026], "1.6 THP PHEV"],
    "3008": [[2008, 2026], "1.6 THP PHEV|2.0 BlueHDi 180"],
    "5008": [[2009, 2026], "1.6 THP PHEV|2.0 BlueHDi 180"],
    "208":  [[2012, 2026], "1.6 BlueHDi 100"],
    "Partner / Rifter": [[2002, 2026], "1.6 BlueHDi 100|2.0 BlueHDi 180"],
  },
  "Citroën": {
    "C4":          [[2004, 2026], "1.6 THP PHEV|1.6 BlueHDi 100"],
    "C5 Aircross": [[2018, 2026], "1.6 THP PHEV|2.0 BlueHDi 180"],
    "Berlingo":    [[2002, 2026], "1.6 BlueHDi 100"],
  },
  "Opel": {
    "Astra":     [[1998, 2026], "1.6 THP PHEV|1.6 BlueHDi 100"],
    "Grandland": [[2017, 2026], "1.6 THP PHEV|2.0 BlueHDi 180"],
    "Combo":     [[2001, 2026], "1.6 BlueHDi 100"],
  },
  "Renault": {
    "Mégane":  [[1999, 2026], "1.5 Blue dCi|2.0 Blue dCi"],
    "Austral": [[2022, 2026], "1.5 Blue dCi"],
    "Espace":  [[2002, 2026], "2.0 Blue dCi"],
    "Kadjar":  [[2015, 2022], "1.5 Blue dCi|1.6 dCi 130"],
    "Trafic":  [[2001, 2026], "2.0 Blue dCi"],
    "Kangoo":  [[2001, 2026], "1.5 Blue dCi"],
  },
  "Dacia": {
    "Duster":  [[2010, 2026], "1.5 Blue dCi"],
    "Jogger":  [[2022, 2026], "1.0 TCe ECO-G (LPG)"],
    "Sandero": [[2008, 2026], "1.5 Blue dCi"],
  },
  "Nissan": {
    "Qashqai": [[2007, 2026], "1.5 Blue dCi|1.6 dCi 130"],
    "X-Trail": [[2001, 2026], "1.6 dCi 130|2.0 Blue dCi"],
  },
  "Mazda": {
    "3":     [[2003, 2026], "2.0 Skyactiv-X"],
    "CX-30": [[2019, 2026], "2.0 Skyactiv-X"],
  },
  "Toyota": {
    "Prius":     [[2000, 2026], "1.8 Hybrid (PHEV)|2.0 Hybrid (5. gen)"],
    "C-HR":      [[2016, 2026], "2.0 Hybrid (5. gen)"],
    "Corolla":   [[1997, 2026], "1.8 Hybrid (PHEV)"],
    "Proace City":[[2020, 2026], "1.5 BlueHDi 130|50 kWh elektromos"],
  },
  "Volvo": {
    "S60 / V60": [[2010, 2026], "2.0 D3/D4 (VEA)"],
    "XC60":      [[2008, 2026], "2.0 D3/D4 (VEA)"],
    "XC90":      [[2002, 2026], "2.0 D3/D4 (VEA)"],
    "V40":       [[2012, 2019], "1.6 D2|2.0 D3/D4 (VEA)"],
  },
};

/* Összefésülés: az új motorok bekerülnek a fő táblába, a modellek évjárat-sávja
   kiterjed, a motorlistájuk pedig kiegészül (duplikátum nélkül). */
(function merge2025() {
  Object.keys(ENGINES_2025).forEach((code) => {
    if (!ENGINES[code]) ENGINES[code] = ENGINES_2025[code];
  });
  STILL_MADE_2026.forEach((code) => {
    if (ENGINES[code] && ENGINES[code][3][1] < 2026) ENGINES[code][3][1] = 2026;
  });
  [FLEET_2025, FLEET_2025_B].forEach((block) => {
    Object.keys(block).forEach((brand) => {
      if (!FLEET[brand]) FLEET[brand] = {};
      Object.keys(block[brand]).forEach((model) => {
        const [span, codes] = block[brand][model];
        const cur = FLEET[brand][model];
        if (!cur) { FLEET[brand][model] = [span.slice(), codes]; return; }
        cur[0] = [Math.min(cur[0][0], span[0]), Math.max(cur[0][1], span[1])];
        const set = [];
        cur[1].split("|").concat(codes.split("|")).forEach((c) => {
          if (c && set.indexOf(c) === -1) set.push(c);
        });
        cur[1] = set.join("|");
      });
    });
  });
})();

/* ---------- LEKÉRDEZŐ FÜGGVÉNYEK ---------- */

/** Minden márka, ábécésorrendben. */
function fleetBrands() {
  return Object.keys(FLEET).sort((a, b) => a.localeCompare(b, "hu"));
}

/** Egy márka modelljei, ábécésorrendben. */
function fleetModels(brand) {
  const b = FLEET[brand];
  if (!b) return [];
  return Object.keys(b).sort((a, b2) => a.localeCompare(b2, "hu"));
}

/** A modell gyártási időszaka: [tól, ig]. */
function fleetModelYears(brand, model) {
  const m = FLEET[brand] && FLEET[brand][model];
  return m ? m[0] : null;
}

/**
 * Az adott modellhez (és opcionálisan évjárathoz) létező motorok.
 * A motor csak akkor kerül be, ha a saját gyártási időszaka átfedi a
 * modellét, és — ha meg van adva év — azt is lefedi.
 * Így nem lehet nem létező motor-évjárat párost kiválasztani.
 */
function fleetEngines(brand, model, year) {
  const m = FLEET[brand] && FLEET[brand][model];
  if (!m) return [];
  const [mFrom, mTo] = m[0];
  const out = [];
  m[1].split("|").forEach((code) => {
    const e = ENGINES[code];
    if (!e) return;
    const [disp, fuel, hp, span, gearboxes] = e;
    const from = Math.max(span[0], mFrom);
    const to = Math.min(span[1], mTo);
    if (from > to) return;                      // sosem volt átfedés
    if (year && (year < from || year > to)) return;
    out.push({
      code, disp, fuel, hp, years: [from, to],
      gearboxes: gearboxes || ["Manuális", "Automata"],
      label: disp ? `${code} · ${disp.toFixed(1).replace(".", ",")} l · ${hp} LE` : `${code} · ${hp} LE`,
    });
  });
  // Üzemanyag, majd hengerűrtartalom szerint rendezve — így könnyebb keresni
  const order = { "Benzin": 1, "Dízel": 2, "Hibrid": 3, "Elektromos": 4, "LPG / gáz": 5 };
  out.sort((a, b) => (order[a.fuel] - order[b.fuel]) || (a.disp - b.disp) || (a.hp - b.hp));
  return out;
}

/** Hány modell és hány hajtáslánc-változat van az adatbázisban? */
function fleetStats() {
  let models = 0, variants = 0;
  Object.keys(FLEET).forEach((brand) => {
    Object.keys(FLEET[brand]).forEach((model) => {
      models++;
      variants += fleetEngines(brand, model).length;
    });
  });
  return { brands: Object.keys(FLEET).length, models, variants, engines: Object.keys(ENGINES).length };
}
