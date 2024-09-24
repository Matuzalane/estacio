<?php
require 'dbConnect.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            // Buscar agendamento por ID
            $id = $_GET['id'];
            $sql = "SELECT a.Id, a.AssociadoId, a.Data, a.EspacoReservado, s.Nome as NomeAssociado, s.CPF as AssociadoCpf FROM agendamentos a JOIN associados s ON a.AssociadoId = s.Id WHERE a.Id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $agendamento = $result->fetch_assoc();
                echo json_encode(['success' => true, 'agendamento' => $agendamento]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Agendamento não encontrado']);
            }
            $stmt->close();
        } else {
            // Buscar todos os agendamentos
            $filtro = isset($_GET['filtro']) ? $_GET['filtro'] : '';

            $sql = "SELECT a.Id, a.AssociadoId, a.Data, a.EspacoReservado, s.Nome as NomeAssociado, s.CPF as AssociadoCpf 
                    FROM agendamentos a JOIN associados s ON a.AssociadoId = s.Id
                    WHERE s.Nome LIKE ? OR s.CPF LIKE ? OR a.EspacoReservado LIKE ? OR a.Data LIKE ?";

            $stmt = $conn->prepare($sql);
            $filtro = "%$filtro%";
            $stmt->bind_param("ssss", $filtro, $filtro, $filtro, $filtro);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $agendamentos = [];
            while ($row = $result->fetch_assoc()) {
                $agendamentos[] = $row;
            }
            echo json_encode($agendamentos);
            $stmt->close();
        }
        break;
    case 'POST':
        // Criar um novo agendamento
        $associadoId = $_POST['associadoId'];
        $data = $_POST['data'];
        $espacoReservado = $_POST['espacoReservado'];

        $sql = "INSERT INTO agendamentos (AssociadoId, Data, EspacoReservado) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iss", $associadoId, $data, $espacoReservado);
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao cadastrar agendamento']);
        }
        break;

    case 'PUT':
        // Atualizar um agendamento existente
        parse_str(file_get_contents("php://input"), $_PUT);
        $id = $_PUT['id'];
        $associadoId = $_PUT['associadoId'];
        $data = $_PUT['data'];
        $espacoReservado = $_PUT['espacoReservado'];

        $sql = "UPDATE agendamentos SET AssociadoId = ?, Data = ?, EspacoReservado = ? WHERE Id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("issi", $associadoId, $data, $espacoReservado, $id);
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar agendamento']);
        }
        break;

    case 'DELETE':
        // Excluir um agendamento
        parse_str(file_get_contents("php://input"), $_DELETE);
        $id = $_DELETE['id'];

        $sql = "DELETE FROM agendamentos WHERE Id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao excluir agendamento']);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Método não suportado']);
        break;
}

$conn->close();
?>