const dayjs = require("dayjs");

const generateMessage = (username, text) => {
  return {
    username,
    text,
    createdAt: dayjs().format("h:mm A"),
  };
};

module.exports = {
  generateMessage,
};
