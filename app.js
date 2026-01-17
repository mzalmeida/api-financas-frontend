const API_URL = "https://api-financas-backend.onrender.com";

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
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usuario,
        senha,
        linkedin
      })
    });

    const data = await response.json();

    if (!response.ok) {
      msg.innerText = data.erro || "Erro no login";
      return;
    }

    // salva token
    localStorage.setItem("token", data.token);

    // chama dados protegidos
    await carregarDados();

  } catch (err) {
    msg.innerText = "Erro ao conectar com a API";
  }
}
async function carregarDados() {
  const msg = document.getElementById("msg");
  const token = localStorage.getItem("token");

  if (!token) {
    msg.innerText = "Token não encontrado. Faça login novamente.";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/gastos_banco`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      msg.innerText = data.erro || "Erro ao buscar dados";
      return;
    }

    // exibe resultado
    document.getElementById("login").style.display = "none";
    document.getElementById("dados").style.display = "block";
    document.getElementById("resultado").innerText =
      JSON.stringify(data, null, 2);

  } catch (err) {
    msg.innerText = "Erro ao consultar API protegida";
  }
}
