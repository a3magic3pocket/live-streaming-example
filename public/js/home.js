function getRandomInt() {
  const min = Math.ceil(100000);
  const max = Math.floor(0);
  return Math.floor(Math.random() * (max - min)) + min;
}

function setDefaultRoomName() {
  const roomNameElem = document.querySelector("#room-name");
  if (typeof roomNameElem !== "undefined") {
    roomNameElem.innerText = `기본방#${getRandomInt()}`;
  }
}

function setDefaultChatID() {
  const chatIDElem = document.querySelector("#chat-id");
  if (typeof chatIDElem !== "undefined") {
    chatIDElem.innerText = `기본아이디#${getRandomInt()}`;
  }
}
