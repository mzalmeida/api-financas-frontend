import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STORAGE_KEY = "api-financas.session";
const RECOVERY_CONTEXT_KEY = "api-financas.recovery-context";
const PUBLIC_BACKEND_URL = "https://api-financas-backend1.onrender.com";
const PUBLIC_FRONTEND_URL = "https://api-financas-frontend.onrender.com";
const LOCAL_BACKEND_URL = "http://127.0.0.1:3000";
const SUPABASE_URL = "https://gbnzacdsxsivwwsquxky.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdibnphY2RzeHNpdnd3c3F1eGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1OTEwOTgsImV4cCI6MjEwMTE2NzA5OH0.hGoMQxS8eKIjyEytuaGAxI0TjkFT5OZp5coiUEbr_U8";
const PASSWORD_MIN_LENGTH = 8;
const SUPABASE_RECOVERY_STORAGE_KEY = "api-financas.supabase.recovery";

function resolveApiUrl() {
  const { hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return LOCAL_BACKEND_URL;
  }
  return PUBLIC_BACKEND_URL;
}

function resolveRecoveryRedirectUrl() {
  const { hostname, protocol, host } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${protocol}//${host}`;
  }
  return PUBLIC_FRONTEND_URL;
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
  loginSection: document.getElementById("login"),
  forgotPasswordSection: document.getElementById("forgotPassword"),
  resetPasswordSection: document.getElementById("resetPassword"),
  dashboardSection: document.getElementById("dados"),
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
  result: document.getElementById("resultado"),
  logoutButton: document.getElementById("btnSair"),
  viewButtons: document.getElementById("viewButtons"),
};

let inMemorySession = loadStoredSession();
let recoveryContext = loadRecoveryContext();

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

function storeRecoveryContext(context) {
  recoveryContext = context;
  sessionStorage.setItem(RECOVERY_CONTEXT_KEY, JSON.stringify(context));
}

function clearRecoveryContext() {
  recoveryContext = null;
  sessionStorage.removeItem(RECOVERY_CONTEXT_KEY);
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

function hideAllSections() {
  [
    elements.loginSection,
    elements.forgotPasswordSection,
    elements.resetPasswordSection,
    elements.dashboardSection,
  ].forEach((section) => section.classList.add("hidden"));
}

function showLogin(options = {}) {
  hideAllSections();
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
  hideAllSections();
  elements.forgotPasswordSection.classList.remove("hidden");
  elements.recoveryEmailInput.value = elements.usuarioInput.value.trim();
}

function showResetPassword(context) {
  hideAllSections();
  elements.resetPasswordSection.classList.remove("hidden");
  elements.resetPasswordForm.reset();

  const emailText = context?.email ? ` para ${context.email}` : "";
  const modeText = context?.type === "invite"
    ? `Defina sua senha inicial${emailText}.`
    : `Defina sua nova senha${emailText}.`;
  elements.resetPasswordSubtitle.textContent = modeText;
}

function showDashboard() {
  hideAllSections();
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

function clearTransientMessages() {
  setMessage(elements.loginMessage, "");
  setMessage(elements.forgotPasswordMessage, "");
  setMessage(elements.resetPasswordMessage, "");
  setMessage(elements.dashboardMessage, "");
}

function clearAuthRedirectFromUrl() {
  if (window.location.hash) {
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }
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

  storeSession({
    ...payload.session,
    user: payload.user,
  });
  return { ok: true, payload };
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

  clearTransientMessages();
  clearAuthRedirectFromUrl();
  showResetPassword(recoveryContext);
}

async function verifyStoredSession() {
  if (recoveryContext) {
    showResetPassword(recoveryContext);
    return;
  }

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
    const result = await signInThroughBackend(usuario, senha);

    if (!result.ok) {
      setMessage(elements.loginMessage, result.payload?.erro || "Nao foi possivel autenticar.", "error");
      return;
    }

    elements.loginForm.reset();
    clearTransientMessages();
    renderTable([]);
    showDashboard();
  } catch {
    setMessage(elements.loginMessage, "Erro ao conectar com a API.", "error");
  } finally {
    setLoading(elements.loginButton, false);
  }
}

async function handleForgotPassword(event) {
  event.preventDefault();
  setMessage(elements.forgotPasswordMessage, "");
  setLoading(elements.forgotPasswordButton, true, "Enviando...");

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

    if (error && error.name === "AuthRetryableFetchError") {
      throw error;
    }

    setMessage(
      elements.forgotPasswordMessage,
      "Se o e-mail estiver cadastrado, voce recebera um link para redefinir a senha.",
      "success",
    );
  } catch {
    setMessage(
      elements.forgotPasswordMessage,
      "Nao foi possivel solicitar a recuperacao agora. Tente novamente em instantes.",
      "error",
    );
  } finally {
    setLoading(elements.forgotPasswordButton, false);
  }
}

function validateNewPassword(password, confirmation) {
  if (!password || !confirmation) {
    return "Preencha os dois campos de senha.";
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return `A senha precisa ter no minimo ${PASSWORD_MIN_LENGTH} caracteres.`;
  }

  if (password !== confirmation) {
    return "As senhas informadas sao diferentes.";
  }

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
      const message = error.message?.toLowerCase().includes("weak")
        ? "A senha informada nao atende aos requisitos minimos."
        : "Nao foi possivel redefinir a senha com este link.";
      setMessage(elements.resetPasswordMessage, message, "error");
      return;
    }

    const ownerEmail = sessionData.session.user?.email ?? recoveryContext?.email ?? "";
    clearRecoveryContext();
    await supabase.auth.signOut();

    if (ownerEmail) {
      const signInResult = await signInThroughBackend(ownerEmail, newPassword);
      if (signInResult.ok) {
        renderTable([]);
        setMessage(elements.dashboardMessage, "Senha atualizada com sucesso.", "success");
        showDashboard();
        return;
      }
    }

    elements.senhaInput.value = "";
    showLogin({
      prefillEmail: ownerEmail,
      message: "Senha atualizada com sucesso. Faça login com a nova senha.",
      messageType: "success",
    });
  } catch {
    setMessage(elements.resetPasswordMessage, "Erro de rede ao redefinir a senha.", "error");
  } finally {
    setLoading(elements.resetPasswordButton, false);
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
      showLogin({
        message: "Sua sessao expirou. Faca login novamente.",
        messageType: "error",
      });
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
    clearTransientMessages();
    showLogin();
  }
}

function registerEventHandlers() {
  elements.loginForm.addEventListener("submit", handleLogin);
  elements.showForgotPasswordButton.addEventListener("click", () => {
    clearTransientMessages();
    showForgotPassword();
  });
  elements.forgotPasswordForm.addEventListener("submit", handleForgotPassword);
  elements.backToLoginFromForgotButton.addEventListener("click", () => {
    clearTransientMessages();
    showLogin();
  });
  elements.resetPasswordForm.addEventListener("submit", handleResetPassword);
  elements.backToLoginFromResetButton.addEventListener("click", async () => {
    clearRecoveryContext();
    await supabase.auth.signOut();
    clearTransientMessages();
    showLogin();
  });
  elements.logoutButton.addEventListener("click", handleLogout);
  elements.viewButtons.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-view]");
    if (!button) return;
    handleLoadView(button.dataset.view, button);
  });
}

async function bootstrap() {
  registerEventHandlers();

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

  if (recoveryContext) {
    const { data } = await supabase.auth.getSession();
    if (!data?.session) {
      clearRecoveryContext();
      showLogin({
        message: "O link de redefinicao e invalido ou expirou. Solicite um novo e-mail.",
        messageType: "error",
      });
      return;
    }
    showResetPassword(recoveryContext);
    return;
  }

  await verifyStoredSession();
}

bootstrap();
