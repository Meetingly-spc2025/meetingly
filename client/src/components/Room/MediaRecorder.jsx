import { useRef, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const useMediaRecorder = ({ myStream, roomId, isCreator }) => {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [recording, setRecording] = useState(false);

  // 오디오 녹음 시작
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
    audioTracks.forEach((track) => audioStream.addTrack(track));
    const mediaRecorder = new window.MediaRecorder(audioStream);

    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunksRef.current.push(event.data);
    };

    // 녹음 종료 및 자동 서버 업로드
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
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      console.log("업로드 완료:\n" + JSON.stringify(res.data, null, 2));
      toast.success("AI 회의록 녹음이 완료되었습니다.");
    } catch (error) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("서버 오류가 발생했습니다.");
      }
    }
  };

  return { recording, startRecording, stopRecording };
};

export default useMediaRecorder;
