const Message = require("../model/user.model");
const { OpenAI } = require("openai");
const fs = require("fs");

const urlFileUPLOAD = "https://api.openai.com/v1/files";

async function getDataFromOpenAi(question) {
  const openai = new OpenAI();
  const assistant = await openai.beta.assistants.create({
    name: "Financial Expert",
    instructions:
      "You are a Financial Expert. Your responses should be clear, concise, and formatted in a way that is easy to read and it should get displayed on the browser in a proper way. Use bullet points for lists the items",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-4-1106-preview",
  });

  const thread = await openai.beta.threads.create();

  const message = await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: `${question}`,
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
    instructions: "Please address the user as UserName.",
  });

  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const result = await checkStatusAndPrintMessages(thread.id, run.id);
        if (result) {
          clearInterval(interval);
          resolve(result);
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 1000);
  });
}

const checkStatusAndPrintMessages = async (threadId, runId) => {
  const openai = new OpenAI();
  try {
    const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
    if (runStatus.status === "completed") {
      const messages = await openai.beta.threads.messages.list(threadId);

      const formattedMessages = messages.data
        .filter((msg) => msg.role === "assistant")
        .map((msg) => {
          const content = msg.content[0].text.value;
          return {
            role: "Assistant",
            content: content,
          };
        });

      return formattedMessages;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

async function saveInDataBase(data) {
  const { user, question, answer } = data;
  try {
    const findUser = await findUserInDataBase(user);
    if (!findUser) {
      const response = await Message.create({
        user: user,
        messages: [{ question: question, assistant: answer }],
      });
      if (response) return response;
      return null;
    } else {
      const checkAndAddMessage = checkAndUpdateMessage(
        findUser.messages,
        question,
        answer
      );
      const response = await UpdateInDB(checkAndAddMessage, user);
      return response.modifiedCount > 0 ? response : null;
    }
  } catch (error) {
    throw error;
  }
}

async function UpdateInDB(data, user) {
  try {
    const response = await Message.updateOne(
      { user: user },
      { $set: { messages: data } }
    );
    return response;
  } catch (error) {
    throw error;
  }
}

function checkAndUpdateMessage(messageArray, question, answer) {
  const userMessages = messageArray;
  if (userMessages.length >= 25) {
    userMessages.shift();
  }
  userMessages.push({ question: question, assistant: answer });
  return userMessages;
}

async function findUserInDataBase(user) {
  try {
    const response = await Message.findOne({ user: user });
    if (response) return response;
    return null;
  } catch (error) {
    throw error;
  }
}

async function getUserMessages(user) {
  try {
    const response = await Message.find({ user: user });
    if (response.length > 0) return response[0].messages;
    else return null;
  } catch (error) {
    throw error;
  }
}

async function uploadingFile(path) {
  const openai = new OpenAI();
  try {
    const formData = new FormData();
    formData.append("file", path);
    formData.append("purpose", "fine-tune");

    const file = await openai.files.create({
      file: fs.createReadStream(formData),
      purpose: "fine-tune",
    });
    console.log("File upload successful:", file);
    return file;
  } catch (error) {
    console.error(
      "Failed to upload file:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

module.exports = {
  saveInDataBase,
  getDataFromOpenAi,
  getUserMessages,
  uploadingFile,
};
