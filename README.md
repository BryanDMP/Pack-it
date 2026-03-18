# Pack-it 🎮

Jeu éducatif sur les paquets IP — *The Packet Crew* (SHS EPFL, 2026)

## Stack
- **Kaplay** (moteur de jeu JS/Canvas)
- **Vite** (build & hot-reload)

## Setup
```bash
npm install
npm run dev      # serveur local → http://localhost:5173
```

## Build pour itch.io
```bash
npm run build    # génère dist/
```
Upload le dossier `dist/` sur itch.io en tant que **HTML game**.

## Structure
```
src/
  main.js               ← init kaplay + go("title")
  data/
    constants.js        ← palette, DNS_TABLE, PLAYER_SPEED…
    logbook.js          ← cache DNS partagé entre scènes (singleton)
  scenes/
    title.js            ← écran titre
    level1.js           ← Level 1 complet
    win.js              ← écran victoire Level 1
  ui/
    dialog.js           ← boîte de dialogue réutilisable
    dnsOverlay.js       ← overlay Bureau de Poste (DNS lookup interactif)
    envelopeOverlay.js  ← overlay IP Header / enveloppe
  utils/
    world.js            ← helpers dessin (route, maisons, flèches)
    player.js           ← factory joueur + mouvement
```

## Ajouter un Level
1. Créer `src/scenes/level2.js` avec `registerLevel2Scene(k)`
2. L'importer dans `src/main.js` et l'enregistrer
3. Faire pointer le bouton win screen vers `k.go("level2")`

Le `logbook` persiste automatiquement entre scènes.

## Contrôles
| Touche | Action |
|--------|--------|
| WASD / Flèches | Déplacement |
| ESPACE | Valider / Continuer |
| ENTRÉE | Valider dans les overlays |
| ÉCHAP  | Fermer un overlay |
