import { useState } from "react";
import axios from "axios";
import TextBlock from "./TextBlock";
import "../../styles/File/FileUploadModal.css";

export default function FileUploadModal({ onClose }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!file) return alert("파일을 선택해주세요.");

    const formData = new FormData();
    formData.append("audio", file);

    setLoading(true);
    try {
      const res = await axios.post(
        "http://127.0.0.1:3000/api/saveSummary/upload/file",
        formData,
      );
      setResult(res.data.result);
      console.log("결과값: ", res.data.result);
    } catch (error) {
      console.error(error);
      alert("요약에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>파일 업로드 및 요약</h2>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <div style={{ marginTop: "10px" }}>
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "요약 중..." : "요약하기"}
          </button>
          <button onClick={onClose} style={{ marginLeft: "10px" }}>
            닫기
          </button>
        </div>

        {result && (
          <div className="result-section">
            <TextBlock label="📝 전사 결과" text={result.transcript} />
            <TextBlock label="🧠 요약 결과" text={result.summary} />
            <TextBlock label="✅ 할 일 목록" text={result.tasks} />
          </div>
        )}
      </div>
    </div>
  );
}
