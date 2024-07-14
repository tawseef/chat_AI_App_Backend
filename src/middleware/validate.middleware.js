const httpStatus = require("http-status");

const validateSchema = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    res.status(httpStatus.UNPROCESSABLE_ENTITY).json(error);
  } else {
    next();
  }
};

const validateLoginUser = (req, res, next) => {
  const { logIn } = req.body;
  if (logIn === "true") {
    next();
  } else {
    res
      .status(httpStatus.UNAUTHORIZED)
      .json({ message: "authentication error" });
  }
};

module.exports = { validateSchema, validateLoginUser };
