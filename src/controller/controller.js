const httpStatus = require("http-status");
const {
  saveInDataBase,
  getDataFromOpenAi,
  getUserMessages,
  uploadingFile,
} = require("../service/service");
const AuthService = require("../service/user.service");
const AuthServiceInstance = new AuthService();

async function handlePostRequest(req, res) {
  const { question } = req.body;
  try {
    const response = await getDataFromOpenAi(question);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error in handlePostRequest:", error);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    }
  }
}

async function handleSaveRequest(req, res) {
  try {
    const response = await saveInDataBase(req.body);
    if (response) res.status(200).json(response);
    else res.status(404).json({ message: "User not found or update failed" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function handleGetRequest(req, res) {
  const { user } = req.params;
  const username = user.toLowerCase();
  try {
    const response = await getUserMessages(username);
    if (response) res.status(200).json(response);
    else res.status(400).json([]);
  } catch (e) {
    res
      .status(500)
      .json({ success: "false", message: "Internal server error" });
  }
}

async function handleFileRequest(req, res) {
  const { path } = req.body;
  console.log(req.body);
  try {
    const response = await uploadingFile(path);
    if (response) res.status(200).json(response);
    else res.status(400).json([]);
  } catch (e) {
    res
      .status(500)
      .json({ success: "false", message: "Internal server error" });
  }
}

async function handleUserSignup(req, res) {
  try {
    const user = await AuthServiceInstance.signup(req.body);
    res
      .status(httpStatus.OK)
      .json({ message: "Signup Successful", username: user.name });
  } catch (error) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Check credential", error });
  }
}

// Login Function
async function handleUserLogin(req, res) {
  try {
    const result = await AuthServiceInstance.login(req.body);
    // Storing token to cookie
    res.cookie("token", result.token, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
    });

    res.json(result);
  } catch (error) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "User does not exist", error });
  }
}

module.exports = {
  handleSaveRequest,
  handlePostRequest,
  handleGetRequest,
  handleUserSignup,
  handleUserLogin,
  handleFileRequest,
};
