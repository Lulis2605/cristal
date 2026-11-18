import { api, salvarToken } from "../api.js";
import { el, mostrarErro } from "../dom.js";

export function montarTelaLogin(container, aoLogar) {
  const boxErro = el("div");
  const inputEmail = el("input", {
    type: "email",
    required: true,
    autocomplete: "username",
    placeholder: "voluntario@exemplo.com",
  });
  const inputSenha = el("input", {
    type: "password",
    required: true,
    autocomplete: "current-password",
  });

  const form = el(
    "form",
    { onsubmit: entrar },
    el("label", {}, "E-mail", inputEmail),
    el("label", {}, "Senha", inputSenha),
    el("button", { type: "submit", className: "primario" }, "Entrar"),
  );

  container.replaceChildren(
    el(
      "section",
      { className: "painel", style: "max-width: 420px; margin: 3rem auto" },
      el("h2", {}, "Entrar no sistema"),
      el("p", { className: "vazio" }, "Use o e-mail e a senha de voluntário para acessar."),
      boxErro,
      form,
    ),
  );

  async function entrar(evento) {
    evento.preventDefault();
    boxErro.replaceChildren();
    try {
      const resposta = await api.login({
        email: inputEmail.value,
        senha: inputSenha.value,
      });
      salvarToken(resposta.token);
      aoLogar(resposta.usuario);
    } catch (erro) {
      mostrarErro(boxErro, erro);
    }
  }
}
