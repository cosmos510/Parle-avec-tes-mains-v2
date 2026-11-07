# 🤟 Parle avec tes mains

Apprenez l'alphabet de la langue des signes américaine (ASL) avec votre webcam. L'application reconnaît vos gestes en temps réel, directement dans votre navigateur.

![Demo](./public/demo.gif)

## ✨ Fonctionnalités

- **Reconnaissance en temps réel** - Votre webcam détecte les lettres que vous signez
- **100% local** - Tout le traitement se fait dans votre navigateur, aucune donnée n'est envoyée
- **Gratuit et open source** - Pas d'inscription, pas de compte
- **Mode libre** - Reproduisez des lettres aléatoires pour vous entraîner
- **Mode challenge** - Épelez des mots complets (HI, LOVE, COOL...)
- **Gamification** - Score, streak, célébrations

## 🚀 Démo

👉 [parle-avec-tes-mains.fr](https://parle-avec-tes-mains.fr)

## 🛠️ Stack technique

| Catégorie | Technologie |
|-----------|-------------|
| Framework | Next.js 16 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Animations | Framer Motion |
| Hand tracking | MediaPipe Hands |
| ML inference | ONNX Runtime Web |
| Deployment | Vercel |

## 📁 Architecture

```
src/
├── app/                    # Pages Next.js
│   ├── page.tsx           # Landing page
│   └── practice/          # Page d'entraînement
│
├── components/
│   ├── layout/            # Navbar, Footer
│   ├── sections/          # Hero, Roadmap, About
│   ├── practice/          # Composants page practice
│   │   ├── camera-view.tsx
│   │   ├── detection-overlay.tsx
│   │   ├── alphabet-grid.tsx
│   │   └── ...
│   └── ui/                # shadcn/ui components
│
├── hooks/
│   ├── useMediaPipeHands.ts      # Détection des mains + ONNX
│   └── useLetterStabilization.ts # Anti-flickering & validation
│
├── lib/
│   ├── onnx-classifier.ts # Feature extraction + inference
│   ├── constants.ts       # Config (timing, scoring, alphabet)
│   └── utils.ts           # Helpers
│
└── types/
    └── practice.ts        # TypeScript interfaces
```

### Principes de design

- **Composants atomiques** : Chaque composant a une responsabilité unique
- **Hooks personnalisés** : Logique métier isolée et réutilisable
- **Types stricts** : Interfaces TypeScript pour toutes les props
- **Constantes centralisées** : Configuration facile à modifier

## 📦 Installation locale

```bash
git clone https://github.com/cosmos510/parle-avec-tes-mains-v2.git
cd parle-avec-tes-mains-v2
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 🧠 Pipeline de reconnaissance

```
┌─────────────┐    ┌──────────────┐    ┌────────────────┐    ┌─────────────┐
│   Webcam    │───▶│  MediaPipe   │───▶│  Feature       │───▶│    ONNX     │
│   Frame     │    │  Hands       │    │  Extraction    │    │   Model     │
└─────────────┘    │  (21 points) │    │  (87 features) │    │  (MLP)      │
                   └──────────────┘    └────────────────┘    └─────────────┘
                                                                    │
                                                                    ▼
┌─────────────┐    ┌──────────────┐    ┌────────────────┐    ┌─────────────┐
│   UI        │◀───│ Stabilizer   │◀───│  Predicted     │◀───│  Letter +   │
│   Display   │    │ (300ms/1s)   │    │  Letter        │    │  Confidence │
└─────────────┘    └──────────────┘    └────────────────┘    └─────────────┘
```

### Features extraites (87 total)

| Type | Nombre | Description |
|------|--------|-------------|
| Coordonnées normalisées | 63 | 21 points × 3 (x, y, z) relatifs au poignet |
| Distances clés | 9 | Entre pointes de doigts et articulations |
| Angles inter-doigts | 10 | Angles entre les vecteurs des doigts |
| Courbures | 5 | Flexion de chaque doigt |

### Stabilisation

Pour éviter le flickering et améliorer l'UX :
- **300ms** de délai avant d'afficher une nouvelle lettre détectée
- **1 seconde** de maintien pour valider la lettre
- Barre de progression visuelle

## 📊 Modèle ML

- **Architecture** : MLP (Multi-Layer Perceptron)
- **Accuracy** : ~97.7% sur le dataset de test
- **Format** : ONNX (converti depuis scikit-learn)
- **Taille** : 175 KB
- **Inférence** : ~5ms sur GPU, ~15ms sur CPU

## 🎯 Lettres supportées

A-Z sauf **J** et **Z** (nécessitent un mouvement, non détectables en image statique)

## 🧪 Tests

```bash
npm run lint      # ESLint
npm run build     # Vérification TypeScript + build
```

## 🤝 Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une PR.

## 📄 Licence

MIT - Maxime Martin © 2026

## 🔗 Contact

- [Site web](https://parle-avec-tes-mains.fr)
- [LinkedIn](https://www.linkedin.com/in/maxime-martin-090731aa/)
- [Email](mailto:maximemartin510@gmail.com)
