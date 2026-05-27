const express = require('express');
const router = express.Router();
const { getDashboardStats, getCharts, getAllApplications, getApplicationDetail, assignOfficer, assignForensic, getCitizens, getOfficers, getForensicOfficers, createOfficer, createForensic, toggleUserStatus, getAvailableOfficers, getAvailableForensic, getActivityLogs, getAdminProfile, changeAdminPassword } = require('../controllers/adminController');
const { verifyAdminToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

router.use(verifyAdminToken, requireRole('admin'));

router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/charts', getCharts);
router.get('/applications', getAllApplications);
router.get('/applications/:id', getApplicationDetail);
router.post('/applications/:id/assign-officer', assignOfficer);
router.post('/evidence/:id/assign-forensic', assignForensic);
router.get('/users/citizens', getCitizens);
router.get('/users/officers', getOfficers);
router.get('/users/forensic', getForensicOfficers);
router.post('/users/officers', createOfficer);
router.post('/users/forensic', createForensic);
router.put('/users/:userId/toggle-status', toggleUserStatus);
router.get('/officers/available', getAvailableOfficers);
router.get('/forensic/available', getAvailableForensic);
router.get('/activity-logs', getActivityLogs);
router.get('/profile', getAdminProfile);
router.put('/change-password', changeAdminPassword);

module.exports = router;