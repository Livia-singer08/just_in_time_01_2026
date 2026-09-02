const API_URL = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.querySelector("#form-login");

    if (formulario) {
        formulario.addEventListener("submit", realizarLogin);
    }
});

async function realizarLogin(event) {
    event.preventDefault();

    const email = document.querySelector("#email").value.trim();
    const senha = document.querySelector("#senha").value;

    if (!email || !senha) {
        mostrarMensagem("Preencha o e-mail e a senha.", "erro");
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/usuario/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                senha
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            mostrarMensagem(
                dados.mensagem || "E-mail ou senha inválidos.",
                "erro"
            );
            return;
        }

        const usuario = dados.usuario;

        localStorage.setItem(
            "nomeUsuario",
            usuario.nome
        );

        localStorage.setItem(
            "usuario",
            JSON.stringify(usuario)
        );

        mostrarMensagem(
            "Login realizado com sucesso!",
            "sucesso"
        );

        setTimeout(() => {
            window.location.href = "index.html";
        }, 500);

    } catch (erro) {
        console.error(erro);

        mostrarMensagem(
            "Não foi possível conectar ao servidor.",
            "erro"
        );
    }
}

function mostrarMensagem(texto, tipo) {
    const elemento = document.querySelector("#mensagem-login");

    if (!elemento) {
        return;
    }

    elemento.textContent = texto;
    elemento.className = `mensagem ${tipo}`;
}