<?php
require 'dbConnect.php';

// Recebe os dados enviados via fetch
$data = json_decode(file_get_contents('php://input'), true);

$nome = $data['nome'];
$identidadeGenero = $data['identidadeGenero'];
$cpf = $data['cpf'];
$email = $data['email'];
$phone = $data['phone'];

// Endereço
$rua = $data['endereco']['rua'];
$numero = $data['endereco']['numero'];
$complemento = $data['endereco']['complemento'];
$bairro = $data['endereco']['bairro'];
$cidade = $data['endereco']['cidade'];
$estado = $data['endereco']['estado'];
$cep = $data['endereco']['cep'];

// Verifica se o CPF já está cadastrado
$cpf = preg_replace("/[^0-9]/", "", $cpf);
$getAssociado = "SELECT id FROM associados WHERE CPF = '$cpf'";
$result = $conn->query($getAssociado);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $associadoId = $row['id'];
    
    $updateAssociado = "UPDATE associados SET Nome = '$nome', Sexo = '$identidadeGenero' WHERE Id = '$associadoId'";
    if ($conn->query($updateAssociado) === FALSE) {
        echo json_encode(["error" => "Erro ao atualizar associado: " . $conn->error]);
        exit();
    }

    $emailUpdate = "UPDATE contatos SET Contato = '$email' WHERE AssociadoId = '$associadoId' AND TipoContato = 1";
    if ($conn->query($emailUpdate) === FALSE) {
        echo json_encode(["error" => "Erro ao atualizar email verifique os dados inseridos: " . $conn->error]);
        exit();
    }

    $phoneUpdate = "UPDATE contatos SET Contato = '$phone' WHERE AssociadoId = '$associadoId' AND TipoContato = 2";
    if ($conn->query($phoneUpdate) === FALSE) {
        echo json_encode(["error" => "Erro ao atualizar telefone verifique os dados inseridos: " . $conn->error]);
        exit();
    }

    $enderecoUpdate = "UPDATE enderecos SET Rua = '$rua', Numero = '$numero', Complemento = '$complemento', Bairro = '$bairro', Cidade = '$cidade', Estado = '$estado', CEP = '$cep' WHERE AssociadoId = '$associadoId'";
    if ($conn->query($enderecoUpdate) === FALSE) {
        echo json_encode(["error" => "Erro ao atualizar endereço verifique os dados inseridos: " . $conn->error]);
        exit();
    }

    echo json_encode(["message" => "Atualização realizada com sucesso!"]);
} else {
    // Inserção no banco de dados
    $associadoInsert = "INSERT INTO associados (Nome, CPF, Sexo) VALUES ('$nome', '$cpf', '$identidadeGenero')";

    if ($conn->query($associadoInsert) === TRUE) {
        // Obter o ID do último registro inserido em associados
        $associadoId = $conn->insert_id;

        $emailInsert = "INSERT INTO contatos (TipoContato, Contato, AssociadoId) VALUES (1, '$email', '$associadoId')";
        if ($conn->query($emailInsert) === FALSE) {
            echo json_encode(["error" => "Erro ao cadastrar contato verifique os dados inseridos: " . $conn->error]);
            exit();
        }

        $phoneInsert = "INSERT INTO contatos (TipoContato, Contato, AssociadoId) VALUES (2, '$phone', '$associadoId')";
        if ($conn->query($phoneInsert) === FALSE) {
            echo json_encode(["error" => "Erro ao cadastrar contato verifique os dados inseridos: " . $conn->error]);
            exit();
        }

        $enderecoInsert = "INSERT INTO enderecos (AssociadoId, Rua, Numero, Complemento, Bairro, Cidade, Estado, CEP) VALUES ( '$associadoId', '$rua', '$numero', '$complemento', '$bairro', '$cidade', '$estado', '$cep')";
        if ($conn->query($enderecoInsert) === FALSE) {
            echo json_encode(["error" => "Erro ao cadastrar endereço verifique os dados inseridos: " . $conn->error]);
            exit();
        }

        echo json_encode(["message" => "Cadastro realizado com sucesso!"]);
    } else {
        echo json_encode(["error" => "Erro ao cadastrar associado verifique os dados inseridos: " . $conn->error]);
    }
}


$conn->close();
?>