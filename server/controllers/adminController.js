const { sql, poolPromise } = require('../config/db');
const bcrypt = require('bcryptjs');

const getDashboardStats = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM applications) as total,
        (SELECT COUNT(*) FROM applications WHERE status='pending') as pending,
        (SELECT COUNT(*) FROM applications WHERE status IN ('assigned','investigating','pending_forensic')) as active,
        (SELECT COUNT(*) FROM applications WHERE status='closed') as closed,
        (SELECT COUNT(*) FROM officers) as total_officers,
        (SELECT COUNT(*) FROM evidence WHERE assigned_to_forensic IS NULL) as unassigned_evidence`);
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const getCharts = async (req, res) => {
  try {
    const pool = await poolPromise;
    const monthly = await pool.request().query(`
      SELECT FORMAT(created_at,'yyyy-MM') as month, COUNT(*) as count
      FROM applications WHERE created_at >= DATEADD(MONTH,-6,GETDATE())
      GROUP BY FORMAT(created_at,'yyyy-MM') ORDER BY month`);
    const statusDist = await pool.request().query(`
      SELECT status, COUNT(*) as count FROM applications GROUP BY status`);
    res.json({ success: true, monthly: monthly.recordset, status_distribution: statusDist.recordset });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const getAllApplications = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const pool = await poolPromise;

    let query = `SELECT a.id, a.title, a.status, a.created_at, a.incident_date,
                 c.full_name as citizen_name, c.cnic, o.full_name as officer_name
                 FROM applications a JOIN citizens c ON a.citizen_id=c.id
                 LEFT JOIN case_assignments ca ON a.id=ca.application_id
                 LEFT JOIN officers o ON ca.officer_id=o.id WHERE 1=1`;
    if (status) query += ` AND a.status=@status`;
    if (search) query += ` AND (c.full_name LIKE @search OR c.cnic LIKE @search OR CAST(a.id AS VARCHAR) LIKE @search)`;
    query += ` ORDER BY a.created_at DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    const req2 = pool.request().input('offset', sql.Int, offset).input('limit', sql.Int, parseInt(limit));
    if (status) req2.input('status', sql.VarChar, status);
    if (search) req2.input('search', sql.VarChar, `%${search}%`);
    const result = await req2.query(query);
    res.json({ success: true, data: result.recordset });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const getApplicationDetail = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().input('id', sql.Int, req.params.id)
      .query(`SELECT a.*, c.full_name as citizen_name, c.cnic, c.phone, c.address,
              o.full_name as officer_name, o.badge_number, ca.assigned_at
              FROM applications a JOIN citizens c ON a.citizen_id=c.id
              LEFT JOIN case_assignments ca ON a.id=ca.application_id
              LEFT JOIN officers o ON ca.officer_id=o.id WHERE a.id=@id`);
    if (!result.recordset.length) return res.status(404).json({ success: false, message: 'Not found' });

    const evidence = await pool.request().input('id', sql.Int, req.params.id)
      .query(`SELECT e.*, fo.full_name as forensic_name FROM evidence e
              LEFT JOIN forensic_officers fo ON e.assigned_to_forensic=fo.id
              WHERE e.application_id=@id`);
    res.json({ success: true, data: result.recordset[0], evidence: evidence.recordset });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const assignOfficer = async (req, res) => {
  try {
    const { officer_id, notes } = req.body;
    const pool = await poolPromise;

    await pool.request().input('app_id', sql.Int, req.params.id).input('officer_id', sql.Int, officer_id)
      .input('assigned_by', sql.Int, req.user.id).input('notes', sql.VarChar, notes || '')
      .query('INSERT INTO case_assignments (application_id,officer_id,assigned_by,notes) VALUES (@app_id,@officer_id,@assigned_by,@notes)');

    await pool.request().input('id', sql.Int, req.params.id)
      .query(`UPDATE applications SET status='assigned', updated_at=GETDATE() WHERE id=@id`);

    const officerUser = await pool.request().input('oid', sql.Int, officer_id)
      .query('SELECT u.id FROM officers o JOIN users u ON o.user_id=u.id WHERE o.id=@oid');

    await pool.request().input('uid', sql.Int, officerUser.recordset[0].id)
      .input('title', sql.VarChar, 'New Case Assigned')
      .input('msg', sql.VarChar, `Case #${req.params.id} has been assigned to you.`)
      .input('app_id', sql.Int, parseInt(req.params.id))
      .query('INSERT INTO notifications (user_id,title,message,type,related_application_id) VALUES (@uid,@title,@msg,\'info\',@app_id)');

    await pool.request().input('uid', sql.Int, req.user.id)
      .input('action', sql.VarChar, 'Case Assigned')
      .input('details', sql.VarChar, `Case #${req.params.id} assigned to officer #${officer_id}`)
      .input('ip', sql.VarChar, req.ip)
      .query('INSERT INTO activity_logs (user_id,action,details,ip_address) VALUES (@uid,@action,@details,@ip)');

    res.json({ success: true, message: 'Officer assigned successfully' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const assignForensic = async (req, res) => {
  try {
    const { forensic_officer_id } = req.body;
    const pool = await poolPromise;

    await pool.request().input('eid', sql.Int, req.params.id).input('fid', sql.Int, forensic_officer_id)
      .query('UPDATE evidence SET assigned_to_forensic=@fid, assigned_at=GETDATE() WHERE id=@eid');

    const existing = await pool.request().input('eid', sql.Int, req.params.id)
      .query('SELECT id FROM forensic_reports WHERE evidence_id=@eid');
    if (!existing.recordset.length) {
      await pool.request().input('eid', sql.Int, req.params.id).input('fid', sql.Int, forensic_officer_id)
        .query(`INSERT INTO forensic_reports (evidence_id,forensic_officer_id,findings) VALUES (@eid,@fid,'Pending analysis')`);
    }

    const forensicUser = await pool.request().input('fid', sql.Int, forensic_officer_id)
      .query('SELECT u.id FROM forensic_officers f JOIN users u ON f.user_id=u.id WHERE f.id=@fid');

    await pool.request().input('uid', sql.Int, forensicUser.recordset[0].id)
      .input('title', sql.VarChar, 'Evidence Assigned')
      .input('msg', sql.VarChar, `Evidence #${req.params.id} has been assigned to you for analysis.`)
      .query('INSERT INTO notifications (user_id,title,message,type) VALUES (@uid,@title,@msg,\'info\')');

    res.json({ success: true, message: 'Forensic officer assigned' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const getCitizens = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`SELECT u.id, u.email, u.is_active, u.created_at, c.full_name, c.cnic, c.phone
              FROM users u JOIN citizens c ON u.id=c.user_id ORDER BY u.created_at DESC`);
    res.json({ success: true, data: result.recordset });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const getOfficers = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`SELECT u.id, u.email, u.is_active, u.created_at, o.full_name, o.badge_number, o.rank, o.department
              FROM users u JOIN officers o ON u.id=o.user_id ORDER BY u.created_at DESC`);
    res.json({ success: true, data: result.recordset });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const getForensicOfficers = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`SELECT u.id, u.email, u.is_active, u.created_at, f.full_name, f.lab_id, f.specialization
              FROM users u JOIN forensic_officers f ON u.id=f.user_id ORDER BY u.created_at DESC`);
    res.json({ success: true, data: result.recordset });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const createOfficer = async (req, res) => {
  try {
    const { full_name, badge_number, rank, department, email, password } = req.body;
    
    if (!full_name || !badge_number || !rank || !department || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    const pool = await poolPromise;

    const existing = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT id FROM users WHERE email = @email');
    if (existing.recordset.length > 0)
      return res.status(400).json({ success: false, message: 'Email already exists' });

    const password_hash = await bcrypt.hash(password, 12);

    const userResult = await pool.request()
      .input('email', sql.VarChar, email)
      .input('password_hash', sql.VarChar, password_hash)
      .input('role', sql.VarChar, 'officer')
      .query('INSERT INTO users (email, password_hash, role) OUTPUT INSERTED.id VALUES (@email, @password_hash, @role)');

    const userId = userResult.recordset[0].id;

    await pool.request()
      .input('user_id', sql.Int, userId)
      .input('full_name', sql.VarChar, full_name)
      .input('badge_number', sql.VarChar, badge_number)
      .input('rank', sql.VarChar, rank)
      .input('department', sql.VarChar, department)
      .query('INSERT INTO officers (user_id, full_name, badge_number, rank, department) VALUES (@user_id, @full_name, @badge_number, @rank, @department)');

    res.status(201).json({ success: true, message: 'Officer account created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

const createForensic = async (req, res) => {
  try {
    const { full_name, lab_id, specialization, email, password } = req.body;

    if (!full_name || !lab_id || !specialization || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    const pool = await poolPromise;

    const existing = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT id FROM users WHERE email = @email');
    if (existing.recordset.length > 0)
      return res.status(400).json({ success: false, message: 'Email already exists' });

    const password_hash = await bcrypt.hash(password, 12);

    const userResult = await pool.request()
      .input('email', sql.VarChar, email)
      .input('password_hash', sql.VarChar, password_hash)
      .input('role', sql.VarChar, 'forensic')
      .query('INSERT INTO users (email, password_hash, role) OUTPUT INSERTED.id VALUES (@email, @password_hash, @role)');

    const userId = userResult.recordset[0].id;

    await pool.request()
      .input('user_id', sql.Int, userId)
      .input('full_name', sql.VarChar, full_name)
      .input('lab_id', sql.VarChar, lab_id)
      .input('specialization', sql.VarChar, specialization)
      .query('INSERT INTO forensic_officers (user_id, full_name, lab_id, specialization) VALUES (@user_id, @full_name, @lab_id, @specialization)');

    res.status(201).json({ success: true, message: 'Forensic officer account created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request().input('id', sql.Int, req.params.userId)
      .query('UPDATE users SET is_active = CASE WHEN is_active=1 THEN 0 ELSE 1 END WHERE id=@id');
    res.json({ success: true, message: 'User status toggled' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const getAvailableOfficers = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`SELECT o.id, o.full_name, o.badge_number, o.rank, o.department,
              COUNT(ca.id) as active_cases FROM officers o
              LEFT JOIN case_assignments ca ON o.id=ca.officer_id
              LEFT JOIN applications a ON ca.application_id=a.id AND a.status NOT IN ('closed')
              JOIN users u ON o.user_id=u.id WHERE u.is_active=1
              GROUP BY o.id,o.full_name,o.badge_number,o.rank,o.department ORDER BY active_cases ASC`);
    res.json({ success: true, data: result.recordset });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const getAvailableForensic = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`SELECT f.id, f.full_name, f.lab_id, f.specialization FROM forensic_officers f
              JOIN users u ON f.user_id=u.id WHERE u.is_active=1`);
    res.json({ success: true, data: result.recordset });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const getActivityLogs = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const pool = await poolPromise;
    let query = `SELECT al.*, u.email, u.role FROM activity_logs al
                 LEFT JOIN users u ON al.user_id=u.id WHERE 1=1`;
    if (search) query += ` AND (al.action LIKE @search OR u.email LIKE @search)`;
    query += ` ORDER BY al.created_at DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    const req2 = pool.request().input('offset', sql.Int, offset).input('limit', sql.Int, parseInt(limit));
    if (search) req2.input('search', sql.VarChar, `%${search}%`);
    const result = await req2.query(query);
    res.json({ success: true, data: result.recordset });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const getAdminProfile = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().input('id', sql.Int, req.user.id)
      .query('SELECT id, email, role, created_at, last_login FROM users WHERE id=@id');
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const changeAdminPassword = async (req, res) => {
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

module.exports = { getDashboardStats, getCharts, getAllApplications, getApplicationDetail, assignOfficer, assignForensic, getCitizens, getOfficers, getForensicOfficers, createOfficer, createForensic, toggleUserStatus, getAvailableOfficers, getAvailableForensic, getActivityLogs, getAdminProfile, changeAdminPassword };