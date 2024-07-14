const express = require("express");
const router = express.Router();
const {
  handleSaveRequest,
  handlePostRequest,
  handleGetRequest,
  handleUserSignup,
  handleUserLogin,
  handleFileRequest,
} = require("../controller/controller");
const {
  validateSchema,
  validateLoginUser,
} = require("../middleware/validate.middleware");
const {
  loginBodyValidaton,
  signUpBodyValidation,
} = require("../validation/auth.validator");
const validateLogin = validateSchema(loginBodyValidaton);
const validateSignup = validateSchema(signUpBodyValidation);

router.post("/signup", validateSignup, handleUserSignup);
router.post("/login", validateLogin, handleUserLogin);

router.post("/chat", validateLoginUser, handlePostRequest);
router.post("/save", handleSaveRequest);
router.post("/file", handleFileRequest);
router.get("/message/:user", handleGetRequest);

module.exports = router;
