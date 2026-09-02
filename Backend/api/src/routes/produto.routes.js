const express = require("express");

const router = express.Router();

const {
    cadastrarProduto,
    listarProdutos,
    buscarProdutoPorId,
    atualizarProduto,
    excluirProduto
} = require("../controllers/produto.controller");

router.post("/produto/cadastrar", cadastrarProduto);
router.get("/produto/listar", listarProdutos);
router.get("/produto/:id", buscarProdutoPorId);
router.put("/produto/:id", atualizarProduto);
router.delete("/produto/:id", excluirProduto);

module.exports = router;