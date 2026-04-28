# Inaxel · Dashboard KPI Produits & qualité

Dashboard de pilotage NAXI.G avec données Notion synchronisées automatiquement.

## 🚀 Premier déploiement

### 1. Pousser le code sur GitHub

Dans ton terminal, à la racine de ce dossier :

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TON-USERNAME/inaxel-kpi.git
git push -u origin main
```

> ⚠️ Remplace `TON-USERNAME` par ton nom d'utilisateur GitHub.
> ⚠️ Si le repo s'appelle autrement que `inaxel-kpi`, modifie aussi `vite.config.js` (ligne `base:`).

### 2. Configurer le secret NOTION_TOKEN

Sur GitHub, va sur ton repo :

1. Onglet **Settings** → menu de gauche **Secrets and variables** → **Actions**
2. Clique sur **New repository secret**
3. **Name** : `NOTION_TOKEN`
4. **Secret** : ton token Notion (commence par `ntn_` ou `secret_`)
5. **Add secret**

### 3. Activer GitHub Pages

Sur ton repo :

1. Onglet **Settings** → menu de gauche **Pages**
2. Sous **Source**, choisis **GitHub Actions** (pas "Deploy from a branch")
3. Sauvegarde

### 4. Premier sync manuel

Sur ton repo :

1. Onglet **Actions**
2. Clique sur le workflow **"Sync Notion data"** (dans la liste de gauche)
3. Bouton **Run workflow** → **Run workflow**
4. Attends ~30 secondes que le job se termine (icône verte ✓)

Ce premier run va :
- Interroger Notion via l'API
- Générer `public/data.json`
- Le commit + push automatiquement
- Déclencher le workflow de déploiement

### 5. Accéder au dashboard

Une fois le déploiement terminé (vérifie l'onglet Actions → workflow "Deploy to GitHub Pages") :

→ **https://TON-USERNAME.github.io/inaxel-kpi/**

Identifiants :
- **ID** : `Inaxel`
- **Mot de passe** : `InaxelKPI`

## 🔄 Synchronisation automatique

Le cron tourne **tous les jours ouvrés (Lun-Ven) à 12h heure de Paris** (10h UTC en été).

Tu peux aussi lancer un sync manuel à tout moment via **Actions** → **Sync Notion data** → **Run workflow**.

## 🛠 Développement local

```bash
npm install
NOTION_TOKEN=ntn_xxx npm run fetch-notion  # Génère public/data.json
npm run dev                                 # Lance le serveur de dev sur localhost:5173
```

## 📁 Structure

```
inaxel-kpi/
├── src/
│   ├── main.jsx              # Entry point React
│   └── Dashboard.jsx         # Composant dashboard complet
├── scripts/
│   └── fetch-notion.js       # Script de fetch Notion → data.json
├── public/
│   └── data.json             # Données Notion (généré par le cron)
├── .github/workflows/
│   ├── sync.yml              # Cron Notion → data.json
│   └── deploy.yml            # Déploiement GitHub Pages
├── package.json
├── vite.config.js
└── index.html
```

## 🐛 Dépannage

**Le workflow Sync échoue avec "401 Unauthorized"** :
→ Le token Notion est invalide ou expiré. Recrée-en un et mets-le à jour dans Secrets.

**Le workflow Sync échoue avec "object_not_found"** :
→ L'intégration Notion n'a pas accès à une des bases. Va sur la base dans Notion → ⋯ → Connections → Connecter ton intégration.

**La page est blanche après déploiement** :
→ Vérifie que `vite.config.js` a bien `base: '/inaxel-kpi/'` correspondant au nom du repo.

**data.json est vide ou pas à jour** :
→ Lance manuellement le workflow Sync Notion data (onglet Actions).
