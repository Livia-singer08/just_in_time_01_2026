const API_URL = "http://localhost:3000/api";

let produtos = [];
let movimentacoes = [];

document.addEventListener("DOMContentLoaded", () => {
    definirDataAtual();
    carregarDados();
    configurarEventos();
});

function configurarEventos() {
    const form = document.querySelector("#form-producao");
    const logout = document.querySelector("#logout");

    if (form) {
        form.addEventListener("submit", registrarMovimentacao);
    }

    if (logout) {
        logout.addEventListener("click", realizarLogout);
    }
}

function definirDataAtual() {
    const campoData = document.querySelector("#data");

    if (!campoData.value) {
        const hoje = new Date();

        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, "0");
        const dia = String(hoje.getDate()).padStart(2, "0");

        campoData.value = `${ano}-${mes}-${dia}`;
    }
}

async function carregarDados() {
    await carregarProdutos();
    await carregarMovimentacoes();
}

async function carregarProdutos() {
    try {
        const resposta = await fetch(`${API_URL}/produto/listar`);

        if (!resposta.ok) {
            throw new Error("Erro ao carregar produtos.");
        }

        produtos = await resposta.json();

        ordenarProdutos();
        preencherSelectProdutos();
        exibirEstoque();

    } catch (erro) {
        console.error(erro);

        mostrarMensagem(
            "Não foi possível carregar os produtos.",
            "erro"
        );
    }
}

function ordenarProdutos() {
    produtos.sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR")
    );
}

function preencherSelectProdutos() {
    const select = document.querySelector("#produto");

    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">
            Selecione um produto
        </option>
    `;

    produtos.forEach(produto => {
        const option = document.createElement("option");

        option.value = produto.id;
        option.textContent = produto.nome;

        select.appendChild(option);
    });
}

function exibirEstoque() {
    const lista = document.querySelector("#lista-estoque");

    if (!lista) {
        return;
    }

    lista.innerHTML = "";

    produtos.forEach(produto => {
        const estoqueBaixo =
            Number(produto.quantidadeEstoque) <=
            Number(produto.estoqueMinimo);

        const item = document.createElement("div");

        item.className = "estoque-item";

        if (estoqueBaixo) {
            item.classList.add("estoque-baixo");
        }

        item.innerHTML = `
            <div class="estoque-item-info">
                <strong>${produto.nome}</strong>

                <span>
                    Mínimo:
                    ${produto.estoqueMinimo}
                    unidades
                </span>
            </div>

            <div class="estoque-quantidade">
                <strong>
                    ${produto.quantidadeEstoque}
                </strong>

                <span>
                    unidades
                </span>
            </div>
        `;

        lista.appendChild(item);
    });
}

async function registrarMovimentacao(event) {
    event.preventDefault();

    const produtoId = Number(
        document.querySelector("#produto").value
    );

    const tipo =
        document.querySelector("#tipo").value;

    const quantidade = Number(
        document.querySelector("#quantidade").value
    );

    const data =
        document.querySelector("#data").value;

    if (!produtoId) {
        mostrarMensagem(
            "Selecione um produto.",
            "erro"
        );

        return;
    }

    if (!tipo) {
        mostrarMensagem(
            "Selecione o tipo de movimentação.",
            "erro"
        );

        return;
    }

    if (!quantidade || quantidade <= 0) {
        mostrarMensagem(
            "Informe uma quantidade válida.",
            "erro"
        );

        return;
    }

    if (!data) {
        mostrarMensagem(
            "Informe a data da movimentação.",
            "erro"
        );

        return;
    }

    const produto = produtos.find(
        item => Number(item.id) === produtoId
    );

    if (!produto) {
        mostrarMensagem(
            "Produto não encontrado.",
            "erro"
        );

        return;
    }

    if (
        tipo === "PEDIDO" &&
        quantidade > Number(produto.quantidadeEstoque)
    ) {
        mostrarMensagem(
            "Não há estoque suficiente para realizar este pedido.",
            "erro"
        );

        return;
    }

    const usuarioId =
        Number(localStorage.getItem("usuarioId")) || 1;

    const dados = {
        produtoId,
        usuarioId,
        tipo,
        quantidade,
        data
    };

    try {
        const resposta = await fetch(
            `${API_URL}/producao/movimentacao`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            }
        );

        if (!resposta.ok) {
            const erro =
                await resposta.json().catch(() => null);

            throw new Error(
                erro?.mensagem ||
                erro?.message ||
                "Erro ao registrar movimentação."
            );
        }

        await resposta.json();

        document.querySelector("#form-producao").reset();

        definirDataAtual();

        await carregarDados();

        const produtoAtualizado = produtos.find(
            item => Number(item.id) === produtoId
        );

        mostrarMensagem(
            tipo === "FABRICADO"
                ? "Produção registrada com sucesso!"
                : "Pedido registrado com sucesso!",
            "sucesso"
        );

        if (produtoAtualizado) {
            verificarEstoqueMinimo(produtoAtualizado);
        }

    } catch (erro) {
        console.error(erro);

        mostrarMensagem(
            erro.message ||
            "Não foi possível registrar a movimentação.",
            "erro"
        );
    }
}

function verificarEstoqueMinimo(produto) {
    const estoque =
        Number(produto.quantidadeEstoque);

    const minimo =
        Number(produto.estoqueMinimo);

    if (estoque <= minimo) {
        setTimeout(() => {
            alert(
                `ATENÇÃO AO ESTOQUE!\n\n` +
                `Produto: ${produto.nome}\n` +
                `Estoque atual: ${estoque} unidades\n` +
                `Estoque mínimo: ${minimo} unidades\n\n` +
                `É necessário programar uma nova produção.`
            );
        }, 300);
    }
}

async function carregarMovimentacoes() {
    try {
        const resposta = await fetch(
            `${API_URL}/producao/historico`
        );

        if (!resposta.ok) {
            throw new Error(
                "Erro ao carregar movimentações."
            );
        }

        movimentacoes = await resposta.json();

        exibirHistorico();

    } catch (erro) {
        console.error(erro);

        const tabela =
            document.querySelector("#tabela-historico");

        if (tabela) {
            tabela.innerHTML = `
                <tr>
                    <td colspan="6">
                        Nenhuma movimentação encontrada.
                    </td>
                </tr>
            `;
        }
    }
}

function exibirHistorico() {
    const tabela =
        document.querySelector("#tabela-historico");

    if (!tabela) {
        return;
    }

    tabela.innerHTML = "";

    if (movimentacoes.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="6">
                    Nenhuma movimentação registrada.
                </td>
            </tr>
        `;

        return;
    }

    movimentacoes.forEach(movimentacao => {
        const tr = document.createElement("tr");

        const tipoFabricado =
            movimentacao.tipo === "FABRICADO";

        const classe =
            tipoFabricado
                ? "tipo-fabricado"
                : "tipo-pedido";

        const nomeProduto =
            movimentacao.produto?.nome ||
            movimentacao.nomeProduto ||
            "Produto";

        const nomeUsuario =
            movimentacao.usuario?.nome ||
            movimentacao.nomeUsuario ||
            localStorage.getItem("nomeUsuario") ||
            "Usuário";

        tr.innerHTML = `
            <td>
                ${movimentacao.id}
            </td>

            <td>
                ${nomeProduto}
            </td>

            <td>
                <span class="${classe}">
                    ${
                        tipoFabricado
                            ? "FABRICADO"
                            : "PEDIDO"
                    }
                </span>
            </td>

            <td>
                ${movimentacao.quantidade}
            </td>

            <td>
                ${formatarData(movimentacao.data)}
            </td>

            <td>
                ${nomeUsuario}
            </td>
        `;

        tabela.appendChild(tr);
    });
}

function formatarData(data) {
    if (!data) {
        return "-";
    }

    const dataObj = new Date(data);

    if (isNaN(dataObj.getTime())) {
        return data;
    }

    return dataObj.toLocaleDateString("pt-BR");
}

function mostrarMensagem(texto, tipo) {
    const existente =
        document.querySelector(".alerta");

    if (existente) {
        existente.remove();
    }

    const alerta =
        document.createElement("div");

    alerta.className = `alerta ${tipo}`;
    alerta.textContent = texto;

    document.body.appendChild(alerta);

    setTimeout(() => {
        alerta.remove();
    }, 3500);
}

function realizarLogout() {
    localStorage.removeItem("nomeUsuario");
    localStorage.removeItem("usuario");
    localStorage.removeItem("usuarioId");

    window.location.href = "login.html";
}