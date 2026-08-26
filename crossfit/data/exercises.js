/* ==========================================================================
   CrossFit Coach — databáze cviků
   60 pohybů × 3 úrovně obtížnosti (beginner / intermediate / rx)
   pattern: squat | hinge | push | pull | carry | jump | rotation | core |
            full-body | olympic | monostructural
   ========================================================================== */

window.CF_EXERCISES = [

  /* ---------------------------- WEIGHTLIFTING ---------------------------- */

  { id: 'back-squat', name: 'Back Squat', category: 'weightlifting', pattern: 'squat',
    muscles: ['kvadricepsy', 'hýždě', 'core'], equipment: ['barbell', 'rack'],
    loadable: true, oneRMKey: 'backSquat', variantMultiplier: 1,
    standard: { rx: { M: 102, F: 70 }, scaled: { M: 61, F: 43 } },
    levels: {
      beginner: { desc: 'Dřep s prázdnou tyčí nebo lehkou zátěží, důraz na hloubku a záda.', criteria: 'Zvládne 10 čistých opakování air squatu s rovnými zády a hloubkou pod paralelu.' },
      intermediate: { desc: 'Dřep se střední zátěží (40–65 % 1RM) v sériích.', criteria: 'Bezpečně zvedá tyč z racku, drží neutrální páteř pod zátěží 60 %+ 1RM.' },
      rx: { desc: 'Back squat s plnou zátěží dle RX standardu.', criteria: 'Konzistentní hloubka, rychlost a technika i u těžkých sérií (85 %+ 1RM).' } },
    cues: ['Váha na patách a středu chodidla', 'Prsa nahoru, lokty pod tyčí', 'Kolena ve směru špiček'],
    mistakes: ['Ztráta neutrálních zad (kulacení)', 'Kolena padají dovnitř', 'Nedostatečná hloubka'] },

  { id: 'front-squat', name: 'Front Squat', category: 'weightlifting', pattern: 'squat',
    muscles: ['kvadricepsy', 'core', 'horní záda'], equipment: ['barbell', 'rack'],
    loadable: true, oneRMKey: 'frontSquat', variantMultiplier: 1,
    standard: { rx: { M: 84, F: 57 }, scaled: { M: 52, F: 34 } },
    levels: {
      beginner: { desc: 'Front squat s prázdnou tyčí, nácvik rack pozice.', criteria: 'Udrží lokty nahoře a vzpřímený trup v air squatu.' },
      intermediate: { desc: 'Front squat se střední zátěží, plynulý rytmus.', criteria: 'Udrží rack pozici bez ztráty loktů pod zátěží 50 %+ 1RM.' },
      rx: { desc: 'Front squat s plnou zátěží.', criteria: 'Stabilní trup a rychlý výjezd i u těžkých vah blízko 1RM.' } },
    cues: ['Lokty vysoko a vpřed', 'Váha na patách', 'Nádech a napnutý core před sedem'],
    mistakes: ['Pokles loktů', 'Přenesení váhy na špičky', 'Kulacení dolních zad'] },

  { id: 'overhead-squat', name: 'Overhead Squat', category: 'weightlifting', pattern: 'squat',
    muscles: ['ramena', 'core', 'kvadricepsy'], equipment: ['barbell', 'rack'],
    loadable: true, oneRMKey: null, variantMultiplier: 1,
    standard: { rx: { M: 61, F: 43 }, scaled: { M: 34, F: 20 } },
    levels: {
      beginner: { desc: 'OHS s PVC tyčí nebo prázdnou tyčí, nácvik mobility.', criteria: 'Udrží tyč nad hlavou v aktivním ramenním zámku po celý air squat.' },
      intermediate: { desc: 'OHS s lehkou/střední zátěží.', criteria: 'Stabilní overhead pozice i s 20–30 kg.' },
      rx: { desc: 'OHS s plnou RX zátěží.', criteria: 'Plná hloubka a stabilita nad hlavou i u těžkých vah.' } },
    cues: ['Aktivní zámek v ramenou', 'Tyč nad středem chodidla', 'Pohled mírně nahoru/vpřed'],
    mistakes: ['Pád tyče vpřed', 'Nedostatečná mobilita kotníků', 'Ztráta zámku v ramenou'] },

  { id: 'deadlift', name: 'Deadlift', category: 'weightlifting', pattern: 'hinge',
    muscles: ['hamstringy', 'hýždě', 'záda'], equipment: ['barbell'],
    loadable: true, oneRMKey: 'deadlift', variantMultiplier: 1,
    standard: { rx: { M: 102, F: 70 }, scaled: { M: 61, F: 43 } },
    levels: {
      beginner: { desc: 'Mrtvý tah s lehkou zátěží, nácvik hip hinge.', criteria: 'Zvládne hip hinge s tyčí do kolen bez kulacení zad.' },
      intermediate: { desc: 'Mrtvý tah se střední zátěží.', criteria: 'Udrží rovná záda při zátěži 60–80 % 1RM.' },
      rx: { desc: 'Mrtvý tah s plnou RX zátěží.', criteria: 'Čistý hinge a rychlý lockout i blízko 1RM.' } },
    cues: ['Podlomení kyčlí, ne dřep', 'Tyč těsně u holení', 'Napnutá záda po celou dobu'],
    mistakes: ['Kulacení dolních zad', 'Tyč se vzdaluje od těla', 'Trhání ze země'] },

  { id: 'sumo-deadlift', name: 'Sumo Deadlift', category: 'weightlifting', pattern: 'hinge',
    muscles: ['hýždě', 'vnitřní stehna', 'záda'], equipment: ['barbell'],
    loadable: true, oneRMKey: 'deadlift', variantMultiplier: 0.95,
    standard: { rx: { M: 97, F: 66 }, scaled: { M: 57, F: 40 } },
    levels: {
      beginner: { desc: 'Široký postoj, lehká zátěž, nácvik vzpřímeného trupu.', criteria: 'Zvládne hinge v širokém postoji bez kulacení zad.' },
      intermediate: { desc: 'Sumo deadlift se střední zátěží.', criteria: 'Stabilní kolena ve směru špiček pod 60 %+ 1RM.' },
      rx: { desc: 'Sumo deadlift s plnou zátěží.', criteria: 'Efektivní extenze kyčlí i u těžkých vah.' } },
    cues: ['Kolena tlačí ven', 'Vzpřímenější trup než u klasického tahu', 'Váha na patách'],
    mistakes: ['Kolena padají dovnitř', 'Předklon trupu', 'Nedostatečný nádech před tahem'] },

  { id: 'squat-clean', name: 'Squat Clean', category: 'weightlifting', pattern: 'olympic',
    muscles: ['celé tělo'], equipment: ['barbell'],
    loadable: true, oneRMKey: 'clean', variantMultiplier: 1,
    standard: { rx: { M: 61, F: 43 }, scaled: { M: 43, F: 29 } },
    levels: {
      beginner: { desc: 'Hang power clean s tyčí/lehkou zátěží, důraz na techniku.', criteria: 'Bezpečně zvládá power clean z visu s lehkou zátěží.' },
      intermediate: { desc: 'Power clean se střední zátěží.', criteria: 'Konzistentní trojitá extenze a příjem na měkkých kolenou.' },
      rx: { desc: 'Squat clean s plnou zátěží dle RX standardu.', criteria: 'Plný squat clean s plynulým přechodem do dřepu i u těžkých vah.' } },
    cues: ['Tyč blízko těla', 'Trojitá extenze (kotníky-kolena-kyčle)', 'Rychlý propad pod tyč'],
    mistakes: ['Předčasné pokrčení paží', 'Tyč se odklání od těla', 'Nedostatečná extenze kyčlí'] },

  { id: 'power-clean', name: 'Power Clean', category: 'weightlifting', pattern: 'olympic',
    muscles: ['celé tělo'], equipment: ['barbell'],
    loadable: true, oneRMKey: 'clean', variantMultiplier: 0.9,
    standard: { rx: { M: 52, F: 34 }, scaled: { M: 34, F: 24 } },
    levels: {
      beginner: { desc: 'Power clean s lehkou zátěží od kolen.', criteria: 'Zvládá čistý hip hinge a extenzi bez tažení pažemi.' },
      intermediate: { desc: 'Power clean se střední zátěží od podlahy.', criteria: 'Stabilní příjem nad paralelou u zátěže 60–70 % 1RM.' },
      rx: { desc: 'Power clean s plnou RX zátěží.', criteria: 'Rychlý a stabilní příjem i u vysoké zátěže.' } },
    cues: ['Tyč po stehnech nahoru', 'Vysoký loket na výjezdu', 'Příjem nad paralelou'],
    mistakes: ['Tažení pažemi příliš brzy', 'Naskakování dopředu', 'Nízký příjem (do dřepu)'] },

  { id: 'hang-power-clean', name: 'Hang Power Clean', category: 'weightlifting', pattern: 'olympic',
    muscles: ['celé tělo'], equipment: ['barbell'],
    loadable: true, oneRMKey: 'clean', variantMultiplier: 0.85,
    standard: { rx: { M: 47, F: 31 }, scaled: { M: 29, F: 20 } },
    levels: {
      beginner: { desc: 'Z visu nad koleny, lehká zátěž, pomalý nácvik.', criteria: 'Zvládá hip hinge z visu bez ztráty rovných zad.' },
      intermediate: { desc: 'Hang power clean se střední zátěží.', criteria: 'Plynulý přechod hinge → extenze → příjem.' },
      rx: { desc: 'Hang power clean s plnou zátěží.', criteria: 'Rychlá extenze a stabilní příjem i pod zátěží.' } },
    cues: ['Vis těsně nad koleny', 'Rovná záda po celou dobu', 'Aktivní příjem na loktech'],
    mistakes: ['Příliš nízký vis', 'Ztráta napětí v zádech', 'Pomalý loket při příjmu'] },

  { id: 'hang-squat-clean', name: 'Hang Squat Clean', category: 'weightlifting', pattern: 'olympic',
    muscles: ['celé tělo'], equipment: ['barbell'],
    loadable: true, oneRMKey: 'clean', variantMultiplier: 0.9,
    standard: { rx: { M: 56, F: 38 }, scaled: { M: 38, F: 25 } },
    levels: {
      beginner: { desc: 'Z visu, lehká zátěž, příjem do částečného dřepu.', criteria: 'Zvládá hang power clean čistě a opakovaně.' },
      intermediate: { desc: 'Hang squat clean se střední zátěží.', criteria: 'Bezpečný přechod do plného dřepu při příjmu.' },
      rx: { desc: 'Hang squat clean s plnou zátěží.', criteria: 'Plynulý squat clean z visu i u těžkých vah.' } },
    cues: ['Rychlý propad pod tyč', 'Loket vpřed při příjmu', 'Vzpřímený trup ve dřepu'],
    mistakes: ['Pomalý propad', 'Ztráta rovnováhy vzad', 'Neúplná extenze kyčlí'] },

  { id: 'clean-and-jerk', name: 'Clean & Jerk', category: 'weightlifting', pattern: 'olympic',
    muscles: ['celé tělo'], equipment: ['barbell', 'rack'],
    loadable: true, oneRMKey: 'clean', variantMultiplier: 0.95,
    standard: { rx: { M: 61, F: 43 }, scaled: { M: 43, F: 29 } },
    levels: {
      beginner: { desc: 'Hang power clean + push press s lehkou zátěží.', criteria: 'Zvládá obě části odděleně s lehkou zátěží.' },
      intermediate: { desc: 'Power clean + push jerk se střední zátěží.', criteria: 'Spojí clean a jerk plynule bez odpočinku mezi nimi.' },
      rx: { desc: 'Squat clean + split/push jerk s plnou zátěží.', criteria: 'Technicky čistý komplex i u vysoké zátěže.' } },
    cues: ['Krátká pauza pro nádech před jerkem', 'Stabilní rack pozice', 'Agresivní dip a drive u jerku'],
    mistakes: ['Příliš dlouhá pauza mezi fázemi', 'Nestabilní rack', 'Slabý dip před jerkem'] },

  { id: 'snatch', name: 'Snatch', category: 'weightlifting', pattern: 'olympic',
    muscles: ['celé tělo'], equipment: ['barbell'],
    loadable: true, oneRMKey: 'snatch', variantMultiplier: 1,
    standard: { rx: { M: 43, F: 29 }, scaled: { M: 29, F: 20 } },
    levels: {
      beginner: { desc: 'Hang power snatch s PVC/lehkou tyčí.', criteria: 'Zvládá široký úchop a power snatch z visu nad koleny.' },
      intermediate: { desc: 'Power snatch se střední zátěží.', criteria: 'Konzistentní extenze a příjem nad paralelou.' },
      rx: { desc: 'Squat snatch s plnou zátěží.', criteria: 'Plný squat snatch technicky čistě i pod vyšší zátěží.' } },
    cues: ['Široký úchop (snatch grip)', 'Tyč těsně u těla', 'Aktivní propad pod tyč'],
    mistakes: ['Předčasné pokrčení paží', 'Tyč se odklání dopředu', 'Nízký přijem bez kontroly'] },

  { id: 'power-snatch', name: 'Power Snatch', category: 'weightlifting', pattern: 'olympic',
    muscles: ['celé tělo'], equipment: ['barbell'],
    loadable: true, oneRMKey: 'snatch', variantMultiplier: 0.9,
    standard: { rx: { M: 38, F: 25 }, scaled: { M: 25, F: 16 } },
    levels: {
      beginner: { desc: 'Power snatch od kolen s lehkou zátěží.', criteria: 'Bezpečná extenze bez tažení pažemi.' },
      intermediate: { desc: 'Power snatch od podlahy se střední zátěží.', criteria: 'Stabilní příjem nad paralelou při 50–65 % 1RM.' },
      rx: { desc: 'Power snatch s plnou RX zátěží.', criteria: 'Rychlý a stabilní příjem i u vysoké zátěže.' } },
    cues: ['Extenze celého těla', 'Vysoký loket na výjezdu', 'Rychlý zámek nad hlavou'],
    mistakes: ['Slabý zámek v loktech', 'Naskakování dopředu', 'Nedostatečná extenze kyčlí'] },

  { id: 'hang-power-snatch', name: 'Hang Power Snatch', category: 'weightlifting', pattern: 'olympic',
    muscles: ['celé tělo'], equipment: ['barbell'],
    loadable: true, oneRMKey: 'snatch', variantMultiplier: 0.85,
    standard: { rx: { M: 34, F: 22 }, scaled: { M: 22, F: 15 } },
    levels: {
      beginner: { desc: 'Z visu nad koleny, velmi lehká zátěž.', criteria: 'Zvládá hip hinge a extenzi ze širokého úchopu.' },
      intermediate: { desc: 'Hang power snatch se střední zátěží.', criteria: 'Plynulý přechod hinge → extenze → zámek nad hlavou.' },
      rx: { desc: 'Hang power snatch s plnou zátěží.', criteria: 'Stabilní a rychlý zámek i pod vyšší zátěží.' } },
    cues: ['Vis těsně nad koleny', 'Napnutá záda', 'Aktivní zámek v ramenou'],
    mistakes: ['Nízký vis', 'Ztráta napětí zad', 'Pomalý propad pod tyč'] },

  { id: 'shoulder-press', name: 'Shoulder Press (strict)', category: 'weightlifting', pattern: 'push',
    muscles: ['ramena', 'triceps', 'core'], equipment: ['barbell', 'rack'],
    loadable: true, oneRMKey: 'press', variantMultiplier: 1,
    standard: { rx: { M: 47, F: 29 }, scaled: { M: 29, F: 20 } },
    levels: {
      beginner: { desc: 'Strict press s prázdnou tyčí.', criteria: 'Vytlačí tyč nad hlavu bez prohnutí v zádech.' },
      intermediate: { desc: 'Strict press se střední zátěží.', criteria: 'Kontrolovaný tlak bez pomoci nohou při 50 %+ 1RM.' },
      rx: { desc: 'Strict press s plnou RX zátěží.', criteria: 'Čistý strict tlak i u vyšší zátěže.' } },
    cues: ['Napnutý core a hýždě', 'Tyč po přímé dráze nad temenem', 'Hlava projde pod tyčí'],
    mistakes: ['Prohnutí v zádech', 'Pomoc nohama/kyčlemi', 'Šikmá dráha tyče'] },

  { id: 'push-press', name: 'Push Press', category: 'weightlifting', pattern: 'push',
    muscles: ['ramena', 'nohy', 'core'], equipment: ['barbell', 'rack'],
    loadable: true, oneRMKey: 'press', variantMultiplier: 1.15,
    standard: { rx: { M: 61, F: 40 }, scaled: { M: 40, F: 27 } },
    levels: {
      beginner: { desc: 'Push press s lehkou zátěží, krátký dip-drive.', criteria: 'Použije nohy k výpomoci bez ztráty rovnováhy.' },
      intermediate: { desc: 'Push press se střední zátěží.', criteria: 'Efektivní dip-drive a zámek při 55 %+ 1RM.' },
      rx: { desc: 'Push press s plnou zátěží.', criteria: 'Silný drive a rychlý zámek i u těžkých vah.' } },
    cues: ['Krátký a rychlý dip', 'Vertikální drive nohama', 'Aktivní zámek nad hlavou'],
    mistakes: ['Příliš hluboký dip', 'Tyč vpřed od těla', 'Chybějící zámek v loktech'] },

  { id: 'push-jerk', name: 'Push Jerk', category: 'weightlifting', pattern: 'push',
    muscles: ['ramena', 'nohy', 'core'], equipment: ['barbell', 'rack'],
    loadable: true, oneRMKey: 'press', variantMultiplier: 1.3,
    standard: { rx: { M: 70, F: 47 }, scaled: { M: 47, F: 31 } },
    levels: {
      beginner: { desc: 'Push jerk s lehkou zátěží, krátký propad pod tyč.', criteria: 'Zvládá dip-drive a mělký re-bend nohou.' },
      intermediate: { desc: 'Push jerk se střední zátěží.', criteria: 'Stabilní příjem v mírném podřepu při 60 %+ 1RM.' },
      rx: { desc: 'Push jerk s plnou RX zátěží.', criteria: 'Rychlý a stabilní příjem i u vysoké zátěže.' } },
    cues: ['Vertikální dip', 'Agresivní drive nahoru', 'Rychlý propad do re-bendu'],
    mistakes: ['Šikmý dip', 'Pomalý propad pod tyč', 'Nestabilní příjem'] },

  { id: 'split-jerk', name: 'Split Jerk', category: 'weightlifting', pattern: 'push',
    muscles: ['ramena', 'nohy', 'core'], equipment: ['barbell', 'rack'],
    loadable: true, oneRMKey: 'press', variantMultiplier: 1.35,
    standard: { rx: { M: 75, F: 50 }, scaled: { M: 50, F: 34 } },
    levels: {
      beginner: { desc: 'Nácvik split pozice bez zátěže/s tyčí.', criteria: 'Zvládá stabilní split postoj s tyčí nad hlavou.' },
      intermediate: { desc: 'Split jerk se střední zátěží.', criteria: 'Rychlý a stabilní split krok při 60 %+ 1RM.' },
      rx: { desc: 'Split jerk s plnou RX zátěží.', criteria: 'Silný drive a stabilní zámek i u vysoké zátěže.' } },
    cues: ['Rychlý a přímý split krok', 'Přední koleno nad kotníkem', 'Aktivní zámek nad hlavou'],
    mistakes: ['Krátký/pomalý split', 'Nestabilní zadní noha', 'Tyč vpřed od těla'] },

  { id: 'thruster', name: 'Thruster', category: 'weightlifting', pattern: 'squat',
    muscles: ['nohy', 'ramena', 'core'], equipment: ['barbell'],
    loadable: true, oneRMKey: 'frontSquat', variantMultiplier: 0.6,
    standard: { rx: { M: 43, F: 29 }, scaled: { M: 29, F: 20 } },
    levels: {
      beginner: { desc: 'Thruster s prázdnou tyčí nebo lehkou zátěží.', criteria: 'Spojí front squat s tlakem bez pauzy nahoře.' },
      intermediate: { desc: 'Thruster se střední zátěží ve vyšším objemu.', criteria: 'Udrží tempo v sérii 10+ opakování.' },
      rx: { desc: 'Thruster s plnou RX zátěží (např. Fran standard).', criteria: 'Konzistentní rytmus a technika i pod únavou.' } },
    cues: ['Plynulý přechod dřep → tlak', 'Využij hybnost z nohou', 'Lokty vysoko ve spodní pozici'],
    mistakes: ['Pauza mezi dřepem a tlakem', 'Neúplná extenze nahoře', 'Pokles loktů ve dřepu'] },

  { id: 'sumo-deadlift-high-pull', name: 'Sumo Deadlift High Pull', category: 'weightlifting', pattern: 'hinge',
    muscles: ['záda', 'ramena', 'hýždě'], equipment: ['barbell'],
    loadable: true, oneRMKey: 'deadlift', variantMultiplier: 0.6,
    standard: { rx: { M: 43, F: 29 }, scaled: { M: 29, F: 20 } },
    levels: {
      beginner: { desc: 'SDHP s lehkou zátěží, pomalé tempo.', criteria: 'Zvládá čistý hip hinge se širokým postojem.' },
      intermediate: { desc: 'SDHP se střední zátěží plynule.', criteria: 'Spojí extenzi kyčlí s vysokým tahem lokty nahoru.' },
      rx: { desc: 'SDHP s plnou zátěží v rychlém tempu.', criteria: 'Udrží techniku i ve vysokém tempu pod únavou.' } },
    cues: ['Extenze kyčlí táhne pohyb', 'Lokty vedou nad zápěstí', 'Tyč blízko těla'],
    mistakes: ['Tažení pouze pažemi', 'Kulacení zad', 'Tyč se vzdaluje od těla'] },

  { id: 'bench-press', name: 'Bench Press', category: 'weightlifting', pattern: 'push',
    muscles: ['hrudník', 'triceps', 'ramena'], equipment: ['barbell', 'rack'],
    loadable: true, oneRMKey: null, variantMultiplier: 1,
    standard: { rx: { M: 61, F: 40 }, scaled: { M: 40, F: 27 } },
    levels: {
      beginner: { desc: 'Bench press s prázdnou tyčí, nácvik dráhy.', criteria: 'Kontrolovaně spustí a vytlačí tyč v plném rozsahu.' },
      intermediate: { desc: 'Bench press se střední zátěží.', criteria: 'Stabilní dráha tyče při 60 %+ 1RM.' },
      rx: { desc: 'Bench press s plnou zátěží.', criteria: 'Silný a stabilní tlak i u těžkých vah.' } },
    cues: ['Lopatky stažené k sobě', 'Nohy pevně na zemi', 'Tyč k dolní části hrudníku'],
    mistakes: ['Odlepení hýždí od lavice', 'Odrážení tyče od hrudníku', 'Nestabilní zápěstí'] },

  /* ----------------------------- GYMNASTICS ------------------------------ */

  { id: 'air-squat', name: 'Air Squat', category: 'gymnastics', pattern: 'squat',
    muscles: ['nohy', 'hýždě', 'core'], equipment: ['none'],
    loadable: false,
    levels: {
      beginner: { desc: 'Dřep na box/lavičku pro kontrolu hloubky.', criteria: 'Zvládne 10 opakování s dosedem a rovnými zády.' },
      intermediate: { desc: 'Air squat v plném rozsahu, plynulé tempo.', criteria: 'Udrží techniku ve 20+ nepřerušovaných opakováních.' },
      rx: { desc: 'Air squat v rychlém tempu pod únavou.', criteria: 'Konzistentní hloubka a rytmus i po vysoké zátěži.' } },
    cues: ['Kolena ve směru špiček', 'Váha na patách', 'Prsa nahoru'],
    mistakes: ['Nedostatečná hloubka', 'Zvedání pat', 'Kolena dovnitř'] },

  { id: 'pistol-squat', name: 'Pistol Squat', category: 'gymnastics', pattern: 'squat',
    muscles: ['nohy', 'core', 'stabilizátory kotníku'], equipment: ['none'],
    loadable: false,
    levels: {
      beginner: { desc: 'Pistol na box s oporou (TRX/rám).', criteria: 'Zvládne kontrolovaný sed jednonož s oporou.' },
      intermediate: { desc: 'Pistol na zvýšené ploše bez opory.', criteria: 'Provede pistol s dopomocí protilehlé nohy bez opory.' },
      rx: { desc: 'Plný pistol squat z podlahy střídavě obě nohy.', criteria: 'Čistý jednonožný dřep do plné hloubky bez opory.' } },
    cues: ['Volná noha vpřed a nahoře', 'Váha na celém chodidle', 'Paže pro rovnováhu vpřed'],
    mistakes: ['Ztráta rovnováhy vzad', 'Zvedání paty', 'Neúplná hloubka'] },

  { id: 'push-up', name: 'Push-up', category: 'gymnastics', pattern: 'push',
    muscles: ['hrudník', 'triceps', 'core'], equipment: ['none'],
    loadable: false,
    levels: {
      beginner: { desc: 'Kliky na kolenou nebo na zvýšené ploše.', criteria: 'Zvládne 5 kliků s rovnými zády v plném rozsahu.' },
      intermediate: { desc: 'Standardní kliky z podlahy.', criteria: 'Zvládne 15+ nepřerušovaných kliků.' },
      rx: { desc: 'Kliky v sérii pod únavou, plný rozsah hrudník-země.', criteria: 'Udrží techniku i ve vysokém objemu/tempu.' } },
    cues: ['Tělo v jedné linii', 'Lokty cca 45° od těla', 'Hrudník k zemi'],
    mistakes: ['Propadlé boky', 'Neúplný rozsah', 'Lokty příliš do stran'] },

  { id: 'strict-pull-up', name: 'Strict Pull-up', category: 'gymnastics', pattern: 'pull',
    muscles: ['záda', 'biceps', 'core'], equipment: ['pull-up-bar'],
    loadable: false,
    levels: {
      beginner: { desc: 'Podporovaný pull-up s gumou nebo negativní fáze.', criteria: 'Zvládne kontrolovaný sestup (negativ) 3–5 s.' },
      intermediate: { desc: 'Strict pull-up bez pomoci, nižší objem.', criteria: 'Zvládne 3–5 čistých strict pull-upů.' },
      rx: { desc: 'Strict pull-up ve vyšším objemu/sériích.', criteria: 'Zvládne 10+ strict pull-upů v sérii.' } },
    cues: ['Brada nad tyč', 'Plná extenze v dolní pozici', 'Napnutý core, bez švihu'],
    mistakes: ['Kipping místo strict', 'Neúplný rozsah nahoře/dole', 'Prohnutí v zádech'] },

  { id: 'kipping-pull-up', name: 'Kipping Pull-up', category: 'gymnastics', pattern: 'pull',
    muscles: ['záda', 'core', 'ramena'], equipment: ['pull-up-bar'],
    loadable: false,
    levels: {
      beginner: { desc: 'Nácvik kipping švihu bez zvednutí brady.', criteria: 'Zvládá plynulý kipping švih (kotva) na tyči.' },
      intermediate: { desc: 'Kipping pull-up jednotlivě.', criteria: 'Zvládne 5+ kipping pull-upů v sérii.' },
      rx: { desc: 'Kipping pull-up ve vysokém objemu.', criteria: 'Zvládne 15+ v sérii s konzistentním rytmem.' } },
    cues: ['Švih vychází z kyčlí', 'Aktivní zápěstí a tah loktů dolů', 'Rytmický kipping oblouk'],
    mistakes: ['Švih pouze pažemi', 'Ztráta rytmu', 'Otevírání příliš brzy'] },

  { id: 'chest-to-bar-pull-up', name: 'Chest-to-Bar Pull-up', category: 'gymnastics', pattern: 'pull',
    muscles: ['záda', 'core', 'ramena'], equipment: ['pull-up-bar'],
    loadable: false,
    levels: {
      beginner: { desc: 'Nácvik vyššího tahu s gumovou dopomocí.', criteria: 'Zvládá strict pull-up s bradou nad tyčí.' },
      intermediate: { desc: 'C2B pull-up jednotlivě s kippingem.', criteria: 'Zvládne 3–5 C2B pull-upů v sérii.' },
      rx: { desc: 'C2B pull-up ve vyšším objemu.', criteria: 'Zvládne 10+ v sérii s hrudníkem k tyči.' } },
    cues: ['Silnější kipping oblouk', 'Táhni hruď k tyči, ne bradu', 'Aktivní záda při tahu'],
    mistakes: ['Nedosažení hrudníku k tyči', 'Ztráta kontroly na sestupu', 'Přetáčení ramen'] },

  { id: 'butterfly-pull-up', name: 'Butterfly Pull-up', category: 'gymnastics', pattern: 'pull',
    muscles: ['záda', 'core', 'ramena'], equipment: ['pull-up-bar'],
    loadable: false,
    levels: {
      beginner: { desc: 'Nácvik kruhového kippingu bez tahu nahoru.', criteria: 'Zvládá plynulý kipping pull-up.' },
      intermediate: { desc: 'Butterfly pull-up v pomalejším tempu.', criteria: 'Zvládne 5+ butterfly pull-upů plynule za sebou.' },
      rx: { desc: 'Butterfly pull-up ve vysokém tempu/objemu.', criteria: 'Zvládne 15+ v konzistentním cyklickém rytmu.' } },
    cues: ['Kruhová dráha těla', 'Kontinuální rytmus bez zastavení', 'Aktivní kotník při odrazu'],
    mistakes: ['Přerušovaný rytmus', 'Ztráta rovnováhy do stran', 'Předčasné vyčerpání tempa'] },

  { id: 'bar-muscle-up', name: 'Bar Muscle-up', category: 'gymnastics', pattern: 'pull',
    muscles: ['záda', 'triceps', 'core'], equipment: ['pull-up-bar'],
    loadable: false,
    levels: {
      beginner: { desc: 'Nácvik high pull-upu a transition drillů.', criteria: 'Zvládá C2B pull-up a false grip na tyči.' },
      intermediate: { desc: 'Bar muscle-up s dopomocí (guma/band).', criteria: 'Zvládne přechod (transition) s asistencí.' },
      rx: { desc: 'Bar muscle-up bez dopomoci.', criteria: 'Zvládne 3+ čisté bar muscle-upy v sérii.' } },
    cues: ['False grip úchop', 'Agresivní tah přes tyč', 'Rychlý přechod do dipu'],
    mistakes: ['Chybějící false grip', 'Zaseknutí v transition', 'Kopání nohama'] },

  { id: 'ring-muscle-up', name: 'Ring Muscle-up', category: 'gymnastics', pattern: 'pull',
    muscles: ['záda', 'triceps', 'core'], equipment: ['rings'],
    loadable: false,
    levels: {
      beginner: { desc: 'Nácvik ring rows a false grip držení.', criteria: 'Zvládá strict ring pull-up s false grip.' },
      intermediate: { desc: 'Ring muscle-up s dopomocí/nízkými kruhy.', criteria: 'Zvládne přechod s částečnou dopomocí.' },
      rx: { desc: 'Ring muscle-up bez dopomoci.', criteria: 'Zvládne 3+ čisté ring muscle-upy v sérii.' } },
    cues: ['False grip a stažené lopatky', 'Tah do hrudníku k rukám', 'Plynulý přechod bez zastavení'],
    mistakes: ['Kroužení/nestabilní kruhy', 'Chybějící false grip', 'Zaseknutí v transition'] },

  { id: 'ring-dip', name: 'Ring Dip', category: 'gymnastics', pattern: 'push',
    muscles: ['hrudník', 'triceps', 'ramena'], equipment: ['rings'],
    loadable: false,
    levels: {
      beginner: { desc: 'Podporovaný dip nebo dip na bradlech.', criteria: 'Zvládne dip na pevných bradlech v plném rozsahu.' },
      intermediate: { desc: 'Ring dip s částečnou dopomocí.', criteria: 'Zvládne 3–5 ring dipů s minimální rotací kruhů.' },
      rx: { desc: 'Ring dip bez dopomoci ve vyšším objemu.', criteria: 'Zvládne 10+ stabilních ring dipů v sérii.' } },
    cues: ['Stabilní kruhy, minimální kolébání', 'Lokty blízko těla', 'Plný rozsah dolů i nahoru'],
    mistakes: ['Nestabilní kruhy (kolébání)', 'Neúplný rozsah', 'Prohnutí v ramenou'] },

  { id: 'strict-handstand-push-up', name: 'Strict Handstand Push-up', category: 'gymnastics', pattern: 'push',
    muscles: ['ramena', 'triceps', 'core'], equipment: ['none'],
    loadable: false,
    levels: {
      beginner: { desc: 'Pike push-up na zemi/na boxu.', criteria: 'Zvládne 5 pike push-upů v plném rozsahu.' },
      intermediate: { desc: 'HSPU s deficitem/abmatem, částečný rozsah.', criteria: 'Zvládne 3–5 strict HSPU u zdi.' },
      rx: { desc: 'Strict HSPU ve vyšším objemu.', criteria: 'Zvládne 10+ strict HSPU v sérii.' } },
    cues: ['Napnutý core, aktivní ramena', 'Hlava mezi pažemi', 'Kontrolovaný sestup'],
    mistakes: ['Prohnutí v dolních zádech', 'Neúplný rozsah', 'Ztráta rovnováhy od zdi'] },

  { id: 'kipping-handstand-push-up', name: 'Kipping Handstand Push-up', category: 'gymnastics', pattern: 'push',
    muscles: ['ramena', 'triceps', 'core'], equipment: ['none'],
    loadable: false,
    levels: {
      beginner: { desc: 'Nácvik kip švihu u zdi bez tlaku.', criteria: 'Zvládá strict HSPU s částečnou dopomocí.' },
      intermediate: { desc: 'Kipping HSPU jednotlivě.', criteria: 'Zvládne 5+ kipping HSPU v sérii.' },
      rx: { desc: 'Kipping HSPU ve vysokém objemu.', criteria: 'Zvládne 15+ v konzistentním tempu.' } },
    cues: ['Kip iniciovaný kyčlemi/nohama', 'Rychlý tlak v horní fázi kipu', 'Stabilní zámek nad hlavou'],
    mistakes: ['Ztráta rovnováhy od zdi', 'Slabý kip impuls', 'Neúplná extenze paží'] },

  { id: 'handstand-walk', name: 'Handstand Walk', category: 'gymnastics', pattern: 'push',
    muscles: ['ramena', 'core', 'zápěstí'], equipment: ['none'],
    loadable: false,
    levels: {
      beginner: { desc: 'Kick-up do stoje na rukou u zdi, držení.', criteria: 'Udrží stoj na rukou u zdi 20+ s.' },
      intermediate: { desc: 'Volný stoj na rukou, krátké kroky.', criteria: 'Zvládne 3–5 kroků bez opory.' },
      rx: { desc: 'Handstand walk na vzdálenost/přes překážky.', criteria: 'Zvládne 15 m+ plynulé chůze na rukou.' } },
    cues: ['Napnutý core, aktivní zápěstí', 'Malé kroky prsty', 'Pohled mezi ruce'],
    mistakes: ['Prohnutá záda (banana back)', 'Velké nekontrolované kroky', 'Napjaté zatnuté zápěstí'] },

  { id: 'toes-to-bar', name: 'Toes-to-Bar', category: 'gymnastics', pattern: 'core',
    muscles: ['core', 'hip flexory', 'předloktí'], equipment: ['pull-up-bar'],
    loadable: false,
    levels: {
      beginner: { desc: 'Knees-to-chest na tyči nebo hanging knee raise.', criteria: 'Zvládne 5 hanging knee raises s kontrolou.' },
      intermediate: { desc: 'T2B jednotlivě s kippingem.', criteria: 'Zvládne 8+ T2B v sérii.' },
      rx: { desc: 'T2B ve vysokém objemu/tempu.', criteria: 'Zvládne 20+ v konzistentním kippingovém rytmu.' } },
    cues: ['Kipping švih z kyčlí', 'Aktivní napnutí core nahoře', 'Špičky k tyči, ne jen nahoru'],
    mistakes: ['Pouze houpání beze zvednutí', 'Pokrčená kolena místo T2B', 'Ztráta rytmu švihu'] },

  { id: 'knees-to-elbows', name: 'Knees-to-Elbows', category: 'gymnastics', pattern: 'core',
    muscles: ['core', 'hip flexory'], equipment: ['pull-up-bar'],
    loadable: false,
    levels: {
      beginner: { desc: 'Hanging knee raise s menším rozsahem.', criteria: 'Zvládne 5 hanging knee raises.' },
      intermediate: { desc: 'K2E jednotlivě s kippingem.', criteria: 'Zvládne 8+ K2E v sérii.' },
      rx: { desc: 'K2E ve vysokém objemu/tempu.', criteria: 'Zvládne 15+ v konzistentním rytmu.' } },
    cues: ['Kipping švih z kyčlí', 'Kolena k loktům, ne jen nahoru', 'Aktivní core při kontrakci'],
    mistakes: ['Nedostatečný rozsah', 'Houpání bez kontrakce', 'Ztráta napětí v ramenou'] },

  { id: 'ghd-sit-up', name: 'GHD Sit-up', category: 'gymnastics', pattern: 'core',
    muscles: ['core', 'hip flexory'], equipment: ['ghd'],
    loadable: false,
    levels: {
      beginner: { desc: 'GHD sit-up s menším rozsahem/pomalu.', criteria: 'Zvládne 5 kontrolovaných opakování v menším rozsahu.' },
      intermediate: { desc: 'GHD sit-up v plném rozsahu.', criteria: 'Zvládne 10+ v plném rozsahu bez bolesti zad.' },
      rx: { desc: 'GHD sit-up ve vyšším objemu/tempu.', criteria: 'Zvládne 20+ v konzistentním tempu.' } },
    cues: ['Plynulý pohyb, ne trhaný', 'Dotek rukama země vzadu', 'Aktivace core při návratu'],
    mistakes: ['Příliš rychlé/trhané tempo', 'Přetěžování dolních zad', 'Neúplný rozsah'] },

  { id: 'box-jump', name: 'Box Jump', category: 'gymnastics', pattern: 'jump',
    muscles: ['nohy', 'hýždě'], equipment: ['box'],
    loadable: false,
    levels: {
      beginner: { desc: 'Skok na nízký box (30 cm) nebo step-up.', criteria: 'Zvládne bezpečný výskok a plné narovnání nahoře.' },
      intermediate: { desc: 'Box jump na střední box (50–60 cm).', criteria: 'Zvládne 10+ opakování bez ztráty formy.' },
      rx: { desc: 'Box jump na vysoký box (60–75 cm) v sériích.', criteria: 'Konzistentní výskok i pod únavou ve vysokém objemu.' } },
    cues: ['Plné narovnání kyčlí nahoře', 'Měkký dopad, pokrčená kolena', 'Paže pomáhají s odrazem'],
    mistakes: ['Nedokončená extenze nahoře', 'Tvrdý dopad', 'Riziko škrábnutí holení při únavě'] },

  { id: 'box-jump-over', name: 'Box Jump Over', category: 'gymnastics', pattern: 'jump',
    muscles: ['nohy', 'hýždě', 'core'], equipment: ['box'],
    loadable: false,
    levels: {
      beginner: { desc: 'Step-over přes nízký box.', criteria: 'Zvládne bezpečný přechod přes box krokem.' },
      intermediate: { desc: 'Box jump over se skokem přes box.', criteria: 'Zvládne 10+ plynulých přeskoků.' },
      rx: { desc: 'Rychlé lateral/facing box jump overs v sérii.', criteria: 'Udrží rychlé tempo přeskoků i pod únavou.' } },
    cues: ['Krátký kontakt na vrcholu boxu', 'Pohled vpřed', 'Měkké přistání za boxem'],
    mistakes: ['Zbytečná pauza na boxu', 'Tvrdé přistání', 'Ztráta rovnováhy při přechodu'] },

  { id: 'burpee', name: 'Burpee', category: 'gymnastics', pattern: 'full-body',
    muscles: ['celé tělo'], equipment: ['none'],
    loadable: false,
    levels: {
      beginner: { desc: 'Burpee bez výskoku, krok zpět místo skoku.', criteria: 'Zvládne 5 burpees v pomalém kontrolovaném tempu.' },
      intermediate: { desc: 'Standardní burpee s výskokem a tleskem.', criteria: 'Zvládne 15+ burpees v plynulém tempu.' },
      rx: { desc: 'Burpee ve vysokém tempu/objemu pod únavou.', criteria: 'Udrží konzistentní rychlé tempo 30+ burpees.' } },
    cues: ['Hrudník k zemi', 'Plný výskok s tleskem nahoře', 'Efektivní přechod nahoru-dolů'],
    mistakes: ['Neúplný kontakt hrudníku se zemí', 'Chybějící extenze nahoře', 'Plýtvání energií na zbytečný pohyb'] },

  { id: 'burpee-box-jump-over', name: 'Burpee Box Jump Over', category: 'gymnastics', pattern: 'full-body',
    muscles: ['celé tělo'], equipment: ['box'],
    loadable: false,
    levels: {
      beginner: { desc: 'Burpee + step over box.', criteria: 'Zvládne 5 opakování v kontrolovaném tempu.' },
      intermediate: { desc: 'Burpee + skok přes box.', criteria: 'Zvládne 10+ opakování plynule.' },
      rx: { desc: 'Burpee box jump over ve vysokém tempu.', criteria: 'Udrží tempo 20+ opakování pod únavou.' } },
    cues: ['Efektivní přechod burpee → box', 'Krátký kontakt na vrcholu boxu', 'Měkké přistání'],
    mistakes: ['Zbytečné pauzy mezi fázemi', 'Tvrdé dopady', 'Ztráta tempa přechodem'] },

  { id: 'rope-climb', name: 'Rope Climb', category: 'gymnastics', pattern: 'pull',
    muscles: ['záda', 'předloktí', 'core'], equipment: ['rope'],
    loadable: false,
    levels: {
      beginner: { desc: 'Nácvik J-hook úchopu nohama na laně u země.', criteria: 'Zvládá visení na laně s aktivním úchopem nohama.' },
      intermediate: { desc: 'Rope climb s výpomocí nohou (J-hook).', criteria: 'Vyleze 4–5 m s technikou nohou.' },
      rx: { desc: 'Legless rope climb nebo rychlý výlez.', criteria: 'Zvládne výlez bez/s minimální pomocí nohou opakovaně.' } },
    cues: ['Úchop nohama (J-hook)', 'Táhni loktem dolů, ne rukou vzhůru', 'Kontrolovaný sestup'],
    mistakes: ['Chybějící zajištění nohou', 'Přetěžování předloktí', 'Nekontrolovaný sjezd (spálení dlaní)'] },

  { id: 'l-sit', name: 'L-sit', category: 'gymnastics', pattern: 'core',
    muscles: ['core', 'hip flexory', 'triceps'], equipment: ['none'],
    loadable: false,
    levels: {
      beginner: { desc: 'Tuck-sit (pokrčená kolena) na podložkách/kruzích.', criteria: 'Udrží tuck-sit 10 s se zvednutými nohami.' },
      intermediate: { desc: 'L-sit s jednou nohou nataženou nebo krátký L-sit.', criteria: 'Udrží L-sit 10–15 s.' },
      rx: { desc: 'Plný L-sit v delším držení.', criteria: 'Udrží plný L-sit 30 s+.' } },
    cues: ['Napnutá kolena a špičky', 'Tlak dlaní do země, ramena dolů', 'Napnutý core po celou dobu'],
    mistakes: ['Pokrčená kolena při plném L-sit', 'Zvednutá ramena k uším', 'Zadržování dechu'] },

  /* --------------------------- MONOSTRUCTURAL ---------------------------- */

  { id: 'run', name: 'Run', category: 'monostructural', pattern: 'monostructural',
    muscles: ['nohy', 'kardiovaskulární systém'], equipment: ['none'],
    loadable: false,
    levels: {
      beginner: { desc: 'Běh/rychlá chůze v nízkém tempu, kratší úseky.', criteria: 'Zvládne 400 m nepřerušovaně v pohodovém tempu.' },
      intermediate: { desc: 'Běh ve středním tempu na střední vzdálenosti.', criteria: 'Zvládne 1–2 km v konzistentním tempu.' },
      rx: { desc: 'Běh ve vysokém tempu/intervaly na čas.', criteria: 'Udrží rychlé tempo i ve vícenásobných intervalech.' } },
    cues: ['Vzpřímený trup', 'Doskok pod těžištěm', 'Rytmické dýchání'],
    mistakes: ['Předklánění trupu', 'Přílišný krok (overstriding)', 'Nepravidelné tempo'] },

  { id: 'row', name: 'Row (Concept2)', category: 'monostructural', pattern: 'monostructural',
    muscles: ['nohy', 'záda', 'core'], equipment: ['rower'],
    loadable: false,
    levels: {
      beginner: { desc: 'Veslování v nízkém tempu, důraz na sekvenci.', criteria: 'Udrží správnou sekvenci nohy-záda-paže při nízkém tempu.' },
      intermediate: { desc: 'Veslování ve středním tempu na čas/vzdálenost.', criteria: 'Udrží konzistentní split při 500–1000 m.' },
      rx: { desc: 'Veslování ve vysokém výkonu/sprintu.', criteria: 'Udrží vysoký silový výkon i ve víceintervalovém tréninku.' } },
    cues: ['Sekvence nohy → záda → paže', 'Rovná záda po celou dobu', 'Návrat v opačném pořadí'],
    mistakes: ['Předčasné zapojení paží', 'Kulacení zad', 'Trhavý, nekonzistentní tah'] },

  { id: 'bike-erg', name: 'Bike Erg', category: 'monostructural', pattern: 'monostructural',
    muscles: ['nohy', 'kardiovaskulární systém'], equipment: ['bike-erg'],
    loadable: false,
    levels: {
      beginner: { desc: 'Jízda v nízkém odporu/tempu.', criteria: 'Udrží plynulý kadenci 5+ minut.' },
      intermediate: { desc: 'Jízda ve středním tempu na kalorie/čas.', criteria: 'Udrží konzistentní výkon (watty) v intervalu.' },
      rx: { desc: 'Sprintové intervaly na bike ergu.', criteria: 'Udrží vysoký výkon i ve víceintervalovém sprintu.' } },
    cues: ['Plynulá kadence', 'Vzpřímený trup', 'Kontrolované dýchání'],
    mistakes: ['Nekonzistentní kadence', 'Přepínání do nízkého odporu při únavě', 'Hrbení v trupu'] },

  { id: 'assault-bike', name: 'Assault Bike', category: 'monostructural', pattern: 'monostructural',
    muscles: ['celé tělo', 'kardiovaskulární systém'], equipment: ['assault-bike'],
    loadable: false,
    levels: {
      beginner: { desc: 'Jízda v nízkém tempu, krátké úseky.', criteria: 'Udrží plynulé tempo 1–2 minuty.' },
      intermediate: { desc: 'Jízda ve středním tempu na kalorie.', criteria: 'Udrží konzistentní tempo v intervalu 3–5 min.' },
      rx: { desc: 'Sprintové intervaly na assault bike.', criteria: 'Udrží vysoký výkon i ve víceintervalovém sprintu.' } },
    cues: ['Souhra paží a nohou', 'Plynulý rytmus', 'Vzpřímený trup'],
    mistakes: ['Ztráta souhry paží/nohou', 'Přehnané zhoupnutí trupu', 'Nekonzistentní tempo'] },

  { id: 'ski-erg', name: 'Ski Erg', category: 'monostructural', pattern: 'monostructural',
    muscles: ['záda', 'core', 'kardiovaskulární systém'], equipment: ['ski-erg'],
    loadable: false,
    levels: {
      beginner: { desc: 'Ski erg v nízkém tempu, nácvik sekvence.', criteria: 'Zvládá sekvenci lat pull → hip hinge → návrat.' },
      intermediate: { desc: 'Ski erg ve středním tempu na kalorie/čas.', criteria: 'Udrží konzistentní split v intervalu.' },
      rx: { desc: 'Ski erg ve vysokém výkonu/sprintu.', criteria: 'Udrží vysoký výkon i ve víceintervalovém tréninku.' } },
    cues: ['Táhni z lat, ne jen paží', 'Hip hinge při tahu dolů', 'Plynulý návrat nahoru'],
    mistakes: ['Tah pouze pažemi', 'Chybějící hip hinge', 'Nekonzistentní rytmus'] },

  { id: 'double-under', name: 'Double Under', category: 'monostructural', pattern: 'jump',
    muscles: ['lýtka', 'core'], equipment: ['jump-rope'],
    loadable: false,
    levels: {
      beginner: { desc: 'Single under nebo nácvik dvojitých otoček po jedné.', criteria: 'Zvládne 20 nepřerušovaných single unders.' },
      intermediate: { desc: 'Double under jednotlivě/v krátkých sériích.', criteria: 'Zvládne 10+ nepřerušovaných double unders.' },
      rx: { desc: 'Double under ve vysokém objemu bez zaseknutí.', criteria: 'Zvládne 50+ nepřerušovaných double unders.' } },
    cues: ['Skákej z kotníků, ne z kolen', 'Zápěstí točí lano, ne paže', 'Malý, konzistentní odraz'],
    mistakes: ['Skákání příliš vysoko', 'Rotace celou paží', 'Nekonzistentní rytmus odrazu'] },

  { id: 'single-under', name: 'Single Under', category: 'monostructural', pattern: 'jump',
    muscles: ['lýtka', 'core'], equipment: ['jump-rope'],
    loadable: false,
    levels: {
      beginner: { desc: 'Single under v pomalém tempu.', criteria: 'Zvládne 20 nepřerušovaných skoků.' },
      intermediate: { desc: 'Single under v rychlejším tempu na objem.', criteria: 'Zvládne 50+ nepřerušovaných skoků.' },
      rx: { desc: 'Single under ve vysokém tempu jako engine práce.', criteria: 'Udrží vysoké tempo 100+ skoků bez zaseknutí.' } },
    cues: ['Malý odraz z kotníků', 'Zápěstí točí lano', 'Vzpřímený trup'],
    mistakes: ['Vysoký skok', 'Rotace celou paží', 'Hrbení trupu'] },

  /* ---------------------- STRONGMAN / ODD-OBJECT -------------------------- */

  { id: 'kettlebell-swing-russian', name: 'Kettlebell Swing (Russian)', category: 'strongman', pattern: 'hinge',
    muscles: ['hýždě', 'hamstringy', 'core'], equipment: ['kettlebell'],
    loadable: true, oneRMKey: null,
    standard: { rx: { M: 24, F: 16 }, scaled: { M: 16, F: 12 } },
    levels: {
      beginner: { desc: 'Swing do výšky prsou s lehkou kettlebell.', criteria: 'Zvládá hip hinge s kontrolovaným švihem do prsou.' },
      intermediate: { desc: 'Russian swing se střední zátěží v sérii.', criteria: 'Zvládne 15+ nepřerušovaných švihů.' },
      rx: { desc: 'Russian swing s RX zátěží ve vysokém objemu.', criteria: 'Udrží techniku a tempo 30+ opakování pod únavou.' } },
    cues: ['Pohon z kyčlí, ne z paží', 'Rovná záda po celou dobu', 'Napnutý core v horní pozici'],
    mistakes: ['Dřepování místo hinge', 'Zvedání paží (ne švih)', 'Kulacení zad'] },

  { id: 'kettlebell-swing-american', name: 'Kettlebell Swing (American)', category: 'strongman', pattern: 'hinge',
    muscles: ['hýždě', 'hamstringy', 'ramena'], equipment: ['kettlebell'],
    loadable: true, oneRMKey: null,
    standard: { rx: { M: 24, F: 16 }, scaled: { M: 16, F: 12 } },
    levels: {
      beginner: { desc: 'Švih do výšky prsou, nácvik plné extenze.', criteria: 'Zvládá Russian swing s kontrolovanou technikou.' },
      intermediate: { desc: 'American swing nad hlavu se střední zátěží.', criteria: 'Zvládne 10+ nepřerušovaných švihů nad hlavu.' },
      rx: { desc: 'American swing s RX zátěží ve vysokém objemu.', criteria: 'Udrží plnou extenzi a rytmus 25+ opakování.' } },
    cues: ['Plná extenze kyčlí a paží nahoře', 'Napnutý core při zámku nad hlavou', 'Kontrolovaný sestup zpět do swingu'],
    mistakes: ['Neúplná extenze nad hlavou', 'Prohnutí zad v horní pozici', 'Ztráta rytmu švihu'] },

  { id: 'kettlebell-snatch', name: 'Kettlebell Snatch', category: 'strongman', pattern: 'olympic',
    muscles: ['celé tělo'], equipment: ['kettlebell'],
    loadable: true, oneRMKey: null,
    standard: { rx: { M: 24, F: 16 }, scaled: { M: 16, F: 12 } },
    levels: {
      beginner: { desc: 'Nácvik high pull s lehkou kettlebell.', criteria: 'Zvládá kontrolovaný swing a high pull.' },
      intermediate: { desc: 'KB snatch se střední zátěží, střídání rukou.', criteria: 'Zvládne 5+ nepřerušovaných opakování na stranu.' },
      rx: { desc: 'KB snatch s RX zátěží ve vysokém objemu.', criteria: 'Udrží techniku a tempo 15+ opakování na stranu.' } },
    cues: ['Blízká dráha kettlebell u těla', '"Punch through" v horní pozici', 'Měkký příjem na zápěstí'],
    mistakes: ['Vzdálená dráha od těla', 'Tvrdý náraz na zápěstí', 'Chybějící extenze kyčlí'] },

  { id: 'dumbbell-snatch', name: 'Dumbbell Snatch', category: 'strongman', pattern: 'olympic',
    muscles: ['celé tělo'], equipment: ['dumbbell'],
    loadable: true, oneRMKey: null,
    standard: { rx: { M: 22.5, F: 15 }, scaled: { M: 15, F: 10 } },
    levels: {
      beginner: { desc: 'DB snatch s lehkou činkou, pomalé tempo.', criteria: 'Zvládá jednoruční hinge a extenzi s lehkou zátěží.' },
      intermediate: { desc: 'DB snatch se střední zátěží, střídání rukou.', criteria: 'Zvládne 8+ nepřerušovaných opakování na stranu.' },
      rx: { desc: 'DB snatch s RX zátěží ve vysokém objemu.', criteria: 'Udrží techniku 15+ opakování na stranu pod únavou.' } },
    cues: ['Extenze kyčlí táhne pohyb', 'Činka blízko těla', 'Rychlý propad pod zámek'],
    mistakes: ['Tažení pouze paží', 'Vzdálená dráha od těla', 'Nestabilní zámek nahoře'] },

  { id: 'dumbbell-clean-and-jerk', name: 'Dumbbell Clean & Jerk', category: 'strongman', pattern: 'olympic',
    muscles: ['celé tělo'], equipment: ['dumbbell'],
    loadable: true, oneRMKey: null,
    standard: { rx: { M: 22.5, F: 15 }, scaled: { M: 15, F: 10 } },
    levels: {
      beginner: { desc: 'DB clean + press s lehkou zátěží po jedné ruce.', criteria: 'Zvládá clean a strict press odděleně.' },
      intermediate: { desc: 'DB clean & jerk se střední zátěží.', criteria: 'Spojí clean a jerk plynule na obě strany.' },
      rx: { desc: 'DB clean & jerk s RX zátěží ve vysokém objemu.', criteria: 'Udrží techniku i tempo pod únavou na obě strany.' } },
    cues: ['Stabilní rack pozice na rameni', 'Dip-drive u jerku', 'Kontrola při dopadu clean'],
    mistakes: ['Nestabilní rack na rameni', 'Slabý dip před jerkem', 'Ztráta rovnováhy do strany'] },

  { id: 'dumbbell-thruster', name: 'Dumbbell Thruster', category: 'strongman', pattern: 'squat',
    muscles: ['nohy', 'ramena', 'core'], equipment: ['dumbbell'],
    loadable: true, oneRMKey: null,
    standard: { rx: { M: 22.5, F: 15 }, scaled: { M: 15, F: 10 } },
    levels: {
      beginner: { desc: 'DB thruster s lehkými činkami.', criteria: 'Spojí front squat s tlakem bez pauzy nahoře.' },
      intermediate: { desc: 'DB thruster se střední zátěží ve vyšším objemu.', criteria: 'Udrží tempo v sérii 10+ opakování.' },
      rx: { desc: 'DB thruster s RX zátěží ve vysokém objemu.', criteria: 'Konzistentní rytmus i pod únavou.' } },
    cues: ['Plynulý přechod dřep → tlak', 'Lokty vpřed ve spodní pozici', 'Využij hybnost z nohou'],
    mistakes: ['Pauza mezi dřepem a tlakem', 'Neúplná extenze nahoře', 'Ztráta rovnováhy vzad'] },

  { id: 'wall-ball-shot', name: 'Wall Ball Shot', category: 'strongman', pattern: 'squat',
    muscles: ['nohy', 'ramena', 'core'], equipment: ['wall-ball'],
    loadable: true, oneRMKey: null,
    standard: { rx: { M: 9, F: 6 }, scaled: { M: 6, F: 4 } },
    levels: {
      beginner: { desc: 'Wall ball s lehkým míčem na nižší cíl.', criteria: 'Spojí dřep s hodem míče na cíl bez pauzy.' },
      intermediate: { desc: 'Wall ball se standardním míčem na RX výšku.', criteria: 'Zvládne 15+ nepřerušovaných opakování.' },
      rx: { desc: 'Wall ball ve vysokém objemu/tempu.', criteria: 'Udrží tempo 30+ opakování pod únavou.' } },
    cues: ['Plná hloubka dřepu', 'Hod vychází z nohou, ne jen paží', 'Přesný cíl na značce'],
    mistakes: ['Nedostatečná hloubka', 'Hod pouze pažemi', 'Neúplné zachycení míče'] },

  { id: 'farmers-carry', name: "Farmer's Carry", category: 'strongman', pattern: 'carry',
    muscles: ['předloktí', 'core', 'trapézy'], equipment: ['dumbbell', 'kettlebell'],
    loadable: true, oneRMKey: null,
    standard: { rx: { M: 32, F: 24 }, scaled: { M: 24, F: 16 } },
    levels: {
      beginner: { desc: 'Chůze s lehkými závažími na kratší vzdálenost.', criteria: 'Ujde 20 m s rovným trupem a pevným úchopem.' },
      intermediate: { desc: 'Chůze se střední zátěží na střední vzdálenost.', criteria: 'Ujde 40 m bez ztráty formy.' },
      rx: { desc: 'Chůze s těžkou zátěží na delší vzdálenost/čas.', criteria: 'Udrží rychlé tempo i na 100 m+ pod únavou.' } },
    cues: ['Vzpřímený trup, ramena dozadu', 'Pevný úchop', 'Krátké, rychlé kroky'],
    mistakes: ['Naklánění do stran', 'Hrbení ramen', 'Příliš dlouhé/nestabilní kroky'] },

  { id: 'sandbag-carry', name: 'Sandbag Carry', category: 'strongman', pattern: 'carry',
    muscles: ['core', 'nohy', 'záda'], equipment: ['sandbag'],
    loadable: true, oneRMKey: null,
    standard: { rx: { M: 30, F: 20 }, scaled: { M: 20, F: 15 } },
    levels: {
      beginner: { desc: 'Nošení lehkého pytle na hrudi na kratší vzdálenost.', criteria: 'Ujde 20 m se stabilním držením u hrudi.' },
      intermediate: { desc: 'Nošení pytle na rameni na střední vzdálenost.', criteria: 'Ujde 40 m se střídáním ramen dle potřeby.' },
      rx: { desc: 'Nošení těžkého pytle na delší vzdálenost/čas.', criteria: 'Udrží tempo na 100 m+ bez opakovaného odkládání.' } },
    cues: ['Napnutý core při nesení', 'Stabilní dech proti zátěži', 'Krátké kroky pro rovnováhu'],
    mistakes: ['Přetáčení trupu', 'Zadržování dechu', 'Nestabilní pozice pytle'] },

  { id: 'sled-push', name: 'Sled Push', category: 'strongman', pattern: 'carry',
    muscles: ['nohy', 'core', 'ramena'], equipment: ['sled'],
    loadable: true, oneRMKey: null,
    standard: { rx: { M: 80, F: 60 }, scaled: { M: 60, F: 40 } },
    levels: {
      beginner: { desc: 'Tlačení lehkého sledu na kratší vzdálenost.', criteria: 'Ujde 10 m se stabilním předklonem a drivem z nohou.' },
      intermediate: { desc: 'Tlačení sledu se střední zátěží.', criteria: 'Ujde 20 m v konzistentním tempu.' },
      rx: { desc: 'Tlačení sledu s vysokou zátěží na delší vzdálenost.', criteria: 'Udrží silový drive na 40 m+ bez zastavení.' } },
    cues: ['Nízký úhel předklonu', 'Pohon z nohou, drobné rychlé kroky', 'Napnuté paže, pevná pozice'],
    mistakes: ['Příliš vzpřímená pozice', 'Dlouhé nestabilní kroky', 'Ztráta napětí v core'] },

  { id: 'devil-press', name: 'Devil Press', category: 'strongman', pattern: 'full-body',
    muscles: ['celé tělo'], equipment: ['dumbbell'],
    loadable: true, oneRMKey: null,
    standard: { rx: { M: 22.5, F: 15 }, scaled: { M: 15, F: 10 } },
    levels: {
      beginner: { desc: 'Burpee + DB swing/clean s lehkou zátěží.', criteria: 'Zvládá burpee a DB snatch odděleně.' },
      intermediate: { desc: 'Devil press se střední zátěží.', criteria: 'Spojí burpee a dvouruční DB snatch plynule.' },
      rx: { desc: 'Devil press s RX zátěží ve vysokém objemu.', criteria: 'Udrží tempo 10+ opakování pod únavou.' } },
    cues: ['Hrudník k zemi mezi činkami', 'Extenze kyčlí táhne swing nahoru', 'Plynulý přechod burpee → snatch'],
    mistakes: ['Neúplný kontakt hrudníku se zemí', 'Tažení pouze pažemi', 'Ztráta tempa mezi fázemi'] }

];

window.CF_EQUIPMENT_LABELS = {
  barbell: 'Činka (barbell)', rack: 'Stojan/rack', 'pull-up-bar': 'Hrazda', rings: 'Kruhy',
  ghd: 'GHD', box: 'Bedna (box)', 'jump-rope': 'Švihadlo', rope: 'Lano na šplh',
  rower: 'Veslovací trenažér', 'bike-erg': 'Bike erg', 'assault-bike': 'Assault bike',
  'ski-erg': 'SkiErg', kettlebell: 'Kettlebell', dumbbell: 'Jednoručky (dumbbell)',
  'wall-ball': 'Wall ball (medicinbal)', sandbag: 'Sandbag', sled: 'Sled', none: 'Bez vybavení'
};

window.CF_PATTERN_LABELS = {
  squat: 'Dřep', hinge: 'Hip hinge', push: 'Tlak', pull: 'Tah', carry: 'Nošení',
  jump: 'Skok', core: 'Core', rotation: 'Rotace', 'full-body': 'Celé tělo',
  olympic: 'Vzpírání (Oly)', monostructural: 'Monostrukturální'
};

window.CF_CATEGORY_LABELS = {
  weightlifting: 'Vzpírání', gymnastics: 'Gymnastika', monostructural: 'Monostrukturální',
  strongman: 'Strongman / odd-object'
};
