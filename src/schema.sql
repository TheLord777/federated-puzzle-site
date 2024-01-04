-- MariaDB dump 10.19  Distrib 10.5.16-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: cs3099user29_my_database
-- ------------------------------------------------------
-- Server version       10.5.16-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comments` (
  `comment_id` int(11) NOT NULL AUTO_INCREMENT,
  `post_id` int(11) DEFAULT NULL,
  `user_id` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `content` varchar(500) COLLATE utf8_bin DEFAULT NULL,
  `date_posted` longtext COLLATE utf8_bin NOT NULL,
  `likes` int(100) DEFAULT NULL,
  `parent_comment_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`comment_id`),
  KEY `post_id` (`post_id`),
  KEY `parent_comment_id` (`parent_comment_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`parent_comment_id`) REFERENCES `comments` (`comment_id`),
  CONSTRAINT `comments_ibfk_4` FOREIGN KEY (`parent_comment_id`) REFERENCES `comments` (`comment_id`),
  CONSTRAINT `comments_ibfk_5` FOREIGN KEY (`user_id`) REFERENCES `user_activity` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `comments_ibfk_6` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `posts` (
  `post_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `title` varchar(100) COLLATE utf8_bin NOT NULL,
  `puzzlejson` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`puzzlejson`)),
  `date_posted` longtext COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`post_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user_activity` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `solved_puzzles`
--

DROP TABLE IF EXISTS `solved_puzzles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `solved_puzzles` (
  `post_id` int(11) NOT NULL,
  `user_id` varchar(100) COLLATE utf8_bin NOT NULL,
  `time_taken` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`time_taken`)),
  PRIMARY KEY (`post_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `supergroup_info`
--

DROP TABLE IF EXISTS `supergroup_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `supergroup_info` (
  `supergroup_id` int(11) DEFAULT NULL,
  `public_key` text COLLATE utf8_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supergroup_info`
--

LOCK TABLES `supergroup_info` WRITE;
/*!40000 ALTER TABLE `supergroup_info` DISABLE KEYS */;
INSERT INTO `supergroup_info` VALUES (29,'-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCOJlBStdvMituXzKRuGufAJzUt\nCzzb+YUckePzlX9a5SXeuPKf5yoY2sZ7BrtWbKU5OlhiPDmfpUb1Ue6GmsRpi40H\niA1q/52nqa19lKuNRLxSs5MEZ0VMmyzy/9jR4f3PGUILE8x4aNsXGFl/al+qcrlH\nrY9mEqnp7gAfGv1JFwIDAQAB\n-----END PUBLIC KEY-----'),(20,'\n-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCKkQ55kVQiRWe8TMOLt30Gfr6A\nN+cQTWKzy6IRkYJ6lornWIb/EcfQgG/HzUzkWw7RFwDHlk2mXLmbzY29kyBhnYmN\nvJj+R1VKGsaDpjNRQgdD3/X+1eEsMVWVJNeARC82Lkw3fwAREh5FgHPO+wNV9OhF\nwq0YAohlNQrN0xHIWwIDAQAB\n-----END PUBLIC KEY-----');
/*!40000 ALTER TABLE `supergroup_info` ENABLE KEYS */;
UNLOCK TABLES;
--
-- Table structure for table `user_activity`
--

DROP TABLE IF EXISTS `user_activity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_activity` (
  `username` varchar(32) COLLATE utf8_bin NOT NULL,
  `user_role` enum('solver','creator','administrator') COLLATE utf8_bin NOT NULL,
  `nopuzzlessolved` int(10) NOT NULL,
  `user_id` varchar(100) COLLATE utf8_bin NOT NULL,
  `bio` varchar(200) COLLATE utf8_bin NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_login`
--

DROP TABLE IF EXISTS `user_login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_login` (
  `username` varchar(32) COLLATE utf8_bin NOT NULL,
  `email` varchar(254) COLLATE utf8_bin NOT NULL,
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `password` varchar(60) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username_unique` (`username`),
  UNIQUE KEY `email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=112 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-11-09 17:09:33