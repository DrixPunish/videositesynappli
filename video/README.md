# Studio vidéo — Pilotaction (démo produit)

Génère la vidéo de présentation **Pilotaction** (MP4 1080p/30fps, ~76 s) :
Excel chaotique → app Pilotaction (souris + clics) → intégrations → comparatif → CTA.

## Fichiers

- `studio.html` — toute la vidéo, en HTML/CSS/JS : timeline déterministe
  pilotée par `window.seek(tMs)` (chaque frame est une fonction pure du temps :
  souris, clics, transitions, états de l'app). Modifier les textes/scènes ici.
- `render.js` — rendu image par image (Playwright) assemblé en MP4 (ffmpeg).
- `fonts/` + `fonts.css` — polices embarquées (Inter, Archivo, IBM Plex Mono, Outfit).
- `pilotaction-demo.mp4` — la vidéo générée.

## Regénérer la vidéo

```bash
# prérequis : npm i playwright-core @ffmpeg-installer/ffmpeg (et Chromium)
STUDIO_MODULES=/chemin/vers/node_modules node render.js render pilotaction-demo.mp4 30

# aperçu d'instants précis (QA) :
node render.js preview 8000,36500,55800
```

## Scénario (timeline)

| Scène | Temps | Contenu |
|---|---|---|
| Intro | 0–5,5 s | Logo Synappli + titre Pilotaction |
| Excel | 5,5–24 s | Tableur plan d'actions qui déraille : clics, erreurs #REF!, action supprimée, versions multiples |
| Déclic | 24–28,5 s | « Et si le problème n'était pas votre équipe… mais votre outil ? » |
| App | 28,5–52 s | Navigation cliquée : dashboard → plans → détail → clôture d'action → relances → export PDF |
| Intégrations | 52–61 s | Hub : ERP, CRM, Excel/CSV, SSO, e-mail, API internes |
| Comparatif | 61–69 s | Tableur vs Pilotaction (4 critères) |
| Outro | 69–76 s | Logo + « Demandez une démo — contact@synappli.com » |

Timings dans `SC` (studio.html) ; souris dans `resolveCursor()` ; textes dans le HTML.
