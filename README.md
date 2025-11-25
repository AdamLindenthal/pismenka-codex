# Čtení slov – klientská aplikace

Jednoduchá webová aplikace pro děti procvičující čtení českých slov s použitím Web Speech API (cs-CZ). Funguje čistě na klientu, bez backendu.

## Spuštění lokálně
- Otevři projekt v terminálu a spusť statický server (mikrofon ve většině prohlížečů potřebuje zabezpečený kontext):
  - `python3 -m http.server 4173` nebo `npx serve .`
- Otevři `http://localhost:4173` v prohlížeči (Safari/Chrome na iOS/Android/desktop).

## Použití
- Vyber/odeber písmena v panelu, slova s vypnutými písmeny se nebudou zobrazovat.
- Klikni na 🎤 a řekni zobrazené slovo nahlas; aplikace porovná text bez ohledu na velikost písmen.
- Tlačítkem „Další slovo“ přepneš na nové slovo a náhodnou variantu zápisu (malá/VELKÁ/První).

## Technické poznámky
- Preferovaný prohlížeč: Safari/Chrome na iOS a Chrome na Androidu; při absenci Web Speech API se mikrofon deaktivuje.
- Nastavení (zapnutá písmena, stav panelu) se ukládá do `localStorage`.
- Slovník obsahuje 2+ slabiková slova i vlastní jména; lze ho upravit v `app.js` (`WORDS`).
