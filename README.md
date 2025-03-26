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
git clone [url-du-repo]
```

2. Installez les dépendances

```bash
npm install
```

3. Lancez l'application

```bash
npx expo start
```

4. Scannez le QR code avec l'application Expo Go (disponible sur iOS et Android)
   ou ouvrez-le dans un émulateur/simulateur

## Structure du projet

- `app/` : Pages et navigation de l'application
- `lib/` : Services et utilitaires (Firebase)
- `components/` : Composants réutilisables
- `assets/` : Images et ressources statiques

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à proposer des améliorations ou signaler des bugs.

---

Développé avec 💜 et 💚 par les équipes Alpha et Beta
