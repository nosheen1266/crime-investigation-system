USE crime_investigation_db;

CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('citizen','officer','forensic','admin')),
    is_active BIT NOT NULL DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE()
);

CREATE TABLE citizens (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    cnic VARCHAR(15) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    profile_pic VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE officers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    badge_number VARCHAR(50) NOT NULL UNIQUE,
    rank VARCHAR(100) NOT NULL,
    department VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE forensic_officers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    lab_id VARCHAR(50) NOT NULL UNIQUE,
    specialization VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE applications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    citizen_id INT NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    incident_date DATE NOT NULL,
    incident_location VARCHAR(500) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','assigned','investigating','pending_forensic','closed')),
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (citizen_id) REFERENCES citizens(id)
);

CREATE TABLE fir_reports (
    id INT IDENTITY(1,1) PRIMARY KEY,
    application_id INT NOT NULL UNIQUE,
    fir_number VARCHAR(100) NOT NULL UNIQUE,
    details TEXT,
    filed_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (application_id) REFERENCES applications(id)
);

CREATE TABLE case_assignments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    application_id INT NOT NULL,
    officer_id INT NOT NULL,
    assigned_by INT NOT NULL,
    notes TEXT,
    assigned_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (application_id) REFERENCES applications(id),
    FOREIGN KEY (officer_id) REFERENCES officers(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id)
);

CREATE TABLE evidence (
    id INT IDENTITY(1,1) PRIMARY KEY,
    application_id INT NOT NULL,
    uploaded_by INT NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    description TEXT,
    assigned_to_forensic INT,
    assigned_at DATETIME,
    uploaded_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (application_id) REFERENCES applications(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to_forensic) REFERENCES forensic_officers(id)
);

CREATE TABLE forensic_reports (
    id INT IDENTITY(1,1) PRIMARY KEY,
    evidence_id INT NOT NULL,
    forensic_officer_id INT NOT NULL,
    findings TEXT NOT NULL,
    conclusion TEXT,
    report_file_path VARCHAR(1000),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_analysis','submitted')),
    submitted_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (evidence_id) REFERENCES evidence(id),
    FOREIGN KEY (forensic_officer_id) REFERENCES forensic_officers(id)
);

CREATE TABLE lab_findings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    forensic_report_id INT NOT NULL,
    finding_type VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    conclusion VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (forensic_report_id) REFERENCES forensic_reports(id)
);

CREATE TABLE suspects (
    id INT IDENTITY(1,1) PRIMARY KEY,
    application_id INT NOT NULL,
    added_by_officer INT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    relationship_to_case VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (application_id) REFERENCES applications(id),
    FOREIGN KEY (added_by_officer) REFERENCES officers(id)
);

CREATE TABLE witnesses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    application_id INT NOT NULL,
    added_by_officer INT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    contact VARCHAR(100),
    statement TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (application_id) REFERENCES applications(id),
    FOREIGN KEY (added_by_officer) REFERENCES officers(id)
);

CREATE TABLE notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (type IN ('info','success','warning','danger')),
    is_read BIT NOT NULL DEFAULT 0,
    related_application_id INT,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (related_application_id) REFERENCES applications(id)
);

CREATE TABLE activity_logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE password_reset_tokens (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used BIT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);




-- Insert admin user (password: N0SHEEn126)
INSERT INTO users (email, password_hash, role) VALUES
('admin@crimesystem.gov', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2IgHbE5H8m', 'admin');

-- Insert officer users (password: Officer@123)
INSERT INTO users (email, password_hash, role) VALUES
('officer1@crimesystem.gov', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'officer'),
('officer2@crimesystem.gov', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'officer');

-- Insert forensic users (password: Forensic@123)
INSERT INTO users (email, password_hash, role) VALUES
('forensic1@crimesystem.gov', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'forensic'),
('forensic2@crimesystem.gov', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'forensic');

-- Insert citizen users (password: Citizen@123)
INSERT INTO users (email, password_hash, role) VALUES
('citizen1@gmail.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'citizen'),
('citizen2@gmail.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'citizen'),
('citizen3@gmail.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'citizen');

-- Insert officers
INSERT INTO officers (user_id, full_name, badge_number, rank, department) VALUES
(2, 'Ali Hassan', 'OFF-001', 'Inspector', 'Homicide Division'),
(3, 'Usman Khan', 'OFF-002', 'Sub-Inspector', 'Cybercrime Unit');

-- Insert forensic officers
INSERT INTO forensic_officers (user_id, full_name, lab_id, specialization) VALUES
(4, 'Dr. Sara Ahmed', 'LAB-001', 'Digital Forensics'),
(5, 'Dr. Bilal Malik', 'LAB-002', 'DNA Analysis');

-- Insert citizens
INSERT INTO citizens (user_id, full_name, cnic, phone, address) VALUES
(6, 'Ahmed Khan', '42201-1234567-1', '0321-1234567', 'House 12, Street 4, Lahore'),
(7, 'Sara Malik', '42201-7654321-2', '0333-7654321', 'Flat 5, Block B, Karachi'),
(8, 'Bilal Ahmad', '42201-9999999-3', '0300-9999999', 'Plot 33, G-10, Islamabad');

-- Insert sample applications
INSERT INTO applications (citizen_id, title, description, incident_date, incident_location, status) VALUES
(1, 'Mobile Phone Snatching', 'My mobile phone was snatched near main market by two men on a motorcycle.', '2025-05-20', 'Main Market, Lahore', 'assigned'),
(2, 'House Burglary', 'Someone broke into my house while I was away and stole valuables.', '2025-05-22', 'Block B, Karachi', 'pending'),
(3, 'Online Fraud', 'I was defrauded online for Rs. 50,000 through a fake investment scheme.', '2025-05-23', 'G-10, Islamabad', 'investigating');

-- Insert case assignment
INSERT INTO case_assignments (application_id, officer_id, assigned_by, notes) VALUES
(1, 1, 1, 'High priority case - assign immediately');

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type) VALUES
(6, 'Application Submitted', 'Your application has been received and is under review.', 'success'),
(6, 'Case Assigned', 'Your case has been assigned to an investigating officer.', 'info'),
(2, 'New Case Assigned', 'A new case has been assigned to you. Please review immediately.', 'info'),
(7, 'Application Received', 'Your complaint has been registered successfully.', 'success'),
(8, 'Case Update', 'Your case is now under active investigation.', 'info');