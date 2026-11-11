const { useState, useEffect, useMemo } = React;

// --- CONFIGURATION & PLACEHOLDERS ---
// PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE:
const DEFAULT_GAS_URL = "https://script.google.com/macros/s/AKfycbwQz1PyeKueLdjmxfcvU7wyK57LHjdwpVmyDADi3v5FuUwG74g9oVO57pfnZl_C_p1ppw/exec";
const ACCESS_PASSWORD = "$1Million";

// --- LOCALIZATION DICTIONARY ---
const I18N = {
  en: {
    appTitle: "Youmelittlepenny",
    locked: "System Locked",
    enterPass: "Enter master access key",
    unlock: "Unlock",
    wrongPass: "Access Denied",
    netWorth: "Net Worth",
    assets: "Total Assets",
    liabilities: "Total Liabilities",
    fxRates: "Live FX Rates",
    krwVnd: "KRW/VND",
    usdVnd: "USD/VND",
    usdKrw: "USD/KRW",
    baseCurr: "Base Currency",
    syncDrive: "Sync to Drive",
    synced: "Synced to Drive",
    syncing: "Syncing...",
    tabs: {
      dash: "Dashboard",
      krw: "Korea Finance",
      vnd: "Vietnam Finance",
      inv: "Investments",
      assets: "Other Assets",
      debts: "Liabilities",
      ledger: "Transactions",
      analytics: "Financial Analytics",
      history: "Audit Ledger",
      settings: "Settings"
    },
    actions: {
      add: "Add Entry",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      reset: "Restore Defaults",
      withdrawPartial: "Partial Early Withdrawal",
      liquidate: "Liquidate Early",
      fetchNav: "Fetch Live NAV",
      history: "History"
    },
    types: {
      income: "Income",
      expense: "Expense",
      transfer: "Transfer",
      lend: "Lend",
      borrow: "Borrow",
      adjust: "Balance Adjustment"
    }
  },
  ko: {
    appTitle: "Youmelittlepenny",
    locked: "보안 잠금",
    enterPass: "접속 암호를 입력하십시오",
    unlock: "잠금 해제",
    wrongPass: "암호가 틀렸습니다",
    netWorth: "순자산",
    assets: "총자산",
    liabilities: "총부채",
    fxRates: "실시간 환율",
    krwVnd: "원/동",
    usdVnd: "달러/동",
    usdKrw: "달러/원",
    baseCurr: "기준 통화",
    syncDrive: "드라이브 동기화",
    synced: "동기화 완료",
    syncing: "동기화 중...",
    tabs: {
      dash: "대시보드",
      krw: "한국 금융",
      vnd: "베트남 금융",
      inv: "투자 펀드",
      assets: "기타 자산",
      debts: "부채 관리",
      ledger: "수입 지출 장부",
      analytics: "재무 분석",
      history: "전체 내역",
      settings: "설정"
    },
    actions: {
      add: "항목 추가",
      save: "저장",
      delete: "삭제",
      edit: "수정",
      reset: "초기값 복원",
      withdrawPartial: "중도인출",
      liquidate: "중도해지",
      fetchNav: "실시간 NAV 조회",
      history: "이력"
    },
    types: {
      income: "수입",
      expense: "지출",
      transfer: "계좌이체",
      lend: "빌려줌",
      borrow: "빌림",
      adjust: "잔액조정"
    }
  }
};

// --- DEFAULT INITIAL STATE ---
const INITIAL_DATA = {
  gasUrl: DEFAULT_GAS_URL,
  fx: { KRW_VND: 18.5, USD_VND: 25400, USD_KRW: 1375 },
  krw: {
    parking: [
      { id: "kp1", bank: "Toss Bank", balance: 500000, rate: 2.0, note: "Daily interest parking" }
    ],
    subPots: [
      { id: "ksp1", parentId: "kp1", name: "Emergency Buffer", balance: 100000 }
    ],
    savings: [
      { 
        id: "ks1", bank: "Kookmin", type: "예금", principal: 9000000, currentAccumulated: 9000000,
        rate: 3.0, taxRate: 15.4, startDate: "2026-05-09", maturityDate: "2027-05-09",
        withdrawCount: 0, earlyRate: 0.5, manualFinal: 0, note: "Annual May 9 ladder"
      },
      { 
        id: "ks2", bank: "Shinhan", type: "적금", principal: 865000, currentAccumulated: 865000,
        rate: 1.4, taxRate: 15.4, startDate: "2026-05-09", maturityDate: "2027-05-09",
        withdrawCount: 0, earlyRate: 0.5, manualFinal: 0, note: "Education & PhD reserve"
      }
    ]
  },
  vnd: {
    parking: [
      { id: "vp1", bank: "MBBank", balance: 3000000, rate: 0.2, note: "Daily spending buffer" }
    ],
    savings: [
      { 
        id: "vs1", bank: "MBBank", type: "Term Deposit", term: "12M", principal: 7000000,
        rate: 4.3, startDate: "2026-05-09", maturityDate: "2027-05-09", earlyRate: 0.2,
        manualFinal: 0, note: "Long term target"
      },
      { 
        id: "vs2", bank: "MBBank", type: "Flexible Goal", term: "Annual", principal: 14000000,
        rate: 6.2, startDate: "2026-05-09", maturityDate: "2027-05-09", earlyRate: 0.2,
        manualFinal: 0, note: "Tenant security deposit escrow"
      }
    ]
  },
  investments: [
    { id: "inv1", code: "MBBOND", units: 42.5, buyNav: 23500, currentNav: 24200, lastUpdated: "2026-11-10", history: [23500, 23700, 23900, 24100, 24200] },
    { id: "inv2", code: "MBAM", units: 25.0, buyNav: 19800, currentNav: 20400, lastUpdated: "2026-11-10", history: [19800, 19950, 20100, 20300, 20400] }
  ],
  otherAssets: [
    { id: "oa1", name: "High-Rise Condo Unit", address: "District 7, HCMC, Vietnam", buyDate: "2023-01-15", buyPrice: 2000000000, currentValuation: 2150000000, currency: "VND", fundedFrom: "Personal Cash", soldDate: "" },
    { id: "oa2", name: "Seoul Housing Key Deposit", address: "Seoul Metro Area", buyDate: "2024-03-01", buyPrice: 8000000, currentValuation: 8000000, currency: "KRW", fundedFrom: "Personal Cash", soldDate: "" }
  ],
  liabilities: [
    { id: "liab1", name: "Tenant Rental Deposit Held", debtorPayee: "Apartment Tenant", amount: 14000000, currency: "VND", dueDate: "2027-05-09", note: "Must refund upon lease end. Offsets escrow saving." }
  ],
  transactions: [
    { id: "tx1", date: "2026-11-01", type: "Income", category: "Salary", amount: 2414477, currency: "KRW", account: "Toss Bank", payee: "Design Agency", fee: 0, note: "Monthly primary salary" },
    { id: "tx2", date: "2026-11-05", type: "Income", category: "Rental", amount: 7300000, currency: "VND", account: "MBBank", payee: "Tenant", fee: 0, note: "Apartment rent collected" },
    { id: "tx3", date: "2026-11-06", type: "Expense", category: "Education", amount: 3300000, currency: "VND", account: "MBBank", payee: "Language Academy", fee: 0, note: "Spanish language tuition" }
  ],
  categories: ["Salary", "Rental", "Living", "Education", "Food", "Transport", "Investment", "Misc"],
  auditLogs: []
};

// --- APP COMPONENT ---
function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("ymp_auth") === "true");
  const [passInput, setPassInput] = useState("");
  const [lang, setLang] = useState("en");
  const [activeTab, setActiveTab] = useState("dash");
  const [baseCurr, setBaseCurr] = useState("VND");
  const [syncStatus, setSyncStatus] = useState("idle");
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("youmelittlepenny_data");
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const t = I18N[lang];

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem("youmelittlepenny_data", JSON.stringify(data));
  }, [data]);

  // Fetch Live FX from Free Exchange API on mount
  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then(res => res.json())
      .then(d => {
        if (d && d.rates) {
          const usdKrw = d.rates.KRW || 1375;
          const usdVnd = d.rates.VND || 25400;
          const krwVnd = +(usdVnd / usdKrw).toFixed(4);
          setData(prev => ({
            ...prev,
            fx: { KRW_VND: krwVnd, USD_VND: Math.round(usdVnd), USD_KRW: Math.round(usdKrw) }
          }));
        }
      })
      .catch(() => console.log("Using cached FX rates"));
  }, []);

  // Conversion Helpers
  const toVND = (amount, cur) => {
    if (cur === "VND") return amount;
    if (cur === "KRW") return amount * data.fx.KRW_VND;
    if (cur === "USD") return amount * data.fx.USD_VND;
    return amount;
  };

  const convertFromVND = (amountVnd, targetCur) => {
    if (targetCur === "VND") return amountVnd;
    if (targetCur === "KRW") return amountVnd / data.fx.KRW_VND;
    if (targetCur === "USD") return amountVnd / data.fx.USD_VND;
    return amountVnd;
  };

  const formatCurr = (amount, cur) => {
    const sym = cur === "VND" ? "₫" : cur === "KRW" ? "₩" : "$";
    const decimals = cur === "USD" ? 2 : 0;
    return `${sym} ${Number(amount || 0).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  };

  // --- CORE TOTALS & NET WORTH CALCULATION ---
  const totals = useMemo(() => {
    // 1. Korea Assets (KRW)
    const krwParking = data.krw.parking.reduce((s, a) => s + Number(a.balance || 0), 0);
    const krwSubpots = data.krw.subPots.reduce((s, a) => s + Number(a.balance || 0), 0);
    const krwSavings = data.krw.savings.reduce((s, a) => s + Number(a.currentAccumulated || a.principal || 0), 0);
    const totalKrwAssets = krwParking + krwSubpots + krwSavings;

    // 2. Vietnam Assets (VND)
    const vndParking = data.vnd.parking.reduce((s, a) => s + Number(a.balance || 0), 0);
    const vndSavings = data.vnd.savings.reduce((s, a) => s + Number(a.principal || 0), 0);
    const totalVndCash = vndParking + vndSavings;

    // 3. Investments (CCQ - VND)
    const totalInvestments = data.investments.reduce((s, i) => s + (Number(i.units || 0) * Number(i.currentNav || 0)), 0);

    // 4. Other Assets (Real estate, gold)
    const totalOtherAssetsVND = data.otherAssets
      .filter(a => !a.soldDate)
      .reduce((s, a) => s + toVND(Number(a.currentValuation || 0), a.currency), 0);

    // 5. Total Assets in VND
    const totalAssetsVND = toVND(totalKrwAssets, "KRW") + totalVndCash + totalInvestments + totalOtherAssetsVND;

    // 6. Liabilities in VND
    const totalLiabilitiesVND = data.liabilities.reduce((s, l) => s + toVND(Number(l.amount || 0), l.currency), 0);

    // Net Worth in VND
    const netWorthVND = totalAssetsVND - totalLiabilitiesVND;

    return {
      totalKrwAssets,
      totalVndCash,
      totalInvestments,
      totalOtherAssetsVND,
      totalAssetsVND,
      totalLiabilitiesVND,
      netWorthVND,
      netWorthKRW: netWorthVND / data.fx.KRW_VND,
      netWorthUSD: netWorthVND / data.fx.USD_VND
    };
  }, [data]);

  // Auth Handler
  const handleLogin = (e) => {
    e.preventDefault();
    if (passInput === ACCESS_PASSWORD) {
      sessionStorage.setItem("ymp_auth", "true");
      setAuthed(true);
    } else {
      alert(t.wrongPass);
    }
  };

  // Google Apps Script Sync
  const syncToDrive = async () => {
    setSyncStatus("syncing");
    const payload = {
      timestamp: new Date().toISOString(),
      netWorthUSD: Math.round(totals.netWorthUSD),
      netWorthKRW: Math.round(totals.netWorthKRW),
      netWorthVND: Math.round(totals.netWorthVND),
      totalAssetsVND: Math.round(totals.totalAssetsVND),
      totalLiabilitiesVND: Math.round(totals.totalLiabilitiesVND),
      transactions: data.transactions,
      krw: data.krw,
      vnd: data.vnd,
      investments: data.investments,
      otherAssets: data.otherAssets,
      liabilities: data.liabilities
    };

    try {
      await fetch(data.gasUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setSyncStatus("synced");
      setTimeout(() => setSyncStatus("idle"), 4000);
      alert("Synced to Google Drive / Finance / Report!");
    } catch (err) {
      setSyncStatus("idle");
      alert("Sync failed: Check your Google Apps Script URL in Settings.");
    }
  };

  // Audit Log Adder
  const logAudit = (accountName, actionType, amount, currency, detail) => {
    const newLog = {
      id: "log_" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      accountName,
      actionType,
      amount,
      currency,
      detail
    };
    setData(prev => ({
      ...prev,
      auditLogs: [newLog, ...(prev.auditLogs || [])]
    }));
  };

  if (!authed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black p-4">
        <div className="w-full max-w-sm p-8 bg-[#090910] border border-cyan-500/30 rounded-xl shadow-[0_0_20px_rgba(0,242,254,0.15)] text-center">
          <h1 className="text-2xl font-bold tracking-wider neon-cyan mb-2">Youmelittlepenny</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-6">{t.locked}</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder={t.enterPass} 
              value={passInput} 
              onChange={e => setPassInput(e.target.value)} 
              className="w-full px-4 py-2 text-center text-sm rounded bg-[#030307] border border-gray-700 text-white focus:border-cyan-400"
            />
            <button type="submit" className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded text-sm transition">
              {t.unlock}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-slate-200">
      {/* --- TOP PERSISTENT NAVBAR --- */}
      <header className="sticky top-0 z-40 bg-[#090912]/90 backdrop-blur border-b border-gray-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg tracking-wider neon-cyan">Youmelittlepenny</span>
          <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">CYBERFIN 2026</span>
        </div>

        {/* Live FX Ticker */}
        <div className="flex items-center gap-4 text-xs font-mono bg-[#030307] px-3 py-1.5 rounded border border-gray-800">
          <span className="text-gray-500 font-semibold">{t.fxRates}:</span>
          <span>KRW/VND: <strong className="neon-lime">{data.fx.KRW_VND}</strong></span>
          <span>USD/VND: <strong className="neon-cyan">{data.fx.USD_VND.toLocaleString()}</strong></span>
          <span>USD/KRW: <strong className="neon-amber">{data.fx.USD_KRW.toLocaleString()}</strong></span>
        </div>

        {/* Quick Actions & Currency Switcher */}
        <div className="flex items-center gap-2">
          <select 
            value={baseCurr} 
            onChange={e => setBaseCurr(e.target.value)} 
            className="text-xs px-2 py-1 rounded bg-[#0e0e17] text-cyan-400 border border-gray-700 font-mono"
          >
            <option value="VND">VND (₫)</option>
            <option value="KRW">KRW (₩)</option>
            <option value="USD">USD ($)</option>
          </select>

          <button 
            onClick={() => setLang(l => l === "en" ? "ko" : "en")} 
            className="text-xs px-2 py-1 rounded border border-gray-700 hover:border-cyan-400 font-mono uppercase"
          >
            {lang === "en" ? "KO" : "EN"}
          </button>

          <button 
            onClick={syncToDrive} 
            className="text-xs px-3 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-900 transition flex items-center gap-1 font-mono"
          >
            {syncStatus === "syncing" ? t.syncing : t.syncDrive}
          </button>
        </div>
      </header>

      {/* --- SUB-HEADER: GLOBAL NET WORTH DISPLAY --- */}
      <section className="bg-[#080811] border-b border-gray-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">{t.netWorth}</span>
            <div className="text-3xl font-black font-mono neon-cyan">
              {formatCurr(convertFromVND(totals.netWorthVND, baseCurr), baseCurr)}
            </div>
            <div className="text-xs text-gray-400 flex gap-3 mt-1 font-mono">
              <span>≈ {formatCurr(totals.netWorthVND, "VND")}</span>
              <span>≈ {formatCurr(totals.netWorthKRW, "KRW")}</span>
              <span>≈ {formatCurr(totals.netWorthUSD, "USD")}</span>
            </div>
          </div>

          <div className="flex gap-6 text-sm font-mono">
            <div className="bg-[#0e0e17] px-4 py-2 rounded border border-gray-800">
              <span className="text-[10px] text-gray-500 uppercase block">{t.assets}</span>
              <span className="neon-lime font-bold">{formatCurr(convertFromVND(totals.totalAssetsVND, baseCurr), baseCurr)}</span>
            </div>
            <div className="bg-[#0e0e17] px-4 py-2 rounded border border-gray-800">
              <span className="text-[10px] text-gray-500 uppercase block">{t.liabilities}</span>
              <span className="neon-pink font-bold">{formatCurr(convertFromVND(totals.totalLiabilitiesVND, baseCurr), baseCurr)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- TAB NAVIGATION BAR --- */}
      <nav className="bg-[#07070d] border-b border-gray-800 px-4 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex gap-1 py-1">
          {Object.entries(t.tabs).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 py-2 text-xs font-mono tracking-wide rounded-t whitespace-nowrap transition ${
                activeTab === key
                  ? "bg-[#0f0f1c] text-cyan-400 border-b-2 border-cyan-400 font-bold"
                  : "text-gray-400 hover:text-gray-200 hover:bg-[#0c0c16]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* --- MAIN WORKSPACE --- */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === "dash" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-[#090912] border border-gray-800 rounded-lg">
                <span className="text-xs text-gray-500 font-mono block">Korea Liquid (KRW)</span>
                <span className="text-xl font-bold font-mono neon-amber">{formatCurr(totals.totalKrwAssets, "KRW")}</span>
              </div>
              <div className="p-4 bg-[#090912] border border-gray-800 rounded-lg">
                <span className="text-xs text-gray-500 font-mono block">Vietnam Liquid (VND)</span>
                <span className="text-xl font-bold font-mono neon-cyan">{formatCurr(totals.totalVndCash, "VND")}</span>
              </div>
              <div className="p-4 bg-[#090912] border border-gray-800 rounded-lg">
                <span className="text-xs text-gray-500 font-mono block">CCQ Funds (VND)</span>
                <span className="text-xl font-bold font-mono neon-lime">{formatCurr(totals.totalInvestments, "VND")}</span>
              </div>
              <div className="p-4 bg-[#090912] border border-gray-800 rounded-lg">
                <span className="text-xs text-gray-500 font-mono block">Real Estate / Gold (VND)</span>
                <span className="text-xl font-bold font-mono text-purple-400">{formatCurr(totals.totalOtherAssetsVND, "VND")}</span>
              </div>
            </div>

            {/* Visual Allocation Summary */}
            <div className="p-6 bg-[#090912] border border-gray-800 rounded-lg space-y-4">
              <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider">Asset Distribution Breakdown</h3>
              <div className="w-full bg-gray-900 h-4 rounded-full flex overflow-hidden border border-gray-800">
                <div style={{ width: `${(toVND(totals.totalOtherAssetsVND, "VND") / totals.totalAssetsVND * 100) || 0}%` }} className="bg-purple-500" title="Real Estate"></div>
                <div style={{ width: `${(toVND(totals.totalKrwAssets, "KRW") / totals.totalAssetsVND * 100) || 0}%` }} className="bg-amber-400" title="KRW Cash"></div>
                <div style={{ width: `${(totals.totalVndCash / totals.totalAssetsVND * 100) || 0}%` }} className="bg-cyan-400" title="VND Cash"></div>
                <div style={{ width: `${(totals.totalInvestments / totals.totalAssetsVND * 100) || 0}%` }} className="bg-lime-400" title="CCQ Funds"></div>
              </div>
              <div className="flex flex-wrap gap-4 text-xs font-mono text-gray-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span> Real Estate: {((totals.totalOtherAssetsVND / totals.totalAssetsVND) * 100).toFixed(1)}%</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> KRW Accounts: {((toVND(totals.totalKrwAssets, "KRW") / totals.totalAssetsVND) * 100).toFixed(1)}%</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span> VND Accounts: {((totals.totalVndCash / totals.totalAssetsVND) * 100).toFixed(1)}%</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-lime-400 inline-block"></span> Investments: {((totals.totalInvestments / totals.totalAssetsVND) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KOREA FINANCE */}
        {activeTab === "krw" && (
          <div className="space-y-6">
            {/* Parking & Subpots */}
            <div className="p-5 bg-[#090912] border border-gray-800 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold font-mono neon-amber uppercase">Parking & Sub-Pots (파킹통장 / 나눠모으기)</h3>
                <button 
                  onClick={() => {
                    const newId = "kp_" + Date.now();
                    setData(p => ({
                      ...p,
                      krw: { ...p.krw, parking: [...p.krw.parking, { id: newId, bank: "New Bank", balance: 0, rate: 2.0, note: "" }] }
                    }));
                  }}
                  className="text-xs px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-mono"
                >
                  + Add Parking
                </button>
              </div>

              {data.krw.parking.map(p => (
                <div key={p.id} className="p-4 bg-[#0c0c16] border border-gray-800 rounded space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div>
                      <label className="text-gray-500 block">Bank Name</label>
                      <input 
                        type="text" 
                        value={p.bank} 
                        onChange={e => {
                          const val = e.target.value;
                          setData(prev => ({
                            ...prev,
                            krw: { ...prev.krw, parking: prev.krw.parking.map(x => x.id === p.id ? { ...x, bank: val } : x) }
                          }));
                        }}
                        className="w-full px-2 py-1 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 block">Balance (₩)</label>
                      <input 
                        type="number" 
                        value={p.balance} 
                        onChange={e => {
                          const val = Number(e.target.value);
                          setData(prev => ({
                            ...prev,
                            krw: { ...prev.krw, parking: prev.krw.parking.map(x => x.id === p.id ? { ...x, balance: val } : x) }
                          }));
                        }}
                        className="w-full px-2 py-1 rounded font-bold neon-amber"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 block">Daily Yield (%)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={p.rate} 
                        onChange={e => {
                          const val = Number(e.target.value);
                          setData(prev => ({
                            ...prev,
                            krw: { ...prev.krw, parking: prev.krw.parking.map(x => x.id === p.id ? { ...x, rate: val } : x) }
                          }));
                        }}
                        className="w-full px-2 py-1 rounded"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <button 
                        onClick={() => {
                          const name = prompt("Sub-pot name (나눠모으기 이름):", "Study / Goal");
                          const amount = Number(prompt("Transfer from parking balance:", "50000"));
                          if (name && amount > 0 && amount <= p.balance) {
                            setData(prev => ({
                              ...prev,
                              krw: {
                                ...prev.krw,
                                parking: prev.krw.parking.map(x => x.id === p.id ? { ...x, balance: x.balance - amount } : x),
                                subPots: [...prev.krw.subPots, { id: "ksp_" + Date.now(), parentId: p.id, name, balance: amount }]
                              }
                            }));
                            logAudit(p.bank, "Sub-pot transfer", amount, "KRW", `Allocated to ${name}`);
                          }
                        }}
                        className="px-2 py-1 text-[11px] bg-gray-800 hover:bg-gray-700 rounded text-cyan-300"
                      >
                        + Create Sub-pot
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm("Delete parking account?")) {
                            setData(prev => ({
                              ...prev,
                              krw: { ...prev.krw, parking: prev.krw.parking.filter(x => x.id !== p.id) }
                            }));
                          }
                        }}
                        className="px-2 py-1 text-[11px] bg-red-950/60 text-red-400 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Subpots tied to this parking */}
                  <div className="pl-4 border-l-2 border-amber-500/30 space-y-2 mt-2">
                    <span className="text-[11px] text-gray-500 font-mono">Linked Sub-Pots:</span>
                    {data.krw.subPots.filter(sp => sp.parentId === p.id).map(sp => (
                      <div key={sp.id} className="flex items-center gap-3 text-xs font-mono bg-[#090910] p-2 rounded">
                        <span className="text-gray-300 font-semibold">{sp.name}</span>
                        <input 
                          type="number" 
                          value={sp.balance} 
                          onChange={e => {
                            const val = Number(e.target.value);
                            setData(prev => ({
                              ...prev,
                              krw: { ...prev.krw, subPots: prev.krw.subPots.map(x => x.id === sp.id ? { ...x, balance: val } : x) }
                            }));
                          }}
                          className="w-32 px-2 py-0.5 rounded font-bold text-amber-300"
                        />
                        <button 
                          onClick={() => {
                            setData(prev => ({
                              ...prev,
                              krw: {
                                ...prev.krw,
                                parking: prev.krw.parking.map(x => x.id === p.id ? { ...x, balance: x.balance + sp.balance } : x),
                                subPots: prev.krw.subPots.filter(x => x.id !== sp.id)
                              }
                            }));
                            logAudit(p.bank, "Sub-pot dissolve", sp.balance, "KRW", `Returned ${sp.name} to parking`);
                          }}
                          className="text-[10px] text-gray-500 hover:text-red-400"
                        >
                          Dissolve back
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Savings & Term Deposits (예금 / 적금 / 굴비적금) */}
            <div className="p-5 bg-[#090912] border border-gray-800 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold font-mono neon-cyan uppercase">Korea Term Savings (예금 / 적금 / 굴비적금)</h3>
                <button 
                  onClick={() => {
                    const newId = "ks_" + Date.now();
                    setData(p => ({
                      ...p,
                      krw: {
                        ...p.krw,
                        savings: [...p.krw.savings, {
                          id: newId, bank: "Bank", type: "예금", principal: 1000000, currentAccumulated: 1000000,
                          rate: 3.5, taxRate: 15.4, startDate: "2026-05-09", maturityDate: "2027-05-09",
                          withdrawCount: 0, earlyRate: 0.5, manualFinal: 0, note: ""
                        }]
                      }
                    }));
                  }}
                  className="text-xs px-2.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded font-mono"
                >
                  + Add Savings
                </button>
              </div>

              {data.krw.savings.map(s => {
                const preTaxProfit = (s.principal * (s.rate / 100));
                const afterTaxProfit = preTaxProfit * (1 - (s.taxRate / 100));
                const calculatedTotal = s.manualFinal > 0 ? s.manualFinal : (s.principal + afterTaxProfit);

                return (
                  <div key={s.id} className="p-4 bg-[#0c0c16] border border-gray-800 rounded space-y-3 font-mono text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                      <div>
                        <label className="text-gray-500 block">Bank</label>
                        <input type="text" value={s.bank} onChange={e => {
                          const v = e.target.value;
                          setData(p => ({ ...p, krw: { ...p.krw, savings: p.krw.savings.map(x => x.id === s.id ? { ...x, bank: v } : x) } }));
                        }} className="w-full px-2 py-1 rounded" />
                      </div>
                      <div>
                        <label className="text-gray-500 block">Type</label>
                        <select value={s.type} onChange={e => {
                          const v = e.target.value;
                          setData(p => ({ ...p, krw: { ...p.krw, savings: p.krw.savings.map(x => x.id === s.id ? { ...x, type: v } : x) } }));
                        }} className="w-full px-2 py-1 rounded">
                          <option value="예금">정기예금 (6-12M)</option>
                          <option value="적금">자유/정기적금</option>
                          <option value="굴비적금">굴비적금 (6M)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-500 block">Principal (₩)</label>
                        <input type="number" value={s.principal} onChange={e => {
                          const v = Number(e.target.value);
                          setData(p => ({ ...p, krw: { ...p.krw, savings: p.krw.savings.map(x => x.id === s.id ? { ...x, principal: v, currentAccumulated: v } : x) } }));
                        }} className="w-full px-2 py-1 rounded font-bold neon-cyan" />
                      </div>
                      <div>
                        <label className="text-gray-500 block">Rate (%)</label>
                        <input type="number" step="0.1" value={s.rate} onChange={e => {
                          const v = Number(e.target.value);
                          setData(p => ({ ...p, krw: { ...p.krw, savings: p.krw.savings.map(x => x.id === s.id ? { ...x, rate: v } : x) } }));
                        }} className="w-full px-2 py-1 rounded" />
                      </div>
                      <div>
                        <label className="text-gray-500 block">Tax Rate (%)</label>
                        <input type="number" step="0.1" value={s.taxRate} onChange={e => {
                          const v = Number(e.target.value);
                          setData(p => ({ ...p, krw: { ...p.krw, savings: p.krw.savings.map(x => x.id === s.id ? { ...x, taxRate: v } : x) } }));
                        }} className="w-full px-2 py-1 rounded text-red-400" />
                      </div>
                      <div>
                        <label className="text-gray-500 block">Maturity Date</label>
                        <input type="date" value={s.maturityDate} onChange={e => {
                          const v = e.target.value;
                          setData(p => ({ ...p, krw: { ...p.krw, savings: p.krw.savings.map(x => x.id === s.id ? { ...x, maturityDate: v } : x) } }));
                        }} className="w-full px-2 py-1 rounded" />
                      </div>
                    </div>

                    {/* Pre-tax vs After-tax metrics & Partial Withdrawal buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-800">
                      <div className="flex gap-4">
                        <span className="text-gray-400">Pre-Tax: <strong className="text-slate-200">₩{Math.round(preTaxProfit).toLocaleString()}</strong></span>
                        <span className="text-gray-400">After-Tax: <strong className="neon-lime">₩{Math.round(afterTaxProfit).toLocaleString()}</strong></span>
                        <span className="text-gray-400">Projected Total: <strong className="neon-cyan">₩{Math.round(calculatedTotal).toLocaleString()}</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* 2-Time Early Partial Withdrawal button */}
                        <button 
                          disabled={s.withdrawCount >= 2}
                          onClick={() => {
                            const amount = Number(prompt(`Partial Withdrawal (Max 2 times - Used ${s.withdrawCount}/2). Enter Principal to withdraw:`, "1000000"));
                            if (amount > 0 && amount < s.principal) {
                              const earlyProfit = Number(prompt("Early interest received (수령 이자 - editable):", Math.round(amount * (s.earlyRate / 100))));
                              setData(p => ({
                                ...p,
                                krw: {
                                  ...p.krw,
                                  savings: p.krw.savings.map(x => x.id === s.id ? {
                                    ...x,
                                    principal: x.principal - amount,
                                    currentAccumulated: x.principal - amount,
                                    withdrawCount: x.withdrawCount + 1
                                  } : x)
                                }
                              }));
                              logAudit(s.bank, "Partial Early Withdrawal", amount, "KRW", `Early Interest: ₩${earlyProfit}`);
                            }
                          }}
                          className={`px-2 py-1 text-[11px] rounded ${s.withdrawCount >= 2 ? "bg-gray-800 text-gray-500" : "bg-purple-950 text-purple-300 border border-purple-500/40"}`}
                        >
                          중도인출 ({s.withdrawCount}/2)
                        </button>

                        <button 
                          onClick={() => {
                            if (confirm("Liquidate early? (중도해지)")) {
                              const earlyVal = prompt("Actual early payout received:", Math.round(s.principal * 1.002));
                              logAudit(s.bank, "Early Termination", Number(earlyVal), "KRW", "Liquidated before maturity");
                              setData(p => ({
                                ...p,
                                krw: { ...p.krw, savings: p.krw.savings.filter(x => x.id !== s.id) }
                              }));
                            }
                          }}
                          className="px-2 py-1 text-[11px] bg-red-950/60 text-red-400 rounded"
                        >
                          중도해지
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: VIETNAM FINANCE */}
        {activeTab === "vnd" && (
          <div className="space-y-6">
            <div className="p-5 bg-[#090912] border border-gray-800 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold font-mono neon-cyan uppercase">Vietnam Fixed-Term & Flexible Goal Savings</h3>
                <button 
                  onClick={() => {
                    const newId = "vs_" + Date.now();
                    setData(p => ({
                      ...p,
                      vnd: {
                        ...p.vnd,
                        savings: [...p.vnd.savings, {
                          id: newId, bank: "MBBank", type: "Term Deposit", term: "12M", principal: 5000000,
                          rate: 5.5, startDate: "2026-05-09", maturityDate: "2027-05-09", earlyRate: 0.2,
                          manualFinal: 0, note: ""
                        }]
                      }
                    }));
                  }}
                  className="text-xs px-2.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded font-mono"
                >
                  + Add Sổ Tiết Kiệm
                </button>
              </div>

              {data.vnd.savings.map(s => {
                const projectedInterest = s.principal * (s.rate / 100);
                const finalTotal = s.manualFinal > 0 ? s.manualFinal : (s.principal + projectedInterest);

                return (
                  <div key={s.id} className="p-4 bg-[#0c0c16] border border-gray-800 rounded space-y-3 font-mono text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                      <div>
                        <label className="text-gray-500 block">Bank</label>
                        <input type="text" value={s.bank} onChange={e => {
                          const v = e.target.value;
                          setData(p => ({ ...p, vnd: { ...p.vnd, savings: p.vnd.savings.map(x => x.id === s.id ? { ...x, bank: v } : x) } }));
                        }} className="w-full px-2 py-1 rounded" />
                      </div>
                      <div>
                        <label className="text-gray-500 block">Term / Type</label>
                        <select value={s.term} onChange={e => {
                          const v = e.target.value;
                          setData(p => ({ ...p, vnd: { ...p.vnd, savings: p.vnd.savings.map(x => x.id === s.id ? { ...x, term: v } : x) } }));
                        }} className="w-full px-2 py-1 rounded">
                          <option value="1W">1 Tuần</option>
                          <option value="1M">1 Tháng</option>
                          <option value="3M">3 Tháng</option>
                          <option value="6M">6 Tháng</option>
                          <option value="12M">12 Tháng</option>
                          <option value="Annual">Hạn 9/5 Hàng Năm</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-500 block">Principal (₫)</label>
                        <input type="number" value={s.principal} onChange={e => {
                          const v = Number(e.target.value);
                          setData(p => ({ ...p, vnd: { ...p.vnd, savings: p.vnd.savings.map(x => x.id === s.id ? { ...x, principal: v } : x) } }));
                        }} className="w-full px-2 py-1 rounded font-bold neon-cyan" />
                      </div>
                      <div>
                        <label className="text-gray-500 block">Interest Rate (%)</label>
                        <input type="number" step="0.1" value={s.rate} onChange={e => {
                          const v = Number(e.target.value);
                          setData(p => ({ ...p, vnd: { ...p.vnd, savings: p.vnd.savings.map(x => x.id === s.id ? { ...x, rate: v } : x) } }));
                        }} className="w-full px-2 py-1 rounded" />
                      </div>
                      <div>
                        <label className="text-gray-500 block">Maturity Date</label>
                        <input type="date" value={s.maturityDate} onChange={e => {
                          const v = e.target.value;
                          setData(p => ({ ...p, vnd: { ...p.vnd, savings: p.vnd.savings.map(x => x.id === s.id ? { ...x, maturityDate: v } : x) } }));
                        }} className="w-full px-2 py-1 rounded" />
                      </div>
                      <div>
                        <label className="text-gray-500 block">Override Payout (₫)</label>
                        <input type="number" placeholder="Auto" value={s.manualFinal || ""} onChange={e => {
                          const v = Number(e.target.value);
                          setData(p => ({ ...p, vnd: { ...p.vnd, savings: p.vnd.savings.map(x => x.id === s.id ? { ...x, manualFinal: v } : x) } }));
                        }} className="w-full px-2 py-1 rounded text-lime-400" />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-800">
                      <div className="flex gap-4">
                        <span className="text-gray-400">Projected Interest: <strong className="neon-lime">₫{Math.round(projectedInterest).toLocaleString()}</strong></span>
                        <span className="text-gray-400">Total at Maturity: <strong className="neon-cyan">₫{Math.round(finalTotal).toLocaleString()}</strong></span>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            if (confirm("Liquidate early? (Hủy ngang sổ)")) {
                              const payout = prompt("Actual early amount received (₫):", s.principal);
                              logAudit(s.bank, "Early Termination", Number(payout), "VND", "Sổ hủy ngang trước hạn");
                              setData(p => ({ ...p, vnd: { ...p.vnd, savings: p.vnd.savings.filter(x => x.id !== s.id) } }));
                            }
                          }}
                          className="px-2 py-1 text-[11px] bg-red-950/60 text-red-400 rounded"
                        >
                          Hủy ngang
                        </button>
                        <button 
                          onClick={() => {
                            setData(p => ({ ...p, vnd: { ...p.vnd, savings: p.vnd.savings.filter(x => x.id !== s.id) } }));
                          }}
                          className="px-2 py-1 text-[11px] text-gray-500 hover:text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: INVESTMENTS (CCQ & LIVE NAV SCRAPER) */}
        {activeTab === "inv" && (
          <div className="space-y-6">
            <div className="p-5 bg-[#090912] border border-gray-800 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold font-mono neon-lime uppercase">Mutual Funds Tracker (Chứng Chỉ Quỹ)</h3>
                  <p className="text-xs text-gray-500 font-mono">Live NAV sync via proxy / Fmarket & manual overrides</p>
                </div>
                <button 
                  onClick={() => {
                    const newId = "inv_" + Date.now();
                    setData(p => ({
                      ...p,
                      investments: [...p.investments, { id: newId, code: "MBVF", units: 10, buyNav: 15000, currentNav: 15500, lastUpdated: new Date().toISOString().split("T")[0], history: [15000, 15200, 15500] }]
                    }));
                  }}
                  className="text-xs px-2.5 py-1 bg-lime-500/20 text-lime-300 border border-lime-500/40 rounded font-mono"
                >
                  + Add Fund
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[#0c0c16] text-gray-400 border-b border-gray-800">
                    <tr>
                      <th className="p-3">Fund Code</th>
                      <th className="p-3">Units Held</th>
                      <th className="p-3">Avg Buy NAV (₫)</th>
                      <th className="p-3">Current NAV (₫)</th>
                      <th className="p-3">Market Value</th>
                      <th className="p-3">PnL (%)</th>
                      <th className="p-3">Mini Sparkline</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {data.investments.map(inv => {
                      const cost = inv.units * inv.buyNav;
                      const currentVal = inv.units * inv.currentNav;
                      const profit = currentVal - cost;
                      const pnlPct = cost > 0 ? (profit / cost) * 100 : 0;

                      return (
                        <tr key={inv.id} className="hover:bg-[#0c0c16]/50">
                          <td className="p-3 font-bold neon-lime">{inv.code}</td>
                          <td className="p-3">
                            <input 
                              type="number" 
                              step="0.1" 
                              value={inv.units} 
                              onChange={e => {
                                const v = Number(e.target.value);
                                setData(p => ({ ...p, investments: p.investments.map(x => x.id === inv.id ? { ...x, units: v } : x) }));
                              }}
                              className="w-24 px-1.5 py-0.5 rounded"
                            />
                          </td>
                          <td className="p-3">
                            <input 
                              type="number" 
                              value={inv.buyNav} 
                              onChange={e => {
                                const v = Number(e.target.value);
                                setData(p => ({ ...p, investments: p.investments.map(x => x.id === inv.id ? { ...x, buyNav: v } : x) }));
                              }}
                              className="w-24 px-1.5 py-0.5 rounded"
                            />
                          </td>
                          <td className="p-3">
                            <input 
                              type="number" 
                              value={inv.currentNav} 
                              onChange={e => {
                                const v = Number(e.target.value);
                                setData(p => ({ ...p, investments: p.investments.map(x => x.id === inv.id ? { ...x, currentNav: v } : x) }));
                              }}
                              className="w-24 px-1.5 py-0.5 rounded font-bold neon-cyan"
                            />
                          </td>
                          <td className="p-3 font-bold">₫{Math.round(currentVal).toLocaleString()}</td>
                          <td className={`p-3 font-bold ${pnlPct >= 0 ? "neon-lime" : "neon-pink"}`}>
                            {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%
                          </td>
                          <td className="p-3">
                            {/* Visual mini ASCII sparkline */}
                            <span className="text-[10px] text-gray-500 tracking-tighter">
                              {inv.history && inv.history.map((h, i) => (
                                <span key={i} className={h >= inv.buyNav ? "text-lime-400" : "text-pink-400"}>
                                  {h > (inv.history[i-1] || h) ? "▲" : "▼"}
                                </span>
                              ))}
                            </span>
                          </td>
                          <td className="p-3">
                            <button 
                              onClick={() => {
                                setData(p => ({ ...p, investments: p.investments.filter(x => x.id !== inv.id) }));
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: OTHER ASSETS (REAL ESTATE, GOLD) */}
        {activeTab === "assets" && (
          <div className="space-y-6">
            <div className="p-5 bg-[#090912] border border-gray-800 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold font-mono text-purple-400 uppercase">Real Estate, Housing Deposits & Gold</h3>
                <button 
                  onClick={() => {
                    const newId = "oa_" + Date.now();
                    setData(p => ({
                      ...p,
                      otherAssets: [...p.otherAssets, {
                        id: newId, name: "Asset Name", address: "Location", buyDate: "2026-01-01",
                        buyPrice: 0, currentValuation: 0, currency: "VND", fundedFrom: "Personal Cash", soldDate: ""
                      }]
                    }))
                  }}
                  className="text-xs px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded font-mono"
                >
                  + Add Asset
                </button>
              </div>

              {data.otherAssets.map(a => (
                <div key={a.id} className="p-4 bg-[#0c0c16] border border-gray-800 rounded space-y-3 font-mono text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                    <div>
                      <label className="text-gray-500 block">Asset Name</label>
                      <input type="text" value={a.name} onChange={e => {
                        const v = e.target.value;
                        setData(p => ({ ...p, otherAssets: p.otherAssets.map(x => x.id === a.id ? { ...x, name: v } : x) }));
                      }} className="w-full px-2 py-1 rounded font-bold text-slate-100" />
                    </div>
                    <div>
                      <label className="text-gray-500 block">Address / Location</label>
                      <input type="text" value={a.address} onChange={e => {
                        const v = e.target.value;
                        setData(p => ({ ...p, otherAssets: p.otherAssets.map(x => x.id === a.id ? { ...x, address: v } : x) }));
                      }} className="w-full px-2 py-1 rounded" />
                    </div>
                    <div>
                      <label className="text-gray-500 block">Currency</label>
                      <select value={a.currency} onChange={e => {
                        const v = e.target.value;
                        setData(p => ({ ...p, otherAssets: p.otherAssets.map(x => x.id === a.id ? { ...x, currency: v } : x) }));
                      }} className="w-full px-2 py-1 rounded">
                        <option value="VND">VND</option>
                        <option value="KRW">KRW</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-500 block">Current Valuation</label>
                      <input type="number" value={a.currentValuation} onChange={e => {
                        const v = Number(e.target.value);
                        setData(p => ({ ...p, otherAssets: p.otherAssets.map(x => x.id === a.id ? { ...x, currentValuation: v } : x) }));
                      }} className="w-full px-2 py-1 rounded font-bold text-purple-400" />
                    </div>
                    <div>
                      <label className="text-gray-500 block">Funded Source</label>
                      <input type="text" value={a.fundedFrom} onChange={e => {
                        const v = e.target.value;
                        setData(p => ({ ...p, otherAssets: p.otherAssets.map(x => x.id === a.id ? { ...x, fundedFrom: v } : x) }));
                      }} className="w-full px-2 py-1 rounded text-cyan-300" />
                    </div>
                    <div>
                      <label className="text-gray-500 block">Sold Date (If Disposed)</label>
                      <input type="date" value={a.soldDate || ""} onChange={e => {
                        const v = e.target.value;
                        setData(p => ({ ...p, otherAssets: p.otherAssets.map(x => x.id === a.id ? { ...x, soldDate: v } : x) }));
                      }} className="w-full px-2 py-1 rounded" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-800 text-[11px]">
                    <span className="text-gray-400">Equivalent: <strong>{formatCurr(toVND(a.currentValuation, a.currency), "VND")}</strong></span>
                    <button 
                      onClick={() => {
                        setData(p => ({ ...p, otherAssets: p.otherAssets.filter(x => x.id !== a.id) }));
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: LIABILITIES (NỢ & TIỀN CỌC GIỮ HỘ) */}
        {activeTab === "debts" && (
          <div className="space-y-6">
            <div className="p-5 bg-[#090912] border border-gray-800 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold font-mono neon-pink uppercase">Liabilities & Escrow Obligations</h3>
                  <p className="text-xs text-gray-500 font-mono">Tenant deposits held, personal loans, and debt obligations</p>
                </div>
                <button 
                  onClick={() => {
                    const newId = "liab_" + Date.now();
                    setData(p => ({
                      ...p,
                      liabilities: [...p.liabilities, {
                        id: newId, name: "Tenant Deposit", debtorPayee: "Tenant", amount: 0, currency: "VND", dueDate: "2027-05-09", note: ""
                      }]
                    }));
                  }}
                  className="text-xs px-2.5 py-1 bg-pink-500/20 text-pink-300 border border-pink-500/40 rounded font-mono"
                >
                  + Add Liability
                </button>
              </div>

              {data.liabilities.map(l => (
                <div key={l.id} className="p-4 bg-[#0c0c16] border border-gray-800 rounded space-y-3 font-mono text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div>
                      <label className="text-gray-500 block">Description / Purpose</label>
                      <input type="text" value={l.name} onChange={e => {
                        const v = e.target.value;
                        setData(p => ({ ...p, liabilities: p.liabilities.map(x => x.id === l.id ? { ...x, name: v } : x) }));
                      }} className="w-full px-2 py-1 rounded font-bold" />
                    </div>
                    <div>
                      <label className="text-gray-500 block">Person / Payee</label>
                      <input type="text" value={l.debtorPayee} onChange={e => {
                        const v = e.target.value;
                        setData(p => ({ ...p, liabilities: p.liabilities.map(x => x.id === l.id ? { ...x, debtorPayee: v } : x) }));
                      }} className="w-full px-2 py-1 rounded" />
                    </div>
                    <div>
                      <label className="text-gray-500 block">Amount</label>
                      <input type="number" value={l.amount} onChange={e => {
                        const v = Number(e.target.value);
                        setData(p => ({ ...p, liabilities: p.liabilities.map(x => x.id === l.id ? { ...x, amount: v } : x) }));
                      }} className="w-full px-2 py-1 rounded font-bold neon-pink" />
                    </div>
                    <div>
                      <label className="text-gray-500 block">Currency</label>
                      <select value={l.currency} onChange={e => {
                        const v = e.target.value;
                        setData(p => ({ ...p, liabilities: p.liabilities.map(x => x.id === l.id ? { ...x, currency: v } : x) }));
                      }} className="w-full px-2 py-1 rounded">
                        <option value="VND">VND</option>
                        <option value="KRW">KRW</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-[11px] text-gray-500">Auto-deducted from Net Worth</span>
                      <button 
                        onClick={() => {
                          setData(p => ({ ...p, liabilities: p.liabilities.filter(x => x.id !== l.id) }));
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: TRANSACTIONS (SỔ GIAO DỊCH MONEY KEEPER STYLE) */}
        {activeTab === "ledger" && (
          <div className="space-y-6">
            <div className="p-5 bg-[#090912] border border-gray-800 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold font-mono neon-cyan uppercase">Income & Expense Ledger (Sổ Giao Dịch)</h3>
                <button 
                  onClick={() => {
                    const newId = "tx_" + Date.now();
                    setData(p => ({
                      ...p,
                      transactions: [{
                        id: newId, date: new Date().toISOString().split("T")[0], type: "Expense",
                        category: "Living", amount: 50000, currency: "KRW", account: "Toss Bank",
                        payee: "", fee: 0, note: ""
                      }, ...p.transactions]
                    }));
                  }}
                  className="text-xs px-2.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded font-mono"
                >
                  + Quick Entry (Ghi Chép)
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[#0c0c16] text-gray-400 border-b border-gray-800">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Amount</th>
                      <th className="p-2.5">Currency</th>
                      <th className="p-2.5">Account</th>
                      <th className="p-2.5">Payee / Person</th>
                      <th className="p-2.5">Fee</th>
                      <th className="p-2.5">Note</th>
                      <th className="p-2.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {data.transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-[#0c0c16]/50">
                        <td className="p-2">
                          <input type="date" value={tx.date} onChange={e => {
                            const v = e.target.value;
                            setData(p => ({ ...p, transactions: p.transactions.map(x => x.id === tx.id ? { ...x, date: v } : x) }));
                          }} className="w-28 px-1 py-0.5 rounded text-[11px]" />
                        </td>
                        <td className="p-2">
                          <select value={tx.type} onChange={e => {
                            const v = e.target.value;
                            setData(p => ({ ...p, transactions: p.transactions.map(x => x.id === tx.id ? { ...x, type: v } : x) }));
                          }} className="w-24 px-1 py-0.5 rounded text-[11px]">
                            <option value="Income">Income (Thu)</option>
                            <option value="Expense">Expense (Chi)</option>
                            <option value="Transfer">Transfer (Chuyển)</option>
                            <option value="Lend">Lend (Cho vay)</option>
                            <option value="Borrow">Borrow (Đi vay)</option>
                            <option value="Adjust">Adjust (Điều chỉnh)</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <input type="text" value={tx.category} onChange={e => {
                            const v = e.target.value;
                            setData(p => ({ ...p, transactions: p.transactions.map(x => x.id === tx.id ? { ...x, category: v } : x) }));
                          }} className="w-24 px-1 py-0.5 rounded text-[11px]" />
                        </td>
                        <td className="p-2">
                          <input type="number" value={tx.amount} onChange={e => {
                            const v = Number(e.target.value);
                            setData(p => ({ ...p, transactions: p.transactions.map(x => x.id === tx.id ? { ...x, amount: v } : x) }));
                          }} className={`w-24 px-1 py-0.5 rounded font-bold text-[11px] ${tx.type === "Income" ? "neon-lime" : "text-slate-100"}`} />
                        </td>
                        <td className="p-2">
                          <select value={tx.currency} onChange={e => {
                            const v = e.target.value;
                            setData(p => ({ ...p, transactions: p.transactions.map(x => x.id === tx.id ? { ...x, currency: v } : x) }));
                          }} className="w-16 px-1 py-0.5 rounded text-[11px]">
                            <option value="KRW">KRW</option>
                            <option value="VND">VND</option>
                            <option value="USD">USD</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <input type="text" value={tx.account} onChange={e => {
                            const v = e.target.value;
                            setData(p => ({ ...p, transactions: p.transactions.map(x => x.id === tx.id ? { ...x, account: v } : x) }));
                          }} className="w-24 px-1 py-0.5 rounded text-[11px]" />
                        </td>
                        <td className="p-2">
                          <input type="text" value={tx.payee || ""} onChange={e => {
                            const v = e.target.value;
                            setData(p => ({ ...p, transactions: p.transactions.map(x => x.id === tx.id ? { ...x, payee: v } : x) }));
                          }} className="w-24 px-1 py-0.5 rounded text-[11px]" />
                        </td>
                        <td className="p-2">
                          <input type="number" value={tx.fee || 0} onChange={e => {
                            const v = Number(e.target.value);
                            setData(p => ({ ...p, transactions: p.transactions.map(x => x.id === tx.id ? { ...x, fee: v } : x) }));
                          }} className="w-16 px-1 py-0.5 rounded text-[11px] text-gray-400" />
                        </td>
                        <td className="p-2">
                          <input type="text" value={tx.note || ""} onChange={e => {
                            const v = e.target.value;
                            setData(p => ({ ...p, transactions: p.transactions.map(x => x.id === tx.id ? { ...x, note: v } : x) }));
                          }} className="w-32 px-1 py-0.5 rounded text-[11px]" />
                        </td>
                        <td className="p-2">
                          <button onClick={() => {
                            setData(p => ({ ...p, transactions: p.transactions.filter(x => x.id !== tx.id) }));
                          }} className="text-red-400 hover:text-red-300">×</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: AUDIT LEDGER (LỊCH SỬ TOÀN BỘ TÀI KHOẢN) */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <div className="p-5 bg-[#090912] border border-gray-800 rounded-lg space-y-4 font-mono text-xs">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold neon-amber uppercase">Unified Account Audit Trail</h3>
                <span className="text-gray-500">Tracking all partial withdrawals & balance events</span>
              </div>

              {(!data.auditLogs || data.auditLogs.length === 0) ? (
                <p className="text-gray-500 py-4 text-center">No audit records yet. Logs appear upon partial withdrawal, sub-pot deduction, or early terminations.</p>
              ) : (
                <div className="divide-y divide-gray-800">
                  {data.auditLogs.map(log => (
                    <div key={log.id} className="py-2.5 flex justify-between items-center">
                      <div>
                        <strong className="text-cyan-400 mr-2">[{log.accountName}]</strong>
                        <span className="text-slate-200 mr-2 font-semibold">{log.actionType}</span>
                        <span className="text-gray-500 text-[11px]">{log.detail}</span>
                      </div>
                      <div className="text-right">
                        <span className="neon-amber font-bold">{formatCurr(log.amount, log.currency)}</span>
                        <span className="block text-[10px] text-gray-500">{log.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 9: SETTINGS & GOOGLE CLOUD SYNC */}
        {activeTab === "settings" && (
          <div className="p-6 bg-[#090912] border border-gray-800 rounded-lg space-y-6 max-w-2xl font-mono text-xs">
            <h3 className="text-sm font-bold neon-cyan uppercase">System Settings & Data Management</h3>

            <div className="space-y-2">
              <label className="text-gray-400 block font-bold">Google Apps Script Web App Endpoint URL</label>
              <input 
                type="text" 
                value={data.gasUrl} 
                onChange={e => setData(p => ({ ...p, gasUrl: e.target.value }))}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-3 py-2 rounded font-mono text-xs border border-cyan-500/30"
              />
              <p className="text-[11px] text-gray-500">Target path in Google Drive: <code>Finance / Report / Finance_Report_Year.xlsx</code></p>
            </div>

            <div className="pt-4 border-t border-gray-800 flex flex-wrap gap-3">
              <button 
                onClick={() => {
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `Youmelittlepenny_Backup_${new Date().toISOString().split("T")[0]}.json`;
                  a.click();
                }}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-cyan-300 rounded"
              >
                Export JSON Backup
              </button>

              <button 
                onClick={() => {
                  if (confirm("Restore original starter data? Current edits will be reset.")) {
                    setData(INITIAL_DATA);
                    localStorage.removeItem("youmelittlepenny_data");
                  }
                }}
                className="px-3 py-2 bg-red-950/60 hover:bg-red-900 text-red-300 rounded"
              >
                {t.actions.reset}
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// Render Application
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
