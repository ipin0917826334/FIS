-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 30, 2024 at 04:51 PM
-- Server version: 10.4.25-MariaDB
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fis`
--

-- --------------------------------------------------------

--
-- Table structure for table `batches`
--

CREATE TABLE `batches` (
  `id` int(11) NOT NULL,
  `batch_number` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `batches`
--

INSERT INTO `batches` (`id`, `batch_number`, `created_at`) VALUES
(1, 'BATCH-20240126-5LA34W', '2024-01-25 22:15:26'),
(2, 'BATCH-20240126-DX79SQ', '2024-01-25 22:25:30'),
(3, 'BATCH-20240126-QD60AC', '2024-01-25 22:34:56'),
(6, 'BATCH-20240126-0Y00GB', '2024-01-25 23:27:36'),
(7, 'BATCH-20240126-I474PD', '2024-01-25 23:35:20'),
(8, 'BATCH-20240126-YAOAJ8', '2024-01-26 01:14:56'),
(9, 'BATCH-20240126-2B3YL7', '2024-01-26 01:26:56'),
(10, 'BATCH-20240127-7JRML2', '2024-01-27 09:52:12'),
(11, 'BATCH-20240127-HC0QLF', '2024-01-27 12:50:24'),
(12, 'BATCH-20240130-OW8TD8', '2024-01-30 15:39:27');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `batch_id` int(11) NOT NULL,
  `ordered_by_user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `batch_id`, `ordered_by_user_id`, `created_at`) VALUES
(1, 1, 1, '2024-01-25 22:15:26'),
(2, 2, 1, '2024-01-25 22:25:30'),
(3, 3, 1, '2024-01-25 22:34:56'),
(4, 6, 1, '2024-01-25 23:27:36'),
(5, 7, 1, '2024-01-25 23:35:20'),
(6, 8, 1, '2024-01-26 01:14:56'),
(7, 9, 1, '2024-01-26 01:26:56'),
(8, 10, 1, '2024-01-27 09:52:12'),
(9, 11, 1, '2024-01-27 12:50:24'),
(10, 12, 1, '2024-01-30 15:39:27');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `lead_time` int(11) DEFAULT NULL,
  `received_date` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `lead_time`, `received_date`) VALUES
(1, 1, 1, 2, 5, NULL),
(2, 1, 7, 3, 5, NULL),
(3, 2, 6, 4, 5, NULL),
(4, 2, 7, 5, 5, NULL),
(5, 3, 4, 22, 5, NULL),
(6, 3, 7, 33, 5, NULL),
(7, 4, 4, 33, 5, '2024-01-30 23:27:36'),
(8, 4, 7, 1, 5, '2024-01-30 23:27:36'),
(9, 5, 4, 3, 5, '2024-01-30 23:35:20'),
(10, 6, 4, 1, 5, '2024-01-31 01:14:56'),
(11, 7, 6, 22, 5, '2024-01-31 01:26:56'),
(12, 7, 4, 333, 5, '2024-01-31 01:26:56'),
(13, 7, 7, 44, 5, '2024-01-31 01:26:56'),
(14, 8, 1, 22, 7, '2024-02-03 09:52:12'),
(15, 9, 4, 4, 7, '2024-02-03 12:50:24'),
(16, 9, 6, 1, 7, '2024-02-03 12:50:24'),
(17, 10, 1, 3, 7, '2024-02-06 15:39:27');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_stock` int(11) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `product_image` varchar(255) DEFAULT NULL,
  `supplier_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `product_name`, `product_stock`, `description`, `price`, `product_image`, `supplier_id`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 'aaa1', 0, 'aaa1', '0.00', '1703346471724-411753457_766501121973257_6668745352510327091_n.jpg', 5, 1, '2023-12-23 15:47:51', '2024-01-25 17:40:46'),
(4, 'ssss1', 391, 'sdcvv', '0.00', '1703347623247-R.png', 5, 1, '2023-12-23 16:07:03', '2024-01-27 12:53:40'),
(6, 'ssdsd', 95, 'aaaaa1', '0.00', '1703355294518-R.png', 5, 1, '2023-12-23 18:14:54', '2024-01-27 12:53:40'),
(7, '123123', 65, '123123', '50.00', '1703427662239-online-voting-tablet.jpg', 6, 1, '2023-12-24 14:21:02', '2024-01-25 17:56:48'),
(8, '123123', 181, '123123', '20.00', '1703705391359-online-voting-tablet.jpg', 6, 1, '2023-12-27 19:29:51', '2024-01-25 15:46:24'),
(12, '213123', 22, '231', '12.00', '1706204584654-online-voting-tablet.jpg', 5, 12, '2024-01-25 17:43:04', '2024-01-25 17:48:08');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `supplier_name` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `supplier_name`, `location`, `email`, `user_id`, `created_at`, `updated_at`) VALUES
(5, 'assa1', 'asasss', 'asdasdssssa@k.co', 1, '2023-12-23 18:14:31', '2024-01-25 17:50:11'),
(6, '121212', '1212', 'a0917826334@gmail.com', 1, '2023-12-24 14:20:18', '2024-01-25 15:44:18');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password`, `created_at`, `updated_at`) VALUES
(1, 'asd', 'aasdasd', 'dddd@hotmail.com', '$2b$10$k3UoW39O0Yth0XvaIMDh2uOT9Z/qoHB5zQwPOMvY6vFqHk73Zkd4a', '2023-12-23 04:16:47', '2023-12-23 07:18:26'),
(7, 'aa', 'asas', 'asdasdsa@k.co', '$2b$10$5f6CG1tp/aIm8tddmC4pXupyq7h2BD0v76u.PbIyTc0PoJnkfeL9e', '2023-12-23 07:22:47', '2023-12-23 07:22:47'),
(8, 'aa1111', 'asas', 'asdasdsdda@k.co', '$2b$10$gFlanEn.1gGd4LHQBPkT1exy02sXp4H/55/Dm90BcuZst0WymYKbC', '2023-12-23 07:25:05', '2023-12-24 14:19:24'),
(12, 'adacx', 'fff', 'cs@gmail.com', '$2b$10$Ku1fs.Kkq8fdEzNK7bWI9.m7YajzilaylrFCaczcN1jEnyQQmNblC', '2024-01-25 17:41:48', '2024-01-25 17:41:48');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `batches`
--
ALTER TABLE `batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `batch_id` (`batch_id`),
  ADD KEY `ordered_by_user_id` (`ordered_by_user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD KEY `fk_product_supplier` (`supplier_id`),
  ADD KEY `fk_product_user` (`user_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD KEY `supplier_name` (`supplier_name`),
  ADD KEY `fk_supplier_user` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD UNIQUE KEY `email` (`email`) USING BTREE;

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `batches`
--
ALTER TABLE `batches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`ordered_by_user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_product_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  ADD CONSTRAINT `fk_product_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD CONSTRAINT `fk_supplier_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
