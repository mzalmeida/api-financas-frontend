const API_URL = "https://api-financas-backend.onrender.com";

/* 🔐 LOGIN */
async function login() {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  const linkedin = document.getElementById("linkedin").value;
  const msg = document.getElementById("msg");

  msg.innerText = "";

  if (!usuario || !senha || !linkedin) {
    msg.innerText = "Usuário, senha e LinkedIn são obrigatórios";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, senha, linkedin })
    });

    const data = await response.json();

    if (!response.ok) {
      msg.innerText = data.erro || "Erro no login";
      return;
    }

    // 🔑 salva token
    localStorage.setItem("token", data.token);

    // alterna telas
    document.getElementById("login").style.display = "none";
    document.getElementById("dados").style.display = "block";

  } catch {
    msg.innerText = "Erro ao conectar com a API";
  }
}

/* 📊 CARREGA DADOS */
function carregarView(view) {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Você não está logado");
    return;
  }

  fetch(`${API_URL}/gastos/${view}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(res => {
    if (res.status === 401) throw new Error("401");
    return res.json();
  })
  .then(data => {
    renderizarTabela(data.dados);
  })
  .catch(err => {
    alert("Sessão expirada ou não autorizada");
    localStorage.removeItem("token");
    location.reload();
  });
}

/* 🧾 TABELA */
function renderizarTabela(dados) {
  if (!dados || dados.length === 0) {
    document.getElementById("resultado").innerText = "Nenhum dado encontrado.";
    return;
  }

  const colunas = Object.keys(dados[0]);

  let html = "<table>";
  html += "<thead><tr>";

  colunas.forEach(col => {
    html += `<th>${col}</th>`;
  });

  html += "</tr></thead><tbody>";

  dados.forEach(linha => {
    html += "<tr>";
    colunas.forEach(col => {
      html += `<td>${linha[col]}</td>`;
    });
    html += "</tr>";
  });

  html += "</tbody></table>";

  document.getElementById("resultado").innerHTML = html;
}

/* 🔙 BOTÃO SAIR */
const btnVoltar = document.getElementById("btnVoltar");

if (btnVoltar) {
  btnVoltar.addEventListener("click", () => {
    localStorage.removeItem("token");
    document.getElementById("dados").style.display = "none";
    document.getElementById("login").style.display = "block";
    document.getElementById("resultado").innerHTML = "";
  });
}
