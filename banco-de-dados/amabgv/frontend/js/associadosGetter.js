document.addEventListener('DOMContentLoaded', function() {
    const filtroInput = document.getElementById('filtroAssociados');
    filtroInput.addEventListener('input', function() {
        loadAssociados(filtroInput.value);
    });

    loadAssociados();
});

function loadAssociados(filtro = '')  {
    fetch(`../backend/associadosGetter.php?filtro=${filtro}`)	
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao tentar carregar os dados dos associados');
        }
        return response.json()
    })
    .then(data => {
        // Captura o corpo da tabela
        const tbody = document.getElementById("table_content");

        // Limpa o conteúdo atual da tabela (se houver)
        tbody.innerHTML = '';

        if (data.error) {
            // Exibe a mensagem de erro se houver
            console.error(data.error);
            tbody.innerHTML = `<tr><td colspan="6">${data.error}</td></tr>`;
        } else {
            // Itera sobre os dados e adiciona as linhas na tabela
            data.forEach(associado => {
                associado = normalizeAssociado(associado);
                const row = document.createElement('tr');

                // Cria células com os dados de cada associado
                row.innerHTML = `
                    <td>${associado.Nome}</td>
                    <td>${mascaraCPFVisualizacao(associado.CPF)}</td>
                    <td>${associado.Sexo}</td>
                    <td>${associado.Email}</td>
                    <td>${associado.Telefone}</td>
                    <td>
                        <button class="btn btn-warning btn-edit btn-sm" data-id="${associado.CPF}"><i class="fa-regular fa-pen-to-square"></i></button>
                        <button class="btn btn-danger btn-delete btn-sm" data-id="${associado.CPF}"><i class="fa-regular fa-trash-can"></i></button>
                    </td>
                `;

                // Adiciona a linha à tabela
                tbody.appendChild(row);
            });

            // Adiciona evento de clique para os botões de edição
            document.querySelectorAll('.btn-edit').forEach(button => {
                button.addEventListener('click', function() {
                    const cpf = this.getAttribute('data-id');
                    const associado = data.find(a => a.CPF === cpf);
                    if (associado) {
                        document.getElementById('nome').value = associado.Nome;
                        document.getElementById('identidadeGenero').value = normalizeIdentidadeGeneroEdit(associado.Sexo);
                        document.getElementById('cpf').value = mascaraCPFVisualizacao(associado.CPF);
                        document.getElementById('cpf').disabled = true; 
                        document.getElementById('email').value = associado.Email;
                        document.getElementById('phone').value = associado.Telefone;
                        
                        // Campos de Endereço
                        document.getElementById('rua').value = associado.Rua;
                        document.getElementById('numero').value = associado.Numero;
                        document.getElementById('complemento').value = associado.Complemento;
                        document.getElementById('bairro').value = associado.Bairro;
                        document.getElementById('cidade').value = associado.Cidade;
                        document.getElementById('estado').value = associado.Estado;
                        document.getElementById('cep').value = associado.CEP;

                        setButtonText(true);

                        // Abrir a modal
                        const modalElement = document.getElementById('cadastroAssociado');
                        const modal = new bootstrap.Modal(modalElement);
                        modal.show();
                    }
                });
            });

            document.querySelectorAll('.btn-delete').forEach(button => {
                button.addEventListener('click', function() {
                    const cpf = this.getAttribute('data-id');
                    if (confirm('Tem certeza que deseja excluir este associado?')) {
                        fetch(`../backend/associadosDeleter.php?cpf=${cpf}`, {
                            method: 'DELETE'
                        })
                        .then(response => response.json())
                        .then(result => {
                            if (result.success) {
                                alert('Associado excluído com sucesso.');
                                location.reload(); // Recarrega a página para atualizar a lista
                            } else {
                                alert(result.message);
                            }
                        })
                        .catch(error => {
                            console.error('Erro ao excluir associado:', error);
                            alert('Erro ao excluir associado.');
                        });
                    }
                });
            });

            document.getElementById('btnCadastrarAssociado').addEventListener('click', function() {
                limparCamposFormulario();
                setButtonText(false); 
            });

            document.getElementById('cpf').addEventListener('input', function() {
                mascaraCPF(this);
            });
        }
    })
    .catch(error => {
        console.error('Erro ao carregar dados dos associados:', error);
    });
};

function normalizeAssociado(associado) {
    associado.Email == null ? associado.Email = '-' : associado.Email;
    associado.Telefone == null ? associado.Telefone = '-' : associado.Telefone;
    associado.Sexo = normalizeIdentidadeGenero(associado.Sexo);
    return associado;
}

function normalizeIdentidadeGenero(genero) {
    switch (genero) {
        case 'M':
            return 'Masculino';
        case 'F':
            return 'Feminino';
        case 'O':
            return 'Outros';
        default:
            return 'Não especificado';
    }
}

function normalizeIdentidadeGeneroEdit(genero) {
    switch (genero) {
        case 'Masculino':
            return 'M';
        case 'Feminino':
            return 'F';
        case 'Outros':
            return 'O';
        default:
            return '';
    }
}

function limparCamposFormulario() {
    document.getElementById('nome').value = '';
    document.getElementById('identidadeGenero').value = '';
    document.getElementById('cpf').value = '';
    document.getElementById('cpf').disabled = false;
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('rua').value = '';
    document.getElementById('numero').value = '';
    document.getElementById('complemento').value = '';
    document.getElementById('bairro').value = '';
    document.getElementById('cidade').value = '';
    document.getElementById('estado').value = '';
    document.getElementById('cep').value = '';
}

function setButtonText(isEditing) {
    const button = document.getElementById('associadoSaver');
    if (isEditing) {
        button.textContent = 'Salvar';
    } else {
        button.textContent = 'Cadastrar';
    }
}

function mascaraCPF(input) {
    let value = input.value.replace(/\D/g, ''); 
    value = value.replace(/(\d{3})(\d)/, '$1.$2'); 
    value = value.replace(/(\d{3})(\d)/, '$1.$2'); 
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    input.value = value;
}

function mascaraCPFVisualizacao(cpf) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
