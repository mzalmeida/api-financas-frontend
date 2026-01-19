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

    localStorage.setItem("token", data.token);

    document.getElementById("login").style.display = "none";
    document.getElementById("dados").style.display = "block";

    // carrega a primeira view automaticamente
    carregarView("banco");

  } catch {
    msg.innerText = "Erro ao conectar com a API";
  }
}

/* 📊 CARREGA QUALQUER VIEW */
function carregarView(view) {
  const token = localStorage.getItem("token");

  fetch(`${API_URL}/gastos/${view}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  })
  .then(res => {
    if (!res.ok) throw new Error("Não autorizado");
    return res.json();
  })
  .then(data => {
    console.log("Dados recebidos:", data);
    // aqui você já deve ter o render da tabela
  })
  .catch(err => {
    console.error("Erro:", err);
    alert("Sessão expirada ou não autorizado");
  });
}
