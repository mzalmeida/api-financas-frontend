import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STORAGE_KEY = "api-financas.session";
const RECOVERY_CONTEXT_KEY = "api-financas.recovery-context";
const SUPABASE_RECOVERY_STORAGE_KEY = "api-financas.supabase.recovery";
const PUBLIC_BACKEND_URL = "https://api-financas-backend1.onrender.com";
const PUBLIC_FRONTEND_URL = "https://api-financas-frontend.onrender.com";
const LOCAL_BACKEND_URL = "http://127.0.0.1:3000";
const SUPABASE_URL = "https://gbnzacdsxsivwwsquxky.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdibnphY2RzeHNpdnd3c3F1eGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1OTEwOTgsImV4cCI6MjEwMTE2NzA5OH0.hGoMQxS8eKIjyEytuaGAxI0TjkFT5OZp5coiUEbr_U8";
const PASSWORD_MIN_LENGTH = 8;

function resolveApiUrl() {
  const { hostname } = window.location;
  return hostname === "localhost" || hostname === "127.0.0.1" ? LOCAL_BACKEND_URL : PUBLIC_BACKEND_URL;
}

function resolveRecoveryRedirectUrl() {
  const { hostname, protocol, host } = window.location;
  return hostname === "localhost" || hostname === "127.0.0.1" ? `${protocol}//${host}` : PUBLIC_FRONTEND_URL;
}

const API_URL = resolveApiUrl();
const RECOVERY_REDIRECT_URL = resolveRecoveryRedirectUrl();
const initialAuthParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
const initialPageParams = new URLSearchParams(window.location.search);
const initialAuthLinkType = initialAuthParams.get("type");
const initialAuthErrorCode = initialAuthParams.get("error_code");
const initialAuthErrorDescription = initialAuthParams.get("error_description");
const initialGmailOauthStatus = initialPageParams.get("gmail_oauth");

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
  dashboardMessage: document.getElementById("dashboardMsg"),
  sessionInfo: document.getElementById("sessionInfo"),
  logoutButton: document.getElementById("btnSair"),
  menuToggle: document.getElementById("menuToggle"),
  mainNav: document.getElementById("mainNav"),
  navLinks: Array.from(document.querySelectorAll(".nav-link")),
  statsGrid: document.getElementById("statsGrid"),
  latestTransactions: document.getElementById("latestTransactions"),
  bankSummary: document.getElementById("bankSummary"),
  transactionsTable: document.getElementById("transactionsTable"),
  recurringTable: document.getElementById("recurringTable"),
  suppliersTable: document.getElementById("suppliersTable"),
  duplicatesTable: document.getElementById("duplicatesTable"),
  institutionSelect: document.getElementById("institutionSelect"),
  accountSelect: document.getElementById("accountSelect"),
  refreshOptionsButton: document.getElementById("refreshOptions"),
  toggleCreateAccountButton: document.getElementById("toggleCreateAccount"),
  createAccountForm: document.getElementById("createAccountForm"),
  createAccountName: document.getElementById("createAccountName"),
  createAccountType: document.getElementById("createAccountType"),
  createExternalIdentifier: document.getElementById("createExternalIdentifier"),
  createMaskedAccountNumber: document.getElementById("createMaskedAccountNumber"),
  createMaskedBranchNumber: document.getElementById("createMaskedBranchNumber"),
  createAccountButton: document.getElementById("createAccountButton"),
  importMessage: document.getElementById("importMsg"),
  dropzone: document.getElementById("dropzone"),
  ofxFileInput: document.getElementById("ofxFile"),
  selectedFileCard: document.getElementById("selectedFileCard"),
  previewButton: document.getElementById("previewButton"),
  clearFileButton: document.getElementById("clearFileButton"),
  previewPanel: document.getElementById("previewPanel"),
  confirmImportButton: document.getElementById("confirmImportButton"),
  importsHistory: document.getElementById("importsHistory"),
  refreshHistoryButton: document.getElementById("refreshHistoryButton"),
  gmailMessage: document.getElementById("gmailMsg"),
  gmailStatusCard: document.getElementById("gmailStatusCard"),
  gmailConnectButton: document.getElementById("gmailConnectButton"),
  gmailDisconnectButton: document.getElementById("gmailDisconnectButton"),
  gmailRefreshButton: document.getElementById("gmailRefreshButton"),
  gmailSyncButton: document.getElementById("gmailSyncButton"),
  gmailNubankAccount: document.getElementById("gmailNubankAccount"),
  gmailInterAccount: document.getElementById("gmailInterAccount"),
  gmailMessagesTable: document.getElementById("gmailMessagesTable"),
  sections: {
    overview: document.getElementById("section-overview"),
    transactions: document.getElementById("section-transactions"),
    imports: document.getElementById("section-imports"),
    gmail: document.getElementById("section-gmail"),
    recurring: document.getElementById("section-recurring"),
    suppliers: document.getElementById("section-suppliers"),
    duplicates: document.getElementById("section-duplicates"),
  },
};

const state = {
  activeSection: "overview",
  session: loadStoredSession(),
  recoveryContext: loadRecoveryContext(),
  selectedFile: null,
  preview: null,
  options: { institutions: [], accounts: [] },
  gmail: {
    integration: null,
    accounts: [],
    institutions: [],
    messages: [],
  },
  datasets: {
    banco: [],
    base: [],
    recorrentes: [],
    fornecedores: [],
    duplicadas: [],
    imports: [],
  },
  detailCache: new Map(),
};

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

function storeSession(session) {
  state.session = session;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
  state.session = null;
  localStorage.removeItem(STORAGE_KEY);
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
  target.textContent = message || "";
  target.dataset.state = message ? type : "";
}

function clearMessages() {
  [elements.loginMessage, elements.forgotPasswordMessage, elements.resetPasswordMessage, elements.dashboardMessage, elements.importMessage, elements.gmailMessage].forEach((element) => setMessage(element, ""));
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
}

function createNode(tagName, className, text) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function formatCurrency(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date);
}

function getRowAmount(row) {
  for (const key of ["amount", "valor", "total_gasto", "total_despesa", "total_receita"]) {
    const value = Number(row?.[key]);
    if (Number.isFinite(value)) return value;
  }
  return 0;
}

function getRowDescription(row) {
  return String(
    row?.original_description
      ?? row?.normalized_description
      ?? row?.descricao
      ?? row?.fornecedor
      ?? row?.banco
      ?? "-",
  );
}

function renderEmpty(target, message) {
  target.replaceChildren(createNode("div", "empty-panel", message));
}

function renderTable(target, rows, emptyMessage = "Nenhum dado encontrado.") {
  target.replaceChildren();
  if (!Array.isArray(rows) || rows.length === 0) {
    renderEmpty(target, emptyMessage);
    return;
  }

  const columns = Object.keys(rows[0]);
  const wrap = createNode("div", "data-table-wrap");
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");

  columns.forEach((column) => {
    headRow.appendChild(createNode("th", "", column));
  });

  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  rows.forEach((row) => {
    const tr = document.createElement("tr");
    columns.forEach((column) => {
      const td = document.createElement("td");
      td.textContent = row[column] == null ? "-" : String(row[column]);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  wrap.appendChild(table);
  target.appendChild(wrap);
}

function renderStats() {
  const rows = state.datasets.base;
  const incomes = rows.filter((row) => getRowAmount(row) > 0).reduce((sum, row) => sum + getRowAmount(row), 0);
  const expenses = rows.filter((row) => getRowAmount(row) < 0).reduce((sum, row) => sum + Math.abs(getRowAmount(row)), 0);
  const balance = rows.reduce((sum, row) => sum + getRowAmount(row), 0);
  const institutions = new Set(state.options.accounts.map((account) => account.financial_institution_id).filter(Boolean)).size;
  const cards = [
    ["Transacoes", String(rows.length)],
    ["Receitas", formatCurrency(incomes)],
    ["Despesas", formatCurrency(expenses)],
    ["Saldo", formatCurrency(balance)],
    ["Instituicoes", String(institutions)],
  ];

  elements.statsGrid.replaceChildren(...cards.map(([label, value]) => {
    const card = createNode("article", "stat-card");
    card.appendChild(createNode("p", "stat-label", label));
    card.appendChild(createNode("p", "stat-value", value));
    return card;
  }));
}

function renderLatestTransactions() {
  const rows = [...state.datasets.base].slice(0, 6);
  elements.latestTransactions.replaceChildren();

  if (!rows.length) {
    renderEmpty(elements.latestTransactions, "Nenhuma transacao encontrada.");
    return;
  }

  const list = createNode("div", "simple-list");
  rows.forEach((row) => {
    const item = createNode("article", "simple-item");
    item.appendChild(createNode("strong", "", getRowDescription(row)));
    const meta = createNode("div", "meta-row");
    meta.appendChild(createNode("span", "", formatDate(row.occurred_on ?? row.data)));
    meta.appendChild(createNode("span", "", formatCurrency(getRowAmount(row))));
    item.appendChild(meta);
    list.appendChild(item);
  });
  elements.latestTransactions.appendChild(list);
}

function renderBankSummary() {
  renderTable(elements.bankSummary, state.datasets.banco, "Nenhum dado bancario encontrado.");
}

function renderTransactions() {
  renderTable(elements.transactionsTable, state.datasets.base, "Nenhuma transacao encontrada.");
}

function renderAnalyticSection(target, rows, message) {
  renderTable(target, rows, message);
}

function renderOptions() {
  const previousInstitutionId = elements.institutionSelect.value;
  const previousAccountId = elements.accountSelect.value;
  const institutionPlaceholder = createNode("option", "", "Selecione a instituicao");
  institutionPlaceholder.value = "";
  const accountPlaceholder = createNode("option", "", state.options.accounts.length ? "Selecione a conta" : "Nenhuma conta disponivel");
  accountPlaceholder.value = "";

  elements.institutionSelect.replaceChildren(institutionPlaceholder);
  state.options.institutions.forEach((institution) => {
    const option = createNode("option", "", institution.name);
    option.value = institution.id;
    elements.institutionSelect.appendChild(option);
  });

  elements.accountSelect.replaceChildren(accountPlaceholder);
  state.options.accounts.forEach((account) => {
    const option = createNode("option", "", `${account.name} (${account.account_type})`);
    option.value = account.id;
    option.dataset.institutionId = account.financial_institution_id ?? "";
    elements.accountSelect.appendChild(option);
  });

  if (previousInstitutionId && state.options.institutions.some((item) => item.id === previousInstitutionId)) {
    elements.institutionSelect.value = previousInstitutionId;
  }

  if (previousAccountId && state.options.accounts.some((item) => item.id === previousAccountId)) {
    elements.accountSelect.value = previousAccountId;
  }
}

function renderSelectedFile() {
  const file = state.selectedFile;
  elements.selectedFileCard.replaceChildren();

  if (!file) {
    elements.selectedFileCard.classList.add("hidden");
    return;
  }

  elements.selectedFileCard.classList.remove("hidden");
  const title = createNode("strong", "", file.name);
  const meta = createNode("div", "meta-row");
  meta.appendChild(createNode("span", "", `${(file.size / 1024).toFixed(1)} KB`));
  meta.appendChild(createNode("span", "", new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date())));
  elements.selectedFileCard.append(title, meta);
}

function buildPreviewPill(text, tone = "info") {
  const pill = createNode("span", "pill", text);
  pill.dataset.tone = tone;
  return pill;
}

function renderPreview() {
  const preview = state.preview;
  elements.previewPanel.replaceChildren();
  elements.confirmImportButton.disabled = !preview?.import_id || preview?.status === "failed";

  if (!preview) {
    renderEmpty(elements.previewPanel, "Nenhum preview gerado ainda.");
    return;
  }

  const summary = createNode("div", "preview-card");
  const header = createNode("div", "section-head compact");
  const headerText = createNode("div");
  headerText.appendChild(createNode("p", "eyebrow", "Arquivo analisado"));
  headerText.appendChild(createNode("h3", "", preview.file.name));
  header.appendChild(headerText);
  const headerMeta = createNode("div", "meta-row");
  headerMeta.appendChild(buildPreviewPill(preview.status, preview.status.includes("failed") ? "danger" : "info"));
  headerMeta.appendChild(buildPreviewPill(preview.institution.detected_label || "Instituicao pendente", preview.institution.detected_label ? "success" : "warning"));
  header.appendChild(headerMeta);
  summary.appendChild(header);

  const cards = createNode("div", "card-grid");
  const metrics = [
    ["Conta", preview.financial_account.name],
    ["Periodo", `${formatDate(preview.period.start_date)} a ${formatDate(preview.period.end_date)}`],
    ["Saldo", formatCurrency(preview.ledger_balance)],
    ["Linhas validas", String(preview.totals.valid_rows)],
    ["Linhas duplicadas", String(preview.totals.duplicate_rows)],
    ["Linhas invalidas", String(preview.totals.invalid_rows)],
    ["Receitas", formatCurrency(preview.totals.total_income)],
    ["Despesas", formatCurrency(preview.totals.total_expense)],
  ];

  metrics.forEach(([label, value]) => {
    const card = createNode("div", "result-card");
    card.appendChild(createNode("p", "stat-label", label));
    card.appendChild(createNode("strong", "", value || "-"));
    cards.appendChild(card);
  });
  summary.appendChild(cards);
  elements.previewPanel.appendChild(summary);

  if (preview.warnings?.length) {
    const warningCard = createNode("div", "preview-card");
    warningCard.appendChild(createNode("h3", "", "Avisos"));
    const list = createNode("div", "simple-list");
    preview.warnings.forEach((warning) => list.appendChild(createNode("div", "simple-item", warning)));
    warningCard.appendChild(list);
    elements.previewPanel.appendChild(warningCard);
  }

  const tableContainer = createNode("div", "preview-card");
  tableContainer.appendChild(createNode("h3", "", "Linhas analisadas"));
  const region = createNode("div", "table-region");
  tableContainer.appendChild(region);
  elements.previewPanel.appendChild(tableContainer);
  renderTable(region, preview.preview_rows, "Nenhuma linha retornada no preview.");
}

function renderImportHistory() {
  const items = state.datasets.imports;
  elements.importsHistory.replaceChildren();

  if (!items.length) {
    renderEmpty(elements.importsHistory, "Nenhuma importacao registrada ainda.");
    return;
  }

  const list = createNode("div", "simple-list");
  items.forEach((item) => {
    const card = createNode("article", "history-card");
    card.appendChild(createNode("strong", "", item.file?.name || "Arquivo sem nome"));
    const meta = createNode("div", "meta-row");
    meta.appendChild(createNode("span", "", item.institution?.name || "Instituicao nao informada"));
    meta.appendChild(createNode("span", "", item.financial_account?.name || "Conta nao informada"));
    meta.appendChild(createNode("span", "", formatDateTime(item.started_at)));
    card.appendChild(meta);

    const totals = createNode("div", "meta-row");
    totals.appendChild(buildPreviewPill(`Status: ${item.status}`, item.status.includes("error") || item.status === "failed" ? "warning" : "info"));
    totals.appendChild(createNode("span", "", `Total: ${item.totals.total_rows}`));
    totals.appendChild(createNode("span", "", `Importadas: ${item.totals.accepted_rows}`));
    totals.appendChild(createNode("span", "", `Duplicadas: ${item.totals.duplicate_rows}`));
    totals.appendChild(createNode("span", "", `Rejeitadas: ${item.totals.rejected_rows}`));
    card.appendChild(totals);

    const actions = createNode("div", "inline-actions");
    const detailsButton = createNode("button", "btn btn-secondary", "Detalhes");
    detailsButton.dataset.importId = item.id;
    detailsButton.dataset.action = "details";
    actions.appendChild(detailsButton);
    if (item.status === "processing" || item.status === "pending") {
      const cancelButton = createNode("button", "btn btn-ghost", "Cancelar");
      cancelButton.dataset.importId = item.id;
      cancelButton.dataset.action = "cancel";
      actions.appendChild(cancelButton);
    }
    card.appendChild(actions);
    list.appendChild(card);
  });

  elements.importsHistory.appendChild(list);
}

function populateGmailAccountSelect(target, selectedValue = "", placeholderLabel = "Selecione a conta") {
  const placeholder = createNode("option", "", placeholderLabel);
  placeholder.value = "";
  target.replaceChildren(placeholder);

  state.options.accounts.forEach((account) => {
    const option = createNode("option", "", `${account.name} (${account.account_type})`);
    option.value = account.id;
    option.dataset.institutionId = account.financial_institution_id ?? "";
    target.appendChild(option);
  });

  if (selectedValue && state.options.accounts.some((item) => item.id === selectedValue)) {
    target.value = selectedValue;
  }
}

function renderGmailStatus() {
  const integration = state.gmail.integration;
  elements.gmailStatusCard.replaceChildren();

  if (!integration) {
    renderEmpty(elements.gmailStatusCard, "Nenhuma integracao Gmail carregada.");
    populateGmailAccountSelect(elements.gmailNubankAccount);
    populateGmailAccountSelect(elements.gmailInterAccount);
    return;
  }

  const card = createNode("div", "preview-card");
  const cards = createNode("div", "card-grid");
  const metrics = [
    ["Conectado", integration.connected ? "Sim" : "Nao"],
    ["Conta Gmail", integration.gmail_email_masked || "Nao conectada"],
    ["Ultima sincronizacao", formatDateTime(integration.last_sync_at)],
    ["Status", integration.last_sync_status || "never"],
  ];

  metrics.forEach(([label, value]) => {
    const metricCard = createNode("div", "result-card");
    metricCard.appendChild(createNode("p", "stat-label", label));
    metricCard.appendChild(createNode("strong", "", value));
    cards.appendChild(metricCard);
  });

  card.appendChild(cards);
  elements.gmailStatusCard.appendChild(card);

  populateGmailAccountSelect(elements.gmailNubankAccount, integration.account_mapping?.nubank || "");
  populateGmailAccountSelect(elements.gmailInterAccount, integration.account_mapping?.inter || "");
}

function renderGmailMessages() {
  const rows = state.gmail.messages.map((item) => ({
    arquivo: item.file_name,
    banco: item.institution_slug || "-",
    status: item.status,
    recebido_em: formatDateTime(item.received_at),
    import_id: item.import_id || "-",
    erro: item.error_summary || "-",
  }));
  renderTable(elements.gmailMessagesTable, rows, "Nenhum anexo Gmail localizado ainda.");
}

function syncInstitutionWithAccount() {
  const selectedOption = elements.accountSelect.selectedOptions[0];
  if (selectedOption?.dataset.institutionId) {
    elements.institutionSelect.value = selectedOption.dataset.institutionId;
  }
}

async function apiFetch(pathname, options = {}) {
  const {
    method = "GET",
    body,
    auth = true,
    retryOnUnauthorized = true,
    headers = {},
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
  if (!state.session) {
    throw new Error("missing_session");
  }
  if (isExpired(state.session)) {
    const refreshed = await refreshSession();
    if (!refreshed) {
      throw new Error("expired_session");
    }
  }
}

async function refreshSession() {
  if (!state.session?.refresh_token) {
    clearSession();
    return false;
  }

  const { response, payload } = await apiFetch("/auth/refresh", {
    method: "POST",
    body: { refreshToken: state.session.refresh_token },
    auth: false,
    retryOnUnauthorized: false,
  });

  if (!response.ok || !payload?.session) {
    clearSession();
    return false;
  }

  storeSession({ ...payload.session, user: payload.user });
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

  storeSession({ ...payload.session, user: payload.user });
  return { ok: true };
}

async function loadOptions() {
  const { response, payload } = await apiFetch("/imports/options");
  if (!response.ok) {
    throw new Error(payload?.erro || "Falha ao consultar instituicoes e contas.");
  }

  state.options = {
    institutions: payload.institutions ?? [],
    accounts: payload.accounts ?? [],
  };
  renderOptions();
}

async function loadView(viewName, limit = 200) {
  const { response, payload } = await apiFetch(`/gastos/${viewName}?limit=${limit}`);
  if (!response.ok) {
    throw new Error(payload?.erro || `Falha ao consultar ${viewName}.`);
  }
  state.datasets[viewName] = payload.dados ?? [];
}

async function loadImportsHistory() {
  const { response, payload } = await apiFetch("/imports?limit=20");
  if (!response.ok) {
    throw new Error(payload?.erro || "Falha ao consultar historico de importacoes.");
  }
  state.datasets.imports = payload.imports ?? [];
  renderImportHistory();
}

async function loadGmailStatus() {
  const { response, payload } = await apiFetch("/integrations/gmail/status");
  if (!response.ok) {
    throw new Error(payload?.erro || "Falha ao consultar o status do Gmail.");
  }

  state.gmail = {
    integration: payload.integration,
    accounts: payload.accounts ?? [],
    institutions: payload.institutions ?? [],
    messages: payload.messages ?? [],
  };
  renderGmailStatus();
  renderGmailMessages();
}

async function loadOverviewData() {
  await Promise.all([loadView("base"), loadView("banco", 50), loadImportsHistory(), loadOptions()]);
  renderStats();
  renderLatestTransactions();
  renderBankSummary();
  renderTransactions();
}

async function loadSectionData(sectionName) {
  if (sectionName === "overview" || sectionName === "transactions") {
    await loadOverviewData();
    return;
  }

  if (sectionName === "imports") {
    await Promise.all([loadOptions(), loadImportsHistory()]);
    return;
  }

  if (sectionName === "gmail") {
    await Promise.all([loadOptions(), loadGmailStatus()]);
    return;
  }

  const mapping = {
    recurring: ["recorrentes", elements.recurringTable, "Nenhum dado recorrente encontrado."],
    suppliers: ["fornecedores", elements.suppliersTable, "Nenhum fornecedor encontrado."],
    duplicates: ["duplicadas", elements.duplicatesTable, "Nenhuma duplicidade encontrada."],
  };

  const [viewName, target, emptyMessage] = mapping[sectionName];
  await loadView(viewName, 200);
  renderAnalyticSection(target, state.datasets[viewName], emptyMessage);
}

function setActiveSection(sectionName) {
  state.activeSection = sectionName;
  Object.entries(elements.sections).forEach(([key, element]) => {
    element.classList.toggle("hidden", key !== sectionName);
  });
  elements.navLinks.forEach((button) => button.classList.toggle("is-active", button.dataset.section === sectionName));
  elements.mainNav.classList.remove("is-open");
  elements.menuToggle.setAttribute("aria-expanded", "false");
}

async function refreshActiveSection() {
  try {
    await loadSectionData(state.activeSection);
  } catch (error) {
    setMessage(elements.dashboardMessage, error.message || "Falha ao carregar a secao.", "error");
  }
}

async function verifyStoredSession() {
  if (state.recoveryContext) {
    showResetPassword(state.recoveryContext);
    return;
  }

  if (!state.session) {
    showLogin();
    return;
  }

  try {
    await ensureSession();
    const { response } = await apiFetch("/auth/me");
    if (!response.ok) throw new Error("invalid_session");
    showAppShell();
    setActiveSection("overview");
    await refreshActiveSection();
  } catch {
    clearSession();
    showLogin();
  }
}

async function prepareRecoveryMode(linkType, sessionOverride = null) {
  const { data, error } = sessionOverride
    ? { data: { session: sessionOverride }, error: null }
    : await supabase.auth.getSession();

  if (error || !data?.session?.access_token) {
    clearRecoveryContext();
    clearAuthRedirectFromUrl();
    showLogin({
      message: "O link de redefinicao e invalido ou expirou. Solicite um novo e-mail.",
      messageType: "error",
    });
    return;
  }

  storeRecoveryContext({
    email: data.session.user?.email ?? "",
    type: linkType === "invite" ? "invite" : "recovery",
  });

  clearMessages();
  clearAuthRedirectFromUrl();
  showResetPassword(state.recoveryContext);
}

async function handleLogin(event) {
  event.preventDefault();
  clearMessages();
  setLoading(elements.loginButton, true, "Entrando...");
  const email = elements.usuarioInput.value.trim();
  const password = elements.senhaInput.value;

  if (!email || !password) {
    setMessage(elements.loginMessage, "Email e senha sao obrigatorios.", "error");
    setLoading(elements.loginButton, false);
    return;
  }

  try {
    const result = await signInThroughBackend(email, password);
    if (!result.ok) {
      setMessage(elements.loginMessage, result.payload?.erro || "Nao foi possivel autenticar.", "error");
      return;
    }

    elements.loginForm.reset();
    showAppShell();
    setActiveSection("overview");
    await refreshActiveSection();
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
    setMessage(elements.forgotPasswordMessage, "Nao foi possivel solicitar a recuperacao agora. Tente novamente em instantes.", "error");
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
        setActiveSection("overview");
        setMessage(elements.dashboardMessage, "Senha atualizada com sucesso.", "success");
        await refreshActiveSection();
        return;
      }
    }

    elements.senhaInput.value = "";
    showLogin({
      prefillEmail: ownerEmail,
      message: "Senha atualizada com sucesso. Faca login com a nova senha.",
      messageType: "success",
    });
  } catch {
    setMessage(elements.resetPasswordMessage, "Erro de rede ao redefinir a senha.", "error");
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
    // fallback local suficiente para frontend estático
  } finally {
    clearSession();
    state.preview = null;
    state.selectedFile = null;
    state.gmail = { integration: null, accounts: [], institutions: [], messages: [] };
    clearMessages();
    showLogin();
  }
}

async function handleGmailConnect() {
  setLoading(elements.gmailConnectButton, true, "Conectando...");
  setMessage(elements.gmailMessage, "");

  try {
    const { response, payload } = await apiFetch("/integrations/gmail/connect");
    if (!response.ok || !payload?.authorization_url) {
      setMessage(elements.gmailMessage, payload?.erro || "Nao foi possivel iniciar a conexao Gmail.", "error");
      return;
    }

    window.location.href = payload.authorization_url;
  } catch (error) {
    setMessage(elements.gmailMessage, error.message || "Falha ao iniciar a conexao Gmail.", "error");
  } finally {
    setLoading(elements.gmailConnectButton, false);
  }
}

async function handleGmailDisconnect() {
  setLoading(elements.gmailDisconnectButton, true, "Desconectando...");
  setMessage(elements.gmailMessage, "");

  try {
    const { response, payload } = await apiFetch("/integrations/gmail/disconnect", { method: "POST" });
    if (!response.ok) {
      setMessage(elements.gmailMessage, payload?.erro || "Nao foi possivel desconectar o Gmail.", "error");
      return;
    }

    await loadGmailStatus();
    setMessage(elements.gmailMessage, "Integracao Gmail desconectada.", "success");
  } catch (error) {
    setMessage(elements.gmailMessage, error.message || "Falha ao desconectar o Gmail.", "error");
  } finally {
    setLoading(elements.gmailDisconnectButton, false);
  }
}

async function handleGmailSync() {
  setLoading(elements.gmailSyncButton, true, "Buscando...");
  setMessage(elements.gmailMessage, "");

  try {
    const accountMappings = {
      nubank: elements.gmailNubankAccount.value,
      inter: elements.gmailInterAccount.value,
    };
    const { response, payload } = await apiFetch("/integrations/gmail/sync", {
      method: "POST",
      body: { accountMappings },
    });

    if (!response.ok) {
      setMessage(elements.gmailMessage, payload?.erro || "Nao foi possivel sincronizar o Gmail.", "error");
      return;
    }

    await Promise.all([loadGmailStatus(), loadImportsHistory()]);
    setMessage(elements.gmailMessage, "Busca Gmail concluida com sucesso.", "success");
  } catch (error) {
    setMessage(elements.gmailMessage, error.message || "Falha ao sincronizar o Gmail.", "error");
  } finally {
    setLoading(elements.gmailSyncButton, false);
  }
}

async function handleCreateAccount(event) {
  event.preventDefault();
  setLoading(elements.createAccountButton, true, "Salvando...");
  setMessage(elements.importMessage, "");

  try {
    const institutionId = elements.institutionSelect.value;
    const { response, payload } = await apiFetch("/imports/accounts", {
      method: "POST",
      body: {
        name: elements.createAccountName.value.trim(),
        financialInstitutionId: institutionId,
        accountType: elements.createAccountType.value,
        externalIdentifier: elements.createExternalIdentifier.value.trim(),
        maskedAccountNumber: elements.createMaskedAccountNumber.value.trim(),
        maskedBranchNumber: elements.createMaskedBranchNumber.value.trim(),
      },
    });

    if (!response.ok) {
      setMessage(elements.importMessage, payload?.erro || "Nao foi possivel criar a conta financeira.", "error");
      return;
    }

    elements.createAccountForm.reset();
    elements.createAccountForm.classList.add("hidden");
    await loadOptions();
    elements.accountSelect.value = payload.account.id;
    syncInstitutionWithAccount();
    setMessage(elements.importMessage, "Conta financeira criada com sucesso.", "success");
  } catch (error) {
    setMessage(elements.importMessage, error.message || "Falha ao criar a conta financeira.", "error");
  } finally {
    setLoading(elements.createAccountButton, false);
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
      headers: {},
    });

    if (!response.ok) {
      setMessage(elements.importMessage, payload?.erro || "Falha ao gerar preview do arquivo.", "error");
      return;
    }

    state.preview = payload.preview;
    renderPreview();
    await loadImportsHistory();
    setMessage(elements.importMessage, "Preview OFX gerado com sucesso.", "success");
  } catch (error) {
    setMessage(elements.importMessage, error.message || "Falha ao gerar preview do arquivo.", "error");
  } finally {
    setLoading(elements.previewButton, false);
  }
}

async function handleConfirmImport() {
  if (!state.preview?.import_id) {
    setMessage(elements.importMessage, "Nenhum preview pendente para confirmar.", "error");
    return;
  }

  setLoading(elements.confirmImportButton, true, "Confirmando...");
  setMessage(elements.importMessage, "");

  try {
    const { response, payload } = await apiFetch("/imports/ofx/confirm", {
      method: "POST",
      body: { importId: state.preview.import_id },
    });

    if (!response.ok) {
      setMessage(elements.importMessage, payload?.erro || "Falha ao confirmar importacao.", "error");
      return;
    }

    state.preview = null;
    renderPreview();
    await Promise.all([loadImportsHistory(), loadView("base"), loadView("banco", 50)]);
    renderStats();
    renderLatestTransactions();
    renderBankSummary();
    renderTransactions();
    setMessage(elements.importMessage, "Importacao confirmada com sucesso.", "success");
  } catch (error) {
    setMessage(elements.importMessage, error.message || "Falha ao confirmar importacao.", "error");
  } finally {
    setLoading(elements.confirmImportButton, false);
  }
}

async function handleHistoryAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const importId = button.dataset.importId;
  const action = button.dataset.action;
  setMessage(elements.importMessage, "");

  if (action === "cancel") {
    setLoading(button, true, "Cancelando...");
    try {
      const { response, payload } = await apiFetch(`/imports/${importId}/cancel`, { method: "POST" });
      if (!response.ok) {
        setMessage(elements.importMessage, payload?.erro || "Nao foi possivel cancelar a importacao.", "error");
        return;
      }
      await loadImportsHistory();
      setMessage(elements.importMessage, "Importacao cancelada.", "success");
    } catch (error) {
      setMessage(elements.importMessage, error.message || "Falha ao cancelar importacao.", "error");
    } finally {
      setLoading(button, false);
    }
    return;
  }

  setLoading(button, true, "Abrindo...");
  try {
    const { response, payload } = await apiFetch(`/imports/${importId}`);
    if (!response.ok) {
      setMessage(elements.importMessage, payload?.erro || "Falha ao carregar detalhes da importacao.", "error");
      return;
    }

    const details = payload.importacao;
    const rows = details.rows.map((row) => ({
      row_number: row.row_number,
      status: row.status,
      occurred_on: row.occurred_on,
      description: row.description,
      amount: row.amount,
      fit_id: row.fit_id,
    }));
    state.detailCache.set(importId, details);
    state.preview = {
      import_id: details.id,
      status: details.status,
      file: { name: details.files[0]?.name || "Detalhes da importacao", size_bytes: details.files[0]?.size_bytes || 0, mime_type: "application/ofx", extension: "ofx", hash_masked: details.files[0]?.hash_masked || "-", encoding: details.files[0]?.encoding || "-" },
      institution: { detected_label: details.institution?.name || "Instituicao nao informada" },
      financial_account: { name: details.financial_account?.name || "Conta nao informada", account_type: details.financial_account?.account_type || "-", masked_account_number: details.financial_account?.masked_account_number || "-" },
      period: {
        start_date: details.processing_summary?.period?.start_date || null,
        end_date: details.processing_summary?.period?.end_date || null,
      },
      ledger_balance: details.processing_summary?.ledger_balance || null,
      totals: {
        total_rows: details.totals.total_rows,
        valid_rows: details.totals.accepted_rows,
        invalid_rows: details.totals.rejected_rows,
        duplicate_rows: details.totals.duplicate_rows,
        income_count: 0,
        expense_count: 0,
        total_income: 0,
        total_expense: 0,
      },
      warnings: details.processing_summary?.warnings || [],
      file_duplicates: [],
      preview_rows: rows,
      preview_rows_truncated: details.rows_truncated,
    };
    renderPreview();
    setMessage(elements.importMessage, "Detalhes da importacao carregados no painel de preview.", "info");
  } catch (error) {
    setMessage(elements.importMessage, error.message || "Falha ao carregar detalhes da importacao.", "error");
  } finally {
    setLoading(button, false);
  }
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
    setMessage(elements.importMessage, "Selecione apenas arquivos com extensao .ofx.", "error");
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

function registerEventHandlers() {
  elements.loginForm.addEventListener("submit", handleLogin);
  elements.showForgotPasswordButton.addEventListener("click", () => {
    clearMessages();
    showForgotPassword();
  });
  elements.forgotPasswordForm.addEventListener("submit", handleForgotPassword);
  elements.backToLoginFromForgotButton.addEventListener("click", () => {
    clearMessages();
    showLogin();
  });
  elements.resetPasswordForm.addEventListener("submit", handleResetPassword);
  elements.backToLoginFromResetButton.addEventListener("click", async () => {
    clearRecoveryContext();
    await supabase.auth.signOut();
    clearMessages();
    showLogin();
  });
  elements.logoutButton.addEventListener("click", handleLogout);
  elements.menuToggle.addEventListener("click", () => {
    const isOpen = elements.mainNav.classList.toggle("is-open");
    elements.menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
  elements.navLinks.forEach((button) => {
    button.addEventListener("click", async () => {
      clearMessages();
      setActiveSection(button.dataset.section);
      await refreshActiveSection();
    });
  });
  elements.refreshOptionsButton.addEventListener("click", async () => {
    setLoading(elements.refreshOptionsButton, true, "Atualizando...");
    try {
      await loadOptions();
      setMessage(elements.importMessage, "Instituicoes e contas atualizadas.", "success");
    } catch (error) {
      setMessage(elements.importMessage, error.message || "Falha ao atualizar instituicoes e contas.", "error");
    } finally {
      setLoading(elements.refreshOptionsButton, false);
    }
  });
  elements.toggleCreateAccountButton.addEventListener("click", () => {
    elements.createAccountForm.classList.toggle("hidden");
  });
  elements.createAccountForm.addEventListener("submit", handleCreateAccount);
  elements.accountSelect.addEventListener("change", syncInstitutionWithAccount);
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
  elements.refreshHistoryButton.addEventListener("click", async () => {
    setLoading(elements.refreshHistoryButton, true, "Atualizando...");
    try {
      await loadImportsHistory();
      setMessage(elements.importMessage, "Historico atualizado.", "success");
    } catch (error) {
      setMessage(elements.importMessage, error.message || "Falha ao atualizar historico.", "error");
    } finally {
      setLoading(elements.refreshHistoryButton, false);
    }
  });
  elements.importsHistory.addEventListener("click", handleHistoryAction);
  elements.gmailConnectButton.addEventListener("click", handleGmailConnect);
  elements.gmailDisconnectButton.addEventListener("click", handleGmailDisconnect);
  elements.gmailSyncButton.addEventListener("click", handleGmailSync);
  elements.gmailRefreshButton.addEventListener("click", async () => {
    setLoading(elements.gmailRefreshButton, true, "Atualizando...");
    try {
      await Promise.all([loadOptions(), loadGmailStatus()]);
      setMessage(elements.gmailMessage, "Status Gmail atualizado.", "success");
    } catch (error) {
      setMessage(elements.gmailMessage, error.message || "Falha ao atualizar o status Gmail.", "error");
    } finally {
      setLoading(elements.gmailRefreshButton, false);
    }
  });
}

async function bootstrap() {
  registerEventHandlers();

  if (initialGmailOauthStatus) {
    history.replaceState(null, "", window.location.pathname);
  }

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

  if (initialGmailOauthStatus === "connected") {
    setMessage(elements.dashboardMessage, "Gmail conectado com sucesso. Abra a aba Gmail para sincronizar anexos.", "success");
  } else if (initialGmailOauthStatus === "error") {
    setMessage(elements.dashboardMessage, "A conexao Gmail nao foi concluida.", "error");
  }

  await verifyStoredSession();
}

bootstrap();
