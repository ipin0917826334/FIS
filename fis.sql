/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 100425 (10.4.25-MariaDB)
 Source Host           : localhost:3306
 Source Schema         : fis

 Target Server Type    : MySQL
 Target Server Version : 100425 (10.4.25-MariaDB)
 File Encoding         : 65001

 Date: 26/01/2024 08:12:05
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for batches
-- ----------------------------
DROP TABLE IF EXISTS `batches`;
CREATE TABLE `batches`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `batch_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of batches
-- ----------------------------
INSERT INTO `batches` VALUES (1, 'BATCH-20240126-5LA34W', '2024-01-26 05:15:26');
INSERT INTO `batches` VALUES (2, 'BATCH-20240126-DX79SQ', '2024-01-26 05:25:30');
INSERT INTO `batches` VALUES (3, 'BATCH-20240126-QD60AC', '2024-01-26 05:34:56');
INSERT INTO `batches` VALUES (6, 'BATCH-20240126-0Y00GB', '2024-01-26 06:27:36');
INSERT INTO `batches` VALUES (7, 'BATCH-20240126-I474PD', '2024-01-26 06:35:20');

-- ----------------------------
-- Table structure for order_items
-- ----------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `lead_time` int NULL DEFAULT NULL,
  `received_date` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `order_id`(`order_id` ASC) USING BTREE,
  INDEX `product_id`(`product_id` ASC) USING BTREE,
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of order_items
-- ----------------------------
INSERT INTO `order_items` VALUES (1, 1, 1, 2, 5, NULL);
INSERT INTO `order_items` VALUES (2, 1, 7, 3, 5, NULL);
INSERT INTO `order_items` VALUES (3, 2, 6, 4, 5, NULL);
INSERT INTO `order_items` VALUES (4, 2, 7, 5, 5, NULL);
INSERT INTO `order_items` VALUES (5, 3, 4, 22, 5, NULL);
INSERT INTO `order_items` VALUES (6, 3, 7, 33, 5, NULL);
INSERT INTO `order_items` VALUES (7, 4, 4, 33, 5, '2024-01-31 06:27:36');
INSERT INTO `order_items` VALUES (8, 4, 7, 1, 5, '2024-01-31 06:27:36');
INSERT INTO `order_items` VALUES (9, 5, 4, 3, 5, '2024-01-31 06:35:20');

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `batch_id` int NOT NULL,
  `ordered_by_user_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `batch_id`(`batch_id` ASC) USING BTREE,
  INDEX `ordered_by_user_id`(`ordered_by_user_id` ASC) USING BTREE,
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`ordered_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of orders
-- ----------------------------
INSERT INTO `orders` VALUES (1, 1, 1, '2024-01-26 05:15:26');
INSERT INTO `orders` VALUES (2, 2, 1, '2024-01-26 05:25:30');
INSERT INTO `orders` VALUES (3, 3, 1, '2024-01-26 05:34:56');
INSERT INTO `orders` VALUES (4, 6, 1, '2024-01-26 06:27:36');
INSERT INTO `orders` VALUES (5, 7, 1, '2024-01-26 06:35:20');

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `product_stock` int NULL DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `price` decimal(10, 2) NOT NULL,
  `product_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `supplier_id` int NOT NULL,
  `user_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_product_supplier`(`supplier_id` ASC) USING BTREE,
  INDEX `fk_product_user`(`user_id` ASC) USING BTREE,
  CONSTRAINT `fk_product_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_product_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of products
-- ----------------------------
INSERT INTO `products` VALUES (1, 'aaa1', 0, 'aaa1', 0.00, '1703346471724-411753457_766501121973257_6668745352510327091_n.jpg', 5, 1, '2023-12-23 22:47:51', '2024-01-26 00:40:46');
INSERT INTO `products` VALUES (4, 'ssss1', 395, 'sdcvv', 0.00, '1703347623247-R.png', 5, 1, '2023-12-23 23:07:03', '2024-01-26 00:56:31');
INSERT INTO `products` VALUES (6, 'ssdsd', 96, 'aaaaa1', 0.00, '1703355294518-R.png', 5, 1, '2023-12-24 01:14:54', '2024-01-26 00:56:48');
INSERT INTO `products` VALUES (7, '123123', 65, '123123', 50.00, '1703427662239-online-voting-tablet.jpg', 6, 1, '2023-12-24 21:21:02', '2024-01-26 00:56:48');
INSERT INTO `products` VALUES (8, '123123', 181, '123123', 20.00, '1703705391359-online-voting-tablet.jpg', 6, 1, '2023-12-28 02:29:51', '2024-01-25 22:46:24');
INSERT INTO `products` VALUES (12, '213123', 22, '231', 12.00, '1706204584654-online-voting-tablet.jpg', 5, 12, '2024-01-26 00:43:04', '2024-01-26 00:48:08');

-- ----------------------------
-- Table structure for suppliers
-- ----------------------------
DROP TABLE IF EXISTS `suppliers`;
CREATE TABLE `suppliers`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `supplier_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `user_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `supplier_name`(`supplier_name` ASC) USING BTREE,
  INDEX `fk_supplier_user`(`user_id` ASC) USING BTREE,
  CONSTRAINT `fk_supplier_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of suppliers
-- ----------------------------
INSERT INTO `suppliers` VALUES (5, 'assa1', 'asasss', 'asdasdssssa@k.co', 1, '2023-12-24 01:14:31', '2024-01-26 00:50:11');
INSERT INTO `suppliers` VALUES (6, '121212', '1212', 'a0917826334@gmail.com', 1, '2023-12-24 21:20:18', '2024-01-25 22:44:18');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `last_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NULL DEFAULT current_timestamp,
  `updated_at` datetime NULL DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `email`(`email` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'asd', 'aasdasd', 'dddd@hotmail.com', '$2b$10$k3UoW39O0Yth0XvaIMDh2uOT9Z/qoHB5zQwPOMvY6vFqHk73Zkd4a', '2023-12-23 11:16:47', '2023-12-23 14:18:26');
INSERT INTO `users` VALUES (7, 'aa', 'asas', 'asdasdsa@k.co', '$2b$10$5f6CG1tp/aIm8tddmC4pXupyq7h2BD0v76u.PbIyTc0PoJnkfeL9e', '2023-12-23 14:22:47', '2023-12-23 14:22:47');
INSERT INTO `users` VALUES (8, 'aa1111', 'asas', 'asdasdsdda@k.co', '$2b$10$gFlanEn.1gGd4LHQBPkT1exy02sXp4H/55/Dm90BcuZst0WymYKbC', '2023-12-23 14:25:05', '2023-12-24 21:19:24');
INSERT INTO `users` VALUES (12, 'adacx', 'fff', 'cs@gmail.com', '$2b$10$Ku1fs.Kkq8fdEzNK7bWI9.m7YajzilaylrFCaczcN1jEnyQQmNblC', '2024-01-26 00:41:48', '2024-01-26 00:41:48');

SET FOREIGN_KEY_CHECKS = 1;
