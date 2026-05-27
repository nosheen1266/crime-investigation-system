const { sql, poolPromise } = require('../config/db');
const bcrypt = require('bcryptjs');
const path = require('path');

// GET PROFILE
const getProfile = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .query(`SELECT u.id, u.email, u.created_at, c.full_name, c.cnic, c.phone, c.address, c.profile_pic
              FROM users u JOIN citizens c ON u.id = c.user_id
              WHERE u.id = @user_id`);
    if (result.recordset.length === 0)
      return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const { full_name, phone, address } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .input('full_name', sql.VarChar, full_name)
      .input('phone', sql.VarChar, phone)
      .input('address', sql.VarChar, address)
      .query(`UPDATE citizens SET full_name=@full_name, phone=@phone, address=@address WHERE user_id=@user_id`);
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// UPLOAD PROFILE PICTURE
const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const pool = await poolPromise;
    await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .input('profile_pic', sql.VarChar, req.file.filename)
      .query('UPDATE citizens SET profile_pic=@profile_pic WHERE user_id=@user_id');
    res.json({ success: true, message: 'Profile picture updated', filename: req.file.filename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// CHANGE PASSWORD
const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, req.user.id)
      .query('SELECT password_hash FROM users WHERE id=@id');
    const valid = await bcrypt.compare(current_password, result.recordset[0].password_hash);
    if (!valid) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    const hash = await bcrypt.hash(new_password, 12);
    await pool.request()
      .input('id', sql.Int, req.user.id)
      .input('hash', sql.VarChar, hash)
      .query('UPDATE users SET password_hash=@hash WHERE id=@id');
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET ALL APPLICATIONS
const getApplications = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const pool = await poolPromise;

    let query = `SELECT a.id, a.title, a.description, a.incident_date, a.incident_location,
                 a.status, a.created_at,
                 o.full_name as officer_name, o.badge_number
                 FROM applications a
                 LEFT JOIN case_assignments ca ON a.id = ca.application_id
                 LEFT JOIN officers o ON ca.officer_id = o.id
                 WHERE a.citizen_id = (SELECT id FROM citizens WHERE user_id = @user_id)`;

    if (status) query += ` AND a.status = @status`;
    if (search) query += ` AND (a.title LIKE @search OR CAST(a.id AS VARCHAR) LIKE @search)`;
    query += ` ORDER BY a.created_at DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    const request = pool.request()
      .input('user_id', sql.Int, req.user.id)
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, parseInt(limit));

    if (status) request.input('status', sql.VarChar, status);
    if (search) request.input('search', sql.VarChar, `%${search}%`);

    const result = await request.query(query);

    const countRequest = pool.request().input('user_id', sql.Int, req.user.id);
    let countQuery = `SELECT COUNT(*) as total FROM applications WHERE citizen_id = (SELECT id FROM citizens WHERE user_id = @user_id)`;
    if (status) { countQuery += ` AND status = @status`; countRequest.input('status', sql.VarChar, status); }
    const countResult = await countRequest.query(countQuery);

    res.json({ success: true, data: result.recordset, total: countResult.recordset[0].total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// CREATE APPLICATION
const createApplication = async (req, res) => {
  try {
    const { title, description, incident_date, incident_location } = req.body;
    const pool = await poolPromise;

    const citizenResult = await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .query('SELECT id FROM citizens WHERE user_id=@user_id');
    const citizen_id = citizenResult.recordset[0].id;

    const result = await pool.request()
      .input('citizen_id', sql.Int, citizen_id)
      .input('title', sql.VarChar, title)
      .input('description', sql.VarChar, description)
      .input('incident_date', sql.Date, incident_date)
      .input('incident_location', sql.VarChar, incident_location)
      .query(`INSERT INTO applications (citizen_id, title, description, incident_date, incident_location)
              OUTPUT INSERTED.id VALUES (@citizen_id, @title, @description, @incident_date, @incident_location)`);

    const appId = result.recordset[0].id;

    await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .input('title', sql.VarChar, 'Application Submitted')
      .input('message', sql.VarChar, `Your application #${appId} has been submitted successfully.`)
      .input('type', sql.VarChar, 'success')
      .input('app_id', sql.Int, appId)
      .query('INSERT INTO notifications (user_id, title, message, type, related_application_id) VALUES (@user_id, @title, @message, @type, @app_id)');

    await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .input('action', sql.VarChar, 'Application Created')
      .input('details', sql.VarChar, `Application #${appId}: ${title}`)
      .input('ip', sql.VarChar, req.ip)
      .query('INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (@user_id, @action, @details, @ip)');

    res.status(201).json({ success: true, message: 'Application submitted successfully', id: appId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET APPLICATION DETAIL
const getApplicationDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    const appResult = await pool.request()
      .input('id', sql.Int, id)
      .input('user_id', sql.Int, req.user.id)
      .query(`SELECT a.*, c.full_name as citizen_name, c.cnic, c.phone,
              o.full_name as officer_name, o.badge_number, o.rank, o.department,
              ca.assigned_at, ca.notes as assignment_notes
              FROM applications a
              JOIN citizens c ON a.citizen_id = c.id
              LEFT JOIN case_assignments ca ON a.id = ca.application_id
              LEFT JOIN officers o ON ca.officer_id = o.id
              WHERE a.id = @id AND c.user_id = @user_id`);

    if (appResult.recordset.length === 0)
      return res.status(404).json({ success: false, message: 'Application not found' });

    const evidenceResult = await pool.request()
      .input('app_id', sql.Int, id)
      .query('SELECT id, file_type, original_filename, description, uploaded_at FROM evidence WHERE application_id = @app_id');

    const forensicResult = await pool.request()
      .input('app_id', sql.Int, id)
      .query(`SELECT fr.findings, fr.conclusion, fr.status, fr.submitted_at, fo.full_name as forensic_name
              FROM forensic_reports fr
              JOIN evidence e ON fr.evidence_id = e.id
              JOIN forensic_officers fo ON fr.forensic_officer_id = fo.id
              WHERE e.application_id = @app_id AND fr.status = 'submitted'`);

    res.json({ success: true, data: appResult.recordset[0], evidence: evidenceResult.recordset, forensic_reports: forensicResult.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// UPLOAD FILES TO APPLICATION
const uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    const { id } = req.params;
    const { description } = req.body;
    const pool = await poolPromise;

    for (const file of req.files) {
      await pool.request()
        .input('app_id', sql.Int, id)
        .input('uploaded_by', sql.Int, req.user.id)
        .input('file_path', sql.VarChar, file.filename)
        .input('file_type', sql.VarChar, file.mimetype)
        .input('original_filename', sql.VarChar, file.originalname)
        .input('description', sql.VarChar, description || '')
        .query(`INSERT INTO evidence (application_id, uploaded_by, file_path, file_type, original_filename, description)
                VALUES (@app_id, @uploaded_by, @file_path, @file_type, @original_filename, @description)`);
    }
    res.json({ success: true, message: `${req.files.length} file(s) uploaded successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET NOTIFICATIONS
const getNotifications = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .query('SELECT TOP 20 * FROM notifications WHERE user_id=@user_id ORDER BY created_at DESC');
    const unread = await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .query('SELECT COUNT(*) as count FROM notifications WHERE user_id=@user_id AND is_read=0');
    res.json({ success: true, data: result.recordset, unread_count: unread.recordset[0].count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// MARK NOTIFICATION READ
const markNotificationRead = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('user_id', sql.Int, req.user.id)
      .query('UPDATE notifications SET is_read=1 WHERE id=@id AND user_id=@user_id');
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// MARK ALL READ
const markAllRead = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .query('UPDATE notifications SET is_read=1 WHERE user_id=@user_id');
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DASHBOARD STATS
const getDashboardStats = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .query(`SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status IN ('assigned','investigating','pending_forensic') THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status='closed' THEN 1 ELSE 0 END) as closed
        FROM applications WHERE citizen_id=(SELECT id FROM citizens WHERE user_id=@user_id)`);
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile, uploadProfilePic, changePassword, getApplications, createApplication, getApplicationDetail, uploadFiles, getNotifications, markNotificationRead, markAllRead, getDashboardStats };