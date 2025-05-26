// import React, { useState, useRef } from "react";
import React, { useState } from "react";
import LoadingScreen from "../../components/LoadingScreen";
import axios from "axios";

function AudioRecorder() {
 const [loading, setLoading] = useState(false);

  const [audioFile, setAudioFile] = useState(null);
  // const [recording, setRecording] = useState(false);
  // const mediaRecorderRef = useRef(null);
  // const audioChunksRef = useRef([]);

  // 📁 파일 선택
  const handleFileChange = (e) => {
    setAudioFile(e.target.files[0]);
  };

  // 📤 일반 녹음 업로드
  const handleFileUpload = async () => {
    if (audioFile) {
      const formData = new FormData();
      formData.append("audio", audioFile);

      try {
        setLoading(true);
        const res = await axios.post(
          "http://localhost:3000/audio/upload/file",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        // 이 부분을 수정해서 화면에 데이터 뿌리면 될 듯 싶습니다!
        alert("파일 업로드 완료:\n" + JSON.stringify(res.data, null, 2));
      } catch (err) {
        console.error(err);
        alert("업로드 실패: " + err.message);
      } finally {
      setLoading(false); // 요청 완료 시 로딩 종료
    }
    }
  };

  // // 🎙 실시간 녹음 업로드
  // const startRecording = async () => {
  //   const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  //   const mediaRecorder = new MediaRecorder(stream);
  //   mediaRecorderRef.current = mediaRecorder;

  //   audioChunksRef.current = [];
  //   mediaRecorder.ondataavailable = (e) => {
  //     audioChunksRef.current.push(e.data);
  //   };

  //   mediaRecorder.onstop = async () => {
  //     const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
  //     const file = new File([blob], "recorded_audio.webm", {
  //       type: "audio/webm",
  //     });
  //     await uploadAudio(file, "recorded-room");
  //   };

  //   mediaRecorder.start();
  //   setRecording(true);
  // };

  // // 🎙 녹음 중지
  // const stopRecording = () => {
  //   mediaRecorderRef.current?.stop();
  //   setRecording(false);
  // };

  // // 🔁 업로드 요청 함수
  // const uploadAudio = async (file, roomId) => {
  //   const formData = new FormData();
  //   formData.append("audio", file);
  //   formData.append("roomId", roomId);

  //   try {
  //     const res = await axios.post(
  //       "http://localhost:4000/audio/upload/record",
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       },
  //     );
  //     alert("업로드 완료:\n" + JSON.stringify(res.data, null, 2));
  //   } catch (error) {
  //     console.error("업로드 처리 실패:", error);
  //     alert("업로드 실패:\n" + error.message);
  //   }
  // };

  return (
    <div style={{ position: "relative" }}>
      <h1>🎙 Whisper 테스트</h1>
      <h2>1️⃣ 녹음 업로드</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>업로드</button>

       {loading && <LoadingScreen />}

      {/* <h2>2️⃣ 실시간 녹음</h2>
      {!recording ? (
        <button onClick={startRecording}>녹음 시작</button>
      ) : (
        <button onClick={stopRecording}>녹음 중지</button>
      )} */}
    
    </div>
  );
}

export default AudioRecorder;
