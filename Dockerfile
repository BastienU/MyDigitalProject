# backend/Dockerfile

FROM node:20

# Création du dossier de travail
WORKDIR /app

# Copie des fichiers package.json + package-lock.json
COPY package*.json ./
COPY package-lock.json ./

# Installation des dépendances
RUN npm install

# Copie des fichiers prisma
COPY prisma ./prisma/

# Generation des fichiers prisma
RUN npx prisma generate

# Copie du code source
COPY . .

# Port exposé par Express
EXPOSE 3000

# Variable d'environnement
ENV PORT 3000

# Commande de lancement
CMD ["node", "app.js"]