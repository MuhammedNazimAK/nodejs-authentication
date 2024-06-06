const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const isAuthenticated = require('../helper/authMiddleware');
const { upload } = require("../config/multer");

router.get('/', isAuthenticated, adminController.adminHome);
router.get("/login", adminController.loadLogin);
router.post('/login', adminController.handleLogin);
router.get('/logout', adminController.logout);

router.get('/dashboard', isAuthenticated, adminController.loadDashboard);

//user management routes
router.get('/users', isAuthenticated, adminController.searchUsers);
router.get('/getEditPage/:id', isAuthenticated, adminController.editUser);
router.post('/updateUser/:id', isAuthenticated,upload.single("image"), adminController.updateUser);
router.post('/users/delete/:id', isAuthenticated, adminController.deleteUser);

module.exports = router;
