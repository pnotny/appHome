# Strava export — nasazení proxy (Cloudflare Worker)

CrossFit Coach umí po tréninku rovnou založit aktivitu na Stravě. Protože appka
je statický web bez backendu a Strava vyžaduje, aby `client_secret` nikdy
neopustil server, stojí mezi appkou a Stravou malý proxy server — Cloudflare
Worker (zdarma, free tier stačí s velkou rezervou).

Appka tvůj Strava účet ani client_secret nikdy neuvidí — ty vidí jen tento
Worker, který běží pod tvým Cloudflare účtem.

## 1. Založ Strava API aplikaci

1. Jdi na https://www.strava.com/settings/api a vyplň novou aplikaci
   (název/ikonka si vymysli, "Website" může být odkaz na appku).
2. **Authorization Callback Domain** zatím nech např. `workers.dev` — doladíš
   ho v kroku 4, až budeš znát přesnou doménu svého Workeru.
3. Pozn. si **Client ID** a **Client Secret** — budeš je potřebovat za chvíli.

## 2. Nainstaluj Wrangler (Cloudflare CLI)

```bash
npm install -g wrangler
wrangler login     # otevře prohlížeč, přihlas se/založ si zdarma Cloudflare účet
```

## 3. Nasaď Worker

V tomto repu je vše připravené ve složce `strava-worker/`:

```bash
cd strava-worker
wrangler deploy
```

Wrangler vypíše URL nasazeného Workeru, něco jako:

```
https://crossfit-coach-strava-proxy.<tvuj-ucet>.workers.dev
```

Tu si ulož — je to **Worker proxy URL**, kterou za chvíli vložíš do appky.

## 4. Nastav proměnné a secret

```bash
# Client ID (veřejné, může být v wrangler.toml — uprav si ho tam přímo,
# nebo ho nastav i jako proměnnou takto):
wrangler secret put STRAVA_CLIENT_ID

# Client Secret (NIKDY nedávej do wrangler.toml ani do gitu):
wrangler secret put STRAVA_CLIENT_SECRET
```

V `strava-worker/wrangler.toml` uprav `ALLOWED_ORIGIN` na skutečnou adresu,
odkud appku otevíráš (např. `https://pnotny.github.io`), a znovu nasaď:

```bash
wrangler deploy
```

## 5. Dopoj Authorization Callback Domain na Stravě

Zpátky na https://www.strava.com/settings/api — do pole **Authorization
Callback Domain** vlož jen doménu Workeru bez `https://` a bez cesty, např.:

```
crossfit-coach-strava-proxy.tvuj-ucet.workers.dev
```

## 6. Propoj appku

1. V appce jdi do **Profil → Strava**.
2. Vlož Worker proxy URL z kroku 3 (celou, i s `https://`).
3. Klikni **Připojit Strava** → odsouhlas přístup na Stravě → appka tě
   přesměruje zpátky a ukáže "✅ Propojeno jako [tvoje jméno]".

Od teď se na kartě uloženého tréninku objeví tlačítko **🟠 Export na Strava**.

## Co Worker dělá (a nedělá)

- Drží `client_secret` a vyměňuje/obnovuje tokeny — appka pracuje jen
  s refresh tokenem uloženým ve tvém prohlížeči (běžná praxe pro
  jednouživatelské nástroje).
- Žádná data se nikde neukládají — Worker je bezstavový, jen přeposílá
  požadavky mezi appkou a Stravou.
- Pokud chceš appku nasdílet dalším lidem, každý by potřeboval buď vlastní
  Worker + Strava API app, nebo by sis musel řešit víceuživatelské úložiště
  tokenů (to tahle jednoduchá verze neřeší).
