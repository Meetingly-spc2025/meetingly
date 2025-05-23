from flask import Flask, request, jsonify
from pydub import AudioSegment
import os
import filePipeline, recordPipeline
from dotenv import load_dotenv  # ✅ 추가


load_dotenv(dotenv_path="../.env")  # 또는 "server/.env"로 경로 조정


app = Flask(__name__)
UPLOAD_DIR = "../server/uploads"
MERGED_DIR = "./audio"

# 일반 파일 업로드
@app.route("/process-file", methods=["POST"])
def process_file():
    try:
        data = request.json
        file_path = data.get("filePath")
        print("파일 경로 :: ", file_path)

        if not file_path or not os.path.exists(file_path):
            return jsonify({"error": "유효한 filePath가 없습니다."}), 400

        try:
            result = filePipeline.run_pipeline(file_path)
            return jsonify(result)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    except Exception as e:
        print("[오류] /process-file 처리 중 예외 발생:", str(e))
        return jsonify({"error": "서버 내부 오류", "details": str(e)}), 500


# 회의 녹음
# @app.route("/process-room", methods=["POST"])
# def process_audio():
    data = request.get_json()
    room_id = data["roomId"]
    room_upload_path = os.path.join(UPLOAD_DIR, room_id)
    room_audio_dir = os.path.join(MERGED_DIR, room_id)

    os.makedirs(room_audio_dir, exist_ok=True)
    merged_path = os.path.join(room_audio_dir, "merged.wav")

    # 병합
    combined = AudioSegment.empty()
    for file_name in sorted(os.listdir(room_upload_path)):
        if file_name.endswith(".webm") or file_name.endswith(".m4a"):
            file_path = os.path.join(room_upload_path, file_name)
            audio = AudioSegment.from_file(file_path)
            combined += audio
    combined.export(merged_path, format="wav")

    # 파이프라인 실행
    result = recordPipeline.run_pipeline(merged_path, room_id)

    return jsonify(result)

if __name__ == "__main__":
    port = int(os.getenv("PYTHON_PORT"))
    app.run(port=port, debug=True)
