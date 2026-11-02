-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 02, 2026 at 03:30 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `shophoa999`
--

-- --------------------------------------------------------

--
-- Table structure for table `banners`
--

CREATE TABLE `banners` (
  `id` int(11) NOT NULL,
  `image` varchar(255) NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `order_num` int(11) DEFAULT 0,
  `status` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `banners`
--

INSERT INTO `banners` (`id`, `image`, `link`, `order_num`, `status`, `created_at`, `deleted_at`) VALUES
(2, 'banners/Is69R3g751Qp2EVZWacdpGAc1DKz1NCm9E0Lh6du.jpg', '/products', 1, 1, '2026-10-31 20:21:42', NULL),
(3, 'banners/Pec6nnPjP2uI4fsX92YCvu7yGaVpbgg4z1njUmjE.jpg', NULL, 2, 1, '2026-10-31 20:21:58', NULL),
(5, 'banners/LITfRDwW4uiYnQ0t5EiKxz1m7zxg4rVbqLbNNXOo.jpg', NULL, 3, 1, '2026-10-31 20:22:30', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `brands`
--

INSERT INTO `brands` (`id`, `name`, `slug`, `image`, `description`, `status`, `created_at`, `deleted_at`) VALUES
(1, 'Flower Farm', 'flower-farm', 'brands/BrDOpNHz3At27nhDcbBRtt1IleUfuz4zmXTbfGjR.jpg', 'dgsdbsdb', 1, '2026-09-28 03:58:09', NULL),
(3, 'pháp', 'phap', 'brands/62OSjwoHCo5Uvp2O62Uko0PUjYG1XTnamjXdFwBx.jpg', 'ưdwqqef', 1, '2026-10-31 03:30:18', NULL),
(4, 'Da Lat', 'da-lat', 'brands/NPZriqd3NxPbDw1FF7tjdiNF8QYoveVEUynazOzU.jpg', 'ai  về đà lạt chơi', 1, '2026-11-01 18:11:01', NULL),
(5, 'Hasfam', 'hasfam', 'brands/xm7ribvxGnX4Ds9I6bjOVaLMjctM1BnHQYRGizme.jpg', 'hoa đẹp  nhất', 1, '2026-11-01 18:11:59', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel-cache-5c785c036466adea360111aa28563bfd556b5fba', 'i:1;', 1793548504),
('laravel-cache-5c785c036466adea360111aa28563bfd556b5fba:timer', 'i:1793548504;', 1793548504);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `parent_id`, `name`, `slug`, `image`, `is_featured`, `status`, `created_at`) VALUES
(4, NULL, 'Hoa Tình Yêu', 'hoa-tinh-yeu', 'categories/Lrwqjebt00bft2Dx6xbSQbQj40xKBXcHCxmsbnoz.jpg', 1, 1, '2026-10-05 09:57:22'),
(22, NULL, 'Hoa Sinh Nhật', 'hoa-sinh-nhat', 'categories/4F6tEqtS2yKHxzDaIZLldS67EKFLGDSWQIUQSdWp.png', 1, 1, '2026-10-31 18:39:05'),
(24, NULL, 'Hoa Sinh Viên', 'hoa-sinh-vien', 'categories/EfjQmF9ABKuB8n5EmnxmhtOA7VWfVCluzabX5txC.webp', 1, 1, '2026-10-31 18:40:06'),
(25, NULL, 'Hoa Theo Mùa', 'hoa-theo-mua', 'categories/lL2Uu2IYXF8pus3G6I8KtFuLWZS85zltvz1w6bLZ.webp', 1, 1, '2026-10-31 18:41:04'),
(26, NULL, 'Hoa Khai Trương', 'hoa-khai-truong', 'categories/8Gj6oCcwkgty17LUqqWFC4LdN1BofJV4FktmG0oD.png', 0, 1, '2026-10-31 18:43:26'),
(27, NULL, 'vdsdvsdv', 'vdsdvsdv', 'categories/37qmM1RoSm8N7NqYzvwH6YqS2E8rJKC5DGPDRwgM.webp', 0, 0, '2026-11-01 18:36:57'),
(28, NULL, 'sd s s è', 'sd-s-s-e', 'categories/6uUrOPb1w7NjQokJlsNxKqdI5q8jLAFfyR5z1g3P.jpg', 0, 0, '2026-11-01 18:37:08');

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `message` text NOT NULL,
  `reply` text DEFAULT NULL,
  `replied_at` datetime DEFAULT NULL,
  `status` varchar(20) DEFAULT 'chua_xem',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `user_id`, `name`, `phone`, `email`, `message`, `reply`, `replied_at`, `status`, `created_at`, `deleted_at`) VALUES
(1, NULL, 'Nguyen Van A', '0987654321', 'nguyenvana@gmail.com', 'Tôi muốn tư vấn đặt hoa sinh nhật giao tận nơi.', NULL, NULL, 'chua_xem', '2026-11-01 08:51:17', NULL),
(2, NULL, 'dungcute', '0987654321', 'dung9@gmail.com', 'nghia cho đẻ', 'oke t đây', '2026-11-01 15:54:29', 'da_xem', '2026-11-01 08:54:04', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` varchar(255) NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` smallint(5) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `menus`
--

CREATE TABLE `menus` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `link` varchar(255) NOT NULL,
  `parent_id` int(11) DEFAULT 0,
  `order_num` int(11) DEFAULT 0,
  `status` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `menus`
--

INSERT INTO `menus` (`id`, `name`, `link`, `parent_id`, `order_num`, `status`, `created_at`, `deleted_at`) VALUES
(1, 'TRANG CHỦ', '/', 0, 1, 1, '2026-11-01 08:30:58', NULL),
(2, 'GIỚI THIỆU', '/pages/gioi-thieu', 0, 2, 1, '2026-11-01 08:30:58', NULL),
(3, 'SẢN PHẨM', '/products', 0, 3, 1, '2026-11-01 08:30:58', NULL),
(4, 'BÀI VIẾT', '/posts', 0, 4, 1, '2026-11-01 08:30:58', NULL),
(5, 'LIÊN HỆ', '/contact', 0, 5, 1, '2026-11-01 08:30:58', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2026_09_28_042536_add_deleted_at_to_products_table', 1),
(2, '2026_09_28_044236_add_deleted_at_to_brands_table', 2),
(3, '0001_01_01_000000_create_users_table', 1),
(4, '0001_01_01_000001_create_cache_table', 1),
(5, '0001_01_01_000002_create_jobs_table', 1),
(6, '2026_09_21_080555_create_personal_access_tokens_table', 1),
(7, '2026_10_19_000001_add_is_featured_to_products_table', 3),
(8, '2026_11_01_000001_ensure_laravel_system_tables', 4),
(9, '2026_11_01_000002_add_deleted_at_to_productsale_table', 5),
(10, '2026_11_01_000003_add_deleted_at_to_banners_table', 5),
(11, '2026_11_01_000004_add_deleted_at_to_remaining_tables', 5),
(12, '2026_11_01_000005_add_deleted_at_to_stock_documents_table', 5),
(13, '2026_11_01_000006_add_deleted_at_to_suppliers_table', 5),
(14, '2026_11_01_000007_create_reviews_table', 6);

-- --------------------------------------------------------

--
-- Table structure for table `order`
--

CREATE TABLE `order` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `address` varchar(255) NOT NULL,
  `note` text DEFAULT NULL,
  `payment_method` varchar(30) NOT NULL DEFAULT 'cod',
  `payment_status` tinyint(1) NOT NULL DEFAULT 0,
  `coupon_code` varchar(50) DEFAULT NULL,
  `discount_amount` int(11) NOT NULL DEFAULT 0,
  `shipping_fee` int(11) NOT NULL DEFAULT 0,
  `total` int(11) NOT NULL DEFAULT 0,
  `status` tinyint(3) UNSIGNED NOT NULL DEFAULT 1 COMMENT '1 Cho xac nhan, 2 Da xac nhan, 3 Dang giao, 4 Hoan tat, 5 Da huy',
  `cancel_reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order`
--

INSERT INTO `order` (`id`, `user_id`, `name`, `phone`, `email`, `address`, `note`, `payment_method`, `payment_status`, `coupon_code`, `discount_amount`, `shipping_fee`, `total`, `status`, `cancel_reason`, `created_at`, `updated_at`) VALUES
(21, 4, 'nghiahuynh123', '0348803484', NULL, 'sdgsd', 'sgsdssg', 'qr', 0, NULL, 0, 0, 11000, 5, 'Khách hàng tự hủy trên trang cá nhân', '2026-10-31 18:56:45', '2026-11-01 07:55:16'),
(22, 4, 'dung dev', '0343977821', NULL, 'dung cute', 'dfsdvcsd f', 'qr', 1, NULL, 0, 0, 3000, 5, NULL, '2026-10-31 20:50:31', '2026-11-01 17:57:42'),
(23, 4, 'dung dev', '0343977821', NULL, 'hfgh', 'fghfgh', 'qr', 1, NULL, 0, 0, 3000, 5, NULL, '2026-10-31 21:08:22', '2026-11-01 17:58:02'),
(24, 4, 'dung dev', '0343977821', NULL, 'quận 1', 'dfvdfvdfv dfgvd fv dfgvd', 'qr', 1, NULL, 0, 0, 3000, 5, NULL, '2026-11-01 06:50:03', '2026-11-01 17:57:59'),
(25, 4, 'dung dev', '0343977821', NULL, 'dsv', 'sdvsdv', 'qr', 1, 'GIAM10', 600, 0, 5400, 5, NULL, '2026-11-01 07:12:06', '2026-11-01 17:57:55'),
(26, 6, 'dungcute', '0987654321', NULL, 'fv sfd', 'sd', 'qr', 1, NULL, 0, 0, 3000, 5, NULL, '2026-11-01 09:01:15', '2026-11-01 17:57:52'),
(27, NULL, 'Khach Hang Test Mail', '0901234567', 'testcustomer@gmail.com', '123 Vo Van Ngan, TP Thu Duc', 'Giao gio hanh chinh giup minh', 'cod', 0, NULL, 0, 0, 3000, 5, NULL, '2026-11-01 09:03:33', '2026-11-01 17:57:46'),
(28, NULL, 'Chanh Chanh', '0909123456', 'cchanhcchanh999@gmail.com', 'Khu Cong Nghe Cao, TP Thu Duc, TP.HCM', 'Don hang test gui mail that ve Gmail!', 'cod', 0, NULL, 0, 0, 6000, 5, NULL, '2026-11-01 09:09:06', '2026-11-01 17:57:49'),
(29, 8, 'Huu Nghia', '0987654321', NULL, 'q9 ahihih', 'i9h9hb', 'qr', 1, 'GIAM10', 700, 0, 6300, 1, NULL, '2026-11-01 19:43:14', '2026-11-01 19:44:42'),
(30, 8, 'Huu Nghia', '0987654321', NULL, 'quận 1 ahi', 'ahihi', 'qr', 1, 'GIAM10', 700, 0, 6300, 1, NULL, '2026-11-01 19:49:31', '2026-11-01 19:49:44'),
(31, 8, 'Huu Nghia', '0987654321', 'huyhuynhfa@gmail.com', 'q11', 'ahihih', 'qr', 1, NULL, 0, 0, 7000, 1, NULL, '2026-11-01 20:02:47', '2026-11-01 20:03:03'),
(32, 9, 'nghiademo1', '0937377363', 'huyhuynhfa123@gmail.com', 'ewewfef', 'ưeefwefew', 'qr', 1, 'GIAM10', 50000, 0, 557000, 5, 'Khách hàng tự hủy trên trang cá nhân', '2026-11-01 22:48:15', '2026-11-01 22:49:01'),
(33, 9, 'nghiademo1', '0937377363', 'huyhuynhfa123@gmail.com', 'fewewefe', 'ưefefwew', 'qr', 1, 'GIAM10', 700, 0, 6300, 1, NULL, '2026-11-01 22:49:40', '2026-11-01 22:51:17'),
(34, 9, 'nghiademo1', '0937377363', 'huyhuynhfa123@gmail.com', 'ừewwfewfe', 'ewffewewf', 'qr', 0, NULL, 0, 0, 59000, 1, NULL, '2026-11-01 23:02:31', '2026-11-01 23:02:31'),
(35, 9, 'nghiademo1', '0937377363', 'huyhuynhfa123@gmail.com', 'cgnn', 'cncnb', 'qr', 1, NULL, 0, 0, 7000, 1, NULL, '2026-11-01 23:17:44', '2026-11-01 23:18:05'),
(36, 9, 'nghiademo1', '0937377363', 'huyhuynhfa123@gmail.com', 'jjh', ',jui', 'qr', 1, NULL, 0, 0, 7000, 1, NULL, '2026-11-01 23:21:51', '2026-11-01 23:22:31'),
(37, 9, 'nghiademo1', '0937377363', 'huyhuynhfa123@gmail.com', 'grewrh', 'grgrh', 'qr', 0, NULL, 0, 0, 59000, 1, NULL, '2026-11-01 23:23:46', '2026-11-01 23:23:46'),
(38, 9, 'nghiademo1', '0937377363', 'huyhuynhfa123@gmail.com', 's gsgs r', 'f sgsg', 'qr', 0, NULL, 0, 0, 284000, 1, 'Khách hàng hủy thanh toán QR', '2026-11-01 23:25:27', '2026-11-02 00:51:36'),
(39, 8, 'Huu Nghia', '0987654321', 'huyhuynhfa@gmail.com', 'huhuh', 'ji', 'qr', 1, NULL, 0, 0, 7000, 1, NULL, '2026-11-02 01:01:30', '2026-11-02 01:01:51'),
(40, 8, 'Huu Nghia', '0987654321', 'huyhuynhfa@gmail.com', 'húdhdsah', 'áknafsnk', 'qr', 1, 'GIAM10', 1400, 0, 12600, 2, NULL, '2026-11-02 01:12:37', '2026-11-02 01:13:59');

-- --------------------------------------------------------

--
-- Table structure for table `orderdetail`
--

CREATE TABLE `orderdetail` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` int(11) NOT NULL,
  `price` int(11) NOT NULL,
  `qty` int(11) NOT NULL DEFAULT 1,
  `amount` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orderdetail`
--

INSERT INTO `orderdetail` (`id`, `order_id`, `product_id`, `price`, `qty`, `amount`) VALUES
(31, 21, 22, 11000, 1, 11000),
(32, 22, 23, 3000, 1, 3000),
(33, 23, 23, 3000, 1, 3000),
(34, 24, 23, 3000, 1, 3000),
(35, 25, 23, 3000, 2, 6000),
(36, 26, 23, 3000, 1, 3000),
(37, 27, 23, 3000, 1, 3000),
(38, 28, 23, 3000, 2, 6000),
(39, 29, 37, 7000, 1, 7000),
(40, 30, 36, 7000, 1, 7000),
(41, 31, 37, 7000, 1, 7000),
(42, 32, 40, 600000, 1, 600000),
(43, 32, 37, 7000, 1, 7000),
(44, 33, 37, 7000, 1, 7000),
(45, 34, 34, 59000, 1, 59000),
(46, 35, 36, 7000, 1, 7000),
(47, 36, 37, 7000, 1, 7000),
(48, 37, 34, 59000, 1, 59000),
(49, 38, 34, 59000, 1, 59000),
(50, 38, 39, 225000, 1, 225000),
(51, 39, 37, 7000, 1, 7000),
(52, 40, 37, 7000, 2, 14000);

-- --------------------------------------------------------

--
-- Table structure for table `pages`
--

CREATE TABLE `pages` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `summary` varchar(500) DEFAULT NULL,
  `content` longtext NOT NULL,
  `status` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pages`
--

INSERT INTO `pages` (`id`, `title`, `slug`, `summary`, `content`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Giới thiệu về Hoa Yêu Thương', 'gioi-thieu', 'Trao gửi yêu thương qua từng đóa hoa tươi thắm - Shop hoa tươi uy tín hàng đầu', '<h3>Chào mừng bạn đến với Hoa Yêu Thương!</h3><p>Được thành lập với sứ mệnh mang đến những cảm xúc trọn vẹn nhất, Hoa Yêu Thương luôn nỗ lực không ngừng để tạo ra những tác phẩm hoa tươi nghệ thuật tinh tế và độc đáo.</p><h4>1. Cam kết chất lượng</h4><p>Chúng tôi tuyển chọn 100% hoa tươi Đà Lạt và hoa nhập khẩu cao cấp trong ngày. Từng cành hoa được kiểm tra tỉ mỉ trước khi cắm để đảm bảo độ tươi từ 3-5 ngày.</p><h4>2. Dịch vụ điện hoa tận tâm</h4><p>Giao hoa siêu tốc trong 60-90 phút tại nội thành TP.HCM và Hà Nội. Cam kết hoa giống mẫu trên 90%, chụp hình gửi quý khách xác nhận trước khi giao.</p>', 1, '2026-09-20 16:05:14', '2026-11-01 08:48:34', NULL),
(2, 'Chính sách đổi trả', 'chinh-sach-doi-tra', 'Quy định đổi trả và hoàn tiền minh bạch, đảm bảo quyền lợi khách hàng', '<h3>Chính sách đổi trả hoa tươi</h3><p>Khách hàng được quyền kiểm tra hoa trước khi nhận. Trong trường hợp hoa bị dập nát, héo úa hoặc sai mẫu so với yêu cầu, chúng tôi cam kết đổi mới 100% hoàn toàn miễn phí hoặc hoàn tiền ngay trong vòng 24 giờ.</p>', 1, '2026-09-20 16:05:14', '2026-11-01 08:48:34', NULL),
(3, 'Hướng dẫn mua hàng', 'huong-dan-mua-hang', 'Các bước đặt hoa trực tuyến dễ dàng và tiện lợi', '<h3>Cách thức đặt hoa online</h3><ol><li><strong>Bước 1:</strong> Chọn mẫu hoa ưng ý trong danh mục Sản phẩm.</li><li><strong>Bước 2:</strong> Nhấn \"Thêm vào giỏ\" hoặc \"Mua ngay\".</li><li><strong>Bước 3:</strong> Điền đầy đủ thông tin người nhận, lời chúc ghi trên thiệp và địa chỉ giao hàng.</li><li><strong>Bước 4:</strong> Chọn phương thức thanh toán (COD hoặc Chuyển khoản QR SePay).</li></ol>', 1, '2026-09-20 16:05:14', '2026-11-01 08:48:34', NULL),
(4, 'Chính sách vận chuyển', 'chinh-sach-van-chuyen', 'Thời gian giao hàng và biểu phí giao hoa tận nơi', '<h3>Quy định về thời gian và phí giao hàng</h3><p>Miễn phí giao hoa cho đơn hàng từ 500.000đ trong bán kính 5km. Các khu vực xa hơn áp dụng mức phí ưu đãi chỉ từ 20.000đ - 30.000đ.</p><p>Thời gian giao hàng hoạt động liên tục từ 07:00 đến 21:00 hàng ngày kể cả ngày Lễ, Tết.</p>', 1, '2026-11-01 08:48:34', '2026-11-01 08:48:34', NULL),
(5, 'Chính sách hoàn tiền', 'chinh-sach-hoan-tien', 'Cam kết hoàn tiền 100% nếu quý khách không hài lòng về chất lượng sản phẩm', '<h3>Cam kết hoàn tiền</h3><p>Nếu sản phẩm giao đến không đúng chủng loại hoa, hoa bị hỏng do quá trình vận chuyển, quý khách vui lòng phản hồi qua hotline 028 7300 2010. Tiền sẽ được hoàn lại vào tài khoản ngân hàng của quý khách trong vòng 24 giờ.</p>', 1, '2026-11-01 08:48:34', '2026-11-01 08:48:34', NULL),
(6, 'Hình thức thanh toán', 'hinh-thuc-thanh-toan', 'Hỗ trợ thanh toán linh hoạt qua chuyển khoản tự động và thanh toán khi nhận hàng', '<h3>Các hình thức thanh toán hỗ trợ</h3><p>1. Thanh toán khi nhận hàng (COD): Quý khách thanh toán trực tiếp cho nhân viên giao hoa.</p><p>2. Chuyển khoản ngân hàng qua mã QR (SePay): Hệ thống tự động xác nhận đơn hàng ngay sau 3 giây mà không cần gọi điện kiểm tra.</p>', 1, '2026-11-01 08:48:34', '2026-11-01 08:48:34', NULL),
(7, 'Bảo mật thông tin', 'bao-mat-thong-tin', 'Chính sách bảo vệ thông tin cá nhân và quyền riêng tư của khách hàng', '<h3>Cam kết bảo mật</h3><p>Hoa Yêu Thương tôn trọng và cam kết bảo vệ thông tin cá nhân của bạn. Thông tin đặt hàng bao gồm tên, số điện thoại, địa chỉ và thông điệp gửi tặng chỉ phục vụ mục đích giao hàng và chăm sóc khách hàng, không bao giờ được chia sẻ cho bên thứ ba.</p>', 1, '2026-11-01 08:48:34', '2026-11-01 08:48:34', NULL),
(8, 'Câu hỏi thường gặp', 'cau-hoi-thuong-gap', 'Giải đáp các thắc mắc phổ biến của quý khách khi mua hoa', '<h3>Câu hỏi thường gặp (FAQ)</h3><p><strong>1. Hoa có giống hình mẫu không?</strong><br/>Shop cam kết sản phẩm thực tế giống hình từ 90% trở lên. Chúng tôi sẽ chụp ảnh sản phẩm thật gửi quý khách trước khi giao.</p><p><strong>2. Tôi có thể yêu cầu cắm theo yêu cầu riêng không?</strong><br/>Có, quý khách vui lòng liên hệ hotline hoặc gửi tin nhắn liên hệ để nghệ nhân tư vấn thiết kế riêng.</p>', 1, '2026-11-01 08:48:34', '2026-11-01 08:48:34', NULL),
(9, 'Xử lý khiếu nại', 'xu-ly-khieu-nai', 'Quy trình tiếp nhận và xử lý khiếu nại của khách hàng', '<h3>Quy trình xử lý khiếu nại</h3><p>Mọi thắc mắc và khiếu nại xin gửi về email cskh@hoayeuthuong.com hoặc gọi hotline 028 7300 2010. Chúng tôi cam kết giải quyết thỏa đáng mọi yêu cầu trong vòng tối đa 2 giờ làm việc.</p>', 1, '2026-11-01 08:48:34', '2026-11-01 08:48:34', NULL),
(10, 'Tại sao nên chọn chúng tôi', 'tai-sao-chon-chung-toi', 'Những lý do giúp Hoa Yêu Thương nhận được sự tin yêu của hàng ngàn khách hàng', '<h3>Ưu điểm vượt trội</h3><ul><li>Hoa tươi mới mỗi ngày, nguồn hoa sạch rõ nguồn gốc.</li><li>Thiết kế hoa nghệ thuật, sang trọng, đón đầu xu hướng.</li><li>Giao hoa siêu tốc và đúng hẹn.</li><li>Đội ngũ chăm sóc khách hàng chu đáo 24/7.</li></ul>', 1, '2026-11-01 08:48:34', '2026-11-01 08:48:34', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `email` varchar(150) NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(2, 'App\\Models\\User', 3, 'auth_token', '5b4ce2e518eb89f5daa561d3d929df1e40db72545a6fb8401b64dc039be306d3', '[\"*\"]', '2026-10-31 01:36:37', NULL, '2026-10-31 01:35:43', '2026-10-31 01:36:37'),
(3, 'App\\Models\\User', 4, 'auth_token', 'cc5ae959f582c1c981740ca619cdf3491e9027050dc838613fe3772409b4c01d', '[\"*\"]', NULL, NULL, '2026-10-31 07:07:37', '2026-10-31 07:07:37'),
(4, 'App\\Models\\User', 4, 'auth_token', '119ec862c5a90563445bfc1717dc5a4ca3034b641da06e8594d040facab466cb', '[\"*\"]', NULL, NULL, '2026-10-31 07:07:56', '2026-10-31 07:07:56'),
(5, 'App\\Models\\User', 4, 'auth_token', 'e512f38504b6ba8af90dd3d3ce4bee53c5c43408fcd38147fd81af80138ae975', '[\"*\"]', NULL, NULL, '2026-10-31 07:08:21', '2026-10-31 07:08:21'),
(6, 'App\\Models\\User', 4, 'auth_token', 'd8b79254b9dba647d1c571fabfcab079b1be76a973ee6e56fee0fba9e54646a8', '[\"*\"]', NULL, NULL, '2026-10-31 07:11:20', '2026-10-31 07:11:20'),
(7, 'App\\Models\\User', 5, 'auth_token', '8647b54ffd39a8770e969d4553fb33b3d82a2199fcc5dd32eafe272363770b3e', '[\"*\"]', NULL, NULL, '2026-10-31 07:11:55', '2026-10-31 07:11:55'),
(8, 'App\\Models\\User', 5, 'auth_token', 'fdd01916607b997e613c6ee7937bd339d0adc1d6d37e5e43095e62817555922d', '[\"*\"]', NULL, NULL, '2026-10-31 07:12:16', '2026-10-31 07:12:16'),
(9, 'App\\Models\\User', 4, 'auth_token', '755b1023a440aa84c64b1ede497349bee66d160d63794ca26a76a94e68ee1a77', '[\"*\"]', NULL, NULL, '2026-10-31 07:23:22', '2026-10-31 07:23:22'),
(10, 'App\\Models\\User', 4, 'auth_token', 'e794849213e969edf54f17d2aa17dcfa9fade5ac64ad98dd005b4cddda12768b', '[\"*\"]', NULL, NULL, '2026-10-31 07:30:02', '2026-10-31 07:30:02'),
(11, 'App\\Models\\User', 4, 'auth_token', 'fea66be8b85391b64b190608d83f2f0571e863d693cd0803703376a6953ce063', '[\"*\"]', NULL, NULL, '2026-10-31 07:32:05', '2026-10-31 07:32:05'),
(12, 'App\\Models\\User', 4, 'auth_token', 'e47cc8014084e4045855d2a7fd61fc8e9e55ff0db47d558656b462bebc8f14e7', '[\"*\"]', NULL, NULL, '2026-10-31 07:35:43', '2026-10-31 07:35:43'),
(13, 'App\\Models\\User', 6, 'auth_token', '77e8306730ee2f6e007c0e49b1198e5d65227e11eb0b9b6d59debba1beee8dba', '[\"*\"]', NULL, NULL, '2026-11-01 08:11:51', '2026-11-01 08:11:51'),
(14, 'App\\Models\\User', 6, 'auth_token', '422d74e32242ff268d76c79299a19737cdf33e0bd0ed90b0aaa0b1d0e8fc05f2', '[\"*\"]', NULL, NULL, '2026-11-01 08:12:40', '2026-11-01 08:12:40'),
(15, 'App\\Models\\User', 6, 'auth_token', '0c704b2a796ca285d5609326a95c7aeeb3e97ea2966d4907a660d56db4a0e968', '[\"*\"]', NULL, NULL, '2026-11-01 08:12:49', '2026-11-01 08:12:49'),
(16, 'App\\Models\\User', 6, 'auth_token', 'de343ff06f3713506ed846c8670cf73b28f136f1e21a7a4c2cf64b6a3f1d7247', '[\"*\"]', NULL, NULL, '2026-11-01 08:12:55', '2026-11-01 08:12:55'),
(17, 'App\\Models\\User', 7, 'auth_token', '91a8bd6eceed9b263eca749b0924250569ab3a1f2a03c8747ed7d03b9763ebd1', '[\"*\"]', NULL, NULL, '2026-11-01 09:21:01', '2026-11-01 09:21:01'),
(18, 'App\\Models\\User', 6, 'auth_token', 'b90286d8ea0132b762a81563c460b7e277742b74ffdb6a2acfbc7a7cb0103038', '[\"*\"]', '2026-11-01 10:19:10', NULL, '2026-11-01 09:41:44', '2026-11-01 10:19:10'),
(19, 'App\\Models\\User', 8, 'auth_token', '58b4ef600b76dd8985171e5fb3e9a871a2bdb8b6b6c65bd16f4a2849afd83bff', '[\"*\"]', NULL, NULL, '2026-11-01 19:39:32', '2026-11-01 19:39:32'),
(20, 'App\\Models\\User', 8, 'auth_token', 'beccb5c0ee42874c1cbd668a0898742f15fe1545969c83b7d1bdbb12bf2cccc7', '[\"*\"]', NULL, NULL, '2026-11-01 19:39:39', '2026-11-01 19:39:39'),
(21, 'App\\Models\\User', 8, 'auth_token', '62131fe71ff83ec1df954b780751fcec16734f42ffcc6244ae443fa06e2cbd9d', '[\"*\"]', '2026-11-01 20:01:41', NULL, '2026-11-01 19:42:23', '2026-11-01 20:01:41'),
(22, 'App\\Models\\User', 9, 'auth_token', '11b1d0a8450614e3fd9d309943d8c17a8a761776148dd0a4ac67f556adafdb21', '[\"*\"]', NULL, NULL, '2026-11-01 22:40:33', '2026-11-01 22:40:33'),
(23, 'App\\Models\\User', 9, 'auth_token', 'b6913dde4e33091df156e5beda21d7bbbadb80cc7dc6095a4c914df649e816c6', '[\"*\"]', NULL, NULL, '2026-11-01 22:40:52', '2026-11-01 22:40:52'),
(24, 'App\\Models\\User', 9, 'auth_token', 'e23b607dc9d0796e3ce895823b5e49151a786525de492c4b1126b55a410f8f87', '[\"*\"]', '2026-11-01 22:46:14', NULL, '2026-11-01 22:42:52', '2026-11-01 22:46:14'),
(25, 'App\\Models\\User', 8, 'auth_token', '466e855cfa4a7aa4272b4afa683265204fcc683baff501beb60fddcc38ebe0bd', '[\"*\"]', NULL, NULL, '2026-11-02 01:00:09', '2026-11-02 01:00:09'),
(26, 'App\\Models\\User', 8, 'auth_token', '720991233b0ec0a088974ecb111fafc35e002257cfc4d0202818a70264b1be36', '[\"*\"]', NULL, NULL, '2026-11-02 01:10:32', '2026-11-02 01:10:32'),
(27, 'App\\Models\\User', 8, 'auth_token', '708fa6febaf817ba9dc23a1a8e40a5e1b994ea8d463afcb3cd2af181af03b1e0', '[\"*\"]', '2026-11-02 01:16:18', NULL, '2026-11-02 01:11:44', '2026-11-02 01:16:18'),
(28, 'App\\Models\\User', 10, 'auth_token', '1490ffebe9284ab3b4987797a6cec0b725a5e5dfe35857dd27a37a19987f1052', '[\"*\"]', NULL, NULL, '2026-11-02 07:26:29', '2026-11-02 07:26:29'),
(29, 'App\\Models\\User', 10, 'auth_token', '749040811dc736c216d30276892874cf95188e4ab065a939fc3aa6603d1316a1', '[\"*\"]', NULL, NULL, '2026-11-02 07:27:30', '2026-11-02 07:27:30'),
(30, 'App\\Models\\User', 11, 'auth_token', '906ba23e9893184e60b0b485964f97ea4d2a74fc27fc7ebfc517a05619bfd2c3', '[\"*\"]', NULL, NULL, '2026-11-02 07:28:22', '2026-11-02 07:28:22'),
(31, 'App\\Models\\User', 11, 'auth_token', 'a8c35401d5f7b1d08f1da17626ad200c7a02f5a2985d4f36c34920fd7a508444', '[\"*\"]', NULL, NULL, '2026-11-02 07:28:40', '2026-11-02 07:28:40'),
(32, 'App\\Models\\User', 11, 'auth_token', 'a3f597b6e7445e10ca959a6487769304f1534780a28bc8eb8bff1adca1f1ecdc', '[\"*\"]', NULL, NULL, '2026-11-02 07:29:16', '2026-11-02 07:29:16');

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `topic_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `summary` varchar(500) DEFAULT NULL,
  `content` text NOT NULL,
  `status` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `user_id`, `topic_id`, `title`, `slug`, `image`, `summary`, `content`, `status`, `created_at`, `deleted_at`) VALUES
(1, NULL, NULL, 'bí quyết', 'bi-quyet', 'posts/HNpxpOnUhRwXUk5IOF0xVfZWjnVlqotSpfUTdLb1.webp', 'chăm sóc', 'Tư vấn thiết kế nội thất chung cư cho người mệnh Kim\r\nThiết kế nội thất chung cư cho người mệnh Kim để có cuộc sống bình an, thịnh vượng. Bài viết dưới đây là những tư vấn tâm huyết của KTS am hiểu sâu về phong thủy, có kinh nghiệm nhiều năm thiết kế nội thất chung cư cho người mệnh Kim.\r\n\r\nTheo quan niệm của phương Đông, mỗi con người đều có số mệnh. Tùy thuộc vào năm sinh mà ứng với cung mệnh của mình. Số mệnh có bình an, thịnh vượng phụ thuộc vào nhiều yếu tố, trong đó có ngôi nhà mà họ sinh sống. Vậy nên trong thiết kế nội thất nhà ở nói chung và thiết kế nội thất chung cư nói riêng, các KTS đều rất quan tâm đến mệnh của gia chủ.\r\n\r\n\r\n\r\nThiết kế nội thất chung cư cho người mệnh kim cần lưu ý đến các yếu tố về màu sắc, hướng và sự bố trí nội thất các không gian chung và riêng.\r\n\r\n1. Người mệnh Kim: Năm sinh, tính cách và màu sắc bản mệnh\r\nNgười mệnh kim sinh vào các năm:\r\n\r\nNhâm Thân (1932, 1992), Quý Dậu (1933, 1993) Kiếm phong kim – Vàng mũi kiếm.\r\n\r\nCanh Thìn (1940, 2000), Tân Tỵ (1941, 2001) Bạch lạp kim – Vàng trong nến.\r\n\r\nGiáp Ngọ (1954, 2014), Ất Mùi (1955, 2015) Sa trung kim – Vàng trong cát.\r\n\r\nNhâm Dần (1962, 2022), Quý Mão (1963 – 2023) Kim bạch kim – Vàng nguyên chất..\r\n\r\nCanh Tuất (1970, 2030), Tân Hợi (1971, 2031) Thoa kim xuyến – Trang sức quý.\r\n\r\nGiáp Tý (1984, 2044), Ất Sửu (1985, 2045) Hải trung kim – Vàng trong biển.\r\n\r\nTheo âm dương ngũ hành người mệnh Kim là những người nhanh nhẹn, có chí tiến thủ và biết nắm bắt cơ hội. Tuy nhiên, người mệnh Kim lại khá nóng nảy. Mỗi bản mệnh sẽ gắn với 1 màu sắc khác nhau. Do đó khi thiết kế nội thất chung cư cho người mệnh Kim cần tránh chọn phải những màu khắc mệnh. Điều này sẽ mang đến bạn những rủi ro cũng như những điều kém may mắn.\r\n\r\n\r\n\r\nMàu bản mệnh của người mệnh kim đó là các màu trắng, màu xám hoặc màu ghi. Ngoài ra gia chủ mệnh Kim còn hợp với gam màu xám bạc có ánh kim. Gam màu bạc tốt cho cung “con cháu” và cung “quan lộc”, chúng còn thể hiện sự tinh tế và mới mẻ. Bên cạnh những màu sắc mang đến sự tương sinh và tương hợp cho gia chủ mệnh Kim thì còn có những gam màu không hợp. Mệnh Kim khắc với mệnh Hỏa vì lửa có thể làm tan chảy và tiêu tan kim loại nên gam màu đỏ, hồng, tím và cam chính là những gam màu tương khắc.\r\n\r\n2. Màu sắc trong thiết kế nội thất chung cư cho người mệnh Kim\r\nTheo nghiên cứu về quy luật ngũ hành thì các màu sắc trong thiết kế nội thất chung cư cho người mệnh kim gồm có màu sắc tương sinh mang lại bình an, may mắn và có những màu sắc cần tránh vì tương khắc vì gây trở ngại cho cuộc sống, công danh gia chủ.\r\n\r\n2.1. Màu vàng\r\nTheo các nhà phong thủy thì màu vàng là màu của sự tươi mới, mang đến niềm vui và giúp tinh thần thoải mái. Đó là màu còn tượng trưng cho ánh sáng mặt trời, mà ánh sáng mặt trời mang đến sự sống cho vạn vật. Bởi vậy, màu vàng là màu của sự sống, màu của sự quyền quý. Màu vàng là màu giúp ích cho sự tập trung và kích thích khả năng sáng tạo.\r\n\r\n\r\n\r\nĐối với người mệnh Kim việc sử dụng màu vàng sẽ giúp cho gia chủ thêm sức mạnh, năng lượng dồi dào, tinh thần thoải mái, sảng khoái. Đặc biệt khi người mệnh Kim sử dụng các đồ trang sức hoặc thiết kế nội thất chung cư có nhiều màu vàng sẽ giúp chiêu vượng tài lộc à kích thích vận may.', 1, '2026-10-12 02:01:40', NULL),
(2, NULL, 3, 'Tư vấn thiết kế nội thất chung cư cho người mệnh Kim', 'tu-van-thiet-ke-noi-that-chung-cu-cho-nguoi-menh-kim', 'posts/dXtPCpZoSF9dXVxtLXofpnjwB8KR3DAoFZ8n46OR.webp', 'Tư vấn thiết kế nội thất chung cư cho người mệnh Kim', 'Tư vấn thiết kế nội thất chung cư cho người mệnh Kim\r\nThiết kế nội thất chung cư cho người mệnh Kim để có cuộc sống bình an, thịnh vượng. Bài viết dưới đây là những tư vấn tâm huyết của KTS am hiểu sâu về phong thủy, có kinh nghiệm nhiều năm thiết kế nội thất chung cư cho người mệnh Kim.\r\n\r\nTheo quan niệm của phương Đông, mỗi con người đều có số mệnh. Tùy thuộc vào năm sinh mà ứng với cung mệnh của mình. Số mệnh có bình an, thịnh vượng phụ thuộc vào nhiều yếu tố, trong đó có ngôi nhà mà họ sinh sống. Vậy nên trong thiết kế nội thất nhà ở nói chung và thiết kế nội thất chung cư nói riêng, các KTS đều rất quan tâm đến mệnh của gia chủ.\r\n\r\n\r\n\r\nThiết kế nội thất chung cư cho người mệnh kim cần lưu ý đến các yếu tố về màu sắc, hướng và sự bố trí nội thất các không gian chung và riêng.\r\n\r\n1. Người mệnh Kim: Năm sinh, tính cách và màu sắc bản mệnh\r\nNgười mệnh kim sinh vào các năm:\r\n\r\nNhâm Thân (1932, 1992), Quý Dậu (1933, 1993) Kiếm phong kim – Vàng mũi kiếm.\r\n\r\nCanh Thìn (1940, 2000), Tân Tỵ (1941, 2001) Bạch lạp kim – Vàng trong nến.\r\n\r\nGiáp Ngọ (1954, 2014), Ất Mùi (1955, 2015) Sa trung kim – Vàng trong cát.\r\n\r\nNhâm Dần (1962, 2022), Quý Mão (1963 – 2023) Kim bạch kim – Vàng nguyên chất..\r\n\r\nCanh Tuất (1970, 2030), Tân Hợi (1971, 2031) Thoa kim xuyến – Trang sức quý.\r\n\r\nGiáp Tý (1984, 2044), Ất Sửu (1985, 2045) Hải trung kim – Vàng trong biển.\r\n\r\nTheo âm dương ngũ hành người mệnh Kim là những người nhanh nhẹn, có chí tiến thủ và biết nắm bắt cơ hội. Tuy nhiên, người mệnh Kim lại khá nóng nảy. Mỗi bản mệnh sẽ gắn với 1 màu sắc khác nhau. Do đó khi thiết kế nội thất chung cư cho người mệnh Kim cần tránh chọn phải những màu khắc mệnh. Điều này sẽ mang đến bạn những rủi ro cũng như những điều kém may mắn.\r\n\r\n\r\n\r\nMàu bản mệnh của người mệnh kim đó là các màu trắng, màu xám hoặc màu ghi. Ngoài ra gia chủ mệnh Kim còn hợp với gam màu xám bạc có ánh kim. Gam màu bạc tốt cho cung “con cháu” và cung “quan lộc”, chúng còn thể hiện sự tinh tế và mới mẻ. Bên cạnh những màu sắc mang đến sự tương sinh và tương hợp cho gia chủ mệnh Kim thì còn có những gam màu không hợp. Mệnh Kim khắc với mệnh Hỏa vì lửa có thể làm tan chảy và tiêu tan kim loại nên gam màu đỏ, hồng, tím và cam chính là những gam màu tương khắc.\r\n\r\n2. Màu sắc trong thiết kế nội thất chung cư cho người mệnh Kim\r\nTheo nghiên cứu về quy luật ngũ hành thì các màu sắc trong thiết kế nội thất chung cư cho người mệnh kim gồm có màu sắc tương sinh mang lại bình an, may mắn và có những màu sắc cần tránh vì tương khắc vì gây trở ngại cho cuộc sống, công danh gia chủ.\r\n\r\n2.1. Màu vàng\r\nTheo các nhà phong thủy thì màu vàng là màu của sự tươi mới, mang đến niềm vui và giúp tinh thần thoải mái. Đó là màu còn tượng trưng cho ánh sáng mặt trời, mà ánh sáng mặt trời mang đến sự sống cho vạn vật. Bởi vậy, màu vàng là màu của sự sống, màu của sự quyền quý. Màu vàng là màu giúp ích cho sự tập trung và kích thích khả năng sáng tạo.\r\n\r\n\r\n\r\nĐối với người mệnh Kim việc sử dụng màu vàng sẽ giúp cho gia chủ thêm sức mạnh, năng lượng dồi dào, tinh thần thoải mái, sảng khoái. Đặc biệt khi người mệnh Kim sử dụng các đồ trang sức hoặc thiết kế nội thất chung cư có nhiều màu vàng sẽ giúp chiêu vượng tài lộc à kích thích vận may.', 1, '2026-10-12 03:48:01', NULL),
(3, NULL, 2, 'sfdvbsfbvsvb', 'sfdvbsfbvsvb', 'posts/RNMpV9mUYnweyqfpSv2s9DzPwlRNtcTKfMXYDEoX.webp', 'vsdvsdvsdv', 'sdvsdvsdsdvsdv', 1, '2026-11-01 01:56:44', NULL),
(4, NULL, 4, 'sự kien hoa  đẹp', 'su-kien-hoa-dep', 'posts/0Gdt8UPuQ7oAChvmJhKkXwcuJffpeeqeN615psSS.webp', ',hoa đẹp', 'Đặt Hoa Khai Trương Giá Chỉ Từ 599K - Giao Nhanh 2H\r\nHoa khai trương là món quà tặng không thể thiếu để gửi lời chúc mừng đối tác, người thân nhân dịp khai trương cửa hàng, Công ty hay chi nhánh mới. Không chỉ là món quà tặng thông thường, một kệ hoa khai trương với những loài hoa mang ý nghĩa may mắn, tài lộc còn giúp bạn gửi đi thông điệp về tình hữu nghị bền chặt, mong muốn xây dựng mối quan hệ thêm bền chặt giữa 2 Công ty.\r\n\r\nNếu bạn đang cần đặt một mẫu hoa để gửi tặng đối tác, người thân, bạn bè nhân dịp khai trương cửa hàng, Công ty. Tham khảo ngay bộ sưu tập những mẫu hoa chúc mừng khai trương đẹp, sang trọng được đặt nhiều nhất tại shop hoa tươi FlowerCorner. Ngoài những mẫu hoa tặng khai trương có sẵn trên website, FlowerCorner.vn cũng nhận thiết kế hoa chúc mừng khai trương theo yêu cầu với mức giá chỉ từ 500k.\r\n\r\nCác kiểu hoa khai trương phổ biến\r\nHoa khai trương hiện nay được thiết kế với nhiều kiểu khác nhau phù hợp với từng sự kiện hoặc không gian tổ chức lễ khai trương. Dưới đây là những kiểu hoa tặng khai trương phổ biến và được đặt nhiều nhất  tại Việt Nam hiện nay.\r\n\r\nKệ hoa khai trương dạng đứng', 1, '2026-11-01 18:42:57', NULL),
(5, NULL, 1, 'cẩm năng về hoa', 'cam-nang-ve-hoa', 'posts/oxSGX4mptpOzpJu44RzIO4Ge40HVaEEhFtjnH0Q9.webp', 'cẩm năng hoa', 'Đặt Hoa Khai Trương Giá Chỉ Từ 599K - Giao Nhanh 2H\r\nHoa khai trương là món quà tặng không thể thiếu để gửi lời chúc mừng đối tác, người thân nhân dịp khai trương cửa hàng, Công ty hay chi nhánh mới. Không chỉ là món quà tặng thông thường, một kệ hoa khai trương với những loài hoa mang ý nghĩa may mắn, tài lộc còn giúp bạn gửi đi thông điệp về tình hữu nghị bền chặt, mong muốn xây dựng mối quan hệ thêm bền chặt giữa 2 Công ty.\r\n\r\nNếu bạn đang cần đặt một mẫu hoa để gửi tặng đối tác, người thân, bạn bè nhân dịp khai trương cửa hàng, Công ty. Tham khảo ngay bộ sưu tập những mẫu hoa chúc mừng khai trương đẹp, sang trọng được đặt nhiều nhất tại shop hoa tươi FlowerCorner. Ngoài những mẫu hoa tặng khai trương có sẵn trên website, FlowerCorner.vn cũng nhận thiết kế hoa chúc mừng khai trương theo yêu cầu với mức giá chỉ từ 500k.\r\n\r\nCác kiểu hoa khai trương phổ biến\r\nHoa khai trương hiện nay được thiết kế với nhiều kiểu khác nhau phù hợp với từng sự kiện hoặc không gian tổ chức lễ khai trương. Dưới đây là những kiểu hoa tặng khai trương phổ biến và được đặt nhiều nhất  tại Việt Nam hiện nay.\r\n\r\nKệ hoa khai trương dạng đứng', 1, '2026-11-01 18:43:26', NULL),
(6, NULL, 5, 'khuyến mãi', 'khuyen-mai', 'posts/bp4lDtIDsx9u4nrC8wBNT9gJhyL2jcxqFjBEGfyt.webp', 'khuyên smaix hoa', 'Đặt Hoa Khai Trương Giá Chỉ Từ 599K - Giao Nhanh 2H\r\nHoa khai trương là món quà tặng không thể thiếu để gửi lời chúc mừng đối tác, người thân nhân dịp khai trương cửa hàng, Công ty hay chi nhánh mới. Không chỉ là món quà tặng thông thường, một kệ hoa khai trương với những loài hoa mang ý nghĩa may mắn, tài lộc còn giúp bạn gửi đi thông điệp về tình hữu nghị bền chặt, mong muốn xây dựng mối quan hệ thêm bền chặt giữa 2 Công ty.\r\n\r\nNếu bạn đang cần đặt một mẫu hoa để gửi tặng đối tác, người thân, bạn bè nhân dịp khai trương cửa hàng, Công ty. Tham khảo ngay bộ sưu tập những mẫu hoa chúc mừng khai trương đẹp, sang trọng được đặt nhiều nhất tại shop hoa tươi FlowerCorner. Ngoài những mẫu hoa tặng khai trương có sẵn trên website, FlowerCorner.vn cũng nhận thiết kế hoa chúc mừng khai trương theo yêu cầu với mức giá chỉ từ 500k.\r\n\r\nCác kiểu hoa khai trương phổ biến\r\nHoa khai trương hiện nay được thiết kế với nhiều kiểu khác nhau phù hợp với từng sự kiện hoặc không gian tổ chức lễ khai trương. Dưới đây là những kiểu hoa tặng khai trương phổ biến và được đặt nhiều nhất  tại Việt Nam hiện nay.\r\n\r\nKệ hoa khai trương dạng đứng', 1, '2026-11-01 18:44:11', NULL),
(7, NULL, 2, 'ý nghĩa laoif hoa  về tết', 'y-nghia-laoif-hoa-ve-tet', 'posts/X7u3J8IjUIuyn9TKGFWnKIqEu4Ryq2peXGzurVos.webp', 'ý nghĩa loài hoa  tết', 'Đặt Hoa Khai Trương Giá Chỉ Từ 599K - Giao Nhanh 2H\r\nHoa khai trương là món quà tặng không thể thiếu để gửi lời chúc mừng đối tác, người thân nhân dịp khai trương cửa hàng, Công ty hay chi nhánh mới. Không chỉ là món quà tặng thông thường, một kệ hoa khai trương với những loài hoa mang ý nghĩa may mắn, tài lộc còn giúp bạn gửi đi thông điệp về tình hữu nghị bền chặt, mong muốn xây dựng mối quan hệ thêm bền chặt giữa 2 Công ty.\r\n\r\nNếu bạn đang cần đặt một mẫu hoa để gửi tặng đối tác, người thân, bạn bè nhân dịp khai trương cửa hàng, Công ty. Tham khảo ngay bộ sưu tập những mẫu hoa chúc mừng khai trương đẹp, sang trọng được đặt nhiều nhất tại shop hoa tươi FlowerCorner. Ngoài những mẫu hoa tặng khai trương có sẵn trên website, FlowerCorner.vn cũng nhận thiết kế hoa chúc mừng khai trương theo yêu cầu với mức giá chỉ từ 500k.\r\n\r\nCác kiểu hoa khai trương phổ biến\r\nHoa khai trương hiện nay được thiết kế với nhiều kiểu khác nhau phù hợp với từng sự kiện hoặc không gian tổ chức lễ khai trương. Dưới đây là những kiểu hoa tặng khai trương phổ biến và được đặt nhiều nhất  tại Việt Nam hiện nay.\r\n\r\nKệ hoa khai trương dạng đứng', 1, '2026-11-01 18:45:23', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `post_topics`
--

CREATE TABLE `post_topics` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `status` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `post_topics`
--

INSERT INTO `post_topics` (`id`, `name`, `slug`, `description`, `status`, `created_at`, `deleted_at`) VALUES
(1, 'Cẩm nang chọn hoa', 'cam-nang-chon-hoa', 'Hướng dẫn chọn hoa phù hợp theo dịp, theo người nhận và ngân sách.', 1, '2026-10-12 09:03:39', NULL),
(2, 'Ý nghĩa các loài hoa', 'y-nghia-cac-loai-hoa', 'Tìm hiểu ý nghĩa của hoa hồng, hướng dương, lan, cúc và nhiều loài hoa khác.', 1, '2026-10-12 09:03:39', NULL),
(3, 'Cách chăm sóc hoa', 'cach-cham-soc-hoa', 'Mẹo giữ hoa tươi lâu, cắm hoa và chăm sóc hoa chậu tại nhà.', 1, '2026-10-12 09:03:39', NULL),
(4, 'Hoa theo sự kiện', 'hoa-theo-su-kien', 'Gợi ý hoa cho sinh nhật, cưới hỏi, khai trương, 8/3, 20/10, Valentine.', 1, '2026-10-12 09:03:39', NULL),
(5, 'Tin tức & khuyến mãi', 'tin-tuc-khuyen-mai', 'Cập nhật chương trình khuyến mãi và tin tức mới nhất của shop.', 1, '2026-10-12 09:03:39', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `brand_id` int(11) DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `slug` varchar(200) DEFAULT NULL,
  `price` int(11) NOT NULL,
  `qty` int(11) NOT NULL DEFAULT 0,
  `image` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` tinyint(1) DEFAULT 1,
  `is_featured` tinyint(4) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category_id`, `brand_id`, `name`, `slug`, `price`, `qty`, `image`, `description`, `status`, `is_featured`, `created_at`, `updated_at`, `deleted_at`) VALUES
(22, 4, 1, 'Hoa tình yêu - Chỉ yêu mình em - 2508', 'hoa-tinh-yeu-chi-yeu-minh-em-2508', 12000, 12, 'products/CokLDIElaq5uF91eJ6NJbRTb0ycgXgZjXfupXimI.jpg', 'Hoa tình yêu - Chỉ yêu mình em - 2508', 1, 1, '2026-10-31 03:29:21', '2026-11-01 18:03:39', NULL),
(23, 4, 3, 'Hoa tình yêu - Lux mica flower 14 - 11598', 'hoa-tinh-yeu-lux-mica-flower-14-11598', 3000, 18, 'products/kUEX5dr81JC1bmDR5RhGFRDSM1MjCGZzkpKVtftB.jpg', 'Hoa tình yêu - Lux mica flower 14 - 11598', 1, 0, '2026-10-31 18:58:07', '2026-11-02 00:58:18', NULL),
(24, 26, 1, 'D2- test', 'd2-test', 12067, 4, 'products/pHxd0fv4IlyXX9eT6EFbhhqMTw5vIeLo1Qw46KGZ.jpg', 'csdcfsdcsdcs', 0, 0, '2026-10-31 20:12:35', '2026-11-01 17:57:13', '2026-11-01 17:57:13'),
(25, 4, 1, 'Hoa tình yêu - Yêu thương ngọt ngào - 15459', 'hoa-tinh-yeu-yeu-thuong-ngot-ngao-15459', 23000, 12, 'products/stPMZI2U2ZR8xZjJbOGsvthRDqbGqDPN9VlC2DS4.jpg', 'Hoa tình yêu - Yêu thương ngọt ngào - 15459', 1, 0, '2026-11-01 18:05:12', '2026-11-01 18:05:12', NULL),
(26, 22, 1, 'Hoa sinh nhật - Freedom - 13592', 'hoa-sinh-nhat-freedom-13592', 14000, 1014, 'products/LlKwGpWlA85BlnxjihZ7V82uSoxnlnIh4jg7VdEO.jpg', 'Hoa sinh nhật - Freedom - 13592', 1, 0, '2026-11-01 18:07:19', '2026-11-02 00:57:40', NULL),
(27, 22, 3, 'Hoa sinh nhật - Garden style 03 - 4863', 'hoa-sinh-nhat-garden-style-03-4863', 34000, 17, 'products/rjaKMJkjioYL4EmPG0Vhb4doMaJudQOdXyz7C35p.jpg', 'Hoa sinh nhật - Garden style 03 - 4863', 1, 1, '2026-11-01 18:07:56', '2026-11-01 18:07:56', NULL),
(28, 22, 3, 'Hoa sinh nhật - Eternal Bloom - 14649', 'hoa-sinh-nhat-eternal-bloom-14649', 99000, 17, 'products/dsRKSXMj0mXSDzylUdyvcq6Ftl99c5jbwGssSBoW.jpg', 'Hoa sinh nhật - Eternal Bloom - 14649', 1, 0, '2026-11-01 18:08:45', '2026-11-01 18:08:45', NULL),
(29, 24, 4, 'Hoa sinh viên - Kisses - 7170121', 'hoa-sinh-vien-kisses-7170121', 34000, 12, 'products/vaAVwPXIg0p10pg4hv6Y2MUkYFOXCSqLNs68w2bY.jpg', 'Hoa sinh viên - Kisses - 7170', 1, 0, '2026-11-01 18:14:33', '2026-11-02 00:52:37', NULL),
(30, 24, 4, 'Hoa sinh viên - Dreaming - 12595', 'hoa-sinh-vien-dreaming-12595', 90000, 19, 'products/fGfeNriS3HisWSN1uzP8ReLUr7brj4jRl48aqJd4.jpg', 'Hoa sinh viên - Dreaming - 12595', 1, 0, '2026-11-01 18:15:05', '2026-11-01 18:15:05', NULL),
(31, 24, NULL, 'Hoa sinh viên - Romantic Date - 11585', 'hoa-sinh-vien-romantic-date-11585', 23000, 20, 'products/liCL2o9lKQvN83s94JfifctUuWmv2Pj9qFLEcIjX.jpg', 'Hoa sinh viên - Romantic Date - 11585', 1, 1, '2026-11-01 18:15:44', '2026-11-01 18:15:44', NULL),
(32, 24, 5, 'Hoa sinh viên - Ân cần - 7191', 'hoa-sinh-vien-an-can-7191', 11000, 11, 'products/dpcP5J9Pt3dXFJPsFbykSJ3vNppvXzT69wrFRZp7.jpg', 'Hoa sinh viên - Ân cần - 7191', 1, 0, '2026-11-01 18:16:48', '2026-11-01 18:16:48', NULL),
(33, 25, 5, 'Khuyến mãi - Song hỷ 01 - 16657', 'khuyen-mai-song-hy-01-16657', 45000, 9, 'products/Fqe7J2jBU6E4PiwBREI90qsIMtlt7HhselxUSocB.jpg', 'Khuyến mãi - Song hỷ 01 - 16657', 1, 0, '2026-11-01 18:19:17', '2026-11-01 18:19:17', NULL),
(34, 25, 5, 'Khuyến mãi - Scarlet bloom - 16610', 'khuyen-mai-scarlet-bloom-16610', 66000, 11, 'products/XXFSHM2iZAzsob77fFiZXp46vzs9zlHBuLroumRK.jpg', 'Khuyến mãi - Scarlet bloom - 16610', 1, 0, '2026-11-01 18:19:46', '2026-11-01 23:25:31', NULL),
(35, 25, 3, 'Khuyến mãi - Only rose premium 13 - 16425', 'khuyen-mai-only-rose-premium-13-16425', 52000, 16, 'products/uVNwmH8NU004h6KLANC6O4qkU1aGUsjzeoZadrKK.jpg', 'Khuyến mãi - Only rose premium 13 - 16425', 1, 1, '2026-11-01 18:21:00', '2026-11-01 18:21:00', NULL),
(36, 25, 5, 'Khuyến mãi - Yêu thương 9 - 11628', 'khuyen-mai-yeu-thuong-9-11628', 10000, 7, 'products/rdZFFZP9RhOQ40BDhxUPHg4uUVNVW2fyhSqaiFPC.jpg', 'Khuyến mãi - Yêu thương 9 - 11628', 1, 0, '2026-11-01 18:21:49', '2026-11-01 23:17:44', NULL),
(37, 26, 3, 'Hoa Khai Trương - Đại Thành Công', 'hoa-khai-truong-dai-thanh-cong', 12000, 1, 'products/qa2O6MC8V26DMIpUuj3gF6uN6SYlGyeR1JhSCSIE.webp', 'Hoa Khai Trương - Đại Thành Công', 1, 0, '2026-11-01 18:27:11', '2026-11-02 01:12:37', NULL),
(38, 26, 4, 'Hoa Khai Trương - Vững tiến', 'hoa-khai-truong-vung-tien', 45000, 16, 'products/NAynw9AQdNR7vS0xfACy9Fl2YbGGiSYwZ3lMaA1P.webp', 'Hoa Khai Trương - Vững tiến', 1, 1, '2026-11-01 18:27:42', '2026-11-01 18:27:42', NULL),
(39, 26, 5, 'Hoa Khai Trương - Hồng Phát 2', 'hoa-khai-truong-hong-phat-2', 245000, 13, 'products/k6JBoBM1EjTBhzhw6n9CmrkpM2uQOFdMpwzeqZDE.webp', 'Hoa Khai Trương - Hồng Phát 2', 1, 0, '2026-11-01 18:28:13', '2026-11-01 23:25:31', NULL),
(40, 26, 1, 'Hoa Khai Trương - Sóng Biển', 'hoa-khai-truong-song-bien', 600000, 16, 'products/rO2SAG4VAnNOfJHXtRsCcRno063VWaLMWOnoxXKW.webp', 'Hoa Khai Trương - Sóng Biển', 1, 0, '2026-11-01 18:28:47', '2026-11-01 22:49:01', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `productsale`
--

CREATE TABLE `productsale` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(150) DEFAULT NULL,
  `code` varchar(50) DEFAULT NULL,
  `apply_to` enum('product','order') NOT NULL DEFAULT 'product',
  `product_id` int(11) DEFAULT NULL,
  `pricesale` int(11) DEFAULT NULL,
  `discount_type` enum('percent','amount') DEFAULT NULL,
  `discount_value` int(11) DEFAULT NULL,
  `max_discount` int(11) DEFAULT NULL,
  `min_order` int(11) NOT NULL DEFAULT 0,
  `usage_limit` int(11) DEFAULT NULL,
  `used_count` int(11) NOT NULL DEFAULT 0,
  `date_begin` datetime NOT NULL,
  `date_end` datetime NOT NULL,
  `status` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `productsale`
--

INSERT INTO `productsale` (`id`, `name`, `code`, `apply_to`, `product_id`, `pricesale`, `discount_type`, `discount_value`, `max_discount`, `min_order`, `usage_limit`, `used_count`, `date_begin`, `date_end`, `status`, `created_at`, `deleted_at`) VALUES
(7, 'Khuyến mãi Hoa tình yêu - Chỉ yêu mình em - 2508', NULL, 'product', 22, 11000, NULL, NULL, NULL, 0, NULL, 0, '2026-11-02 01:03:39', '2027-11-02 01:03:39', 1, '2026-10-31 03:29:21', '2026-11-01 18:09:57'),
(10, 'Khuyến mãi D2- test', NULL, 'product', 24, 12000, NULL, NULL, NULL, 0, NULL, 0, '2026-11-01 09:31:57', '2027-11-01 09:31:57', 1, '2026-10-31 20:12:35', NULL),
(11, 'Giảm 10% đơn hàng', 'GIAM10', 'order', NULL, NULL, 'percent', 10, 50000, 0, 100, 6, '2026-01-01 00:00:00', '2027-12-31 00:00:00', 1, '2026-11-01 07:02:53', NULL),
(12, 'Giảm 20.000đ cho đơn từ 50.000đ', 'HOA20K', 'order', NULL, NULL, 'amount', 20000, 20000, 50000, 100, 0, '2026-01-01 00:00:00', '2027-12-31 00:00:00', 1, '2026-11-01 07:02:53', NULL),
(13, 'Khuyến mãi Hoa sinh viên - Ân cần - 7191', NULL, 'product', 32, 8000, NULL, NULL, NULL, 0, NULL, 0, '2026-11-02 01:16:48', '2027-11-02 01:16:48', 1, '2026-11-01 18:16:48', NULL),
(14, 'Khuyến mãi Khuyến mãi - Scarlet bloom - 16610', NULL, 'product', 34, 59000, NULL, NULL, NULL, 0, NULL, 0, '2026-11-02 01:19:46', '2027-11-02 01:19:46', 1, '2026-11-01 18:19:46', NULL),
(15, 'Khuyến mãi Khuyến mãi - Yêu thương 9 - 11628', NULL, 'product', 36, 7000, NULL, NULL, NULL, 0, NULL, 0, '2026-11-02 01:29:47', '2027-11-02 01:29:47', 1, '2026-11-01 18:21:49', NULL),
(16, 'Khuyến mãi Hoa Khai Trương - Đại Thành Công', NULL, 'product', 37, 7000, NULL, NULL, NULL, 0, NULL, 0, '2026-11-02 01:27:11', '2027-11-02 01:27:11', 1, '2026-11-01 18:27:11', NULL),
(17, 'Khuyến mãi Hoa Khai Trương - Hồng Phát 2', NULL, 'product', 39, 225000, NULL, NULL, NULL, 0, NULL, 0, '2026-11-02 01:30:04', '2027-11-02 01:30:04', 1, '2026-11-01 18:30:04', NULL),
(18, 'Khuyến mãi Khuyến mãi - Song hỷ 01 - 16657', NULL, 'product', 33, 30000, NULL, NULL, NULL, 0, NULL, 0, '2026-11-02 01:30:57', '2027-11-02 01:30:57', 1, '2026-11-01 18:30:57', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL COMMENT '1 đến 5 sao',
  `comment` text NOT NULL COMMENT 'Nội dung nhận xét đánh giá',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1: Hiển thị công khai, 0: Ẩn',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `product_id`, `user_id`, `rating`, `comment`, `status`, `created_at`, `updated_at`) VALUES
(1, 23, 2, 5, 'Hoa tươi và rất đẹp, đóng gói cẩn thận. Giao đúng giờ hẹn!', 1, '2026-11-01 09:45:54', '2026-11-01 09:45:54'),
(2, 23, 6, 5, 'Bó hoa bên ngoài to và đẹp hơn trong hình nhiều, bạn gái mình rất thích.', 1, '2026-11-01 09:45:54', '2026-11-01 09:45:54'),
(3, 23, 5, 4, 'Chất lượng hoa tươi tốt, giao nhanh. Thiệp viết chữ rất nắn nót.', 1, '2026-11-01 09:45:54', '2026-11-01 09:52:05'),
(5, 34, 8, 5, 'oke  nha', 1, '2026-11-01 20:01:41', '2026-11-01 20:01:41'),
(6, 40, 9, 4, 'oki đấy', 1, '2026-11-01 22:46:14', '2026-11-02 00:53:01'),
(7, 39, 8, 4, 'c v vvv  c', 1, '2026-11-02 01:15:55', '2026-11-02 01:15:55'),
(8, 39, 8, 5, 'nhfhgh', 1, '2026-11-02 01:16:18', '2026-11-02 01:16:18');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('2Ne06nC69K5IjG0Kkkrus6ueu58BL6X1b3EJfUL8', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', 'eyJfdG9rZW4iOiJvUG1yU2NKeVRPMVNsS1ZKRFRNY3ZYd1BvcERFMGxmRndhQW9DNmNGIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIn0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=', 1793628034),
('fHF1u7rfYpPRBOw4jUpB72U6eju3JMclOlunSBWs', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', 'eyJfdG9rZW4iOiJvVjFoaDlKWEhZRlV0VWVUTEdIR2t3akNRdHYya3hJQkpXeVNhZG50IiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIn0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=', 1793580572),
('FqcAdpwCk6Z0uTNF3RMwFZAUG6hP4sjkRr0DhdkT', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', 'eyJfdG9rZW4iOiJOTGNCQXQzMlAwVG5qMjY3MG5JV2tNS1hMaUpZWk1SUGZibjFaOEo1IiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIn0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=', 1793538554),
('IrWoMjXxWqhq4H5R3N3pfRP5v7lFMEb4JVGatz7q', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', 'eyJfdG9rZW4iOiJ6REhzZUFSSXNUcDBhU1FEM1RHeU1ZYWJET3FLWVBON2F5ckE0TVRFIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIn0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=', 1793599471),
('mQFWXxKcskLj5MoHPRp4nXTfJ5NLx9u8UczSbNMP', NULL, '127.0.0.1', 'curl/8.21.0', 'eyJfdG9rZW4iOiJTUmdFSU1tN3JGazA2NGFNYktJRGFZOUNFb3VucGQyUlV4UDVPS05oIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIn0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=', 1793502199),
('tlqUIaZb7j3mnVaFAYK34OaBKX18hwt5qcVR2zvx', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', 'eyJfdG9rZW4iOiJNdElndFFNcTBXV1VnNEtMNkdGTWNSRnR0d3lDNHo1a2dCejlkeTYxIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIn0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=', 1793522498),
('wufFtaeEn34g1yfFbpDy8d60zZWOBKpHtdocMZ4q', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', 'eyJfdG9rZW4iOiJnQkMydjZhbVBwTE9UQ3U1SWVpTXQ1Z0dxNjdiZFBnRGU2dEVDU2U4IiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIn0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=', 1793502216);

-- --------------------------------------------------------

--
-- Table structure for table `stock_documents`
--

CREATE TABLE `stock_documents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(30) NOT NULL,
  `type` enum('in','out') NOT NULL,
  `reason` varchar(100) NOT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stock_documents`
--

INSERT INTO `stock_documents` (`id`, `code`, `type`, `reason`, `supplier_id`, `note`, `created_by`, `created_at`, `deleted_at`) VALUES
(1, 'NK-20261102-001', 'in', 'Nhập hàng định kỳ từ nhà cung cấp', 2, 'hưhhqwhw', NULL, '2026-11-02 00:57:14', NULL),
(2, 'XK-20261102-001', 'out', 'Xuất hủy hoa hỏng / lỗi', 2, 'fwfwkekkewf', NULL, '2026-11-02 00:57:40', NULL),
(3, 'NK-20261102-002', 'in', 'Nhập hàng định kỳ từ nhà cung cấp', 1, 'feefewew', NULL, '2026-11-02 00:58:18', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `stock_document_items`
--

CREATE TABLE `stock_document_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `document_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` int(11) NOT NULL,
  `qty` int(11) NOT NULL,
  `unit_cost` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stock_document_items`
--

INSERT INTO `stock_document_items` (`id`, `document_id`, `product_id`, `qty`, `unit_cost`) VALUES
(1, 1, 26, 1000, 100000),
(2, 2, 26, 1, 0),
(3, 3, 23, 10, 1000);

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `status` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `phone`, `address`, `status`, `created_at`, `deleted_at`) VALUES
(1, 'Công Ty Hoa Mới', '098788373', 'Đà Lạt', 1, '2026-11-02 00:55:09', NULL),
(2, 'Công Ty Vettel 122', '48348378', 'Hà Nội', 1, '2026-11-02 00:55:48', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `role` enum('admin','customer') DEFAULT 'customer',
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'dung dev', 'an@gmail.com', '$2y$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012', '0343977821', '123 Đường Hoa Hồng, TP.HCM', 'customer', 1, '2026-10-12 07:45:38', '2026-11-01 07:45:25'),
(2, 'Trần Thị Bình', 'binh@gmail.com', '$2y$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012', '0912345678', '45 Lê Lợi, Quận 3, TP.HCM', 'customer', 1, '2026-10-12 07:45:38', '2026-10-12 07:45:38'),
(3, 'Admin ShopHoa', 'admin@shophoa.com', '$2y$12$UUVFPVWsSvAJ8CbyHhaSu.hlZqUF5i4AycsjnqpqeQC2C9YINuV6e', '0909000001', 'TP. Hồ Chí Minh', 'customer', 1, '2026-10-31 01:26:13', '2026-11-01 15:12:19'),
(4, 'dung dev999', 'quanghuynhwtf1@mail.com', '$2y$12$5H7kYSpetZeXk387JMb3MezeESMYdqLL1IbPXyIpOjog4VgdEVc0i', '0343977821', 'hồ chí minh vn', 'customer', 1, '2026-10-31 07:07:37', '2026-11-01 15:12:24'),
(5, 'nghia1111', 'demo@gmail.com', '$2y$12$gX2CU/ldsc7QC8Q/JInC7.spvGgjrLRm.N6..VgDdG/2xHMPnCIP2', '0984848484', NULL, 'customer', 1, '2026-10-31 07:11:55', '2026-10-31 07:11:55'),
(6, 'dungcute', 'dung9@gmail.com', '$2y$12$4xUSYZckAOrubraZmsK.kuCPLpqxuBntKWmTEzC0BYxb9w7oCHjA2', '0987654321', NULL, 'admin', 1, '2026-11-01 08:11:50', '2026-11-01 15:12:14'),
(7, 'Chanh Chanh', 'cchanhcchanh999@gmail.com', '$2y$12$RekMcZMsIh4G5xCWi0NCiOyJs31WpLIlHR1bT3V7.ttA/2PYzApnS', NULL, NULL, 'customer', 1, '2026-11-01 09:19:44', '2026-11-01 09:20:35'),
(8, 'Huu Nghia', 'huyhuynhfa@gmail.com', '$2y$12$SkuXDcbYpnkPIMhk076KuuGiLHZ3AaBtNVcFLaSO7CRpw4.eSQmqS', '0987654321', NULL, 'customer', 1, '2026-11-01 19:39:32', '2026-11-02 01:11:28'),
(9, 'nghiademo1', 'huyhuynhfa123@gmail.com', '$2y$12$LhAVuJT58SEmUEvrdzLiN..9zm0htjLc5MiqViLMkaARXyksgvSAi', '0937377363', NULL, 'customer', 1, '2026-11-01 22:40:33', '2026-11-01 22:42:44'),
(10, 'KhachHanng', 'khachhang999@gmail.com', '$2y$12$tdSSG1elzXMEHHiUpVZOre9Bk1.vus4pIT21daBQ5uh8anSF4CQh6', '0987654321', NULL, 'customer', 1, '2026-11-02 07:26:28', '2026-11-02 07:26:28'),
(11, 'admin', 'admin@gmail.com', '$2y$12$.41qnWafgSOLBOwxeY3j6.iaArxxAgSRHPoFLHpS7w2CLzTnA3OWy', '0987654321', NULL, 'admin', 1, '2026-11-02 07:28:22', '2026-11-02 14:28:57');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `parent_id` (`parent_id`);

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  ADD KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `menus`
--
ALTER TABLE `menus`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order`
--
ALTER TABLE `order`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_order_status_created` (`status`,`created_at`);

--
-- Indexes for table `orderdetail`
--
ALTER TABLE `orderdetail`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `pages`
--
ALTER TABLE `pages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `email` (`email`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `topic_id` (`topic_id`);

--
-- Indexes for table `post_topics`
--
ALTER TABLE `post_topics`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `fk_products_brand` (`brand_id`),
  ADD KEY `idx_products_status` (`status`);
ALTER TABLE `products` ADD FULLTEXT KEY `ft_products_search` (`name`,`description`);

--
-- Indexes for table `productsale`
--
ALTER TABLE `productsale`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_productsale_code` (`code`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `idx_productsale_active` (`product_id`,`date_begin`,`date_end`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reviews_user_id_foreign` (`user_id`),
  ADD KEY `reviews_product_id_status_index` (`product_id`,`status`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `stock_documents`
--
ALTER TABLE `stock_documents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `type_created` (`type`,`created_at`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `stock_document_items`
--
ALTER TABLE `stock_document_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `document_id` (`document_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `banners`
--
ALTER TABLE `banners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `brands`
--
ALTER TABLE `brands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `menus`
--
ALTER TABLE `menus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `order`
--
ALTER TABLE `order`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `orderdetail`
--
ALTER TABLE `orderdetail`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `pages`
--
ALTER TABLE `pages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `post_topics`
--
ALTER TABLE `post_topics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `productsale`
--
ALTER TABLE `productsale`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `stock_documents`
--
ALTER TABLE `stock_documents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `stock_document_items`
--
ALTER TABLE `stock_document_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`);

--
-- Constraints for table `contacts`
--
ALTER TABLE `contacts`
  ADD CONSTRAINT `contacts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order`
--
ALTER TABLE `order`
  ADD CONSTRAINT `order_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `orderdetail`
--
ALTER TABLE `orderdetail`
  ADD CONSTRAINT `orderdetail_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `order` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orderdetail_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `posts_ibfk_2` FOREIGN KEY (`topic_id`) REFERENCES `post_topics` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Constraints for table `productsale`
--
ALTER TABLE `productsale`
  ADD CONSTRAINT `productsale_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stock_documents`
--
ALTER TABLE `stock_documents`
  ADD CONSTRAINT `stock_documents_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stock_documents_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `stock_document_items`
--
ALTER TABLE `stock_document_items`
  ADD CONSTRAINT `stock_items_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `stock_documents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
