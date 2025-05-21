
const socket = io();

const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const leaveBtn = document.getElementById("leaveRoom");
const camerasSelect = document.getElementById("cameras");

const chatBox = document.getElementById("chat-messages");
const chatInput = document.getElementById("chatMessage");
const sendBtn = document.getElementById("sendMessage");
const dmSelect = document.getElementById("dm-select");

let myStream;
let muted = false;
let cameraOff = false;

let peerConnections = {};
const nicknames = {};

const nickname = localStorage.getItem("nickname");
const roomName = window.location.pathname.replace("/", "");

if (!roomName || !nickname) {
    alert("올바르지 않은 접속입니다. 홈으로 이동합니다.");
    window.location.href = "/";
}

async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((device) => device.kind === "videoinput");
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach((camera) => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if (currentCamera.label === camera.label) {
                option.selected = true;
            }
            camerasSelect.appendChild(option);
        });
    } catch (e) {
        console.log(e);
    }
}

async function getMedia(deviceId) {
    const initialConstrains = {
        audio: true,
        video: { facingMode: "user" },
    };
    const cameraConstrains = {
        audio: true,
        video: { deviceId: { exact: deviceId } },
    }
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId? cameraConstrains : initialConstrains
        );
        addVideoStream(myStream, socket.id, nickname);
        if (!deviceId) {
            await getCameras();
        }
    } catch (e) {
        console.log(e);
    }
}

function handleMuteClick() {
    myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    if (!muted) {
        muteBtn.innerText = "UnMute";
        muted = true;
    } else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
}

function handleCameraClick() {
    myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    if (cameraOff) {
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    } else {
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
}

async function handleCameraChange() {
    await getMedia(camerasSelect.value);
    for (const peerConnection of Object.values(peerConnections)) {
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = peerConnection.getSenders().find((sender) => sender.track.kind === "video");
        videoSender.replaceTrack(videoTrack);
    }

    syncTrackStates();
}

leaveBtn.addEventListener("click", () => {
    Object.values(peerConnections).forEach((peerConnection) => peerConnection.close());

    if (myStream) {
        myStream.getTracks().forEach((track) => track.stop());
    }

    peerConnections = {};

    socket.disconnect();

    window.location.href = "/";
});

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form (join a room)
(async () => {
    await getMedia();
    socket.emit("join_room", { roomName, nickname });
})();

// Socket Code

socket.on("welcome", async (users) => {
    for (const userId of users) {
        const peerConnection = makeConnection(userId);

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        console.log("sent the offer");
        socket.emit("offer", offer, userId, socket.id);
    }
});

socket.on("user_joined", (userId) => {
    const peerConnection = makeConnection(userId);
    peerConnections[userId] = peerConnection;

});

socket.on("offer", async (offer, callerId) => {
    const peerConnection = makeConnection(callerId);
    console.log("received the offer");
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, callerId);
    console.log("sent the answer");
});

socket.on("answer", async (answer, userId) => {
    console.log("received the answer");
    await peerConnections[userId].setRemoteDescription(answer);
});

socket.on("ice", async (ice, userId) => {
    console.log("received candidate");
    await peerConnections[userId].addIceCandidate(ice);
});

socket.on("left_room", (userId) => {
    if (peerConnections[userId]) {
        peerConnections[userId].close();
        delete peerConnections[userId];
    }

    const slot = document.getElementById(`user-${userId}`);
    if (slot) {
        slot.innerHTML = "";
        slot.classList.add("empty-slot");
        slot.removeAttribute("id");
    }
});

socket.on("room_full", () => {
    alert("최대 4명까지 참가할 수 있습니다.");
    window.location.href = '/';
});

// chat

function sendMessage() {
    const message = chatInput.value.trim();
    if (message === "") return;

    const sendData = {
        myNick: nickname,
        dm: dmSelect.value,
        msg: message,
    };

    socket.emit("send", sendData);
    chatInput.value = "";
}

sendBtn.addEventListener("click", sendMessage);

chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

socket.on("message", (msgInfo) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("msg-wrapper");

    const div = document.createElement("div");
    div.classList.add("speech");

    const span = document.createElement("span");
    span.classList.add("msg-box");
    span.textContent = msgInfo.isDm ? `[귓속말] ${msgInfo.message}` : msgInfo.message;

    div.append(span);

    if (nickname === msgInfo.id) {
        wrapper.classList.add("me");
    } else {
        wrapper.classList.add("other");

        const nicknameTag = document.createElement("div");
        nicknameTag.classList.add("nickname");
        nicknameTag.textContent = msgInfo.id;
        wrapper.appendChild(nicknameTag);
    }

    if (msgInfo.isDm) {
        div.classList.add("dm");
    }

    wrapper.appendChild(div);
    chatBox.appendChild(wrapper);
    chatBox.scrollTop = chatBox.scrollHeight;
});

socket.on("updateNicks", (nickInfo) => {
    let options = `<option value="all">전체</option>`;
    for (let key in nickInfo) {
        if (key !== socket.id) {
            options += `<option value="${key}">${nickInfo[key]}</option>`;
        }
    }
    dmSelect.innerHTML = options;

    Object.assign(nicknames, nickInfo);
    nicknames[socket.id] = nickname;
});

socket.on("notice", (msg) => {
    const notice = document.createElement("div");
    notice.classList.add("notice");
    notice.textContent = msg;
    chatBox.append(notice);
});

// RTC Code

function makeConnection(userId) {
    const peerConnection = new RTCPeerConnection({
        iceServers: [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302", 
                ],
            },
        ],
    });

    peerConnection.addEventListener("icecandidate", (event) => handleIce(event, userId));
    peerConnection.addEventListener("addstream", (event) => handleAddStream(event, userId));

    myStream.getTracks().forEach((track) => peerConnection.addTrack(track, myStream));
    peerConnections[userId] = peerConnection;

    syncTrackStates()

    return peerConnection;
}

function handleIce(event, userId) {
    if (event.candidate) {
        socket.emit("ice", event.candidate, userId);
        console.log(`Sent candidate to ${userId}`);
    }
}

function handleAddStream(event, userId) {
    const userNickname = nicknames[userId] || userId;
    addVideoStream(event.stream, userId, userNickname);
}

function addVideoStream(stream, userId, nickname) {
    let slot = document.getElementById(`user-${userId}`);

    if (slot) {
        const existingVideo = slot.querySelector("video");
        if (existingVideo) {
            existingVideo.srcObject = stream;
        }
        return;
    }

    const slots = document.querySelectorAll(".participant");
    const emptySlot = Array.from(slots).find((slot) => slot.classList.contains("empty-slot"));
    if (!emptySlot) return;

    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.srcObject = stream;

    const label = document.createElement("div");
    label.className = "video-nickname";
    label.innerText = nickname || "User";

    emptySlot.appendChild(video);
    emptySlot.appendChild(label);
    emptySlot.classList.remove("empty-slot");
    emptySlot.id = `user-${userId}`;
}

function syncTrackStates() {
    const audioEnabled = !muted;
    const videoEnabled = !cameraOff;

    myStream.getAudioTracks().forEach(track => {
        track.enabled = audioEnabled;
    });

    myStream.getVideoTracks().forEach(track => {
        track.enabled = videoEnabled;
    });
}