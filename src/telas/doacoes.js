import { api } from "../api.js";
import { el, mostrarErro } from "../dom.js";

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatarData(valor) {
  const texto = String(valor).slice(0, 10);
  const [ano, mes, dia] = texto.split("-");
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : texto;
}

export function montarTelaDoacoes(container) {
  let catalogo = [];
  const boxErro = el("div");

  const selectDoador = el("select", { required: true });
  const inputData = el("input", {
    type: "date",
    required: true,
    value: hojeISO(),
  });
  const inputObs = el("input", {
    type: "text",
    placeholder: "Opcional (ex.: campanha, entrega na sede)",
  });
  const linhasItensBox = el("div");

  const btnAdicionarLinha = el(
    "button",
    {
      type: "button",
      className: "secundario",
      onclick: () => adicionarLinhaItem(),
    },
    "+ Adicionar outro item",
  );

  const form = el(
    "form",
    { onsubmit: salvar },
    el(
      "div",
      { className: "linha-form" },
      el("label", {}, "Doador *", selectDoador),
      el("label", {}, "Data *", inputData),
    ),
    el("label", {}, "Observação", inputObs),
    el("strong", {}, "Itens doados"),
    linhasItensBox,
    el("div", { className: "acoes" }, btnAdicionarLinha),
    el("button", { type: "submit", className: "primario" }, "Registrar doação"),
  );

  const listaBox = el("div", {}, el("p", { className: "vazio" }, "Carregando..."));

  container.replaceChildren(
    boxErro,
    el("section", { className: "painel" }, el("h2", {}, "Registrar doação"), form),
    el("section", { className: "painel" }, el("h2", {}, "Doações registradas"), listaBox),
  );

  function adicionarLinhaItem() {
    const select = el(
      "select",
      { required: true },
      ...catalogo.map((i) => el("option", { value: i.id_item }, `${i.nome} (${i.unidade})`)),
    );
    const qtd = el("input", {
      type: "number",
      min: 1,
      step: 1,
      value: 1,
      required: true,
    });
    const linha = el(
      "div",
      { className: "item-linha" },
      el("label", {}, "Item", select),
      el("label", {}, "Quantidade", qtd),
      el(
        "button",
        {
          type: "button",
          className: "perigo",
          onclick: () => {
            if (linhasItensBox.children.length > 1) linha.remove();
          },
        },
        "Remover",
      ),
    );
    linhasItensBox.append(linha);
  }

  async function salvar(evento) {
    evento.preventDefault();
    boxErro.replaceChildren();
    const itens = [...linhasItensBox.children].map((linha) => {
      const [select, qtd] = linha.querySelectorAll("select, input");
      return { id_item: Number(select.value), quantidade: Number(qtd.value) };
    });
    try {
      await api.criarDoacao({
        id_doador: Number(selectDoador.value),
        data_doacao: inputData.value,
        observacao: inputObs.value,
        itens,
      });
      inputObs.value = "";
      inputData.value = hojeISO();
      linhasItensBox.replaceChildren();
      adicionarLinhaItem();
      await carregarDoacoes();
    } catch (erro) {
      mostrarErro(boxErro, erro);
    }
  }

  async function alternarDetalhe(id, celula) {
    if (celula.firstChild) {
      celula.replaceChildren();
      return;
    }
    try {
      const detalhe = await api.detalharDoacao(id);
      const lista = el(
        "ul",
        {},
        ...detalhe.itens.map((i) => el("li", {}, `${i.quantidade} × ${i.nome} (${i.unidade})`)),
      );
      celula.replaceChildren(
        el(
          "div",
          { className: "detalhe" },
          detalhe.observacao ? el("p", {}, `Obs.: ${detalhe.observacao}`) : null,
          lista,
        ),
      );
    } catch (erro) {
      mostrarErro(boxErro, erro);
    }
  }

  async function carregarDoacoes() {
    const doacoes = await api.listarDoacoes();
    if (doacoes.length === 0) {
      listaBox.replaceChildren(el("p", { className: "vazio" }, "Nenhuma doação registrada."));
      return;
    }
    const linhas = doacoes.flatMap((d) => {
      const celulaDetalhe = el("td", { colspan: 4 });
      const linhaPrincipal = el(
        "tr",
        {},
        el("td", {}, formatarData(d.data_doacao)),
        el("td", {}, d.doador),
        el("td", {}, `${d.total_itens} item(ns), ${d.total_unidades} unidade(s)`),
        el(
          "td",
          {},
          el(
            "button",
            {
              className: "secundario",
              onclick: () => alternarDetalhe(d.id_doacao, celulaDetalhe),
            },
            "Ver itens",
          ),
        ),
      );
      return [linhaPrincipal, el("tr", {}, celulaDetalhe)];
    });
    listaBox.replaceChildren(
      el(
        "table",
        {},
        el(
          "thead",
          {},
          el(
            "tr",
            {},
            el("th", {}, "Data"),
            el("th", {}, "Doador"),
            el("th", {}, "Resumo"),
            el("th", {}, ""),
          ),
        ),
        el("tbody", {}, linhas),
      ),
    );
  }

  async function iniciar() {
    try {
      const [doadores, itens] = await Promise.all([api.listarDoadores(), api.listarItens()]);
      catalogo = itens;
      selectDoador.replaceChildren(
        ...doadores.map((d) => el("option", { value: d.id_doador }, d.nome)),
      );
      linhasItensBox.replaceChildren();
      adicionarLinhaItem();
      await carregarDoacoes();
    } catch (erro) {
      mostrarErro(boxErro, erro);
    }
  }

  void iniciar();
}
