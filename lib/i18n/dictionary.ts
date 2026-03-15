import type { Locale } from "@/lib/i18n/locale";

type Dictionary = {
  metadata: {
    title: string;
    description: string;
    appEyebrow: string;
    appTitle: string;
  };
  common: {
    apply: string;
    noData: string;
    all: string;
    selectedMonth: string;
    notAvailable: string;
    reset: string;
    primaryNavAria: string;
    languageLabel: string;
    languageKo: string;
    languageEn: string;
  };
  navigation: {
    dashboard: string;
    snapshots: string;
    addSnapshot: string;
    importCsv: string;
    compare: string;
  };
  labels: {
    market: Record<"KR" | "US", string>;
    assetCategory: Record<"STOCK" | "ETF" | "BOND" | "ELB" | "TDF", string>;
    currency: Record<"KRW" | "USD", string>;
  };
  dashboard: {
    eyebrow: string;
    title: string;
    description: string;
    snapshotMonth: string;
    totalAssets: string;
    topAssets: string;
    byAccount: string;
    byMarket: string;
    byCategory: string;
    dbNotReadyTitle: string;
    dbNotReadyDescription: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  snapshots: {
    eyebrow: string;
    title: string;
    description: string;
    tableTitle: string;
    filters: {
      snapshotMonth: string;
      account: string;
      market: string;
      assetCategory: string;
      currency: string;
      keyword: string;
      keywordPlaceholder: string;
      apply: string;
      exportCsv: string;
      reset: string;
    };
    table: {
      month: string;
      account: string;
      asset: string;
      market: string;
      amount: string;
      returnRate: string;
      category: string;
      currency: string;
      actions: string;
      edit: string;
      delete: string;
    };
    empty: string;
    dbNotReadyTitle: string;
    dbNotReadyDescription: string;
  };
  addSnapshot: {
    eyebrow: string;
    title: string;
    description: string;
    formTitle: string;
    dbNotReady: string;
    emptyAccounts: string;
  };
  editSnapshot: {
    eyebrow: string;
    title: string;
    description: string;
    formTitle: string;
    submitLabel: string;
  };
  importCsv: {
    eyebrow: string;
    title: string;
    description: string;
    sectionTitle: string;
    dbNotReady: string;
    emptyAccounts: string;
    fileLabel: string;
    requiredHeaders: string;
    importButton: string;
    row: string;
    status: string;
    valid: string;
    csvEmpty: string;
    parseSummary: string;
    unknownAccount: string;
  };
  compare: {
    eyebrow: string;
    title: string;
    description: string;
    snapshotMonth: string;
    previousMonth: string;
    noComparisonTitle: string;
    noComparisonDescription: string;
    noPreviousTitle: string;
    noPreviousDescription: string;
    totalDelta: string;
    byAccountDelta: string;
    byMarketDelta: string;
    byCategoryDelta: string;
    dbNotReadyTitle: string;
    dbNotReadyDescription: string;
  };
  form: {
    snapshotMonth: string;
    assetName: string;
    amount: string;
    returnRate: string;
    account: string;
    market: string;
    assetCategory: string;
    currency: string;
    memo: string;
    submitCreate: string;
  };
  actions: {
    validationFailed: string;
    duplicateSnapshot: string;
    unableToSave: string;
    createUserBeforeAdd: string;
    snapshotCreated: string;
    snapshotUpdated: string;
    missingSnapshotId: string;
    unableToDelete: string;
    snapshotDeleted: string;
    createUserBeforeImport: string;
    noRowsToImport: string;
    importCompleted: string;
    unknownAccountPrefix: string;
  };
  validation: {
    useYYYYMM: string;
    returnRateNumeric: string;
    returnRatePrecision: string;
    accountRequired: string;
    assetNameRequired: string;
    amountNonNegative: string;
  };
};

const ko: Dictionary = {
  metadata: {
    title: "월간 자산 포트폴리오 매니저",
    description: "수동 월간 투자 스냅샷 관리 앱",
    appEyebrow: "월간 자산 포트폴리오 매니저",
    appTitle: "개인 투자 스냅샷 앱",
  },
  common: {
    apply: "적용",
    noData: "데이터 없음",
    all: "전체",
    selectedMonth: "선택 월",
    notAvailable: "없음",
    reset: "초기화",
    primaryNavAria: "주요 메뉴",
    languageLabel: "언어",
    languageKo: "한국어",
    languageEn: "English",
  },
  navigation: {
    dashboard: "대시보드",
    snapshots: "스냅샷",
    addSnapshot: "스냅샷 추가",
    importCsv: "CSV 가져오기",
    compare: "월간 비교",
  },
  labels: {
    market: {
      KR: "한국 (KR)",
      US: "미국 (US)",
    },
    assetCategory: {
      STOCK: "주식 (STOCK)",
      ETF: "ETF",
      BOND: "채권 (BOND)",
      ELB: "ELB",
      TDF: "TDF",
    },
    currency: {
      KRW: "원화 (KRW)",
      USD: "달러 (USD)",
    },
  },
  dashboard: {
    eyebrow: "대시보드",
    title: "월간 포트폴리오 현황",
    description:
      "월별 스냅샷을 기준으로 보유 자산을 기록하고, 배분 현황과 변화를 간단히 확인합니다.",
    snapshotMonth: "스냅샷 월",
    totalAssets: "총 자산",
    topAssets: "상위 자산",
    byAccount: "계좌별 자산",
    byMarket: "시장별 자산",
    byCategory: "자산군별 자산",
    dbNotReadyTitle: "데이터베이스 준비 필요",
    dbNotReadyDescription:
      "대시보드를 사용하려면 Prisma 마이그레이션과 시드 작업을 먼저 실행하세요.",
    emptyTitle: "대시보드 데이터 없음",
    emptyDescription:
      "월간 스냅샷을 추가하거나 CSV로 가져오면 집계 결과를 볼 수 있습니다.",
  },
  snapshots: {
    eyebrow: "스냅샷",
    title: "월간 스냅샷 목록",
    description: "월별 자산 스냅샷을 조회하고 필터링하며 수정/삭제할 수 있습니다.",
    tableTitle: "최근 스냅샷 행",
    filters: {
      snapshotMonth: "스냅샷 월",
      account: "계좌",
      market: "시장",
      assetCategory: "자산군",
      currency: "통화",
      keyword: "키워드",
      keywordPlaceholder: "자산명",
      apply: "필터 적용",
      exportCsv: "CSV 내보내기",
      reset: "초기화",
    },
    table: {
      month: "월",
      account: "계좌",
      asset: "자산명",
      market: "시장",
      amount: "금액",
      returnRate: "수익률",
      category: "자산군",
      currency: "통화",
      actions: "작업",
      edit: "수정",
      delete: "삭제",
    },
    empty:
      "현재 필터에 맞는 스냅샷이 없습니다. 월간 스냅샷을 추가하거나 CSV로 가져오세요.",
    dbNotReadyTitle: "데이터베이스 준비 필요",
    dbNotReadyDescription:
      "스냅샷 목록을 사용하려면 Prisma 마이그레이션과 시드 작업을 먼저 실행하세요.",
  },
  addSnapshot: {
    eyebrow: "스냅샷 추가",
    title: "월간 보유 자산 스냅샷 생성",
    description: "월별 보유 자산 데이터를 입력해 스냅샷을 저장합니다.",
    formTitle: "스냅샷 입력 폼",
    dbNotReady:
      "데이터베이스가 아직 준비되지 않았습니다. Prisma 마이그레이션과 시드를 먼저 실행하세요.",
    emptyAccounts: "스냅샷을 추가하려면 먼저 사용자와 계좌 데이터를 준비하세요.",
  },
  editSnapshot: {
    eyebrow: "스냅샷 수정",
    title: "월간 보유 자산 스냅샷 수정",
    description: "저장된 행을 수정해 월간 기록을 정확하게 유지합니다.",
    formTitle: "스냅샷 입력 폼",
    submitLabel: "스냅샷 수정",
  },
  importCsv: {
    eyebrow: "CSV 가져오기",
    title: "CSV로 자산 스냅샷 가져오기",
    description: "CSV 파일을 업로드하고 유효한 행만 미리보기 후 가져옵니다.",
    sectionTitle: "CSV 가져오기",
    dbNotReady:
      "데이터베이스가 아직 준비되지 않았습니다. Prisma 마이그레이션과 시드를 먼저 실행하세요.",
    emptyAccounts: "CSV를 가져오려면 먼저 계좌 데이터를 준비하세요.",
    fileLabel: "CSV 파일",
    requiredHeaders:
      "필수 헤더: accountName, snapshotMonth, market, assetCategory, assetName, currency, amount, returnRate, memo",
    importButton: "유효 행 가져오기",
    row: "행",
    status: "상태",
    valid: "유효",
    csvEmpty: "CSV가 비어 있습니다.",
    parseSummary: "유효 {valid}건 / 전체 {total}건",
    unknownAccount: "알 수 없는 계좌",
  },
  compare: {
    eyebrow: "월간 비교",
    title: "전월 대비 비교",
    description: "선택한 월을 가장 가까운 이전 스냅샷 월과 비교합니다.",
    snapshotMonth: "스냅샷 월",
    previousMonth: "이전 월",
    noComparisonTitle: "비교 데이터 없음",
    noComparisonDescription:
      "비교를 시작하려면 최소 한 달 이상의 스냅샷을 추가하거나 가져오세요.",
    noPreviousTitle: "이전 월 없음",
    noPreviousDescription: "비교할 이전 스냅샷 월이 아직 없습니다.",
    totalDelta: "총 증감",
    byAccountDelta: "계좌별 증감",
    byMarketDelta: "시장별 증감",
    byCategoryDelta: "자산군별 증감",
    dbNotReadyTitle: "데이터베이스 준비 필요",
    dbNotReadyDescription:
      "전월 비교를 사용하려면 Prisma 마이그레이션과 시드 작업을 먼저 실행하세요.",
  },
  form: {
    snapshotMonth: "스냅샷 월",
    assetName: "자산명",
    amount: "금액",
    returnRate: "수익률 (%)",
    account: "계좌",
    market: "시장",
    assetCategory: "자산군",
    currency: "통화",
    memo: "메모",
    submitCreate: "스냅샷 저장",
  },
  actions: {
    validationFailed: "입력 검증에 실패했습니다.",
    duplicateSnapshot: "동일한 스냅샷이 이미 존재합니다.",
    unableToSave: "스냅샷 저장에 실패했습니다.",
    createUserBeforeAdd: "스냅샷을 추가하기 전에 사용자 데이터를 먼저 생성하세요.",
    snapshotCreated: "스냅샷이 생성되었습니다.",
    snapshotUpdated: "스냅샷이 수정되었습니다.",
    missingSnapshotId: "스냅샷 ID가 누락되었습니다.",
    unableToDelete: "스냅샷 삭제에 실패했습니다.",
    snapshotDeleted: "스냅샷이 삭제되었습니다.",
    createUserBeforeImport: "CSV 가져오기 전에 사용자 데이터를 먼저 생성하세요.",
    noRowsToImport: "가져올 유효한 행이 없습니다.",
    importCompleted: "CSV 가져오기가 완료되었습니다.",
    unknownAccountPrefix: "알 수 없는 계좌: ",
  },
  validation: {
    useYYYYMM: "YYYY-MM 형식으로 입력하세요.",
    returnRateNumeric: "수익률은 숫자여야 합니다.",
    returnRatePrecision: "수익률은 소수점 둘째 자리까지 입력할 수 있습니다.",
    accountRequired: "계좌는 필수 입력값입니다.",
    assetNameRequired: "자산명은 필수 입력값입니다.",
    amountNonNegative: "금액은 0 이상이어야 합니다.",
  },
};

const en: Dictionary = {
  metadata: {
    title: "Monthly Asset Portfolio Manager",
    description: "Manual monthly investment snapshot management app",
    appEyebrow: "Monthly Asset Portfolio Manager",
    appTitle: "Personal Investment Snapshot App",
  },
  common: {
    apply: "Apply",
    noData: "No data",
    all: "All",
    selectedMonth: "Selected month",
    notAvailable: "N/A",
    reset: "Reset",
    primaryNavAria: "Primary",
    languageLabel: "Language",
    languageKo: "한국어",
    languageEn: "English",
  },
  navigation: {
    dashboard: "Dashboard",
    snapshots: "Snapshots",
    addSnapshot: "Add Snapshot",
    importCsv: "Import CSV",
    compare: "Compare",
  },
  labels: {
    market: {
      KR: "Korea (KR)",
      US: "United States (US)",
    },
    assetCategory: {
      STOCK: "Stock (STOCK)",
      ETF: "ETF",
      BOND: "Bond (BOND)",
      ELB: "ELB",
      TDF: "TDF",
    },
    currency: {
      KRW: "KRW",
      USD: "USD",
    },
  },
  dashboard: {
    eyebrow: "Dashboard",
    title: "Monthly portfolio overview",
    description:
      "Record monthly holdings and quickly review allocation and month-over-month changes.",
    snapshotMonth: "Snapshot Month",
    totalAssets: "Total assets",
    topAssets: "Top assets",
    byAccount: "Assets by account",
    byMarket: "Assets by market",
    byCategory: "Assets by asset category",
    dbNotReadyTitle: "Database not ready",
    dbNotReadyDescription:
      "Run Prisma migration and seed steps before using the dashboard.",
    emptyTitle: "No dashboard data",
    emptyDescription:
      "Add or import monthly snapshots to see allocation summaries.",
  },
  snapshots: {
    eyebrow: "Snapshots",
    title: "Monthly snapshot list",
    description: "Review, filter, edit, and delete monthly asset snapshots.",
    tableTitle: "Recent snapshot rows",
    filters: {
      snapshotMonth: "Snapshot Month",
      account: "Account",
      market: "Market",
      assetCategory: "Asset Category",
      currency: "Currency",
      keyword: "Keyword",
      keywordPlaceholder: "Asset name",
      apply: "Apply Filters",
      exportCsv: "Export CSV",
      reset: "Reset",
    },
    table: {
      month: "Month",
      account: "Account",
      asset: "Asset",
      market: "Market",
      amount: "Amount",
      returnRate: "Return",
      category: "Category",
      currency: "Currency",
      actions: "Actions",
      edit: "Edit",
      delete: "Delete",
    },
    empty:
      "No snapshots match the current filters. Add or import monthly snapshots to get started.",
    dbNotReadyTitle: "Database not ready",
    dbNotReadyDescription:
      "Run Prisma migration and seed steps before using the snapshot list.",
  },
  addSnapshot: {
    eyebrow: "Add Snapshot",
    title: "Create a monthly holding snapshot",
    description: "Enter monthly holdings and save a new snapshot row.",
    formTitle: "Snapshot form",
    dbNotReady:
      "Database is not ready yet. Run Prisma migration and seed steps first.",
    emptyAccounts: "Seed or create a user and account before adding snapshots.",
  },
  editSnapshot: {
    eyebrow: "Edit Snapshot",
    title: "Update a monthly holding snapshot",
    description: "Adjust a saved row and keep the monthly record accurate.",
    formTitle: "Snapshot form",
    submitLabel: "Update Snapshot",
  },
  importCsv: {
    eyebrow: "Import CSV",
    title: "Import asset snapshots from CSV",
    description: "Upload a CSV file, preview rows, and import valid rows only.",
    sectionTitle: "CSV import",
    dbNotReady:
      "Database is not ready yet. Run Prisma migration and seed steps first.",
    emptyAccounts: "Seed or create an account before importing CSV rows.",
    fileLabel: "CSV file",
    requiredHeaders:
      "Required headers: accountName, snapshotMonth, market, assetCategory, assetName, currency, amount, returnRate, memo",
    importButton: "Import Valid Rows",
    row: "Row",
    status: "Status",
    valid: "Valid",
    csvEmpty: "CSV is empty.",
    parseSummary: "{valid} valid / {total} total rows",
    unknownAccount: "Unknown account",
  },
  compare: {
    eyebrow: "Compare",
    title: "Month-over-month comparison",
    description:
      "Compare the selected month against the closest previous snapshot month.",
    snapshotMonth: "Snapshot Month",
    previousMonth: "Previous month",
    noComparisonTitle: "No comparison data",
    noComparisonDescription:
      "Add or import at least one month of snapshots to start comparing months.",
    noPreviousTitle: "No previous month",
    noPreviousDescription:
      "There is no earlier snapshot month to compare against yet.",
    totalDelta: "Total delta",
    byAccountDelta: "Delta by account",
    byMarketDelta: "Delta by market",
    byCategoryDelta: "Delta by asset category",
    dbNotReadyTitle: "Database not ready",
    dbNotReadyDescription:
      "Run Prisma migration and seed steps before using month-over-month comparison.",
  },
  form: {
    snapshotMonth: "Snapshot Month",
    assetName: "Asset Name",
    amount: "Amount",
    returnRate: "Return Rate (%)",
    account: "Account",
    market: "Market",
    assetCategory: "Asset Category",
    currency: "Currency",
    memo: "Memo",
    submitCreate: "Save Snapshot",
  },
  actions: {
    validationFailed: "Validation failed.",
    duplicateSnapshot: "An identical snapshot already exists.",
    unableToSave: "Unable to save snapshot.",
    createUserBeforeAdd: "Create a user before adding snapshots.",
    snapshotCreated: "Snapshot created.",
    snapshotUpdated: "Snapshot updated.",
    missingSnapshotId: "Snapshot id is missing.",
    unableToDelete: "Unable to delete snapshot.",
    snapshotDeleted: "Snapshot deleted.",
    createUserBeforeImport: "Create a user before importing snapshots.",
    noRowsToImport: "No valid rows to import.",
    importCompleted: "CSV import completed.",
    unknownAccountPrefix: "Unknown account: ",
  },
  validation: {
    useYYYYMM: "Use YYYY-MM format.",
    returnRateNumeric: "Return rate must be numeric.",
    returnRatePrecision: "Return rate must use up to 2 decimal places.",
    accountRequired: "Account is required.",
    assetNameRequired: "Asset name is required.",
    amountNonNegative: "Amount must be non-negative.",
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return locale === "en" ? en : ko;
}
