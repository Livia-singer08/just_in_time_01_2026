const express = require("express");

const router = express.Router();

const {
    cadastrarProducao,
    listarProducoes,
    buscarProducao,
    atualizarProducao,
    excluirProducao
} = require("../controllers/producao.controller");

router.post("/producao/cadastrar", cadastrarProducao);
router.get("/producao/listar", listarProducoes);
router.get("/producao/buscar/:id", buscarProducao);
router.put("/producao/atualizar/:id", atualizarProducao);
router.delete("/producao/excluir/:id", excluirProducao);

module.exports = router;