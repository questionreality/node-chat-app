const users = [];

const addUser = ({ id, username, room }) => {
  //clean data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  //validate
  if (!username || !room) {
    return {
      error: "Username and room are required",
    };
  }
  //check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });
  //validate
  if (existingUser) {
    return {
      error: "Username is in use",
    };
  }
  //store user
  const user = { id, username, room };
  users.push(user);
  return {
    user,
  };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};
const getRooms = () => {
  let rooms = [];
  users.forEach((user) => {
    const room = rooms.find((room) => room.name === user.room);
    if (room) {
      room.count += 1;
    } else {
      rooms.push({ name: user.room, count: 1 });
    }
  });
  return rooms;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  getRooms,
};

// const user = addUser({
//   id: 1,
//   username: "vivek",
//   room: "india",
// });
// addUser({
//   id: 2,
//   username: "rahul",
//   room: "pak",
// });
// addUser({
//   id: 3,
//   username: "vijay",
//   room: "india",
// });
// console.log(getUser(431));
// console.log(getUsersInRoom("india"));

// console.log(users);
