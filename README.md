# Pilotaction — Présentation animée (Synappli)

Page web autonome de présentation de l'application **Pilotaction**
(*Pilotage de plans d'actions*), sous forme de « vidéo » interactive qui se
joue au défilement (ou en auto-play), scène par scène (une scène = un écran).

Elle met en scène un comparatif :

> **Le monde d'avant (Excel)** — actions noyées dans les onglets, pilotes et
> échéances flous, retards invisibles, perte de données, aucune traçabilité ni
> revue d'efficacité…
>
> **vs**
>
> **Le modèle Pilotaction** — actions & sous-actions structurées, pilotes
> responsabilisés, relances & alertes de retard, revue d'efficacité, droits par
> rôle (Admin/Manager/Collaborateur), tableaux de bord et traçabilité complète.

## Contenu

- **`index.html`** — la page complète. Un seul fichier, **aucune dépendance**
  (CSS et JS embarqués ; les polices Inter/Archivo/IBM Plex Mono sont chargées
  via Google Fonts, comme sur le site Synappli).

## Structure de la présentation (6 scènes plein écran)

1. **Hero** — « Arrêtez de suivre vos plans d'actions sur un tableur »
2. **Le monde d'avant** — faux tableur de plan d'actions animé (formules
   cassées, dates erronées, action supprimée) + points de douleur
3. **Le déclic** — bandeau de transition (fond navy)
4. **Le modèle Pilotaction** — maquette fidèle de l'app (navigation réelle,
   KPIs, plans d'exemple, journal d'activité temps réel) + bénéfices
5. **Face à face** — tableau comparatif Excel vs Pilotaction
6. **Appel à l'action** — « Demander une démo »

## Direction artistique

Reprise du site Synappli : fond clair, texte navy `#1a2035`, bleu `#2e5be8`
(CTA) et teal `#046c91` (accents), typos Inter / Archivo / IBM Plex Mono.
Toutes les couleurs sont dans les variables CSS `:root` en haut de `index.html`.

## Utilisation

Ouvrir `index.html` dans un navigateur, ou l'héberger tel quel. La page étant
autonome, elle s'intègre directement au site Synappli (page dédiée, ou section
via `<iframe>`). Le bouton **« Lancer la démonstration »** fait défiler
automatiquement la présentation scène par scène ; tout défilement manuel
l'arrête.

## À personnaliser

- **Logo** : le mark Synappli est actuellement une **recréation SVG vectorielle**
  (bloc `<g id="synappli-mark">` en haut du `<body>`). Pour le rendu
  pixel-perfect, remplacer ce SVG par le logo officiel (déposer le fichier, ex.
  `assets/logo-synappli.svg`, et brancher un `<img>` / `<use>`).
- **Textes & arguments** : rédigés à partir de l'app réelle — à ajuster au besoin.
- **Contact** : les boutons pointent vers `contact@synappli.com` (à confirmer).
