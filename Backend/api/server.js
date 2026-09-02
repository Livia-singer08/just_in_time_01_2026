require("dotenv").config();

const express = require("express");
const cors = require("cors");

const usuarioRoutes = require("./src/routes/usuario.routes");
const produtoRoutes = require("./src/routes/produto.routes");
const producaoRoutes = require("./src/routes/producao.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", usuarioRoutes);
app.use("/api", produtoRoutes);
app.use("/api", producaoRoutes);

app.get("/", (req, res) => {
    res.json({
        mensagem: "API Just in Time funcionando"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});