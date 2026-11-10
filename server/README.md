# Parle avec tes mains - Socket.io Server

Serveur temps réel pour la gestion de la présence, des duels et des notifications.

## Features

- 🟢 **Présence** - Statut en ligne des utilisateurs
- ⚔️ **Duels** - Matchmaking et synchronisation temps réel
- 🔔 **Notifications** - Invitations et alertes push

## Déploiement sur Raspberry Pi

### 1. Prérequis

```bash
# Installer Docker sur le Raspberry
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Logout/login pour appliquer les permissions
```

### 2. Copier les fichiers

```bash
# Depuis ton Mac
rsync -avz --exclude 'node_modules' --exclude 'dist' \
  ./server/ pi@<RASPBERRY_IP>:~/parle-mains-server/
```

### 3. Configurer Firebase

Télécharge le fichier service account depuis la console Firebase :
- Firebase Console > Project Settings > Service Accounts > Generate new private key

```bash
# Sur le Raspberry, créer le .env
cd ~/parle-mains-server
cp .env.example .env

# Option 1: Copier le JSON directement dans .env
# Option 2: Monter le fichier (décommenter le volume dans docker-compose.yml)
```

### 4. Lancer le serveur

```bash
cd ~/parle-mains-server
docker-compose up -d --build

# Vérifier les logs
docker-compose logs -f

# Health check
curl http://localhost:3001/health
```

### 5. Exposer le serveur (optionnel)

Pour accéder depuis l'extérieur, utilise un reverse proxy comme Caddy ou nginx avec HTTPS.

Exemple avec Caddy :
```
socket.tondomaine.fr {
    reverse_proxy localhost:3001
}
```

## Développement local

```bash
npm install
npm run dev
```

## API Events

### Présence
- `presence:online` - Signaler sa présence
- `presence:offline` - Signaler déconnexion
- `presence:check` - Vérifier statut d'utilisateurs
- `user:online` / `user:offline` - Notifications de statut

### Duel
- `duel:create` - Créer une room
- `duel:join` - Rejoindre une room
- `duel:ready` - Toggle prêt
- `duel:start` - Lancer le countdown
- `duel:score` - Enregistrer un score
- `duel:leave` - Quitter la room

### Notifications
- `notification:duel_invite` - Envoyer invitation duel
- `notification:friend_request` - Demande d'ami
- `notification:friend_accepted` - Ami accepté
