import { Router } from "express";
import { pool } from "../db.js";
import { dataValida, inteiroPositivo, texto } from "../validacao.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        d.id_doacao,
        d.data_doacao,
        d.observacao,
        d.criado_em,
        dr.id_doador,
        dr.nome AS doador,
        COUNT(di.id_item) AS total_itens,
        COALESCE(SUM(di.quantidade), 0) AS total_unidades
      FROM doacao d
      JOIN doador dr ON dr.id_doador = d.id_doador
      LEFT JOIN doacao_item di ON di.id_doacao = d.id_doacao
      GROUP BY d.id_doacao
      ORDER BY d.data_doacao DESC, d.id_doacao DESC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = inteiroPositivo(req.params.id);
    if (!id) return res.status(400).json({ erro: "ID inválido" });

    const [doacoes] = await pool.query(
      `
      SELECT
        d.id_doacao,
        d.data_doacao,
        d.observacao,
        d.criado_em,
        dr.id_doador,
        dr.nome AS doador
      FROM doacao d
      JOIN doador dr ON dr.id_doador = d.id_doador
      WHERE d.id_doacao = ?
    `,
      [id],
    );
    if (doacoes.length === 0) {
      return res.status(404).json({ erro: "Doação não encontrada" });
    }

    const [itens] = await pool.query(
      `
      SELECT
        di.id_item,
        i.nome,
        i.unidade,
        c.nome AS categoria,
        di.quantidade
      FROM doacao_item di
      JOIN item i ON i.id_item = di.id_item
      JOIN categoria c ON c.id_categoria = i.id_categoria
      WHERE di.id_doacao = ?
      ORDER BY i.nome
    `,
      [id],
    );

    res.json({ ...doacoes[0], itens });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  const id_doador = inteiroPositivo(req.body.id_doador);
  if (!id_doador) return res.status(400).json({ erro: "Doador inválido" });

  const data_doacao = dataValida(req.body.data_doacao);
  if (!data_doacao) {
    return res.status(400).json({ erro: "Data inválida (use o formato YYYY-MM-DD)" });
  }

  const itens = req.body.itens;
  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ erro: "Informe pelo menos um item" });
  }

  const itensValidados = [];
  const vistos = new Set();
  for (const entrada of itens) {
    const id_item = inteiroPositivo(entrada?.id_item);
    const quantidade = inteiroPositivo(entrada?.quantidade);
    if (!id_item || !quantidade) {
      return res.status(400).json({
        erro: "Cada item precisa de id_item e quantidade inteiros positivos",
      });
    }
    if (vistos.has(id_item)) {
      return res.status(400).json({ erro: "Não repita o mesmo item na mesma doação" });
    }
    vistos.add(id_item);
    itensValidados.push({ id_item, quantidade });
  }

  const observacao = texto(req.body.observacao);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      "INSERT INTO doacao (id_doador, data_doacao, observacao) VALUES (?, ?, ?)",
      [id_doador, data_doacao, observacao],
    );
    const id_doacao = result.insertId;

    for (const item of itensValidados) {
      await conn.query(
        "INSERT INTO doacao_item (id_doacao, id_item, quantidade) VALUES (?, ?, ?)",
        [id_doacao, item.id_item, item.quantidade],
      );
    }

    await conn.commit();
    res.status(201).json({
      id_doacao,
      id_doador,
      data_doacao,
      observacao,
      itens: itensValidados,
    });
  } catch (err) {
    await conn.rollback();
    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ erro: "Doador ou item não encontrado" });
    }
    next(err);
  } finally {
    conn.release();
  }
});

export default router;
