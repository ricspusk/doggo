# AutóTanács — használtautó vásárlási segéd (MVP)

Egy egyszerű webalkalmazás: megadod egy használtautó adatait, és kapsz egy
tájékoztató **kockázati elemzést** + **ellenőrző listát** vásárlás előtt.
Patreonon támogatható, első körben ingyenes.

## Két üzemmód

| Mód | Mit csinál | Kell hozzá |
| --- | ---------- | ---------- |
| **Demó** (alapértelmezett) | A böngésző számol egy őszinte, heurisztikus kockázati elemzést + ellenőrző listát, és élő kereső-linkeket ad a hasznaltauto.hu-ra és a mobile.de-re. Azonnal működik. | Semmi — ingyen fut GitHub Pages-en. |
| **Élő AI** | A valódi Claude AI **webes kereséssel valós fórumokból** kutat modell-specifikus típushibákat, karbantartási ajánlásokat és kockázatokat (forrás-linkekkel), **értelmezi a szabad szöveget**, és véleményt ír az autóról. | Anthropic API-kulcs + Vercel (lásd lent). |

### Csak élő AI módban működik
- A **szabad szöveg** értelmezése és a személyre szabott vélemény.
- A **fórumokból gyűjtött** típushibák, karbantartás és kockázatok, forrás-linkekkel.

A **kereső-linkek** (hasznaltauto.hu, mobile.de) és a bővebb űrlap-paraméterek demóban is működnek.

## Fájlok

| Fájl | Szerep |
| ---- | ------ |
| `index.html`, `style.css` | A felület (űrlap + eredmény). |
| `app.js` | A logika: demó elemzés, és opcionálisan az élő AI hívása. |
| `api/analyze.js` | A szerver-funkció, ami a Claude AI-t hívja (Vercelen fut). |
| `package.json` | A backend függősége (`@anthropic-ai/sdk`). |

## Demó kipróbálása

Nyisd meg az `index.html`-t böngészőben (vagy a GitHub Pages címén), töltsd ki
az űrlapot, és nézd meg az elemzést. Semmi beállítás nem kell.

## Élő AI bekapcsolása (később)

1. **API-kulcs:** regisztrálj a <https://console.anthropic.com> oldalon, és
   hozz létre egy API-kulcsot. (Fizetős, de kis forgalomnál pár dollár.)
2. **Telepítés Vercelre:**
   - Készíts fiókot a <https://vercel.com>-on (ingyenes), és kösd össze a
     GitHub-fiókoddal.
   - Új projekt → válaszd a `doggo` repót → **Root Directory** legyen
     `car-advisor`.
   - A projekt **Settings → Environment Variables** részénél add hozzá:
     `ANTHROPIC_API_KEY` = a kulcsod.
   - Deploy. Kapsz egy címet, pl. `https://autotanacs.vercel.app`.
3. **Frontend átállítása:** az `app.js` tetején állítsd be:
   ```js
   const API_URL = "https://autotanacs.vercel.app/api/analyze";
   ```
   Innentől az oldal a valódi AI-t használja.

> **Költség:** minden elemzés egy AI-hívás, ami tokenben fizetendő. Olcsóbb
> változatért az `api/analyze.js`-ben a modellt átírhatod
> `"claude-opus-5"`-ről `"claude-sonnet-5"`-re.

## Fontos

Ez tájékoztató segéd, **nem szakértői vagy műszaki vizsgálat**. Vásárlás előtt
mindig nézesd meg az autót független szakemberrel. Az AI-t valós adatokra
alapozva érdemes használni; ne bízd rá vakon a döntést.

## Az üzleti modell — miért nem kell hozzá hirdetési adatbázis

Ez a projekt **szándékosan nem támaszkodik** arra, hogy a hasznaltauto.hu vagy a
mobile.de adatbázisához hozzáférést kapjunk. Egy egyszemélyes vállalkozással
ilyen szerződés nem realitás, és a scraping jogilag/technikailag zsákutca.

**Az érték nem az ő adatuk, hanem a tanács.** Amit ez az oldal ad — a
kilométeróra-állás alapján előre jelzett karbantartások, tipikus meghibásodások,
kockázatok és költségek — teljesen független bármelyik piactértől. A friss
hirdetéseket nem mi tároljuk: a felhasználót **átlinkeljük** hozzájuk (ez legális,
mint bármilyen keresésre linkelni), ő pedig visszajön a tanácsért.

Amit ez a modell megenged, API nélkül:
- **Deep link** a hirdetésekhez (kész, működik).
- **A felhasználó bemásolja** a hirdetés szövegét a szabad szöveg mezőbe — ez az
  ő adata, szabadon feldolgozható; az AI ebből is elemez.
- A saját **tudásbázis** bővítése (gyártói szerviztervek, fórumokból gyűjtött
  típushibák) — ez a valódi versenyelőny, és senkitől nem függ.

## Következő lépések (ötletek)

- A km-alapú tudásbázis bővítése további modellekre és motorokra.
- Több autó összehasonlítása egymás mellett.
- Valódi Patreon-link a támogató gombra.
