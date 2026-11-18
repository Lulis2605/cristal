const CHAVE_TOKEN = "cristal_token";

export function obterToken() {
  return localStorage.getItem(CHAVE_TOKEN);
}

export function salvarToken(token) {
  localStorage.setItem(CHAVE_TOKEN, token);
}

export function limparToken() {
  localStorage.removeItem(CHAVE_TOKEN);
}

let aoExpirarSessao = null;
export function definirAoExpirarSessao(fn) {
  aoExpirarSessao = fn;
}

async function requisicao(caminho, opcoes = {}) {
  const token = obterToken();
  const headers = { "Content-Type": "application/json", ...opcoes.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const resposta = await fetch(`/api${caminho}`, { ...opcoes, headers });

  if (resposta.status === 204) return null;

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    if (resposta.status === 401 && aoExpirarSessao) aoExpirarSessao();
    throw new Error(dados.erro || `Erro ${resposta.status}`);
  }
  return dados;
}

export const api = {
  login: (credenciais) =>
    requisicao("/auth/login", {
      method: "POST",
      body: JSON.stringify(credenciais),
    }),
  eu: () => requisicao("/auth/eu"),

  listarDoadores: () => requisicao("/doadores"),
  criarDoador: (d) => requisicao("/doadores", { method: "POST", body: JSON.stringify(d) }),
  atualizarDoador: (id, d) =>
    requisicao(`/doadores/${id}`, { method: "PUT", body: JSON.stringify(d) }),
  removerDoador: (id) => requisicao(`/doadores/${id}`, { method: "DELETE" }),

  listarItens: () => requisicao("/itens"),
  listarCategorias: () => requisicao("/itens/categorias"),
  criarItem: (i) => requisicao("/itens", { method: "POST", body: JSON.stringify(i) }),

  listarDoacoes: () => requisicao("/doacoes"),
  detalharDoacao: (id) => requisicao(`/doacoes/${id}`),
  criarDoacao: (d) => requisicao("/doacoes", { method: "POST", body: JSON.stringify(d) }),
};
