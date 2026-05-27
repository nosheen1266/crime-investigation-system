const { sql, poolPromise } = require('../config/db');
const bcrypt = require('bcryptjs');

const getProfile = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .query(`SELECT u.email, u.last_login, o.full_name, o.badge_number, o.rank, o.department
              FROM users u JOIN officers o ON u.id = o.user_id WHERE u.id = @user_id`);
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const pool = await poolPromise;
    const result = await pool.request().input('id', sql.Int, req.user.id).query('SELECT password_hash FROM users WHERE id=@id');
    const valid = await bcrypt.compare(current_password, result.recordset[0].password_hash);
    if (!valid) return res.status(400).json({ success: false, message: 'Current password incorrect' });
    const hash = await bcrypt.hash(new_password, 12);
    await pool.request().input('id', sql.Int, req.user.id).input('hash', sql.VarChar, hash).query('UPDATE users SET password_hash=@hash WHERE id=@id');
    res.json({ success: true, message: 'Password changed' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const getCases = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const pool = await poolPromise;

    const officerResult = await pool.request().input('user_id', sql.Int, req.user.id).query('SELECT id FROM officers WHERE user_id=@user_id');
    const officer_id = officerResult.recordset[0].id;

    let query = `SELECT a.id, a.title, a.status, a.incident_date, a.created_at, ca.assigned_at,
                 c.full_name as citizen_name FROM applications a
                 JOIN case_assignments ca ON a.id = ca.application_id
                 JOIN citizens c ON a.citizen_id = c.id
                 WHERE ca.officer_id = @officer_id`;
    if (status) query += ` AND a.status = @status`;
    if (search) query += ` AND (a.title LIKE @search OR c.full_name LIKE @search)`;
    query += ` ORDER BY ca.assigned_at DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    const request = pool.request().input('officer_id', sql.Int, officer_id).input('offset', sql.Int, offset).input('limit', sql.Int, parseInt(limit));
    if (status) request.input('status', sql.VarChar, status);
    if (search) request.input('search', sql.VarChar, `%${search}%`);

    const result = await request.query(query);
    res.json({ success: true, data: result.recordset });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const getCaseDetail = async (req, res) => {
  try {
    const pool = await poolPromise;
    const officerResult = await pool.request().input('user_id', sql.Int, req.user.id).query('SELECT id FROM officers WHERE user_id=@user_id');
    const officer_id = officerResult.recordset[0].id;

    const result = await pool.request().input('id', sql.Int, req.params.id).input('officer_id', sql.Int, officer_id)
      .query(`SELECT a.*, c.full_name as citizen_name, c.cnic, c.phone, c.address
              FROM applications a JOIN citizens c ON a.citizen_id = c.id
              JOIN case_assignments ca ON a.id = ca.application_id
              WHERE a.id = @id AND ca.officer_id = @officer_id`);

    if (!result.recordset.length) return res.status(404).json({ success: false, message: 'Case not found' });
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const updateCaseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const pool = await poolPromise;
    await pool.request().input('id', sql.Int, req.params.id).input('status', sql.VarChar, status)
      .query('UPDATE applications SET status=@status, updated_at=GETDATE() WHERE id=@id');

    const citizenResult = await pool.request().input('id', sql.Int, req.params.id)
      .query('SELECT u.id as user_id FROM applications a JOIN citizens c ON a.citizen_id=c.id JOIN users u ON c.user_id=u.id WHERE a.id=@id');

    if (citizenResult.recordset.length) {
      await pool.request().input('uid', sql.Int, citizenResult.recordset[0].user_id)
        .input('title', sql.VarChar, 'Case Status Updated')
        .input('msg', sql.VarChar, `Your case #${req.params.id} status changed to: ${status}`)
        .input('app_id', sql.Int, parseInt(req.params.id))
        .query('INSERT INTO notifications (user_id,title,message,type,related_application_id) VALUES (@uid,@title,@msg,\'info\',@app_id)');
    }
    res.json({ success: true, message: 'Status updated' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const addSuspect = async (req, res) => {
  try {
    const { full_name, description, address, relationship_to_case } = req.body;
    const pool = await poolPromise;
    const o = await pool.request().input('uid', sql.Int, req.user.id).query('SELECT id FROM officers WHERE user_id=@uid');
    await pool.request().input('app_id', sql.Int, req.params.id).input('officer_id', sql.Int, o.recordset[0].id)
      .input('full_name', sql.VarChar, full_name).input('description', sql.VarChar, description)
      .input('address', sql.VarChar, address).input('rel', sql.VarChar, relationship_to_case)
      .query('INSERT INTO suspects (application_id,added_by_officer,full_name,description,address,relationship_to_case) VALUES (@app_id,@officer_id,@full_name,@description,@address,@rel)');
    res.json({ success: true, message: 'Suspect added' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const getSuspects = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().input('id', sql.Int, req.params.id)
      .query('SELECT * FROM suspects WHERE application_id=@id ORDER BY created_at DESC');
    res.json({ success: true, data: result.recordset });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const addWitness = async (req, res) => {
  try {
    const { full_name, contact, statement } = req.body;
    const pool = await poolPromise;
    const o = await pool.request().input('uid', sql.Int, req.user.id).query('SELECT id FROM officers WHERE user_id=@uid');
    await pool.request().input('app_id', sql.Int, req.params.id).input('officer_id', sql.Int, o.recordset[0].id)
      .input('full_name', sql.VarChar, full_name).input('contact', sql.VarChar, contact).input('statement', sql.VarChar, statement)
      .query('INSERT INTO witnesses (application_id,added_by_officer,full_name,contact,statement) VALUES (@app_id,@officer_id,@full_name,@contact,@statement)');
    res.json({ success: true, message: 'Witness added' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const getWitnesses = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().input('id', sql.Int, req.params.id).query('SELECT * FROM witnesses WHERE application_id=@id ORDER BY created_at DESC');
    res.json({ success: true, data: result.recordset });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const uploadEvidence = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const pool = await poolPromise;
    await pool.request().input('app_id', sql.Int, req.params.id).input('uploaded_by', sql.Int, req.user.id)
      .input('file_path', sql.VarChar, req.file.filename).input('file_type', sql.VarChar, req.file.mimetype)
      .input('original_filename', sql.VarChar, req.file.originalname).input('description', sql.VarChar, req.body.description || '')
      .query('INSERT INTO evidence (application_id,uploaded_by,file_path,file_type,original_filename,description) VALUES (@app_id,@uploaded_by,@file_path,@file_type,@original_filename,@description)');
    res.json({ success: true, message: 'Evidence uploaded' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const getEvidence = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().input('id', sql.Int, req.params.id)
      .query('SELECT * FROM evidence WHERE application_id=@id ORDER BY uploaded_at DESC');
    res.json({ success: true, data: result.recordset });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const getForensicReports = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().input('id', sql.Int, req.params.id)
      .query(`SELECT fr.*, fo.full_name as forensic_name, e.original_filename
              FROM forensic_reports fr JOIN evidence e ON fr.evidence_id=e.id
              JOIN forensic_officers fo ON fr.forensic_officer_id=fo.id
              WHERE e.application_id=@id ORDER BY fr.created_at DESC`);
    res.json({ success: true, data: result.recordset });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const getNotifications = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().input('uid', sql.Int, req.user.id)
      .query('SELECT TOP 20 * FROM notifications WHERE user_id=@uid ORDER BY created_at DESC');
    const unread = await pool.request().input('uid', sql.Int, req.user.id)
      .query('SELECT COUNT(*) as count FROM notifications WHERE user_id=@uid AND is_read=0');
    res.json({ success: true, data: result.recordset, unread_count: unread.recordset[0].count });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const markNotificationRead = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request().input('id', sql.Int, req.params.id).input('uid', sql.Int, req.user.id)
      .query('UPDATE notifications SET is_read=1 WHERE id=@id AND user_id=@uid');
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const getDashboardStats = async (req, res) => {
  try {
    const pool = await poolPromise;
    const o = await pool.request().input('uid', sql.Int, req.user.id).query('SELECT id FROM officers WHERE user_id=@uid');
    const result = await pool.request().input('oid', sql.Int, o.recordset[0].id)
      .query(`SELECT COUNT(*) as total,
              SUM(CASE WHEN a.status='investigating' THEN 1 ELSE 0 END) as active,
              SUM(CASE WHEN a.status='pending_forensic' THEN 1 ELSE 0 END) as pending_forensic,
              SUM(CASE WHEN a.status='closed' THEN 1 ELSE 0 END) as closed
              FROM applications a JOIN case_assignments ca ON a.id=ca.application_id WHERE ca.officer_id=@oid`);
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

module.exports = { getProfile, changePassword, getCases, getCaseDetail, updateCaseStatus, addSuspect, getSuspects, addWitness, getWitnesses, uploadEvidence, getEvidence, getForensicReports, getNotifications, markNotificationRead, getDashboardStats };