# Youmelittlepenny Terminal - Deployment Guide

## 1. Google Apps Script Backend (`Code.gs`)
1. Open [Google Sheets](https://sheets.new) and create a new spreadsheet named `Youmelittlepenny_DB`.
2. Go to **Extensions** > **Apps Script**.
3. Replace the entire content of `Code.gs` with the code in `Code.gs`.
4. Click **Deploy** > **New deployment**.
5. Select **Web app**:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
6. Click **Deploy**, authorize permissions, and copy the **Web app URL**.
7. In `index.html`, replace `YOUR_GAS_ENDPOINT` inside `const WEB_APP_URL = "..."` with your copied URL.

## 2. Deploy to GitHub Pages
1. Create a new GitHub repository named `youmelittlepenny` (or `youmelittlepenny.github.io`).
2. Push or upload `index.html` to the repository root (`main` branch).
3. Go to repository **Settings** > **Pages**.
4. Under **Branch**, select `main` and `/ (root)`, then click **Save**.
5. Your terminal will be live at `https://<your-username>.github.io/youmelittlepenny/` within 1-2 minutes!
