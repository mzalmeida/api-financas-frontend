const API_URL = "https://api-financas-backend.onrender.com";

async function carregarView(view) {
  const token = localStorage.getItem("token");
  const msg = document.getElementById("msg");
  const resultado = document.getElementById("resultado");

  msg.innerText = "";
  resultado.innerText = "Carregando...";

  if (!token) {
    msg.innerText = "Faça login novamente.";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/gastos/${view}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      msg.innerText = data.erro || "Erro ao buscar dados";
      return;
    }

    resultado.innerText = JSON.stringify(data, null, 2);

  } catch (err) {
    msg.innerText = "Erro de conexão com a API";
  }
}
