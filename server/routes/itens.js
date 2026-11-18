import { Router } from "express";
import { pool } from "../db.js";
import { inteiroPositivo, texto } from "../validacao.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        i.id_item,
        i.nome,
        i.unidade,
        c.id_categoria,
        c.nome AS categoria
      FROM item i
      JOIN categoria c ON c.id_categoria = i.id_categoria
      ORDER BY c.nome, i.nome
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/categorias", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT id_categoria, nome FROM categoria ORDER BY nome");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const id_categoria = inteiroPositivo(req.body.id_categoria);
    if (!id_categoria) {
      return res.status(400).json({ erro: "Categoria inválida" });
    }
    const nome = texto(req.body.nome);
    if (!nome) return res.status(400).json({ erro: "Nome é obrigatório" });

    const unidade = texto(req.body.unidade) || "unidade";

    const [result] = await pool.query(
      "INSERT INTO item (id_categoria, nome, unidade) VALUES (?, ?, ?)",
      [id_categoria, nome, unidade],
    );

    res.status(201).json({
      id_item: result.insertId,
      id_categoria,
      nome,
      unidade,
    });
  } catch (err) {
    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ erro: "Categoria não existe" });
    }
    next(err);
  }
});

export default router;
