const express = require("express");
const router = express.Router();
const multers = require("../config/multer");
const upload = multers.upload;
const userController = require("../controllers/userController");

router.get("/", userController.home);

router.get("/register", userController.loadRegister);

router.post("/register", upload.single("image"), userController.insertUser);

router.get("/login", userController.loadLogin);

router.post("/login", userController.HandleLogin);

router.post("/logout", userController.logout);

module.exports = router;
