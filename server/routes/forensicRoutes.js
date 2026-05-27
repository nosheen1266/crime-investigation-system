const express = require('express');
const router = express.Router();
const { getProfile, changePassword, getEvidence, getEvidenceDetail, updateEvidenceStatus, addFinding, getFindings, submitReport, getReports, getNotifications, markNotificationRead, getDashboardStats } = require('../controllers/forensicController');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { uploadSingle } = require('../middleware/upload');

router.use(verifyToken, requireRole('forensic'));

router.get('/profile', getProfile);
router.put('/change-password', changePassword);
router.get('/dashboard/stats', getDashboardStats);
router.get('/evidence', getEvidence);
router.get('/evidence/:id', getEvidenceDetail);
router.put('/evidence/:id/status', updateEvidenceStatus);
router.post('/evidence/:id/findings', addFinding);
router.get('/evidence/:id/findings', getFindings);
router.post('/evidence/:id/report', uploadSingle, submitReport);
router.get('/reports', getReports);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

module.exports = router;