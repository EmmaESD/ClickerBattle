# Clicker Battle

Un jeu de clics compétitif en temps réel où deux équipes s'affrontent pour atteindre la domination du clic !

## À propos du jeu

Clicker Battle est un jeu multijoueur en temps réel où les joueurs sont divisés en deux équipes : Alpha et Beta. Chaque joueur contribue au score de son équipe en cliquant sur un bouton. L'équipe avec le plus de clics domine la barre de progression.

### Caractéristiques principales

- **Compétition en temps réel** : Voyez la progression des équipes mise à jour instantanément
- **Système de bonus** : Débloquez des auto-clickers après 10 clics manuels
- **Interface réactive** : Animations fluides et retours visuels
- **Visualisation des joueurs actifs** : Observez en temps réel qui contribue à chaque équipe

## Comment jouer

1. Lancez l'application
2. Entrez votre pseudo
3. Choisissez votre équipe (Alpha ou Beta)
4. Cliquez autant que possible pour faire gagner votre équipe
5. Après 10 clics, vous pouvez activer un bonus d'auto-click
6. Observez la barre de progression pour voir quelle équipe est en tête

## Technologies utilisées

### Frontend
- **React Native** : Framework cross-platform pour le développement mobile
- **Expo** : Plateforme pour simplifier le développement React Native
- **React Navigation** : Navigation entre les écrans de l'application
- **Reanimated** : Animations fluides pour l'interface utilisateur

### Backend
- **Firebase** : 
  - **Firestore** : Base de données NoSQL en temps réel
  - **Authentification** : Gestion des utilisateurs (pseudo)

### Autres
- **TypeScript** : Typage statique pour un code plus robuste
- **Expo Router** : Navigation basée sur les fichiers

## Installation et démarrage

1. Clonez le dépôt

```bash
git clone https://github.com/EmmaESD/ClickerBattle.git
```

2. Installez les dépendances

```bash
npm install
```

3. Lancez l'application

```bash
npm start
```

4. Scannez le QR code avec l'application Expo Go (disponible sur iOS et Android)
   ou ouvrez-le dans un émulateur/simulateur

## Configuration Firebase personnalisée

Pour utiliser votre propre backend Firebase avec cette application :

1. Créez un projet sur [Firebase Console](https://console.firebase.google.com/)

2. Activez Firestore Database dans votre projet Firebase

3. Remplacez la configuration Firebase dans le fichier `lib/database.ts` :
```typescript
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_AUTH_DOMAIN",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_STORAGE_BUCKET",
  messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
  appId: "VOTRE_APP_ID"
};
```

4. Créez la structure de base de données suivante dans Firestore :
   - Une collection `game` avec un document `scores` contenant :
     ```
     {
       alpha: 0,
       beta: 0,
       players: {}
     }
     ```
   - Une collection `activePlayers` qui stockera les joueurs en ligne

## Structure du projet

- `app/` : Pages et navigation de l'application
- `lib/` : Services et utilitaires (Firebase)
- `components/` : Composants réutilisables
- `assets/` : Images et ressources statiques

#
Développé avec 💜 et 💚 par Emma VAYSSE
