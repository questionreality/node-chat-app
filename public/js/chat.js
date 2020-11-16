const socket = io();
//Elements
const $chatForm = document.querySelector(".chat-form");
const $chatFormInput = $chatForm.querySelector("input");
const $chatFormButton = $chatForm.querySelector("button");
const $sendLocation = document.querySelector(".send-location");
const $messages = document.querySelector(".messages");
const locationTemplate = document.querySelector("#location-template").innerHTML;
//Templates
const messageTemplate = document.querySelector("#chat-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
const autoscroll = () => {
  //New message element
  const $newMessage = $messages.lastElementChild;
  //Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //Visible Height
  const visibleHeight = $messages.offsetHeight;
  //height of messages container
  const containerHeight = $messages.scrollHeight;
  //how far have I scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight;
  if (
    Math.round(containerHeight - newMessageHeight - 1) <=
    Math.round(scrollOffset)
  ) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};


socket.on("message", ({ text: messageFromServer, createdAt, username }) => {
  const html = Mustache.render(messageTemplate, {
    message: messageFromServer,
    createdAt,
    username,
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on(
  "locationMessage",
  ({ text: messageFromServer, createdAt, username }) => {
    console.log(messageFromServer);
    const html = Mustache.render(locationTemplate, {
      username,
      url: messageFromServer,
      createdAt,
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
  }
);
socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector(".chat__sidebar").innerHTML = html;
});
const textValue = document.querySelector(".input-text");
$chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //disable
  $chatFormButton.setAttribute("disabled", "disabled");

  socket.emit("message", e.target.elements.message.value, (error) => {
    //enable
    $chatFormButton.removeAttribute("disabled");
    $chatFormInput.value = "";
    $chatFormInput.focus();

    // $chatFormInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log("Delivered");
  });
});
$sendLocation.addEventListener("click", () => {
  $sendLocation.setAttribute("disabled", "disabled");
  if (!navigator.geolocation) {
    $sendLocation.removeAttribute("disabled");
    return alert("Geolocation is not supported by your browser");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    setTimeout(() => {
      console.log(position);
      socket.emit(
        "sendLocation",
        {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        () => {
          $sendLocation.removeAttribute("disabled");
          console.log("Location delivered");
        }
      );
    }, 1000);
  });
});
socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
