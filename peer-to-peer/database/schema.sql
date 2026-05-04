-- Peer-to-Peer Teaching and Learning Platform Database Schema
-- Adikavi Nannaya University – College of Engineering

CREATE DATABASE IF NOT EXISTS peer_learning;
USE peer_learning;

-- Registered Students Table
CREATE TABLE students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    roll_number VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255),
    password_hash VARCHAR(255),
    security_question VARCHAR(255),
    security_answer_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_STUDENT',
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_department (department),
    INDEX idx_roll_number (roll_number),
    INDEX idx_role (role)
);

CREATE TABLE password_resets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_expires_at (expires_at)
);

-- Uploaded Videos Table
CREATE TABLE videos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    department VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    video_url VARCHAR(500) NOT NULL,
    student_id BIGINT NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    view_count INT DEFAULT 0,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_department (department),
    INDEX idx_subject (subject),
    INDEX idx_upload_date (upload_date)
);

-- Likes Table
CREATE TABLE likes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    video_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    like_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (video_id, student_id),
    INDEX idx_video_id (video_id),
    INDEX idx_student_id (student_id)
);

-- Comments Table
CREATE TABLE comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    video_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    comment_text TEXT NOT NULL,
    comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_video_id (video_id),
    INDEX idx_comment_date (comment_date)
);

-- Insert sample departments data
INSERT INTO students (full_name, department, roll_number, email, password_hash) VALUES
('Sample Student', 'CSE', 'CSE001', 'sample@example.com', 'sample_hash');

-- Insert sample video
INSERT INTO videos (title, description, department, subject, video_url, student_id) VALUES
('Introduction to Java Programming', 'Basic concepts of Java programming language', 'CSE', 'Programming', 'https://example.com/video1.mp4', 1);

-- Insert sample like
INSERT INTO likes (video_id, student_id) VALUES (1, 1);

-- Insert sample comment
INSERT INTO comments (video_id, student_id, comment_text) VALUES 
(1, 1, 'Great explanation! Very helpful for beginners.'); 