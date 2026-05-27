const { sql, poolPromise } = require('../config/db');
const bcrypt = require('bcryptjs');

const getProfile = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().input('uid', sql.Int, req.user.id)
      .query(`SELECT u.email, u.last_login, f.full_name, f.lab_id, f.specialization
              FROM users u JOIN forensic_officers f ON u.id=f.user_id WHERE u.id=@uid`);
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

const getEvidence = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const pool = await poolPromise;
    const f = await pool.request().input('uid', sql.Int, req.user.id).query('SELECT id FROM forensic_officers WHERE user_id=@uid');
    const fid = f.recordset[0].id;

    let query = `SELECT e.id, e.original_filename, e.file_type, e.description, e.uploaded_at,
                 e.assigned_at, fr.status, a.id as case_id, a.title as case_title
                 FROM evidence e JOIN applications a ON e.application_id=a.id
                 LEFT JOIN forensic_reports fr ON e.id=fr.evidence_id
                 WHERE e.assigned_to_forensic=@fid`;
    if (status) query += ` AND fr.status=@status`;
    if (search) query += ` AND (e.original_filename LIKE @search OR a.title LIKE @search)`;
    query += ` ORDER BY e.assigned_at DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    const req2 = pool.request().input('fid', sql.Int, fid).input('offset', sql.Int, offset).input('limit', sql.Int, parseInt(limit));
    if (status) req2.input('status', sql.VarChar, status);
    if (search) req2.input('search', sql.VarChar, `%${search}%`);
    const result = await req2.query(query);
    res.json({ success: true, data: result.recordset });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const getEvidenceDetail = async (req, res) => {
  try {
    const pool = await poolPromise;
    const f = await pool.request().input('uid', sql.Int, req.user.id).query('SELECT id FROM forensic_officers WHERE user_id=@uid');
    const result = await pool.request().input('id', sql.Int, req.params.id).input('fid', sql.Int, f.recordset[0].id)
      .query(`SELECT e.*, a.id as case_id, a.title as case_title, fr.id as report_id, fr.status as report_status, fr.findings, fr.conclusion
              FROM evidence e JOIN applications a ON e.application_id=a.id
              LEFT JOIN forensic_reports fr ON e.id=fr.evidence_id
              WHERE e.id=@id AND e.assigned_to_forensic=@fid`);
    if (!result.recordset.length) return res.status(404).json({ success: false, message: 'Evidence not found' });
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const updateEvidenceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const pool = await poolPromise;
    await pool.request().input('id', sql.Int, req.params.id).input('status', sql.VarChar, status)
      .query(`UPDATE forensic_reports SET status=@status ${status === 'submitted' ? ', submitted_at=GETDATE()' : ''} WHERE evidence_id=@id`);
    res.json({ success: true, message: 'Status updated' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const addFinding = async (req, res) => {
  try {
    const { finding_type, description, conclusion } = req.body;
    const pool = await poolPromise;
    const reportResult = await pool.request().input('eid', sql.Int, req.params.id)
      .query('SELECT id FROM forensic_reports WHERE evidence_id=@eid');
    if (!reportResult.recordset.length) return res.status(404).json({ success: false, message: 'Report not found' });
    await pool.request().input('rid', sql.Int, reportResult.recordset[0].id)
      .input('finding_type', sql.VarChar, finding_type).input('description', sql.VarChar, description).input('conclusion', sql.VarChar, conclusion)
      .query('INSERT INTO lab_findings (forensic_report_id,finding_type,description,conclusion) VALUES (@rid,@finding_type,@description,@conclusion)');
    res.json({ success: true, message: 'Finding added' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const getFindings = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().input('eid', sql.Int, req.params.id)
      .query(`SELECT lf.* FROM lab_findings lf JOIN forensic_reports fr ON lf.forensic_report_id=fr.id WHERE fr.evidence_id=@eid ORDER BY lf.created_at DESC`);
    res.json({ success: true, data: result.recordset });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const submitReport = async (req, res) => {
  try {
    const { findings, conclusion } = req.body;
    const pool = await poolPromise;
    const f = await pool.request().input('uid', sql.Int, req.user.id).query('SELECT id FROM forensic_officers WHERE user_id=@uid');
    const report_file = req.file ? req.file.filename : null;

    await pool.request().input('eid', sql.Int, req.params.id).input('findings', sql.VarChar, findings)
      .input('conclusion', sql.VarChar, conclusion).input('file', sql.VarChar, report_file)
      .query(`UPDATE forensic_reports SET findings=@findings, conclusion=@conclusion, report_file_path=@file, status='submitted', submitted_at=GETDATE() WHERE evidence_id=@eid`);

    // notify officer
    const officerResult = await pool.request().input('eid', sql.Int, req.params.id)
      .query(`SELECT u.id as uid FROM evidence e JOIN case_assignments ca ON e.application_id=ca.application_id
              JOIN officers o ON ca.officer_id=o.id JOIN users u ON o.user_id=u.id WHERE e.id=@eid`);
    if (officerResult.recordset.length) {
      await pool.request().input('uid', sql.Int, officerResult.recordset[0].uid)
        .input('title', sql.VarChar, 'Forensic Report Ready')
        .input('msg', sql.VarChar, `A forensic report has been submitted for evidence #${req.params.id}`)
        .query('INSERT INTO notifications (user_id,title,message,type) VALUES (@uid,@title,@msg,\'success\')');
    }
    res.json({ success: true, message: 'Report submitted successfully' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const getReports = async (req, res) => {
  try {
    const pool = await poolPromise;
    const f = await pool.request().input('uid', sql.Int, req.user.id).query('SELECT id FROM forensic_officers WHERE user_id=@uid');
    const result = await pool.request().input('fid', sql.Int, f.recordset[0].id)
      .query(`SELECT fr.*, e.original_filename, a.title as case_title
              FROM forensic_reports fr JOIN evidence e ON fr.evidence_id=e.id JOIN applications a ON e.application_id=a.id
              WHERE fr.forensic_officer_id=@fid ORDER BY fr.created_at DESC`);
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
    const f = await pool.request().input('uid', sql.Int, req.user.id).query('SELECT id FROM forensic_officers WHERE user_id=@uid');
    const result = await pool.request().input('fid', sql.Int, f.recordset[0].id)
      .query(`SELECT
              SUM(CASE WHEN fr.status='pending' THEN 1 ELSE 0 END) as pending,
              SUM(CASE WHEN fr.status='in_analysis' THEN 1 ELSE 0 END) as in_analysis,
              SUM(CASE WHEN fr.status='submitted' THEN 1 ELSE 0 END) as submitted
              FROM forensic_reports fr WHERE fr.forensic_officer_id=@fid`);
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

module.exports = { getProfile, changePassword, getEvidence, getEvidenceDetail, updateEvidenceStatus, addFinding, getFindings, submitReport, getReports, getNotifications, markNotificationRead, getDashboardStats };