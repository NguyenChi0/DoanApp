-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: banhang
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Laptops'),(2,'MacBooks'),(3,'Desktops'),(4,'Accessories'),(5,'Tablets'),(8,'MiniBooks');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,1,1,2500.00),(2,2,1,1,2500.00),(3,3,1,2,2500.00),(4,3,2,2,3000.00),(5,4,1,1,2500.00),(6,4,2,1,3000.00),(7,5,1,2,2500.00),(8,5,2,2,3000.00),(9,6,1,2,2500.00),(10,6,2,1,3000.00),(11,7,1,1,2500.00),(12,7,2,1,3000.00),(13,8,2,1,3000.00),(14,9,1,2,2500.00),(15,9,2,1,3000.00),(16,10,1,1,2500.00),(17,10,2,1,3000.00),(18,11,1,1,2500.00),(19,12,1,1,2500.00),(20,12,2,1,3000.00),(21,13,1,1,2500.00),(22,13,10,1,30.00),(23,14,3,1,2500.00),(24,15,1,1,2500.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` tinyint(4) DEFAULT 0 COMMENT '0: Chờ xác nhận, 1: Đang vận chuyển, 2: Đã giao hàng',
  PRIMARY KEY (`id`),
  KEY `fk_user` (`user_id`),
  CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,NULL,'Chi','Ha Noi , Viet Nam',NULL,2500.00,'2025-04-27 15:52:47',0),(2,NULL,'Chí','Hà Nội ',NULL,2500.00,'2025-04-27 16:27:20',0),(3,NULL,'Tôi','HN',NULL,11000.00,'2025-04-27 16:29:40',0),(4,NULL,'Tôi','HN',NULL,5500.00,'2025-04-27 16:30:18',1),(5,NULL,'Giét','Hn',NULL,11000.00,'2025-04-27 17:04:35',0),(6,1,'Quynh ','Quynh Mai',NULL,8000.00,'2025-04-28 09:06:17',0),(7,1,'Quynh ','Dai La',NULL,5500.00,'2025-04-28 09:07:54',0),(8,1,'Quynh ','Hà Lội',NULL,3000.00,'2025-04-28 09:16:07',0),(9,1,'Quynh ','HN',NULL,8000.00,'2025-04-28 09:18:37',0),(10,2,'Quỳnh ','HN',NULL,5500.00,'2025-04-28 09:21:18',0),(11,1,'Quynh ','Hà Nội',NULL,2500.00,'2025-04-28 09:41:04',0),(12,3,'Nguyễn Khánh Linh','Paris',NULL,5500.00,'2025-05-01 11:42:30',1),(13,1,'Quynh ','PTho',NULL,2530.00,'2025-05-01 14:31:27',0),(14,2,'Quỳnh ','PhuTho','0912345678',2500.00,'2025-05-03 03:58:31',1),(15,2,'Quỳnh ','hanoi','12349597',2500.00,'2025-05-03 04:01:25',1);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `stock` int(11) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_category` (`category_id`),
  CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Laptop Dell XPS 13','Laptop cao cấp',2500.00,'http://192.168.1.7:3000/images/anh1.jpg',10,1),(2,'Macbook Pro M2','Macbook hiệu năng cao',3000.00,'http://192.168.52.114:3000/images/anh1.jpg',5,2),(3,'Laptop Dell XPS 13','Laptop cao cấp với màn hình 13 inch',2500.00,'http://192.168.52.114:3000/images/anh1.jpg',10,1),(4,'Macbook Pro M2','Macbook hiệu năng cao với chip M2',3000.00,'http://192.168.52.114:3000/images/anh1.jpg',5,2),(5,'HP Pavilion 15','Laptop đa năng cho công việc và giải trí',1200.00,'http://192.168.52.114:3000/images/anh1.jpg',15,1),(6,'Macbook Air M1','Macbook mỏng nhẹ với chip M1',2000.00,'http://192.168.52.114:3000/images/anh1.jpg',8,2),(7,'Dell Inspiron 14','Laptop giá rẻ cho sinh viên',800.00,'http://192.168.52.114:3000/images/anh1.jpg',20,1),(8,'iMac 24-inch','Máy tính để bàn Apple với màn hình Retina',3500.00,'http://192.168.52.114:3000/images/anh1.jpg',4,3),(9,'USB-C Hub','Bộ chuyển đổi USB-C đa năng',50.00,'http://192.168.52.114:3000/images/anh1.jpg',50,4),(10,'Wireless Mouse','Chuột không dây Logitech',30.00,'http://192.168.52.114:3000/images/anh1.jpg',100,4),(11,'iPad Pro 11','Máy tính bảng cao cấp với chip M1',1500.00,'http://192.168.52.114:3000/images/anh1.jpg',12,5),(12,'Samsung Galaxy Tab S8','Máy tính bảng Android cao cấp',900.00,'http://192.168.52.114:3000/images/anh1.jpg',10,5);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `role` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'quynh001','$2b$10$9qbmiyEMvhLjvt82myoQp.asmxDepREdoeLkIheom.Zt5yvbf4M/y','123@gmail.com','Quynh ','HN','2025-04-28 08:55:30',0),(2,'quynh002','$2b$10$Fe0svpKFnHVg4v/4IS2GmeZBY1bS/n0rZTBus3eZHAYIeTkCZ/E36','123456789@gmail.com','Quỳnh ','Hn','2025-04-28 09:20:46',0),(3,'Linh','$2b$10$mWbuxLmUtGYg8wQiNGpYseUErPKDlfxt8H0sr291H1q4dZdw1BtwK','Linhne@gmail.com','Nguyễn Khánh Linh','Sapa','2025-05-01 11:41:42',0),(6,'admin','$2a$12$pREhEDDfuDa9N2SsDLH96equNKb55RkqrXpR.7z7mkl9noD40JVqe','admin@example.com','Admin User','Admin Office','2025-05-01 15:39:08',1),(8,'admin_test','','admin@test.com',NULL,NULL,'2025-05-01 17:11:19',1),(16,'test','$2b$10$f4d70vjpdZJaPtYscyRinuPzyLufkW7cdarYVp2x2MJd3oabULJES','1234567@gmail.com','tester','pt','2025-05-01 17:32:37',0),(17,'newadmin','$2a$12$pREhEDDfuDa9N2SsDLH96equNKb55RkqrXpR.7z7mkl9noD40JVqe','newadmin@example.com','New Admin','Admin Office','2025-05-02 15:21:30',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-03 23:25:42
