const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");
const AuthMiddleware = require("../middleware/auth");

// Rotas públicas
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/super-admin", AuthController.createSuperAdmin);

// Rotas protegidas
router.get("/profile", AuthMiddleware.authenticate, AuthController.getProfile);
router.put(
  "/profile",
  AuthMiddleware.authenticate,
  AuthController.updateProfile
);

module.exports = router;
