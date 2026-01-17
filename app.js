const API_URL = "http://localhost:3000";

async function login() {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  const linkedin = document.getElementById("linkedin").value;
  const msg = document.getElementById("msg");

  if (!linkedin) {
    msg.innerText = "LinkedIn é obrigatório";
    return;
  }

  if (usuario !== "testem" || senha !== "mteste") {
    msg.innerText = "Usuário ou senha inválidos";
    return;
  }

  console.log("Acesso registrado:", {
    linkedin,
    data: new Date().toISOString()
  });

  await carregarDados();
}

async function carregarDados() {
  try {
    const response = await fetch(`${API_URL}/gastos_banco`, {
      headers: {
        Authorization: "Bearer SEU_TOKEN_AQUI"
      }
    });

    const data = await response.json();

    document.getElementById("login").style.display = "none";
    document.getElementById("dados").style.display = "block";
    document.getElementById("resultado").innerText =
      JSON.stringify(data, null, 2);

  } catch (err) {
    document.getElementById("msg").innerText = "Erro ao carregar dados";
  }
}
