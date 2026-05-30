require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../config/db');

const JWT_SECRET = 'crime_system_super_secret_jwt_key_2025';
const JWT_ADMIN_SECRET = 'crime_system_admin_secret_key_2025';

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
};

const generateAdminAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_ADMIN_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user, isAdmin = false) => {
  const secret = isAdmin ? JWT_ADMIN_SECRET : JWT_SECRET;
  return jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: '7d' });
};

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const citizenRegister = async (req, res) => {
  try {
    const { full_name, cnic, email, phone, address, password } = req.body;
    const pool = await poolPromise;
    const existing = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT id FROM users WHERE email = @email');
    if (existing.recordset.length > 0)
      return res.status(400).json({ success: false, message: 'Email already registered' });
    const existingCnic = await pool.request()
      .input('cnic', sql.VarChar, cnic)
      .query('SELECT id FROM citizens WHERE cnic = @cnic');
    if (existingCnic.recordset.length > 0)
      return res.status(400).json({ success: false, message: 'CNIC already registered' });
    const password_hash = await bcrypt.hash(password, 12);
    const userResult = await pool.request()
      .input('email', sql.VarChar, email)
      .input('password_hash', sql.VarChar, password_hash)
      .input('role', sql.VarChar, 'citizen')
      .query('INSERT INTO users (email, password_hash, role) OUTPUT INSERTED.id VALUES (@email, @password_hash, @role)');
    const userId = userResult.recordset[0].id;
    await pool.request()
      .input('user_id', sql.Int, userId)
      .input('full_name', sql.VarChar, full_name)
      .input('cnic', sql.VarChar, cnic)
      .input('phone', sql.VarChar, phone)
      .input('address', sql.VarChar, address)
      .query('INSERT INTO citizens (user_id, full_name, cnic, phone, address) VALUES (@user_id, @full_name, @cnic, @phone, @address)');
    await pool.request()
      .input('user_id', sql.Int, userId)
      .input('title', sql.VarChar, 'Welcome!')
      .input('message', sql.VarChar, 'Your account has been created successfully.')
      .input('type', sql.VarChar, 'success')
      .query('INSERT INTO notifications (user_id, title, message, type) VALUES (@user_id, @title, @message, @type)');
    res.status(201).json({ success: true, message: 'Account created successfully. Please login.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const citizenLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query(`SELECT u.id, u.email, u.password_hash, u.role, u.is_active, c.full_name, c.id as citizen_id
              FROM users u JOIN citizens c ON u.id = c.user_id
              WHERE u.email = @email AND u.role = 'citizen'`);
    if (result.recordset.length === 0)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    const user = result.recordset[0];
    if (!user.is_active)
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    await pool.request()
      .input('id', sql.Int, user.id)
      .query('UPDATE users SET last_login = GETDATE() WHERE id = @id');
    const tokenUser = { id: user.id, email: user.email, role: user.role, name: user.full_name };
    const accessToken = generateAccessToken(tokenUser);
    const refreshToken = generateRefreshToken(tokenUser);
    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.json({ success: true, accessToken, user: { id: user.id, email: user.email, role: user.role, name: user.full_name, citizen_id: user.citizen_id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const officerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query(`SELECT u.id, u.email, u.password_hash, u.role, u.is_active, o.full_name, o.badge_number, o.rank, o.department, o.id as officer_id
              FROM users u JOIN officers o ON u.id = o.user_id
              WHERE u.email = @email AND u.role = 'officer'`);
    if (result.recordset.length === 0)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const user = result.recordset[0];
    if (!user.is_active)
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    await pool.request()
      .input('id', sql.Int, user.id)
      .query('UPDATE users SET last_login = GETDATE() WHERE id = @id');
    const tokenUser = { id: user.id, email: user.email, role: user.role, name: user.full_name };
    const accessToken = generateAccessToken(tokenUser);
    const refreshToken = generateRefreshToken(tokenUser);
    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.json({ success: true, accessToken, user: { id: user.id, email: user.email, role: user.role, name: user.full_name, badge_number: user.badge_number, officer_id: user.officer_id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const forensicLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query(`SELECT u.id, u.email, u.password_hash, u.role, u.is_active, f.full_name, f.lab_id, f.specialization, f.id as forensic_id
              FROM users u JOIN forensic_officers f ON u.id = f.user_id
              WHERE u.email = @email AND u.role = 'forensic'`);
    if (result.recordset.length === 0)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const user = result.recordset[0];
    if (!user.is_active)
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    await pool.request()
      .input('id', sql.Int, user.id)
      .query('UPDATE users SET last_login = GETDATE() WHERE id = @id');
    const tokenUser = { id: user.id, email: user.email, role: user.role, name: user.full_name };
    const accessToken = generateAccessToken(tokenUser);
    const refreshToken = generateRefreshToken(tokenUser);
    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.json({ success: true, accessToken, user: { id: user.id, email: user.email, role: user.role, name: user.full_name, lab_id: user.lab_id, forensic_id: user.forensic_id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query(`SELECT id, email, password_hash, role, is_active FROM users WHERE email = @email AND role = 'admin'`);
    if (result.recordset.length === 0)
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    const user = result.recordset[0];
    if (!user.is_active)
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    await pool.request()
      .input('id', sql.Int, user.id)
      .query('UPDATE users SET last_login = GETDATE() WHERE id = @id');
    const tokenUser = { id: user.id, email: user.email, role: user.role, name: 'Administrator' };
    const accessToken = generateAdminAccessToken(tokenUser);
    const refreshToken = generateRefreshToken(tokenUser, true);
    res.cookie('adminRefreshToken', refreshToken, cookieOptions);
    res.json({ success: true, accessToken, user: { id: user.id, email: user.email, role: user.role, name: 'Administrator' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'No refresh token' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, decoded.id)
      .query('SELECT id, email, role FROM users WHERE id = @id AND is_active = 1');
    if (result.recordset.length === 0)
      return res.status(401).json({ success: false, message: 'User not found' });
    const user = result.recordset[0];
    const accessToken = generateAccessToken({ ...user, name: decoded.name });
    res.json({ success: true, accessToken });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

const adminRefreshToken = async (req, res) => {
  try {
    const token = req.cookies.adminRefreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'No refresh token' });
    const decoded = jwt.verify(token, JWT_ADMIN_SECRET);
    const accessToken = generateAdminAccessToken({ id: decoded.id, email: decoded.email, role: decoded.role, name: 'Administrator' });
    res.json({ success: true, accessToken });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

const logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.clearCookie('adminRefreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
};

module.exports = { citizenRegister, citizenLogin, officerLogin, forensicLogin, adminLogin, refreshToken, adminRefreshToken, logout };