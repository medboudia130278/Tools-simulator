# Tools Simulator

Application React/Vite pour visualiser un simulateur d'outillage energie ferroviaire.

## Demarrage local

```bash
npm install
npm run dev
```

## Build production

```bash
npm run build
```

## Deploiement GitHub

1. Cree un nouveau repository GitHub.
2. Depuis ce dossier, initialise Git si besoin :

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <URL_DU_REPO>
git push -u origin main
```

## Deploiement Vercel

1. Importe le repository GitHub dans Vercel.
2. Vercel detectera automatiquement un projet Vite.
3. Les reglages attendus sont :
   - Build command : `npm run build`
   - Output directory : `dist`
4. Lance le deploiement.

Le fichier `vercel.json` est deja ajoute pour forcer la sortie `dist` et gerer correctement les routes cote client.
