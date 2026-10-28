
//
// FASE 1: Modelagem dos dados (Classe Base)
//
class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade);
    }

    // Método que calcula o subtotal do produto
    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

//
// FASE 2: Gerenciamento de Estado (Memória e Edição)
//
const listaDeProdutos = [];

let indiceEdicao = null;

const CHAVE_STORAGE = "sistema_estoque_produtos";

//
// FASE 2.1: Persistência com localStorage
//
function salvarNoLocalStorage() {
    const listaEmTexto = JSON.stringify(listaDeProdutos);
    localStorage.setItem(CHAVE_STORAGE, listaEmTexto);
}

function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    if (dadosSalvos) {
        const produtosObjetos = JSON.parse(dadosSalvos);

        produtosObjetos.forEach((prod) => {
            const produtoInstanciado = new Produto(
                prod.nome,
                prod.preco,
                prod.quantidade
            );

            listaDeProdutos.push(produtoInstanciado);
        });
    }
}

//
// FASE 3: Captura de Elementos do DOM
//
const formProduto = document.getElementById("produto-form");
const btnSubmit = formProduto.querySelector("button[type='submit']");
const btnLimparTudo = document.getElementById("limpar-tabela");
const totalEstoqueEl = document.getElementById("total-estoque");
const campoBusca = document.getElementById("campo-busca");

//
// FASE 4: Transferir Estado para Modo Edição
//
function prepararEdicao(index) {
    const produto = listaDeProdutos[index];

    document.getElementById("nome").value = produto.nome;
    document.getElementById("preco").value = produto.preco;
    document.getElementById("quantidade").value = produto.quantidade;

    indiceEdicao = index;
    btnSubmit.textContent = "Salvar Alterações";
    btnSubmit.classList.add("btn-warning");
}

//
// FASE 5: Escuta de Eventos
//

// 1. Cadastro e edição de produtos
formProduto.addEventListener("submit", function (event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const preco = parseFloat(document.getElementById("preco").value);
    const quantidade = parseInt(
        document.getElementById("quantidade").value
    );

    // Validação do nome
    if (!nome) {
        alert("Por favor, informe um nome válido para o produto.");
        return;
    }

    // Validação do preço e da quantidade
    if (
        isNaN(preco) || preco <= 0 ||
        isNaN(quantidade) || quantidade <= 0
    ) {
        alert("O preço e a quantidade devem ser maiores que zero.");
        return;
    }

    const produtoValido = new Produto(nome, preco, quantidade);

    if (indiceEdicao === null) {
        listaDeProdutos.push(produtoValido);
    } else {
        listaDeProdutos[indiceEdicao] = produtoValido;

        indiceEdicao = null;
        btnSubmit.textContent = "Adicionar Produto";
        btnSubmit.classList.remove("btn-warning");
    }

    salvarNoLocalStorage();
    formProduto.reset();
    atualizarInterface();
});

// 2. Limpar todos os produtos
btnLimparTudo.addEventListener("click", function () {
    if (listaDeProdutos.length === 0) {
        alert("A tabela já está vazia!");
        return;
    }

    if (confirm("Tem certeza que deseja remover todos os produtos?")) {
        listaDeProdutos.length = 0;
        localStorage.removeItem(CHAVE_STORAGE);

        indiceEdicao = null;
        btnSubmit.textContent = "Adicionar Produto";
        btnSubmit.classList.remove("btn-warning");

        formProduto.reset();
        atualizarInterface();
    }
});

// 3. Pesquisa dinâmica da V4
campoBusca.addEventListener("input", function () {
    atualizarInterface();
});

//
// FASE 6: Funções de Atualização e Renderização
//

// 1. Filtrar produtos pelo nome
function obterProdutosFiltrados() {
    const termo = campoBusca.value.toLowerCase().trim();

    return listaDeProdutos.filter(function (produto) {
        return produto.nome.toLowerCase().includes(termo);
    });
}

// 2. Remover produto
function removerProduto(index) {
    listaDeProdutos.splice(index, 1);

    if (indiceEdicao === index) {
        indiceEdicao = null;
        btnSubmit.textContent = "Adicionar Produto";
        btnSubmit.classList.remove("btn-warning");
        formProduto.reset();
    } else if (indiceEdicao !== null && indiceEdicao > index) {
        indiceEdicao--;
    }

    salvarNoLocalStorage();
    atualizarInterface();
}

// 3. Calcular o total financeiro dos produtos visíveis
function atualizarTotalEstoque(produtosVisiveis) {
    const total = produtosVisiveis.reduce(function (acc, produto) {
        return acc + produto.calcularSubtotal();
    }, 0);

    totalEstoqueEl.textContent =
        `Total em Estoque: R$ ${total.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
}

// 4. Renderizar a tabela com os produtos filtrados
function renderizarTabela(produtosVisiveis) {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");
    tabelaBody.innerHTML = "";

    // Mensagem caso nenhum produto seja encontrado
    if (produtosVisiveis.length === 0) {
        const linha = document.createElement("tr");
        const celula = document.createElement("td");

        celula.colSpan = 5;
        celula.classList.add("mensagem-vazia");
        celula.textContent = campoBusca.value.trim()
            ? "Nenhum produto encontrado."
            : "Nenhum produto cadastrado.";

        linha.appendChild(celula);
        tabelaBody.appendChild(linha);
        return;
    }

    produtosVisiveis.forEach(function (produto) {
        // Encontrar o índice original para editar e remover corretamente
        const index = listaDeProdutos.indexOf(produto);

        const linha = document.createElement("tr");

        // Criar as células sem inserir o nome como HTML
        const celulaNome = document.createElement("td");
        celulaNome.textContent = produto.nome;

        const celulaPreco = document.createElement("td");
        celulaPreco.textContent =
            `R$ ${produto.preco.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;

        const celulaQuantidade = document.createElement("td");
        celulaQuantidade.textContent = produto.quantidade;

        const celulaSubtotal = document.createElement("td");
        celulaSubtotal.textContent =
            `R$ ${produto.calcularSubtotal().toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;

        const celulaAcoes = document.createElement("td");

        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";
        btnEditar.classList.add("btn-editar");
        btnEditar.addEventListener("click", function () {
            prepararEdicao(index);
        });

        const btnRemover = document.createElement("button");
        btnRemover.textContent = "Remover";
        btnRemover.classList.add("btn-remover");
        btnRemover.addEventListener("click", function () {
            removerProduto(index);
        });

        celulaAcoes.appendChild(btnEditar);
        celulaAcoes.appendChild(btnRemover);

        linha.appendChild(celulaNome);
        linha.appendChild(celulaPreco);
        linha.appendChild(celulaQuantidade);
        linha.appendChild(celulaSubtotal);
        linha.appendChild(celulaAcoes);

        tabelaBody.appendChild(linha);
    });
}

// 5. Atualizar toda a interface
function atualizarInterface() {
    const produtosVisiveis = obterProdutosFiltrados();

    renderizarTabela(produtosVisiveis);
    atualizarTotalEstoque(produtosVisiveis);
}

//
// FASE 7: Inicialização da Aplicação
//
carregarDoLocalStorage();
atualizarInterface();
