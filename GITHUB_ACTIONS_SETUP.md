# GitHub Actions Setup Guide

## 🔧 Setup Instructions

### 1. Add your Riot API Key to GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `RIOT_API_KEY`
5. Value: Your Riot API key from [https://developer.riotgames.com/](https://developer.riotgames.com/)
6. Click **Add secret**

### 2. Update Friends List (Optional)

Edit `scripts/fetch-riot-data.js` and update the `FRIENDS` array with your friends' names:

```javascript
const FRIENDS = [
    "YourFriendName#EUW",
    "AnotherFriend#EUW"
];
```

### 3. How It Works

- **Every 6 hours**: GitHub Actions automatically fetches player data using your API key
- **Saves as JSON**: Data is cached in `data/players-cache.json`
- **Commits to repo**: Changes are auto-committed back to your repository
- **GitHub Pages loads it**: Your public site loads the cached data (no API key exposure)

### 4. Manual Updates

You can also manually trigger the workflow:

1. Go to **Actions** tab in your repo
2. Select **"Update Riot Player Data"** workflow
3. Click **"Run workflow"** → **"Run workflow"**

### 5. Updating API Key (Every 24 hours)

Since Riot API keys expire after 24 hours:

1. Generate a new key at [https://developer.riotgames.com/](https://developer.riotgames.com/)
2. Update the secret in GitHub (Settings → Secrets → Edit `RIOT_API_KEY`)
3. GitHub Actions will use the new key automatically on the next run

## 📝 Notes

- API key is **never exposed** - it stays secure in GitHub Secrets
- Only the cached JSON data is visible in the repository
- Your site remains completely **public** without security risks
- Cached data updates every 6 hours automatically
