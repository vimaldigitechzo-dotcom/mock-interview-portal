-- ============================================
-- AI Mock Interview Portal - Database Schema
-- Run this in MySQL Workbench or MySQL CLI
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS mock_interview_db;
USE mock_interview_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    google_id VARCHAR(255) UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Interview sessions table
CREATE TABLE IF NOT EXISTS interview_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    topic VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    total_questions INT NOT NULL,
    answered_questions INT DEFAULT 0,
    overall_score DOUBLE DEFAULT 0.0,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- Session questions table
CREATE TABLE IF NOT EXISTS session_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    question_number INT NOT NULL,
    question_text TEXT NOT NULL,
    question_difficulty VARCHAR(50) NOT NULL,
    user_answer TEXT,
    submitted VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE,
    INDEX idx_session_id (session_id)
);

-- Question evaluations table
CREATE TABLE IF NOT EXISTS question_evaluations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    session_id BIGINT NOT NULL,
    correctness_score INT,
    completeness_score INT,
    clarity_score INT,
    overall_score INT,
    feedback TEXT,
    strengths TEXT,
    improvements TEXT,
    ideal_answer TEXT,
    evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES session_questions(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE,
    INDEX idx_session_id (session_id),
    INDEX idx_question_id (question_id)
);

-- Topic statistics table
CREATE TABLE IF NOT EXISTS topic_stats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    topic VARCHAR(100) NOT NULL,
    total_sessions INT DEFAULT 0,
    total_questions INT DEFAULT 0,
    average_score DOUBLE DEFAULT 0.0,
    best_score DOUBLE DEFAULT 0.0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_topic (user_id, topic)
);

-- Recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    recommended_topic VARCHAR(255) NOT NULL,
    reason TEXT,
    priority VARCHAR(50) NOT NULL DEFAULT 'medium',
    confidence DOUBLE DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- ============================================
-- Create a test user (password: test123)
-- ============================================
INSERT INTO users (email, name, password, role)
VALUES ('test@test.com', 'Test User', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'USER');

-- ============================================
-- Verify tables created
-- ============================================
SHOW TABLES;
SELECT 'Database initialization complete!' AS message;
