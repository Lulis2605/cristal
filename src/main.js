import "./style.css";
import { api, definirAoExpirarSessao, limparToken, obterToken } from "./api.js";
import { el } from "./dom.js";
import { montarTelaDoacoes } from "./telas/doacoes.js";
import { montarTelaDoadores } from "./telas/doadores.js";
import { montarTelaItens } from "./telas/itens.js";
import { montarTelaLogin } from "./telas/login.js";

const telas = {
  doacoes: { rotulo: "Doações", montar: montarTelaDoacoes },
  doadores: { rotulo: "Doadores", montar: montarTelaDoadores },
  itens: { rotulo: "Itens", montar: montarTelaItens },
};

const app = document.querySelector("#app");

function mostrarLogin() {
  const conteudo = el("main");
  app.replaceChildren(el("header", {}, el("h1", {}, "ONG Cristal")), conteudo);
  montarTelaLogin(conteudo, mostrarSistema);
}

function mostrarSistema(usuario) {
  const conteudo = el("main");
  const botoes = {};

  function abrir(chave) {
    for (const [k, btn] of Object.entries(botoes)) {
      btn.classList.toggle("ativa", k === chave);
    }
    conteudo.replaceChildren();
    telas[chave].montar(conteudo);
  }

  for (const [chave, tela] of Object.entries(telas)) {
    botoes[chave] = el("button", { onclick: () => abrir(chave) }, tela.rotulo);
  }

  function sair() {
    limparToken();
    mostrarLogin();
  }

  const infoUsuario = el(
    "div",
    {
      style: "display: flex; gap: 0.75rem; align-items: center; font-size: 0.9rem",
    },
    el("span", {}, usuario.nome),
    el("button", { onclick: sair }, "Sair"),
  );

  app.replaceChildren(
    el(
      "header",
      {},
      el(
        "div",
        {
          style: "display: flex; justify-content: space-between; align-items: center",
        },
        el("h1", {}, "ONG Cristal"),
        infoUsuario,
      ),
      el("nav", {}, Object.values(botoes)),
    ),
    conteudo,
  );

  abrir("doacoes");
}

definirAoExpirarSessao(() => {
  limparToken();
  mostrarLogin();
});

async function iniciar() {
  if (!obterToken()) {
    mostrarLogin();
    return;
  }
  try {
    const usuario = await api.eu();
    mostrarSistema(usuario);
  } catch {
    limparToken();
    mostrarLogin();
  }
}

void iniciar();
