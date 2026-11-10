# Parle avec tes mains

Application web d'apprentissage de l'alphabet en langue des signes française (LSF) avec reconnaissance en temps réel par webcam.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Démo

[parle-avec-tes-mains.fr](https://parle-avec-tes-mains.fr)

## Fonctionnalités

### Modes de jeu

- **Pratique libre** — Apprentissage des 26 lettres sans contrainte de temps
- **Sprint A→Z** — Enchaînement de l'alphabet complet, chronométré
- **Duel** — Affrontement en temps réel entre deux joueurs

### Social

- **Système d'amis** — Ajout d'amis, statut en ligne temps réel
- **Invitations de duel** — Notifications instantanées
- **Leaderboard** — Classement des meilleurs temps

### Progression

- **XP et niveaux** — Système d'expérience basé sur la pratique
- **Badges** — Récompenses débloquées selon les accomplissements
- **Statistiques** — Suivi détaillé de la progression

### Confidentialité

Tout le traitement de l'image se fait localement dans le navigateur. Aucune donnée vidéo n'est transmise à un serveur.

## Architecture

```
Webcam → MediaPipe Hands → 21 landmarks → Feature extraction → ONNX model → Lettre prédite
```

1. MediaPipe Hands détecte 21 points clés de la main
2. Extraction de 87 features (coordonnées, distances, angles, courbures)
3. Classification par modèle ONNX exécuté côté client

## Stack technique

| Technologie | Usage |
|-------------|-------|
| Next.js 16 | Framework React, App Router |
| TypeScript | Typage statique |
| Tailwind CSS | Styles |
| Firebase | Authentification, Firestore, Realtime Database |
| Socket.io | Temps réel (présence, duels) |
| MediaPipe Hands | Détection des mains |
| ONNX Runtime Web | Inférence IA côté client |
| Framer Motion | Animations |
| Resend | Emails transactionnels |

## Installation

### Frontend

```bash
git clone https://github.com/cosmos510/parle-avec-tes-mains-v2.git
cd parle-avec-tes-mains-v2

npm install

cp .env.local.example .env.local
# Configurer les variables d'environnement

npm run dev
```

### Backend Socket.io (optionnel)

Le serveur Socket.io gère la présence en ligne et la synchronisation des duels. Déployable sur Raspberry Pi ou autre serveur.

```bash
cd server
npm install

cp .env.example .env
# Configurer Firebase Admin

npm run dev

# Production avec Docker
docker-compose up -d --build
```

## Structure

```
src/
├── app/
│   ├── page.tsx              # Landing
│   ├── play/                 # Hub de jeu
│   ├── practice/             # Pratique libre
│   ├── sprint/               # Sprint A→Z
│   ├── duel/                 # Duel temps réel
│   ├── friends/              # Gestion d'amis
│   ├── leaderboard/          # Classement
│   ├── profile/              # Profil utilisateur
│   ├── (auth)/               # Authentification
│   └── api/                  # API routes
├── components/
│   ├── layout/               # Navbar, Footer
│   ├── game/                 # Composants de jeu
│   └── ui/                   # Composants réutilisables
├── contexts/
│   ├── AuthContext.tsx       # État d'authentification
│   └── SocketContext.tsx     # État Socket.io
├── hooks/
│   └── useMediaPipeHands.ts  # Webcam + détection
└── lib/
    ├── firebase.ts           # Config Firebase
    ├── socket.ts             # Client Socket.io
    ├── onnx-classifier.ts    # Classification IA
    └── progression.ts        # XP, badges, niveaux

server/
├── src/
│   ├── index.ts              # Point d'entrée
│   └── handlers/             # Presence, Duel, Notifications
├── Dockerfile
└── docker-compose.yml
```

## Configuration

### Variables d'environnement frontend (.env.local)

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=

FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

RESEND_API_KEY=

NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=https://parle-avec-tes-mains.fr
```

### Variables d'environnement backend (server/.env)

```
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=https://parle-avec-tes-mains.fr,http://localhost:3000
FIREBASE_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

## Déploiement

### Frontend (Vercel)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/cosmos510/parle-avec-tes-mains-v2)

### Backend (Raspberry Pi)

```bash
rsync -avz --exclude 'node_modules' --exclude 'dist' --exclude '.env' \
  ./server/ pi@<IP>:~/parle-mains-server/

ssh pi@<IP>
cd ~/parle-mains-server
cp .env.example .env
nano .env

docker-compose up -d --build
```

## Roadmap

- [x] Détection des 26 lettres
- [x] Modes pratique et sprint
- [x] Système XP et badges
- [x] Authentification email et Google
- [x] Système d'amis
- [x] Duel temps réel
- [x] Leaderboard
- [ ] PWA et notifications push
- [ ] Statistiques avancées
- [ ] Vocabulaire étendu

## Licence

MIT

## Auteur

[Maxime Martin](https://github.com/cosmos510)
