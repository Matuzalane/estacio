document.addEventListener('DOMContentLoaded', function () {
    const filtroInput = document.getElementById('filtroAgendamentos');
    filtroInput.addEventListener('input', function() {
        let filtro = filtroInput.value;
        loadAgendamentos(filtro);
    });

    loadAgendamentos();

    document.getElementById('btnCadastrarAgendamento').addEventListener('click', function() {
        limparCamposFormulario();
        setButtonText(false); // Define o texto do botão como "Cadastrar"
    });

    document.getElementById('agendamentoSaver').addEventListener('click', function (e) {
        e.preventDefault();
        const agendamentoId = document.getElementById('agendamentoSaver').getAttribute('data-agendamento-id');
        if (agendamentoId) {
            salvarEdicao(agendamentoId);
        } else {
            cadastrarAgendamento();
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

function loadAgendamentos(filtro = '') {
    fetch(`../backend/agendamentos.php?filtro=${filtro}`)
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('agendamentosTableBody');
            tbody.innerHTML = '';

            if (data.error) {
                console.error(data.error);
                tbody.innerHTML = `<tr><td colspan="6">${data.error}</td></tr>`;
            } else {
                data.forEach(agendamento => {
                    const [data, horario] = agendamento.Data.split(' ');

                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${agendamento.NomeAssociado}</td>
                        <td>${mascaraCPFVisualizacao(agendamento.AssociadoCpf)}</td>
                        <td>${mascaraData(data)}</td>
                        <td>${horario.substring(0, 5)}</td>
                        <td>${agendamento.EspacoReservado}</td>
                        <td>
                            <button class="btn btn-warning btn-sm btn-edit" data-id="${agendamento.Id}"><i class="fa-regular fa-pen-to-square"></i></button>
                            <button class="btn btn-danger btn-sm btn-delete" data-id="${agendamento.Id}"><i class="fa-regular fa-trash-can"></i></button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });

                document.querySelectorAll('.btn-edit').forEach(button => {
                    button.addEventListener('click', function() {
                        const agendamentoId = this.getAttribute('data-id');
                        editarAgendamento(agendamentoId);
                    });
                });

                document.querySelectorAll('.btn-delete').forEach(button => {
                    button.addEventListener('click', function() {
                        const agendamentoId = this.getAttribute('data-id');
                        excluirAgendamento(agendamentoId);
                    });
                });
            }
        })
        .catch(error => {
            console.error('Erro ao carregar dados dos agendamentos:', error);
        });
}

function cadastrarAgendamento() {
    let associadoCpf = document.getElementById('associadoCpf').value;
    associadoCpf = associadoCpf.replace(/\D/g, '');
    const dataAgendamento = document.getElementById('dataAgendamento').value;
    const horario = document.getElementById('horarioAgendamento').value;
    const espacoReservado = document.getElementById('espacoReservado').value;

    const dataHora = `${dataAgendamento} ${horario}`;

    fetch(`../backend/associadosGetter.php?cpf=${associadoCpf}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const associadoId = data.associadoId;

                const formData = new FormData();
                formData.append('associadoId', associadoId);
                formData.append('data', dataHora);
                formData.append('espacoReservado', espacoReservado);

                fetch('../backend/agendamentos.php', {
                    method: 'POST',
                    body: formData
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            const cadastroModal = bootstrap.Modal.getInstance(document.getElementById('agendamentoModal'));
                            cadastroModal.hide(); // Fechar modal
                            limparCamposFormulario();
                            loadAgendamentos();
                        } else {
                            alert(data.message);
                        }
                    });
            } else {
                alert('Associado não encontrado');
            }
        });
}

function editarAgendamento(agendamentoId) {
    fetch(`../backend/agendamentos.php?id=${agendamentoId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const agendamento = data.agendamento;
                const dataHora = new Date(agendamento.Data);
                const dataFormatada = dataHora.toISOString().split('T')[0];
                const horarioFormatado = dataHora.toTimeString().split(' ')[0].substring(0, 5);

                document.getElementById('associadoCpf').value = mascaraCPFVisualizacao(agendamento.AssociadoCpf);
                document.getElementById('dataAgendamento').value = dataFormatada;
                document.getElementById('horarioAgendamento').value = horarioFormatado;
                document.getElementById('espacoReservado').value = agendamento.EspacoReservado;

                setButtonText(true);
                document.getElementById('agendamentoSaver').setAttribute('data-agendamento-id', agendamento.Id);

                // Abrir a modal
                const modalElement = document.getElementById('agendamentoModal');
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            } else {
                alert('Erro ao buscar os dados do agendamento.');
            }
        })
        .catch(error => {
            console.error('Erro ao buscar os dados do agendamento:', error);
            alert('Erro ao buscar os dados do agendamento.');
        });
}

function salvarEdicao(agendamentoId) {
    let associadoCpf = document.getElementById('associadoCpf').value;
    associadoCpf = associadoCpf.replace(/\D/g, '');
    const dataAgendamento = document.getElementById('dataAgendamento').value;
    const horario = document.getElementById('horarioAgendamento').value;
    const espacoReservado = document.getElementById('espacoReservado').value;

    const dataHora = `${dataAgendamento} ${horario}`;

    fetch(`../backend/associadosGetter.php?cpf=${associadoCpf}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const associadoId = data.associadoId;

                const formData = new URLSearchParams();
                formData.append('id', agendamentoId);
                formData.append('associadoId', associadoId);
                formData.append('data', dataHora);
                formData.append('espacoReservado', espacoReservado);

                fetch('../backend/agendamentos.php', {
                    method: 'PUT',
                    body: formData
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            const editModal = bootstrap.Modal.getInstance(document.getElementById('agendamentoModal'));
                            editModal.hide();
                            loadAgendamentos();
                        } else {
                            alert(data.message);
                        }
                    });
            } else {
                alert('Associado não encontrado');
            }
        });
}

function excluirAgendamento(id) {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
        const formData = new URLSearchParams();
        formData.append('id', id);

        fetch('../backend/agendamentos.php', {
            method: 'DELETE',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadAgendamentos();
                } else {
                    alert(data.message);
                }
            });
    }
}

function limparCamposFormulario() {
    document.getElementById('associadoCpf').value = '';
    document.getElementById('dataAgendamento').value = '';
    document.getElementById('horarioAgendamento').value = '';
    document.getElementById('espacoReservado').value = '';
}

function setButtonText(isEditing) {
    const button = document.getElementById('agendamentoSaver');
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

function mascaraData(data) {
    const dataObj = new Date(data);
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();
    return `${dia}/${mes}/${ano}`;
}