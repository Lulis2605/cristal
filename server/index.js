import "dotenv/config";
import express from "express";
import { pool } from "./db.js";
import doadoresRouter from "./routes/doadores.js";
import itensRouter from "./routes/itens.js";
import doacoesRouter from "./routes/doacoes.js";

const app = express();
app.use(express.json());

app.get("/api/health", async (req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "ok",
      banco: "ok",
      app: "Cristal",
      hora: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

app.use("/api/doadores", doadoresRouter);
app.use("/api/itens", itensRouter);
app.use("/api/doacoes", doacoesRouter);

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ erro: "Erro interno no servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
