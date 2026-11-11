import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Lock,
  Globe,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Building,
  Coins,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  PlusCircle,
  Trash2,
  Download,
  Upload,
  Calendar,
  AlertTriangle,
  History,
  FileSpreadsheet,
  CheckCircle2,
  PieChart as PieIcon,
  LogOut
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// --- TYPES & INTERFACES ---
type Lang = 'EN' | 'KO';
type BaseCurrency = 'USD' | 'KRW' | 'VND';

interface SubPot {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
}

interface KoreaParkingAccount {
  id: string;
  bankName: string;
  balance: number;
  interestRate: number; // % annual
  subPots: SubPot[];
}

interface PartialWithdrawal {
  date: string;
  principal: number;
  interestPaid: number;
}

interface KoreaSavingsAccount {
  id: string;
  type: 'FIXED_TERM' | 'INSTALLMENT' | 'GULBI';
  bankName: string;
  accountName: string;
  principal: number;
  monthlyDeposit?: number;
  interestRate: number; // %
  taxRate: number; // % default 15.4
  startDate: string;
  maturityDate: string;
  status: 'ACTIVE' | 'TERMINATED' | 'MATURED';
  partialWithdrawals: PartialWithdrawal[];
  actualPayoutOverride?: number;
}

interface VietnamParkingAccount {
  id: string;
  bankName: string;
  balance: number;
  interestRate: number;
}

interface VietnamFixedDeposit {
  id: string;
  bankName: string;
  principal: number;
  interestRate: number; // %
  termMonths: number;
  startDate: string;
  maturityDate: string;
  status: 'ACTIVE' | 'TERMINATED' | 'MATURED';
  liquidateDemandRate?: number;
  actualPayoutOverride?: number;
}

interface VietnamGoalSaving {
  id: string;
  name: string;
  targetMaturityDate: string; // e.g. YYYY-05-09
  monthlyAutoDeposit: number;
  balance: number;
  interestRate: number;
}

interface MutualFund {
  id: string;
  ticker: string; // e.g. MBBOND, MBVF, DCDS, VESAF
  units: number;
  avgBuyPrice: number; // VND
  currentNav: number; // VND
  lastUpdated: string;
  sparkline: number[];
}

interface PhysicalAsset {
  id: string;
  type: 'REAL_ESTATE' | 'GOLD' | 'OTHER';
  name: string;
  purchaseDate: string;
  purchasePrice: number;
  currency: BaseCurrency;
  currentValuation: number;
  lastValuationDate: string;
  soldDate?: string;
  realizedPrice?: number;
}

interface Liability {
  id: string;
  name: string;
  category: 'TENANT_DEPOSIT' | 'LOAN' | 'CREDIT_CARD';
  amount: number;
  currency: BaseCurrency;
  dueDate?: string;
  note?: string;
}

interface CashflowLog {
  id: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  category: 'Salary' | 'Rental' | 'Living' | 'Education' | 'Incidental' | 'Other';
  amount: number;
  currency: BaseCurrency;
  description: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  amountChanged?: string;
}

interface FxRates {
  USD_KRW: number;
  USD_VND: number;
  KRW_VND: number;
}

// --- I18N DICTIONARY ---
const I18N = {
  EN: {
    title: 'Youmelittlepenny',
    authPlaceholder: 'Enter Vault Password',
    authSubmit: 'Unlock Vault',
    authError: 'Invalid master passcode.',
    dashboard: 'Dashboard',
    korea: 'Korea Finance',
    vietnam: 'Vietnam Finance',
    investments: 'Investments & Assets',
    cashflow: 'Cashflow & Budget',
    liabilities: 'Liabilities & Held Deposits',
    history: 'Audit Ledger',
    settings: 'Settings & Cloud Sync',
    netWorth: 'Global Net Worth',
    totalAssets: 'Total Assets',
    totalLiabilities: 'Total Liabilities',
    baseCurrency: 'Base Display',
    syncNow: 'Sync to Google Sheets',
    syncSuccess: 'Synced successfully to Google Drive / Finance / Report!',
    syncFailed: 'Sync failed. Verify Apps Script Webhook URL.',
    allocation: 'Asset Allocation',
    trend: 'Net Worth Trajectory',
    parkingAcc: 'Parking Accounts',
    addSubPot: 'Add Sub-Pot',
    subPots: 'Sub-Pots (Pockets)',
    termSavings: 'Term & Installment Savings',
    createSaving: 'Open Savings Account',
    withdrawn: 'Withdrawn',
    partialWithdraw: 'Partial Early Withdrawal (Max 2)',
    remainingPrincipal: 'Remaining Principal',
    earlyTermination: 'Early Termination',
    payoutPreTax: 'Expected (Pre-tax)',
    payoutPostTax: 'Expected (Post-tax)',
    vietnamDeposits: 'Fixed-Term Deposits',
    openDeposit: 'Add Term Deposit',
    goalSavings: 'Flexible Goal Accumulation',
    openGoal: 'Set Target Goal',
    mutualFunds: 'Vietnam Mutual Funds (CCQ)',
    fetchNav: 'Fetch Latest NAV',
    addFund: 'Add Fund Ticker',
    roi: 'Unrealized ROI',
    marketValue: 'Market Value',
    realEstateGold: 'Real Estate & Physical Gold',
    addAsset: 'Register Asset',
    deductParking: 'Funded from Parking Account (Auto-Deduct)',
    liabilitiesTitle: 'Liabilities & Security Deposits Held',
    addLiability: 'Add Liability / Tenant Deposit',
    tenantDepositNote: 'Refundable deposits held are balanced against total assets.',
    cashflowTitle: 'Multi-Period Cashflow Tracker',
    addCashflow: 'Log Entry',
    income: 'Income',
    expense: 'Expense',
    periodAll: 'All',
    periodDay: 'Daily',
    periodWeek: 'Weekly',
    periodMonth: 'Monthly',
    periodQuarter: 'Quarterly',
    periodYear: 'Yearly',
    savingsRate: 'Savings Rate',
    auditLogs: 'Account History & Audit Logs',
    gasWebhookUrl: 'Google Apps Script Webhook URL',
    saveSettings: 'Save Settings',
    exportJson: 'Export Backup (JSON)',
    importJson: 'Import Backup (JSON)',
    logout: 'Lock Vault'
  },
  KO: {
    title: 'Youmelittlepenny',
    authPlaceholder: '볼트 비밀번호를 입력하세요',
    authSubmit: '보관함 잠금해제',
    authError: '비밀번호가 올바르지 않습니다.',
    dashboard: '대시보드',
    korea: '한국 금융 (KRW)',
    vietnam: '베트남 금융 (VND)',
    investments: '투자 & 실물자산',
    cashflow: '현금흐름 & 지출',
    liabilities: '부채 & 보관 보증금',
    history: '거래 내역 & 감사 로그',
    settings: '설정 & 구글 드라이브 동기화',
    netWorth: '총 순자산',
    totalAssets: '총 자산',
    totalLiabilities: '총 부채',
    baseCurrency: '기준 통화',
    syncNow: '구글 시트 즉시 동기화',
    syncSuccess: '구글 드라이브 / Finance / Report 에 성공적으로 동기화되었습니다!',
    syncFailed: '동기화 실패. Apps Script URL을 확인하세요.',
    allocation: '자산 배분 비율',
    trend: '순자산 추이',
    parkingAcc: '파킹통장 관리',
    addSubPot: '나눠모으기 생성',
    subPots: '나눠모으기 (목적별 보관함)',
    termSavings: '정기예금 / 적금 / 굴비적금',
    createSaving: '신규 적금/예금 등록',
    withdrawn: '중도인출 완료',
    partialWithdraw: '중도인출 실행 (최대 2회)',
    remainingPrincipal: '잔여 원금',
    earlyTermination: '중도해지 처리',
    payoutPreTax: '만기예정 (세전)',
    payoutPostTax: '만기예정 (세후)',
    vietnamDeposits: '정기예금 (VND)',
    openDeposit: '예금 등록',
    goalSavings: '목표 지향형 적립 적금',
    openGoal: '목표 설정',
    mutualFunds: '베트남 공모펀드 (CCQ)',
    fetchNav: '기준가(NAV) 일괄 조회',
    addFund: '펀드 추가',
    roi: '평가손익률',
    marketValue: '평가금액',
    realEstateGold: '부동산 & 골드 자산',
    addAsset: '신규 자산 등록',
    deductParking: '파킹통장에서 직접 출금 (원금 자동 차감)',
    liabilitiesTitle: '부채 및 반환 보증금 관리',
    addLiability: '부채 / 임대보증금 추가',
    tenantDepositNote: '임차인 반환 보증금은 총 자산에서 즉시 상쇄됩니다.',
    cashflowTitle: '기간별 수입/지출 관리',
    addCashflow: '내역 기록',
    income: '수입',
    expense: '지출',
    periodAll: '전체',
    periodDay: '일간',
    periodWeek: '주간',
    periodMonth: '월간',
    periodQuarter: '분기',
    periodYear: '연간',
    savingsRate: '저축률',
    auditLogs: '통합 계좌 활동 내역',
    gasWebhookUrl: 'Google Apps Script 웹앱 URL',
    saveSettings: '설정 저장',
    exportJson: '백업 내역 내보내기 (JSON)',
    importJson: '백업 데이터 가져오기 (JSON)',
    logout: '보관함 잠금'
  }
};

const DEFAULT_FX: FxRates = {
  USD_KRW: 1380,
  USD_VND: 25400,
  KRW_VND: 18.4
};

export default function App() {
  // Access Protection
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('vault_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // General App Config
  const [lang, setLang] = useState<Lang>('EN');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [baseCurrency, setBaseCurrency] = useState<BaseCurrency>('USD');
  const [fxRates, setFxRates] = useState<FxRates>(() => {
    const saved = localStorage.getItem('vault_fx');
    return saved ? JSON.parse(saved) : DEFAULT_FX;
  });
  const [gasWebhookUrl, setGasWebhookUrl] = useState<string>(() => {
    return localStorage.getItem('vault_gas_url') || '';
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Financial Domain States
  const [krwParking, setKrwParking] = useState<KoreaParkingAccount[]>(() => {
    const saved = localStorage.getItem('vault_krw_parking');
    return saved ? JSON.parse(saved) : [
      {
        id: 'kp-1',
        bankName: 'Toss Bank',
        balance: 9000000,
        interestRate: 2.0,
        subPots: [{ id: 'sp-1', name: 'Study & PhD Fund', targetAmount: 2000000, currentAmount: 765000 }]
      }
    ];
  });

  const [krwSavings, setKrwSavings] = useState<KoreaSavingsAccount[]>(() => {
    const saved = localStorage.getItem('vault_krw_savings');
    return saved ? JSON.parse(saved) : [];
  });

  const [vndParking, setVndParking] = useState<VietnamParkingAccount[]>(() => {
    const saved = localStorage.getItem('vault_vnd_parking');
    return saved ? JSON.parse(saved) : [
      { id: 'vp-1', bankName: 'Techcombank', balance: 6000000, interestRate: 0.2 }
    ];
  });

  const [vndDeposits, setVndDeposits] = useState<VietnamFixedDeposit[]>(() => {
    const saved = localStorage.getItem('vault_vnd_deposits');
    return saved ? JSON.parse(saved) : [];
  });

  const [vndGoals, setVndGoals] = useState<VietnamGoalSaving[]>(() => {
    const saved = localStorage.getItem('vault_vnd_goals');
    return saved ? JSON.parse(saved) : [
      { id: 'vg-1', name: 'Annual May 9 Target', targetMaturityDate: '2027-05-09', monthlyAutoDeposit: 3000000, balance: 3000000, interestRate: 5.5 }
    ];
  });

  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>(() => {
    const saved = localStorage.getItem('vault_funds');
    return saved ? JSON.parse(saved) : [
      {
        id: 'mf-1',
        ticker: 'MBBOND',
        units: 65.5,
        avgBuyPrice: 15267,
        currentNav: 15450,
        lastUpdated: new Date().toISOString().split('T')[0],
        sparkline: [15100, 15180, 15250, 15300, 15450]
      }
    ];
  });

  const [physicalAssets, setPhysicalAssets] = useState<PhysicalAsset[]>(() => {
    const saved = localStorage.getItem('vault_assets');
    return saved ? JSON.parse(saved) : [
      {
        id: 'pa-1',
        type: 'REAL_ESTATE',
        name: 'Apartment Unit 12B',
        purchaseDate: '2023-01-15',
        purchasePrice: 2000000000,
        currency: 'VND',
        currentValuation: 2150000000,
        lastValuationDate: new Date().toISOString().split('T')[0]
      }
    ];
  });

  const [liabilities, setLiabilities] = useState<Liability[]>(() => {
    const saved = localStorage.getItem('vault_liabilities');
    return saved ? JSON.parse(saved) : [
      {
        id: 'liab-1',
        name: 'Tenant Rental Deposit Held',
        category: 'TENANT_DEPOSIT',
        amount: 14000000,
        currency: 'VND',
        note: 'Refundable security deposit for apartment tenant'
      }
    ];
  });

  const [cashflows, setCashflows] = useState<CashflowLog[]>(() => {
    const saved = localStorage.getItem('vault_cashflows');
    return saved ? JSON.parse(saved) : [
      {
        id: 'cf-1',
        date: new Date().toISOString().split('T')[0],
        type: 'INCOME',
        category: 'Salary',
        amount: 2414477,
        currency: 'KRW',
        description: 'Design Salary Korea'
      },
      {
        id: 'cf-2',
        date: new Date().toISOString().split('T')[0],
        type: 'INCOME',
        category: 'Rental',
        amount: 7300000,
        currency: 'VND',
        description: 'Apartment Monthly Rental'
      }
    ];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('vault_audit');
    return saved ? JSON.parse(saved) : [];
  });

  // LocalStorage Persistence
  useEffect(() => {
    localStorage.setItem('vault_krw_parking', JSON.stringify(krwParking));
    localStorage.setItem('vault_krw_savings', JSON.stringify(krwSavings));
    localStorage.setItem('vault_vnd_parking', JSON.stringify(vndParking));
    localStorage.setItem('vault_vnd_deposits', JSON.stringify(vndDeposits));
    localStorage.setItem('vault_vnd_goals', JSON.stringify(vndGoals));
    localStorage.setItem('vault_funds', JSON.stringify(mutualFunds));
    localStorage.setItem('vault_assets', JSON.stringify(physicalAssets));
    localStorage.setItem('vault_liabilities', JSON.stringify(liabilities));
    localStorage.setItem('vault_cashflows', JSON.stringify(cashflows));
    localStorage.setItem('vault_audit', JSON.stringify(auditLogs));
    localStorage.setItem('vault_fx', JSON.stringify(fxRates));
    localStorage.setItem('vault_gas_url', gasWebhookUrl);
  }, [
    krwParking,
    krwSavings,
    vndParking,
    vndDeposits,
    vndGoals,
    mutualFunds,
    physicalAssets,
    liabilities,
    cashflows,
    auditLogs,
    fxRates,
    gasWebhookUrl
  ]);

  const t = I18N[lang];

  // Audit Logger helper
  const addAudit = (action: string, details: string, amountChanged?: string) => {
    const log: AuditLog = {
      id: 'aud-' + Date.now(),
      timestamp: new Date().toLocaleString(),
      action,
      details,
      amountChanged
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  // FX Conversion Utility
  const convertAmount = (amount: number, from: BaseCurrency, to: BaseCurrency): number => {
    if (from === to) return amount;
    let inUSD = 0;
    if (from === 'USD') inUSD = amount;
    else if (from === 'KRW') inUSD = amount / (fxRates.USD_KRW || 1);
    else if (from === 'VND') inUSD = amount / (fxRates.USD_VND || 1);

    if (to === 'USD') return inUSD;
    if (to === 'KRW') return inUSD * (fxRates.USD_KRW || 1);
    if (to === 'VND') return inUSD * (fxRates.USD_VND || 1);
    return amount;
  };

  const formatCurrency = (amount: number, currency: BaseCurrency) => {
    if (currency === 'USD') {
      return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (currency === 'KRW') {
      return `₩${Math.round(amount).toLocaleString()}`;
    }
    return `₫${Math.round(amount).toLocaleString()}`;
  };

  // --- NET WORTH COMPUTATION ---
  const totals = useMemo(() => {
    // 1. Korea Cash & Savings (KRW)
    const krwCash = krwParking.reduce((sum, p) => sum + p.balance, 0);
    const krwTerm = krwSavings
      .filter((s) => s.status === 'ACTIVE')
      .reduce((sum, s) => sum + s.principal, 0);
    const krwTotal = krwCash + krwTerm;

    // 2. Vietnam Cash & Deposits (VND)
    const vndCash = vndParking.reduce((sum, p) => sum + p.balance, 0);
    const vndTerm = vndDeposits
      .filter((d) => d.status === 'ACTIVE')
      .reduce((sum, d) => sum + d.principal, 0);
    const vndGoal = vndGoals.reduce((sum, g) => sum + g.balance, 0);
    const vndSavingsTotal = vndCash + vndTerm + vndGoal;

    // 3. Mutual Funds (VND)
    const fundsVnd = mutualFunds.reduce((sum, f) => sum + f.units * f.currentNav, 0);

    // 4. Physical Assets (Converted to selected base)
    const physicalBase = physicalAssets
      .filter((a) => !a.soldDate)
      .reduce((sum, a) => sum + convertAmount(a.currentValuation, a.currency, baseCurrency), 0);

    // Total Assets in USD
    const totalAssetsUSD =
      convertAmount(krwTotal, 'KRW', 'USD') +
      convertAmount(vndSavingsTotal + fundsVnd, 'VND', 'USD') +
      convertAmount(physicalBase, baseCurrency, 'USD');

    // Total Liabilities in USD
    const totalLiabilitiesUSD = liabilities.reduce(
      (sum, l) => sum + convertAmount(l.amount, l.currency, 'USD'),
      0
    );

    const netWorthUSD = totalAssetsUSD - totalLiabilitiesUSD;

    return {
      netWorthUSD,
      netWorthKRW: convertAmount(netWorthUSD, 'USD', 'KRW'),
      netWorthVND: convertAmount(netWorthUSD, 'USD', 'VND'),
      totalAssetsUSD,
      totalLiabilitiesUSD,
      krwCashUSD: convertAmount(krwCash, 'KRW', 'USD'),
      vndCashUSD: convertAmount(vndCash, 'VND', 'USD'),
      termSavingsUSD:
        convertAmount(krwTerm, 'KRW', 'USD') + convertAmount(vndTerm + vndGoal, 'VND', 'USD'),
      fundsUSD: convertAmount(fundsVnd, 'VND', 'USD'),
      physicalAssetsUSD: convertAmount(physicalBase, baseCurrency, 'USD')
    };
  }, [
    krwParking,
    krwSavings,
    vndParking,
    vndDeposits,
    vndGoals,
    mutualFunds,
    physicalAssets,
    liabilities,
    baseCurrency,
    fxRates
  ]);

  // Asset Allocation Data for Donut Chart
  const allocationData = useMemo(() => {
    return [
      { name: 'Liquid Cash (KRW & VND)', value: totals.krwCashUSD + totals.vndCashUSD, color: '#06b6d4' },
      { name: 'Term & Goal Savings', value: totals.termSavingsUSD, color: '#3b82f6' },
      { name: 'Mutual Funds (CCQ)', value: totals.fundsUSD, color: '#10b981' },
      { name: 'Real Estate & Gold', value: totals.physicalAssetsUSD, color: '#f59e0b' }
    ].filter((item) => item.value > 0);
  }, [totals]);

  // Mock Sparkline data for Net Worth Trajectory
  const sparklineHistory = useMemo(() => {
    const current = convertAmount(totals.netWorthUSD, 'USD', baseCurrency);
    return [
      { name: 'T-90', value: current * 0.94 },
      { name: 'T-60', value: current * 0.96 },
      { name: 'T-30', value: current * 0.98 },
      { name: 'Today', value: current }
    ];
  }, [totals.netWorthUSD, baseCurrency]);

  // Password Login Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '$1Million') {
      setIsAuthenticated(true);
      sessionStorage.setItem('vault_auth', 'true');
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('vault_auth');
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // --- AUTOMATED NAV FETCHER (Via CORS Proxy / Direct) ---
  const handleFetchNAV = async () => {
    addAudit('NAV Fetch', 'Triggered external NAV update check for Mutual Funds.');
    try {
      // Free public CORS proxy calling Fmarket open catalog
      const proxyUrl = 'https://api.allorigins.win/get?url=';
      const targetApi = encodeURIComponent('https://api.fmarket.vn/res/products/filter');
      const response = await fetch(`${proxyUrl}${targetApi}`);
      if (!response.ok) throw new Error('Proxy connection error');
      const json = await response.json();
      const payload = JSON.parse(json.contents);

      if (payload && payload.data && Array.isArray(payload.data.rows)) {
        let updatedCount = 0;
        setMutualFunds((prev) =>
          prev.map((fund) => {
            const match = payload.data.rows.find(
              (r: any) => r.code?.toUpperCase() === fund.ticker.toUpperCase()
            );
            if (match && match.nav) {
              updatedCount++;
              const newNav = match.nav;
              return {
                ...fund,
                currentNav: newNav,
                lastUpdated: new Date().toISOString().split('T')[0],
                sparkline: [...fund.sparkline.slice(-5), newNav]
              };
            }
            return fund;
          })
        );
        alert(`Successfully updated ${updatedCount} fund(s) from live market feed.`);
      }
    } catch (err) {
      alert('Live fetch unavailable (CORS or provider offline). You can override NAV manually.');
    }
  };

  // --- CLOUD SYNC ENGINE (Google Apps Script) ---
  const handleSyncToSheets = async () => {
    if (!gasWebhookUrl) {
      alert('Please set your Google Apps Script Webhook URL in Settings first.');
      setActiveTab('settings');
      return;
    }

    setIsSyncing(true);
    setSyncMessage(null);

    const payload = {
      timestamp: new Date().toISOString(),
      netWorth: {
        baseCurrency,
        totalAssetsUSD: totals.totalAssetsUSD,
        totalLiabilitiesUSD: totals.totalLiabilitiesUSD,
        netWorthUSD: totals.netWorthUSD,
        netWorthKRW: totals.netWorthKRW,
        netWorthVND: totals.netWorthVND
      },
      accounts: [
        ...krwParking.map((p) => ({
          country: 'Korea',
          type: 'Parking',
          bankName: p.bankName,
          principal: p.balance,
          currency: 'KRW',
          interestRate: p.interestRate
        })),
        ...krwSavings.map((s) => ({
          country: 'Korea',
          type: s.type,
          bankName: s.bankName,
          principal: s.principal,
          currency: 'KRW',
          interestRate: s.interestRate,
          maturityDate: s.maturityDate
        })),
        ...vndParking.map((p) => ({
          country: 'Vietnam',
          type: 'Parking',
          bankName: p.bankName,
          principal: p.balance,
          currency: 'VND',
          interestRate: p.interestRate
        })),
        ...vndDeposits.map((d) => ({
          country: 'Vietnam',
          type: 'Term Deposit',
          bankName: d.bankName,
          principal: d.principal,
          currency: 'VND',
          interestRate: d.interestRate,
          maturityDate: d.maturityDate
        }))
      ],
      cashflow: cashflows
    };

    try {
      await fetch(gasWebhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setSyncMessage(t.syncSuccess);
      addAudit('Cloud Sync', 'Payload successfully sent to Google Apps Script.');
    } catch (err: any) {
      setSyncMessage(t.syncFailed);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- SUB-POT ALLOCATION LOGIC ---
  const handleCreateSubPot = (parkingId: string, name: string, amount: number) => {
    if (amount <= 0) return;
    setKrwParking((prev) =>
      prev.map((p) => {
        if (p.id === parkingId) {
          if (p.balance < amount) {
            alert('Insufficient primary parking balance.');
            return p;
          }
          const updatedBalance = p.balance - amount;
          const newSubPot: SubPot = {
            id: 'sp-' + Date.now(),
            name,
            targetAmount: amount,
            currentAmount: amount
          };
          addAudit(
            'Sub-pot Allocated',
            `Transferred ₩${amount.toLocaleString()} from ${p.bankName} to Sub-pot: ${name}`,
            `-₩${amount.toLocaleString()}`
          );
          return {
            ...p,
            balance: updatedBalance,
            subPots: [...p.subPots, newSubPot]
          };
        }
        return p;
      })
    );
  };

  // --- PARTIAL WITHDRAWAL LOGIC (KOREA) ---
  const handlePartialWithdrawal = (
    savingsId: string,
    principalWithdrawn: number,
    interestPayout: number
  ) => {
    setKrwSavings((prev) =>
      prev.map((s) => {
        if (s.id === savingsId) {
          if (s.partialWithdrawals.length >= 2) {
            alert('Maximum 2 partial early withdrawals permitted per regulation.');
            return s;
          }
          if (principalWithdrawn > s.principal) {
            alert('Cannot withdraw more than existing principal.');
            return s;
          }
          const remaining = s.principal - principalWithdrawn;
          const updatedWithdrawals: PartialWithdrawal[] = [
            ...s.partialWithdrawals,
            {
              date: new Date().toISOString().split('T')[0],
              principal: principalWithdrawn,
              interestPaid: interestPayout
            }
          ];
          addAudit(
            'Partial Early Withdrawal (중도인출)',
            `Withdrew ₩${principalWithdrawn.toLocaleString()} early from ${s.bankName} (${s.accountName}). Received Interest: ₩${interestPayout.toLocaleString()}`,
            `Remaining: ₩${remaining.toLocaleString()}`
          );
          return {
            ...s,
            principal: remaining,
            partialWithdrawals: updatedWithdrawals
          };
        }
        return s;
      })
    );
  };

  // Backup Export/Import
  const exportJsonBackup = () => {
    const data = {
      krwParking,
      krwSavings,
      vndParking,
      vndDeposits,
      vndGoals,
      mutualFunds,
      physicalAssets,
      liabilities,
      cashflows,
      auditLogs,
      fxRates
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Youmelittlepenny_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importJsonBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.krwParking) setKrwParking(parsed.krwParking);
        if (parsed.krwSavings) setKrwSavings(parsed.krwSavings);
        if (parsed.vndParking) setVndParking(parsed.vndParking);
        if (parsed.vndDeposits) setVndDeposits(parsed.vndDeposits);
        if (parsed.vndGoals) setVndGoals(parsed.vndGoals);
        if (parsed.mutualFunds) setMutualFunds(parsed.mutualFunds);
        if (parsed.physicalAssets) setPhysicalAssets(parsed.physicalAssets);
        if (parsed.liabilities) setLiabilities(parsed.liabilities);
        if (parsed.cashflows) setCashflows(parsed.cashflows);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.fxRates) setFxRates(parsed.fxRates);
        alert('Data imported successfully!');
      } catch (err) {
        alert('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  // --- PASSWORD LOCK MODAL ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-100 font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500" />
          <div className="flex flex-col items-center mb-6">
            <div className="p-3 bg-slate-800 rounded-full mb-3 text-cyan-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{t.title}</h1>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Multi-Currency Wealth OS</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Passcode</label>
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder={t.authPlaceholder}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
              </div>
            </div>

            {authError && (
              <p className="text-xs text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {t.authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium py-2.5 rounded-lg text-sm transition-all shadow-lg shadow-cyan-950/50"
            >
              {t.authSubmit}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* --- TOP STICKY BAR --- */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Net Worth Quick Stat */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-cyan-500/20">
              Y
            </div>
            <div>
              <span className="font-bold text-sm tracking-wide text-white block">{t.title}</span>
              <span className="text-[10px] text-cyan-400 font-mono tracking-wider">SECURE VAULT</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5">
            <div className="text-xs">
              <span className="text-slate-400 mr-2">{t.netWorth}:</span>
              <span className="font-bold text-cyan-400 font-mono">
                {baseCurrency === 'USD' && formatCurrency(totals.netWorthUSD, 'USD')}
                {baseCurrency === 'KRW' && formatCurrency(totals.netWorthKRW, 'KRW')}
                {baseCurrency === 'VND' && formatCurrency(totals.netWorthVND, 'VND')}
              </span>
            </div>
          </div>
        </div>

        {/* Live FX Rates Ticker */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">USD/KRW:</span>
            <span className="text-slate-200">₩{fxRates.USD_KRW.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">USD/VND:</span>
            <span className="text-slate-200">₫{fxRates.USD_VND.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">KRW/VND:</span>
            <span className="text-slate-200">₫{fxRates.KRW_VND}</span>
          </div>
        </div>

        {/* Actions & Toggles */}
        <div className="flex items-center gap-3">
          {/* Base Currency Selector */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-medium">
            {(['USD', 'KRW', 'VND'] as BaseCurrency[]).map((cur) => (
              <button
                key={cur}
                onClick={() => setBaseCurrency(cur)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  baseCurrency === cur ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {cur}
              </button>
            ))}
          </div>

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'EN' ? 'KO' : 'EN')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">{lang}</span>
          </button>

          {/* Sync Trigger */}
          <button
            onClick={handleSyncToSheets}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 text-xs hover:bg-emerald-600/30 transition-all font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{t.syncNow}</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title={t.logout}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Sync notification banner */}
      {syncMessage && (
        <div className="bg-emerald-950/80 border-b border-emerald-800 px-4 py-2 text-xs text-emerald-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {syncMessage}
          </span>
          <button onClick={() => setSyncMessage(null)} className="text-emerald-400 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* --- TAB NAVIGATION --- */}
      <nav className="bg-slate-900 border-b border-slate-800 px-4 overflow-x-auto flex gap-1">
        {[
          { id: 'dashboard', label: t.dashboard, icon: PieIcon },
          { id: 'korea', label: t.korea, icon: Coins },
          { id: 'vietnam', label: t.vietnam, icon: Wallet },
          { id: 'investments', label: t.investments, icon: TrendingUp },
          { id: 'cashflow', label: t.cashflow, icon: ArrowUpRight },
          { id: 'liabilities', label: t.liabilities, icon: AlertTriangle },
          { id: 'history', label: t.history, icon: History },
          { id: 'settings', label: t.settings, icon: FileSpreadsheet }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* --- MAIN TAB ROUTING & VIEWS --- */}
      <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* ==================== TAB 1: DASHBOARD ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Global Net Worth KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.netWorth} (USD)</p>
                <h2 className="text-2xl font-bold font-mono text-cyan-400 mt-2">
                  {formatCurrency(totals.netWorthUSD, 'USD')}
                </h2>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                  <span>Assets: {formatCurrency(totals.totalAssetsUSD, 'USD')}</span>
                  <span>•</span>
                  <span>Liabilities: {formatCurrency(totals.totalLiabilitiesUSD, 'USD')}</span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.netWorth} (KRW)</p>
                <h2 className="text-2xl font-bold font-mono text-indigo-400 mt-2">
                  {formatCurrency(totals.netWorthKRW, 'KRW')}
                </h2>
                <p className="text-xs text-slate-500 mt-3 font-mono">1 USD = ₩{fxRates.USD_KRW.toLocaleString()}</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.netWorth} (VND)</p>
                <h2 className="text-2xl font-bold font-mono text-emerald-400 mt-2">
                  {formatCurrency(totals.netWorthVND, 'VND')}
                </h2>
                <p className="text-xs text-slate-500 mt-3 font-mono">1 USD = ₫{fxRates.USD_VND.toLocaleString()}</p>
              </div>
            </div>

            {/* Visual Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Asset Allocation Donut */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
                <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-cyan-400" /> {t.allocation}
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData}
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: number) => [
                          formatCurrency(convertAmount(val, 'USD', baseCurrency), baseCurrency),
                          'Allocation'
                        ]}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {allocationData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-400 truncate">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Net Worth Sparkline / Area */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
                <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> {t.trend} ({baseCurrency})
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparklineHistory}>
                      <defs>
                        <linearGradient id="colorNw" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} domain={['auto', 'auto']} />
                      <Tooltip
                        formatter={(val: number) => [formatCurrency(val, baseCurrency), 'Net Worth']}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} fill="url(#colorNw)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[11px] text-slate-500 text-center mt-2">
                  Calculated using live asset balance trajectories and active liabilities.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: KOREA MODULE ==================== */}
        {activeTab === 'korea' && (
          <div className="space-y-6">
            {/* Parking Accounts Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Coins className="w-4 h-4 text-cyan-400" /> {t.parkingAcc} (KRW)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {krwParking.map((acc) => (
                  <div key={acc.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-slate-200">{acc.bankName}</h4>
                        <p className="text-xs text-slate-400">Annual Yield: {acc.interestRate}%</p>
                      </div>
                      <span className="text-lg font-bold font-mono text-cyan-400">
                        ₩{acc.balance.toLocaleString()}
                      </span>
                    </div>

                    {/* Sub-Pots List */}
                    <div className="border-t border-slate-800 pt-3 space-y-2">
                      <p className="text-xs font-semibold text-slate-400">{t.subPots}:</p>
                      {acc.subPots.map((sp) => (
                        <div key={sp.id} className="bg-slate-900/60 rounded px-2.5 py-1.5 flex justify-between text-xs">
                          <span className="text-slate-300">{sp.name}</span>
                          <span className="font-mono text-indigo-400">₩{sp.currentAmount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    {/* Form to Allocate Sub-Pot */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const name = (form.elements.namedItem('potName') as HTMLInputElement).value;
                        const amount = Number((form.elements.namedItem('potAmount') as HTMLInputElement).value);
                        if (name && amount) {
                          handleCreateSubPot(acc.id, name, amount);
                          form.reset();
                        }
                      }}
                      className="flex gap-2 pt-2"
                    >
                      <input
                        name="potName"
                        type="text"
                        placeholder="Sub-pot name (e.g. Tuition)"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        required
                      />
                      <input
                        name="potAmount"
                        type="number"
                        placeholder="Amount (₩)"
                        className="w-28 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        required
                      />
                      <button
                        type="submit"
                        className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-2.5 py-1 rounded"
                      >
                        {t.addSubPot}
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </div>

            {/* Term & Installment Savings Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Coins className="w-4 h-4 text-indigo-400" /> {t.termSavings} (예금 / 적금)
                </h3>
              </div>

              {/* Savings Creation Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const bankName = (form.elements.namedItem('sBank') as HTMLInputElement).value;
                  const accountName = (form.elements.namedItem('sName') as HTMLInputElement).value;
                  const type = (form.elements.namedItem('sType') as HTMLSelectElement).value as any;
                  const principal = Number((form.elements.namedItem('sPrincipal') as HTMLInputElement).value);
                  const rate = Number((form.elements.namedItem('sRate') as HTMLInputElement).value);
                  const taxRate = Number((form.elements.namedItem('sTax') as HTMLInputElement).value) || 15.4;
                  const maturity = (form.elements.namedItem('sMaturity') as HTMLInputElement).value;

                  const newSavings: KoreaSavingsAccount = {
                    id: 'ks-' + Date.now(),
                    type,
                    bankName,
                    accountName,
                    principal,
                    interestRate: rate,
                    taxRate,
                    startDate: new Date().toISOString().split('T')[0],
                    maturityDate: maturity,
                    status: 'ACTIVE',
                    partialWithdrawals: []
                  };

                  setKrwSavings((prev) => [...prev, newSavings]);
                  addAudit('Savings Opened', `Registered Korea account ${bankName} (${accountName}): ₩${principal.toLocaleString()}`);
                  form.reset();
                }}
                className="grid grid-cols-2 md:grid-cols-7 gap-2 mb-6 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs"
              >
                <input name="sBank" placeholder="Bank Name" required className="bg-slate-900 border border-slate-700 rounded p-1.5" />
                <input name="sName" placeholder="Account Name" required className="bg-slate-900 border border-slate-700 rounded p-1.5" />
                <select name="sType" className="bg-slate-900 border border-slate-700 rounded p-1.5">
                  <option value="FIXED_TERM">예금 (Fixed Term)</option>
                  <option value="INSTALLMENT">적금 (Installment)</option>
                  <option value="GULBI">굴비적금 (Mini-Savings)</option>
                </select>
                <input name="sPrincipal" type="number" placeholder="Principal (₩)" required className="bg-slate-900 border border-slate-700 rounded p-1.5" />
                <input name="sRate" type="number" step="0.01" placeholder="Rate (%)" required className="bg-slate-900 border border-slate-700 rounded p-1.5" />
                <input name="sTax" type="number" step="0.1" defaultValue="15.4" placeholder="Tax %" className="bg-slate-900 border border-slate-700 rounded p-1.5" />
                <input name="sMaturity" type="date" required className="bg-slate-900 border border-slate-700 rounded p-1.5" />
                <button type="submit" className="col-span-2 md:col-span-7 bg-indigo-600 hover:bg-indigo-500 py-1.5 rounded font-medium mt-1">
                  {t.createSaving}
                </button>
              </form>

              {/* Savings Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {krwSavings.map((s) => {
                  const estInterest = s.principal * (s.interestRate / 100);
                  const afterTax = estInterest * (1 - s.taxRate / 100);

                  return (
                    <div key={s.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                            {s.type}
                          </span>
                          <h4 className="font-semibold text-slate-100 mt-1">{s.bankName} - {s.accountName}</h4>
                          <p className="text-xs text-slate-400">Maturity: {s.maturityDate}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold font-mono text-indigo-400 block">
                            ₩{s.principal.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400">Rate: {s.interestRate}% (Tax: {s.taxRate}%)</span>
                        </div>
                      </div>

                      {/* Calculations breakdown */}
                      <div className="bg-slate-900/50 p-2.5 rounded text-xs space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span>{t.payoutPreTax}:</span>
                          <span className="font-mono text-slate-300">₩{Math.round(s.principal + estInterest).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-emerald-400 font-semibold">
                          <span>{t.payoutPostTax}:</span>
                          <span className="font-mono">₩{Math.round(s.principal + afterTax).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Partial Early Withdrawal UI */}
                      <div className="border-t border-slate-800 pt-2 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">{t.partialWithdraw}</span>
                          <span className="text-slate-500 font-mono">Used: {s.partialWithdrawals.length}/2</span>
                        </div>

                        {s.partialWithdrawals.map((pw, i) => (
                          <div key={i} className="text-[11px] bg-slate-900 px-2 py-1 rounded flex justify-between text-slate-400">
                            <span>Withdrawal #{i + 1} ({pw.date}): ₩{pw.principal.toLocaleString()}</span>
                            <span className="text-cyan-400">Paid Interest: ₩{pw.interestPaid.toLocaleString()}</span>
                          </div>
                        ))}

                        {s.partialWithdrawals.length < 2 && (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const form = e.currentTarget;
                              const pAmt = Number((form.elements.namedItem('pwPrincipal') as HTMLInputElement).value);
                              const iAmt = Number((form.elements.namedItem('pwInterest') as HTMLInputElement).value);
                              if (pAmt) {
                                handlePartialWithdrawal(s.id, pAmt, iAmt);
                                form.reset();
                              }
                            }}
                            className="flex gap-2 pt-1"
                          >
                            <input
                              name="pwPrincipal"
                              type="number"
                              placeholder="Principal Withdrawn (₩)"
                              className="w-1/2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                              required
                            />
                            <input
                              name="pwInterest"
                              type="number"
                              placeholder="Interest Paid (₩)"
                              className="w-1/2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                              required
                            />
                            <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-2.5 py-1 rounded">
                              Submit
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: VIETNAM MODULE ==================== */}
        {activeTab === 'vietnam' && (
          <div className="space-y-6">
            {/* Vietnam Liquid Parking */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" /> Liquid Accounts (VND)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vndParking.map((acc) => (
                  <div key={acc.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-slate-200">{acc.bankName}</h4>
                      <p className="text-xs text-slate-400">Demand Rate: {acc.interestRate}%</p>
                    </div>
                    <span className="text-lg font-bold font-mono text-emerald-400">
                      ₫{acc.balance.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vietnam Fixed-Term Deposits */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-cyan-400" /> {t.vietnamDeposits}
              </h3>

              {/* Add Deposit Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const bankName = (form.elements.namedItem('vBank') as HTMLInputElement).value;
                  const principal = Number((form.elements.namedItem('vPrincipal') as HTMLInputElement).value);
                  const rate = Number((form.elements.namedItem('vRate') as HTMLInputElement).value);
                  const term = Number((form.elements.namedItem('vTerm') as HTMLInputElement).value);
                  const maturity = (form.elements.namedItem('vMaturity') as HTMLInputElement).value;

                  const newDep: VietnamFixedDeposit = {
                    id: 'vd-' + Date.now(),
                    bankName,
                    principal,
                    interestRate: rate,
                    termMonths: term,
                    startDate: new Date().toISOString().split('T')[0],
                    maturityDate: maturity,
                    status: 'ACTIVE'
                  };

                  setVndDeposits((prev) => [...prev, newDep]);
                  addAudit('Deposit Opened', `Registered VN Deposit ${bankName}: ₫${principal.toLocaleString()}`);
                  form.reset();
                }}
                className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-6 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs"
              >
                <input name="vBank" placeholder="Bank (e.g. MB, Techcombank)" required className="bg-slate-900 border border-slate-700 rounded p-1.5" />
                <input name="vPrincipal" type="number" placeholder="Principal (₫)" required className="bg-slate-900 border border-slate-700 rounded p-1.5" />
                <input name="vRate" type="number" step="0.01" placeholder="Rate (%)" required className="bg-slate-900 border border-slate-700 rounded p-1.5" />
                <input name="vTerm" type="number" placeholder="Term (Months)" required className="bg-slate-900 border border-slate-700 rounded p-1.5" />
                <input name="vMaturity" type="date" required className="bg-slate-900 border border-slate-700 rounded p-1.5" />
                <button type="submit" className="col-span-2 md:col-span-6 bg-emerald-600 hover:bg-emerald-500 py-1.5 rounded font-medium mt-1">
                  {t.openDeposit}
                </button>
              </form>

              {/* Deposit Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vndDeposits.map((dep) => {
                  const estInterest = dep.principal * (dep.interestRate / 100) * (dep.termMonths / 12);
                  return (
                    <div key={dep.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-slate-100">{dep.bankName} ({dep.termMonths}M)</h4>
                          <p className="text-xs text-slate-400">Target Date: {dep.maturityDate}</p>
                        </div>
                        <span className="text-base font-bold font-mono text-emerald-400">
                          ₫{dep.principal.toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-slate-900/60 p-2.5 rounded text-xs space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span>Interest Rate:</span>
                          <span className="font-mono">{dep.interestRate}%</span>
                        </div>
                        <div className="flex justify-between text-cyan-400 font-semibold">
                          <span>Projected Maturity Payout:</span>
                          <span className="font-mono">₫{Math.round(dep.principal + estInterest).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Goal Savings */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" /> {t.goalSavings}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vndGoals.map((g) => (
                  <div key={g.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-slate-200">{g.name}</h4>
                        <p className="text-xs text-slate-400">Maturity Target: {g.targetMaturityDate}</p>
                      </div>
                      <span className="text-base font-bold font-mono text-amber-400">
                        ₫{g.balance.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Auto Deposit: ₫{g.monthlyAutoDeposit.toLocaleString()} / month
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: INVESTMENTS & ASSETS ==================== */}
        {activeTab === 'investments' && (
          <div className="space-y-6">
            {/* Mutual Funds (CCQ) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> {t.mutualFunds}
                </h3>
                <button
                  onClick={handleFetchNAV}
                  className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 text-xs rounded hover:bg-emerald-600/30 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {t.fetchNav}
                </button>
              </div>

              {/* Fund Register Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const ticker = (form.elements.namedItem('mfTicker') as HTMLInputElement).value.toUpperCase();
                  const units = Number((form.elements.namedItem('mfUnits') as HTMLInputElement).value);
                  const price = Number((form.elements.namedItem('mfPrice') as HTMLInputElement).value);

                  const newFund: MutualFund = {
                    id: 'mf-' + Date.now(),
                    ticker,
                    units,
                    avgBuyPrice: price,
                    currentNav: price,
                    lastUpdated: new Date().toISOString().split('T')[0],
                    sparkline: [price]
                  };

                  setMutualFunds((prev) => [...prev, newFund]);
                  addAudit('Mutual Fund Added', `Added ${units} units of ${ticker}`);
                  form.reset();
                }}
                className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-6 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs"
              >
                <input name="mfTicker" placeholder="Ticker (e.g. MBBOND, DCDS)" required className="bg-slate-900 border border-slate-700 rounded p-1.5" />
                <input name="mfUnits" type="number" step="0.01" placeholder="Units Held" required className="bg-slate-900 border border-slate-700 rounded p-1.5" />
                <input name="mfPrice" type="number" placeholder="Average Buy NAV (₫)" required className="bg-slate-900 border border-slate-700 rounded p-1.5" />
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 py-1.5 rounded font-medium text-white">
                  {t.addFund}
                </button>
              </form>

              {/* Funds Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mutualFunds.map((fund) => {
                  const cost = fund.units * fund.avgBuyPrice;
                  const value = fund.units * fund.currentNav;
                  const pnl = value - cost;
                  const roi = cost > 0 ? (pnl / cost) * 100 : 0;

                  return (
                    <div key={fund.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-base text-white">{fund.ticker}</span>
                          <p className="text-xs text-slate-400">Units: {fund.units}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold font-mono text-emerald-400 block">
                            ₫{Math.round(value).toLocaleString()}
                          </span>
                          <span className={`text-xs font-mono font-semibold ${roi >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {roi >= 0 ? '+' : ''}{roi.toFixed(2)}% (₫{Math.round(pnl).toLocaleString()})
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-800 pt-2">
                        <span>NAV: ₫{fund.currentNav.toLocaleString()}</span>
                        <span>Updated: {fund.lastUpdated}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Real Estate & Physical Gold */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-400" /> {t.realEstateGold}
              </h3>

              {/* Add Asset Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const name = (form.elements.namedItem('paName') as HTMLInputElement).value;
                  const type = (form.elements.namedItem('paType') as HTMLSelectElement).value as any;
                  const price = Number((form.elements.namedItem('paPrice') as HTMLInputElement).value);
                  const cur = (form.elements.namedItem('paCur') as HTMLSelectElement).value as BaseCurrency;
                  const deduct = (form.elements.namedItem('paDeduct') as HTMLInputElement).checked;
                  const deductSource = (form.elements.namedItem('paSource') as HTMLSelectElement).value;

                  if (deduct) {
                    if (deductSource === 'KRW' && krwParking.length > 0) {
                      setKrwParking((prev) => [
                        { ...prev[0], balance: prev[0].balance - convertAmount(price, cur, 'KRW') },
                        ...prev.slice(1)
                      ]);
                      addAudit('Asset Purchase Deduction', `Deducted equivalent for ${name} from KRW Parking.`);
                    } else if (deductSource === 'VND' && vndParking.length > 0) {
                      setVndParking((prev) => [
                        { ...prev[0], balance: prev[0].balance - convertAmount(price, cur, 'VND') },
                        ...prev.slice(1)
                      ]);
                      addAudit('Asset Purchase Deduction', `Deducted equivalent for ${name} from VND Parking.`);
                    }
                  }

                  const newAsset: PhysicalAsset = {
                    id: 'pa-' + Date.now(),
                    type,
                    name,
                    purchaseDate: new Date().toISOString().split('T')[0],
                    purchasePrice: price,
                    currency: cur,
                    currentValuation: price,
                    lastValuationDate: new Date().toISOString().split('T')[0]
                  };

                  setPhysicalAssets((prev) => [...prev, newAsset]);
                  addAudit('Asset Registered', `Registered physical asset: ${name}`);
                  form.reset();
                }}
                className="space-y-3 bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs mb-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <input name="paName" placeholder="Asset Name (e.g. SJC Gold, Apartment)" required className="bg-slate-900 border border-slate-700 rounded p-1.5" />
                  <select name="paType" className="bg-slate-900 border border-slate-700 rounded p-1.5">
                    <option value="REAL_ESTATE">Real Estate</option>
                    <option value="GOLD">Physical Gold</option>
                    <option value="OTHER">Other Valuable</option>
                  </select>
                  <input name="paPrice" type="number" placeholder="Valuation / Price" required className="bg-slate-900 border border-slate-700 rounded p-1.5" />
                  <select name="paCur" className="bg-slate-900 border border-slate-700 rounded p-1.5">
                    <option value="VND">VND (₫)</option>
                    <option value="KRW">KRW (₩)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <label className="flex items-center gap-1.5 text-slate-300">
                    <input name="paDeduct" type="checkbox" className="rounded bg-slate-900 border-slate-700" />
                    <span>{t.deductParking}</span>
                  </label>
                  <select name="paSource" className="bg-slate-900 border border-slate-700 rounded p-1 text-xs text-slate-300">
                    <option value="VND">From VND Parking</option>
                    <option value="KRW">From KRW Parking</option>
                  </select>
                  <button type="submit" className="ml-auto bg-amber-600 hover:bg-amber-500 px-4 py-1.5 rounded font-medium text-white">
                    {t.addAsset}
                  </button>
                </div>
              </form>

              {/* Assets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {physicalAssets.map((asset) => (
                  <div key={asset.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                          {asset.type}
                        </span>
                        <h4 className="font-semibold text-slate-100 mt-1">{asset.name}</h4>
                        <p className="text-xs text-slate-400">Valuation Date: {asset.lastValuationDate}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold font-mono text-amber-400 block">
                          {formatCurrency(asset.currentValuation, asset.currency)}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          ~ {formatCurrency(convertAmount(asset.currentValuation, asset.currency, baseCurrency), baseCurrency)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 5: CASHFLOW & BUDGET ==================== */}
        {activeTab === 'cashflow' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-cyan-400" /> {t.cashflowTitle}
              </h3>

              {/* Log Entry Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const date = (form.elements.namedItem('cfDate') as HTMLInputElement).value;
                  const type = (form.elements.namedItem('cfType') as HTMLSelectElement).value as any;
                  const cat = (form.elements.namedItem('cfCat') as HTMLSelectElement).value as any;
                  const amount = Number((form.elements.namedItem('cfAmount') as HTMLInputElement).value);
                  const cur = (form.elements.namedItem('cfCur') as HTMLSelectElement).value as BaseCurrency;
                  const desc = (form.elements.namedItem('cfDesc') as HTMLInputElement).value;

                  const newCf: CashflowLog = {
                    id: 'cf-' + Date.now(),
                    date,
                    type,
                    category: cat,
                    amount,
                    currency: cur,
                    description: desc
                  };

                  setCashflows((prev) => [newCf, ...prev]);
                  form.reset();
                }}
                className="grid grid-cols-2 md:grid-cols-7 gap-2 mb-6 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs"
              >
                <input name="cfDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="bg-slate-900 border border-slate-700 rounded p-1.5" />
                <select name="cfType" className="bg-slate-900 border border-slate-700 rounded p-1.5">
                  <option value="INCOME">{t.income}</option>
                  <option value="EXPENSE">{t.expense}</option>
                </select>
                <select name="cfCat" className="bg-slate-900 border border-slate-700 rounded p-1.5">
                  <option value="Salary">Salary</option>
                  <option value="Rental">Rental Income</option>
                  <option value="Living">Living Costs</option>
                  <option value="Education">Education & PhD</option>
                  <option value="Incidental">Incidental</option>
                </select>
                <input name="cfAmount" type="number" placeholder="Amount" required className="bg-slate-900 border border-slate-700 rounded p-1.5" />
                <select name="cfCur" className="bg-slate-900 border border-slate-700 rounded p-1.5">
                  <option value="KRW">KRW (₩)</option>
                  <option value="VND">VND (₫)</option>
                  <option value="USD">USD ($)</option>
                </select>
                <input name="cfDesc" placeholder="Description" className="bg-slate-900 border border-slate-700 rounded p-1.5" />
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 py-1.5 rounded font-medium text-white">
                  {t.addCashflow}
                </button>
              </form>

              {/* Cashflow Log Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {cashflows.map((cf) => (
                      <tr key={cf.id} className="hover:bg-slate-950/40">
                        <td className="py-2 px-3 font-mono text-slate-400">{cf.date}</td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            cf.type === 'INCOME' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                          }`}>
                            {cf.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-300">{cf.category}</td>
                        <td className="py-2 px-3 text-slate-400">{cf.description || '-'}</td>
                        <td className={`py-2 px-3 text-right font-mono font-semibold ${
                          cf.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {cf.type === 'INCOME' ? '+' : '-'}{formatCurrency(cf.amount, cf.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 6: LIABILITIES ==================== */}
        {activeTab === 'liabilities' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> {t.liabilitiesTitle}
              </h3>
              <p className="text-xs text-slate-400 mb-4">{t.tenantDepositNote}</p>

              {/* Add Liability Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const name = (form.elements.namedItem('lName') as HTMLInputElement).value;
                  const cat = (form.elements.namedItem('lCat') as HTMLSelectElement).value as any;
                  const amount = Number((form.elements.namedItem('lAmount') as HTMLInputElement).value);
                  const cur = (form.elements.namedItem('lCur') as HTMLSelectElement).value as BaseCurrency;
                  const note = (form.elements.namedItem('lNote') as HTMLInputElement).value;

                  const newLiab: Liability = {
                    id: 'lb-' + Date.now(),
                    name,
                    category: cat,
                    amount,
                    currency: cur,
                    note
                  };

                  setLiabilities((prev) => [...prev, newLiab]);
                  addAudit('Liability Added', `Registered obligation: ${name} (${formatCurrency(amount, cur)})`);
                  form.reset();
                }}
                className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs"
              >
                <input name="lName" placeholder="Liability Name (e.g. Rental Deposit Held)" required className="bg-slate-900 border border-slate-700 rounded p-1.5" />
                <select name="lCat" className="bg-slate-900 border border-slate-700 rounded p-1.5">
                  <option value="TENANT_DEPOSIT">Tenant Security Deposit Held</option>
                  <option value="LOAN">Personal Loan</option>
                  <option value="CREDIT_CARD">Credit Card Balance</option>
                </select>
                <input name="lAmount" type="number" placeholder="Amount" required className="bg-slate-900 border border-slate-700 rounded p-1.5" />
                <select name="lCur" className="bg-slate-900 border border-slate-700 rounded p-1.5">
                  <option value="VND">VND (₫)</option>
                  <option value="KRW">KRW (₩)</option>
                  <option value="USD">USD ($)</option>
                </select>
                <button type="submit" className="bg-rose-600 hover:bg-rose-500 py-1.5 rounded font-medium text-white">
                  {t.addLiability}
                </button>
              </form>

              {/* Liabilities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liabilities.map((lb) => (
                  <div key={lb.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
                          {lb.category}
                        </span>
                        <h4 className="font-semibold text-slate-100 mt-1">{lb.name}</h4>
                        {lb.note && <p className="text-xs text-slate-400">{lb.note}</p>}
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold font-mono text-rose-400 block">
                          {formatCurrency(lb.amount, lb.currency)}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          ~ {formatCurrency(convertAmount(lb.amount, lb.currency, baseCurrency), baseCurrency)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 7: HISTORY & AUDIT ==================== */}
        {activeTab === 'history' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" /> {t.auditLogs}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Details</th>
                    <th className="py-2.5 px-3 text-right">Adjustment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-950/40">
                      <td className="py-2 px-3 font-mono text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-2 px-3 font-semibold text-slate-200">{log.action}</td>
                      <td className="py-2 px-3 text-slate-400">{log.details}</td>
                      <td className="py-2 px-3 text-right font-mono text-cyan-400">{log.amountChanged || '-'}</td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-500">
                        No activity recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB 8: SETTINGS & SYNC ==================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Google Apps Script Integration */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Cloud Sync (Google Drive / Finance / Report)
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {t.gasWebhookUrl}
                </label>
                <input
                  type="text"
                  value={gasWebhookUrl}
                  onChange={(e) => setGasWebhookUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              {/* Manual FX Override */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <h4 className="text-xs font-semibold text-slate-300">Exchange Rates (Manual Override)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">USD / KRW</label>
                    <input
                      type="number"
                      value={fxRates.USD_KRW}
                      onChange={(e) => setFxRates({ ...fxRates, USD_KRW: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">USD / VND</label>
                    <input
                      type="number"
                      value={fxRates.USD_VND}
                      onChange={(e) => setFxRates({ ...fxRates, USD_VND: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">KRW / VND</label>
                    <input
                      type="number"
                      step="0.01"
                      value={fxRates.KRW_VND}
                      onChange={(e) => setFxRates({ ...fxRates, KRW_VND: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Data Backup Tools */}
              <div className="border-t border-slate-800 pt-4 flex flex-wrap gap-3">
                <button
                  onClick={exportJsonBackup}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs font-medium text-white transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> {t.exportJson}
                </button>
                <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs font-medium text-white cursor-pointer transition-all">
                  <Upload className="w-3.5 h-3.5" /> {t.importJson}
                  <input type="file" accept=".json" onChange={importJsonBackup} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
