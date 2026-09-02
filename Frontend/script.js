const API_URL = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", () => {
    carregarUsuario();
    carregarResumo();

    const logout = document.querySelector("#logout");

    if (logout) {
        logout.addEventListener("click", realizarLogout);
    }
});

function carregarUsuario() {
    const nome =
        localStorage.getItem("nomeUsuario") ||
        "Usuário";

    const elemento =
        document.querySelector("#nome-usuario");

    if (elemento) {
        elemento.textContent = nome;
    }
}

async function carregarResumo() {
    try {
        const resposta = await fetch(
            `${API_URL}/produto/listar`
        );

        if (!resposta.ok) {
            throw new Error("Erro ao buscar produtos.");
        }

        const produtos = await resposta.json();

        const totalProdutos = produtos.length;

        const totalEstoque = produtos.reduce(
            (total, produto) =>
                total + Number(produto.quantidadeEstoque || 0),
            0
        );

        const estoqueBaixo = produtos.filter(
            produto =>
                Number(produto.quantidadeEstoque) <=
                Number(produto.estoqueMinimo)
        ).length;

        const elementoTotalProdutos =
            document.querySelector("#total-produtos");

        const elementoTotalEstoque =
            document.querySelector("#total-estoque");

        const elementoEstoqueBaixo =
            document.querySelector("#estoque-baixo");

        if (elementoTotalProdutos) {
            elementoTotalProdutos.textContent =
                totalProdutos;
        }

        if (elementoTotalEstoque) {
            elementoTotalEstoque.textContent =
                totalEstoque;
        }

        if (elementoEstoqueBaixo) {
            elementoEstoqueBaixo.textContent =
                estoqueBaixo;
        }

    } catch (erro) {
        console.error(erro);
    }
}

function realizarLogout() {
    localStorage.removeItem("nomeUsuario");
    localStorage.removeItem("usuario");

    window.location.href = "login.html";
}