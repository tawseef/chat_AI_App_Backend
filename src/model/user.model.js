const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  user: { type: String, lowercase: true, required: true, unique: true },
  messages: [
    {
      question: { type: String, required: true },
      assistant: { type: String, required: true },
    },
  ],
});

const Message = mongoose.model("message", messageSchema);

module.exports = Message;
