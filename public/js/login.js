const socket = io();
const roomTemplate = document.querySelector("#room-template").innerHTML;
const roomInput = document.querySelector("input[name='room']");
socket.on("getRooms", ({ rooms }) => {
  console.log(rooms);
  const html = Mustache.render(roomTemplate, { rooms });
  console.log(html);
  document.querySelector(".room-sidebar").innerHTML = html;
  const $rooms = document.querySelectorAll(".room-names");
  console.log($rooms);
  $rooms.forEach((room) =>
    room.addEventListener("click", (ev) => {
      roomInput.value = ev.target.dataset.name;
    })
  );
});
