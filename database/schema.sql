-- =====================================================
-- Al-Manakhir Basic School - Database Schema
-- PostgreSQL 15+
-- Version: 1.0
-- Date: 2026-02-12
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. ROLES & AUTHENTICATION
-- =====================================================

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    name_ar VARCHAR(50) NOT NULL,
    name_en VARCHAR(50) NOT NULL,
    description TEXT,
    permissions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (name, name_ar, name_en, description, permissions) VALUES
('student', 'طالب', 'Student', 'Student access level', '{"read": true, "submit": true}'),
('teacher', 'معلم', 'Teacher', 'Teacher access level', '{"read": true, "write": true, "grade": true}'),
('admin', 'مدير', 'Administrator', 'Full system access', '{"read": true, "write": true, "delete": true, "manage_users": true}');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) 
        REFERENCES roles(id) ON DELETE RESTRICT
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_active ON users(is_active) WHERE deleted_at IS NULL;

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    first_name_ar VARCHAR(100),
    last_name_ar VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(10),
    phone VARCHAR(20),
    parent_phone VARCHAR(20),
    address TEXT,
    profile_picture_url VARCHAR(500),
    national_id VARCHAR(50),
    enrollment_date DATE,
    graduation_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_profiles_user ON user_profiles(user_id);
CREATE INDEX idx_profiles_name ON user_profiles(first_name, last_name);

-- =====================================================
-- 2. ACADEMIC STRUCTURE
-- =====================================================

CREATE TABLE grades (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    display_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert grade levels
INSERT INTO grades (code, name_ar, name_en, display_order) VALUES
('KG', 'روضة', 'Kindergarten', 1),
('1', 'الصف الأول', 'Grade 1', 2),
('2', 'الصف الثاني', 'Grade 2', 3),
('3', 'الصف الثالث', 'Grade 3', 4),
('4', 'الصف الرابع', 'Grade 4', 5),
('5', 'الصف الخامس', 'Grade 5', 6),
('6', 'الصف السادس', 'Grade 6', 7),
('7', 'الصف السابع', 'Grade 7', 8),
('8', 'الصف الثامن', 'Grade 8', 9),
('9', 'الصف التاسع', 'Grade 9', 10),
('10', 'الصف العاشر', 'Grade 10', 11),
('11', 'الصف الحادي عشر', 'Grade 11', 12),
('Tawjihi', 'التوجيهي', 'Tawjihi', 13);

CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(10) NOT NULL,
    name_en VARCHAR(10) NOT NULL,
    grade_id INTEGER NOT NULL,
    teacher_id UUID,
    max_students INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_sections_grade FOREIGN KEY (grade_id) 
        REFERENCES grades(id) ON DELETE CASCADE,
    CONSTRAINT fk_sections_teacher FOREIGN KEY (teacher_id) 
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT unique_grade_section UNIQUE (grade_id, name)
);

CREATE INDEX idx_sections_grade ON sections(grade_id);
CREATE INDEX idx_sections_teacher ON sections(teacher_id);

CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    icon VARCHAR(100),
    color VARCHAR(7),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default subjects
INSERT INTO subjects (code, name_ar, name_en, icon, color) VALUES
('MATH', 'رياضيات', 'Mathematics', '📐', '#2196F3'),
('SCI', 'علوم', 'Science', '🔬', '#4CAF50'),
('ARAB', 'لغة عربية', 'Arabic Language', '📖', '#FF5722'),
('ENG', 'لغة إنجليزية', 'English Language', '🇬🇧', '#9C27B0'),
('ARTS', 'فنون', 'Arts', '🎨', '#FF9800'),
('PE', 'رياضة', 'Physical Education', '⚽', '#00BCD4'),
('RELIG', 'تربية إسلامية', 'Islamic Education', '☪️', '#009688'),
('SOCIAL', 'اجتماعيات', 'Social Studies', '🌍', '#795548');

CREATE TABLE user_grade_sections (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    grade_id INTEGER NOT NULL,
    section_id INTEGER,
    academic_year VARCHAR(9) NOT NULL,
    is_current BOOLEAN DEFAULT true,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_ugs_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ugs_grade FOREIGN KEY (grade_id) 
        REFERENCES grades(id) ON DELETE RESTRICT,
    CONSTRAINT fk_ugs_section FOREIGN KEY (section_id) 
        REFERENCES sections(id) ON DELETE SET NULL,
    CONSTRAINT unique_user_grade_year UNIQUE (user_id, grade_id, academic_year)
);

CREATE INDEX idx_ugs_user ON user_grade_sections(user_id);
CREATE INDEX idx_ugs_grade ON user_grade_sections(grade_id);
CREATE INDEX idx_ugs_current ON user_grade_sections(is_current) WHERE is_current = true;

-- =====================================================
-- 3. HOMEWORK & ASSIGNMENTS
-- =====================================================

CREATE TABLE homework (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_ar VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    content_ar TEXT,
    content_en TEXT,
    subject_id INTEGER NOT NULL,
    grade_id INTEGER NOT NULL,
    section_id INTEGER,
    teacher_id UUID NOT NULL,
    due_date TIMESTAMP NOT NULL,
    allow_file_submission BOOLEAN DEFAULT true,
    allow_text_submission BOOLEAN DEFAULT true,
    max_file_size_mb INTEGER DEFAULT 10,
    allowed_file_types VARCHAR(255),
    points INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_homework_subject FOREIGN KEY (subject_id) 
        REFERENCES subjects(id) ON DELETE RESTRICT,
    CONSTRAINT fk_homework_grade FOREIGN KEY (grade_id) 
        REFERENCES grades(id) ON DELETE RESTRICT,
    CONSTRAINT fk_homework_section FOREIGN KEY (section_id) 
        REFERENCES sections(id) ON DELETE SET NULL,
    CONSTRAINT fk_homework_teacher FOREIGN KEY (teacher_id) 
        REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_homework_grade ON homework(grade_id);
CREATE INDEX idx_homework_subject ON homework(subject_id);
CREATE INDEX idx_homework_due_date ON homework(due_date);
CREATE INDEX idx_homework_teacher ON homework(teacher_id);
CREATE INDEX idx_homework_published ON homework(is_published) WHERE deleted_at IS NULL;

CREATE TABLE homework_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    homework_id UUID NOT NULL,
    student_id UUID NOT NULL,
    submission_text TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    score DECIMAL(5,2),
    max_score DECIMAL(5,2),
    stars INTEGER CHECK (stars >= 0 AND stars <= 5),
    feedback_text TEXT,
    teacher_id UUID,
    submitted_at TIMESTAMP,
    graded_at TIMESTAMP,
    is_late BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_submissions_homework FOREIGN KEY (homework_id) 
        REFERENCES homework(id) ON DELETE CASCADE,
    CONSTRAINT fk_submissions_student FOREIGN KEY (student_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_submissions_teacher FOREIGN KEY (teacher_id) 
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT unique_student_homework UNIQUE (homework_id, student_id)
);

CREATE INDEX idx_submissions_homework ON homework_submissions(homework_id);
CREATE INDEX idx_submissions_student ON homework_submissions(student_id);
CREATE INDEX idx_submissions_status ON homework_submissions(status);
CREATE INDEX idx_submissions_submitted ON homework_submissions(submitted_at);

-- =====================================================
-- 4. MATERIALS & RESOURCES
-- =====================================================

CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_ar VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    content_ar TEXT,
    content_en TEXT,
    description_ar TEXT,
    description_en TEXT,
    subject_id INTEGER NOT NULL,
    grade_id INTEGER NOT NULL,
    teacher_id UUID NOT NULL,
    file_type VARCHAR(50),
    file_url VARCHAR(500),
    file_size_kb INTEGER,
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_materials_subject FOREIGN KEY (subject_id) 
        REFERENCES subjects(id) ON DELETE RESTRICT,
    CONSTRAINT fk_materials_grade FOREIGN KEY (grade_id) 
        REFERENCES grades(id) ON DELETE RESTRICT,
    CONSTRAINT fk_materials_teacher FOREIGN KEY (teacher_id) 
        REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_materials_grade ON materials(grade_id);
CREATE INDEX idx_materials_subject ON materials(subject_id);
CREATE INDEX idx_materials_teacher ON materials(teacher_id);
CREATE INDEX idx_materials_published ON materials(is_published) WHERE deleted_at IS NULL;

-- =====================================================
-- 5. QUIZZES & EXAMS
-- =====================================================

CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_ar VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    subject_id INTEGER NOT NULL,
    grade_id INTEGER NOT NULL,
    teacher_id UUID NOT NULL,
    quiz_date DATE,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration_minutes INTEGER NOT NULL,
    total_points INTEGER DEFAULT 0,
    passing_score DECIMAL(5,2),
    max_attempts INTEGER DEFAULT 1,
    shuffle_questions BOOLEAN DEFAULT false,
    show_correct_answers BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_quizzes_subject FOREIGN KEY (subject_id) 
        REFERENCES subjects(id) ON DELETE RESTRICT,
    CONSTRAINT fk_quizzes_grade FOREIGN KEY (grade_id) 
        REFERENCES grades(id) ON DELETE RESTRICT,
    CONSTRAINT fk_quizzes_teacher FOREIGN KEY (teacher_id) 
        REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_quizzes_grade ON quizzes(grade_id);
CREATE INDEX idx_quizzes_subject ON quizzes(subject_id);
CREATE INDEX idx_quizzes_date ON quizzes(quiz_date);
CREATE INDEX idx_quizzes_published ON quizzes(is_published) WHERE deleted_at IS NULL;

CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL,
    question_text_ar TEXT NOT NULL,
    question_text_en TEXT NOT NULL,
    question_type VARCHAR(50) DEFAULT 'multiple_choice',
    points INTEGER DEFAULT 1,
    display_order INTEGER,
    image_url VARCHAR(500),
    correct_answer_index INTEGER,
    correct_answer_text TEXT,
    explanation_ar TEXT,
    explanation_en TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_questions_quiz FOREIGN KEY (quiz_id) 
        REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE INDEX idx_questions_quiz ON questions(quiz_id);
CREATE INDEX idx_questions_order ON questions(quiz_id, display_order);

CREATE TABLE question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL,
    option_text_ar VARCHAR(500) NOT NULL,
    option_text_en VARCHAR(500) NOT NULL,
    option_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_options_question FOREIGN KEY (question_id) 
        REFERENCES questions(id) ON DELETE CASCADE
);

CREATE INDEX idx_options_question ON question_options(question_id);

CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL,
    student_id UUID NOT NULL,
    attempt_number INTEGER NOT NULL,
    score DECIMAL(5,2),
    percentage DECIMAL(5,2),
    total_questions INTEGER,
    correct_answers INTEGER,
    status VARCHAR(20) DEFAULT 'in_progress',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    time_taken_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_attempts_quiz FOREIGN KEY (quiz_id) 
        REFERENCES quizzes(id) ON DELETE CASCADE,
    CONSTRAINT fk_attempts_student FOREIGN KEY (student_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_quiz_student_attempt UNIQUE (quiz_id, student_id, attempt_number)
);

CREATE INDEX idx_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX idx_attempts_student ON quiz_attempts(student_id);
CREATE INDEX idx_attempts_status ON quiz_attempts(status);

CREATE TABLE student_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL,
    question_id UUID NOT NULL,
    selected_option_index INTEGER,
    answer_text TEXT,
    is_correct BOOLEAN,
    points_earned DECIMAL(5,2),
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_answers_attempt FOREIGN KEY (attempt_id) 
        REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    CONSTRAINT fk_answers_question FOREIGN KEY (question_id) 
        REFERENCES questions(id) ON DELETE CASCADE,
    CONSTRAINT unique_attempt_question UNIQUE (attempt_id, question_id)
);

CREATE INDEX idx_answers_attempt ON student_answers(attempt_id);
CREATE INDEX idx_answers_question ON student_answers(question_id);

-- =====================================================
-- 6. NEWS & ANNOUNCEMENTS
-- =====================================================

CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_ar VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    content_ar TEXT NOT NULL,
    content_en TEXT NOT NULL,
    category_ar VARCHAR(100),
    category_en VARCHAR(100),
    author_id UUID NOT NULL,
    is_important BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_news_author FOREIGN KEY (author_id) 
        REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_news_published ON news(published_at DESC) WHERE is_published = true;
CREATE INDEX idx_news_important ON news(is_important) WHERE is_important = true;
CREATE INDEX idx_news_author ON news(author_id);

CREATE TABLE news_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    news_id UUID NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    caption_ar VARCHAR(255),
    caption_en VARCHAR(255),
    display_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_newsimg_news FOREIGN KEY (news_id) 
        REFERENCES news(id) ON DELETE CASCADE
);

CREATE INDEX idx_newsimg_news ON news_images(news_id);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    news_id UUID NOT NULL,
    user_id UUID NOT NULL,
    comment_text TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    is_flagged BOOLEAN DEFAULT false,
    parent_comment_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_comments_news FOREIGN KEY (news_id) 
        REFERENCES news(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_parent FOREIGN KEY (parent_comment_id) 
        REFERENCES comments(id) ON DELETE CASCADE
);

CREATE INDEX idx_comments_news ON comments(news_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_approved ON comments(is_approved) WHERE deleted_at IS NULL;

-- =====================================================
-- 7. FILE MANAGEMENT
-- =====================================================

CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_extension VARCHAR(10),
    uploaded_by UUID NOT NULL,
    upload_ip VARCHAR(45),
    checksum VARCHAR(64),
    is_public BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_files_uploader FOREIGN KEY (uploaded_by) 
        REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_files_uploader ON files(uploaded_by);
CREATE INDEX idx_files_created ON files(created_at DESC);
CREATE INDEX idx_files_checksum ON files(checksum);

CREATE TABLE submission_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL,
    file_id UUID NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_subfiles_submission FOREIGN KEY (submission_id) 
        REFERENCES homework_submissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_subfiles_file FOREIGN KEY (file_id) 
        REFERENCES files(id) ON DELETE CASCADE
);

CREATE INDEX idx_subfiles_submission ON submission_files(submission_id);

-- =====================================================
-- 8. SYSTEM & CONFIGURATION
-- =====================================================

CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50),
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_settings_user FOREIGN KEY (updated_by) 
        REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default settings
INSERT INTO settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('school_name_ar', 'مدرسة المناخر الأساسية', 'string', 'School name in Arabic', true),
('school_name_en', 'Al-Manakhir Basic School', 'string', 'School name in English', true),
('academic_year', '2026-2027', 'string', 'Current academic year', true),
('max_file_upload_mb', '10', 'number', 'Maximum file upload size in MB', false),
('allow_student_comments', 'true', 'boolean', 'Allow students to comment on news', false);

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(100),
    record_id VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_table ON audit_logs(table_name);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- =====================================================
-- 9. TRIGGERS & FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_homework_updated_at BEFORE UPDATE ON homework
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON homework_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. VIEWS
-- =====================================================

-- View for active students with their grade/section
CREATE VIEW v_active_students AS
SELECT 
    u.id,
    u.username,
    u.email,
    up.first_name,
    up.last_name,
    up.first_name_ar,
    up.last_name_ar,
    g.code as grade_code,
    g.name_ar as grade_name_ar,
    g.name_en as grade_name_en,
    s.name as section_name,
    ugs.academic_year
FROM users u
JOIN user_profiles up ON u.id = up.user_id
JOIN user_grade_sections ugs ON u.id = ugs.user_id
JOIN grades g ON ugs.grade_id = g.id
LEFT JOIN sections s ON ugs.section_id = s.id
WHERE u.is_active = true
  AND u.deleted_at IS NULL
  AND ugs.is_current = true
  AND u.role_id = (SELECT id FROM roles WHERE name = 'student');

-- View for published homework with details
CREATE VIEW v_published_homework AS
SELECT 
    h.id,
    h.title_ar,
    h.title_en,
    h.content_ar,
    h.content_en,
    h.due_date,
    h.points,
    g.code as grade_code,
    g.name_ar as grade_name_ar,
    g.name_en as grade_name_en,
    s.name as section_name,
    subj.code as subject_code,
    subj.name_ar as subject_name_ar,
    subj.name_en as subject_name_en,
    subj.color as subject_color,
    u.username as teacher_username,
    up.first_name as teacher_first_name,
    up.last_name as teacher_last_name
FROM homework h
JOIN grades g ON h.grade_id = g.id
LEFT JOIN sections s ON h.section_id = s.id
JOIN subjects subj ON h.subject_id = subj.id
JOIN users u ON h.teacher_id = u.id
JOIN user_profiles up ON u.id = up.user_id
WHERE h.is_published = true
  AND h.deleted_at IS NULL;

-- =====================================================
-- Schema creation complete!
-- =====================================================
