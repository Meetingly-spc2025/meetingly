const nicknameForm = document.getElementById("nickname-form");
const roomSection = document.getElementById("room-section");
const nicknameSection = document.getElementById("nickname-section");

nicknameForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const nickname = document.getElementById("nickname").value.trim();
    if (nickname) {
        localStorage.setItem("nickname", nickname);
        nicknameSection.style.display = "none";
        roomSection.style.display = "block";
    }
});

document.getElementById("room-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const title = document.getElementById("roomTitle").value.trim();
    const subject = document.getElementById("roomSubject").value.trim();
    const date = document.getElementById("roomDate").value;

    if (!title || !subject || !date) {
        return alert("모든 정보를 입력해주세요.");
    }

    const uuid = crypto.randomUUID();
    const roomName = `${title}_${uuid}`;
    const link = `${window.location.origin}/${roomName}`;
    const inviteInput = document.getElementById("invite-link");
    inviteInput.value = link;
    document.getElementById("invite-link-container").style.display = "block";

    setTimeout(() => {
      window.location.href = `/${roomName}`;
    }, 3000);
});

document.getElementById("copy-link").addEventListener("click", () => {
    const input = document.getElementById("invite-link");

    navigator.clipboard.writeText(input.value)
        .then(() => {
            alert("초대 링크가 복사되었습니다!");
        })
        .catch((err) => {
            console.error("복사 실패:", err);
            alert("복사에 실패했습니다. 브라우저 권한을 확인해주세요.");
        });

});

const inviteLinkInput = document.getElementById("input-invite-link");
const goToInviteLinkBtn = document.getElementById("go-to-invite-link");

goToInviteLinkBtn.addEventListener("click", () => {
    const link = inviteLinkInput.value.trim();
    if (link && link.startsWith("http")) {
        window.location.href = link;
    } else {
        alert("유효한 초대 링크를 입력하세요.");
    }
});