import "./style.css";
import { el } from "./dom.js";
import { montarTelaDoacoes } from "./telas/doacoes.js";
import { montarTelaDoadores } from "./telas/doadores.js";
import { montarTelaItens } from "./telas/itens.js";

const telas = {
  doacoes: { rotulo: "Doações", montar: montarTelaDoacoes },
  doadores: { rotulo: "Doadores", montar: montarTelaDoadores },
  itens: { rotulo: "Itens", montar: montarTelaItens },
};

const app = document.querySelector("#app");
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

app.replaceChildren(
  el("header", {}, el("h1", {}, "ONG Cristal"), el("nav", {}, Object.values(botoes))),
  conteudo,
);

abrir("doacoes");
