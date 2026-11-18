import { api } from "../api.js";
import { el, mostrarErro } from "../dom.js";

export function montarTelaDoadores(container) {
  let editandoId = null;

  const boxErro = el("div");
  const tituloForm = el("h2", {}, "Novo doador");
  const inputNome = el("input", {
    type: "text",
    required: true,
    placeholder: "Nome ou instituição",
  });
  const inputEmail = el("input", {
    type: "email",
    placeholder: "opcional@exemplo.com",
  });
  const inputTelefone = el("input", {
    type: "text",
    placeholder: "(11) 99999-0000",
  });
  const btnSalvar = el("button", { type: "submit", className: "primario" }, "Cadastrar");
  const btnCancelar = el(
    "button",
    {
      type: "button",
      className: "secundario",
      onclick: limparForm,
      style: "display: none",
    },
    "Cancelar edição",
  );

  const form = el(
    "form",
    { onsubmit: salvar },
    el(
      "div",
      { className: "linha-form" },
      el("label", {}, "Nome *", inputNome),
      el("label", {}, "E-mail", inputEmail),
      el("label", {}, "Telefone", inputTelefone),
    ),
    el("div", { className: "acoes" }, btnSalvar, btnCancelar),
  );

  const listaBox = el("div", {}, el("p", { className: "vazio" }, "Carregando..."));

  container.replaceChildren(
    boxErro,
    el("section", { className: "painel" }, tituloForm, form),
    el("section", { className: "painel" }, el("h2", {}, "Doadores"), listaBox),
  );

  function limparForm() {
    editandoId = null;
    form.reset();
    tituloForm.textContent = "Novo doador";
    btnSalvar.textContent = "Cadastrar";
    btnCancelar.style.display = "none";
  }

  function preencherParaEditar(d) {
    editandoId = d.id_doador;
    inputNome.value = d.nome;
    inputEmail.value = d.email || "";
    inputTelefone.value = d.telefone || "";
    tituloForm.textContent = `Editando: ${d.nome}`;
    btnSalvar.textContent = "Salvar alterações";
    btnCancelar.style.display = "";
    inputNome.focus();
  }

  async function salvar(evento) {
    evento.preventDefault();
    boxErro.replaceChildren();
    const dados = {
      nome: inputNome.value,
      email: inputEmail.value,
      telefone: inputTelefone.value,
    };
    try {
      if (editandoId) {
        await api.atualizarDoador(editandoId, dados);
      } else {
        await api.criarDoador(dados);
      }
      limparForm();
      await carregar();
    } catch (erro) {
      mostrarErro(boxErro, erro);
    }
  }

  async function remover(d) {
    if (!confirm(`Remover ${d.nome}?`)) return;
    boxErro.replaceChildren();
    try {
      await api.removerDoador(d.id_doador);
      if (editandoId === d.id_doador) limparForm();
      await carregar();
    } catch (erro) {
      mostrarErro(boxErro, erro);
    }
  }

  async function carregar() {
    try {
      const doadores = await api.listarDoadores();
      if (doadores.length === 0) {
        listaBox.replaceChildren(el("p", { className: "vazio" }, "Nenhum doador cadastrado."));
        return;
      }
      const linhas = doadores.map((d) =>
        el(
          "tr",
          {},
          el("td", {}, d.nome),
          el("td", {}, d.email || "—"),
          el("td", {}, d.telefone || "—"),
          el(
            "td",
            {},
            el(
              "div",
              { className: "acoes" },
              el(
                "button",
                {
                  className: "secundario",
                  onclick: () => preencherParaEditar(d),
                },
                "Editar",
              ),
              el("button", { className: "perigo", onclick: () => remover(d) }, "Excluir"),
            ),
          ),
        ),
      );
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
              el("th", {}, "Nome"),
              el("th", {}, "E-mail"),
              el("th", {}, "Telefone"),
              el("th", {}, "Ações"),
            ),
          ),
          el("tbody", {}, linhas),
        ),
      );
    } catch (erro) {
      mostrarErro(boxErro, erro);
    }
  }

  void carregar();
}
