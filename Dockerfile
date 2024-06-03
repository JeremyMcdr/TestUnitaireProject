# Utilisez une image Node.js officielle comme image de base
FROM node:16-alpine

# Définir le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copier les fichiers package.json et package-lock.json dans le répertoire de travail
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tous les fichiers du projet dans le répertoire de travail du conteneur
COPY . .

# Exposer le port sur lequel l'application va écouter
EXPOSE 5000

# Démarrer l'application
CMD ["node", "app.js"]