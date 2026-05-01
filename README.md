# 🏠 Domácí Finance

> Apple-style webová aplikace pro sledování výdajů domácnosti — pro dvě osoby, v reálném čase.

![Version](https://img.shields.io/badge/verze-1.4-34C759?style=flat-square)
![PWA](https://img.shields.io/badge/PWA-instalovatelná-007AFF?style=flat-square)
![Firebase](https://img.shields.io/badge/backend-Firebase-FF9500?style=flat-square)
![License](https://img.shields.io/badge/licence-MIT-lightgrey?style=flat-square)

**🔗 Živá aplikace:** [pnotny.github.io/appHome](https://pnotny.github.io/appHome/)

---

## Funkce

### 💰 Správa výdajů
- Přidávání, úprava a mazání výdajů
- Kategorie s emoji (Jídlo, Bydlení, Doprava, Zdraví, Zábava…)
- Volitelná poznámka ke každému výdaji
- Sdílené výdaje s nastavitelným poměrem rozdělení (50/50, 60/40, vlastní slider)

### 📊 Přehled a statistiky
- Měsíční přehled celkových výdajů
- Karta vyrovnání — kdo komu dluží a kolik
- Graf rozdělení výdajů mezi osoby
- Statistiky dle kategorií s pruhovým grafem a koláčovým grafem
- Top 5 největších výdajů v období
- **Filtr období:** den / týden / měsíc / rok s navigací ← →

### 👥 Sdílení v reálném čase
- Kód domácnosti — oba partneři zadají stejný kód a vidí sdílená data
- Synchronizace přes Firebase Firestore (okamžité aktualizace)
- Funguje offline — data se synchronizují při připojení

### 📱 Instalovatelná aplikace (PWA)
- Instalace na iPhone, Android nebo plochu počítače jako nativní app
- Funguje offline díky Service Workeru
- Apple-style design s glassmorphism efekty, Inter fontem a iOS paletou barev

---

## Technologie

| Vrstva | Technologie |
|--------|-------------|
| Frontend | Vanilla HTML / CSS / JavaScript |
| Design | Apple HIG, glassmorphism, Inter font |
| Backend | Firebase Firestore (real-time NoSQL) |
| Hosting | GitHub Pages |
| PWA | Web App Manifest + Service Worker |

---

## Jak začít používat

1. Otevřete [pnotny.github.io/appHome](https://pnotny.github.io/appHome/)
2. Zadejte **kód domácnosti** (vymyslete si vlastní, nebo nechte vygenerovat)
3. Sdílejte stejný kód s partnerem/partnerkou — oba uvidíte stejná data živě
4. Volitelně nainstalujte jako aplikaci:
   - **iPhone:** Safari → Sdílet → Přidat na plochu
   - **Android:** Chrome → menu → Přidat na plochu
   - **PC:** ikonka instalace v adresním řádku prohlížeče

---

## Nastavení

- **Profily osob** — jméno a barva pro každou osobu
- **Kategorie** — přidávání a mazání vlastních kategorií s emoji
- **Export dat** — stažení všech výdajů jako JSON

---

## Vývoj

Aplikace je záměrně jednoduchá — žádný build systém, žádné závislosti (kromě Firebase SDK přes CDN). Stačí otevřít soubory v editoru.

```
appHome/
├── index.html      # Hlavní HTML — celá struktura aplikace
├── app.js          # Veškerá logika (Firebase, UI, stav)
├── style.css       # Apple-style design
├── manifest.json   # PWA manifest
├── sw.js           # Service Worker (offline podpora)
├── icon.svg        # Ikona aplikace
└── VERSION         # Aktuální verze
```

---

## Changelog

| Verze | Co přibylo |
|-------|-----------|
| **1.5** | Oprava filtru období + Apple-style segmented control s kulatými šipkami |
| **1.4** | Filtr období (den / týden / měsíc / rok) ve Výdajích a Statistikách + README |
| **1.3** | Volitelné rozdělení výdajů — split toggle s nastavitelným poměrem |
| **1.2** | Firebase Firestore — sdílená data v reálném čase |
| **1.1** | PWA — instalovatelná mobilní aplikace, Service Worker, offline podpora |
| **1.0** | Počáteční vydání — Apple-style expense tracker pro 2 osoby |

---

## Licence

MIT — používejte, upravujte, sdílejte.
