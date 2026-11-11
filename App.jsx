import React, { useState, useEffect, useMemo } from "react";

// --- GLOBAL CONFIG & PERSISTENCE ---
const WEB_APP_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

// Supported Currencies
const CURRENCIES = ["KRW", "VND", "USD"];

// Initial State Blueprint
const INITIAL_STATE = {
  lang: "EN", // 'EN' or 'KO'
  baseCurrency: "KRW",
  fxRates: {
    USD_KRW: 1380.5,
    USD_VND: 25420.0,
    KRW_VND: 18.41,
    lastUpdated: new Date().toISOString()
  },
  cashflows: [
    { id: "cf-1", title: "Primary Tech Salary", category: "Active", amount: 2400000, currency: "KRW", allocatedSavings: 1150000 },
    { id: "cf-2", title: "Rental Income Apartment", category: "Passive", amount: 7300000, currency: "VND", allocatedSavings: 4500000 }
  ],
  koreaAccounts: [
    {
      id: "kr-1",
      bank: "Kookmin Bank",
      product: "Fixed Deposit", // 예금
      principal: 9000000,
      apr: 3.0,
      taxRate: 15.4,
      startDate: "2025-11-09",
      maturityDate: "2026-05-09",
      status: "Active",
      withdrawalsRemaining: 2,
      history: [
        { date: "2025-11-09", type: "Initial Deposit", amount: 9000000 }
      ]
    },
    {
      id: "kr-2",
      bank: "KakaoBank",
      product: "Installment Savings", // 적금
      principal: 865000,
      apr: 1.4,
      taxRate: 15.4,
      startDate: "2025-12-09",
      maturityDate: "2026-05-09",
      status: "Active",
      withdrawalsRemaining: 2,
      history: [
        { date: "2025-12-09", type: "Initial Deposit", amount: 565000 },
        { date: "2026-01-09", type: "Top-up", amount: 150000 },
        { date: "2026-02-09", type: "Top-up", amount: 150000 }
      ]
    }
  ],
  vietnamAccounts: [
    {
      id: "vn-1",
      bank: "MBBank",
      product: "Term Deposit",
      principal: 7000000,
      apr: 4.3,
      startDate: "2025-05-09",
      maturityDate: "2026-05-09",
      status: "Active",
      history: [
        { date: "2025-05-09", type: "Initial Deposit", amount: 7000000 }
      ]
    },
    {
      id: "vn-2",
      bank: "MBBank",
      product: "Rental Security Escrow",
      principal: 14000000,
      apr: 6.2,
      startDate: "2025-05-09",
      maturityDate: "2026-05-09",
      status: "Active",
      history: [
        { date: "2025-05-09", type: "Initial Deposit", amount: 14000000 }
      ]
    }
  ],
  funds: [
    {
      id: "f-1",
      ticker: "MBBOND",
      name: "MB Bond Fund",
      unitsHeld: 66.8,
      latestNAV: 15120, // VND
      costBasisPerUnit: 14960,
      history7d: [15080, 15090, 15100, 15105, 15115, 15118, 15120],
      transactions: [
        { id: "tx-1", date: "2025-12-10", type: "Buy", units: 33.4, nav: 14950, total: 500000 },
        { id: "tx-2", date: "2026-01-10", type: "Buy", units: 33.4, nav: 14970, total: 500000 }
      ]
    },
    {
      id: "f-2",
      ticker: "MBAM",
      name: "MB Money Market",
      unitsHeld: 48.5,
      latestNAV: 10320, // VND
      costBasisPerUnit: 10300,
      history7d: [10300, 10305, 10310, 10312, 10315, 10318, 10320],
      transactions: [
        { id: "tx-3", date: "2026-01-15", type: "Buy", units: 48.5, nav: 10300, total: 500000 }
      ]
    }
  ],
  assets: [
    {
      id: "as-1",
      name: "Residential Apartment",
      type: "Real Estate",
      currency: "VND",
      valuation: 2200000000,
      debt: 110000000, // 5% remaining
      purchaseDate: "2024-03-15",
      targetExitDate: "2034-03-15"
    },
    {
      id: "as-2",
      name: "Korea Lease Deposit",
      type: "Deposit Asset",
      currency: "KRW",
      valuation: 8000000,
      debt: 0,
      purchaseDate: "2024-10-01",
      targetExitDate: "2026-10-01"
    }
  ]
};

// UI Dictionary (Strict English & Korean Only)
const I18N = {
  EN: {
    terminalBrand: "Youmelittlepenny",
    netWorth: "Total Net Worth",
    activeSavingsRate: "Active Savings Rate",
    totalMonthlyCashflow: "Monthly Cashflow",
    totalMonthlySavings: "Monthly Savings",
    syncStatus: "Synced",
    syncing: "Syncing...",
    overviewTab: "Overview",
    koreaTab: "Korea Banking",
    vietnamTab: "Vietnam Banking",
    fundsTab: "Funds",
    assetsTab: "Real Estate & Assets",
    streamsTab: "Cashflows",
    chartModeTotal: "Total Net Worth",
    chartModeFour: "4 Asset Classes",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    topUp: "Top-up",
    addNew: "Add New",
    bank: "Bank",
    product: "Product",
    principal: "Principal",
    apr: "APR (%)",
    startDate: "Start Date",
    maturityDate: "Maturity",
    postTaxInterest: "Post-tax Yield",
    currentValuation: "Current Value",
    equity: "Net Equity",
    debt: "Debt / Mortgage",
    history: "Transaction Ledger",
    units: "Units",
    latestNAV: "Latest NAV",
    costBasis: "Cost Basis",
    roi: "ROI",
    updateNAV: "Update NAV",
    buy: "Buy",
    sell: "Sell",
    koreaBucket: "Korea Banking",
    vietnamBucket: "Vietnam Banking",
    fundsBucket: "Mutual Funds",
    assetsBucket: "Real Estate & Assets"
  },
  KO: {
    terminalBrand: "Youmelittlepenny",
    netWorth: "총 순자산",
    activeSavingsRate: "실질 저축률",
    totalMonthlyCashflow: "월 현금 유입",
    totalMonthlySavings: "월 저축액",
    syncStatus: "동기화 완료",
    syncing: "동기화 중...",
    overviewTab: "종합 대시보드",
    koreaTab: "한국 금융",
    vietnamTab: "베트남 금융",
    fundsTab: "펀드",
    assetsTab: "부동산 및 기타 자산",
    streamsTab: "현금흐름 관리",
    chartModeTotal: "총 순자산 단독",
    chartModeFour: "4대 자산군 비교",
    edit: "수정",
    save: "저장",
    cancel: "취소",
    delete: "삭제",
    topUp: "납입",
    addNew: "추가",
    bank: "금융기관",
    product: "상품 유형",
    principal: "원금",
    apr: "연이율 (%)",
    startDate: "가입일",
    maturityDate: "만기일",
    postTaxInterest: "세후 예상 수익",
    currentValuation: "평가액",
    equity: "순자산가치",
    debt: "부채 / 대출 잔액",
    history: "거래 내역",
    units: "보유 좌수",
    latestNAV: "기준가 (NAV)",
    costBasis: "매입 단가",
    roi: "수익률",
    updateNAV: "기준가 갱신",
    buy: "매수",
    sell: "환매",
    koreaBucket: "한국 금융 자산",
    vietnamBucket: "베트남 금융 자산",
    fundsBucket: "펀드 투자 자산",
    assetsBucket: "부동산 및 실물 자산"
  }
};

export default function App() {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem("youmelittlepenny_state");
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [chartMode, setChartMode] = useState("total"); // 'total' OR 'four'
  const [timeHorizon, setTimeHorizon] = useState("1Y");
  const [syncing, setSyncing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Modals & Expansion States
  const [expandedRow, setExpandedRow] = useState(null);
  const [topUpModal, setTopUpModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [fundTxModal, setFundTxModal] = useState(null);

  const t = I18N[state.lang] || I18N.EN;

  // Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Save to LocalStorage & Silent Sync to GAS
  useEffect(() => {
    localStorage.setItem("youmelittlepenny_state", JSON.stringify(state));
    if (WEB_APP_URL && WEB_APP_URL !== "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE") {
      setSyncing(true);
      fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SYNC_STATE", data: state })
      })
      .then(() => setTimeout(() => setSyncing(false), 600))
      .catch(() => setSyncing(false));
    }
  }, [state]);

  // Conversion Helpers
  const convert = (amount, fromCurr, toCurr) => {
    if (fromCurr === toCurr) return amount;
    const { USD_KRW, USD_VND } = state.fxRates;
    // to USD
    let amountInUSD = fromCurr === "USD" ? amount : fromCurr === "KRW" ? amount / USD_KRW : amount / USD_VND;
    // from USD to target
    if (toCurr === "USD") return amountInUSD;
    if (toCurr === "KRW") return amountInUSD * USD_KRW;
    if (toCurr === "VND") return amountInUSD * USD_VND;
    return amount;
  };

  const fmt = (num, curr = state.baseCurrency) => {
    const val = typeof num === "number" ? num : 0;
    if (curr === "KRW") return Math.round(val).toLocaleString() + " ₩";
    if (curr === "VND") return Math.round(val).toLocaleString() + " ₫";
    return "$" + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Portfolio Totals & Calculations
  const calculated = useMemo(() => {
    // 1. Korea Banking
    const koreaTotalKRW = state.koreaAccounts.reduce((sum, acc) => sum + acc.principal, 0);
    const koreaTotal = convert(koreaTotalKRW, "KRW", state.baseCurrency);

    // 2. Vietnam Banking
    const vnTotalVND = state.vietnamAccounts.reduce((sum, acc) => sum + acc.principal, 0);
    const vnTotal = convert(vnTotalVND, "VND", state.baseCurrency);

    // 3. Funds
    const fundsTotalVND = state.funds.reduce((sum, f) => sum + (f.unitsHeld * f.latestNAV), 0);
    const fundsTotal = convert(fundsTotalVND, "VND", state.baseCurrency);

    // 4. Real Estate & Assets (Equity = Valuation - Debt)
    const reTotal = state.assets.reduce((sum, a) => {
      const eq = Math.max(0, a.valuation - a.debt);
      return sum + convert(eq, a.currency, state.baseCurrency);
    }, 0);

    const totalNetWorth = koreaTotal + vnTotal + fundsTotal + reTotal;

    // Cashflow & Savings Rate
    let totalCashflowBase = 0;
    let totalSavingsBase = 0;
    state.cashflows.forEach(cf => {
      totalCashflowBase += convert(cf.amount, cf.currency, state.baseCurrency);
      totalSavingsBase += convert(cf.allocatedSavings, cf.currency, state.baseCurrency);
    });

    const activeSavingsRate = totalCashflowBase > 0 ? (totalSavingsBase / totalCashflowBase) * 100 : 0;

    return {
      koreaTotal,
      vnTotal,
      fundsTotal,
      reTotal,
      totalNetWorth,
      totalCashflowBase,
      totalSavingsBase,
      activeSavingsRate
    };
  }, [state, state.baseCurrency]);

  // Handlers for Top-Up
  const handleExecuteTopUp = (e) => {
    e.preventDefault();
    const { accountType, accountId, amount, date } = topUpModal;
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    if (accountType === "KR") {
      setState(prev => ({
        ...prev,
        koreaAccounts: prev.koreaAccounts.map(acc => {
          if (acc.id === accountId) {
            return {
              ...acc,
              principal: acc.principal + numAmount,
              history: [...acc.history, { date: date || new Date().toISOString().split("T")[0], type: "Top-up", amount: numAmount }]
            };
          }
          return acc;
        })
      }));
    } else {
      setState(prev => ({
        ...prev,
        vietnamAccounts: prev.vietnamAccounts.map(acc => {
          if (acc.id === accountId) {
            return {
              ...acc,
              principal: acc.principal + numAmount,
              history: [...acc.history, { date: date || new Date().toISOString().split("T")[0], type: "Top-up", amount: numAmount }]
            };
          }
          return acc;
        })
      }));
    }
    setTopUpModal(null);
  };

  // Handler for Updating NAV
  const handleUpdateNAV = (fundId) => {
    setState(prev => ({
      ...prev,
      funds: prev.funds.map(f => {
        if (f.id === fundId) {
          const delta = (Math.random() * 0.008 - 0.002) * f.latestNAV; // modest realistic adjustment
          const nextNAV = Math.round(f.latestNAV + delta);
          return {
            ...f,
            latestNAV: nextNAV,
            history7d: [...f.history7d.slice(1), nextNAV]
          };
        }
        return f;
      })
    }));
  };

  // Handler for Fund Transaction (Buy/Sell)
  const handleExecuteFundTx = (e) => {
    e.preventDefault();
    const { fundId, type, units, nav, date } = fundTxModal;
    const numUnits = parseFloat(units);
    const numNAV = parseFloat(nav);
    if (!numUnits || !numNAV || numUnits <= 0) return;

    setState(prev => ({
      ...prev,
      funds: prev.funds.map(f => {
        if (f.id === fundId) {
          const newUnits = type === "Buy" ? f.unitsHeld + numUnits : Math.max(0, f.unitsHeld - numUnits);
          const newTx = {
            id: "tx-" + Date.now(),
            date: date || new Date().toISOString().split("T")[0],
            type,
            units: numUnits,
            nav: numNAV,
            total: Math.round(numUnits * numNAV)
          };
          return {
            ...f,
            unitsHeld: Math.round(newUnits * 100) / 100,
            latestNAV: numNAV,
            transactions: [...f.transactions, newTx]
          };
        }
        return f;
      })
    }));
    setFundTxModal(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 font-mono flex flex-col selection:bg-cyan-500 selection:text-black">
      
      {/* 1. TOP HEADER & TELEMETRY STRIP */}
      <header className="border-b border-slate-800 bg-[#07090E] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 font-bold tracking-widest text-sm uppercase">
            {t.terminalBrand}
          </span>
          <div className="h-4 w-[1px] bg-slate-800"></div>
          <span className="text-slate-400">
            {currentTime.toLocaleDateString(state.lang === "KO" ? "ko-KR" : "en-US", { weekday: "short", year: "numeric", month: "2-digit", day: "2-digit" })}
            {" "}{currentTime.toLocaleTimeString()}
          </span>
        </div>

        {/* Live FX Rates */}
        <div className="flex items-center gap-4 text-[11px] text-slate-400 bg-slate-900/60 px-3 py-1 rounded border border-slate-800">
          <span>USD/KRW: <strong className="text-slate-200">{state.fxRates.USD_KRW.toLocaleString()}</strong></span>
          <span>USD/VND: <strong className="text-slate-200">{state.fxRates.USD_VND.toLocaleString()}</strong></span>
          <span>KRW/VND: <strong className="text-slate-200">{state.fxRates.KRW_VND.toFixed(2)}</strong></span>
          <div className="flex items-center gap-1.5 ml-1">
            <span className={`w-2 h-2 rounded-full ${syncing ? "bg-amber-400 animate-ping" : "bg-emerald-400"}`}></span>
            <span className="text-[10px] text-slate-400">{syncing ? t.syncing : t.syncStatus}</span>
          </div>
        </div>

        {/* Controls: Base Currency & Language */}
        <div className="flex items-center gap-2">
          <div className="flex rounded border border-slate-700 bg-slate-900 p-0.5">
            {CURRENCIES.map(curr => (
              <button
                key={curr}
                onClick={() => setState(p => ({ ...p, baseCurrency: curr }))}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${state.baseCurrency === curr ? "bg-cyan-500 text-black font-semibold" : "text-slate-400 hover:text-white"}`}
              >
                {curr}
              </button>
            ))}
          </div>

          <div className="flex rounded border border-slate-700 bg-slate-900 p-0.5">
            {["EN", "KO"].map(lang => (
              <button
                key={lang}
                onClick={() => setState(p => ({ ...p, lang }))}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${state.lang === lang ? "bg-slate-200 text-black font-semibold" : "text-slate-400 hover:text-white"}`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 2. NAVIGATION BAR */}
      <nav className="border-b border-slate-800 bg-[#0D111A] px-4 flex gap-1 overflow-x-auto text-xs">
        {[
          { key: "overview", label: t.overviewTab },
          { key: "korea", label: t.koreaTab },
          { key: "vietnam", label: t.vietnamTab },
          { key: "funds", label: t.fundsTab },
          { key: "assets", label: t.assetsTab },
          { key: "streams", label: t.streamsTab }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`py-3 px-4 border-b-2 font-medium transition-all ${
              activeTab === tab.key
                ? "border-cyan-400 text-cyan-400 bg-cyan-950/20"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* 3. MAIN TERMINAL WORKSPACE */}
      <main className="flex-1 p-4 max-w-7xl w-full mx-auto space-y-4">
        
        {/* TOP METRICS SUMMARY STRIP */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#101522] border border-slate-800 p-3 rounded">
            <div className="text-slate-400 mb-1">{t.netWorth}</div>
            <div className="text-2xl font-bold text-cyan-300 tracking-tight">
              {fmt(calculated.totalNetWorth)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">100% Unencumbered Capital</div>
          </div>

          <div className="bg-[#101522] border border-slate-800 p-3 rounded">
            <div className="text-slate-400 mb-1">{t.activeSavingsRate}</div>
            <div className="text-2xl font-bold text-emerald-400">
              {calculated.activeSavingsRate.toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {fmt(calculated.totalSavingsBase)} / {fmt(calculated.totalCashflowBase)}
            </div>
          </div>

          <div className="bg-[#101522] border border-slate-800 p-3 rounded">
            <div className="text-slate-400 mb-1">{t.totalMonthlySavings}</div>
            <div className="text-xl font-bold text-slate-200">
              {fmt(calculated.totalSavingsBase)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Automated Inflows</div>
          </div>

          <div className="bg-[#101522] border border-slate-800 p-3 rounded">
            <div className="text-slate-400 mb-1">{t.totalMonthlyCashflow}</div>
            <div className="text-xl font-bold text-slate-200">
              {fmt(calculated.totalCashflowBase)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Active + Passive Inflows</div>
          </div>
        </section>

        {/* TAB 1: OVERVIEW & SEPARATED TIMELINE CHARTS */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            
            {/* TIMELINE VISUALIZATION WITH STRICT TOTAL VS 4-ASSET SEPARATION */}
            <div className="bg-[#101522] border border-slate-800 rounded p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Portfolio Timeline
                  </span>

                  {/* STRICT SEPARATION BUTTONS: TOTAL NET WORTH vs 4 ASSET CLASSES */}
                  <div className="flex rounded border border-slate-700 bg-slate-900 p-0.5 ml-2">
                    <button
                      onClick={() => setChartMode("total")}
                      className={`px-3 py-1 rounded text-xs transition-colors ${
                        chartMode === "total"
                          ? "bg-cyan-500 text-black font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {t.chartModeTotal}
                    </button>
                    <button
                      onClick={() => setChartMode("four")}
                      className={`px-3 py-1 rounded text-xs transition-colors ${
                        chartMode === "four"
                          ? "bg-cyan-500 text-black font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {t.chartModeFour}
                    </button>
                  </div>
                </div>

                {/* Horizon Switcher */}
                <div className="flex items-center gap-1 text-[11px]">
                  {["1M", "3M", "6M", "1Y", "3Y", "5Y"].map(h => (
                    <button
                      key={h}
                      onClick={() => setTimeHorizon(h)}
                      className={`px-2 py-0.5 rounded ${timeHorizon === h ? "bg-slate-700 text-white font-semibold" : "text-slate-400 hover:text-slate-200"}`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart Canvas */}
              <div className="h-64 w-full relative pt-2">
                <svg className="w-full h-full" viewBox="0 0 800 240" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  {[40, 90, 140, 190].map(y => (
                    <line key={y} x1="40" y1={y} x2="780" y2={y} stroke="#1E293B" strokeDasharray="3 3" />
                  ))}

                  {/* MODE 1: TOTAL NET WORTH ONLY */}
                  {chartMode === "total" && (
                    <g>
                      {/* Gradient Fill under Net Worth Curve */}
                      <defs>
                        <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <polygon
                        points="40,200 40,160 160,150 280,135 400,115 520,95 640,75 760,50 760,200"
                        fill="url(#totalGrad)"
                      />
                      <polyline
                        fill="none"
                        stroke="#22D3EE"
                        strokeWidth="3"
                        points="40,160 160,150 280,135 400,115 520,95 640,75 760,50"
                      />
                      {/* Interactive Point Markers */}
                      {[[40, 160], [160, 150], [280, 135], [400, 115], [520, 95], [640, 75], [760, 50]].map(([x, y], idx) => (
                        <circle key={idx} cx={x} cy={y} r="4" fill="#22D3EE" stroke="#07090E" strokeWidth="2" />
                      ))}
                    </g>
                  )}

                  {/* MODE 2: 4 ASSET CLASSES SEPARATED (EACH HAS ITS OWN DEDICATED COLOR LINE) */}
                  {chartMode === "four" && (
                    <g>
                      {/* 1. Real Estate & Assets (Amber) */}
                      <polyline
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="2.5"
                        points="40,90 160,90 280,88 400,85 520,80 640,75 760,70"
                      />
                      {/* 2. Korea Banking (Emerald) */}
                      <polyline
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2.5"
                        points="40,155 160,150 280,145 400,138 520,130 640,120 760,110"
                      />
                      {/* 3. Vietnam Banking (Indigo) */}
                      <polyline
                        fill="none"
                        stroke="#6366F1"
                        strokeWidth="2"
                        points="40,185 160,182 280,178 400,172 520,165 640,158 760,150"
                      />
                      {/* 4. Funds (Rose) */}
                      <polyline
                        fill="none"
                        stroke="#F43F5E"
                        strokeWidth="2"
                        points="40,195 160,194 280,192 400,188 520,183 640,178 760,170"
                      />
                    </g>
                  )}
                </svg>

                {/* Legend Strip */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 mt-2 px-2">
                  <div className="flex items-center gap-4">
                    {chartMode === "total" ? (
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 bg-cyan-400 rounded-full"></span>
                        <span className="text-slate-200 font-medium">{t.netWorth} ({fmt(calculated.totalNetWorth)})</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
                          <span>{t.assetsBucket}: <strong className="text-slate-200">{fmt(calculated.reTotal)}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                          <span>{t.koreaBucket}: <strong className="text-slate-200">{fmt(calculated.koreaTotal)}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
                          <span>{t.vietnamBucket}: <strong className="text-slate-200">{fmt(calculated.vnTotal)}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
                          <span>{t.fundsBucket}: <strong className="text-slate-200">{fmt(calculated.fundsTotal)}</strong></span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Annual Rebalancing Horizon: May 09
                  </div>
                </div>
              </div>
            </div>

            {/* ASSET ALLOCATION SUMMARY TILES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {[
                { label: t.koreaBucket, val: calculated.koreaTotal, col: "text-emerald-400", border: "border-emerald-900/40" },
                { label: t.vietnamBucket, val: calculated.vnTotal, col: "text-indigo-400", border: "border-indigo-900/40" },
                { label: t.fundsBucket, val: calculated.fundsTotal, col: "text-rose-400", border: "border-rose-900/40" },
                { label: t.assetsBucket, val: calculated.reTotal, col: "text-amber-400", border: "border-amber-900/40" }
              ].map(b => (
                <div key={b.label} className={`bg-[#101522] border ${b.border} p-3 rounded`}>
                  <div className="text-slate-400">{b.label}</div>
                  <div className={`text-lg font-bold mt-1 ${b.col}`}>{fmt(b.val)}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {calculated.totalNetWorth > 0 ? ((b.val / calculated.totalNetWorth) * 100).toFixed(1) : 0}% of Total Portfolio
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: KOREA BANKING */}
        {activeTab === "korea" && (
          <div className="bg-[#101522] border border-slate-800 rounded p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-200">{t.koreaTab}</h2>
                <p className="text-[11px] text-slate-400">Fixed Deposit, Installment Savings & Partial Withdrawals</p>
              </div>
              <button
                onClick={() => setEditModal({ type: "NEW_KR_ACCOUNT" })}
                className="px-3 py-1 bg-cyan-500 text-black rounded text-xs font-semibold hover:bg-cyan-400"
              >
                + {t.addNew}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2 px-3">{t.bank}</th>
                    <th className="py-2 px-3">{t.product}</th>
                    <th className="py-2 px-3 text-right">{t.principal}</th>
                    <th className="py-2 px-3 text-right">{t.apr}</th>
                    <th className="py-2 px-3">{t.startDate}</th>
                    <th className="py-2 px-3">{t.maturityDate}</th>
                    <th className="py-2 px-3 text-center">Withdrawals</th>
                    <th className="py-2 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {state.koreaAccounts.map(acc => {
                    const isExpanded = expandedRow === acc.id;
                    return (
                      <React.Fragment key={acc.id}>
                        <tr className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3 px-3 font-medium text-slate-200 flex items-center gap-2">
                            <button
                              onClick={() => setExpandedRow(isExpanded ? null : acc.id)}
                              className="text-slate-400 hover:text-cyan-400 text-xs"
                            >
                              {isExpanded ? "▼" : "▶"}
                            </button>
                            {acc.bank}
                          </td>
                          <td className="py-3 px-3 text-slate-300">{acc.product}</td>
                          <td className="py-3 px-3 text-right font-mono text-cyan-300">{fmt(acc.principal, "KRW")}</td>
                          <td className="py-3 px-3 text-right font-mono text-emerald-400">{acc.apr}%</td>
                          <td className="py-3 px-3 text-slate-400">{acc.startDate}</td>
                          <td className="py-3 px-3 text-slate-300 font-semibold">{acc.maturityDate}</td>
                          <td className="py-3 px-3 text-center text-slate-400">{acc.withdrawalsRemaining}/2</td>
                          <td className="py-3 px-3 text-right space-x-2">
                            <button
                              onClick={() => setTopUpModal({ accountType: "KR", accountId: acc.id, bank: acc.bank })}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded text-[11px]"
                            >
                              {t.topUp}
                            </button>
                            <button
                              onClick={() => setEditModal({ type: "EDIT_KR", data: acc })}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[11px]"
                            >
                              {t.edit}
                            </button>
                          </td>
                        </tr>

                        {/* Indented Ledger Sub-Row */}
                        {isExpanded && (
                          <tr className="bg-slate-950/60">
                            <td colSpan="8" className="py-2.5 px-6 pl-10 border-l-2 border-cyan-500">
                              <div className="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                                {t.history} ({acc.bank})
                              </div>
                              <div className="space-y-1">
                                {acc.history.map((tx, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs font-mono text-slate-300 bg-slate-900/60 px-3 py-1 rounded border border-slate-800">
                                    <div className="flex items-center gap-3">
                                      <span className="text-slate-500">{tx.date}</span>
                                      <span className="px-1.5 py-0.2 bg-slate-800 rounded text-cyan-300 text-[10px]">{tx.type}</span>
                                    </div>
                                    <span className="font-semibold text-slate-200">+{fmt(tx.amount, "KRW")}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: VIETNAM BANKING */}
        {activeTab === "vietnam" && (
          <div className="bg-[#101522] border border-slate-800 rounded p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-200">{t.vietnamTab}</h2>
                <p className="text-[11px] text-slate-400">Fixed Term & Flexible Accumulation Accounts</p>
              </div>
              <button
                onClick={() => setEditModal({ type: "NEW_VN_ACCOUNT" })}
                className="px-3 py-1 bg-cyan-500 text-black rounded text-xs font-semibold hover:bg-cyan-400"
              >
                + {t.addNew}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2 px-3">{t.bank}</th>
                    <th className="py-2 px-3">{t.product}</th>
                    <th className="py-2 px-3 text-right">{t.principal}</th>
                    <th className="py-2 px-3 text-right">{t.apr}</th>
                    <th className="py-2 px-3">{t.startDate}</th>
                    <th className="py-2 px-3">{t.maturityDate}</th>
                    <th className="py-2 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {state.vietnamAccounts.map(acc => {
                    const isExpanded = expandedRow === acc.id;
                    return (
                      <React.Fragment key={acc.id}>
                        <tr className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3 px-3 font-medium text-slate-200 flex items-center gap-2">
                            <button
                              onClick={() => setExpandedRow(isExpanded ? null : acc.id)}
                              className="text-slate-400 hover:text-cyan-400 text-xs"
                            >
                              {isExpanded ? "▼" : "▶"}
                            </button>
                            {acc.bank}
                          </td>
                          <td className="py-3 px-3 text-slate-300">{acc.product}</td>
                          <td className="py-3 px-3 text-right font-mono text-cyan-300">{fmt(acc.principal, "VND")}</td>
                          <td className="py-3 px-3 text-right font-mono text-emerald-400">{acc.apr}%</td>
                          <td className="py-3 px-3 text-slate-400">{acc.startDate}</td>
                          <td className="py-3 px-3 text-slate-300 font-semibold">{acc.maturityDate}</td>
                          <td className="py-3 px-3 text-right space-x-2">
                            <button
                              onClick={() => setTopUpModal({ accountType: "VN", accountId: acc.id, bank: acc.bank })}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded text-[11px]"
                            >
                              {t.topUp}
                            </button>
                            <button
                              onClick={() => setEditModal({ type: "EDIT_VN", data: acc })}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[11px]"
                            >
                              {t.edit}
                            </button>
                          </td>
                        </tr>

                        {/* Indented Ledger Sub-Row */}
                        {isExpanded && (
                          <tr className="bg-slate-950/60">
                            <td colSpan="7" className="py-2.5 px-6 pl-10 border-l-2 border-indigo-500">
                              <div className="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                                {t.history} ({acc.bank})
                              </div>
                              <div className="space-y-1">
                                {acc.history.map((tx, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs font-mono text-slate-300 bg-slate-900/60 px-3 py-1 rounded border border-slate-800">
                                    <div className="flex items-center gap-3">
                                      <span className="text-slate-500">{tx.date}</span>
                                      <span className="px-1.5 py-0.2 bg-slate-800 rounded text-indigo-300 text-[10px]">{tx.type}</span>
                                    </div>
                                    <span className="font-semibold text-slate-200">+{fmt(tx.amount, "VND")}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: MUTUAL FUNDS */}
        {activeTab === "funds" && (
          <div className="bg-[#101522] border border-slate-800 rounded p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-200">{t.fundsTab}</h2>
                <p className="text-[11px] text-slate-400">Certificates, NAV Tracking & Transaction Ledgers</p>
              </div>
              <button
                onClick={() => setEditModal({ type: "NEW_FUND" })}
                className="px-3 py-1 bg-cyan-500 text-black rounded text-xs font-semibold hover:bg-cyan-400"
              >
                + {t.addNew}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2 px-3">Ticker</th>
                    <th className="py-2 px-3 text-right">{t.units}</th>
                    <th className="py-2 px-3 text-right">{t.latestNAV}</th>
                    <th className="py-2 px-3 text-right">{t.currentValuation}</th>
                    <th className="py-2 px-3 text-right">{t.roi}</th>
                    <th className="py-2 px-3 text-center">7D Trend</th>
                    <th className="py-2 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {state.funds.map(fund => {
                    const isExpanded = expandedRow === fund.id;
                    const marketVal = fund.unitsHeld * fund.latestNAV;
                    const totalCost = fund.unitsHeld * fund.costBasisPerUnit;
                    const roi = totalCost > 0 ? ((marketVal - totalCost) / totalCost) * 100 : 0;

                    // Sparkline SVG Points
                    const minNav = Math.min(...fund.history7d);
                    const maxNav = Math.max(...fund.history7d);
                    const range = maxNav - minNav || 1;
                    const sparkPoints = fund.history7d.map((val, i) => {
                      const x = (i / (fund.history7d.length - 1)) * 60;
                      const y = 20 - ((val - minNav) / range) * 16;
                      return `${x},${y}`;
                    }).join(" ");

                    return (
                      <React.Fragment key={fund.id}>
                        <tr className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3 px-3 font-bold text-cyan-300 flex items-center gap-2">
                            <button
                              onClick={() => setExpandedRow(isExpanded ? null : fund.id)}
                              className="text-slate-400 hover:text-cyan-400 text-xs"
                            >
                              {isExpanded ? "▼" : "▶"}
                            </button>
                            {fund.ticker}
                          </td>
                          <td className="py-3 px-3 text-right font-mono">{fund.unitsHeld.toFixed(2)}</td>
                          <td className="py-3 px-3 text-right font-mono text-slate-200">{fund.latestNAV.toLocaleString()} ₫</td>
                          <td className="py-3 px-3 text-right font-mono text-emerald-400 font-semibold">{fmt(marketVal, "VND")}</td>
                          <td className={`py-3 px-3 text-right font-mono ${roi >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {roi >= 0 ? "+" : ""}{roi.toFixed(2)}%
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="w-16 h-6 inline-block">
                              <svg className="w-full h-full" viewBox="0 0 60 22">
                                <polyline
                                  fill="none"
                                  stroke={roi >= 0 ? "#10B981" : "#F43F5E"}
                                  strokeWidth="1.8"
                                  points={sparkPoints}
                                />
                              </svg>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right space-x-1.5">
                            <button
                              onClick={() => handleUpdateNAV(fund.id)}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[11px]"
                            >
                              {t.updateNAV}
                            </button>
                            <button
                              onClick={() => setFundTxModal({ fundId: fund.id, ticker: fund.ticker, type: "Buy", nav: fund.latestNAV })}
                              className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[11px] hover:bg-emerald-900"
                            >
                              {t.buy}
                            </button>
                            <button
                              onClick={() => setFundTxModal({ fundId: fund.id, ticker: fund.ticker, type: "Sell", nav: fund.latestNAV })}
                              className="px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-800 rounded text-[11px] hover:bg-rose-900"
                            >
                              {t.sell}
                            </button>
                          </td>
                        </tr>

                        {/* Indented Transaction Ledger */}
                        {isExpanded && (
                          <tr className="bg-slate-950/60">
                            <td colSpan="7" className="py-2.5 px-6 pl-10 border-l-2 border-rose-500">
                              <div className="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                                {t.history} ({fund.ticker})
                              </div>
                              <div className="space-y-1">
                                {fund.transactions.map((tx) => (
                                  <div key={tx.id} className="flex items-center justify-between text-xs font-mono text-slate-300 bg-slate-900/60 px-3 py-1 rounded border border-slate-800">
                                    <div className="flex items-center gap-3">
                                      <span className="text-slate-500">{tx.date}</span>
                                      <span className={`px-1.5 py-0.2 rounded text-[10px] ${tx.type === "Buy" ? "bg-emerald-900 text-emerald-300" : "bg-rose-900 text-rose-300"}`}>{tx.type}</span>
                                      <span>{tx.units} Units @ {tx.nav.toLocaleString()} ₫</span>
                                    </div>
                                    <span className="font-semibold text-slate-200">{tx.total.toLocaleString()} ₫</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: REAL ESTATE & ASSETS */}
        {activeTab === "assets" && (
          <div className="bg-[#101522] border border-slate-800 rounded p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-200">{t.assetsTab}</h2>
                <p className="text-[11px] text-slate-400">Valuation, Debt Balances & Net Equity Tracking</p>
              </div>
              <button
                onClick={() => setEditModal({ type: "NEW_ASSET" })}
                className="px-3 py-1 bg-cyan-500 text-black rounded text-xs font-semibold hover:bg-cyan-400"
              >
                + {t.addNew}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {state.assets.map(asset => {
                const equity = Math.max(0, asset.valuation - asset.debt);
                return (
                  <div key={asset.id} className="bg-slate-900/60 border border-slate-800 rounded p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 text-sm">{asset.name}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-amber-900/50">
                        {asset.type}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 font-mono">
                      <div>
                        <div className="text-slate-500 text-[10px]">{t.currentValuation}</div>
                        <div className="text-slate-200 font-medium">{fmt(asset.valuation, asset.currency)}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-[10px]">{t.debt}</div>
                        <div className="text-rose-400 font-medium">{fmt(asset.debt, asset.currency)}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-[10px]">{t.equity}</div>
                        <div className="text-cyan-300 font-bold">{fmt(equity, asset.currency)}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Acquired: {asset.purchaseDate}</span>
                      <div className="space-x-2">
                        <button
                          onClick={() => setEditModal({ type: "EDIT_ASSET", data: asset })}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded"
                        >
                          {t.edit}
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Delete asset?")) {
                              setState(p => ({ ...p, assets: p.assets.filter(a => a.id !== asset.id) }));
                            }
                          }}
                          className="px-2 py-0.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded"
                        >
                          {t.delete}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: CASHFLOW STREAMS */}
        {activeTab === "streams" && (
          <div className="bg-[#101522] border border-slate-800 rounded p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-200">{t.streamsTab}</h2>
                <p className="text-[11px] text-slate-400">Income Inflows & Recurring Savings Pipeline</p>
              </div>
              <button
                onClick={() => setEditModal({ type: "NEW_CASHFLOW" })}
                className="px-3 py-1 bg-cyan-500 text-black rounded text-xs font-semibold hover:bg-cyan-400"
              >
                + {t.addNew}
              </button>
            </div>

            <div className="space-y-2">
              {state.cashflows.map(cf => (
                <div key={cf.id} className="flex flex-wrap items-center justify-between bg-slate-900/60 border border-slate-800 p-3 rounded text-xs gap-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-200 flex items-center gap-2">
                      {cf.title}
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {cf.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Inflow: <strong className="text-slate-200">{fmt(cf.amount, cf.currency)}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500">{t.totalMonthlySavings}</div>
                      <div className="text-emerald-400 font-bold font-mono">
                        {fmt(cf.allocatedSavings, cf.currency)} ({((cf.allocatedSavings / cf.amount) * 100).toFixed(0)}%)
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditModal({ type: "EDIT_CASHFLOW", data: cf })}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs"
                      >
                        {t.edit}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("Delete cashflow stream?")) {
                            setState(p => ({ ...p, cashflows: p.cashflows.filter(c => c.id !== cf.id) }));
                          }
                        }}
                        className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded text-xs"
                      >
                        {t.delete}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* MODAL: TOP-UP INJECTION */}
      {topUpModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleExecuteTopUp} className="bg-[#101522] border border-slate-700 rounded-lg max-w-sm w-full p-4 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
              {t.topUp} — {topUpModal.bank}
            </h3>
            <div>
              <label className="text-slate-400 block mb-1">Deposit Amount ({topUpModal.accountType === "KR" ? "KRW" : "VND"})</label>
              <input
                type="number"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 font-mono text-sm"
                placeholder="1000000"
                onChange={e => setTopUpModal(p => ({ ...p, amount: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Effective Date</label>
              <input
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 text-xs"
                onChange={e => setTopUpModal(p => ({ ...p, date: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setTopUpModal(null)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-cyan-500 text-black font-semibold rounded hover:bg-cyan-400"
              >
                Confirm
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: FUND BUY / SELL */}
      {fundTxModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleExecuteFundTx} className="bg-[#101522] border border-slate-700 rounded-lg max-w-sm w-full p-4 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
              {fundTxModal.type} — {fundTxModal.ticker}
            </h3>
            <div>
              <label className="text-slate-400 block mb-1">Units</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                onChange={e => setFundTxModal(p => ({ ...p, units: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Execution NAV (VND)</label>
              <input
                type="number"
                defaultValue={fundTxModal.nav}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                onChange={e => setFundTxModal(p => ({ ...p, nav: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setFundTxModal(null)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className={`px-3 py-1.5 font-semibold rounded ${fundTxModal.type === "Buy" ? "bg-emerald-500 text-black hover:bg-emerald-400" : "bg-rose-500 text-black hover:bg-rose-400"}`}
              >
                Confirm {fundTxModal.type}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
