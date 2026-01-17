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
async function carregarView(tipo) {
  const token = localStorage.getItem("token");
  const msg = document.getElementById("msg");

  if (!token) {
    msg.innerText = "Token não encontrado. Faça login novamente.";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/gastos/${tipo}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      msg.innerText = data.erro || "Erro ao buscar dados";
      return;
    }

    document.getElementById("resultado").innerText =
      JSON.stringify(data, null, 2);

  } catch {
    msg.innerText = "Erro ao consultar API";
  }
}
