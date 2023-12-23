/*
 Navicat Premium Data Transfer

 Source Server         : asd
 Source Server Type    : MySQL
 Source Server Version : 100432 (10.4.32-MariaDB)
 Source Host           : localhost:3306
 Source Schema         : fis

 Target Server Type    : MySQL
 Target Server Version : 100432 (10.4.32-MariaDB)
 File Encoding         : 65001

 Date: 23/12/2023 14:40:48
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

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
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'asd', 'aasdasd', 'dddd@hotmail.com', '$2b$10$k3UoW39O0Yth0XvaIMDh2uOT9Z/qoHB5zQwPOMvY6vFqHk73Zkd4a', '2023-12-23 11:16:47', '2023-12-23 14:18:26');
INSERT INTO `users` VALUES (7, 'aa', 'asas', 'asdasdsa@k.co', '$2b$10$5f6CG1tp/aIm8tddmC4pXupyq7h2BD0v76u.PbIyTc0PoJnkfeL9e', '2023-12-23 14:22:47', '2023-12-23 14:22:47');
INSERT INTO `users` VALUES (8, 'aa', 'asas', 'asdasdsdda@k.co', '$2b$10$gFlanEn.1gGd4LHQBPkT1exy02sXp4H/55/Dm90BcuZst0WymYKbC', '2023-12-23 14:25:05', '2023-12-23 14:25:05');
INSERT INTO `users` VALUES (10, 'aa', 'asas', 'asdasdsdda@k.coaasd', '$2b$10$B0vxA50snBoJRuOKm1jvP.156rxDlovgT7IR9x5kIyGDokhi29k.e', '2023-12-23 14:28:30', '2023-12-23 14:28:30');

SET FOREIGN_KEY_CHECKS = 1;
