-- MySQL dump 10.13  Distrib 8.0.40, for Linux (x86_64)
--
-- Host: localhost    Database: scms_db
-- ------------------------------------------------------
-- Server version	8.0.40

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
-- Current Database: `scms_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `scms_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `scms_db`;

--
-- Table structure for table `audit_log`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_log` (
  `log_id` binary(16) NOT NULL,
  `user_id` binary(16) DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `table_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `record_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `detail` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`log_id`),
  KEY `idx_audit_user` (`user_id`),
  KEY `idx_audit_created` (`created_at`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `consumable`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consumable` (
  `consumable_id` binary(16) NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_quantity` int NOT NULL DEFAULT '0',
  `note` text COLLATE utf8mb4_unicode_ci,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`consumable_id`),
  UNIQUE KEY `uq_consumable_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `consumable_export`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consumable_export` (
  `export_id` binary(16) NOT NULL,
  `export_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `req_id` binary(16) DEFAULT NULL,
  `order_id` binary(16) DEFAULT NULL,
  `exported_by` binary(16) DEFAULT NULL,
  `exported_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `note` text COLLATE utf8mb4_unicode_ci,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`export_id`),
  UNIQUE KEY `uq_consumable_export_number` (`export_number`),
  KEY `fk_cexport_req` (`req_id`),
  KEY `fk_cexport_order` (`order_id`),
  KEY `fk_cexport_user` (`exported_by`),
  CONSTRAINT `fk_cexport_order` FOREIGN KEY (`order_id`) REFERENCES `work_order` (`order_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_cexport_req` FOREIGN KEY (`req_id`) REFERENCES `consumable_request` (`req_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_cexport_user` FOREIGN KEY (`exported_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `consumable_export_item`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consumable_export_item` (
  `item_id` binary(16) NOT NULL,
  `export_id` binary(16) NOT NULL,
  `consumable_id` binary(16) NOT NULL,
  `quantity` int NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`item_id`),
  KEY `fk_cexport_item_export` (`export_id`),
  KEY `fk_cexport_item_consumable` (`consumable_id`),
  CONSTRAINT `fk_cexport_item_consumable` FOREIGN KEY (`consumable_id`) REFERENCES `consumable` (`consumable_id`),
  CONSTRAINT `fk_cexport_item_export` FOREIGN KEY (`export_id`) REFERENCES `consumable_export` (`export_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `consumable_import`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consumable_import` (
  `import_id` binary(16) NOT NULL,
  `import_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `imported_by` binary(16) DEFAULT NULL,
  `imported_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `note` text COLLATE utf8mb4_unicode_ci,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`import_id`),
  UNIQUE KEY `uq_consumable_import_number` (`import_number`),
  KEY `fk_cimport_user` (`imported_by`),
  CONSTRAINT `fk_cimport_user` FOREIGN KEY (`imported_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `consumable_import_item`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consumable_import_item` (
  `item_id` binary(16) NOT NULL,
  `import_id` binary(16) NOT NULL,
  `consumable_id` binary(16) NOT NULL,
  `quantity` int NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`item_id`),
  KEY `fk_cimport_item_import` (`import_id`),
  KEY `fk_cimport_item_consumable` (`consumable_id`),
  CONSTRAINT `fk_cimport_item_consumable` FOREIGN KEY (`consumable_id`) REFERENCES `consumable` (`consumable_id`),
  CONSTRAINT `fk_cimport_item_import` FOREIGN KEY (`import_id`) REFERENCES `consumable_import` (`import_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `consumable_request`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consumable_request` (
  `req_id` binary(16) NOT NULL,
  `req_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_id` binary(16) DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `pdf_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` binary(16) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `issued_at` datetime(6) DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `issued_by` binary(16) DEFAULT NULL,
  PRIMARY KEY (`req_id`),
  UNIQUE KEY `uq_consumable_req_number` (`req_number`),
  KEY `fk_creq_order` (`order_id`),
  KEY `fk_creq_user` (`created_by`),
  KEY `idx_creq_status` (`status`),
  KEY `FKh5fnw3ohd9spu512k622tiexk` (`issued_by`),
  CONSTRAINT `fk_creq_order` FOREIGN KEY (`order_id`) REFERENCES `work_order` (`order_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_creq_user` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `FKh5fnw3ohd9spu512k622tiexk` FOREIGN KEY (`issued_by`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `consumable_request_item`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consumable_request_item` (
  `item_id` binary(16) NOT NULL,
  `req_id` binary(16) NOT NULL,
  `consumable_id` binary(16) NOT NULL,
  `quantity_requested` int NOT NULL DEFAULT '0',
  `quantity_issued` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`item_id`),
  KEY `fk_creq_item_req` (`req_id`),
  KEY `fk_creq_item_consumable` (`consumable_id`),
  CONSTRAINT `fk_creq_item_consumable` FOREIGN KEY (`consumable_id`) REFERENCES `consumable` (`consumable_id`),
  CONSTRAINT `fk_creq_item_req` FOREIGN KEY (`req_id`) REFERENCES `consumable_request` (`req_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `department`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `department_id` binary(16) NOT NULL,
  `department_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`department_id`),
  UNIQUE KEY `uq_department_code` (`department_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `department_chat_message`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department_chat_message` (
  `message_sequence` bigint unsigned NOT NULL AUTO_INCREMENT,
  `message_id` binary(16) NOT NULL,
  `department_id` binary(16) NOT NULL,
  `sender_user_id` binary(16) NOT NULL,
  `client_message_id` binary(16) NOT NULL,
  `content` varchar(2000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`message_sequence`),
  UNIQUE KEY `uk_chat_message_id` (`message_id`),
  UNIQUE KEY `uk_chat_sender_client_message` (`sender_user_id`,`client_message_id`),
  KEY `idx_chat_department_sequence` (`department_id`,`message_sequence`),
  KEY `idx_chat_sender` (`sender_user_id`),
  KEY `idx_chat_department_created` (`department_id`,`created_at`),
  CONSTRAINT `fk_chat_message_department` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`),
  CONSTRAINT `fk_chat_message_sender` FOREIGN KEY (`sender_user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tin nh?n n?i b? theo ph?ng ban';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `department_chat_read_state`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department_chat_read_state` (
  `read_state_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `department_id` binary(16) NOT NULL,
  `user_id` binary(16) NOT NULL,
  `last_read_sequence` bigint unsigned NOT NULL DEFAULT '0',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`read_state_id`),
  UNIQUE KEY `uk_chat_read_department_user` (`department_id`,`user_id`),
  KEY `idx_chat_read_user` (`user_id`),
  CONSTRAINT `fk_chat_read_department` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`),
  CONSTRAINT `fk_chat_read_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='V? tr? ??c g?n nh?t c?a t?ng t?i kho?n trong ph?ng chat';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `employee_id` binary(16) NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department_id` binary(16) DEFAULT NULL,
  `position_id` binary(16) DEFAULT NULL,
  `work_location` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `employee_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`employee_id`),
  UNIQUE KEY `uq_employee_phone` (`phone`),
  UNIQUE KEY `uq_employee_email` (`email`),
  UNIQUE KEY `UK_70okqib3h08m5eb1jdwld7bu9` (`employee_code`),
  KEY `fk_employee_position` (`position_id`),
  KEY `idx_employee_dept` (`department_id`),
  KEY `idx_employee_deleted` (`is_deleted`),
  CONSTRAINT `fk_employee_department` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_employee_position` FOREIGN KEY (`position_id`) REFERENCES `employee_position` (`position_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_position`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_position` (
  `position_id` binary(16) NOT NULL,
  `position_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`position_id`),
  UNIQUE KEY `uq_position_name` (`position_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_role`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_role` (
  `id` binary(16) NOT NULL,
  `employee_id` binary(16) NOT NULL,
  `role_id` binary(16) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_employee_role` (`employee_id`,`role_id`),
  KEY `fk_erole_role` (`role_id`),
  CONSTRAINT `fk_erole_employee` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_erole_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `equipment`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipment` (
  `equipment_id` binary(16) NOT NULL,
  `kks_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active' COMMENT 'active | inactive | maintenance | broken',
  `location` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `system_id` binary(16) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`equipment_id`),
  UNIQUE KEY `uq_equipment_kks` (`kks_code`),
  KEY `idx_equipment_kks` (`kks_code`),
  KEY `idx_equipment_status` (`status`),
  KEY `idx_equipment_system` (`system_id`),
  CONSTRAINT `fk_equipment_system` FOREIGN KEY (`system_id`) REFERENCES `equipment_system` (`system_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `equipment_image`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipment_image` (
  `image_id` binary(16) NOT NULL,
  `equipment_id` binary(16) NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `caption` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uploaded_by` binary(16) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`image_id`),
  KEY `fk_image_equipment` (`equipment_id`),
  KEY `fk_image_user` (`uploaded_by`),
  CONSTRAINT `fk_image_equipment` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`equipment_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_image_user` FOREIGN KEY (`uploaded_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `equipment_system`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipment_system` (
  `system_id` binary(16) NOT NULL,
  `system_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `system_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `parent_system_id` binary(16) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`system_id`),
  UNIQUE KEY `uq_system_code` (`system_code`),
  KEY `fk_system_parent` (`parent_system_id`),
  CONSTRAINT `fk_system_parent` FOREIGN KEY (`parent_system_id`) REFERENCES `equipment_system` (`system_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `group_chat_member`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_chat_member` (
  `member_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `room_id` binary(16) NOT NULL,
  `user_id` binary(16) NOT NULL,
  `added_by_user_id` binary(16) NOT NULL,
  `joined_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`member_id`),
  UNIQUE KEY `uk_group_chat_member` (`room_id`,`user_id`),
  KEY `idx_group_chat_member_user` (`user_id`,`room_id`),
  KEY `fk_group_chat_member_added_by` (`added_by_user_id`),
  CONSTRAINT `fk_group_chat_member_added_by` FOREIGN KEY (`added_by_user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `fk_group_chat_member_room` FOREIGN KEY (`room_id`) REFERENCES `group_chat_room` (`room_id`),
  CONSTRAINT `fk_group_chat_member_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Th??nh vi??n c???a ph??ng chat nh??m';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `group_chat_message`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_chat_message` (
  `message_sequence` bigint unsigned NOT NULL AUTO_INCREMENT,
  `message_id` binary(16) NOT NULL,
  `room_id` binary(16) NOT NULL,
  `sender_user_id` binary(16) NOT NULL,
  `client_message_id` binary(16) NOT NULL,
  `content` varchar(2000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`message_sequence`),
  UNIQUE KEY `uk_group_chat_message_id` (`message_id`),
  UNIQUE KEY `uk_group_chat_sender_client` (`sender_user_id`,`client_message_id`),
  KEY `idx_group_chat_message_room_sequence` (`room_id`,`message_sequence`),
  KEY `idx_group_chat_message_room_created` (`room_id`,`created_at`),
  CONSTRAINT `fk_group_chat_message_room` FOREIGN KEY (`room_id`) REFERENCES `group_chat_room` (`room_id`),
  CONSTRAINT `fk_group_chat_message_sender` FOREIGN KEY (`sender_user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tin nh???n trong ph??ng chat nh??m';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `group_chat_read_state`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_chat_read_state` (
  `read_state_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `room_id` binary(16) NOT NULL,
  `user_id` binary(16) NOT NULL,
  `last_read_sequence` bigint unsigned NOT NULL DEFAULT '0',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`read_state_id`),
  UNIQUE KEY `uk_group_chat_read_room_user` (`room_id`,`user_id`),
  KEY `idx_group_chat_read_user` (`user_id`),
  CONSTRAINT `fk_group_chat_read_room` FOREIGN KEY (`room_id`) REFERENCES `group_chat_room` (`room_id`),
  CONSTRAINT `fk_group_chat_read_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='V??? tr?? ?????c g???n nh???t c???a th??nh vi??n trong ph??ng chat nh??m';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `group_chat_room`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_chat_room` (
  `room_id` binary(16) NOT NULL,
  `room_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner_user_id` binary(16) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`room_id`),
  KEY `idx_group_chat_owner` (`owner_user_id`),
  KEY `idx_group_chat_updated` (`updated_at`),
  CONSTRAINT `fk_group_chat_room_owner` FOREIGN KEY (`owner_user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ph??ng chat nh??m do ng?????i d??ng t???o';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `hr_audit_log`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_audit_log` (
  `id` binary(16) NOT NULL,
  `action` enum('CREATE_EMPLOYEE','UPDATE_EMPLOYEE','DELETE_EMPLOYEE','REMOVE_FROM_DEPARTMENT','CREATE_DEPARTMENT','UPDATE_DEPARTMENT','DELETE_DEPARTMENT','CREATE_ACCOUNT','UPDATE_ROLES','LOCK_ACCOUNT','UNLOCK_ACCOUNT','RESET_PASSWORD','DELETE_ACCOUNT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `detail` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `performed_by` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `performed_by_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target_id` binary(16) DEFAULT NULL,
  `target_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target_type` enum('EMPLOYEE','DEPARTMENT','ACCOUNT') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_hr_audit_created_at` (`created_at`),
  KEY `idx_hr_audit_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `invalidated_token`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invalidated_token` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiry_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `repair_history`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `repair_history` (
  `history_id` binary(16) NOT NULL,
  `equipment_id` binary(16) NOT NULL,
  `order_id` binary(16) DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `repaired_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `repaired_by` binary(16) DEFAULT NULL,
  PRIMARY KEY (`history_id`),
  KEY `fk_history_equipment` (`equipment_id`),
  KEY `fk_history_order` (`order_id`),
  KEY `fk_history_user` (`repaired_by`),
  CONSTRAINT `fk_history_equipment` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`equipment_id`),
  CONSTRAINT `fk_history_order` FOREIGN KEY (`order_id`) REFERENCES `work_order` (`order_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_history_user` FOREIGN KEY (`repaired_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `repair_request`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `repair_request` (
  `request_id` binary(16) NOT NULL,
  `equipment_id` binary(16) NOT NULL,
  `created_by` binary(16) NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium' COMMENT 'low | medium | high | critical',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT 'pending | confirmed | in_progress | done | cancelled',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`request_id`),
  KEY `fk_request_equipment` (`equipment_id`),
  KEY `fk_request_user` (`created_by`),
  KEY `idx_request_status` (`status`),
  CONSTRAINT `fk_request_equipment` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`equipment_id`),
  CONSTRAINT `fk_request_user` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `role`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `role_id` binary(16) NOT NULL,
  `role_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `uq_role_code` (`role_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `spare_part`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spare_part` (
  `spare_part_id` binary(16) NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_quantity` int NOT NULL DEFAULT '0',
  `note` text COLLATE utf8mb4_unicode_ci,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`spare_part_id`),
  UNIQUE KEY `uq_spare_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `spare_part_export`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spare_part_export` (
  `export_id` binary(16) NOT NULL,
  `export_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `req_id` binary(16) DEFAULT NULL,
  `order_id` binary(16) DEFAULT NULL,
  `exported_by` binary(16) DEFAULT NULL,
  `exported_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `note` text COLLATE utf8mb4_unicode_ci,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`export_id`),
  UNIQUE KEY `uq_spare_export_number` (`export_number`),
  KEY `fk_sexport_req` (`req_id`),
  KEY `fk_sexport_order` (`order_id`),
  KEY `fk_sexport_user` (`exported_by`),
  CONSTRAINT `fk_sexport_order` FOREIGN KEY (`order_id`) REFERENCES `work_order` (`order_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sexport_req` FOREIGN KEY (`req_id`) REFERENCES `spare_part_request` (`req_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sexport_user` FOREIGN KEY (`exported_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `spare_part_export_item`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spare_part_export_item` (
  `item_id` binary(16) NOT NULL,
  `export_id` binary(16) NOT NULL,
  `spare_part_id` binary(16) NOT NULL,
  `quantity` int NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`item_id`),
  KEY `fk_sexport_item_export` (`export_id`),
  KEY `fk_sexport_item_spare` (`spare_part_id`),
  CONSTRAINT `fk_sexport_item_export` FOREIGN KEY (`export_id`) REFERENCES `spare_part_export` (`export_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sexport_item_spare` FOREIGN KEY (`spare_part_id`) REFERENCES `spare_part` (`spare_part_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `spare_part_import`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spare_part_import` (
  `import_id` binary(16) NOT NULL,
  `import_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `imported_by` binary(16) DEFAULT NULL,
  `imported_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `note` text COLLATE utf8mb4_unicode_ci,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`import_id`),
  UNIQUE KEY `uq_spare_import_number` (`import_number`),
  KEY `fk_simport_user` (`imported_by`),
  CONSTRAINT `fk_simport_user` FOREIGN KEY (`imported_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `spare_part_import_item`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spare_part_import_item` (
  `item_id` binary(16) NOT NULL,
  `import_id` binary(16) NOT NULL,
  `spare_part_id` binary(16) NOT NULL,
  `quantity` int NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`item_id`),
  KEY `fk_simport_item_import` (`import_id`),
  KEY `fk_simport_item_spare` (`spare_part_id`),
  CONSTRAINT `fk_simport_item_import` FOREIGN KEY (`import_id`) REFERENCES `spare_part_import` (`import_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_simport_item_spare` FOREIGN KEY (`spare_part_id`) REFERENCES `spare_part` (`spare_part_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `spare_part_request`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spare_part_request` (
  `req_id` binary(16) NOT NULL,
  `req_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_id` binary(16) DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `pdf_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` binary(16) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `issued_at` datetime(6) DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `issued_by` binary(16) DEFAULT NULL,
  PRIMARY KEY (`req_id`),
  UNIQUE KEY `uq_spare_req_number` (`req_number`),
  KEY `fk_sreq_order` (`order_id`),
  KEY `fk_sreq_user` (`created_by`),
  KEY `idx_sreq_status` (`status`),
  KEY `FKbgbsec7flig5ifb7g8erulvl1` (`issued_by`),
  CONSTRAINT `fk_sreq_order` FOREIGN KEY (`order_id`) REFERENCES `work_order` (`order_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sreq_user` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `FKbgbsec7flig5ifb7g8erulvl1` FOREIGN KEY (`issued_by`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `spare_part_request_item`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spare_part_request_item` (
  `item_id` binary(16) NOT NULL,
  `req_id` binary(16) NOT NULL,
  `spare_part_id` binary(16) NOT NULL,
  `quantity_requested` int NOT NULL DEFAULT '0',
  `quantity_issued` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`item_id`),
  KEY `fk_sreq_item_req` (`req_id`),
  KEY `fk_sreq_item_spare` (`spare_part_id`),
  CONSTRAINT `fk_sreq_item_req` FOREIGN KEY (`req_id`) REFERENCES `spare_part_request` (`req_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sreq_item_spare` FOREIGN KEY (`spare_part_id`) REFERENCES `spare_part` (`spare_part_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `technical_assessment`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `technical_assessment` (
  `assessment_id` binary(16) NOT NULL,
  `assessment_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `equipment_id` binary(16) NOT NULL,
  `damage_description` text COLLATE utf8mb4_unicode_ci,
  `proposed_action` text COLLATE utf8mb4_unicode_ci,
  `repair_signed_by` binary(16) DEFAULT NULL,
  `repair_signed_at` timestamp NULL DEFAULT NULL,
  `operation_signed_by` binary(16) DEFAULT NULL,
  `operation_signed_at` timestamp NULL DEFAULT NULL,
  `pdf_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` binary(16) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`assessment_id`),
  UNIQUE KEY `uq_assessment_number` (`assessment_number`),
  KEY `fk_assessment_equipment` (`equipment_id`),
  KEY `fk_assessment_created` (`created_by`),
  KEY `fk_assessment_repair_sign` (`repair_signed_by`),
  KEY `fk_assessment_op_sign` (`operation_signed_by`),
  CONSTRAINT `fk_assessment_created` FOREIGN KEY (`created_by`) REFERENCES `employee` (`employee_id`),
  CONSTRAINT `fk_assessment_equipment` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`equipment_id`),
  CONSTRAINT `fk_assessment_op_sign` FOREIGN KEY (`operation_signed_by`) REFERENCES `employee` (`employee_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_assessment_repair_sign` FOREIGN KEY (`repair_signed_by`) REFERENCES `employee` (`employee_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `technical_param`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `technical_param` (
  `param_id` binary(16) NOT NULL,
  `param_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'text',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`param_id`),
  UNIQUE KEY `uq_param_name` (`param_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `technical_spec`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `technical_spec` (
  `spec_id` binary(16) NOT NULL,
  `equipment_id` binary(16) NOT NULL,
  `param_id` binary(16) NOT NULL,
  `param_value` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit_id` binary(16) DEFAULT NULL,
  PRIMARY KEY (`spec_id`),
  KEY `fk_spec_equipment` (`equipment_id`),
  KEY `fk_spec_param` (`param_id`),
  KEY `fk_spec_unit` (`unit_id`),
  CONSTRAINT `fk_spec_equipment` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`equipment_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_spec_param` FOREIGN KEY (`param_id`) REFERENCES `technical_param` (`param_id`),
  CONSTRAINT `fk_spec_unit` FOREIGN KEY (`unit_id`) REFERENCES `unit` (`unit_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tool`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tool` (
  `tool_id` binary(16) NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_quantity` int NOT NULL DEFAULT '0',
  `available_quantity` int NOT NULL DEFAULT '0',
  `damaged_quantity` int NOT NULL DEFAULT '0',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available' COMMENT 'available | damaged',
  `note` text COLLATE utf8mb4_unicode_ci,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`tool_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tool_borrow`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tool_borrow` (
  `borrow_id` binary(16) NOT NULL,
  `tool_id` binary(16) NOT NULL,
  `borrowed_by` binary(16) NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `borrowed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `due_date` timestamp NULL DEFAULT NULL,
  `returned_at` timestamp NULL DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'borrowing' COMMENT 'borrowing | returned | overdue',
  `note` text COLLATE utf8mb4_unicode_ci,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `remaining_quantity` int NOT NULL,
  PRIMARY KEY (`borrow_id`),
  KEY `fk_borrow_tool` (`tool_id`),
  KEY `fk_borrow_employee` (`borrowed_by`),
  KEY `idx_borrow_status` (`status`),
  CONSTRAINT `fk_borrow_employee` FOREIGN KEY (`borrowed_by`) REFERENCES `employee` (`employee_id`),
  CONSTRAINT `fk_borrow_tool` FOREIGN KEY (`tool_id`) REFERENCES `tool` (`tool_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `unit`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unit` (
  `unit_id` binary(16) NOT NULL,
  `symbol` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`unit_id`),
  UNIQUE KEY `uq_unit_symbol` (`symbol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_id` binary(16) NOT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` binary(16) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_user_username` (`username`),
  UNIQUE KEY `uq_user_employee` (`employee_id`),
  KEY `idx_user_active_deleted` (`is_active`,`is_deleted`),
  CONSTRAINT `fk_user_employee` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `work_order`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_order` (
  `order_id` binary(16) NOT NULL,
  `order_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `request_id` binary(16) DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft' COMMENT 'draft | open | extended | locked',
  `start_date` timestamp NULL DEFAULT NULL,
  `end_date` timestamp NULL DEFAULT NULL,
  `extended_to` timestamp NULL DEFAULT NULL,
  `work_leader_id` binary(16) DEFAULT NULL,
  `direct_commander_id` binary(16) DEFAULT NULL,
  `safety_supervisor_id` binary(16) DEFAULT NULL,
  `created_by` binary(16) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `pdf_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `uq_order_number` (`order_number`),
  KEY `fk_order_request` (`request_id`),
  KEY `fk_order_created_by` (`created_by`),
  KEY `fk_order_leader` (`work_leader_id`),
  KEY `fk_order_commander` (`direct_commander_id`),
  KEY `fk_order_supervisor` (`safety_supervisor_id`),
  KEY `idx_order_status` (`status`),
  KEY `idx_order_number` (`order_number`),
  CONSTRAINT `fk_order_commander` FOREIGN KEY (`direct_commander_id`) REFERENCES `employee` (`employee_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_order_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_order_leader` FOREIGN KEY (`work_leader_id`) REFERENCES `employee` (`employee_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_order_request` FOREIGN KEY (`request_id`) REFERENCES `repair_request` (`request_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_order_supervisor` FOREIGN KEY (`safety_supervisor_id`) REFERENCES `employee` (`employee_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `work_order_daily_log`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_order_daily_log` (
  `log_id` binary(16) NOT NULL,
  `order_id` binary(16) NOT NULL,
  `date` date NOT NULL,
  `opened_by` binary(16) NOT NULL,
  `opened_at` timestamp NOT NULL,
  `closed_by` binary(16) DEFAULT NULL,
  `closed_at` timestamp NULL DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`log_id`),
  KEY `fk_daily_log_order` (`order_id`),
  KEY `fk_daily_log_opened` (`opened_by`),
  KEY `fk_daily_log_closed` (`closed_by`),
  CONSTRAINT `fk_daily_log_closed` FOREIGN KEY (`closed_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_daily_log_opened` FOREIGN KEY (`opened_by`) REFERENCES `user` (`user_id`),
  CONSTRAINT `fk_daily_log_order` FOREIGN KEY (`order_id`) REFERENCES `work_order` (`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `work_order_member`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_order_member` (
  `id` binary(16) NOT NULL,
  `order_id` binary(16) NOT NULL,
  `employee_id` binary(16) NOT NULL,
  `check_in_at` timestamp NULL DEFAULT NULL,
  `check_out_at` timestamp NULL DEFAULT NULL,
  `added_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_work_order_member` (`order_id`,`employee_id`),
  KEY `fk_member_employee` (`employee_id`),
  CONSTRAINT `fk_member_employee` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`),
  CONSTRAINT `fk_member_order` FOREIGN KEY (`order_id`) REFERENCES `work_order` (`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-31  6:46:10
