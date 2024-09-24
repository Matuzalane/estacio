-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: amabgv
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `agendamentos`
--

DROP TABLE IF EXISTS `agendamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agendamentos` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `AssociadoId` int(11) NOT NULL,
  `Data` datetime NOT NULL,
  `PagamentoId` int(11) DEFAULT NULL,
  `EspacoReservado` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `agendamentos_associados_FK` (`AssociadoId`),
  KEY `agendamentos_Pagamentos_FK` (`PagamentoId`),
  CONSTRAINT `agendamentos_Pagamentos_FK` FOREIGN KEY (`PagamentoId`) REFERENCES `pagamentos` (`Id`),
  CONSTRAINT `agendamentos_associados_FK` FOREIGN KEY (`AssociadoId`) REFERENCES `associados` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `associados`
--

DROP TABLE IF EXISTS `associados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `associados` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Nome` varchar(255) NOT NULL,
  `CPF` varchar(11) NOT NULL,
  `Sexo` char(1) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Associados_CPF` (`CPF`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contatos`
--

DROP TABLE IF EXISTS `contatos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contatos` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `TipoContato` int(11) NOT NULL,
  `Contato` varchar(255) NOT NULL,
  `AssociadoId` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `contato_tipocontato_FK` (`TipoContato`),
  KEY `contato_associados_FK` (`AssociadoId`),
  CONSTRAINT `contato_associados_FK` FOREIGN KEY (`AssociadoId`) REFERENCES `associados` (`Id`),
  CONSTRAINT `contato_tipocontato_FK` FOREIGN KEY (`TipoContato`) REFERENCES `tiposcontatos` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `enderecos`
--

DROP TABLE IF EXISTS `enderecos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enderecos` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `AssociadoId` int(11) NOT NULL,
  `Rua` varchar(255) NOT NULL,
  `Numero` varchar(10) NOT NULL,
  `Complemento` varchar(100) DEFAULT NULL,
  `Bairro` varchar(100) NOT NULL,
  `Cidade` varchar(100) NOT NULL,
  `Estado` varchar(2) NOT NULL,
  `CEP` varchar(9) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `enderecos_associados_FK` (`AssociadoId`),
  CONSTRAINT `enderecos_associados_FK` FOREIGN KEY (`AssociadoId`) REFERENCES `associados` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pagamentos`
--

DROP TABLE IF EXISTS `pagamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagamentos` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `AssociadoId` int(11) NOT NULL,
  `DataVencimento` date NOT NULL,
  `DataPagamento` date DEFAULT NULL,
  `Descricao` varchar(255) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `pagamentos_associados_FK` (`AssociadoId`),
  CONSTRAINT `pagamentos_associados_FK` FOREIGN KEY (`AssociadoId`) REFERENCES `associados` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tiposcontatos`
--

DROP TABLE IF EXISTS `tiposcontatos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tiposcontatos` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Nome` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'amabgv'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-09-23 23:00:11
