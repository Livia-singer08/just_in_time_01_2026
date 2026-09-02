const prisma = require("../data/prisma");

const cadastrarProduto = async (req, res) => {
    try {
        const {
            nome,
            descricao,
            custo,
            quantidade_estoque,
            estoque_minimo
        } = req.body;

        if (
            !nome ||
            custo === undefined ||
            quantidade_estoque === undefined ||
            estoque_minimo === undefined
        ) {
            return res.status(400).json({
                mensagem: "Nome, custo, quantidade em estoque e estoque mínimo são obrigatórios"
            });
        }

        const produto = await prisma.produto.create({
            data: {
                nome,
                descricao: descricao || null,
                custo: Number(custo),
                quantidade_estoque: Number(quantidade_estoque),
                estoque_minimo: Number(estoque_minimo)
            }
        });

        return res.status(201).json({
            mensagem: "Produto cadastrado com sucesso",
            produto
        });

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: "Erro ao cadastrar produto"
        });
    }
};


const listarProdutos = async (req, res) => {
    try {
        const produtos = await prisma.produto.findMany({
            orderBy: {
                id: "asc"
            }
        });

        return res.status(200).json(produtos);

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: "Erro ao listar produtos"
        });
    }
};


const buscarProdutoPorId = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                mensagem: "ID inválido"
            });
        }

        const produto = await prisma.produto.findUnique({
            where: {
                id
            }
        });

        if (!produto) {
            return res.status(404).json({
                mensagem: "Produto não encontrado"
            });
        }

        return res.status(200).json(produto);

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: "Erro ao buscar produto"
        });
    }
};


const atualizarProduto = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                mensagem: "ID inválido"
            });
        }

        const {
            nome,
            descricao,
            custo,
            quantidade_estoque,
            estoque_minimo
        } = req.body;

        const produtoExistente = await prisma.produto.findUnique({
            where: {
                id
            }
        });

        if (!produtoExistente) {
            return res.status(404).json({
                mensagem: "Produto não encontrado"
            });
        }

        const produto = await prisma.produto.update({
            where: {
                id
            },
            data: {
                nome: nome ?? produtoExistente.nome,
                descricao: descricao ?? produtoExistente.descricao,
                custo: custo !== undefined
                    ? Number(custo)
                    : produtoExistente.custo,
                quantidade_estoque: quantidade_estoque !== undefined
                    ? Number(quantidade_estoque)
                    : produtoExistente.quantidade_estoque,
                estoque_minimo: estoque_minimo !== undefined
                    ? Number(estoque_minimo)
                    : produtoExistente.estoque_minimo
            }
        });

        return res.status(200).json({
            mensagem: "Produto atualizado com sucesso",
            produto
        });

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: "Erro ao atualizar produto"
        });
    }
};


const excluirProduto = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                mensagem: "ID inválido"
            });
        }

        const produto = await prisma.produto.findUnique({
            where: {
                id
            }
        });

        if (!produto) {
            return res.status(404).json({
                mensagem: "Produto não encontrado"
            });
        }

        const movimentacoes = await prisma.producao.findFirst({
            where: {
                produtoId: id
            }
        });

        if (movimentacoes) {
            return res.status(400).json({
                mensagem: "Não é possível excluir um produto que possui movimentações de produção"
            });
        }

        await prisma.produto.delete({
            where: {
                id
            }
        });

        return res.status(200).json({
            mensagem: "Produto excluído com sucesso"
        });

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: "Erro ao excluir produto"
        });
    }
};


module.exports = {
    cadastrarProduto,
    listarProdutos,
    buscarProdutoPorId,
    atualizarProduto,
    excluirProduto
};