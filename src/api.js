async function requisicao(caminho, opcoes = {}) {
  const resposta = await fetch(`/api${caminho}`, {
    headers: { "Content-Type": "application/json" },
    ...opcoes,
  });

  if (resposta.status === 204) return null;

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(dados.erro || `Erro ${resposta.status}`);
  }
  return dados;
}

export const api = {
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
