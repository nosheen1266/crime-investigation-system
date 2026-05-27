const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadProfilePic, changePassword, getApplications, createApplication, getApplicationDetail, uploadFiles, getNotifications, markNotificationRead, markAllRead, getDashboardStats } = require('../controllers/citizenController');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');

router.use(verifyToken, requireRole('citizen'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/picture', uploadSingle, uploadProfilePic);
router.put('/change-password', changePassword);
router.get('/dashboard/stats', getDashboardStats);
router.get('/applications', getApplications);
router.post('/applications', createApplication);
router.get('/applications/:id', getApplicationDetail);
router.post('/applications/:id/files', uploadMultiple, uploadFiles);
router.get('/notifications', getNotifications);
router.put('/notifications/read-all', markAllRead);
router.put('/notifications/:id/read', markNotificationRead);

module.exports = router;