USE master;
CREATE LOGIN crimesystem WITH PASSWORD = 'Crime@12345';
USE crime_investigation_db;
CREATE USER crimesystem FOR LOGIN crimesystem;
ALTER ROLE db_owner ADD MEMBER crimesystem;



USE crime_investigation_db;

-- Delete old users and re-insert with correct bcrypt hashes
DELETE FROM notifications;
DELETE FROM case_assignments;
DELETE FROM evidence;
DELETE FROM applications;
DELETE FROM citizens;
DELETE FROM officers;
DELETE FROM forensic_officers;
DELETE FROM users;

-- Re-insert with correct bcrypt hash for 'Citizen@123', 'Officer@123', 'Forensic@123', 'N0SHEEn126'
-- All passwords below use hash: $2a$12$K8GpYxBNZTFpmpFHpxBrxeZ8vlGAP8QVf5PVjCsHf4OL0cITKRXZi (= Test@1234)

-- Let's use ONE password for all: Crime@2025
-- Hash of Crime@2025:
INSERT INTO users (email, password_hash, role) VALUES
('admin@crimesystem.gov', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2IgHbE5H8m', 'admin'),
('officer1@crimesystem.gov', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2IgHbE5H8m', 'officer'),
('officer2@crimesystem.gov', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2IgHbE5H8m', 'officer'),
('forensic1@crimesystem.gov', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2IgHbE5H8m', 'forensic'),
('forensic2@crimesystem.gov', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2IgHbE5H8m', 'forensic'),
('citizen1@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2IgHbE5H8m', 'citizen'),
('citizen2@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2IgHbE5H8m', 'citizen'),
('citizen3@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2IgHbE5H8m', 'citizen');

INSERT INTO officers (user_id, full_name, badge_number, rank, department) VALUES
(2, 'Ali Hassan', 'OFF-001', 'Inspector', 'Homicide Division'),
(3, 'Usman Khan', 'OFF-002', 'Sub-Inspector', 'Cybercrime Unit');

INSERT INTO forensic_officers (user_id, full_name, lab_id, specialization) VALUES
(4, 'Dr. Sara Ahmed', 'LAB-001', 'Digital Forensics'),
(5, 'Dr. Bilal Malik', 'LAB-002', 'DNA Analysis');

INSERT INTO citizens (user_id, full_name, cnic, phone, address) VALUES
(6, 'Ahmed Khan', '42201-1234567-1', '0321-1234567', 'House 12, Street 4, Lahore'),
(7, 'Sara Malik', '42201-7654321-2', '0333-7654321', 'Flat 5, Block B, Karachi'),
(8, 'Bilal Ahmad', '42201-9999999-3', '0300-9999999', 'Plot 33, G-10, Islamabad');

INSERT INTO applications (citizen_id, title, description, incident_date, incident_location, status) VALUES
(1, 'Mobile Phone Snatching', 'My mobile phone was snatched near main market.', '2025-05-20', 'Main Market, Lahore', 'assigned'),
(2, 'House Burglary', 'Someone broke into my house while I was away.', '2025-05-22', 'Block B, Karachi', 'pending'),
(3, 'Online Fraud', 'I was defrauded online for Rs. 50,000.', '2025-05-23', 'G-10, Islamabad', 'investigating');

INSERT INTO case_assignments (application_id, officer_id, assigned_by, notes) VALUES
(1, 1, 1, 'High priority case');



USE crime_investigation_db;

-- Generate correct hash for N0SHEEn126
UPDATE users 
SET password_hash = '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email = 'admin@crimesystem.gov';



SELECT id, email, password_hash, role, is_active FROM users WHERE email = 'admin@crimesystem.gov';
UPDATE users SET password_hash = 'PASTE_HASH_HERE' WHERE email = 'admin@crimesystem.gov';

UPDATE users 
SET password_hash = '$2b$12$0BiF2tC64SQMhzaQhqOkI.PQs9kuoCWJjxxstI7ZkkNPMgHESCvjm' 
WHERE email = 'admin@crimesystem.gov';

USE crime_investigation_db;

-- Generate correct hashes first
-- Officer@123 and Forensic@123 and Citizen@123 all need fixing

-- Update all officers (password: Officer@123)
UPDATE users SET password_hash = '$2b$12$0BiF2tC64SQMhzaQhqOkI.PQs9kuoCWJjxxstI7ZkkNPMgHESCvjm' 
WHERE role = 'officer';

-- Update all forensic (password: Forensic@123)  
UPDATE users SET password_hash = '$2b$12$0BiF2tC64SQMhzaQhqOkI.PQs9kuoCWJjxxstI7ZkkNPMgHESCvjm' 
WHERE role = 'forensic';

-- Update all citizens (password: Citizen@123)
UPDATE users SET password_hash = '$2b$12$0BiF2tC64SQMhzaQhqOkI.PQs9kuoCWJjxxstI7ZkkNPMgHESCvjm' 
WHERE role = 'citizen';

USE crime_investigation_db;

-- Officers (password: Officer@123)
UPDATE users SET password_hash = '$2b$12$dZdilw1uF2proOZ4Kav4jOxr/mhXWMsa2qLqKjLWLJkzi3pRLIYd.' 
WHERE role = 'officer';

-- Forensic (password: Forensic@123)
UPDATE users SET password_hash = '$2b$12$tVI18rTBLtpU5I9S17DjiuItA3yHic8StLAsloMslEARhcV9LNB3y' 
WHERE role = 'forensic';

-- Citizens (password: Citizen@123)
UPDATE users SET password_hash = '$2b$12$M5E6l2rlnu53uA4CWRklge7cXHrX5XygozdJXa8utVzO73DRcvaQa' 
WHERE role = 'citizen';

-- Admin (password: N0SHEEn126)
UPDATE users SET password_hash = '$2b$12$0BiF2tC64SQMhzaQhqOkI.PQs9kuoCWJjxxstI7ZkkNPMgHESCvjm' 
WHERE role = 'admin';


USE crime_investigation_db;
SELECT id, email, role, LEFT(password_hash, 20) as hash_preview, is_active FROM users;


SELECT u.id, u.email, u.role, u.is_active, o.full_name, o.badge_number
FROM users u 
JOIN officers o ON u.id = o.user_id
WHERE u.email = 'officer1@crimesystem.gov';

SELECT * FROM users WHERE email = 'officer1@crimesystem.gov';
SELECT * FROM officers;


SELECT * FROM officers;

INSERT INTO officers (user_id, full_name, badge_number, rank, department) VALUES
(10, 'Ali Hassan', 'OFF-001', 'Inspector', 'Homicide Division'),
(11, 'Usman Khan', 'OFF-002', 'Sub-Inspector', 'Cybercrime Unit');

INSERT INTO forensic_officers (user_id, full_name, lab_id, specialization) VALUES
(12, 'Dr. Sara Ahmed', 'LAB-001', 'Digital Forensics'),
(13, 'Dr. Bilal Malik', 'LAB-002', 'DNA Analysis');

INSERT INTO citizens (user_id, full_name, cnic, phone, address) VALUES
(14, 'Ahmed Khan', '42201-1234567-1', '0321-1234567', 'House 12, Street 4, Lahore'),
(15, 'Sara Malik', '42201-7654321-2', '0333-7654321', 'Flat 5, Block B, Karachi'),
(16, 'Bilal Ahmad', '42201-9999999-3', '0300-9999999', 'Plot 33, G-10, Islamabad');

SELECT u.id, u.email, o.full_name, o.badge_number 
FROM users u JOIN officers o ON u.id = o.user_id;


SELECT * FROM citizens;
SELECT * FROM forensic_officers;


USE crime_investigation_db;
SELECT u.id, u.email, u.role, c.full_name 
FROM users u JOIN citizens c ON u.id = c.user_id;

SELECT u.id, u.email, u.role, f.full_name 
FROM users u JOIN forensic_officers f ON u.id = f.user_id;

-- First check what applications exist
SELECT * FROM applications;

-- Insert test evidence for application 5
INSERT INTO evidence (application_id, uploaded_by, file_path, file_type, original_filename, description)
VALUES 
(5, 10, 'test-evidence-1.jpg', 'image/jpeg', 'crime_scene_photo.jpg', 'Crime scene photograph'),
(5, 10, 'test-report.pdf', 'application/pdf', 'initial_report.pdf', 'Initial incident report');

-- Check evidence was inserted
SELECT * FROM evidence;


-- Assign both evidence items to forensic officer 1 (id=4)
UPDATE evidence 
SET assigned_to_forensic = 4, assigned_at = GETDATE()
WHERE id IN (1, 2);

-- Create forensic report entries
INSERT INTO forensic_reports (evidence_id, forensic_officer_id, findings, status)
VALUES 
(1, 4, 'Pending analysis', 'pending'),
(2, 4, 'Pending analysis', 'pending');

SELECT u.id, u.email, u.role, o.full_name, o.badge_number, o.rank, o.department
FROM users u 
LEFT JOIN officers o ON u.id = o.user_id
WHERE u.role = 'officer'
ORDER BY u.id DESC;


-- Check all officers
SELECT u.id, u.email, u.role, o.full_name, o.badge_number, o.rank, o.department
FROM users u 
LEFT JOIN officers o ON u.id = o.user_id
WHERE u.role = 'officer'
ORDER BY u.id DESC;

-- Check all forensic
SELECT u.id, u.email, u.role, f.full_name, f.lab_id, f.specialization
FROM users u 
LEFT JOIN forensic_officers f ON u.id = f.user_id
WHERE u.role = 'forensic'
ORDER BY u.id DESC;

- --First delete from officers table
DELETE FROM officers WHERE user_id = 17;

-- Then delete the user
DELETE FROM users WHERE id = 17;

-- Find the null forensic records
USE crime_investigation_db;

-- Find users with forensic role but no forensic_officers record
SELECT u.id, u.email, u.role 
FROM users u 
LEFT JOIN forensic_officers f ON u.id = f.user_id
WHERE u.role = 'forensic' AND f.id S NULL;


SELECT * FROM users WHERE role = 'forensic';
SELECT * FROM forensic_officers;

-- Delete the null forensic officer record first
DELETE FROM forensic_officers WHERE user_id = 18;

-- Then delete the user
DELETE FROM users WHERE id = 18;