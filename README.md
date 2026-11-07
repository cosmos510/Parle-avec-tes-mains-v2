# Parle avec tes mains

Apprends l'alphabet de la langue des signes française (LSF) grâce à la reconnaissance en temps réel par webcam.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Démo

🔗 [parle-avec-tes-mains.vercel.app](https://parle-avec-tes-mains.fr)

## Fonctionnalités

- **Détection en temps réel** — MediaPipe détecte les landmarks de ta main via webcam
- **Classification IA** — Un modèle ONNX reconnaît les 26 lettres de l'alphabet dactylologique
- **Mode libre** — Entraîne-toi lettre par lettre à ton rythme
- **Mode challenge** — Épelle des mots complets pour marquer des points
- **100% privé** — Tout le traitement se fait dans ton navigateur, aucune donnée n'est envoyée

## Comment ça marche

```
Webcam → MediaPipe Hands → 21 landmarks → Features extraction → ONNX model → Lettre prédite
```

1. **MediaPipe Hands** détecte 21 points clés de la main en temps réel
2. **Feature extraction** calcule 87 features (coordonnées normalisées, distances, angles, courbures)
3. **Modèle ONNX** classifie le signe parmi les 26 lettres de l'alphabet

## Stack technique

| Technologie | Utilisation |
|-------------|-------------|
| [Next.js 16](https://nextjs.org/) | Framework React avec App Router |
| [TypeScript](https://www.typescriptlang.org/) | Typage statique |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [MediaPipe Hands](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker) | Détection des mains |
| [ONNX Runtime Web](https://onnxruntime.ai/) | Inférence du modèle dans le navigateur |
| [Framer Motion](https://www.framer.com/motion/) | Animations |

## Installation locale

```bash
# Clone le repo
git clone https://github.com/cosmos510/parle-avec-tes-mains-v2.git
cd parle-avec-tes-mains-v2

# Installe les dépendances
npm install

# Lance le serveur de dev
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) dans ton navigateur.

## Structure du projet

```
src/
├── app/
│   ├── page.tsx          # Landing page
│   ├── practice/         # Page d'entraînement
│   └── not-found.tsx     # Page 404
├── components/
│   ├── layout/           # Navbar, Footer
│   ├── sections/         # Hero, About, Roadmap
│   └── ui/               # Composants réutilisables
├── hooks/
│   ├── useMediaPipeHands.ts    # Hook webcam + MediaPipe
│   └── useLetterStabilization.ts # Stabilisation de la détection
└── lib/
    ├── onnx-classifier.ts # Classification ONNX
    └── constants.ts       # Config (alphabet, scoring, etc.)
```

## Déploiement sur Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/cosmos510/parle-avec-tes-mains-v2)

Ou manuellement :

1. Fork ce repo
2. Connecte-toi à [Vercel](https://vercel.com)
3. Clique sur "New Project" → Importe ton fork
4. Vercel détecte automatiquement Next.js, clique sur "Deploy"

C'est tout ! Les analytics Vercel sont activés automatiquement.

## Entraîner ton propre modèle

Le modèle ONNX peut être remplacé par le tien. Voir `scripts/convert_model.py` pour la conversion depuis un modèle scikit-learn.

Le modèle attend 87 features en entrée :
- 63 coordonnées normalisées (21 landmarks × 3)
- 9 distances entre points clés
- 10 angles entre doigts
- 5 courbures des doigts

## Roadmap

- [x] Détection des 26 lettres de l'alphabet
- [x] Mode libre et mode challenge
- [x] Système de score et séries
- [ ] Support mobile (PWA)
- [ ] Ajout de mots et phrases complètes
- [ ] Mode multijoueur

## Contribuer

Les contributions sont les bienvenues ! N'hésite pas à ouvrir une issue ou une PR.

## Licence

[MIT](./LICENSE) — Utilise ce projet comme tu veux.

## Auteur

Créé par [Maxime Martin](https://github.com/cosmos510)
