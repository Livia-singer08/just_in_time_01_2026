const prisma = require("../data/prisma");

const cadastrarUsuario = async (req, res) => {
    try {
        const { nome, email, senha, perfil } = req.body;

        if (!nome || !email || !senha || !perfil) {
            return res.status(400).json({
                mensagem: "Preencha todos os campos"
            });
        }

        const usuarioExistente = await prisma.usuario.findUnique({
            where: {
                email: email
            }
        });

        if (usuarioExistente) {
            return res.status(409).json({
                mensagem: "E-mail já cadastrado"
            });
        }

        const usuario = await prisma.usuario.create({
            data: {
                nome: nome,
                email: email,
                senha: senha,
                perfil: perfil
            }
        });

        return res.status(201).json({
            mensagem: "Usuário cadastrado com sucesso",
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil
            }
        });

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: "Erro ao cadastrar usuário"
        });
    }
};


const listarUsuarios = async (req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany({
            select: {
                id: true,
                nome: true,
                email: true,
                perfil: true
            }
        });

        return res.status(200).json(usuarios);

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: "Erro ao listar usuários"
        });
    }
};


const buscarUsuarioPorId = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                mensagem: "ID inválido"
            });
        }

        const usuario = await prisma.usuario.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                nome: true,
                email: true,
                perfil: true
            }
        });

        if (!usuario) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado"
            });
        }

        return res.status(200).json(usuario);

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: "Erro ao buscar usuário"
        });
    }
};


const usuarioLogin = async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                mensagem: "E-mail e senha são obrigatórios"
            });
        }

        const usuario = await prisma.usuario.findUnique({
            where: {
                email: email
            }
        });

        if (!usuario) {
            return res.status(401).json({
                mensagem: "E-mail ou senha inválidos"
            });
        }

        if (usuario.senha !== senha) {
            return res.status(401).json({
                mensagem: "E-mail ou senha inválidos"
            });
        }

        return res.status(200).json({
            mensagem: "Login realizado com sucesso",
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil
            }
        });

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: "Erro interno do servidor"
        });
    }
};


module.exports = {
    cadastrarUsuario,
    listarUsuarios,
    buscarUsuarioPorId,
    usuarioLogin
};