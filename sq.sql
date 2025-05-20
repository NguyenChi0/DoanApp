-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: banhang
-- ------------------------------------------------------
-- Server version	9.3.0

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
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Laptops'),(2,'MacBooks'),(3,'Desktops'),(4,'Phụ Kiện'),(5,'Tablets'),(8,'MiniBook');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,1,1,2500.00),(2,2,1,1,2500.00),(3,3,1,2,2500.00),(4,3,2,2,3000.00),(5,4,1,1,2500.00),(6,4,2,1,3000.00),(7,5,1,2,2500.00),(8,5,2,2,3000.00),(9,6,1,2,2500.00),(10,6,2,1,3000.00),(11,7,1,1,2500.00),(12,7,2,1,3000.00),(13,8,2,1,3000.00),(14,9,1,2,2500.00),(15,9,2,1,3000.00),(16,10,1,1,2500.00),(17,10,2,1,3000.00),(18,11,1,1,2500.00),(19,12,1,1,2500.00),(20,12,2,1,3000.00),(21,13,1,1,2500.00),(22,13,10,1,30.00),(23,14,3,1,2500.00),(24,15,1,1,2500.00),(25,16,1,1,2500.00),(26,16,2,1,3000.00),(27,17,1,1,2500.00),(28,18,1,1,2500.00),(29,18,7,1,800.00),(30,18,4,2,3000.00),(31,18,9,1,50.00),(32,18,11,2,1500.00),(33,19,1,1,2500.00),(34,20,2,1,3000.00),(35,20,3,1,2500.00),(36,21,2,1,3000.00),(37,21,3,1,2500.00),(38,22,2,1,3000.00),(39,22,3,1,2500.00),(40,23,2,1,3000.00),(41,23,3,1,2500.00),(42,24,9,1,50.00),(43,24,4,1,3000.00),(44,24,7,1,800.00),(45,24,11,1,1500.00),(46,25,1,1,2500.00),(47,25,11,1,1500.00),(48,25,12,1,900.00),(49,25,2,1,3000.00),(50,25,6,1,2000.00),(51,25,10,1,30.00),(52,25,15,2,300.00),(53,26,1,1,2500.00),(54,26,4,1,3000.00),(55,26,10,1,30.00),(56,27,1,1,2500.00),(57,27,10,1,30.00),(58,28,1,1,2500.00),(59,28,4,1,3000.00),(60,28,10,1,30.00),(61,28,9,1,50.00),(62,28,16,1,10000.00),(63,28,14,1,3000.00),(64,28,15,1,300.00),(65,29,10,1,30.00),(66,30,1,1,2500.00),(67,31,1,1,2500.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `user_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone_number` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` tinyint DEFAULT '0' COMMENT '0: Chờ xác nhận, 1: Đang vận chuyển, 2: Đã giao hàng',
  PRIMARY KEY (`id`),
  KEY `fk_user` (`user_id`),
  CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,NULL,'Chi','Ha Noi , Viet Nam',NULL,2500.00,'2025-04-27 15:52:47',2),(2,NULL,'Chí','Hà Nội ',NULL,2500.00,'2025-04-27 16:27:20',2),(3,NULL,'Tôi','HN',NULL,11000.00,'2025-04-27 16:29:40',1),(4,NULL,'Tôi','HN',NULL,5500.00,'2025-04-27 16:30:18',2),(5,NULL,'Giét','Hn',NULL,11000.00,'2025-04-27 17:04:35',0),(6,1,'Quynh ','Quynh Mai',NULL,8000.00,'2025-04-28 09:06:17',3),(7,1,'Quynh ','Dai La',NULL,5500.00,'2025-04-28 09:07:54',3),(8,1,'Quynh ','Hà Lội',NULL,3000.00,'2025-04-28 09:16:07',3),(9,1,'Quynh ','HN',NULL,8000.00,'2025-04-28 09:18:37',3),(10,2,'Quỳnh ','HN',NULL,5500.00,'2025-04-28 09:21:18',0),(11,1,'Quynh ','Hà Nội',NULL,2500.00,'2025-04-28 09:41:04',0),(12,3,'Nguyễn Khánh Linh','Paris',NULL,5500.00,'2025-05-01 11:42:30',1),(13,1,'Quynh ','PTho',NULL,2530.00,'2025-05-01 14:31:27',0),(14,2,'Quỳnh ','PhuTho','0912345678',2500.00,'2025-05-03 03:58:31',1),(15,2,'Quỳnh ','hanoi','12349597',2500.00,'2025-05-03 04:01:25',2),(16,1,'Quynh ','HN','0912345678',5500.00,'2025-05-03 16:34:53',3),(17,2,'Quỳnh ','HN','0978451632',2500.00,'2025-05-04 13:55:38',1),(18,2,'Quynh','HN','0123457689',12350.00,'2025-05-05 06:14:15',1),(19,1,'Quynh ','HN','0987456321',2500.00,'2025-05-05 06:32:22',2),(20,2,'Quynh','Hai Ba Trung','0123456789',5500.00,'2025-05-05 07:31:02',0),(21,2,'Quynh','Hai Ba Trung','0123456789',5500.00,'2025-05-05 07:31:04',2),(22,2,'Quynh','Hai Ba Trung','0123456789',5500.00,'2025-05-05 07:31:06',2),(23,2,'Quynh','Hai Ba Trung','0123456789',5500.00,'2025-05-05 07:31:10',0),(24,2,'Quynh','Ha Noi','091234567899',5350.00,'2025-05-06 17:18:39',1),(25,2,'Quynh','Minh Khai','0123456789',10530.00,'2025-05-08 15:58:34',3),(26,18,'tester','PT','0912435768',5530.00,'2025-05-08 16:09:28',3),(27,1,'Quynh ','HN','0912345768',2530.00,'2025-05-08 16:36:21',3),(28,2,'Quynh','HN','0912345678',18880.00,'2025-05-10 14:39:58',2),(29,2,'Quynh','HN','0912345678',30.00,'2025-05-18 08:06:15',0),(30,2,'Quynh','HN','0912345678',2500.00,'2025-05-18 08:06:28',0),(31,1,'Quynh ','Hdhdbdbbdbxvx','9999999999',2500.00,'2025-05-18 18:31:43',0);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `price` decimal(10,2) DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `stock` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `status` tinyint DEFAULT '1' COMMENT '1: hiển thị, 0: ẩn',
  PRIMARY KEY (`id`),
  KEY `fk_category` (`category_id`),
  CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Nu','new',2500.00,'1747248751217-6ca3d487-981a-48e8-aa3a-1434031dee47.jpeg',5,1,1),(2,'Macbook Pro M2','Macbook Pro M2 với màn hình Liquid Retina XDR 14 inch, chip Apple M2 Pro với 10-core CPU và 16-core GPU, 32GB RAM, 1TB SSD. Hỗ trợ ProMotion và True Tone, thời lượng pin đến 18 giờ, sạc nhanh MagSafe 3. Kết nối đầy đủ với Thunderbolt 4, HDMI, khe cắm thẻ SDXC. Thiết kế đẳng cấp từ nhôm nguyên khối, bàn phím Magic Keyboard có đèn nền ',3000.00,'1747248886089-c1e23ac7-a42f-445c-b512-0373b7e4f026.jpeg',5,2,1),(3,'Laptop Dell XPS 13','Dell XPS 13 với màn hình InfinityEdge 13.4 inch 4K UHD+ (3840 x 2400), viền siêu mỏng, tỷ lệ màn hình 16:10. Trang bị chip Intel Core i7-1260P, RAM 16GB LPDDR5, SSD 1TB PCIe NVMe. Pin 52WHr cho thời gian sử dụng lên đến 12 giờ. Vỏ máy làm từ nhôm CNC cao cấp, bàn phím có đèn nền, cảm biến vân tay tích hợp. Webcam HD với cảm biến hồng ngoại hỗ trợ Windows Hello.',2500.00,'1747248751217-6ca3d487-981a-48e8-aa3a-1434031dee47.jpeg',10,1,1),(4,'Macbook Pro M2','Macbook Pro M2 là sự kết hợp hoàn hảo giữa hiệu năng vượt trội và thiết kế tinh tế. Trang bị chip M2 thế hệ mới của Apple với 8-core CPU và 10-core GPU, mang lại sức mạnh xử lý đồ họa và đa nhiệm ấn tượng. Màn hình Retina 13.3 inch với độ phân giải 2560 x 1600 pixel, công nghệ True Tone và dải màu rộng P3. Bộ nhớ 16GB RAM thống nhất và SSD 512GB cực nhanh. Tích hợp Touch Bar, Touch ID và bàn phím Magic Keyboard cải tiến. Thời lượng pin lên đến 20 giờ sử dụng liên tục.',3000.00,'1747248751217-6ca3d487-981a-48e8-aa3a-1434031dee47.jpeg',5,2,1),(5,'HP Pavilion 15','HP Pavilion 15 là laptop đa năng hoàn hảo cho công việc hàng ngày và giải trí. Màn hình 15.6 inch Full HD (1920 x 1080) với tấm nền IPS cho góc nhìn rộng và màu sắc chân thực. Sử dụng chip Intel Core i5-1135G7 (4 nhân, 8 luồng) kết hợp với card đồ họa Intel Iris Xe. Bộ nhớ 8GB DDR4 và ổ cứng SSD 512GB đem lại tốc độ vượt trội. Hệ thống loa kép B&O tinh chỉnh cho trải nghiệm âm thanh sống động. Pin 3 cell, 41 Wh cho thời gian sử dụng lên đến 8 giờ.',1200.00,'1747248751217-6ca3d487-981a-48e8-aa3a-1434031dee47.jpeg',15,1,1),(6,'Macbook Air M1','Macbook Air M1 là mẫu laptop siêu mỏng nhẹ với hiệu năng ấn tượng. Trọng lượng chỉ 1.29kg với thiết kế wedge đặc trưng từ nhôm tái chế 100%. Trang bị chip Apple M1 với 8-core CPU, 7-core GPU và 16-core Neural Engine, cho hiệu suất cao hơn đến 3.5 lần so với thế hệ trước. Màn hình Retina 13.3 inch với True Tone tự điều chỉnh màu sắc theo môi trường. RAM 8GB và SSD 256GB tốc độ cao. Hệ thống tản nhiệt không quạt hoàn toàn yên tĩnh. Pin lên đến 18 giờ sử dụng liên tục, hỗ trợ sạc qua cổng Thunderbolt/USB 4.',2000.00,'1747248751217-6ca3d487-981a-48e8-aa3a-1434031dee47.jpeg',8,2,1),(7,'Dell Inspiron 14','Dell Inspiron 14 là lựa chọn hoàn hảo cho sinh viên với giá thành hợp lý. Màn hình 14 inch Full HD (1920 x 1080) với công nghệ chống chói, bảo vệ mắt khi sử dụng trong thời gian dài. Sử dụng chip Intel Core i3-1115G4 thế hệ 11 hoặc AMD Ryzen 5 5500U, đáp ứng tốt nhu cầu học tập, làm việc cơ bản và giải trí nhẹ. RAM 8GB DDR4 và SSD 256GB đảm bảo khả năng đa nhiệm ổn định. Thiết kế gọn nhẹ với trọng lượng 1.6kg, dễ dàng mang theo. Pin 3-cell, 41Wh cho thời gian sử dụng khoảng 7-8 giờ.',800.00,'1747248751217-6ca3d487-981a-48e8-aa3a-1434031dee47.jpeg',20,1,1),(8,'iMac 24-inch','iMac 24-inch (2021) là tác phẩm nghệ thuật trong thiết kế máy tính để bàn. Siêu mỏng chỉ 11.5mm với 7 tùy chọn màu sắc tươi sáng. Trang bị màn hình Retina 4.5K (4480 x 2520) với độ sáng 500 nits và dải màu P3 rộng. Chip M1 cho hiệu suất vượt trội với 8-core CPU và 8-core GPU. Hệ thống 6 loa với woofer kép hỗ trợ Dolby Atmos và microphone chuẩn studio. Camera FaceTime HD 1080p với ISP của M1 cho chất lượng hình ảnh cuộc gọi rõ nét. Bộ phụ kiện đồng màu với Magic Keyboard, Magic Mouse và Magic Trackpad tùy chọn.',3500.00,'1747248751217-6ca3d487-981a-48e8-aa3a-1434031dee47.jpeg',4,3,1),(9,'USB-C Hub','USB-C Hub đa năng với 7 cổng kết nối mở rộng từ một cổng USB-C duy nhất. Bao gồm HDMI hỗ trợ xuất hình 4K@60Hz, 2 cổng USB-A 3.0 tốc độ cao, cổng USB-C PD 100W cho sạc nhanh, đầu đọc thẻ SD và microSD, cổng mạng Ethernet Gigabit. Thiết kế nhỏ gọn từ nhôm cao cấp với dây cáp dài 15cm, dễ dàng mang theo. Tương thích với MacBook, iPad Pro, laptop Windows và Android có cổng USB-C.',50.00,'1747248751217-6ca3d487-981a-48e8-aa3a-1434031dee47.jpeg',50,4,1),(10,'Wireless Mouse','Chuột không dây Logitech với thiết kế công thái học, thoải mái khi sử dụng trong thời gian dài. Công nghệ kết nối không dây Logitech Unifying 2.4GHz ổn định với phạm vi hoạt động lên đến 10m. Cảm biến quang học độ chính xác cao 1000 DPI, hoạt động trên hầu hết các bề mặt. Pin AA cho thời gian sử dụng lên đến 12 tháng với chế độ tự động ngủ thông minh. Tương thích với Windows, macOS, Chrome OS và Linux. Thiết kế nhỏ gọn, dễ dàng mang theo khi di chuyển.',30.00,'1747248751217-6ca3d487-981a-48e8-aa3a-1434031dee47.jpeg',100,4,1),(11,'iPad Pro 11','iPad Pro 11 inch với chip M1 mang hiệu năng của máy tính để bàn vào thiết bị di động. Màn hình Liquid Retina 11 inch (2388 x 1668) với ProMotion, True Tone và dải màu rộng P3. RAM 8GB và dung lượng lưu trữ từ 128GB đến 2TB. Camera sau kép 12MP góc rộng + 10MP siêu rộng kèm máy quét LiDAR. Camera trước 12MP Ultra Wide với tính năng Center Stage thông minh. Hỗ trợ Apple Pencil 2, Magic Keyboard và Smart Keyboard Folio. Kết nối 5G, Wi-Fi 6 và Thunderbolt / USB 4. Bảo mật Face ID và thời lượng pin lên đến 10 giờ.',1500.00,'1747248751217-6ca3d487-981a-48e8-aa3a-1434031dee47.jpeg',12,8,1),(12,'Samsung Galaxy Tab S8','Samsung Galaxy Tab S8 là máy tính bảng Android cao cấp với màn hình 11 inch LTPS TFT (2560 x 1600) tần số quét 120Hz. Sử dụng chip Qualcomm Snapdragon 8 Gen 1 (4nm) mạnh mẽ, RAM 8GB và bộ nhớ trong từ 128GB đến 256GB, mở rộng qua thẻ microSD lên đến 1TB. Camera sau kép 13MP góc rộng + 6MP siêu rộng, camera trước 12MP siêu rộng. Pin 8000mAh hỗ trợ sạc nhanh 45W. Kèm theo bút S Pen với độ trễ cực thấp 6.2ms. Hệ thống loa quad được tinh chỉnh bởi AKG, hỗ trợ Dolby Atmos. Chạy Android 12 với One UI 4.1.',900.00,'1747248751217-6ca3d487-981a-48e8-aa3a-1434031dee47.jpeg',10,5,1),(14,'Mac','Mac mới với thiết kế cải tiến hoàn toàn, sử dụng chip Apple Silicon thế hệ mới cho hiệu năng vượt trội. Màn hình Retina độ phân giải cao với True Tone và dải màu rộng P3. Hệ thống tản nhiệt nâng cấp giúp duy trì hiệu suất ổn định trong thời gian dài. Bàn phím Magic Keyboard cải tiến với hành trình phím thoải mái và độ bền cao. Kết nối đầy đủ với nhiều cổng Thunderbolt, USB-C và khe cắm thẻ SD. Hệ thống âm thanh chất lượng cao với loa stereo và microphone studio.',3000.00,'1747248751217-6ca3d487-981a-48e8-aa3a-1434031dee47.jpeg',10,2,1),(15,'Màn hình AOC 27 inch','Màn hình AOC 27 inch với tấm nền IPS cho góc nhìn rộng 178° và hiển thị màu sắc chính xác. Độ phân giải Full HD (1920 x 1080) với tần số quét 75Hz cho trải nghiệm xem mượt mà. Công nghệ Flicker-Free và Low Blue Light bảo vệ mắt khi sử dụng lâu. Thời gian phản hồi 4ms GtG, độ sáng 250 nits và độ tương phản 1000:1. Hỗ trợ AMD FreeSync chống xé hình. Đa dạng cổng kết nối với HDMI 1.4, DisplayPort 1.2 và VGA. Tích hợp loa stereo 2W x 2. Thiết kế không viền 3 cạnh hiện đại với chân đế vững chắc, có thể điều chỉnh độ nghiêng.',300.00,'1747248751217-6ca3d487-981a-48e8-aa3a-1434031dee47.jpeg',10,4,1),(16,'Mac M5 Prime','Mac M5 Prime là đỉnh cao công nghệ với chip Apple Silicon M5 mạnh nhất từ trước đến nay. Chip M5 với 14-core CPU, 30-core GPU và 32-core Neural Engine, cho hiệu suất vượt trội trong mọi tác vụ từ đồ họa chuyên nghiệp đến AI. Màn hình Liquid Retina XDR 16 inch (3456 x 2234) với ProMotion, đạt độ sáng 1600 nits và hiển thị 1 tỷ màu. RAM thống nhất 64GB và SSD siêu nhanh 4TB. Hệ thống tản nhiệt tiên tiến đảm bảo hiệu năng ổn định ngay cả khi xử lý các tác vụ nặng. Pin 100WHr cho thời gian sử dụng lên đến 22 giờ. Kết nối đầy đủ với các cổng Thunderbolt 4, HDMI, khe cắm thẻ SDXC và MagSafe 3.',10000.00,'1746630887123-245f51cf-dcbb-4f10-9cb4-6d93ab658cfe.jpeg',5,2,1),(17,'Lenovo Gaming 3','Sản phẩm mới về',2500.00,'1746888260161-704646e6-dd63-407e-9611-af7af30064af.png',5,1,1);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `role` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'quynh001','$2b$10$9qbmiyEMvhLjvt82myoQp.asmxDepREdoeLkIheom.Zt5yvbf4M/y','123@gmail.com','Quynh ','HN','2025-04-28 08:55:30',0),(2,'quynh002','$2b$10$Fe0svpKFnHVg4v/4IS2GmeZBY1bS/n0rZTBus3eZHAYIeTkCZ/E36','123456789@gmail.com','Quynh','HN','2025-04-28 09:20:46',0),(3,'Linh','$2b$10$mWbuxLmUtGYg8wQiNGpYseUErPKDlfxt8H0sr291H1q4dZdw1BtwK','Linhne@gmail.com','Nguyễn Khánh Linh','Sapa','2025-05-01 11:41:42',0),(6,'admin','$2a$12$pREhEDDfuDa9N2SsDLH96equNKb55RkqrXpR.7z7mkl9noD40JVqe','admin@example.com','Admin User','Admin Office','2025-05-01 15:39:08',1),(17,'newadmin','$2a$12$pREhEDDfuDa9N2SsDLH96equNKb55RkqrXpR.7z7mkl9noD40JVqe','newadmin@example.com','New Admin','Admin Office','2025-05-02 15:21:30',1),(18,'test001','$2b$10$W4gMI8x6wm46Ejd2tTznC.9Tk.EbqlOedzMKbgomvoMQBBl6msYuq','test123@gmail.com','tester','Test','2025-05-08 16:04:57',0);
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

-- Dump completed on 2025-05-19 18:30:54
