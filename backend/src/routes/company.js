// routes/company.js
const express = require("express");
const router = express.Router();
const companyController = require("../controllers/companyController");
const authenticate = require("../middleware/authenticate"); // seu middleware de auth

router.get("/profile", authenticate, companyController.getCompanyProfile);
router.put("/profile", authenticate, companyController.updateCompanyProfile);
router.post(
  "/upload-logo",
  authenticate,
  upload.single("logo"),
  companyController.uploadLogo
);

module.exports = router;
