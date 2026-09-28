-- NGO Surveys database schema
-- Run once to create the database, e.g.:
--   mysql -u root -p < schema.sql
-- or with Docker Compose (see docker-compose.yml) it is seeded automatically.

CREATE DATABASE IF NOT EXISTS ngo_surveys
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ngo_surveys;

SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS = 0;

-- Users ---------------------------------------------------------------
-- Passwords are stored as bcrypt hashes (salted). Never store plaintext.
CREATE TABLE users (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  phone         VARCHAR(20) NULL,
  password_hash VARCHAR(255) NOT NULL,
  balance       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_earned  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status        ENUM('active','suspended') NOT NULL DEFAULT 'active',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_status (status)
) ENGINE=InnoDB;

-- Survey definitions ---------------------------------------------------
CREATE TABLE surveys (
  id                VARCHAR(40) NOT NULL PRIMARY KEY,
  title             VARCHAR(200) NOT NULL,
  tier              ENUM('free','premium','premium_plus') NOT NULL,
  unlock_fee        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  reward_per_question DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_surveys_tier (tier)
) ENGINE=InnoDB;

-- Questions (one row per question, options stored as JSON array) ------
CREATE TABLE survey_questions (
  id          VARCHAR(60) NOT NULL,
  survey_id   VARCHAR(40) NOT NULL,
  sort_order  INT UNSIGNED NOT NULL DEFAULT 1,
  text        TEXT NOT NULL,
  options     JSON NOT NULL,
  PRIMARY KEY (id, survey_id),
  UNIQUE KEY uq_survey_question (survey_id, id),
  KEY fk_questions_survey (survey_id),
  CONSTRAINT fk_questions_survey FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Per-user survey progress --------------------------------------------
CREATE TABLE user_surveys (
  user_id       BIGINT UNSIGNED NOT NULL,
  survey_id     VARCHAR(40) NOT NULL,
  unlocked      TINYINT(1) NOT NULL DEFAULT 0,
  completed_at  TIMESTAMP NULL,
  PRIMARY KEY (user_id, survey_id),
  KEY idx_user_surveys_survey (survey_id),
  CONSTRAINT fk_user_surveys_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_surveys_survey FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Individual answered questions ----------------------------------------
CREATE TABLE user_answers (
  user_id       BIGINT UNSIGNED NOT NULL,
  survey_id     VARCHAR(40) NOT NULL,
  question_id   VARCHAR(60) NOT NULL,
  answer_index  INT UNSIGNED NOT NULL,
  reward        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  answered_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, survey_id, question_id),
  KEY idx_user_answers_survey (survey_id),
  CONSTRAINT fk_user_answers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_answers_survey FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_answers_question FOREIGN KEY (survey_id, question_id) REFERENCES survey_questions(survey_id, id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Withdrawal / payout requests ----------------------------------------
CREATE TABLE withdrawals (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL,
  recipient_name VARCHAR(200) NOT NULL,
  phone         VARCHAR(20) NOT NULL,
  amount        DECIMAL(10,2) NOT NULL,
  status        ENUM('pending','processing','paid','failed') NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at  TIMESTAMP NULL,
  KEY fk_withdrawals_user (user_id),
  CONSTRAINT fk_withdrawals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Password reset tokens (single-use, expire after 1 hour) -------------
CREATE TABLE password_resets (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  token       VARCHAR(128) NOT NULL UNIQUE,
  used        TINYINT(1) NOT NULL DEFAULT 0,
  expires_at  TIMESTAMP NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY fk_password_resets_user (user_id),
  CONSTRAINT fk_password_resets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Refresh tokens (optional, for longer sessions) -----------------------
CREATE TABLE refresh_tokens (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  token_hash  VARCHAR(128) NOT NULL UNIQUE,
  user_agent  TEXT NULL,
  expires_at  TIMESTAMP NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY fk_refresh_tokens_user (user_id),
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
