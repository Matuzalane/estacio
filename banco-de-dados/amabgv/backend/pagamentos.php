<?php
require 'dbConnect.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            // Buscar pagamento por ID
            $id = $_GET['id'];
            $sql = "SELECT r.Id, r.AssociadoId, r.DataVencimento, r.DataPagamento, r.Descricao, s.Nome as NomeAssociado, s.CPF as AssociadoCpf FROM pagamentos r JOIN associados s ON r.AssociadoId = s.Id WHERE r.Id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $pagamento = $result->fetch_assoc();
                echo json_encode(['success' => true, 'pagamento' => $pagamento]);
            } else {
                echo json_encode(['success' => false, 'message' => 'pagamento não encontrado']);
            }
            $stmt->close();
        } else {
            // Buscar todos os pagamentos
            $filtro = isset($_GET['filtro']) ? $_GET['filtro'] : '';
            $sql = "SELECT r.Id, r.AssociadoId, r.DataVencimento, r.DataPagamento, r.Descricao, s.Nome as NomeAssociado, 
                    s.CPF as AssociadoCpf FROM pagamentos r JOIN associados s ON r.AssociadoId = s.Id 
                    WHERE s.Nome LIKE ? OR s.CPF LIKE ? OR r.Descricao LIKE ? OR r.DataVencimento LIKE ? OR r.DataPagamento LIKE ?";
            
            $stmt = $conn->prepare($sql);
            $filtro = "%$filtro%";
            $stmt->bind_param("sssss", $filtro, $filtro, $filtro, $filtro, $filtro);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $pagamentos = [];
            while ($row = $result->fetch_assoc()) {
                $pagamentos[] = $row;
            }
            echo json_encode($pagamentos);
            $stmt->close();
        }
        break;
    case 'POST':
        // Criar um novo pagamento
        $associadoId = $_POST['associadoId'];
        $descricao = $_POST['descricao'];
        $dataVencimento = $_POST['dataVencimento'];
        $dataPagamento = $_POST['dataPagamento'];

        $sql = "INSERT INTO pagamentos (AssociadoId, Descricao, DataVencimento, DataPagamento) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("isss", $associadoId, $descricao, $dataVencimento, $dataPagamento);
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao cadastrar pagamento']);
        }
        break;

    case 'PUT':
        // Atualizar um pagamento existente
        parse_str(file_get_contents("php://input"), $_PUT);
        $id = $_PUT['id'];
        $associadoId = $_PUT['associadoId'];
        $descricao = $_PUT['descricao'];
        $dataVencimento = $_PUT['dataVencimento'];
        $dataPagamento = $_PUT['dataPagamento'];

        $sql = "UPDATE pagamentos SET AssociadoId = ?, Descricao = ?, DataVencimento = ?, DataPagamento = ? WHERE Id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("isssi", $associadoId, $descricao, $dataVencimento, $dataPagamento, $id);
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar pagamento']);
        }
        break;

    case 'DELETE':
        // Excluir um pagamento
        parse_str(file_get_contents("php://input"), $_DELETE);
        $id = $_DELETE['id'];

        $sql = "DELETE FROM pagamentos WHERE Id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao excluir pagamento']);
        }
        break;

    default:
    echo json_encode(['success' => false, 'message' => 'Método não suportado']);
    break;
}

$conn->close();
?>