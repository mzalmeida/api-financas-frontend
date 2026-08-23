import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const htmlSource = fs.readFileSync(path.join(root, "index.html"), "utf8");
const versionPayload = JSON.parse(fs.readFileSync(path.join(root, "version.json"), "utf8"));

test("Supabase esta fixado e nao duplica persistencia de sessao", () => {
  assert.match(appSource, /@supabase\/supabase-js@2\.90\.1/);
  assert.match(appSource, /persistSession:\s*false/);
  assert.doesNotMatch(appSource, /SUPABASE_RECOVERY_STORAGE_KEY/);
});

test("CSP permite apenas os servicos necessarios", () => {
  const csp = htmlSource.match(/Content-Security-Policy" content="([^"]+)/)?.[1] || "";
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /script-src 'self' https:\/\/esm\.sh/);
  assert.match(csp, /connect-src 'self' https:\/\/api-financas-backend1\.onrender\.com/);
  assert.match(csp, /object-src 'none'/);
  assert.doesNotMatch(csp, /unsafe-eval/);
});

test("tabelas nao inferem HTML confiavel a partir de dados da API", () => {
  assert.match(appSource, /column\.allowHtml === true \? String\(raw \?\? ""\) : escapeHtml\(raw\)/);
  assert.doesNotMatch(appSource, /raw\.includes\("<span"\)/);
  assert.doesNotMatch(appSource, /raw\.includes\("<button"\)/);
});

test("nome amigavel usa endpoint autenticado e suporta selecao em lote", () => {
  assert.match(htmlSource, /id="identifySelectedMovements"/);
  assert.match(appSource, /apiFetch\("\/portal\/movements\/supplier"/);
  assert.match(appSource, /movementIds:\s*uniqueIds\.slice/);
  assert.match(appSource, /data-action="identify"/);
});

test("portal detecta nova versao sem perder a sessao", () => {
  const appVersion = appSource.match(/APP_BUILD_VERSION = "([^"]+)"/)?.[1];
  assert.equal(appVersion, versionPayload.version);
  assert.match(appSource, /fetch\(`\/version\.json\?ts=\$\{Date\.now\(\)\}`/);
  assert.match(appSource, /cache:\s*"no-store"/);
  assert.match(appSource, /visibilitychange/);
  assert.match(appSource, /window\.addEventListener\("focus"/);
  assert.match(appSource, /window\.location\.replace/);
  assert.match(appSource, /sessionStorage\.getItem\(reloadKey\)/);
  assert.doesNotMatch(appSource, /localStorage\.removeItem\(STORAGE_KEY\).*version-reload/s);
});
