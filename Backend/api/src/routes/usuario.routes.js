const express = require("express");

const router = express.Router();

const {
    cadastrarUsuario,
    listarUsuarios,
    buscarUsuarioPorId,
    usuarioLogin
} = require("../controllers/usuario.controller");

router.post("/usuario/cadastrar", cadastrarUsuario);
router.get("/usuario/listar", listarUsuarios);
router.get("/usuario/:id", buscarUsuarioPorId);
router.post("/usuario/login", usuarioLogin);

module.exports = router;