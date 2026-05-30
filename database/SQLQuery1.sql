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


-- TRIGGERS AND PROCEDUERS FUNCTIONS 
USE crime_investigation_db;


-- =============================================
-- FUNCTIONS
-- =============================================

-- 1. fn_IsValidCNIC: Validates Pakistani CNIC format (13 digits)
CREATE OR ALTER FUNCTION fn_IsValidCNIC (@cnic VARCHAR(20))
RETURNS BIT
AS
BEGIN
    DECLARE @result BIT = 0;
    IF @cnic NOT LIKE '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
        SET @result = 0;
    ELSE
        SET @result = 1;
    RETURN @result;
END;


-- 2. fn_GetOfficerCaseLoad: Returns number of active cases assigned to an officer
CREATE OR ALTER FUNCTION fn_GetOfficerCaseLoad (@officer_id INT)
RETURNS INT
AS
BEGIN
    DECLARE @count INT;
    SELECT @count = COUNT(*)
    FROM case_assignments ca
    JOIN applications a ON ca.application_id = a.id
    WHERE ca.officer_id = @officer_id
    AND a.status NOT IN ('closed', 'rejected');
    RETURN ISNULL(@count, 0);
END;


-- 3. fn_GetUnreadNotificationCount: Returns unread notification count for a user
CREATE OR ALTER FUNCTION fn_GetUnreadNotificationCount (@user_id INT)
RETURNS INT
AS
BEGIN
    DECLARE @count INT;
    SELECT @count = COUNT(*)
    FROM notifications
    WHERE user_id = @user_id AND is_read = 0;
    RETURN ISNULL(@count, 0);
END;


-- 4. fn_GetCaseCountByStatus: Returns number of cases by a given status
CREATE OR ALTER FUNCTION fn_GetCaseCountByStatus (@status VARCHAR(50))
RETURNS INT
AS
BEGIN
    DECLARE @count INT;
    SELECT @count = COUNT(*)
    FROM applications
    WHERE status = @status;
    RETURN ISNULL(@count, 0);
END;


-- =============================================
-- STORED PROCEDURES
-- =============================================

-- 1. sp_RegisterCitizen: Registers a new citizen with user account
CREATE OR ALTER PROCEDURE sp_RegisterCitizen
    @email VARCHAR(255),
    @password_hash VARCHAR(255),
    @full_name VARCHAR(255),
    @cnic VARCHAR(20),
    @phone VARCHAR(20),
    @address TEXT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validate CNIC format
        IF dbo.fn_IsValidCNIC(@cnic) = 0
        BEGIN
            RAISERROR('Invalid CNIC format. Must be 13 digits.', 16, 1);
            RETURN;
        END

        -- Check if email already exists
        IF EXISTS (SELECT 1 FROM users WHERE email = @email)
        BEGIN
            RAISERROR('Email already registered.', 16, 1);
            RETURN;
        END

        -- Check if CNIC already exists
        IF EXISTS (SELECT 1 FROM citizens WHERE cnic = @cnic)
        BEGIN
            RAISERROR('CNIC already registered.', 16, 1);
            RETURN;
        END

        -- Insert into users table
        DECLARE @user_id INT;
        INSERT INTO users (email, password_hash, role)
        VALUES (@email, @password_hash, 'citizen');
        SET @user_id = SCOPE_IDENTITY();

        -- Insert into citizens table
        INSERT INTO citizens (user_id, full_name, cnic, phone, address)
        VALUES (@user_id, @full_name, @cnic, @phone, @address);

        -- Send welcome notification
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (@user_id, 'Welcome!', 'Your account has been created successfully.', 'success');

        COMMIT TRANSACTION;
        SELECT 'Citizen registered successfully.' AS message, @user_id AS user_id;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;

-- 2. sp_AssignCaseToOfficer: Assigns a case to an officer and notifies them
CREATE OR ALTER PROCEDURE sp_AssignCaseToOfficer
    @application_id INT,
    @officer_id INT,
    @assigned_by INT,
    @notes TEXT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Check if application exists
        IF NOT EXISTS (SELECT 1 FROM applications WHERE id = @application_id)
        BEGIN
            RAISERROR('Application not found.', 16, 1);
            RETURN;
        END

        -- Check if officer exists
        IF NOT EXISTS (SELECT 1 FROM officers WHERE id = @officer_id)
        BEGIN
            RAISERROR('Officer not found.', 16, 1);
            RETURN;
        END

        -- Check officer case load (max 10 active cases)
        IF dbo.fn_GetOfficerCaseLoad(@officer_id) >= 10
        BEGIN
            RAISERROR('Officer already has maximum case load (10 active cases).', 16, 1);
            RETURN;
        END

        -- Insert case assignment
        INSERT INTO case_assignments (application_id, officer_id, assigned_by, notes)
        VALUES (@application_id, @officer_id, @assigned_by, @notes);

        -- Update application status to under_investigation
        UPDATE applications SET status = 'under_investigation', updated_at = GETDATE()
        WHERE id = @application_id;

        COMMIT TRANSACTION;
        SELECT 'Case assigned successfully.' AS message;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;

-- 3. sp_FileFIR: Files a FIR for an application
CREATE OR ALTER PROCEDURE sp_FileFIR
    @application_id INT,
    @fir_number VARCHAR(100),
    @details TEXT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Check if application exists
        IF NOT EXISTS (SELECT 1 FROM applications WHERE id = @application_id)
        BEGIN
            RAISERROR('Application not found.', 16, 1);
            RETURN;
        END

        -- Check if FIR already filed for this application
        IF EXISTS (SELECT 1 FROM fir_reports WHERE application_id = @application_id)
        BEGIN
            RAISERROR('FIR already filed for this application.', 16, 1);
            RETURN;
        END

        -- Check if FIR number already exists
        IF EXISTS (SELECT 1 FROM fir_reports WHERE fir_number = @fir_number)
        BEGIN
            RAISERROR('FIR number already exists.', 16, 1);
            RETURN;
        END

        -- Insert FIR
        INSERT INTO fir_reports (application_id, fir_number, details)
        VALUES (@application_id, @fir_number, @details);

        -- Update application status
        UPDATE applications SET status = 'fir_filed', updated_at = GETDATE()
        WHERE id = @application_id;

        -- Get citizen user_id for notification
        DECLARE @citizen_user_id INT;
        SELECT @citizen_user_id = u.id
        FROM applications a
        JOIN citizens c ON a.citizen_id = c.id
        JOIN users u ON c.user_id = u.id
        WHERE a.id = @application_id;

        -- Notify citizen
        INSERT INTO notifications (user_id, title, message, type, related_application_id)
        VALUES (@citizen_user_id, 'FIR Filed', 'A FIR has been filed for your case. FIR Number: ' + @fir_number, 'info', @application_id);

        COMMIT TRANSACTION;
        SELECT 'FIR filed successfully.' AS message;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;

-- 4. sp_GetCaseFullDetails: Gets complete details of a case
CREATE OR ALTER PROCEDURE sp_GetCaseFullDetails
    @application_id INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Application info
    SELECT a.id, a.title, a.description, a.incident_date, a.incident_location,
           a.status, a.created_at, c.full_name AS citizen_name, c.cnic, c.phone
    FROM applications a
    JOIN citizens c ON a.citizen_id = c.id
    WHERE a.id = @application_id;

    -- Assigned officers
    SELECT o.full_name AS officer_name, o.badge_number, o.rank, o.department,
           ca.assigned_at, ca.notes
    FROM case_assignments ca
    JOIN officers o ON ca.officer_id = o.id
    WHERE ca.application_id = @application_id;

    -- FIR details
    SELECT fir_number, details, filed_at
    FROM fir_reports
    WHERE application_id = @application_id;

    -- Evidence
    SELECT e.id, e.original_filename, e.file_type, e.description, e.uploaded_at,
           fo.full_name AS forensic_officer_name
    FROM evidence e
    LEFT JOIN forensic_officers fo ON e.assigned_to_forensic = fo.id
    WHERE e.application_id = @application_id;

    -- Suspects
    SELECT full_name, description, address, relationship_to_case, created_at
    FROM suspects
    WHERE application_id = @application_id;

    -- Witnesses
    SELECT full_name, contact, statement, created_at
    FROM witnesses
    WHERE application_id = @application_id;
END;

-- 5. sp_GetAdminDashboardStats: Returns all stats for admin dashboard
CREATE OR ALTER PROCEDURE sp_GetAdminDashboardStats
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        (SELECT COUNT(*) FROM applications) AS total_cases,
        (SELECT COUNT(*) FROM applications WHERE status = 'pending') AS pending_cases,
        (SELECT COUNT(*) FROM applications WHERE status = 'under_investigation') AS active_cases,
        (SELECT COUNT(*) FROM applications WHERE status = 'closed') AS closed_cases,
        (SELECT COUNT(*) FROM users WHERE role = 'citizen') AS total_citizens,
        (SELECT COUNT(*) FROM users WHERE role = 'officer') AS total_officers,
        (SELECT COUNT(*) FROM users WHERE role = 'forensic') AS total_forensic,
        (SELECT COUNT(*) FROM evidence) AS total_evidence,
        (SELECT COUNT(*) FROM fir_reports) AS total_firs,
        (SELECT COUNT(*) FROM forensic_reports) AS total_forensic_reports;
END;


-- =============================================
-- TRIGGERS
-- =============================================

-- 1. trg_LogUserLogin: Logs activity whenever last_login is updated
CREATE OR ALTER TRIGGER trg_LogUserLogin
ON users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(last_login)
    BEGIN
        INSERT INTO activity_logs (user_id, action, details, created_at)
        SELECT i.id, 'USER_LOGIN', 'User logged in successfully. Role: ' + i.role, GETDATE()
        FROM inserted i
        WHERE i.last_login IS NOT NULL;
    END
END;
GO

-- 2. trg_NotifyOnCaseAssignment: Auto notifies officer when a case is assigned
CREATE OR ALTER TRIGGER trg_NotifyOnCaseAssignment
ON case_assignments
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Notify the officer
    INSERT INTO notifications (user_id, title, message, type, related_application_id)
    SELECT o.user_id,
           'New Case Assigned',
           'A new case has been assigned to you. Case ID: ' + CAST(i.application_id AS VARCHAR),
           'info',
           i.application_id
    FROM inserted i
    JOIN officers o ON i.officer_id = o.id;

    -- Log the assignment activity
    INSERT INTO activity_logs (user_id, action, details, created_at)
    SELECT i.assigned_by,
           'CASE_ASSIGNED',
           'Case ID ' + CAST(i.application_id AS VARCHAR) + ' assigned to Officer ID ' + CAST(i.officer_id AS VARCHAR),
           GETDATE()
    FROM inserted i;
END;
GO

-- 3. trg_NotifyOnApplicationStatusChange: Notifies citizen when their case status changes
CREATE OR ALTER TRIGGER trg_NotifyOnApplicationStatusChange
ON applications
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(status)
    BEGIN
        INSERT INTO notifications (user_id, title, message, type, related_application_id)
        SELECT u.id,
               'Case Status Updated',
               'Your case "' + i.title + '" status has been updated to: ' + i.status,
               'info',
               i.id
        FROM inserted i
        JOIN deleted d ON i.id = d.id
        JOIN citizens c ON i.citizen_id = c.id
        JOIN users u ON c.user_id = u.id
        WHERE i.status <> d.status;

        -- Log the status change
        INSERT INTO activity_logs (user_id, action, details, created_at)
        SELECT u.id,
               'STATUS_CHANGED',
               'Case ID ' + CAST(i.id AS VARCHAR) + ' status changed from ' + d.status + ' to ' + i.status,
               GETDATE()
        FROM inserted i
        JOIN deleted d ON i.id = d.id
        JOIN citizens c ON i.citizen_id = c.id
        JOIN users u ON c.user_id = u.id
        WHERE i.status <> d.status;
    END
END;

-- 4. trg_LogEvidenceUpload: Logs when new evidence is uploaded
CREATE OR ALTER TRIGGER trg_LogEvidenceUpload
ON evidence
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO activity_logs (user_id, action, details, created_at)
    SELECT i.uploaded_by,
           'EVIDENCE_UPLOADED',
           'Evidence "' + i.original_filename + '" uploaded for Case ID: ' + CAST(i.application_id AS VARCHAR),
           GETDATE()
    FROM inserted i;
END;

-- 5. trg_NotifyOnForensicReportSubmit: Notifies officer when forensic report is submitted
CREATE OR ALTER TRIGGER trg_NotifyOnForensicReportSubmit
ON forensic_reports
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Notify the officer assigned to the case
    INSERT INTO notifications (user_id, title, message, type, related_application_id)
    SELECT DISTINCT u.id,
           'Forensic Report Submitted',
           'A forensic report has been submitted for evidence in your case.',
           'success',
           e.application_id
    FROM inserted i
    JOIN evidence e ON i.evidence_id = e.id
    JOIN case_assignments ca ON e.application_id = ca.application_id
    JOIN officers o ON ca.officer_id = o.id
    JOIN users u ON o.user_id = u.id;

    -- Log the forensic report submission
    INSERT INTO activity_logs (user_id, action, details, created_at)
    SELECT fo.user_id,
           'FORENSIC_REPORT_SUBMITTED',
           'Forensic report submitted for Evidence ID: ' + CAST(i.evidence_id AS VARCHAR),
           GETDATE()
    FROM inserted i
    JOIN forensic_officers fo ON i.forensic_officer_id = fo.id;
END;


-- =============================================
-- TEST THE FUNCTIONS
-- =============================================
SELECT dbo.fn_GetCaseCountByStatus('pending') AS pending_cases;
SELECT dbo.fn_GetUnreadNotificationCount(1) AS unread_notifications;
EXEC sp_GetAdminDashboardStats;