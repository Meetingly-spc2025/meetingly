import { useRef, useState } from "react";
import axios from "axios";

const useMediaRecorder = ({ myStream, roomId, isCreator }) => {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [recording, setRecording] = useState(false);

  const startRecording = () => {
    if (!myStream) {
      alert("마이크 스트림을 찾을 수 없습니다!");
      return;
    }
    const audioTracks = myStream.getAudioTracks();
    if (!audioTracks.length) {
      alert("마이크가 없습니다.");
      return;
    }
    const audioStream = new MediaStream();
    audioTracks.forEach(track => audioStream.addTrack(track));
    const mediaRecorder = new window.MediaRecorder(audioStream);

    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const file = new File([blob], `audio_${roomId}_${Date.now()}.webm`, {
        type: "audio/webm",
      });
      await uploadAudio(file, roomId);
      audioChunksRef.current = [];
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const port = import.meta.env.VITE_SERVER_PORT;

  const uploadAudio = async (file, roomId) => {
    const formData = new FormData();
    formData.append("audio", file);
    formData.append("roomId", roomId);
    formData.append("isCreator", isCreator);

    try {
      const res = await axios.post(
        `http://localhost:${port}/api/saveSummary/upload/record`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      console.log("업로드 완료:\n" + JSON.stringify(res.data, null, 2));
    } catch (error) {
      console.error("업로드 처리 실패:", error);
    }
  };

  return { recording, startRecording, stopRecording };
};

export default useMediaRecorder;