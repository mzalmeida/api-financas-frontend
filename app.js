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
    //carregarView("banco");

  } catch {
    msg.innerText = "Erro ao conectar com a API";
  }
}

/* 📊 CARREGA QUALQUER VIEW */
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
  .then(async res => {
    if (res.status === 401) {
      throw new Error("401");
    }
    return res.json();
  })
  .then(data => {
    console.log("Dados recebidos:", data);
  })
  .catch(err => {
    if (err.message === "401") {
      alert("Token inválido ou expirado. Faça login novamente.");
      localStorage.removeItem("token");
      location.reload();
    } else {
      alert("Erro ao buscar dados");
    }
  });
}
