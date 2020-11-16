const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage } = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  getRooms,
} = require("./utils/users");
const app = express();
//creating it on our own so that we can pass it into socketio
const server = http.createServer(app);
const io = socketio(server);
const publicDirectoryPath = path.join(__dirname, "/../public");
app.use(express.static(publicDirectoryPath));
const port = process.env.PORT || 3000;

io.on("connection", (socket) => {
  console.log("new web socket connection");
  socket.emit("getRooms", {
    rooms: getRooms(),
  });
  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });
    if (error) {
      return callback(error);
    }
    const { username, room } = user;
    socket.join(room);
    //socket.emit, io.emit, socket.broadcast.emit
    //io.to.emit -> everybody in a room, socket.broadcast.to.emit
    socket.emit("message", generateMessage("Welcome!"));
    socket.broadcast
      .to(room)
      .emit("message", generateMessage(`${username} has joined`));
    io.to(user.room).emit("roomData", {
      room: room,
      users: getUsersInRoom(room),
    });
    callback();
  });

  socket.on("message", (messageFromClient, cb) => {
    const user = getUser(socket.id);
    // if (user) {
    const filter = new Filter();
    if (filter.isProfane(messageFromClient)) {
      return cb("Profanity is not allowed!");
    }
    io.to(user.room).emit(
      "message",
      generateMessage(user.username, messageFromClient)
    );
    cb();
  });

  socket.on("sendLocation", ({ latitude, longitude } = {}, cb) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateMessage(
        user.username,
        `https://google.com/maps?q=${latitude},${longitude}`
      )
    );
    cb();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(`${user.username} has left`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});
server.listen(port, () => {
  console.log("Server is up on 3000");
});
