<?php
require 'dbConnect.php';

$cpf = $_GET['cpf'];

// Buscar o ID do associado usando o CPF
$getAssociadoIdSql = "SELECT Id FROM associados WHERE CPF = ?";
$stmt = $conn->prepare($getAssociadoIdSql);
$stmt->bind_param("s", $cpf);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $associadoId = $row['Id'];

    // Verifica se o associado possui registros vinculados nas tabelas pagamentos ou agendamentos
    $checkSql = "SELECT COUNT(*) as count FROM pagamentos WHERE AssociadoId = ? UNION ALL SELECT COUNT(*) as count FROM agendamentos WHERE AssociadoId = ?";
    $stmt = $conn->prepare($checkSql);
    $stmt->bind_param("ii", $associadoId, $associadoId);
    $stmt->execute();
    $result = $stmt->get_result();

    $hasLinkedRecords = false;
    while ($row = $result->fetch_assoc()) {
        if ($row['count'] > 0) {
            $hasLinkedRecords = true;
            break;
        }
    }

    if ($hasLinkedRecords) {
        echo json_encode(['success' => false, 'message' => 'Não é possível excluir o associado pois existem registros vinculados']);
    } else {
        // Exclui os registros das tabelas enderecos e contatos
        $deleteContactsSql = "DELETE FROM contatos WHERE AssociadoId = ?";
        $deleteAddressesSql = "DELETE FROM enderecos WHERE AssociadoId = ?";
        $deleteAssociadoSql = "DELETE FROM associados WHERE Id = ?";

        $stmt = $conn->prepare($deleteContactsSql);
        $stmt->bind_param("i", $associadoId);
        $stmt->execute();

        $stmt = $conn->prepare($deleteAddressesSql);
        $stmt->bind_param("i", $associadoId);
        $stmt->execute();

        $stmt = $conn->prepare($deleteAssociadoSql);
        $stmt->bind_param("i", $associadoId);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'message' => 'Associado excluído com sucesso']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Falha ao excluir o associado']);
        }
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Associado não encontrado']);
}

$stmt->close();
$conn->close();
?>