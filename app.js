import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const APP_NAME = "RebeccaCash";
const STORAGE_KEY = "rebeccacash.session";
const RECOVERY_CONTEXT_KEY = "rebeccacash.recovery";
const SUPABASE_RECOVERY_STORAGE_KEY = "rebeccacash.supabase.recovery";
const PUBLIC_BACKEND_URL = "https://api-financas-backend1.onrender.com";
const PUBLIC_FRONTEND_URL = "https://api-financas-frontend.onrender.com";
const LOCAL_BACKEND_URL = "http://127.0.0.1:3000";
const SUPABASE_URL = "https://gbnzacdsxsivwwsquxky.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdibnphY2RzeHNpdnd3c3F1eGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1OTEwOTgsImV4cCI6MjEwMTE2NzA5OH0.hGoMQxS8eKIjyEytuaGAxI0TjkFT5OZp5coiUEbr_U8";
const PASSWORD_MIN_LENGTH = 8;
const DEFAULT_THEME = "rebecca";
const CATALOG_PAGE_SIZE = 10;
const HISTORY_PAGE_SIZE = 8;

const SECTION_TITLES = {
  dashboard: "Dashboard",
  imports: "Importacoes",
  movements: "Movimentacoes",
  duplicates: "Revisoes",
  history: "Historico OFX",
  installments: "Parcelamentos",
  categories: "Categorias",
  accounts: "Contas Financeiras",
  suppliers: "Fornecedores",
  settings: "Configuracoes",
  profile: "Perfil",
};

const ENTITY_CONFIG = {
  categories: {
    title: "Categoria",
    tableId: "table-categories",
    paginationId: "pagination-categories",
    searchId: "search-categories",
    fields: [
      { name: "name", label: "Nome", type: "text", required: true },
      { name: "movement_type", label: "Tipo de movimento", type: "select", options: ["expense", "income", "transfer", "adjustment"], required: true },
      { name: "color_hex", label: "Cor", type: "text", placeholder: "#295B56" },
      { name: "icon_name", label: "Icone", type: "text", placeholder: "wallet" },
      { name: "display_order", label: "Ordem", type: "number", placeholder: "0" },
      { name: "is_active", label: "Ativa", type: "checkbox" },
    ],
    columns: [
      { key: "name", label: "Nome" },
      { key: "movement_type", label: "Tipo", formatter: (value) => movementTypeLabel(value) },
      { key: "color_hex", label: "Cor" },
      { key: "is_active", label: "Status", formatter: (value) => value ? badge("Ativa", "success") : badge("Inativa", "warning") },
    ],
  },
  accounts: {
    title: "Conta financeira",
    tableId: "table-accounts",
    paginationId: "pagination-accounts",
    searchId: "search-accounts",
    fields: [
      { name: "name", label: "Nome", type: "text", required: true },
      { name: "financial_institution_id", label: "Instituicao", type: "institution-select" },
      { name: "account_type", label: "Tipo", type: "select", options: ["checking", "savings", "wallet", "credit_card", "manual", "payment", "investment", "cash", "other"], required: true },
      { name: "opening_balance", label: "Saldo inicial", type: "number", placeholder: "0" },
      { name: "opening_balance_date", label: "Data do saldo inicial", type: "date" },
      { name: "statement_closing_day", label: "Fechamento da fatura", type: "number", placeholder: "Dia 1-31" },
      { name: "statement_due_day", label: "Vencimento da fatura", type: "number", placeholder: "Dia 1-31" },
      { name: "credit_limit_amount", label: "Limite do cartao", type: "number", placeholder: "0" },
      { name: "is_active", label: "Ativa", type: "checkbox" },
    ],
    columns: [
      { key: "name", label: "Conta financeira" },
      { key: "account_type", label: "Tipo", formatter: (value) => accountTypeLabel(value) },
      { key: "statement_due_day", label: "Vencimento" },
      { key: "currency_code", label: "Moeda" },
      { key: "is_active", label: "Status", formatter: (value) => value ? badge("Ativa", "success") : badge("Inativa", "warning") },
    ],
  },
  cards: {
    title: "Cartao",
    tableId: "table-cards",
    paginationId: "pagination-cards",
    searchId: "search-cards",
    fields: [
      { name: "name", label: "Nome", type: "text", required: true },
      { name: "financial_institution_id", label: "Instituicao", type: "institution-select" },
      { name: "paying_account_id", label: "Conta pagadora", type: "account-select" },
      { name: "brand", label: "Bandeira", type: "text" },
      { name: "last_four_digits", label: "Ultimos 4 digitos", type: "text", placeholder: "1234" },
      { name: "statement_closing_day", label: "Dia de fechamento", type: "number" },
      { name: "statement_due_day", label: "Dia de vencimento", type: "number" },
      { name: "external_identifier", label: "Identificador externo", type: "text" },
      { name: "is_active", label: "Ativo", type: "checkbox" },
    ],
    columns: [
      { key: "name", label: "Cartao" },
      { key: "brand", label: "Bandeira" },
      { key: "last_four_digits", label: "Final" },
      { key: "statement_due_day", label: "Vencimento" },
      { key: "is_active", label: "Status", formatter: (value) => value ? badge("Ativo", "success") : badge("Inativo", "warning") },
    ],
  },
  counterparties: {
    title: "Fornecedor",
    tableId: "table-counterparties",
    paginationId: "pagination-counterparties",
    searchId: "search-counterparties",
    fields: [
      { name: "display_name", label: "Nome exibido", type: "text", required: true },
      { name: "counterparty_type", label: "Tipo", type: "select", options: ["merchant", "individual", "company", "bank", "internal_account", "other"], required: true },
      { name: "external_identifier", label: "Identificador externo", type: "text" },
      { name: "masked_document", label: "Documento mascarado", type: "text" },
      { name: "notes", label: "Observacoes", type: "textarea" },
    ],
    columns: [
      { key: "display_name", label: "Fornecedor" },
      { key: "counterparty_type", label: "Tipo" },
      { key: "masked_document", label: "Documento" },
      { key: "updated_at", label: "Atualizado", formatter: (value) => formatDateTime(value) },
    ],
  },
  institutions: {
    title: "Instituicao",
    tableId: "table-institutions",
    searchId: "search-institutions",
    fields: [
      { name: "name", label: "Nome", type: "text", required: true },
      { name: "institution_type", label: "Tipo", type: "select", options: ["bank", "card_issuer", "brokerage", "digital_wallet", "other"], required: true },
      { name: "external_code", label: "Codigo externo", type: "text" },
      { name: "country_code", label: "Pais", type: "text", placeholder: "BR" },
      { name: "is_active", label: "Ativa", type: "checkbox" },
    ],
    columns: [
      { key: "name", label: "Instituicao" },
      { key: "institution_type", label: "Tipo" },
      { key: "country_code", label: "Pais" },
      { key: "is_active", label: "Status", formatter: (value) => value ? badge("Ativa", "success") : badge("Inativa", "warning") },
    ],
  },
};

function resolveApiUrl() {
  return ["localhost", "127.0.0.1"].includes(window.location.hostname) ? LOCAL_BACKEND_URL : PUBLIC_BACKEND_URL;
}

function resolveRecoveryRedirectUrl() {
  const { hostname, protocol, host } = window.location;
  return ["localhost", "127.0.0.1"].includes(hostname) ? `${protocol}//${host}` : PUBLIC_FRONTEND_URL;
}

const API_URL = resolveApiUrl();
const RECOVERY_REDIRECT_URL = resolveRecoveryRedirectUrl();
const initialAuthParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
const initialAuthLinkType = initialAuthParams.get("type");
const initialAuthErrorCode = initialAuthParams.get("error_code");
const initialAuthErrorDescription = initialAuthParams.get("error_description");

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: true,
    persistSession: true,
    storageKey: SUPABASE_RECOVERY_STORAGE_KEY,
  },
});

const elements = {
  authShell: document.getElementById("authShell"),
  appShell: document.getElementById("appShell"),
  loginSection: document.getElementById("login"),
  forgotPasswordSection: document.getElementById("forgotPassword"),
  resetPasswordSection: document.getElementById("resetPassword"),
  loginForm: document.getElementById("loginForm"),
  loginButton: document.getElementById("loginButton"),
  usuarioInput: document.getElementById("usuario"),
  senhaInput: document.getElementById("senha"),
  loginMessage: document.getElementById("msg"),
  showForgotPasswordButton: document.getElementById("showForgotPassword"),
  forgotPasswordForm: document.getElementById("forgotPasswordForm"),
  forgotPasswordButton: document.getElementById("forgotPasswordButton"),
  recoveryEmailInput: document.getElementById("recoveryEmail"),
  forgotPasswordMessage: document.getElementById("forgotPasswordMsg"),
  backToLoginFromForgotButton: document.getElementById("backToLoginFromForgot"),
  resetPasswordForm: document.getElementById("resetPasswordForm"),
  resetPasswordButton: document.getElementById("resetPasswordButton"),
  resetPasswordSubtitle: document.getElementById("resetPasswordSubtitle"),
  newPasswordInput: document.getElementById("newPassword"),
  confirmPasswordInput: document.getElementById("confirmPassword"),
  resetPasswordMessage: document.getElementById("resetPasswordMsg"),
  backToLoginFromResetButton: document.getElementById("backToLoginFromReset"),
  pageTitle: document.getElementById("pageTitle"),
  sessionInfo: document.getElementById("sessionInfo"),
  globalMessage: document.getElementById("globalMessage"),
  menuToggle: document.getElementById("menuToggle"),
  sidebar: document.getElementById("sidebar"),
  navButtons: Array.from(document.querySelectorAll(".nav-item[data-section]")),
  sidebarLogout: document.getElementById("sidebarLogout"),
  refreshAllButton: document.getElementById("refreshAllButton"),
  globalFiltersPanel: document.getElementById("globalFiltersPanel"),
  filterCompetence: document.getElementById("filterCompetence"),
  filterBank: document.getElementById("filterBank"),
  filterAccount: document.getElementById("filterAccount"),
  filterType: document.getElementById("filterType"),
  filterCategory: document.getElementById("filterCategory"),
  applyGlobalFilters: document.getElementById("applyGlobalFilters"),
  clearGlobalFilters: document.getElementById("clearGlobalFilters"),
  statsGrid: document.getElementById("statsGrid"),
  accountBalanceList: document.getElementById("accountBalanceList"),
  cardBillSummary: document.getElementById("cardBillSummary"),
  installmentSummary: document.getElementById("installmentSummary"),
  dashboardGreeting: document.getElementById("dashboardGreeting"),
  lastImportBadge: document.getElementById("lastImportBadge"),
  dashboardCompetence: document.getElementById("dashboardCompetence"),
  applyDashboardCompetence: document.getElementById("applyDashboardCompetence"),
  monthlyTrend: document.getElementById("monthlyTrend"),
  categorySummary: document.getElementById("categorySummary"),
  latestTransactions: document.getElementById("latestTransactions"),
  recentImports: document.getElementById("recentImports"),
  bankSummary: document.getElementById("bankSummary"),
  supplierHighlights: document.getElementById("supplierHighlights"),
  institutionSelect: document.getElementById("institutionSelect"),
  accountSelect: document.getElementById("accountSelect"),
  refreshImportOptions: document.getElementById("refreshImportOptions"),
  toggleAccountForm: document.getElementById("toggleAccountForm"),
  createAccountForm: document.getElementById("createAccountForm"),
  createAccountName: document.getElementById("createAccountName"),
  createAccountType: document.getElementById("createAccountType"),
  createOpeningBalance: document.getElementById("createOpeningBalance"),
  createExternalIdentifier: document.getElementById("createExternalIdentifier"),
  createMaskedAccountNumber: document.getElementById("createMaskedAccountNumber"),
  createMaskedBranchNumber: document.getElementById("createMaskedBranchNumber"),
  createStatementLabel: document.getElementById("createStatementLabel"),
  createStatementClosingDay: document.getElementById("createStatementClosingDay"),
  createStatementDueDay: document.getElementById("createStatementDueDay"),
  createCreditLimitAmount: document.getElementById("createCreditLimitAmount"),
  createAccountButton: document.getElementById("createAccountButton"),
  importMessage: document.getElementById("importMsg"),
  dropzone: document.getElementById("dropzone"),
  ofxFileInput: document.getElementById("ofxFile"),
  selectedFileCard: document.getElementById("selectedFileCard"),
  previewButton: document.getElementById("previewButton"),
  clearFileButton: document.getElementById("clearFileButton"),
  previewPanel: document.getElementById("previewPanel"),
  confirmImportButton: document.getElementById("confirmImportButton"),
  historySearch: document.getElementById("historySearch"),
  historyStatusFilter: document.getElementById("historyStatusFilter"),
  suppliersSearch: document.getElementById("search-counterparties"),
  refreshHistoryButton: document.getElementById("refreshHistoryButton"),
  historyTable: document.getElementById("historyTable"),
  historyDetails: document.getElementById("historyDetails"),
  historyPrevPage: document.getElementById("historyPrevPage"),
  historyNextPage: document.getElementById("historyNextPage"),
  historyPaginationLabel: document.getElementById("historyPaginationLabel"),
  movementsSearch: document.getElementById("movementsSearch"),
  refreshMovementsButton: document.getElementById("refreshMovementsButton"),
  movementsTable: document.getElementById("movementsTable"),
  movementsPrevPage: document.getElementById("movementsPrevPage"),
  movementsNextPage: document.getElementById("movementsNextPage"),
  movementsPaginationLabel: document.getElementById("movementsPaginationLabel"),
  refreshDuplicatesButton: document.getElementById("refreshDuplicatesButton"),
  duplicatesTable: document.getElementById("duplicatesTable"),
  installmentForm: document.getElementById("installmentForm"),
  installmentSupplier: document.getElementById("installmentSupplier"),
  installmentDescription: document.getElementById("installmentDescription"),
  installmentTotalAmount: document.getElementById("installmentTotalAmount"),
  installmentCount: document.getElementById("installmentCount"),
  installmentAmount: document.getElementById("installmentAmount"),
  installmentFirstDueDate: document.getElementById("installmentFirstDueDate"),
  installmentCategory: document.getElementById("installmentCategory"),
  installmentFinancialAccount: document.getElementById("installmentFinancialAccount"),
  installmentStatus: document.getElementById("installmentStatus"),
  installmentNotes: document.getElementById("installmentNotes"),
  saveInstallmentButton: document.getElementById("saveInstallmentButton"),
  installmentMessage: document.getElementById("installmentMessage"),
  installmentsTable: document.getElementById("installmentsTable"),
  counterpartiesTable: document.getElementById("table-counterparties"),
  counterpartiesPagination: document.getElementById("pagination-counterparties"),
  settingsForm: document.getElementById("settingsForm"),
  defaultCurrencyCode: document.getElementById("defaultCurrencyCode"),
  timeZone: document.getElementById("timeZone"),
  themePreference: document.getElementById("themePreference"),
  compactCards: document.getElementById("compactCards"),
  hideDuplicatesTab: document.getElementById("hideDuplicatesTab"),
  hideHistoryTab: document.getElementById("hideHistoryTab"),
  hideInstallmentsTab: document.getElementById("hideInstallmentsTab"),
  hideSuppliersTab: document.getElementById("hideSuppliersTab"),
  saveSettingsButton: document.getElementById("saveSettingsButton"),
  settingsMessage: document.getElementById("settingsMessage"),
  profileForm: document.getElementById("profileForm"),
  profileDisplayName: document.getElementById("profileDisplayName"),
  profileEmail: document.getElementById("profileEmail"),
  profileVersion: document.getElementById("profileVersion"),
  profileAvatar: document.getElementById("profileAvatar"),
  profileHeadingName: document.getElementById("profileHeadingName"),
  profileHeadingEmail: document.getElementById("profileHeadingEmail"),
  saveProfileButton: document.getElementById("saveProfileButton"),
  profileMessage: document.getElementById("profileMessage"),
  passwordForm: document.getElementById("passwordForm"),
  profilePassword: document.getElementById("profilePassword"),
  profilePasswordConfirm: document.getElementById("profilePasswordConfirm"),
  savePasswordButton: document.getElementById("savePasswordButton"),
  passwordMessage: document.getElementById("passwordMessage"),
  drawer: document.getElementById("entityDrawer"),
  drawerTitle: document.getElementById("drawerTitle"),
  drawerEyebrow: document.getElementById("drawerEyebrow"),
  closeDrawer: document.getElementById("closeDrawer"),
  drawerMessage: document.getElementById("drawerMessage"),
  entityForm: document.getElementById("entityForm"),
  toastStack: document.getElementById("toastStack"),
  sections: {
    dashboard: document.getElementById("section-dashboard"),
    imports: document.getElementById("section-imports"),
    movements: document.getElementById("section-movements"),
    duplicates: document.getElementById("section-duplicates"),
    history: document.getElementById("section-history"),
    installments: document.getElementById("section-installments"),
    categories: document.getElementById("section-categories"),
    accounts: document.getElementById("section-accounts"),
    suppliers: document.getElementById("section-suppliers"),
    settings: document.getElementById("section-settings"),
    profile: document.getElementById("section-profile"),
  },
};

const state = {
  activeSection: "dashboard",
  session: loadStoredSession(),
  recoveryContext: loadRecoveryContext(),
  selectedFile: null,
  preview: null,
  overview: null,
  profile: null,
  options: { institutions: [], accounts: [] },
  globalFilters: {
    competence: new Date().toISOString().slice(0, 7),
    bank: "",
    financialAccountId: "",
    movementType: "",
    category: "",
    supplierKey: "",
    search: "",
  },
  history: [],
  historyPage: 1,
  movements: [],
  movementsPage: 1,
  movementsPagination: { page: 1, total_pages: 1, total: 0 },
  duplicates: [],
  installments: [],
  suppliers: [],
  selectedImportDetails: null,
  catalogs: {
    categories: catalogState(),
    accounts: catalogState(),
    counterparties: catalogState(),
    institutions: catalogState(),
  },
  drawer: {
    entity: null,
    item: null,
  },
};

function catalogState() {
  return {
    items: [],
    pagination: { page: 1, total_pages: 1, total: 0 },
    search: "",
  };
}

function accountTypeLabel(value) {
  const labels = {
    checking: "Conta corrente",
    savings: "Poupanca",
    payment: "Conta de pagamento",
    wallet: "Carteira",
    manual: "Conta manual",
    credit_card: "Cartao de credito",
    investment: "Investimento",
    cash: "Dinheiro",
    other: "Outra conta",
  };
  return labels[value] || value || "-";
}

function movementTypeLabel(value) {
  const labels = {
    income: "Receita",
    expense: "Despesa",
    transfer: "Transferencia",
    adjustment: "Ajuste",
  };
  return labels[value] || value || "-";
}

function duplicateRuleLabel(value) {
  const labels = {
    duplicate_group_key_repetido: "Mesmo identificador externo",
    dedup_hash_repetido: "Mesmo hash operacional",
  };
  return labels[value] || "Sinal semelhante";
}

function duplicateDecisionLabel(value) {
  const labels = {
    pending: "Revisar",
    reviewed: "Nao duplicada",
    matched: "Manter esta",
    ignored: "Ignorada",
  };
  return labels[value] || "Pendente";
}

function importStatusLabel(value) {
  const labels = {
    completed: "Importacao concluida",
    completed_with_errors: "Concluida com registros ignorados",
    completed_with_duplicates: "Concluida com duplicidades",
    pending_confirmation: "Aguardando confirmacao",
    pending_review: "Aguardando revisao",
    no_new_transactions: "Nenhuma movimentacao nova",
    failed: "Falha na importacao",
    cancelled: "Importacao cancelada",
  };
  return labels[value] || "Em processamento";
}

function previewStatusLabel(value) {
  const labels = {
    accepted: "Nova",
    duplicate: "Duplicada confirmada",
    rejected: "Invalida",
  };
  return labels[value] || value || "-";
}

function loadStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadRecoveryContext() {
  try {
    const raw = sessionStorage.getItem(RECOVERY_CONTEXT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function storeSession(session) {
  state.session = session;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  if (session?.access_token && session?.refresh_token) {
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    }).catch(() => null);
  }
}

async function clearSession() {
  state.session = null;
  localStorage.removeItem(STORAGE_KEY);
  await supabase.auth.signOut().catch(() => null);
}

function storeRecoveryContext(context) {
  state.recoveryContext = context;
  sessionStorage.setItem(RECOVERY_CONTEXT_KEY, JSON.stringify(context));
}

function clearRecoveryContext() {
  state.recoveryContext = null;
  sessionStorage.removeItem(RECOVERY_CONTEXT_KEY);
}

function isExpired(session) {
  return !session?.expires_at || session.expires_at <= Math.floor(Date.now() / 1000) + 30;
}

function setMessage(target, message, type = "info") {
  if (!target) return;
  target.textContent = message || "";
  target.dataset.state = message ? type : "";
}

function showToast(message, tone = "info") {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.dataset.tone = tone;
  toast.textContent = message;
  elements.toastStack.appendChild(toast);
  window.setTimeout(() => toast.remove(), 4200);
}

function setLoading(button, isLoading, loadingText = "Carregando...") {
  if (!button) return;
  if (!button.dataset.originalLabel) {
    button.dataset.originalLabel = button.textContent;
  }
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingText : button.dataset.originalLabel;
}

function clearAuthRedirectFromUrl() {
  if (window.location.hash) {
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }
}

function hideAuthSections() {
  [elements.loginSection, elements.forgotPasswordSection, elements.resetPasswordSection].forEach((section) => section.classList.add("hidden"));
}

function showLogin(options = {}) {
  document.title = APP_NAME;
  elements.authShell.classList.remove("hidden");
  elements.appShell.classList.add("hidden");
  hideAuthSections();
  elements.loginSection.classList.remove("hidden");
  elements.sessionInfo.textContent = "";

  if (options.prefillEmail) {
    elements.usuarioInput.value = options.prefillEmail;
  }
  if (options.message) {
    setMessage(elements.loginMessage, options.message, options.messageType ?? "info");
  }
}

function showForgotPassword() {
  hideAuthSections();
  elements.forgotPasswordSection.classList.remove("hidden");
  elements.recoveryEmailInput.value = elements.usuarioInput.value.trim();
}

function showResetPassword(context) {
  hideAuthSections();
  elements.resetPasswordSection.classList.remove("hidden");
  elements.resetPasswordForm.reset();
  const emailText = context?.email ? ` para ${context.email}` : "";
  elements.resetPasswordSubtitle.textContent = context?.type === "invite"
    ? `Defina sua senha inicial${emailText}.`
    : `Defina sua nova senha${emailText}.`;
}

function showAppShell() {
  elements.authShell.classList.add("hidden");
  elements.appShell.classList.remove("hidden");
  elements.sessionInfo.textContent = state.session?.user?.email || "Sessao ativa";
  syncSessionIdentity();
}

function applyTheme(themeName = DEFAULT_THEME) {
  const aliases = {
    olive: "rebecca",
    slate: "cloud",
    sand: "stone",
  };
  document.body.dataset.theme = aliases[themeName] || themeName || DEFAULT_THEME;
}

function getInitials(nameOrEmail = "") {
  const value = String(nameOrEmail).trim();
  if (!value) return "RC";

  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }

  return value.slice(0, 2).toUpperCase();
}

function syncSessionIdentity() {
  const user = state.profile?.user || state.session?.user || null;
  const displayName = user?.display_name || user?.user_metadata?.display_name || user?.email || APP_NAME;
  const email = user?.email || state.session?.user?.email || "Sessao protegida";

  if (elements.profileAvatar) {
    elements.profileAvatar.textContent = getInitials(displayName);
  }
  if (elements.profileHeadingName) {
    elements.profileHeadingName.textContent = displayName;
  }
  if (elements.profileHeadingEmail) {
    elements.profileHeadingEmail.textContent = email;
  }
}

function createNode(tagName, className, text) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function badge(text, tone = "neutral") {
  return `<span class="status-badge ${tone}">${escapeHtml(text)}</span>`;
}

function formatCurrency(value) {
  const number = Number(value ?? 0);
  if (!Number.isFinite(number)) return "-";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(number);
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date);
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function formatDuration(start, end) {
  if (!start) return "-";
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  const seconds = Math.max(0, Math.round((endDate - startDate) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}m ${remaining}s`;
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderEmpty(target, title, description) {
  if (!target) return;
  target.replaceChildren();
  const box = createNode("div", "empty-state");
  box.appendChild(createNode("strong", "", title));
  box.appendChild(createNode("span", "", description));
  target.appendChild(box);
}

function buildGlobalQuery() {
  const query = new URLSearchParams();
  if (state.globalFilters.competence) query.set("competence", state.globalFilters.competence);
  if (state.globalFilters.bank) query.set("bank", state.globalFilters.bank);
  if (state.globalFilters.financialAccountId) query.set("financialAccountId", state.globalFilters.financialAccountId);
  if (state.globalFilters.movementType) query.set("movementType", state.globalFilters.movementType);
  if (state.globalFilters.category) query.set("category", state.globalFilters.category);
  if (state.globalFilters.supplierKey) query.set("supplierKey", state.globalFilters.supplierKey);
  return query;
}

async function apiFetch(pathname, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    auth = true,
    retryOnUnauthorized = true,
  } = options;

  if (auth) {
    await ensureSession();
  }

  const requestHeaders = {
    ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(auth && state.session?.access_token ? { Authorization: `Bearer ${state.session.access_token}` } : {}),
    ...headers,
  };

  const response = await fetch(`${API_URL}${pathname}`, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  });

  if (response.status === 401 && auth && retryOnUnauthorized && state.session?.refresh_token) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return apiFetch(pathname, { ...options, retryOnUnauthorized: false });
    }
  }

  const payload = await response.json().catch(() => null);
  return { response, payload };
}

async function ensureSession() {
  if (!state.session) throw new Error("missing_session");
  if (isExpired(state.session)) {
    const refreshed = await refreshSession();
    if (!refreshed) throw new Error("expired_session");
  }
}

async function refreshSession() {
  if (!state.session?.refresh_token) {
    await clearSession();
    return false;
  }

  const { response, payload } = await apiFetch("/auth/refresh", {
    method: "POST",
    body: { refreshToken: state.session.refresh_token },
    auth: false,
    retryOnUnauthorized: false,
  });

  if (!response.ok || !payload?.session) {
    await clearSession();
    return false;
  }

  await storeSession({ ...payload.session, user: payload.user });
  return true;
}

async function signInThroughBackend(email, password) {
  const { response, payload } = await apiFetch("/auth/login", {
    method: "POST",
    body: { usuario: email, senha: password },
    auth: false,
    retryOnUnauthorized: false,
  });

  if (!response.ok || !payload?.session) {
    return { ok: false, payload };
  }

  await storeSession({ ...payload.session, user: payload.user });
  return { ok: true };
}

async function fetchOverview() {
  const query = buildGlobalQuery();
  const { response, payload } = await apiFetch(`/portal/overview?${query.toString()}`);
  if (!response.ok) throw new Error(payload?.erro || "Falha ao carregar o dashboard.");
  state.overview = payload;
  state.profile = {
    user: payload.user,
    settings: state.profile?.settings ?? {},
    version: "1.0.0",
  };
}

async function fetchProfile() {
  const { response, payload } = await apiFetch("/portal/profile");
  if (!response.ok) throw new Error(payload?.erro || "Falha ao carregar o perfil.");
  state.profile = payload;
}

async function fetchImportOptions() {
  const { response, payload } = await apiFetch("/imports/options");
  if (!response.ok) throw new Error(payload?.erro || "Falha ao carregar instituicoes e contas.");
  state.options = {
    institutions: payload.institutions ?? [],
    accounts: payload.accounts ?? [],
  };
}

async function fetchMovements() {
  const query = buildGlobalQuery();
  query.set("page", String(state.movementsPage || 1));
  query.set("allPeriod", "true");
  query.set("pageSize", "25");
  if (state.globalFilters.search) {
    query.set("search", state.globalFilters.search);
  }

  const { response, payload } = await apiFetch(`/portal/movements?${query.toString()}`);
  if (!response.ok) throw new Error(payload?.erro || "Falha ao carregar movimentacoes.");
  state.movements = payload.items ?? [];
  state.movementsPagination = payload.pagination ?? { page: 1, total_pages: 1, total: state.movements.length };
}

async function fetchDuplicates() {
  const query = buildGlobalQuery();
  const { response, payload } = await apiFetch(`/portal/duplicates?${query.toString()}`);
  if (!response.ok) throw new Error(payload?.erro || "Falha ao carregar duplicidades.");
  state.duplicates = payload.items ?? [];
}

async function fetchSuppliers() {
  const query = buildGlobalQuery();
  const search = elements.suppliersSearch?.value?.trim();
  query.set("creditCardOnly", "true");
  if (search) query.set("search", search);
  const { response, payload } = await apiFetch(`/portal/suppliers?${query.toString()}`);
  if (!response.ok) throw new Error(payload?.erro || "Falha ao carregar fornecedores.");
  state.suppliers = payload.items ?? [];
}

async function fetchInstallments() {
  const { response, payload } = await apiFetch("/portal/installments");
  if (!response.ok) throw new Error(payload?.erro || "Falha ao carregar parcelamentos.");
  state.installments = (payload.items ?? []).map((item) => ({
    ...item,
    items: item.items ?? item.installment_plan_items ?? [],
  }));
}

async function fetchHistory() {
  const { response, payload } = await apiFetch("/imports?limit=100");
  if (!response.ok) throw new Error(payload?.erro || "Falha ao carregar o historico.");
  state.history = payload.imports ?? [];
}

async function fetchCatalog(entityName, page = null) {
  const entityState = state.catalogs[entityName];
  if (page) {
    entityState.pagination.page = page;
  }

  const query = new URLSearchParams({
    page: String(entityState.pagination.page || 1),
    pageSize: String(CATALOG_PAGE_SIZE),
  });

  if (entityState.search) {
    query.set("search", entityState.search);
  }

  const { response, payload } = await apiFetch(`/portal/catalog/${entityName}?${query.toString()}`);
  if (!response.ok) throw new Error(payload?.erro || `Falha ao carregar ${entityName}.`);
  entityState.items = payload.items ?? [];
  entityState.pagination = payload.pagination ?? { page: 1, total_pages: 1, total: entityState.items.length };
}

function renderStats() {
  const metrics = state.overview?.metrics;
  if (!metrics) {
    renderEmpty(elements.statsGrid, "Nenhum indicador disponivel", "Assim que houver transacoes e cadastros, o dashboard mostrara os principais numeros aqui.");
    return;
  }

  elements.statsGrid.replaceChildren(...[
    ["Saldo geral", formatCurrency(metrics.overall_balance), "Saldo somado entre as contas com dinheiro disponivel"],
    ["Receitas x despesas", `${formatCurrency(metrics.monthly_income)} / ${formatCurrency(metrics.monthly_expense)}`, "Entradas e saidas na competencia ativa"],
    ["Ultima importacao", formatDateTime(metrics.latest_import_at), "Historico OFX mais recente"],
  ].map(([label, value, support]) => {
    const card = createNode("article", "stat-card");
    card.appendChild(createNode("p", "eyebrow", label));
    card.appendChild(createNode("strong", "stat-value", value));
    card.appendChild(createNode("span", "stat-trend", support));
    return card;
  }));

  elements.dashboardGreeting.textContent = state.overview?.user?.display_name
    ? `Bom trabalho, ${state.overview.user.display_name}.`
    : "Seu panorama financeiro em um unico lugar";
  if (elements.dashboardCompetence) {
    elements.dashboardCompetence.value = state.globalFilters.competence || "";
  }
}

function renderBarSeries(target, rows, valueKeys, formatter) {
  target.replaceChildren();
  if (!rows.length) {
    renderEmpty(target, "Nenhum dado encontrado", "Os graficos aparecerao aqui quando houver movimentacao suficiente.");
    return;
  }

  const maxValue = Math.max(1, ...rows.flatMap((row) => valueKeys.map((key) => Number(row[key] ?? row.total ?? 0))));
  rows.forEach((row) => {
    const card = createNode("div", "chart-bar");
    if (valueKeys.length === 1) {
      const value = Number(row[valueKeys[0]] ?? row.total ?? 0);
      const head = createNode("div", "chart-bar-head");
      head.append(createNode("strong", "", row.name || row.month || "-"), createNode("span", "", formatter(value, row)));
      const track = createNode("div", "chart-track");
      const fill = createNode("div", "chart-fill");
      fill.style.width = `${Math.min(100, (value / maxValue) * 100)}%`;
      track.appendChild(fill);
      card.append(head, track);
    } else {
      const head = createNode("div", "chart-bar-head");
      head.append(createNode("strong", "", row.month || "-"), createNode("span", "", `${formatCurrency(row.income)} / ${formatCurrency(row.expense)}`));
      const incomeTrack = createNode("div", "chart-track");
      const incomeFill = createNode("div", "chart-fill");
      incomeFill.style.width = `${Math.min(100, (Number(row.income ?? 0) / maxValue) * 100)}%`;
      incomeTrack.appendChild(incomeFill);
      const expenseTrack = createNode("div", "chart-track");
      const expenseFill = createNode("div", "chart-fill expense");
      expenseFill.style.width = `${Math.min(100, (Number(row.expense ?? 0) / maxValue) * 100)}%`;
      expenseTrack.appendChild(expenseFill);
      card.append(head, incomeTrack, expenseTrack);
    }
    target.appendChild(card);
  });
}

function renderDashboard() {
  renderGlobalFilterOptions();
  renderStats();
  renderBarSeries(elements.monthlyTrend, state.overview?.monthly_trend ?? [], ["income", "expense"], () => "");
  renderBarSeries(elements.categorySummary, state.overview?.category_summary ?? [], ["total"], (value) => formatCurrency(value));
  renderAccountBalances();
  renderCardBillSummary();
}

function movementTone(value) {
  if (value === "income") return "success";
  if (value === "expense") return "danger";
  if (value === "transfer") return "info";
  return "neutral";
}

function renderGlobalFilterOptions() {
  const options = state.overview?.filter_options ?? {};

  if (elements.filterCompetence && !elements.filterCompetence.value) {
    elements.filterCompetence.value = state.globalFilters.competence;
  }

  replaceSelectOptions(elements.filterBank, "Todos os bancos", options.banks ?? [], state.globalFilters.bank);
  replaceSelectOptions(elements.filterCategory, "Todas as categorias", options.categories ?? [], state.globalFilters.category);

  if (elements.filterAccount) {
    const placeholder = createNode("option", "", "Todas as contas");
    placeholder.value = "";
    elements.filterAccount.replaceChildren(placeholder);
    (options.accounts ?? []).forEach((account) => {
      const option = createNode("option", "", `${account.name} (${account.account_type_label || accountTypeLabel(account.account_type)})`);
      option.value = account.id;
      option.selected = account.id === state.globalFilters.financialAccountId;
      elements.filterAccount.appendChild(option);
    });
  }
}

function replaceSelectOptions(target, placeholderLabel, values, selectedValue = "") {
  if (!target) return;
  const placeholder = createNode("option", "", placeholderLabel);
  placeholder.value = "";
  target.replaceChildren(placeholder);
  values.forEach((value) => {
    const option = createNode("option", "", value);
    option.value = value;
    option.selected = value === selectedValue;
    target.appendChild(option);
  });
}

function renderAccountBalances() {
  const rows = (state.overview?.account_balances ?? []).filter((row) => row.account_type !== "credit_card");
  if (!rows.length) {
    renderEmpty(elements.accountBalanceList, "Nenhuma conta de saldo disponivel", "Crie ou importe contas correntes, de pagamento, poupanca, carteira ou contas manuais para acompanhar o saldo consolidado.");
    return;
  }

  elements.accountBalanceList.replaceChildren();
  rows
    .sort((a, b) => Number(b.current_balance ?? 0) - Number(a.current_balance ?? 0))
    .forEach((row) => {
      const card = createNode("article", "row-card");
      const head = createNode("div", "chart-bar-head");
      head.append(createNode("strong", "", row.name), createNode("span", "", formatCurrency(row.current_balance)));
      card.append(head, createNode("span", "mini-copy", `${row.institution_name || "Sem instituicao"} � ${row.account_type_label || accountTypeLabel(row.account_type)}`));
      elements.accountBalanceList.appendChild(card);
    });
}

function renderCardBillSummary() {
  const summary = state.overview?.card_summary;
  if (!summary?.cards?.length && !summary?.commitments?.length) {
    renderEmpty(elements.cardBillSummary, "Nenhuma fatura aberta", "Assim que contas do tipo cartao de credito receberem lancamentos, a leitura de fatura aparecera aqui.");
    return;
  }

  elements.cardBillSummary.replaceChildren();
  (summary.cards ?? []).forEach((row) => {
    const card = createNode("article", "row-card");
    card.appendChild(createNode("strong", "", row.name));
    card.appendChild(createNode("span", "mini-copy", `Valor ${formatCurrency(row.statement_amount ?? row.open_amount)}`));
    card.appendChild(createNode("span", "mini-copy", `Vencimento ${formatDate(row.next_due_date)} - Limite ${row.credit_limit_amount ? formatCurrency(row.credit_limit_amount) : "nao informado"}`));
    elements.cardBillSummary.appendChild(card);
  });
  (summary.commitments ?? []).forEach((row) => {
    const card = createNode("article", "row-card");
    card.appendChild(createNode("strong", "", row.name));
    card.appendChild(createNode("span", "mini-copy", `Valor ${formatCurrency(row.amount)}`));
    card.appendChild(createNode("span", "mini-copy", `Vencimento ${formatDate(row.due_date)}`));
    elements.cardBillSummary.appendChild(card);
  });
}
function renderInstallmentSummary() {
  const summary = state.overview?.installment_summary;
  if (!summary?.count) {
    renderEmpty(elements.installmentSummary, "Nenhum parcelamento ativo", "Cadastre parcelamentos manuais para acompanhar proximas parcelas e valor restante.");
    return;
  }

  const nextText = summary.next_installment
    ? `${summary.next_installment.description || "Parcela"} em ${formatDate(summary.next_installment.due_date)}`
    : "Sem proxima parcela definida";

  elements.installmentSummary.replaceChildren();
  const card = createNode("article", "row-card");
  card.appendChild(createNode("strong", "", `${summary.count} parcelas em aberto`));
  card.appendChild(createNode("span", "mini-copy", `Valor restante ${formatCurrency(summary.remaining_amount)}`));
  card.appendChild(createNode("span", "mini-copy", nextText));
  elements.installmentSummary.appendChild(card);
}

function renderSimpleTransactions(target, rows, emptyMessage) {
  target.replaceChildren();
  if (!rows.length) {
    renderEmpty(target, "Sem movimentacoes", emptyMessage);
    return;
  }

  rows.forEach((row) => {
    const card = createNode("article", "row-card");
    const head = createNode("div", "chart-bar-head");
    head.append(createNode("strong", "", row.descricao || row.descricao_normalizada || "-"), createNode("span", "", formatCurrency(row.valor)));
    card.appendChild(head);
    card.appendChild(createNode("span", "mini-copy", `${formatDate(row.data)} • ${row.banco || "Sem banco"} • ${row.categoria || "Sem categoria"}`));
    target.appendChild(card);
  });
}

function renderRecentImports(target, rows) {
  target.replaceChildren();
  if (!rows.length) {
    renderEmpty(target, "Nenhuma importacao recente", "Assim que voce confirmar uma importacao, ela aparecera resumida aqui.");
    return;
  }

  rows.forEach((row) => {
    const card = createNode("article", "row-card");
    card.appendChild(createNode("strong", "", importStatusLabel(row.status_code)));
    card.appendChild(createNode("span", "mini-copy", `${row.accepted_rows ?? 0} novas | ${row.duplicate_rows ?? 0} duplicadas | ${row.total_rows ?? 0} linhas analisadas`));
    card.appendChild(createNode("span", "mini-copy", `Atualizada em ${formatDateTime(row.finished_at || row.started_at)}`));
    target.appendChild(card);
  });
}

function renderBankSummary(target, rows) {
  target.replaceChildren();
  if (!rows.length) {
    renderEmpty(target, "Sem resumo bancario", "As despesas por banco serao consolidadas conforme as transacoes forem confirmadas.");
    return;
  }
  rows.forEach((row) => {
    const card = createNode("article", "row-card");
    const head = createNode("div", "chart-bar-head");
    head.append(createNode("strong", "", row.banco || "Sem banco"), createNode("span", "", formatCurrency(row.total_gasto)));
    card.append(head, createNode("span", "mini-copy", `${row.quantidade_transacoes} transacoes • ${formatDate(row.periodo_inicial)} a ${formatDate(row.periodo_final)}`));
    target.appendChild(card);
  });
}

function renderImportOptions() {
  const institutionPlaceholder = createNode("option", "", "Selecione a instituicao");
  institutionPlaceholder.value = "";
  elements.institutionSelect.replaceChildren(institutionPlaceholder);
  state.options.institutions.forEach((institution) => {
    const option = createNode("option", "", institution.name);
    option.value = institution.id;
    elements.institutionSelect.appendChild(option);
  });

  const accountPlaceholder = createNode("option", "", state.options.accounts.length ? "Selecione a conta" : "Nenhuma conta disponivel");
  accountPlaceholder.value = "";
  elements.accountSelect.replaceChildren(accountPlaceholder);
  elements.installmentFinancialAccount?.replaceChildren(createNode("option", "", "Sem conta vinculada"));
  state.options.accounts.forEach((account) => {
    const option = createNode("option", "", `${account.name} (${accountTypeLabel(account.account_type)})`);
    option.value = account.id;
    option.dataset.institutionId = account.financial_institution_id ?? "";
    elements.accountSelect.appendChild(option);
    if (elements.installmentFinancialAccount) {
      const accountOption = createNode("option", "", `${account.name} (${accountTypeLabel(account.account_type)})`);
      accountOption.value = account.id;
      elements.installmentFinancialAccount.appendChild(accountOption);
    }
  });

  if (elements.installmentCategory) {
    const placeholder = createNode("option", "", "Sem categoria");
    placeholder.value = "";
    elements.installmentCategory.replaceChildren(placeholder);
    state.catalogs.categories.items.forEach((category) => {
      const option = createNode("option", "", category.name);
      option.value = category.id;
      elements.installmentCategory.appendChild(option);
    });
  }
}

function renderMovements() {
  if (!state.movements.length) {
    renderEmpty(elements.movementsTable, "Nenhuma movimentacao encontrada", "Ajuste os filtros globais ou importe novos arquivos OFX para preencher esta tela.");
  } else {
    elements.movementsTable.innerHTML = tableHtml([
      { key: "data", label: "Data", formatter: formatDate },
      { key: "descricao", label: "Descricao", formatter: (_, row) => row.descricao || row.descricao_normalizada || "-" },
      { key: "banco", label: "Banco", formatter: (value) => value || "-" },
      { key: "conta_nome", label: "Conta", formatter: (value) => value || "-" },
      { key: "tipo_conta_label", label: "Origem", formatter: (value) => value || "-" },
      { key: "categoria", label: "Categoria", formatter: (value) => value || "Sem categoria" },
      { key: "contraparte", label: "Fornecedor", formatter: (value) => value || "-" },
      { key: "tipo_movimento", label: "Tipo", formatter: (value) => badge(movementTypeLabel(value || "adjustment"), movementTone(value)) },
      { key: "valor", label: "Valor", formatter: formatCurrency },
      {
        key: "actions",
        label: "Acoes",
        formatter: (_, row) => `<button type="button" class="btn btn-ghost movement-action" data-action="categorize" data-id="${row.id}">Categorizar</button>`,
      },
    ], state.movements);
  }

  const pagination = state.movementsPagination ?? { page: 1, total_pages: 1, total: 0 };
  const currentPage = Math.max(1, Number(pagination.page) || 1);
  const totalPages = Math.max(1, Number(pagination.total_pages) || 1);
  const totalRows = Math.max(0, Number(pagination.total) || 0);
  elements.movementsPaginationLabel.textContent = `Pagina ${currentPage} de ${totalPages} • ${totalRows} registros`;
  elements.movementsPrevPage.disabled = currentPage <= 1;
  elements.movementsNextPage.disabled = currentPage >= totalPages;
}

function renderDuplicates() {
  if (!state.duplicates.length) {
    renderEmpty(elements.duplicatesTable, "Nenhuma duplicidade encontrada", "Quando existirem lancamentos similares, eles aparecerao aqui para consulta rapida.");
    return;
  }

  elements.duplicatesTable.innerHTML = tableHtml([
    { key: "data", label: "Data", formatter: formatDate },
    { key: "descricao", label: "Descricao", formatter: (_, row) => row.descricao || row.descricao_normalizada || "-" },
    { key: "banco", label: "Banco", formatter: (value) => value || "-" },
    { key: "conta_nome", label: "Conta", formatter: (value) => value || "-" },
    { key: "fornecedor", label: "Fornecedor", formatter: (_, row) => row.fornecedor || row.contraparte || "Sem fornecedor" },
    { key: "duplicate_rule", label: "Regra", formatter: (value) => duplicateRuleLabel(value) },
    { key: "duplicate_group", label: "Grupo", formatter: (value) => value || "-" },
    { key: "valor", label: "Valor", formatter: formatCurrency },
    { key: "status", label: "Status", formatter: (value) => badge(duplicateDecisionLabel(value), value === "matched" ? "success" : value === "reviewed" ? "info" : "warning") },
    {
      key: "actions",
      label: "Acoes",
      formatter: (_, row) => [
        `<button type="button" class="btn btn-ghost duplicate-action" data-action="not_duplicate" data-id="${row.id}">Nao duplicada</button>`,
        `<button type="button" class="btn btn-ghost duplicate-action" data-action="keep" data-id="${row.id}">Manter esta</button>`,
        `<button type="button" class="btn btn-ghost duplicate-action" data-action="review_later" data-id="${row.id}">Revisar depois</button>`,
      ].join(" "),
    },
  ], state.duplicates);
}

function renderInstallments() {
  if (!state.installments.length) {
    renderEmpty(elements.installmentsTable, "Nenhum parcelamento cadastrado", "Cadastre compromissos manuais para gerar as parcelas automaticamente.");
    return;
  }

  const rows = state.installments.map((plan) => {
    const items = Array.isArray(plan.items) ? [...plan.items] : [];
    items.sort((a, b) => String(a.due_date || "").localeCompare(String(b.due_date || "")) || Number(a.installment_number || 0) - Number(b.installment_number || 0));
    const currentItem = items.find((item) => !["paid", "completed", "cancelled"].includes(String(item.status_code || "").toLowerCase())) || items[items.length - 1] || null;
    const remainingCount = items.filter((item) => !["paid", "completed", "cancelled"].includes(String(item.status_code || "").toLowerCase())).length;

    return {
      plan_id: plan.id,
      item_id: currentItem?.id || "",
      transaction_id: currentItem?.transaction_id || null,
      description: plan.description || plan.merchant_name || "Parcelamento",
      supplier_name: plan.counterparty?.display_name || plan.merchant_name || "-",
      current_installment: currentItem ? `${currentItem.installment_number}/${plan.installment_count}` : `0/${plan.installment_count}`,
      next_due_date: currentItem?.due_date || null,
      amount: currentItem?.amount ?? plan.installment_amount,
      remaining_count: remainingCount,
      account_name: plan.financial_account?.name || "-",
      status: currentItem?.status_code || plan.status_code,
    };
  });

  elements.installmentsTable.innerHTML = tableHtml([
    { key: "description", label: "Descricao" },
    { key: "supplier_name", label: "Fornecedor" },
    { key: "current_installment", label: "Parcela atual" },
    { key: "next_due_date", label: "Vencimento atual", formatter: formatDate },
    { key: "amount", label: "Valor atual", formatter: formatCurrency },
    { key: "remaining_count", label: "Restantes", formatter: (value) => String(value ?? 0) },
    { key: "account_name", label: "Conta" },
    { key: "status", label: "Status", formatter: (value) => badge(value || "active", value === "completed" ? "success" : value === "cancelled" ? "danger" : "info") },
    {
      key: "actions",
      label: "Acoes",
      formatter: (_, row) => [
        row.item_id ? `<button type="button" class="btn btn-ghost installment-action" data-action="mark-paid" data-plan-id="${row.plan_id}" data-item-id="${row.item_id}">Marcar paga</button>` : "",
        row.item_id ? `<button type="button" class="btn btn-ghost installment-action" data-action="link" data-plan-id="${row.plan_id}" data-item-id="${row.item_id}">Vincular</button>` : "",
        `<button type="button" class="btn btn-ghost installment-action" data-action="delete-plan" data-plan-id="${row.plan_id}">Excluir</button>`,
        `<button type="button" class="btn btn-ghost installment-action" data-action="cancel-plan" data-plan-id="${row.plan_id}">Cancelar</button>`,
      ].filter(Boolean).join(" "),
    },
  ], rows);
}

function renderSupplierHighlights() {
  if (!elements.supplierHighlights) return;
  const rows = state.suppliers ?? [];
  if (!rows.length) {
    renderEmpty(elements.supplierHighlights, "Sem fornecedores no periodo", "As despesas agrupadas por fornecedor aparecerao aqui quando houver recorrencia no periodo filtrado.");
    return;
  }

  const totalSpent = rows.reduce((sum, row) => sum + Number(row.total_spent ?? 0), 0);
  const totalPurchases = rows.reduce((sum, row) => sum + Number(row.purchase_count ?? 0), 0);
  const cards = [
    ["Maior fornecedor", rows[0]?.supplier_name || "-", `${formatCurrency(rows[0]?.total_spent || 0)} no periodo`],
    ["Fornecedores recorrentes", String(rows.length), `${formatCurrency(totalSpent)} em despesas mapeadas`],
    ["Compras agrupadas", String(totalPurchases), "Apenas fornecedores com mais de um gasto no periodo"],
  ];

  elements.supplierHighlights.innerHTML = "";
  cards.forEach(([label, value, support]) => {
    const card = createNode("article", "stat-card");
    card.append(createNode("p", "eyebrow", label), createNode("strong", "stat-value", value), createNode("span", "stat-trend", support));
    elements.supplierHighlights.appendChild(card);
  });
}

function renderSuppliers() {
  renderSupplierHighlights();
  if (!state.suppliers.length) {
    renderEmpty(elements.counterpartiesTable, "Nenhum fornecedor encontrado", "Ajuste os filtros globais ou importe novas despesas para montar a analise do periodo.");
    return;
  }

  elements.counterpartiesTable.innerHTML = tableHtml([
    { key: "supplier_name", label: "Fornecedor" },
    { key: "purchase_count", label: "Compras" },
    { key: "total_spent", label: "Total gasto", formatter: (value) => formatCurrency(value) },
    { key: "average_spent", label: "Valor medio", formatter: (value) => formatCurrency(value) },
    { key: "highest_spent", label: "Maior compra", formatter: (value) => formatCurrency(value) },
    { key: "last_purchase_at", label: "Ultima compra", formatter: formatDate },
    { key: "institution_name", label: "Banco" },
    { key: "financial_account_name", label: "Conta ou cartao" },
    { key: "primary_category", label: "Categoria predominante" },
    { key: "percentage_of_expenses", label: "% das despesas", formatter: (value) => `${Number(value || 0).toFixed(1)}%` },
    {
      key: "actions",
      label: "Acoes",
      formatter: (_, row) => [
        `<button type="button" class="btn btn-ghost supplier-action" data-action="view" data-supplier="${escapeHtml(row.supplier_name)}" data-supplier-key="${escapeHtml(row.supplier_key)}">Ver gastos</button>`,
        `<button type="button" class="btn btn-ghost supplier-action" data-action="categorize" data-supplier="${escapeHtml(row.supplier_name)}" data-supplier-key="${escapeHtml(row.supplier_key)}">Categorizar gastos</button>`,
      ].join(" "),
    },
  ], state.suppliers);

  if (elements.counterpartiesPagination) {
    elements.counterpartiesPagination.textContent = `${state.suppliers.length} fornecedores recorrentes no periodo`;
  }
}

function syncQuickAccountFields() {
  const isCreditCard = elements.createAccountType.value === "credit_card";
  document.querySelectorAll("[data-credit-card-only='true']").forEach((field) => {
    field.disabled = !isCreditCard;
    field.previousElementSibling?.classList?.toggle("is-disabled", !isCreditCard);
    if (!isCreditCard) {
      field.value = "";
    }
  });
}

function renderSelectedFile() {
  elements.selectedFileCard.replaceChildren();
  if (!state.selectedFile) {
    elements.selectedFileCard.classList.add("hidden");
    return;
  }
  elements.selectedFileCard.classList.remove("hidden");
  elements.selectedFileCard.append(
    createNode("strong", "", state.selectedFile.name),
    createNode("span", "mini-copy", `${(state.selectedFile.size / 1024).toFixed(1)} KB • ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date())}`),
  );
}

function renderPreview() {
  elements.previewPanel.replaceChildren();
  elements.confirmImportButton.disabled = !state.preview?.import_id || state.preview?.status === "failed";

  if (!state.preview) {
    renderEmpty(elements.previewPanel, "Nenhum preview gerado", "Envie um OFX para visualizar valores, duplicidades e o resumo financeiro antes da confirmacao.");
    return;
  }

  const preview = state.preview;
  const summary = createNode("div", "summary-card");
  const head = createNode("div", "section-head compact");
  const headLeft = createNode("div");
  headLeft.append(createNode("p", "eyebrow", "Arquivo analisado"), createNode("h4", "", preview.file.name));
  const headRight = createNode("div", "toolbar-inline");
  headRight.innerHTML = badge(importStatusLabel(preview.status), preview.status === "failed" ? "danger" : "success")
    + badge(preview.institution.detected_label || "Instituicao pendente", preview.institution.detected_label ? "info" : "warning");
  head.append(headLeft, headRight);
  summary.appendChild(head);

  const metrics = createNode("div", "stats-grid");
  [
    ["Conta", preview.financial_account.name],
    ["Periodo", `${formatDate(preview.period.start_date)} a ${formatDate(preview.period.end_date)}`],
    ["Saldo", formatCurrency(preview.ledger_balance)],
    ["Validas", String(preview.totals.valid_rows)],
    ["Duplicadas", String(preview.totals.duplicate_rows)],
    ["Despesas", formatCurrency(preview.totals.total_expense)],
  ].forEach(([label, value]) => {
    const card = createNode("div", "stat-card");
    card.append(createNode("p", "eyebrow", label), createNode("strong", "stat-value", value));
    metrics.appendChild(card);
  });
  summary.appendChild(metrics);
  elements.previewPanel.appendChild(summary);

  if (preview.warnings?.length) {
    const warnings = createNode("div", "detail-card");
    warnings.appendChild(createNode("strong", "", "Avisos"));
    preview.warnings.forEach((warning) => warnings.appendChild(createNode("span", "mini-copy", warning)));
    elements.previewPanel.appendChild(warnings);
  }

  const rowsRegion = createNode("div", "table-wrap");
  const rows = preview.preview_rows ?? [];
  if (!rows.length) {
    renderEmpty(elements.previewPanel, "Preview vazio", "Nenhuma linha foi retornada pelo parser OFX.");
    return;
  }

  rowsRegion.innerHTML = tableHtml([
    { key: "row_number", label: "#" },
    { key: "occurred_on", label: "Data", formatter: formatDate },
    { key: "description", label: "Descricao" },
    { key: "amount", label: "Valor", formatter: formatCurrency },
    { key: "status", label: "Status", formatter: (value) => badge(previewStatusLabel(value), value === "accepted" ? "success" : value === "duplicate" ? "warning" : "danger") },
    { key: "duplicate_reason", label: "Motivo", formatter: (value) => value || "-" },
  ], rows);
  elements.previewPanel.appendChild(rowsRegion);
}

function getFilteredHistory() {
  const search = normalizeText(elements.historySearch.value);
  const status = elements.historyStatusFilter.value;
  return state.history.filter((item) => {
    const haystack = normalizeText([
      item.file?.name,
      item.financial_account?.name,
      item.institution?.name,
      item.status,
    ].join(" "));
    const searchMatch = !search || haystack.includes(search);
    const statusMatch = !status || item.status === status;
    return searchMatch && statusMatch;
  });
}

function renderHistory() {
  const rows = getFilteredHistory();
  const totalPages = Math.max(1, Math.ceil(rows.length / HISTORY_PAGE_SIZE));
  state.historyPage = Math.min(totalPages, Math.max(1, state.historyPage));
  const from = (state.historyPage - 1) * HISTORY_PAGE_SIZE;
  const pageRows = rows.slice(from, from + HISTORY_PAGE_SIZE);

  if (!pageRows.length) {
    renderEmpty(elements.historyTable, "Nenhuma importacao encontrada", "Ajuste os filtros ou realize uma nova importacao para preencher esta central.");
  } else {
    elements.historyTable.innerHTML = tableHtml([
      { key: "file", label: "Arquivo", formatter: (_, row) => row.file?.name || "-" },
      { key: "institution", label: "Banco", formatter: (_, row) => row.institution?.name || "-" },
      { key: "financial_account", label: "Conta", formatter: (_, row) => row.financial_account?.name || "-" },
      { key: "started_at", label: "Inicio", formatter: formatDateTime },
      { key: "status", label: "Status", formatter: (value) => badge(importStatusLabel(value), historyTone(value)) },
      { key: "duration", label: "Tempo", formatter: (_, row) => formatDuration(row.started_at, row.finished_at) },
      {
        key: "actions",
        label: "Acoes",
        formatter: (_, row) => [
          `<button type="button" class="btn btn-ghost history-action" data-action="view" data-import-id="${row.id}">Visualizar</button>`,
          row.status === "pending_confirmation"
            ? `<button type="button" class="btn btn-ghost history-action" data-action="cancel" data-import-id="${row.id}">Cancelar</button>`
            : "",
        ].join(" "),
      },
    ], pageRows);
  }

  elements.historyPaginationLabel.textContent = `Pagina ${state.historyPage} de ${totalPages}`;
  elements.historyPrevPage.disabled = state.historyPage <= 1;
  elements.historyNextPage.disabled = state.historyPage >= totalPages;
}

function historyTone(status) {
  if (status === "completed") return "success";
  if (status === "completed_with_duplicates" || status === "completed_with_errors" || status === "pending_confirmation" || status === "pending_review" || status === "no_new_transactions") return "warning";
  if (status === "failed") return "danger";
  return "neutral";
}

async function loadHistoryDetails(importId) {
  const { response, payload } = await apiFetch(`/imports/${importId}`);
  if (!response.ok) throw new Error(payload?.erro || "Falha ao carregar detalhes da importacao.");
  state.selectedImportDetails = payload.importacao;
  renderHistoryDetails();
}

function renderHistoryDetails() {
  elements.historyDetails.replaceChildren();
  const details = state.selectedImportDetails;
  if (!details) {
    renderEmpty(elements.historyDetails, "Nenhuma importacao selecionada", "Use o botao visualizar para abrir o resumo detalhado neste painel.");
    return;
  }

  const summary = createNode("div", "summary-card");
  summary.append(
    createNode("strong", "", details.files?.[0]?.name || "Importacao"),
    createNode("span", "mini-copy", `${details.financial_account?.name || "Sem conta"} • ${details.institution?.name || "Sem banco"}`),
    createNode("span", "mini-copy", `Periodo ${formatDate(details.processing_summary?.period?.start_date)} a ${formatDate(details.processing_summary?.period?.end_date)}`),
  );
  if (details.status === "pending_confirmation") {
    const actions = createNode("div", "toolbar-inline");
    actions.innerHTML = `<button type="button" class="btn btn-primary history-detail-action" data-action="confirm" data-import-id="${details.id}">Confirmar importacao</button>`;
    summary.appendChild(actions);
  }
  elements.historyDetails.appendChild(summary);

  const meta = createNode("div", "stats-grid");
  [
    ["Aceitos", String(details.totals.accepted_rows)],
    ["Rejeitados", String(details.totals.rejected_rows)],
    ["Duplicados", String(details.totals.duplicate_rows)],
    ["Processados", String(details.totals.processed_rows)],
    ["Saldo OFX", formatCurrency(details.processing_summary?.ledger_balance)],
    ["Status", importStatusLabel(details.status)],
  ].forEach(([label, value]) => {
    const card = createNode("div", "stat-card");
    card.append(createNode("p", "eyebrow", label), createNode("strong", "stat-value", value));
    meta.appendChild(card);
  });
  elements.historyDetails.appendChild(meta);

  const rowsWrap = createNode("div", "table-wrap");
  rowsWrap.innerHTML = tableHtml([
    { key: "row_number", label: "#" },
    { key: "occurred_on", label: "Data", formatter: formatDate },
    { key: "description", label: "Descricao" },
    { key: "amount", label: "Valor", formatter: formatCurrency },
    { key: "status", label: "Status", formatter: (value) => badge(previewStatusLabel(value), value === "accepted" ? "success" : value === "duplicate" ? "warning" : "neutral") },
    { key: "linked_transaction_id", label: "Vinculo", formatter: (value) => value ? "Criada" : "-" },
  ], details.rows ?? []);
  elements.historyDetails.appendChild(rowsWrap);
}

function tableHtml(columns, rows) {
  const headers = columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("");
  const body = rows.map((row) => {
    const cells = columns.map((column) => {
      const raw = typeof column.formatter === "function"
        ? column.formatter(row[column.key], row)
        : row[column.key] ?? "-";
      const content = typeof raw === "string" && raw.includes("<span")
        ? raw
        : typeof raw === "string" && raw.includes("<button")
          ? raw
          : escapeHtml(raw);
      return `<td>${content}</td>`;
    }).join("");
    return `<tr>${cells}</tr>`;
  }).join("");
  return `<table><thead><tr>${headers}</tr></thead><tbody>${body}</tbody></table>`;
}

function renderCatalog(entityName) {
  const config = ENTITY_CONFIG[entityName];
  const entityState = state.catalogs[entityName];
  const target = document.getElementById(config.tableId);
  const paginationLabel = config.paginationId ? document.getElementById(config.paginationId) : null;

  if (!entityState.items.length) {
    renderEmpty(target, `Nenhum ${config.title.toLowerCase()} encontrado`, "Use o botao de novo cadastro para criar o primeiro registro desta area.");
  } else {
    const rows = entityState.items.map((item) => ({
      ...item,
      actions: [
        `<button type="button" class="btn btn-ghost catalog-action" data-action="edit" data-entity="${entityName}" data-id="${item.id}">Editar</button>`,
        item.user_id === null && entityName === "categories"
          ? ""
          : `<button type="button" class="btn btn-ghost catalog-action" data-action="archive" data-entity="${entityName}" data-id="${item.id}">Arquivar</button>`,
      ].join(" "),
    }));
    target.innerHTML = tableHtml([...config.columns, { key: "actions", label: "Acoes" }], rows);
  }

  if (paginationLabel) {
    paginationLabel.textContent = `Pagina ${entityState.pagination.page} de ${entityState.pagination.total_pages}`;
  }
}

function openDrawer(entityName, item = null) {
  const config = ENTITY_CONFIG[entityName];
  state.drawer = { entity: entityName, item };
  elements.drawerTitle.textContent = item ? `Editar ${config.title}` : `Nova ${config.title}`;
  elements.drawerEyebrow.textContent = entityName === "institutions" ? "Cadastro global" : "Cadastro";
  elements.drawer.classList.remove("hidden");
  elements.drawer.setAttribute("aria-hidden", "false");
  elements.entityForm.replaceChildren();
  setMessage(elements.drawerMessage, "");

  config.fields.forEach((field) => {
    const label = createNode("label", "", field.label);
    label.htmlFor = `drawer-${field.name}`;
    let input;

    if (field.type === "select") {
      input = document.createElement("select");
      input.appendChild(new Option("Selecione", ""));
      field.options.forEach((optionValue) => {
        const label = field.name === "account_type"
          ? accountTypeLabel(optionValue)
          : field.name === "movement_type"
            ? movementTypeLabel(optionValue)
            : optionValue;
        input.appendChild(new Option(label, optionValue));
      });
    } else if (field.type === "textarea") {
      input = document.createElement("textarea");
    } else if (field.type === "checkbox") {
      const wrapper = createNode("label", "switch-row");
      input = document.createElement("input");
      input.type = "checkbox";
      input.id = `drawer-${field.name}`;
      input.name = field.name;
      input.checked = item ? Boolean(item[field.name]) : Boolean(field.name === "is_active");
      wrapper.append(input, createNode("span", "", field.label));
      elements.entityForm.appendChild(wrapper);
      return;
    } else if (field.type === "institution-select" || field.type === "account-select") {
      input = document.createElement("select");
      input.appendChild(new Option(field.type === "institution-select" ? "Sem instituicao" : "Sem conta pagadora", ""));
      const source = field.type === "institution-select" ? state.options.institutions : state.options.accounts;
      source.forEach((sourceItem) => input.appendChild(new Option(sourceItem.name, sourceItem.id)));
    } else {
      input = document.createElement("input");
      input.type = field.type;
    }

    input.id = `drawer-${field.name}`;
    input.name = field.name;
    if (field.required) input.required = true;
    if (field.placeholder) input.placeholder = field.placeholder;
    if (item && item[field.name] != null) {
      input.value = item[field.name];
    } else if (!item && field.name === "is_active" && input.type !== "checkbox") {
      input.value = "true";
    } else if (!item && field.name === "movement_type") {
      input.value = "expense";
    }
    if (!item && field.name === "country_code") input.value = "BR";
    if (!item && field.name === "theme") input.value = DEFAULT_THEME;

    elements.entityForm.append(label, input);
  });

  const submitButton = createNode("button", "btn btn-primary", item ? "Salvar alteracoes" : "Criar registro");
  submitButton.type = "submit";
  submitButton.id = "drawerSubmitButton";
  elements.entityForm.appendChild(submitButton);
}

function closeDrawer() {
  state.drawer = { entity: null, item: null };
  elements.drawer.classList.add("hidden");
  elements.drawer.setAttribute("aria-hidden", "true");
}

function collectFormData(form) {
  const data = {};
  Array.from(form.elements).forEach((element) => {
    if (!element.name) return;
    if (element.type === "checkbox") {
      data[element.name] = element.checked;
      return;
    }
    data[element.name] = element.value;
  });
  return data;
}

async function saveDrawerEntity(event) {
  event.preventDefault();
  const entityName = state.drawer.entity;
  if (!entityName) return;
  const payload = collectFormData(elements.entityForm);
  const submitButton = document.getElementById("drawerSubmitButton");
  setLoading(submitButton, true, "Salvando...");
  setMessage(elements.drawerMessage, "");

  try {
    const isEditing = Boolean(state.drawer.item?.id);
    const path = isEditing
      ? `/portal/catalog/${entityName}/${state.drawer.item.id}`
      : `/portal/catalog/${entityName}`;
    const { response, payload: result } = await apiFetch(path, {
      method: isEditing ? "PUT" : "POST",
      body: payload,
    });

    if (!response.ok) {
      setMessage(elements.drawerMessage, result?.erro || "Falha ao salvar o cadastro.", "error");
      return;
    }

    await fetchCatalog(entityName, state.catalogs[entityName].pagination.page);
    renderCatalog(entityName);
    if (entityName === "accounts" || entityName === "institutions") {
      await fetchImportOptions();
      renderImportOptions();
    }
    closeDrawer();
    showToast(`${ENTITY_CONFIG[entityName].title} salva com sucesso.`, "success");
  } catch (error) {
    setMessage(elements.drawerMessage, error.message || "Falha ao salvar o cadastro.", "error");
  } finally {
    setLoading(submitButton, false);
  }
}

async function archiveCatalogItem(event) {
  const button = event.target.closest(".catalog-action[data-action='archive']");
  if (!button) return;
  const { entity, id } = button.dataset;
  setLoading(button, true, "Arquivando...");

  try {
    const { response, payload } = await apiFetch(`/portal/catalog/${entity}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      showToast(payload?.erro || "Falha ao arquivar o registro.", "error");
      return;
    }
    await fetchCatalog(entity, state.catalogs[entity].pagination.page);
    renderCatalog(entity);
    if (entity === "accounts" || entity === "institutions") {
      await fetchImportOptions();
      renderImportOptions();
    }
    showToast("Registro arquivado com sucesso.", "success");
  } finally {
    setLoading(button, false);
  }
}

function editCatalogItem(event) {
  const button = event.target.closest(".catalog-action[data-action='edit']");
  if (!button) return;
  const { entity, id } = button.dataset;
  const item = state.catalogs[entity].items.find((entry) => entry.id === id);
  if (item) {
    openDrawer(entity, item);
  }
}

function syncSettingsForm() {
  const settings = state.profile?.settings;
  if (!settings) return;
  const hiddenSections = settings.dashboard_preferences?.hidden_sections ?? [];
  elements.defaultCurrencyCode.value = settings.default_currency_code || "BRL";
  elements.timeZone.value = settings.time_zone || "America/Sao_Paulo";
  elements.themePreference.value = settings.dashboard_preferences?.theme || DEFAULT_THEME;
  elements.compactCards.checked = Boolean(settings.dashboard_preferences?.compact_cards);
  elements.hideDuplicatesTab.checked = hiddenSections.includes("duplicates");
  elements.hideHistoryTab.checked = hiddenSections.includes("history");
  elements.hideInstallmentsTab.checked = hiddenSections.includes("installments");
  elements.hideSuppliersTab.checked = hiddenSections.includes("suppliers");
  applyTheme(elements.themePreference.value);
  applyMenuVisibility(hiddenSections);
}

function syncProfileForm() {
  const user = state.profile?.user;
  if (!user) return;
  elements.profileDisplayName.value = user.display_name || "";
  elements.profileEmail.value = user.email || "";
  elements.profileVersion.value = state.profile?.version || "1.0.0";
  syncSessionIdentity();
}

function setSelectedFile(file) {
  state.selectedFile = file;
  renderSelectedFile();
}

function clearSelectedFile() {
  state.selectedFile = null;
  elements.ofxFileInput.value = "";
  renderSelectedFile();
}

function handleFiles(files) {
  const file = files?.[0];
  if (!file) return;

  if (!file.name.toLowerCase().endsWith(".ofx")) {
    setMessage(elements.importMessage, "Selecione apenas arquivos OFX.", "error");
    return;
  }
  if (file.size <= 0) {
    setMessage(elements.importMessage, "O arquivo selecionado esta vazio.", "error");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    setMessage(elements.importMessage, "O arquivo excede o limite de 5 MB.", "error");
    return;
  }

  setMessage(elements.importMessage, "");
  setSelectedFile(file);
}

async function handleCreateAccount(event) {
  event.preventDefault();
  setLoading(elements.createAccountButton, true, "Salvando...");
  setMessage(elements.importMessage, "");

  try {
    const { response, payload } = await apiFetch("/imports/accounts", {
      method: "POST",
      body: {
        name: elements.createAccountName.value.trim(),
        financialInstitutionId: elements.institutionSelect.value,
        accountType: elements.createAccountType.value,
        openingBalance: Number(elements.createOpeningBalance.value || 0),
        externalIdentifier: elements.createExternalIdentifier.value.trim(),
        maskedAccountNumber: elements.createMaskedAccountNumber.value.trim(),
        maskedBranchNumber: elements.createMaskedBranchNumber.value.trim(),
        statementLabel: elements.createStatementLabel.value.trim(),
        statementClosingDay: elements.createStatementClosingDay.value ? Number(elements.createStatementClosingDay.value) : null,
        statementDueDay: elements.createStatementDueDay.value ? Number(elements.createStatementDueDay.value) : null,
        creditLimitAmount: elements.createCreditLimitAmount.value ? Number(elements.createCreditLimitAmount.value) : null,
      },
    });

    if (!response.ok) {
      setMessage(elements.importMessage, payload?.erro || "Nao foi possivel criar a conta.", "error");
      return;
    }

    elements.createAccountForm.reset();
    elements.createAccountForm.classList.add("hidden");
    syncQuickAccountFields();
    await fetchImportOptions();
    renderImportOptions();
    elements.accountSelect.value = payload.account.id;
    showToast("Conta criada com sucesso.", "success");
  } catch (error) {
    setMessage(elements.importMessage, error.message || "Falha ao criar a conta.", "error");
  } finally {
    setLoading(elements.createAccountButton, false);
  }
}

function buildCategoryPrompt(categories = state.catalogs.categories.items) {
  return categories
    .map((category, index) => `${index + 1}. ${category.name}`)
    .join("\n");
}

async function ensureCategoryCatalogLoaded() {
  const query = new URLSearchParams({ page: "1", pageSize: "100" });
  const { response, payload } = await apiFetch(`/portal/catalog/categories?${query.toString()}`);
  if (!response.ok) {
    throw new Error(payload?.erro || "Falha ao carregar categorias.");
  }
  state.catalogs.categories.items = payload.items ?? [];
  state.catalogs.categories.pagination = payload.pagination ?? { page: 1, total_pages: 1, total: state.catalogs.categories.items.length };
  return state.catalogs.categories.items;
}

async function chooseCategoryFor(label) {
  const categories = await ensureCategoryCatalogLoaded();
  if (!categories.length) {
    throw new Error("Nenhuma categoria disponivel para selecao.");
  }

  const selection = window.prompt(`Informe o numero da categoria para "${label}":\n\n${buildCategoryPrompt(categories)}`);
  if (!selection) return null;

  const index = Number.parseInt(selection, 10) - 1;
  const category = categories[index];
  if (!category?.id) {
    throw new Error("Categoria invalida.");
  }

  return category;
}

async function persistMovementCategory(movementId, categoryId, notes = null) {
  const { response, payload } = await apiFetch(`/portal/movements/${movementId}`, {
    method: "PATCH",
    body: {
      categoryId,
      notes,
    },
  });

  if (!response.ok) {
    throw new Error(payload?.erro || "Nao foi possivel atualizar a movimentacao.");
  }

  return payload.item ?? null;
}

async function fetchSupplierMovementsForCategorization(supplierName, supplierKey) {
  const query = buildGlobalQuery();
  query.set("creditCardOnly", "true");
  query.set("allPeriod", "true");
  query.set("supplierKey", supplierKey);
  query.set("search", supplierName);
  query.set("page", "1");
  query.set("pageSize", "1000");

  const { response, payload } = await apiFetch(`/portal/movements?${query.toString()}`);
  if (!response.ok) {
    throw new Error(payload?.erro || "Falha ao carregar as movimentacoes do fornecedor.");
  }
  return payload.items ?? [];
}

async function handleMovementTableAction(event) {
  const button = event.target.closest(".movement-action[data-action='categorize']");
  if (!button) return;

  const movement = state.movements.find((item) => item.id === button.dataset.id);
  if (!movement) return;

  try {
    const category = await chooseCategoryFor(movement.descricao || movement.descricao_normalizada || "Movimentacao");
    if (!category) return;

    setLoading(button, true, "Salvando...");
    await persistMovementCategory(movement.id, category.id, movement.notes || null);
    await Promise.all([fetchMovements(), fetchOverview(), fetchDuplicates(), fetchSuppliers()]);
    renderMovements();
    renderDashboard();
    renderDuplicates();
    renderSuppliers();
    showToast(`Categoria alterada para ${category.name}.`, "success");
  } catch (error) {
    showToast(error.message || "Nao foi possivel atualizar a categoria.", "error");
  } finally {
    setLoading(button, false);
  }
}

async function handleSupplierTableAction(event) {
  const button = event.target.closest(".supplier-action[data-supplier]");
  if (!button) return;
  const supplierName = button.dataset.supplier;
  const supplierKey = button.dataset.supplierKey || supplierName;
  const action = button.dataset.action || "view";

  if (action === "view") {
    state.globalFilters.search = supplierName;
    elements.movementsSearch.value = supplierName;
    state.movementsPage = 1;
    setActiveSection("movements");
    await fetchMovements();
    renderMovements();
    showToast("Movimentacoes filtradas pelo fornecedor selecionado.", "info");
    return;
  }

  if (action !== "categorize") return;

  try {
    const category = await chooseCategoryFor(`gastos do fornecedor ${supplierName}`);
    if (!category) return;

    setLoading(button, true, "Salvando...");
    const movements = await fetchSupplierMovementsForCategorization(supplierName, supplierKey);
    if (!movements.length) {
      showToast("Nenhuma movimentacao encontrada para este fornecedor no periodo atual.", "warning");
      return;
    }

    await Promise.all(movements.map((movement) => persistMovementCategory(movement.id, category.id, movement.notes || null)));
    await Promise.all([fetchMovements(), fetchOverview(), fetchDuplicates(), fetchSuppliers()]);
    renderMovements();
    renderDashboard();
    renderDuplicates();
    renderSuppliers();
    showToast(`Fornecedor categorizado em lote como ${category.name}.`, "success");
  } catch (error) {
    showToast(error.message || "Nao foi possivel categorizar os gastos do fornecedor.", "error");
  } finally {
    setLoading(button, false);
  }
}
async function handleDuplicateTableAction(event) {
  const button = event.target.closest(".duplicate-action");
  if (!button) return;

  setLoading(button, true, "Salvando...");
  try {
    const { response, payload } = await apiFetch(`/portal/duplicates/${button.dataset.id}`, {
      method: "PATCH",
      body: {
        decision: button.dataset.action,
      },
    });

    if (!response.ok) {
      showToast(payload?.erro || "Nao foi possivel registrar a decisao.", "error");
      return;
    }

    await Promise.all([fetchDuplicates(), fetchMovements(), fetchOverview()]);
    renderDuplicates();
    renderMovements();
    renderDashboard();
    showToast("Decisao de duplicidade registrada.", "success");
  } finally {
    setLoading(button, false);
  }
}

async function handleInstallmentTableAction(event) {
  const button = event.target.closest(".installment-action");
  if (!button) return;

  const { action, planId, itemId } = button.dataset;
  setLoading(button, true, "Salvando...");

  try {
    if (action === "cancel-plan") {
      const { response, payload } = await apiFetch(`/portal/installments/${planId}`, {
        method: "PATCH",
        body: { statusCode: "cancelled" },
      });
      if (!response.ok) {
        showToast(payload?.erro || "Nao foi possivel cancelar o parcelamento.", "error");
        return;
      }
      await Promise.all([fetchInstallments(), fetchOverview()]);
      renderInstallments();
      renderDashboard();
      showToast("Parcelamento cancelado com seguranca.", "success");
      return;
    }

    if (action === "delete-plan") {
      const { response, payload } = await apiFetch(`/portal/installments/${planId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        showToast(payload?.erro || "Nao foi possivel excluir o parcelamento.", "error");
        return;
      }
      await Promise.all([fetchInstallments(), fetchOverview()]);
      renderInstallments();
      renderDashboard();
      showToast("Parcelamento removido da lista ativa.", "success");
      return;
    }
    if (!itemId) {
      showToast("Selecione uma linha de parcela para esta acao.", "warning");
      return;
    }

    if (action === "mark-paid") {
      const { response, payload } = await apiFetch(`/portal/installments/${planId}/items/${itemId}/link`, {
        method: "POST",
        body: { statusCode: "paid" },
      });
      if (!response.ok) {
        showToast(payload?.erro || "Nao foi possivel marcar a parcela como paga.", "error");
        return;
      }
      await Promise.all([fetchInstallments(), fetchOverview()]);
      renderInstallments();
      renderDashboard();
      showToast("Parcela marcada como paga.", "success");
      return;
    }

    if (action === "link") {
      const candidates = state.movements
        .map((item, index) => `${index + 1}. ${formatDate(item.data)} • ${item.descricao || item.descricao_normalizada || "-"} • ${formatCurrency(item.valor)}`)
        .join("\n");
      const selection = window.prompt(`Informe o numero da movimentacao para vincular a parcela:\n\n${candidates}`);
      if (!selection) return;
      const index = Number.parseInt(selection, 10) - 1;
      const movement = state.movements[index];
      if (!movement?.id) {
        showToast("Movimentacao invalida.", "error");
        return;
      }
      const { response, payload } = await apiFetch(`/portal/installments/${planId}/items/${itemId}/link`, {
        method: "POST",
        body: { transactionId: movement.id },
      });
      if (!response.ok) {
        showToast(payload?.erro || "Nao foi possivel vincular a parcela.", "error");
        return;
      }
      await Promise.all([fetchInstallments(), fetchOverview(), fetchMovements()]);
      renderInstallments();
      renderDashboard();
      renderMovements();
      showToast("Parcela vinculada a movimentacao.", "success");
    }
  } finally {
    setLoading(button, false);
  }
}

async function handlePreviewImport() {
  setLoading(elements.previewButton, true, "Processando...");
  setMessage(elements.importMessage, "");

  try {
    if (!state.selectedFile) {
      setMessage(elements.importMessage, "Selecione um arquivo OFX antes de continuar.", "error");
      return;
    }
    if (!elements.accountSelect.value) {
      setMessage(elements.importMessage, "Selecione a conta financeira de destino.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", state.selectedFile);
    formData.append("financialAccountId", elements.accountSelect.value);
    if (elements.institutionSelect.value) {
      formData.append("financialInstitutionId", elements.institutionSelect.value);
    }

    const { response, payload } = await apiFetch("/imports/ofx/preview", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      setMessage(elements.importMessage, payload?.erro || "Falha ao gerar preview.", "error");
      return;
    }

    state.preview = payload.preview;
    renderPreview();
    await fetchHistory();
    renderHistory();
    showToast("Preview gerado com sucesso.", "success");
  } catch (error) {
    setMessage(elements.importMessage, error.message || "Falha ao gerar preview.", "error");
  } finally {
    setLoading(elements.previewButton, false);
  }
}

async function handleConfirmImport() {
  if (!state.preview?.import_id) {
    setMessage(elements.importMessage, "Nenhum preview pendente para confirmar.", "error");
    return;
  }

  await confirmImportById(state.preview.import_id, elements.confirmImportButton);
}

async function confirmImportById(importId, triggerButton = null) {
  const actionButton = triggerButton || elements.confirmImportButton;

  setLoading(actionButton, true, "Confirmando...");
  setMessage(elements.importMessage, "");

  try {
    const { response, payload } = await apiFetch("/imports/ofx/confirm", {
      method: "POST",
      body: { importId },
    });
    if (!response.ok) {
      setMessage(elements.importMessage, payload?.erro || "Falha ao confirmar a importacao.", "error");
      return;
    }

    state.preview = null;
    clearSelectedFile();
    renderPreview();
    await refreshAllData();
    showToast("Importacao confirmada com sucesso.", "success");
  } catch (error) {
    setMessage(elements.importMessage, error.message || "Falha ao confirmar a importacao.", "error");
  } finally {
    setLoading(actionButton, false);
  }
}

async function handleHistoryAction(event) {
  const button = event.target.closest(".history-action");
  if (!button) return;
  const { action, importId } = button.dataset;
  setLoading(button, true, action === "cancel" ? "Cancelando..." : "Abrindo...");

  try {
    if (action === "view") {
      await loadHistoryDetails(importId);
      showToast("Detalhes carregados.", "info");
      return;
    }

    if (action === "cancel") {
      const { response, payload } = await apiFetch(`/imports/${importId}/cancel`, {
        method: "POST",
      });
      if (!response.ok) {
        showToast(payload?.erro || "Nao foi possivel cancelar a importacao.", "error");
        return;
      }
      await refreshAllData();
      showToast("Importacao cancelada com sucesso.", "success");
    }
  } catch (error) {
    showToast(error.message || "Falha ao processar a acao da importacao.", "error");
  } finally {
    setLoading(button, false);
  }
}

async function handleHistoryDetailsAction(event) {
  const button = event.target.closest(".history-detail-action");
  if (!button) return;
  const { action, importId } = button.dataset;
  if (action !== "confirm" || !importId) return;

  try {
    await confirmImportById(importId, button);
  } catch (error) {
    showToast(error.message || "Falha ao confirmar a importacao.", "error");
  }
}

async function handleSaveInstallment(event) {
  event.preventDefault();
  setLoading(elements.saveInstallmentButton, true, "Salvando...");
  setMessage(elements.installmentMessage, "");

  try {
    const { response, payload } = await apiFetch("/portal/installments", {
      method: "POST",
      body: {
        supplierName: elements.installmentSupplier.value.trim(),
        description: elements.installmentDescription.value.trim(),
        totalAmount: Number(elements.installmentTotalAmount.value || 0),
        installmentCount: Number(elements.installmentCount.value || 0),
        installmentAmount: Number(elements.installmentAmount.value || 0),
        firstDueDate: elements.installmentFirstDueDate.value,
        categoryId: elements.installmentCategory.value || null,
        financialAccountId: elements.installmentFinancialAccount.value || null,
        statusCode: elements.installmentStatus.value,
        notes: elements.installmentNotes.value.trim(),
      },
    });

    if (!response.ok) {
      setMessage(elements.installmentMessage, payload?.erro || "Nao foi possivel salvar o parcelamento.", "error");
      return;
    }

    elements.installmentForm.reset();
    elements.installmentStatus.value = "active";
    await Promise.all([fetchInstallments(), fetchOverview()]);
    renderInstallments();
    renderInstallmentSummary();
    setMessage(elements.installmentMessage, "Parcelamento salvo com sucesso.", "success");
    showToast("Parcelamento cadastrado com sucesso.", "success");
  } catch (error) {
    setMessage(elements.installmentMessage, error.message || "Falha ao salvar o parcelamento.", "error");
  } finally {
    setLoading(elements.saveInstallmentButton, false);
  }
}

async function loadSection(sectionName) {
  if (sectionName === "dashboard") {
    await fetchOverview();
    renderDashboard();
    syncSettingsForm();
    syncProfileForm();
    return;
  }

  if (sectionName === "imports") {
    await fetchImportOptions();
    renderImportOptions();
    syncQuickAccountFields();
    return;
  }

  if (sectionName === "movements") {
    await fetchMovements();
    renderMovements();
    return;
  }

  if (sectionName === "duplicates") {
    await fetchDuplicates();
    renderDuplicates();
    return;
  }

  if (sectionName === "history") {
    await fetchHistory();
    renderHistory();
    return;
  }

  if (sectionName === "settings") {
    await Promise.all([fetchProfile(), fetchCatalog("institutions", 1), fetchImportOptions()]);
    syncSettingsForm();
    syncProfileForm();
    renderCatalog("institutions");
    return;
  }

  if (sectionName === "profile") {
    await fetchProfile();
    syncProfileForm();
    syncSettingsForm();
    return;
  }

  if (sectionName === "installments") {
    await Promise.all([fetchInstallments(), fetchImportOptions(), fetchCatalog("categories", 1)]);
    renderImportOptions();
    renderInstallments();
    return;
  }

  if (sectionName === "suppliers") {
    await fetchSuppliers();
    renderSuppliers();
    return;
  }

  if (sectionName === "accounts") {
    await Promise.all([fetchImportOptions(), fetchCatalog("accounts", state.catalogs.accounts.pagination.page || 1)]);
    renderImportOptions();
    renderCatalog("accounts");
    return;
  }

  await fetchCatalog(sectionName, state.catalogs[sectionName].pagination.page || 1);
  renderCatalog(sectionName);
}

function setActiveSection(sectionName) {
  const hiddenSections = state.profile?.settings?.dashboard_preferences?.hidden_sections ?? [];
  const fallbackSection = elements.navButtons.find((button) => !hiddenSections.includes(button.dataset.section))?.dataset.section || "dashboard";
  if (hiddenSections.includes(sectionName)) {
    sectionName = fallbackSection;
  }
  state.activeSection = sectionName;
  Object.entries(elements.sections).forEach(([key, section]) => {
    section.classList.toggle("hidden", key !== sectionName);
  });
  elements.navButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.section === sectionName));
  elements.pageTitle.textContent = SECTION_TITLES[sectionName];
  document.title = `${APP_NAME} - ${SECTION_TITLES[sectionName]}`;
  elements.globalFiltersPanel?.classList.toggle("hidden", !["movements", "duplicates", "history", "suppliers"].includes(sectionName));
  elements.sidebar.classList.remove("is-open");
  elements.menuToggle.setAttribute("aria-expanded", "false");
}

function applyMenuVisibility(hiddenSections = []) {
  const hiddenSet = new Set(hiddenSections);
  elements.navButtons.forEach((button) => {
    button.classList.toggle("hidden", hiddenSet.has(button.dataset.section));
  });
}

async function refreshActiveSection() {
  try {
    await loadSection(state.activeSection);
  } catch (error) {
    setMessage(elements.globalMessage, error.message || "Falha ao carregar a secao.", "error");
  }
}

async function refreshAllData() {
  try {
    await Promise.all([fetchOverview(), fetchImportOptions(), fetchHistory(), fetchMovements(), fetchDuplicates(), fetchInstallments(), fetchSuppliers(), fetchCatalog("categories", 1)]);
    renderDashboard();
    renderImportOptions();
    renderHistory();
    renderMovements();
    renderDuplicates();
    renderInstallments();
    renderSuppliers();
    renderCatalog("categories");
    syncSettingsForm();
    syncProfileForm();
  } catch (error) {
    setMessage(elements.globalMessage, error.message || "Falha ao atualizar os dados do portal.", "error");
  }
}

async function verifyStoredSession() {
  if (!state.session) {
    showLogin();
    return;
  }

  try {
    await ensureSession();
    const { response } = await apiFetch("/auth/me");
    if (!response.ok) throw new Error("invalid_session");
    showAppShell();
    setActiveSection("dashboard");
    await refreshAllData();
  } catch {
    await clearSession();
    showLogin({
      message: "Sua sessao expirou. Entre novamente para continuar.",
      messageType: "warning",
    });
  }
}

async function handleLogin(event) {
  event.preventDefault();
  setLoading(elements.loginButton, true, "Entrando...");
  setMessage(elements.loginMessage, "");

  const email = elements.usuarioInput.value.trim().toLowerCase();
  const password = elements.senhaInput.value;

  if (!email || !password) {
    setMessage(elements.loginMessage, "Preencha email e senha.", "error");
    setLoading(elements.loginButton, false);
    return;
  }

  try {
    const result = await signInThroughBackend(email, password);
    if (!result.ok) {
      setMessage(elements.loginMessage, result.payload?.erro || "Credenciais invalidas.", "error");
      return;
    }

    elements.loginForm.reset();
    showAppShell();
    setActiveSection("dashboard");
    await refreshAllData();
    showToast("Sessao iniciada com sucesso.", "success");
  } catch {
    setMessage(elements.loginMessage, "Erro ao conectar com a API.", "error");
  } finally {
    setLoading(elements.loginButton, false);
  }
}

async function handleForgotPassword(event) {
  event.preventDefault();
  setLoading(elements.forgotPasswordButton, true, "Enviando...");
  setMessage(elements.forgotPasswordMessage, "");

  const email = elements.recoveryEmailInput.value.trim().toLowerCase();
  if (!email) {
    setMessage(elements.forgotPasswordMessage, "Informe um e-mail valido.", "error");
    setLoading(elements.forgotPasswordButton, false);
    return;
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: RECOVERY_REDIRECT_URL,
    });
    if (error && error.name === "AuthRetryableFetchError") throw error;
    setMessage(elements.forgotPasswordMessage, "Se o e-mail estiver cadastrado, voce recebera um link para redefinir a senha.", "success");
  } catch {
    setMessage(elements.forgotPasswordMessage, "Nao foi possivel solicitar a recuperacao agora.", "error");
  } finally {
    setLoading(elements.forgotPasswordButton, false);
  }
}

function validateNewPassword(password, confirmation) {
  if (!password || !confirmation) return "Preencha os dois campos de senha.";
  if (password.length < PASSWORD_MIN_LENGTH) return `A senha precisa ter no minimo ${PASSWORD_MIN_LENGTH} caracteres.`;
  if (password !== confirmation) return "As senhas informadas sao diferentes.";
  return null;
}

async function prepareRecoveryMode(type, session) {
  if (!session) return;
  const context = {
    email: session.user?.email ?? "",
    type,
  };
  storeRecoveryContext(context);
  showResetPassword(context);
  clearAuthRedirectFromUrl();
}

async function handleResetPassword(event) {
  event.preventDefault();
  setMessage(elements.resetPasswordMessage, "");
  setLoading(elements.resetPasswordButton, true, "Salvando...");

  const newPassword = elements.newPasswordInput.value;
  const confirmation = elements.confirmPasswordInput.value;
  const validationError = validateNewPassword(newPassword, confirmation);

  if (validationError) {
    setMessage(elements.resetPasswordMessage, validationError, "error");
    setLoading(elements.resetPasswordButton, false);
    return;
  }

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      setMessage(elements.resetPasswordMessage, "O link de redefinicao e invalido ou expirou.", "error");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setMessage(elements.resetPasswordMessage, "Nao foi possivel redefinir a senha com este link.", "error");
      return;
    }

    const ownerEmail = sessionData.session.user?.email ?? state.recoveryContext?.email ?? "";
    clearRecoveryContext();
    await supabase.auth.signOut();

    if (ownerEmail) {
      const signInResult = await signInThroughBackend(ownerEmail, newPassword);
      if (signInResult.ok) {
        showAppShell();
        setActiveSection("dashboard");
        await refreshAllData();
        setMessage(elements.globalMessage, "Senha atualizada com sucesso.", "success");
        return;
      }
    }

    showLogin({
      prefillEmail: ownerEmail,
      message: "Senha atualizada com sucesso. Entre com a nova senha.",
      messageType: "success",
    });
  } catch {
    setMessage(elements.resetPasswordMessage, "Erro ao redefinir a senha.", "error");
  } finally {
    setLoading(elements.resetPasswordButton, false);
  }
}

async function handleLogout() {
  try {
    if (state.session?.access_token) {
      await apiFetch("/auth/logout", { method: "POST", retryOnUnauthorized: false });
    }
  } catch {
    // fallback local
  } finally {
    await clearSession();
    state.preview = null;
    state.selectedFile = null;
    state.history = [];
    state.selectedImportDetails = null;
    clearSelectedFile();
    renderPreview();
    renderHistoryDetails();
    setMessage(elements.globalMessage, "");
    showLogin();
    showToast("Sessao encerrada.", "info");
  }
}

async function handleSaveSettings(event) {
  event.preventDefault();
  setLoading(elements.saveSettingsButton, true, "Salvando...");
  setMessage(elements.settingsMessage, "");

  try {
    const hiddenSections = [
      elements.hideDuplicatesTab.checked ? "duplicates" : null,
      elements.hideHistoryTab.checked ? "history" : null,
      elements.hideInstallmentsTab.checked ? "installments" : null,
      elements.hideSuppliersTab.checked ? "suppliers" : null,
    ].filter(Boolean);

    const { response, payload } = await apiFetch("/portal/settings", {
      method: "PUT",
      body: {
        defaultCurrencyCode: elements.defaultCurrencyCode.value.trim().toUpperCase(),
        timeZone: elements.timeZone.value.trim(),
        dashboardPreferences: {
          ...(state.profile?.settings?.dashboard_preferences ?? {}),
          theme: elements.themePreference.value,
          compact_cards: elements.compactCards.checked,
          hidden_sections: hiddenSections,
        },
        importPreferences: state.profile?.settings?.import_preferences ?? {},
      },
    });

    if (!response.ok) {
      setMessage(elements.settingsMessage, payload?.erro || "Falha ao salvar configuracoes.", "error");
      return;
    }

    state.profile.settings = payload.settings;
    applyTheme(payload.settings.dashboard_preferences?.theme || DEFAULT_THEME);
    applyMenuVisibility(payload.settings.dashboard_preferences?.hidden_sections ?? []);
    if ((payload.settings.dashboard_preferences?.hidden_sections ?? []).includes(state.activeSection)) {
      setActiveSection("dashboard");
    }
    setMessage(elements.settingsMessage, "Configuracoes salvas com sucesso.", "success");
    showToast("Configuracoes atualizadas.", "success");
  } catch (error) {
    setMessage(elements.settingsMessage, error.message || "Falha ao salvar configuracoes.", "error");
  } finally {
    setLoading(elements.saveSettingsButton, false);
  }
}

async function handleSaveProfile(event) {
  event.preventDefault();
  setLoading(elements.saveProfileButton, true, "Salvando...");
  setMessage(elements.profileMessage, "");

  try {
    const { response, payload } = await apiFetch("/portal/profile", {
      method: "PUT",
      body: {
        displayName: elements.profileDisplayName.value.trim(),
      },
    });
    if (!response.ok) {
      setMessage(elements.profileMessage, payload?.erro || "Falha ao salvar o perfil.", "error");
      return;
    }

    state.profile.user = payload.user;
    if (state.overview?.user) {
      state.overview.user.display_name = payload.user.display_name;
    }
    syncProfileForm();
    renderStats();
    setMessage(elements.profileMessage, "Perfil atualizado com sucesso.", "success");
    showToast("Perfil atualizado.", "success");
  } catch (error) {
    setMessage(elements.profileMessage, error.message || "Falha ao salvar o perfil.", "error");
  } finally {
    setLoading(elements.saveProfileButton, false);
  }
}

async function handleSavePassword(event) {
  event.preventDefault();
  setLoading(elements.savePasswordButton, true, "Atualizando...");
  setMessage(elements.passwordMessage, "");

  const validationError = validateNewPassword(elements.profilePassword.value, elements.profilePasswordConfirm.value);
  if (validationError) {
    setMessage(elements.passwordMessage, validationError, "error");
    setLoading(elements.savePasswordButton, false);
    return;
  }

  try {
    await ensureSession();
    await supabase.auth.setSession({
      access_token: state.session.access_token,
      refresh_token: state.session.refresh_token,
    });
    const { error } = await supabase.auth.updateUser({
      password: elements.profilePassword.value,
    });

    if (error) {
      setMessage(elements.passwordMessage, "Nao foi possivel atualizar a senha agora.", "error");
      return;
    }

    elements.passwordForm.reset();
    setMessage(elements.passwordMessage, "Senha atualizada com sucesso.", "success");
    showToast("Senha atualizada com sucesso.", "success");
  } catch (error) {
    setMessage(elements.passwordMessage, error.message || "Falha ao atualizar a senha.", "error");
  } finally {
    setLoading(elements.savePasswordButton, false);
  }
}

function registerEventHandlers() {
  elements.loginForm.addEventListener("submit", handleLogin);
  elements.showForgotPasswordButton.addEventListener("click", showForgotPassword);
  elements.forgotPasswordForm.addEventListener("submit", handleForgotPassword);
  elements.backToLoginFromForgotButton.addEventListener("click", () => showLogin());
  elements.resetPasswordForm.addEventListener("submit", handleResetPassword);
  elements.backToLoginFromResetButton.addEventListener("click", async () => {
    clearRecoveryContext();
    await supabase.auth.signOut();
    showLogin();
  });

  elements.menuToggle.addEventListener("click", () => {
    const isOpen = elements.sidebar.classList.toggle("is-open");
    elements.menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  elements.navButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      setMessage(elements.globalMessage, "");
      setActiveSection(button.dataset.section);
      await refreshActiveSection();
    });
  });

  elements.sidebarLogout.addEventListener("click", handleLogout);
  elements.refreshAllButton.addEventListener("click", async () => {
    setLoading(elements.refreshAllButton, true, "Atualizando...");
    await refreshAllData();
    setLoading(elements.refreshAllButton, false);
    showToast("Dados atualizados.", "info");
  });

  elements.refreshImportOptions.addEventListener("click", async () => {
    setLoading(elements.refreshImportOptions, true, "Atualizando...");
    try {
      await fetchImportOptions();
      renderImportOptions();
      showToast("Opcoes de importacao atualizadas.", "info");
    } finally {
      setLoading(elements.refreshImportOptions, false);
    }
  });

  elements.toggleAccountForm.addEventListener("click", () => {
    elements.createAccountForm.classList.toggle("hidden");
  });
  elements.createAccountType.addEventListener("change", syncQuickAccountFields);
  elements.createAccountForm.addEventListener("submit", handleCreateAccount);
  elements.ofxFileInput.addEventListener("change", (event) => handleFiles(event.target.files));
  elements.dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    elements.dropzone.classList.add("is-dragging");
  });
  elements.dropzone.addEventListener("dragleave", () => elements.dropzone.classList.remove("is-dragging"));
  elements.dropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    elements.dropzone.classList.remove("is-dragging");
    handleFiles(event.dataTransfer.files);
  });
  elements.dropzone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      elements.ofxFileInput.click();
    }
  });
  elements.previewButton.addEventListener("click", handlePreviewImport);
  elements.clearFileButton.addEventListener("click", clearSelectedFile);
  elements.confirmImportButton.addEventListener("click", handleConfirmImport);

  elements.historySearch.addEventListener("input", () => {
    state.historyPage = 1;
    renderHistory();
  });
  elements.historyStatusFilter.addEventListener("change", () => {
    state.historyPage = 1;
    renderHistory();
  });
  elements.refreshHistoryButton.addEventListener("click", async () => {
    setLoading(elements.refreshHistoryButton, true, "Atualizando...");
    try {
      await fetchHistory();
      renderHistory();
      showToast("Historico atualizado.", "info");
    } finally {
      setLoading(elements.refreshHistoryButton, false);
    }
  });
  elements.historyPrevPage.addEventListener("click", () => {
    state.historyPage = Math.max(1, state.historyPage - 1);
    renderHistory();
  });
  elements.historyNextPage.addEventListener("click", () => {
    state.historyPage += 1;
    renderHistory();
  });
  elements.historyTable.addEventListener("click", handleHistoryAction);
  elements.historyDetails.addEventListener("click", handleHistoryDetailsAction);

  elements.movementsTable.addEventListener("click", handleMovementTableAction);
  elements.duplicatesTable.addEventListener("click", handleDuplicateTableAction);
  elements.installmentsTable.addEventListener("click", handleInstallmentTableAction);
  elements.counterpartiesTable.addEventListener("click", handleSupplierTableAction);
  elements.applyDashboardCompetence?.addEventListener("click", async () => {
    const competence = elements.dashboardCompetence.value;
    if (!competence) {
      showToast("Selecione uma competencia.", "warning");
      return;
    }
    state.globalFilters.competence = competence;
    state.movementsPage = 1;
    await fetchOverview();
    renderDashboard();
    showToast(`Competencia ${competence} aplicada.`, "info");
  });
  elements.applyGlobalFilters.addEventListener("click", async () => {
    state.globalFilters.competence = elements.filterCompetence.value;
    state.globalFilters.bank = elements.filterBank.value;
    state.globalFilters.financialAccountId = elements.filterAccount.value;
    state.globalFilters.movementType = elements.filterType.value;
    state.globalFilters.category = elements.filterCategory.value;
    state.globalFilters.search = elements.movementsSearch.value.trim();
    state.movementsPage = 1;
    await refreshAllData();
    showToast("Filtros aplicados.", "info");
  });
  elements.clearGlobalFilters.addEventListener("click", async () => {
    state.globalFilters = {
      competence: new Date().toISOString().slice(0, 7),
      bank: "",
      financialAccountId: "",
      movementType: "",
      category: "",
    supplierKey: "",
      search: "",
    };
    elements.filterCompetence.value = state.globalFilters.competence;
    elements.filterBank.value = "";
    elements.filterAccount.value = "";
    elements.filterType.value = "";
    elements.filterCategory.value = "";
    elements.movementsSearch.value = "";
    state.movementsPage = 1;
    await refreshAllData();
    showToast("Filtros limpos.", "info");
  });
  elements.movementsSearch.addEventListener("input", () => {
    state.globalFilters.search = elements.movementsSearch.value.trim();
  });
  elements.refreshMovementsButton.addEventListener("click", async () => {
    setLoading(elements.refreshMovementsButton, true, "Atualizando...");
    try {
      state.movementsPage = 1;
      state.globalFilters.search = elements.movementsSearch.value.trim();
      await fetchMovements();
      renderMovements();
      showToast("Movimentacoes atualizadas.", "info");
    } finally {
      setLoading(elements.refreshMovementsButton, false);
    }
  });
  elements.movementsPrevPage.addEventListener("click", async () => {
    state.movementsPage = Math.max(1, (state.movementsPagination.page || 1) - 1);
    await fetchMovements();
    renderMovements();
  });
  elements.movementsNextPage.addEventListener("click", async () => {
    state.movementsPage = Math.min(state.movementsPagination.total_pages || 1, (state.movementsPagination.page || 1) + 1);
    await fetchMovements();
    renderMovements();
  });
  elements.refreshDuplicatesButton.addEventListener("click", async () => {
    setLoading(elements.refreshDuplicatesButton, true, "Atualizando...");
    try {
      await fetchDuplicates();
      renderDuplicates();
      showToast("Duplicidades atualizadas.", "info");
    } finally {
      setLoading(elements.refreshDuplicatesButton, false);
    }
  });
  elements.installmentForm.addEventListener("submit", handleSaveInstallment);

  Object.entries(ENTITY_CONFIG).forEach(([entityName, config]) => {
    if (config.searchId) {
      const input = document.getElementById(config.searchId);
      input?.addEventListener("input", async () => {
        if (entityName === "counterparties" && state.activeSection === "suppliers") {
          await fetchSuppliers();
          renderSuppliers();
          return;
        }
        state.catalogs[entityName].search = input.value.trim();
        state.catalogs[entityName].pagination.page = 1;
        await fetchCatalog(entityName, 1);
        renderCatalog(entityName);
      });
    }
  });

  document.querySelectorAll("[data-open-entity]").forEach((button) => {
    button.addEventListener("click", () => openDrawer(button.dataset.openEntity));
  });
  document.querySelectorAll("[data-page-prev]").forEach((button) => {
    button.addEventListener("click", async () => {
      const entity = button.dataset.pagePrev;
      const nextPage = Math.max(1, state.catalogs[entity].pagination.page - 1);
      await fetchCatalog(entity, nextPage);
      renderCatalog(entity);
    });
  });
  document.querySelectorAll("[data-page-next]").forEach((button) => {
    button.addEventListener("click", async () => {
      const entity = button.dataset.pageNext;
      const nextPage = Math.min(state.catalogs[entity].pagination.total_pages, state.catalogs[entity].pagination.page + 1);
      await fetchCatalog(entity, nextPage);
      renderCatalog(entity);
    });
  });

  elements.closeDrawer.addEventListener("click", closeDrawer);
  elements.drawer.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-drawer]")) {
      closeDrawer();
    }
  });
  elements.entityForm.addEventListener("submit", saveDrawerEntity);

  Object.values(ENTITY_CONFIG).forEach((config) => {
    const table = document.getElementById(config.tableId);
    table?.addEventListener("click", editCatalogItem);
    table?.addEventListener("click", archiveCatalogItem);
  });

  elements.settingsForm.addEventListener("submit", handleSaveSettings);
  elements.profileForm.addEventListener("submit", handleSaveProfile);
  elements.passwordForm.addEventListener("submit", handleSavePassword);
  elements.themePreference.addEventListener("change", () => applyTheme(elements.themePreference.value));
}

async function bootstrap() {
  registerEventHandlers();
  syncQuickAccountFields();

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      await prepareRecoveryMode("recovery", session);
      return;
    }
    if (event === "SIGNED_IN" && initialAuthLinkType === "invite") {
      await prepareRecoveryMode("invite", session);
    }
  });

  if (initialAuthErrorCode || initialAuthErrorDescription) {
    showLogin({
      message: "O link de redefinicao e invalido ou expirou. Solicite um novo e-mail.",
      messageType: "error",
    });
    clearAuthRedirectFromUrl();
    return;
  }

  if (state.recoveryContext) {
    const { data } = await supabase.auth.getSession();
    if (!data?.session) {
      clearRecoveryContext();
      showLogin({
        message: "O link de redefinicao e invalido ou expirou. Solicite um novo e-mail.",
        messageType: "error",
      });
      return;
    }
    showResetPassword(state.recoveryContext);
    return;
  }

  await verifyStoredSession();
}

bootstrap();











