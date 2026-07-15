# Pilotaction — Présentation animée (Synappli)

Page web autonome de présentation de l'application **Pilotaction**, sous forme
de « vidéo » interactive qui se joue au défilement (ou en auto-play).

Elle met en scène un comparatif :

> **Le monde d'avant (Excel)** — erreurs invisibles, guerre des versions, perte
> de données, aucune traçabilité, collaboration bloquée…
>
> **vs**
>
> **Le modèle Pilotaction** — données structurées et validées, historique
> complet, collaboration temps réel, droits & rôles fins, alertes automatiques,
> tableaux de bord de pilotage.

## Contenu

- **`index.html`** — la page complète. Un seul fichier, **aucune dépendance
  externe** (CSS et JS embarqués, aucune police ni image distante).

## Aperçu / structure de la présentation

1. **Hero** — accroche « Arrêtez de piloter votre activité sur un tableur »
2. **Le monde d'avant** — faux tableur Excel animé (formules cassées `#REF!`,
   ligne supprimée par erreur, versions multiples) + points de douleur
3. **Le déclic** — bandeau de transition
4. **Le modèle Pilotaction** — maquette animée de l'app (KPIs, tableau de
   projets, journal d'activité temps réel) + bénéfices
5. **Face à face** — tableau comparatif Excel vs Pilotaction
6. **Appel à l'action** — « Demander une démo »

## Utilisation

Ouvrir `index.html` dans un navigateur, ou l'héberger tel quel. La page étant
autonome, elle peut aussi être intégrée dans le site Synappli existant (par
exemple via une `<iframe>` ou en reprenant la section directement).

Le bouton **« Lancer la démonstration »** fait défiler automatiquement la
présentation scène par scène (façon vidéo) ; tout défilement manuel l'arrête.

## À personnaliser

- Textes et arguments (1er jet — à ajuster avec vos fonctionnalités réelles).
- Charte graphique : couleurs définies dans les variables CSS `:root`
  (`--brand-1`, `--brand-2`, `--brand-3`) en haut de `index.html`.
- Liens de contact : actuellement `contact@synappli.com` (boutons « démo »).
