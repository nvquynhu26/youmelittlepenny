# Youmelittlepenny - Wealth Terminal

A high-density personal wealth terminal designed for cross-border financial management (Korea KRW & Vietnam VND).

## Deployment Guide (GitHub Pages in 2 minutes)

1. **Create Repository:**
   - Go to GitHub and create a new public/private repository (e.g., `youmelittlepenny`).

2. **Upload Files:**
   - Upload `index.html` to the root of the repository.

3. **Enable GitHub Pages:**
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment** > **Branch**, select `main` (or `master`) and `/ (root)`.
   - Click **Save**.
   - Your web app will be live immediately at `https://<your-username>.github.io/<repo-name>/`.

## Google Sheets Backend Setup

1. Open a new Google Sheet.
2. Go to **Extensions** > **Apps Script**.
3. Paste the contents of `Code.gs`.
4. Click **Deploy** > **New deployment**.
5. Select type: **Web app**.
   - Execute as: **Me**.
   - Who has access: **Anyone**.
6. Copy the resulting **Web App URL** and paste it into `index.html` replacing `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE`.
