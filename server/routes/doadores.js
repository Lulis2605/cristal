import { Router } from "express";
import { pool } from "../db.js";
import { inteiroPositivo, texto } from "../validacao.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_doador, nome, email, telefone, data_cadastro FROM doador ORDER BY nome",
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = inteiroPositivo(req.params.id);
    if (!id) return res.status(400).json({ erro: "ID inválido" });

    const [rows] = await pool.query(
      "SELECT id_doador, nome, email, telefone, data_cadastro FROM doador WHERE id_doador = ?",
      [id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ erro: "Doador não encontrado" });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const nome = texto(req.body.nome);
    if (!nome) return res.status(400).json({ erro: "Nome é obrigatório" });

    const email = texto(req.body.email);
    const telefone = texto(req.body.telefone);

    const [result] = await pool.query(
      "INSERT INTO doador (nome, email, telefone) VALUES (?, ?, ?)",
      [nome, email, telefone],
    );

    res.status(201).json({
      id_doador: result.insertId,
      nome,
      email,
      telefone,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ erro: "E-mail já cadastrado" });
    }
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const id = inteiroPositivo(req.params.id);
    if (!id) return res.status(400).json({ erro: "ID inválido" });

    const nome = texto(req.body.nome);
    if (!nome) return res.status(400).json({ erro: "Nome é obrigatório" });

    const email = texto(req.body.email);
    const telefone = texto(req.body.telefone);

    const [result] = await pool.query(
      "UPDATE doador SET nome = ?, email = ?, telefone = ? WHERE id_doador = ?",
      [nome, email, telefone, id],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: "Doador não encontrado" });
    }

    res.json({ id_doador: id, nome, email, telefone });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ erro: "E-mail já cadastrado" });
    }
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = inteiroPositivo(req.params.id);
    if (!id) return res.status(400).json({ erro: "ID inválido" });

    const [result] = await pool.query("DELETE FROM doador WHERE id_doador = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: "Doador não encontrado" });
    }

    res.status(204).end();
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        erro: "Doador possui doações registradas e não pode ser removido",
      });
    }
    next(err);
  }
});

export default router;
