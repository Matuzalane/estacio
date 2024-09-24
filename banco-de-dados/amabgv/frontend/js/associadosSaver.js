document.getElementById("associadoSaver").addEventListener("click", function(event) {
    event.preventDefault();
    
    // Captura os valores dos campos do formulário dentro do modal
    const nome = document.getElementById("nome").value;
    const identidadeGenero = document.getElementById("identidadeGenero").value;
    const cpf = document.getElementById("cpf").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const rua = document.getElementById("rua").value;
    const numero = document.getElementById("numero").value;
    const complemento = document.getElementById("complemento").value;
    const bairro = document.getElementById("bairro").value;
    const cidade = document.getElementById("cidade").value;
    const estado = document.getElementById("estado").value;
    const cep = document.getElementById("cep").value;

    // Cria um objeto com os dados
    const dados = {
        nome: nome,
        identidadeGenero: identidadeGenero,
        cpf: cpf,
        email: email,
        phone: phone,
        endereco: {
            rua: rua,
            numero: numero,
            complemento: complemento,
            bairro: bairro,
            cidade: cidade,
            estado: estado,
            cep: cep
        }
    };

    // Envia os dados via fetch para o PHP
    fetch('../backend/associadosSaver.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Erro: ' + data.error);
        } else {
            alert(data.message);
            console.log('Success:', data);
            
            // Fechar o modal após o cadastro
            let modalElement = document.getElementById('cadastroAssociado');
            let modal = bootstrap.Modal.getInstance(modalElement); // Obter a instância do modal
            modal.hide(); // Fechar o modal
            location.reload();
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});