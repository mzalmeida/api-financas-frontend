const STORAGE_KEY = "api-financas.session";
const PUBLIC_BACKEND_URL = "https://api-financas-backend1.onrender.com";
const LOCAL_BACKEND_URL = "http://127.0.0.1:3000";

function resolveApiUrl() {
  const { hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return LOCAL_BACKEND_URL;
  }
  return PUBLIC_BACKEND_URL;
}

const API_URL = resolveApiUrl();

const elements = {
  loginSection: document.getElementById("login"),
  dashboardSection: document.getElementById("dados"),
  loginForm: document.getElementById("loginForm"),
  loginButton: document.getElementById("loginButton"),
  usuarioInput: document.getElementById("usuario"),
  senhaInput: document.getElementById("senha"),
  loginMessage: document.getElementById("msg"),
  dashboardMessage: document.getElementById("dashboardMsg"),
  sessionInfo: document.getElementById("sessionInfo"),
  result: document.getElementById("resultado"),
  logoutButton: document.getElementById("btnSair"),
  viewButtons: document.getElementById("viewButtons"),
};

let inMemorySession = loadStoredSession();

function loadStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeSession(session) {
  inMemorySession = session;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
  inMemorySession = null;
  localStorage.removeItem(STORAGE_KEY);
}

function isExpired(session) {
  if (!session?.expires_at) return true;
  return session.expires_at <= Math.floor(Date.now() / 1000) + 30;
}

function setMessage(target, message, type = "info") {
  target.textContent = message || "";
  target.dataset.state = message ? type : "";
}

function setLoading(button, isLoading, loadingText = "Carregando...") {
  if (!button) return;
  if (!button.dataset.originalLabel) {
    button.dataset.originalLabel = button.textContent;
  }
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingText : button.dataset.originalLabel;
}

function showLogin() {
  elements.loginSection.classList.remove("hidden");
  elements.dashboardSection.classList.add("hidden");
  elements.sessionInfo.textContent = "";
}

function showDashboard() {
  elements.loginSection.classList.add("hidden");
  elements.dashboardSection.classList.remove("hidden");
  const email = inMemorySession?.user?.email || "Sessao ativa";
  elements.sessionInfo.textContent = email;
}

function escapeText(value) {
  return value == null ? "" : String(value);
}

function renderTable(rows) {
  elements.result.replaceChildren();

  if (!Array.isArray(rows) || rows.length === 0) {
    elements.result.textContent = "Nenhum dado encontrado.";
    return;
  }

  const columns = Object.keys(rows[0]);
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  columns.forEach((column) => {
    const th = document.createElement("th");
    th.textContent = column;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  rows.forEach((row) => {
    const tr = document.createElement("tr");
    columns.forEach((column) => {
      const td = document.createElement("td");
      td.textContent = escapeText(row[column]);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  elements.result.appendChild(table);
}

async function apiFetch(pathname, options = {}) {
  const {
    method = "GET",
    body,
    auth = true,
    retryOnUnauthorized = true,
  } = options;

  if (auth) {
    await ensureSession();
  }

  const headers = {
    "Content-Type": "application/json",
    ...(auth && inMemorySession?.access_token
      ? { Authorization: `Bearer ${inMemorySession.access_token}` }
      : {}),
  };

  const response = await fetch(`${API_URL}${pathname}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 401 && auth && retryOnUnauthorized && inMemorySession?.refresh_token) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return apiFetch(pathname, { ...options, retryOnUnauthorized: false });
    }
  }

  const payload = await response.json().catch(() => null);
  return { response, payload };
}

async function ensureSession() {
  if (!inMemorySession) {
    throw new Error("missing_session");
  }

  if (isExpired(inMemorySession)) {
    const refreshed = await refreshSession();
    if (!refreshed) {
      throw new Error("expired_session");
    }
  }
}

async function refreshSession() {
  if (!inMemorySession?.refresh_token) {
    clearSession();
    return false;
  }

  const { response, payload } = await apiFetch("/auth/refresh", {
    method: "POST",
    body: { refreshToken: inMemorySession.refresh_token },
    auth: false,
    retryOnUnauthorized: false,
  });

  if (!response.ok || !payload?.session) {
    clearSession();
    return false;
  }

  storeSession({
    ...payload.session,
    user: payload.user,
  });
  return true;
}

async function verifyStoredSession() {
  if (!inMemorySession) {
    showLogin();
    return;
  }

  try {
    await ensureSession();
    const { response } = await apiFetch("/auth/me");
    if (!response.ok) {
      throw new Error("invalid_session");
    }
    showDashboard();
  } catch {
    clearSession();
    showLogin();
  }
}

async function handleLogin(event) {
  event.preventDefault();
  setMessage(elements.loginMessage, "");
  setLoading(elements.loginButton, true, "Entrando...");

  const usuario = elements.usuarioInput.value.trim();
  const senha = elements.senhaInput.value;

  if (!usuario || !senha) {
    setMessage(elements.loginMessage, "Email e senha sao obrigatorios.", "error");
    setLoading(elements.loginButton, false);
    return;
  }

  try {
    const { response, payload } = await apiFetch("/auth/login", {
      method: "POST",
      body: { usuario, senha },
      auth: false,
      retryOnUnauthorized: false,
    });

    if (!response.ok || !payload?.session) {
      setMessage(elements.loginMessage, payload?.erro || "Nao foi possivel autenticar.", "error");
      return;
    }

    storeSession({
      ...payload.session,
      user: payload.user,
    });
    elements.loginForm.reset();
    setMessage(elements.loginMessage, "");
    setMessage(elements.dashboardMessage, "");
    renderTable([]);
    showDashboard();
  } catch {
    setMessage(elements.loginMessage, "Erro ao conectar com a API.", "error");
  } finally {
    setLoading(elements.loginButton, false);
  }
}

async function handleLoadView(viewName, button) {
  setMessage(elements.dashboardMessage, "");
  setLoading(button, true, "Carregando...");

  try {
    const { response, payload } = await apiFetch(`/gastos/${viewName}`);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("unauthorized");
      }
      setMessage(elements.dashboardMessage, payload?.erro || "Falha ao carregar dados.", "error");
      return;
    }

    renderTable(payload?.dados ?? []);
  } catch (error) {
    if (error.message === "missing_session" || error.message === "expired_session" || error.message === "unauthorized") {
      clearSession();
      showLogin();
      setMessage(elements.loginMessage, "Sua sessao expirou. Faca login novamente.", "error");
      return;
    }
    setMessage(elements.dashboardMessage, "Falha ao carregar dados.", "error");
  } finally {
    setLoading(button, false);
  }
}

async function handleLogout() {
  try {
    if (inMemorySession?.access_token) {
      await apiFetch("/auth/logout", { method: "POST", retryOnUnauthorized: false });
    }
  } catch {
    // O frontend e estatico; o logout local ainda e suficiente como fallback.
  } finally {
    clearSession();
    elements.result.replaceChildren();
    setMessage(elements.dashboardMessage, "");
    setMessage(elements.loginMessage, "");
    showLogin();
  }
}

elements.loginForm.addEventListener("submit", handleLogin);
elements.logoutButton.addEventListener("click", handleLogout);
elements.viewButtons.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-view]");
  if (!button) return;
  handleLoadView(button.dataset.view, button);
});

verifyStoredSession();
