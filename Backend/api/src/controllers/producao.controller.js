const prisma = require("../data/prisma");

const cadastrarProducao = async (req, res) => {
    try {
        const {
            tipo,
            quantidade,
            data_movimentacao,
            produtoId,
            usuarioId
        } = req.body;

        if (
            !tipo ||
            !quantidade ||
            !data_movimentacao ||
            !produtoId ||
            !usuarioId
        ) {
            return res.status(400).json({
                mensagem: "Preencha todos os campos"
            });
        }

        if (tipo !== "FABRICADO" && tipo !== "PEDIDO") {
            return res.status(400).json({
                mensagem: "Tipo de movimentação inválido"
            });
        }

        const qtd = Number(quantidade);

        if (qtd <= 0) {
            return res.status(400).json({
                mensagem: "A quantidade deve ser maior que zero"
            });
        }

        const produto = await prisma.produto.findUnique({
            where: {
                id: Number(produtoId)
            }
        });

        if (!produto) {
            return res.status(404).json({
                mensagem: "Produto não encontrado"
            });
        }

        const usuario = await prisma.usuario.findUnique({
            where: {
                id: Number(usuarioId)
            }
        });

        if (!usuario) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado"
            });
        }

        let novoEstoque;

        if (tipo === "FABRICADO") {
            novoEstoque = produto.quantidade_estoque + qtd;
        } else {
            novoEstoque = produto.quantidade_estoque - qtd;

            if (novoEstoque < 0) {
                return res.status(400).json({
                    mensagem: "Estoque insuficiente"
                });
            }
        }

        const producao = await prisma.$transaction(async (tx) => {

            const novaProducao = await tx.producao.create({
                data: {
                    tipo: tipo,
                    quantidade: qtd,
                    data_movimentacao: new Date(data_movimentacao),
                    produtoId: Number(produtoId),
                    usuarioId: Number(usuarioId)
                },
                include: {
                    produto: true,
                    usuario: {
                        select: {
                            id: true,
                            nome: true,
                            email: true,
                            perfil: true
                        }
                    }
                }
            });

            await tx.produto.update({
                where: {
                    id: Number(produtoId)
                },
                data: {
                    quantidade_estoque: novoEstoque
                }
            });

            return novaProducao;
        });

        return res.status(201).json({
            mensagem: "Produção cadastrada com sucesso",
            producao: producao
        });

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: "Erro ao cadastrar produção"
        });
    }
};


const listarProducoes = async (req, res) => {
    try {
        const producoes = await prisma.producao.findMany({
            include: {
                produto: true,
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        perfil: true
                    }
                }
            },
            orderBy: {
                data_movimentacao: "desc"
            }
        });

        return res.status(200).json(producoes);

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: "Erro ao listar produções"
        });
    }
};


const buscarProducao = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                mensagem: "ID inválido"
            });
        }

        const producao = await prisma.producao.findUnique({
            where: {
                id: id
            },
            include: {
                produto: true,
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        perfil: true
                    }
                }
            }
        });

        if (!producao) {
            return res.status(404).json({
                mensagem: "Produção não encontrada"
            });
        }

        return res.status(200).json(producao);

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: "Erro ao buscar produção"
        });
    }
};


const atualizarProducao = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                mensagem: "ID inválido"
            });
        }

        const producaoExistente = await prisma.producao.findUnique({
            where: {
                id: id
            }
        });

        if (!producaoExistente) {
            return res.status(404).json({
                mensagem: "Produção não encontrada"
            });
        }

        const {
            tipo,
            quantidade,
            data_movimentacao,
            produtoId,
            usuarioId
        } = req.body;

        if (
            !tipo ||
            !quantidade ||
            !data_movimentacao ||
            !produtoId ||
            !usuarioId
        ) {
            return res.status(400).json({
                mensagem: "Preencha todos os campos"
            });
        }

        if (tipo !== "FABRICADO" && tipo !== "PEDIDO") {
            return res.status(400).json({
                mensagem: "Tipo de movimentação inválido"
            });
        }

        const qtd = Number(quantidade);

        if (qtd <= 0) {
            return res.status(400).json({
                mensagem: "A quantidade deve ser maior que zero"
            });
        }

        const produto = await prisma.produto.findUnique({
            where: {
                id: Number(produtoId)
            }
        });

        if (!produto) {
            return res.status(404).json({
                mensagem: "Produto não encontrado"
            });
        }

        const usuario = await prisma.usuario.findUnique({
            where: {
                id: Number(usuarioId)
            }
        });

        if (!usuario) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado"
            });
        }

        const produtoAntigo = await prisma.produto.findUnique({
            where: {
                id: producaoExistente.produtoId
            }
        });

        let estoqueCorrigido =
            produtoAntigo.quantidade_estoque;

        if (producaoExistente.tipo === "FABRICADO") {
            estoqueCorrigido -= producaoExistente.quantidade;
        } else {
            estoqueCorrigido += producaoExistente.quantidade;
        }

        if (tipo === "FABRICADO") {
            estoqueCorrigido += qtd;
        } else {
            estoqueCorrigido -= qtd;
        }

        if (estoqueCorrigido < 0) {
            return res.status(400).json({
                mensagem: "Estoque insuficiente para essa alteração"
            });
        }

        const producaoAtualizada = await prisma.$transaction(async (tx) => {

            const atualizada = await tx.producao.update({
                where: {
                    id: id
                },
                data: {
                    tipo: tipo,
                    quantidade: qtd,
                    data_movimentacao: new Date(data_movimentacao),
                    produtoId: Number(produtoId),
                    usuarioId: Number(usuarioId)
                },
                include: {
                    produto: true,
                    usuario: {
                        select: {
                            id: true,
                            nome: true,
                            email: true,
                            perfil: true
                        }
                    }
                }
            });

            await tx.produto.update({
                where: {
                    id: Number(produtoId)
                },
                data: {
                    quantidade_estoque: estoqueCorrigido
                }
            });

            return atualizada;
        });

        return res.status(200).json({
            mensagem: "Produção atualizada com sucesso",
            producao: producaoAtualizada
        });

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: "Erro ao atualizar produção"
        });
    }
};

const excluirProducao = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                mensagem: "ID inválido"
            });
        }

        const producao = await prisma.producao.findUnique({
            where: {
                id: id
            }
        });

        if (!producao) {
            return res.status(404).json({
                mensagem: "Produção não encontrada"
            });
        }

        const produto = await prisma.produto.findUnique({
            where: {
                id: producao.produtoId
            }
        });

        if (!produto) {
            return res.status(404).json({
                mensagem: "Produto relacionado não encontrado"
            });
        }

        let novoEstoque = produto.quantidade_estoque;

        if (producao.tipo === "FABRICADO") {
            novoEstoque -= producao.quantidade;

            if (novoEstoque < 0) {
                return res.status(400).json({
                    mensagem: "Não é possível excluir. O estoque ficaria negativo."
                });
            }
        } else if (producao.tipo === "PEDIDO") {
            novoEstoque += producao.quantidade;
        }

        await prisma.$transaction(async (tx) => {

            await tx.producao.delete({
                where: {
                    id: id
                }
            });

            await tx.produto.update({
                where: {
                    id: producao.produtoId
                },
                data: {
                    quantidade_estoque: novoEstoque
                }
            });

        });

        return res.status(200).json({
            mensagem: "Produção excluída com sucesso",
            estoqueAtual: novoEstoque
        });

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: "Erro ao excluir produção"
        });
    }
};


module.exports = {
    cadastrarProducao,
    listarProducoes,
    buscarProducao,
    atualizarProducao,
    excluirProducao
};