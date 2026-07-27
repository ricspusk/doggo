# AutóTanács — használtautó vásárlási segéd (MVP)

Egy egyszerű webalkalmazás: megadod egy használtautó adatait, és kapsz egy
tájékoztató **kockázati elemzést** + **ellenőrző listát** vásárlás előtt.
Patreonon támogatható, első körben ingyenes.

## Két üzemmód

| Mód | Mit csinál | Kell hozzá |
| --- | ---------- | ---------- |
| **Demó** (alapértelmezett) | A böngésző számol egy őszinte, heurisztikus elemzést a megadott adatokból. Azonnal működik. | Semmi — ingyen fut GitHub Pages-en. |
| **Élő AI** | A valódi Claude AI ad modell-specifikus típushibákat és részletes ár-értékelést. | Anthropic API-kulcs + Vercel (lásd lent). |

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

## Következő lépések (ötletek)

- Több autó összehasonlítása egymás mellett.
- Valódi Patreon-link a támogató gombra.
- Jogtiszta ár-adatforrás bekötése (API/partnerség) a pontosabb ár-értékeléshez.
