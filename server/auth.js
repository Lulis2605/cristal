import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "./db.js";
import { texto } from "./validacao.js";

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error("JWT_SECRET não configurado no .env");
}

const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

export function exigirLogin(req, res, next) {
  const auth = req.headers.authorization || "";
  const [tipo, token] = auth.split(" ");
  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ erro: "Token não informado" });
  }
  try {
    req.usuario = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ erro: "Sessão expirada ou token inválido" });
  }
}

export const authRouter = Router();

authRouter.post("/login", async (req, res, next) => {
  try {
    const email = texto(req.body.email);
    const senha = typeof req.body.senha === "string" ? req.body.senha : "";
    if (!email || !senha) {
      return res.status(400).json({ erro: "Informe e-mail e senha" });
    }

    const [rows] = await pool.query(
      "SELECT id_usuario, nome, email, senha_hash FROM usuario WHERE email = ?",
      [email],
    );
    const usuario = rows[0];
    const senhaOk = usuario && (await bcrypt.compare(senha, usuario.senha_hash));

    if (!senhaOk) {
      return res.status(401).json({ erro: "E-mail ou senha inválidos" });
    }

    const token = jwt.sign(
      { sub: usuario.id_usuario, nome: usuario.nome, email: usuario.email },
      SECRET,
      { expiresIn: EXPIRES_IN },
    );

    res.json({
      token,
      usuario: {
        id: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.get("/eu", exigirLogin, (req, res) => {
  res.json({
    id: req.usuario.sub,
    nome: req.usuario.nome,
    email: req.usuario.email,
  });
});
