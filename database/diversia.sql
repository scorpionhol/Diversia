CREATE DATABASE IF NOT EXISTS `diversia` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `diversia`;

-- --------------------------------------------------------
-- Table structure for table `contacts`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contacts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `company` VARCHAR(255) DEFAULT NULL,
  `sector` VARCHAR(100) DEFAULT NULL,
  `urgency` VARCHAR(50) DEFAULT NULL,
  `services` TEXT DEFAULT NULL, -- Comma-separated or JSON array of services
  `message` TEXT NOT NULL,
  `status` VARCHAR(50) DEFAULT 'new',
  `admin_notes` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table `operations`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `operations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `action` VARCHAR(255) NOT NULL,
  `user` VARCHAR(255) DEFAULT 'system',
  `module` VARCHAR(100) DEFAULT NULL,
  `details` TEXT DEFAULT NULL,
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table `articles`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `articles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `excerpt` TEXT DEFAULT NULL,
  `content` TEXT NOT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table `jobs`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `title_en` VARCHAR(255) DEFAULT NULL,
  `description` TEXT NOT NULL,
  `description_en` TEXT DEFAULT NULL,
  `location` VARCHAR(100) DEFAULT 'Lubumbashi',
  `type` VARCHAR(100) DEFAULT 'CDI',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table `applications`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `applications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `job_id` INT DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(100) DEFAULT NULL,
  `message` TEXT DEFAULT NULL,
  `file_path` VARCHAR(255) DEFAULT NULL,
  `file_name` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table `texts`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `texts` (
  `key_name` VARCHAR(100) PRIMARY KEY,
  `content_fr` TEXT NOT NULL,
  `content_en` TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

