const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/login_signup.model");
// const httpStatus = require("http-status");

class Auth {
  secret = process.env.SECRET;

  // User Signupjoi
  signup = async (data) => {
    try {
      const hashedPassword = await this.hashingPassword(data.password);
      console.log({ ...data, password: hashedPassword });
      const result = await User.create({ ...data, password: hashedPassword });
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Creating Hashed Password for storing in DB
  hashingPassword = async (password) => {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  };

  // User Login
  login = async ({ email, password }) => {
    try {
      // Password verification
      const user = await this.verifyPassword(email, password);

      if (user) {
        // Token generation
        const token = this.generateWebToken(user._id);
        return {
          isLoggedIn: true,
          username: user.name,
          userid: user._id,
          token: token,
        };
      } else {
        return { isLoggedIn: false };
      }
    } catch (error) {
      throw error;
    }
  };

  // Password verification for Login purpose
  verifyPassword = async (email, password) => {
    try {
      const user = await User.findOne({ email });
      ////
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) return user;
      else return null;
    } catch (error) {
      throw error;
    }
  };

  // Token generation for storing in cookie
  generateWebToken = (userId) => {
    try {
      const payoad = { userId };
      const secret = this.secret;
      const options = { expiresIn: "1h" };
      const token = jwt.sign(payoad, secret, options);
      return token;
    } catch (e) {
      throw e;
    }
  };
}

module.exports = Auth;
