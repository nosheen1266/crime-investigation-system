const express = require('express');
const router = express.Router();
const { getProfile, changePassword, getCases, getCaseDetail, updateCaseStatus, addSuspect, getSuspects, addWitness, getWitnesses, uploadEvidence, getEvidence, getForensicReports, getNotifications, markNotificationRead, getDashboardStats } = require('../controllers/officerController');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { uploadSingle } = require('../middleware/upload');

router.use(verifyToken, requireRole('officer'));

router.get('/profile', getProfile);
router.put('/change-password', changePassword);
router.get('/dashboard/stats', getDashboardStats);
router.get('/cases', getCases);
router.get('/cases/:id', getCaseDetail);
router.put('/cases/:id/status', updateCaseStatus);
router.post('/cases/:id/suspects', addSuspect);
router.get('/cases/:id/suspects', getSuspects);
router.post('/cases/:id/witnesses', addWitness);
router.get('/cases/:id/witnesses', getWitnesses);
router.post('/cases/:id/evidence', uploadSingle, uploadEvidence);
router.get('/cases/:id/evidence', getEvidence);
router.get('/cases/:id/forensic-reports', getForensicReports);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

module.exports = router;