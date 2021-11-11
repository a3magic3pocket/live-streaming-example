document.addEventListener("DOMContentLoaded", function () {
  setDefaultRoomName();
  setDefaultChatID();
  setConn();
  reloadVideo();
  initVideoSize();

  const clipboard = new ClipboardJS(".clip-board-btn");
});

let conn;
let videoInitWidth;
let videoInitHeight;
const rtmpURL = document.getElementById("home-js").getAttribute("rtmp-uRL");
const hlsURL = document.getElementById("home-js").getAttribute("hls-uRL");
const apiURL = document.getElementById("home-js").getAttribute("api-uRL");

// getRandomInt() : 0~100000 사이의 랜덤 정수를 얻습니다.
function getRandomInt() {
  const min = Math.ceil(100000);
  const max = Math.floor(0);
  return Math.floor(Math.random() * (max - min)) + min;
}

// setDefaultRoomName() : 기본 방 이름을 지정합니다.
function setDefaultRoomName() {
  const roomNameElem = document.querySelector("#room-name");
  if (typeof roomNameElem !== "undefined") {
    roomNameElem.innerText = `RoomName-${getRandomInt()}`;
  }
}

// handleRoomNamePointerEnter() : 방 이름 인풋에 진입할때 상태값을 제거합니다.
function handleRoomNamePointerEnter() {
  const roomNameStatusElem = document.querySelector("#room-name-status");
  if (typeof roomNameStatusElem !== "undefined") {
    roomNameStatusElem.innerText = "";
  }
}

// getRtmpAddress : 방송을 시작할 수 있는 rtmp 주소를 획득합니다.
function getRtmpAddress() {
  const roomNameElem = document.querySelector("#room-name");
  const rtmpAddrStatusElem = document.querySelector("#rtmp-address-status");
  if (
    typeof roomNameElem === "undefined" ||
    typeof rtmpAddrStatusElem === "undefined"
  ) {
    throw new Error("failed to handleRoomNameClick");
  }

  const channel = roomNameElem.innerText;
  const url = `${apiURL}/control/get?room=${channel}`;
  fetch(url)
    .then((res) => res.json())
    .then((response) => {
      rtmpAddrStatusElem.value = `${rtmpURL}/${response.data}`;
    })
    .catch((e) => {
      console.log("e", e);
      rtmpAddrStatusElem.innerText = "failed to get rtmp-address";
    });
}

// initVideoSize : 비디오 크기 조절
function initVideoSize() {
  const videoElem = document.querySelector("#video");
  const chatFormElem = document.querySelector("#chat-form");
  if (typeof chatFormElem === "undefined" || typeof videoElem === "undefined") {
    throw new Error("failed to initVideoSize");
  }
  const width = videoElem.clientWidth;
  const height = videoElem.clientHeight;
  videoElem.style.width = `${width}px`;
  videoElem.style.maxHeight = `calc(${height}px - 2rem)`;
}

// reloadVideo : 비디오 로드
function reloadVideo() {
  const roomNameElem = document.querySelector("#room-name");
  const videoElem = document.querySelector("#video");
  if (typeof roomNameElem === "undefined" || typeof videoElem === "undefined") {
    throw new Error("failed to reloadVideo");
  }
  const channel = roomNameElem.innerText;
  var videoSrc = `${hlsURL}/${channel}.m3u8`;
  if (Hls.isSupported()) {
    var hls = new Hls();
    hls.loadSource(videoSrc);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, function (event, data) {
      hls.stopLoad();
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = videoSrc;
  }
}

// handleRoomNameClick(event) :
// 방 이름 변경 버튼을 클릭하면, 방 이름을 변경하고 웹 소켓 연결을 해당 방으로 변경합니다.
// 변경된 방 이름으로 rtmp-address를 새로 발급합니다.
function handleRoomNameClick(event) {
  event.preventDefault();

  const roomNameInputElem = document.querySelector("#room-name-input");
  const roomNameStatusElem = document.querySelector("#room-name-status");
  const roomNameElem = document.querySelector("#room-name");
  if (
    typeof roomNameInputElem === "undefined" ||
    typeof roomNameStatusElem === "undefined" ||
    typeof roomNameElem === "undefined"
  ) {
    throw new Error("failed to handleRoomNameClick");
  }

  if (roomNameInputElem.value === "") {
    roomNameStatusElem.innerText = "방이름을 입력하지 않으셨습니다.";
    return;
  }

  const re = /[^A-z0-9-]+/g;
  if (roomNameInputElem.value.match(re)) {
    roomNameStatusElem.innerText =
      "방이름은 알파벳, 숫자, -(dash)만 허용됩니다.";
    return;
  }

  roomNameElem.innerHTML = roomNameInputElem.value;
  conn.close();
  setConn();

  getRtmpAddress();
  reloadVideo();
}

// setDefaultChatID() : 기본 chatID를 설정합니다.
function setDefaultChatID() {
  const chatIDElem = document.querySelector("#chat-id");
  if (typeof chatIDElem !== "undefined") {
    chatIDElem.innerText = `UserID-${getRandomInt()}`;
  }
}

// appendChatLog(elem) :
// 채팅 로그를 추가합니다.
// 채팅 로그가 지정 수보다 늘어나면 가장 오래된 로그를 지우고 추가합니다.
function appendChatLog(elem) {
  const chatLogWrapElem = document.querySelector("#chat-log-wrapper");
  const chatLogElems = document.querySelectorAll(".chat-log");
  const numDisplay = 5;
  if (
    typeof chatLogWrapElem === "undefined" ||
    typeof chatLogElems === "undefined"
  ) {
    alert("asdfas");
    return;
  }

  if (chatLogElems.length >= numDisplay) {
    let start = chatLogElems.length - numDisplay + 1;
    if (start < 0) {
      start = 0;
    }

    for (let i = 0; i < chatLogElems.length; i++) {
      if (i < start) {
        chatLogElems[i].remove();
      }
    }
  }

  elem.className = "chat-log";
  chatLogWrapElem.appendChild(elem);
}

// setConn() : 새 웹소켓 연결을 생성합니다.
function setConn() {
  if (window["WebSocket"]) {
    let channel = "";
    const roomNameElem = document.querySelector("#room-name");
    if (typeof roomNameElem !== "undefined") {
      channel = roomNameElem.innerText;
    }

    conn = new WebSocket(
      "ws://" + document.location.host + "/ws?channel=" + channel
    );
    const item = document.createElement("div");
    item.innerHTML = `<b>Connection to ${channel} created.</b>`;
    appendChatLog(item);

    conn.onclose = function (evt) {
      let params = new URL(evt.target.url).searchParams;
      const channel = params.get("channel");

      const item = document.createElement("div");
      item.innerHTML = `<b>Connection to ${channel} closed.</b>`;
      appendChatLog(item);
    };
    conn.onmessage = function (evt) {
      let messages = evt.data.split("\n");
      for (let i = 0; i < messages.length; i++) {
        let item = document.createElement("div");
        item.innerText = messages[i];
        appendChatLog(item);
      }
    };
  } else {
    const item = document.createElement("div");
    item.innerHTML = "<b>Your browser does not support WebSockets.</b>";
    appendChatLog(item);
  }
}

// handleChatSubmit(event) : 채팅 submit이 발생하면 웹소켓 서버로 해당 메세지를 전달합니다.
function handleChatSubmit(event) {
  event.preventDefault();

  const chatInputElem = document.querySelector("#chat-input");
  if (typeof chatInputElem === "undefined") {
    return false;
  }
  if (!conn) {
    return false;
  }
  if (!chatInputElem.value) {
    return false;
  }

  const chatIDElem = document.querySelector("#chat-id");
  if (typeof chatIDElem === "undefined") {
    return false;
  }

  const messsage = `${chatIDElem.innerText}: ${chatInputElem.value}`;
  conn.send(messsage);
  chatInputElem.value = "";
  return false;
}
