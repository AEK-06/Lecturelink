-- =============================================================================
-- LectureLink — QR Code-Based Attendance Management System Production Database
-- Author: Momoh Kargbo (Student ID: 10838)
-- Group: Group 13 — UNIMAK Web Programming Project
-- Database Engine: PostgreSQL 14+
-- =============================================================================

-- Drop tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS attendance_sessions CASCADE;
DROP TABLE IF EXISTS class_enrollments CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- -----------------------------------------------------------------------------
-- 1. DEPARTMENTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 2. USERS TABLE
-- Stores credentials with password hashing support
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'lecturer', 'admin')),
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    department_id INT REFERENCES departments(department_id) ON DELETE SET NULL,
    matric_number VARCHAR(50),
    course_name VARCHAR(100),
    level INT CHECK (level BETWEEN 1 AND 4),
    staff_id VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 3. CLASSES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE classes (
    class_id VARCHAR(50) PRIMARY KEY,
    class_name VARCHAR(150) NOT NULL,
    course_code VARCHAR(20) NOT NULL,
    lecturer_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    department_id INT REFERENCES departments(department_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 4. CLASS ENROLLMENTS TABLE (Many-to-Many: Students to Classes)
-- -----------------------------------------------------------------------------
CREATE TABLE class_enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    class_id VARCHAR(50) NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
    student_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, student_id)
);

-- -----------------------------------------------------------------------------
-- 5. ATTENDANCE SESSIONS TABLE (Generated Dynamic QR Tokens)
-- -----------------------------------------------------------------------------
CREATE TABLE attendance_sessions (
    session_id VARCHAR(50) PRIMARY KEY,
    class_id VARCHAR(50) NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
    qr_token VARCHAR(100) NOT NULL UNIQUE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 6. ATTENDANCE RECORDS TABLE (Marked Student Sign-Ins)
-- -----------------------------------------------------------------------------
CREATE TABLE attendance_records (
    attendance_id VARCHAR(50) PRIMARY KEY,
    session_id VARCHAR(50) NOT NULL REFERENCES attendance_sessions(session_id) ON DELETE CASCADE,
    student_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verification_mode VARCHAR(30) DEFAULT 'camera_qr' CHECK (verification_mode IN ('camera_qr', 'manual_token', 'lecturer_override')),
    status VARCHAR(20) NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'late', 'absent')),
    UNIQUE(session_id, student_id)
);

-- -----------------------------------------------------------------------------
-- 7. AUDIT LOGS TABLE
-- Tracks Administrative & Attendance Override Actions
-- -----------------------------------------------------------------------------
CREATE TABLE audit_logs (
    log_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- INDEXES FOR HIGH-SPEED QUERY PERFORMANCE
-- =============================================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_classes_lecturer ON classes(lecturer_id);
CREATE INDEX idx_sessions_class ON attendance_sessions(class_id);
CREATE INDEX idx_sessions_token ON attendance_sessions(qr_token);
CREATE INDEX idx_attendance_session ON attendance_records(session_id);
CREATE INDEX idx_attendance_student ON attendance_records(student_id);

-- =============================================================================
-- SEED DATA (Standardized Default Accounts)
-- =============================================================================

INSERT INTO departments (department_id, department_name, code) VALUES
(1, 'Computer Science', 'CSC'),
(2, 'Engineering', 'ENG'),
(3, 'Business Administration', 'BUS'),
(4, 'Social Sciences', 'SOC'),
(5, 'General Studies', 'GNS');

-- Pre-loaded Users (Password hash representations)
INSERT INTO users (user_id, role, full_name, email, password_hash, department_id, matric_number, course_name, level, staff_id) VALUES
('u1', 'lecturer', 'Dr. Ibrahim Koroma',     'ikoroma@unimak.edu.sl',  '$2a$12$lecturer123hash...', 1, NULL, NULL, NULL, 'STF001'),
('u2', 'lecturer', 'Prof. Mariatu Bangura',  'mbangura@unimak.edu.sl', '$2a$12$lecturer123hash...', 2, NULL, NULL, NULL, 'STF002'),
('u3', 'admin',    'Administrator',          'admin@unimak.edu.sl',    '$2a$12$admin123hash...',    NULL, NULL, NULL, NULL, 'ADM001'),
('u4', 'student',  'Alimamy Kamara',        'akamara@unimak.edu.sl',  '$2a$12$student123hash...',  1, '11277', 'Computer Science', 3, NULL),
('u5', 'student',  'Emmanuel Aruna',        'earuna@unimak.edu.sl',   '$2a$12$student123hash...',  1, '10027', 'Computer Science', 3, NULL),
('u6', 'student',  'Leema Kamara',          'lkamara@unimak.edu.sl',  '$2a$12$student123hash...',  2, '8780',  'Engineering', 2, NULL),
('u7', 'student',  'Samuel Dumbuya',        'sdumbuya@unimak.edu.sl', '$2a$12$student123hash...',  3, '10533', 'Business Administration', 2, NULL),
('u8', 'student',  'Momoh Kargbo',          'mkargbo@unimak.edu.sl',  '$2a$12$student123hash...',  1, '10838', 'Computer Science', 3, NULL),
('u9', 'student',  'Fatima Sesay',          'fsesay@unimak.edu.sl',   '$2a$12$student123hash...',  4, '11500', 'Social Sciences', 1, NULL);

INSERT INTO classes (class_id, class_name, course_code, lecturer_id, department_id) VALUES
('c1', 'Advanced Software Engineering', 'CSC401', 'u1', 1),
('c2', 'Database Systems',              'CSC302', 'u1', 1),
('c3', 'Linear Algebra',                'MTH201', 'u2', 2),
('c4', 'Communication Skills',          'GNS101', 'u2', 5);

INSERT INTO class_enrollments (class_id, student_id) VALUES
('c1', 'u4'), ('c1', 'u5'), ('c1', 'u8'),
('c2', 'u4'), ('c2', 'u5'), ('c2', 'u8'),
('c3', 'u6'),
('c4', 'u7'), ('c4', 'u9');

INSERT INTO attendance_sessions (session_id, class_id, qr_token, start_time, end_time, status) VALUES
('s1', 'c1', 'TOKEN-ADV-001', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '5 minutes', 'closed'),
('s2', 'c2', 'TOKEN-DB-001',  NOW() - INTERVAL '1 day',  NOW() - INTERVAL '1 day'  + INTERVAL '5 minutes', 'closed'),
('s3', 'c3', 'TOKEN-LA-001',  NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '5 minutes', 'closed');

INSERT INTO attendance_records (attendance_id, session_id, student_id, scanned_at, verification_mode, status) VALUES
('a1', 's1', 'u4', NOW() - INTERVAL '2 days' + INTERVAL '1 minute', 'camera_qr', 'present'),
('a2', 's1', 'u5', NOW() - INTERVAL '2 days' + INTERVAL '2 minutes', 'camera_qr', 'present'),
('a3', 's1', 'u8', NOW() - INTERVAL '2 days' + INTERVAL '3 minutes', 'camera_qr', 'present'),
('a4', 's2', 'u4', NOW() - INTERVAL '1 day'  + INTERVAL '1 minute', 'camera_qr', 'present'),
('a5', 's2', 'u8', NOW() - INTERVAL '1 day'  + INTERVAL '2 minutes', 'camera_qr', 'present'),
('a6', 's3', 'u6', NOW() - INTERVAL '3 days' + INTERVAL '1 minute', 'camera_qr', 'present');
