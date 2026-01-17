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

    // ✅ SALVA TOKEN
    localStorage.setItem("token", data.token);

    // ✅ AQUI É O PONTO QUE FALTAVA 👇
    document.getElementById("login").style.display = "none";
    document.getElementById("dados").style.display = "block";

    // ✅ CARREGA A PRIMEIRA VIEW
    await carregarView("banco");

  } catch (err) {
    msg.innerText = "Erro ao conectar com a API";
  }
}
