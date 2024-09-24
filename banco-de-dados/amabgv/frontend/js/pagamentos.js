document.addEventListener('DOMContentLoaded', function () {
    const filtroInput = document.getElementById('filtroPagamentos');
    filtroInput.addEventListener('input', function() {
        loadPagamentos(filtroInput.value);
    });

    loadPagamentos();

    document.getElementById('btnCadastrarpagamento').addEventListener('click', function() {
        limparCamposFormulario();
        setButtonText(false); // Define o texto do botão como "Cadastrar"
    });

    document.getElementById('pagamentoSaver').addEventListener('click', function (e) {
        e.preventDefault();
        const pagamentoId = document.getElementById('pagamentoSaver').getAttribute('data-pagamento-id');
        if (pagamentoId) {
            salvarEdicao(pagamentoId);
        } else {
            cadastrarpagamento();
        }
    });

    document.getElementById('associadoCpf').addEventListener('input', function() {
        mascaraCPF(this);
        buscarNomeAssociado(this.value);
    });
});

function buscarNomeAssociado(cpf) {
    cpf = cpf.replace(/\D/g, ''); // Remove caracteres não numéricos
    if (cpf.length === 11) { // Verifica se o CPF tem 11 dígitos
        fetch(`../backend/associadosGetter.php?cpf=${cpf}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('nomeAssociado').value = data.associado.Nome;
                } else {
                    document.getElementById('nomeAssociado').value = 'Associado não encontrado';
                }
            })
            .catch(error => {
                console.error('Erro ao buscar nome do associado:', error);
                document.getElementById('nomeAssociado').value = 'Erro ao buscar nome';
            });
    } else {
        document.getElementById('nomeAssociado').value = '';
    }
}

function loadPagamentos(filtro = '') {
    fetch(`../backend/pagamentos.php?filtro=${filtro}`)
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('pagamentosTableBody');
            tbody.innerHTML = '';

            if (data.error) {
                console.error(data.error);
                tbody.innerHTML = `<tr><td colspan="6">${data.error}</td></tr>`;
            } else {
                data.forEach(pagamento => {
                    const tr = document.createElement('tr');

                    const nomeAssociado = pagamento.NomeAssociado;
                    const cpfAssociado = pagamento.AssociadoCpf;
                    const descricao = pagamento.Descricao;
                    const dataVencimento = mascaraDataVisualizacao(pagamento.DataVencimento);
                    const dataPagamento = pagamento.DataPagamento != '0000-00-00' ? mascaraDataVisualizacao(pagamento.DataPagamento) : 'Pendente';

                    tr.innerHTML = `
                        <td>${nomeAssociado}</td>
                        <td>${cpfAssociado}</td>
                        <td>${descricao}</td>
                        <td>${dataVencimento}</td>
                        <td>${dataPagamento}</td>
                        <td>
                            <button class="btn btn-warning btn-sm btn-edit" data-id="${pagamento.Id}"><i class="fa-regular fa-pen-to-square"></i></button>
                            <button class="btn btn-danger btn-sm btn-delete" data-id="${pagamento.Id}"><i class="fa-regular fa-trash-can"></i></button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });

                document.querySelectorAll('.btn-edit').forEach(button => {
                    button.addEventListener('click', function() {
                        const pagamentoId = this.getAttribute('data-id');
                        editarpagamento(pagamentoId);
                    });
                });

                document.querySelectorAll('.btn-delete').forEach(button => {
                    button.addEventListener('click', function() {
                        const pagamentoId = this.getAttribute('data-id');
                        excluirpagamento(pagamentoId);
                    });
                });
            }
        })
        .catch(error => {
            console.error('Erro ao carregar dados dos pagamentos:', error);
        });
}

function cadastrarpagamento() {
    let associadoCpf = document.getElementById('associadoCpf').value;
    associadoCpf = associadoCpf.replace(/\D/g, '');
    const descricao = document.getElementById('descricao').value;
    const dataVencimento = document.getElementById('dataVencimento').value;
    const dataPagamento = document.getElementById('dataPagamento').value;

    fetch(`../backend/associadosGetter.php?cpf=${associadoCpf}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const associadoId = data.associadoId;

                const formData = new FormData();
                formData.append('associadoId', associadoId);
                formData.append('descricao', descricao);
                formData.append('dataVencimento', dataVencimento);
                formData.append('dataPagamento', dataPagamento);

                fetch('../backend/pagamentos.php', {
                    method: 'POST',
                    body: formData
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            loadPagamentos();
                            const modal = bootstrap.Modal.getInstance(document.getElementById('pagamentoModal'));
                            modal.hide();
                        } else {
                            alert('Erro ao cadastrar pagamento');
                        }
                    });
            } else {
                alert('Associado não encontrado');
            }
        });
}

function editarpagamento(pagamentoId) {
    fetch(`../backend/pagamentos.php?id=${pagamentoId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const pagamento = data.pagamento;

                document.getElementById('associadoCpf').value = mascaraCPFVisualizacao(pagamento.AssociadoCpf);
                document.getElementById('nomeAssociado').value = pagamento.NomeAssociado;
                document.getElementById('descricao').value = pagamento.Descricao;
                document.getElementById('dataVencimento').value = pagamento.DataVencimento;
                document.getElementById('dataPagamento').value = pagamento.DataPagamento;

                setButtonText(true);
                document.getElementById('pagamentoSaver').setAttribute('data-pagamento-id', pagamento.Id);

                // Abrir a modal
                const modalElement = document.getElementById('pagamentoModal');
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            } else {
                alert('Erro ao buscar os dados do pagamento.');
            }
        })
        .catch(error => {
            console.error('Erro ao buscar os dados do pagamento:', error);
            alert('Erro ao buscar os dados do pagamento.');
        });
}

function salvarEdicao(pagamentoId) {
    let associadoCpf = document.getElementById('associadoCpf').value;
    associadoCpf = associadoCpf.replace(/\D/g, '');
    const descricao = document.getElementById('descricao').value;
    const dataVencimento = document.getElementById('dataVencimento').value;
    const dataPagamento = document.getElementById('dataPagamento').value;

    fetch(`../backend/associadosGetter.php?cpf=${associadoCpf}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const associadoId = data.associadoId;

                const formData = new URLSearchParams();
                formData.append('id', pagamentoId);
                formData.append('associadoId', associadoId);
                formData.append('descricao', descricao);
                formData.append('dataVencimento', dataVencimento);
                formData.append('dataPagamento', dataPagamento);

                fetch('../backend/pagamentos.php', {
                    method: 'PUT',
                    body: formData
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            loadPagamentos();
                            const modal = bootstrap.Modal.getInstance(document.getElementById('pagamentoModal'));
                            modal.hide();
                        } else {
                            alert('Erro ao salvar edição do pagamento');
                        }
                    });
            } else {
                alert('Associado não encontrado');
            }
        });
}

function excluirpagamento(id) {
    if (confirm('Tem certeza que deseja excluir este pagamento?')) {
        const formData = new URLSearchParams();
        formData.append('id', id);

        fetch('../backend/pagamentos.php', {
            method: 'DELETE',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadPagamentos();
                } else {
                    alert('Erro ao excluir pagamento');
                }
            });
    }
}

function limparCamposFormulario() {
    document.getElementById('associadoCpf').value = '';
    document.getElementById('nomeAssociado').value = '';
    document.getElementById('descricao').value = '';
    document.getElementById('dataVencimento').value = '';
    document.getElementById('dataPagamento').value = '';
}

function setButtonText(isEditing) {
    const button = document.getElementById('pagamentoSaver');
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

function mascaraDataVisualizacao(data) {
    const dataObj = new Date(data);
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();
    return `${dia}/${mes}/${ano}`;
}