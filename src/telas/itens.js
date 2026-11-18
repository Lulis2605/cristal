import { api } from "../api.js";
import { el, mostrarErro } from "../dom.js";

export function montarTelaItens(container) {
  const boxErro = el("div");
  const selectCategoria = el("select", { required: true });
  const inputNome = el("input", {
    type: "text",
    required: true,
    placeholder: "Ex.: Arroz 5 kg",
  });
  const inputUnidade = el("input", {
    type: "text",
    placeholder: "pacote, unidade, kg...",
    value: "unidade",
  });

  const form = el(
    "form",
    { onsubmit: salvar },
    el(
      "div",
      { className: "linha-form" },
      el("label", {}, "Categoria *", selectCategoria),
      el("label", {}, "Nome do item *", inputNome),
      el("label", {}, "Unidade", inputUnidade),
    ),
    el("button", { type: "submit", className: "primario" }, "Adicionar ao catálogo"),
  );

  const listaBox = el("div", {}, el("p", { className: "vazio" }, "Carregando..."));

  container.replaceChildren(
    boxErro,
    el("section", { className: "painel" }, el("h2", {}, "Novo item"), form),
    el("section", { className: "painel" }, el("h2", {}, "Catálogo"), listaBox),
  );

  async function salvar(evento) {
    evento.preventDefault();
    boxErro.replaceChildren();
    try {
      await api.criarItem({
        id_categoria: selectCategoria.value,
        nome: inputNome.value,
        unidade: inputUnidade.value,
      });
      inputNome.value = "";
      inputUnidade.value = "unidade";
      await carregarItens();
    } catch (erro) {
      mostrarErro(boxErro, erro);
    }
  }

  async function carregarCategorias() {
    const categorias = await api.listarCategorias();
    selectCategoria.replaceChildren(
      ...categorias.map((c) => el("option", { value: c.id_categoria }, c.nome)),
    );
  }

  async function carregarItens() {
    const itens = await api.listarItens();
    if (itens.length === 0) {
      listaBox.replaceChildren(el("p", { className: "vazio" }, "Nenhum item cadastrado."));
      return;
    }
    const linhas = itens.map((i) =>
      el("tr", {}, el("td", {}, i.categoria), el("td", {}, i.nome), el("td", {}, i.unidade)),
    );
    listaBox.replaceChildren(
      el(
        "table",
        {},
        el(
          "thead",
          {},
          el("tr", {}, el("th", {}, "Categoria"), el("th", {}, "Item"), el("th", {}, "Unidade")),
        ),
        el("tbody", {}, linhas),
      ),
    );
  }

  Promise.all([carregarCategorias(), carregarItens()]).catch((erro) => mostrarErro(boxErro, erro));
}
