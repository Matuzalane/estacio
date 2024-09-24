<?php
require 'dbConnect.php';

if (isset($_GET['cpf'])) {
    // Buscar associado pelo CPF
    $cpf = $_GET['cpf'];

    $sql = "SELECT associados.Id, Nome, CPF, Sexo, Email.Contato as Email, Telefone.Contato as Telefone,
                   Rua, Numero, Complemento, Bairro, Cidade, Estado, CEP
            FROM associados 
            LEFT JOIN contatos as Email ON associados.Id = Email.AssociadoId AND Email.TipoContato = 1
            LEFT JOIN contatos as Telefone ON associados.Id = Telefone.AssociadoId AND Telefone.TipoContato = 2
            LEFT JOIN enderecos ON associados.Id = enderecos.AssociadoId
            WHERE CPF = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $cpf);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $associado = $result->fetch_assoc();
        echo json_encode(['success' => true, 'associadoId' => $associado['Id'], 'associado' => $associado]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Associado não encontrado']);
    }

    $stmt->close();
} else {
    // Consulta para selecionar todos os associados
    $filtro = isset($_GET['filtro']) ? $_GET['filtro'] : '';

    $sql = "SELECT Nome, CPF, Sexo, Email.Contato as Email, Telefone.Contato as Telefone,
                   Rua, Numero, Complemento, Bairro, Cidade, Estado, CEP
            FROM associados 
            LEFT JOIN contatos as Email ON associados.Id = Email.AssociadoId AND Email.TipoContato = 1
            LEFT JOIN contatos as Telefone ON associados.Id = Telefone.AssociadoId AND Telefone.TipoContato = 2
            LEFT JOIN enderecos ON associados.Id = enderecos.AssociadoId
            WHERE Nome LIKE ? OR CPF LIKE ? OR Email.Contato LIKE ? OR Telefone.Contato LIKE ?";
    
    $stmt = $conn->prepare($sql);
    $filtro = "%$filtro%";
    $stmt->bind_param("ssss", $filtro, $filtro, $filtro, $filtro);
    $stmt->execute();
    $result = $stmt->get_result();

    $associados = array();

    if ($result->num_rows > 0) {
        // Adiciona os dados de cada associado ao array
        while ($row = $result->fetch_assoc()) {
            $associados[] = $row;
        }
    } else {
        // Adiciona uma mensagem de erro se não houver resultados
        $associados['error'] = "Nenhum associado encontrado.";
    }

    // Retorna os dados em formato JSON
    header('Content-Type: application/json');
    echo json_encode($associados);

    $stmt->close();
}

$conn->close();
?>