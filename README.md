# Youmelittlepenny

A high-density, real-time personal wealth management terminal designed for dual-market finance (South Korea KRW & Vietnam VND).

## 🚀 Quick Deployment to GitHub Pages

1. **Create Repository:**
   - Create a new public or private repository on GitHub (e.g., `youmelittlepenny`).
2. **Upload Files:**
   - Upload all files from this package (`index.html`, `App.jsx`, `README.md`) directly to the root of your repository.
3. **Enable GitHub Pages:**
   - Go to **Settings** > **Pages** in your repository.
   - Under **Build and deployment** > **Source**, select `Deploy from a branch`.
   - Select branch `main` and folder `/ (root)`, then click **Save**.
   - Your terminal will be live at `https://<your-username>.github.io/<repo-name>/`.

---

## ⚡ Google Apps Script (GAS) Backend Setup

1. Open [Google Sheets](https://sheets.new) and create a new spreadsheet.
2. In the top menu, go to **Extensions** > **Apps Script**.
3. Replace the entire contents of `Code.gs` with the provided `Code.gs` in this repository.
4. Click **Deploy** > **New deployment**:
   - Select type: **Web app**.
   - Description: `Youmelittlepenny API`.
   - Execute as: **Me**.
   - Who has access: **Anyone** (allows seamless background sync from GitHub Pages).
5. Click **Deploy** and copy the generated **Web App URL**.
6. In `App.jsx`, replace:
   ```javascript
   const WEB_APP_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
   ```
   with your actual copied Web App URL and commit the change.

---

## 💎 Features
- **Strict Separation of Portfolio Visualizations:** Switch between **Total Net Worth** (single curve) and **4 Asset Classes** (4 distinct lines) with a single button click.
- **Dual-Market Precision:** Direct support for South Korea banking (예금/적금/굴비 with partial withdrawals and 15.4% tax) and Vietnam banking (term deposits, MBBOND/MBAM funds, and real estate equity).
- **Strict Monospace Terminal UI:** Pure Bloomberg / Wealthfront aesthetics with English/Korean localization toggle and zero clutter.
