from flask import Flask, request, jsonify
from pydub import AudioSegment
import os
import ffmpeg
import shutil
import filePipeline, recordPipeline
from dotenv import load_dotenv 


load_dotenv(dotenv_path="../.env")


app = Flask(__name__)
UPLOAD_DIR = "../server/src/uploads"
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
@app.route("/process-room", methods=["POST"])
def process_audio():
    data = request.get_json()
    room_id = data["roomId"]
    room_upload_path = os.path.join(UPLOAD_DIR, room_id)
    room_audio_dir = os.path.join(MERGED_DIR, room_id)
    os.makedirs(room_audio_dir, exist_ok=True) 

    converted_dir = os.path.join(room_audio_dir, "converted")
    os.makedirs(converted_dir, exist_ok=True)

    # 1. ffmpeg 변환 (.webm, .m4a -> .wav)
    audio_files = sorted([
        f for f in os.listdir(room_upload_path)
        if f.endswith((".webm", ".m4a", ".wav"))
    ])
    if not audio_files:
        return jsonify({"error": "오디오 파일이 존재하지 않습니다."}), 400

    converted_paths = []
    for i, file_name in enumerate(audio_files):
        original_path = os.path.join(room_upload_path, file_name)
        converted_path = os.path.join(converted_dir, f"audio_{i:03}.wav")

        try:
            ffmpeg.input(original_path).output(
                converted_path,
                format='wav',
                ar='44100',
                ac='1'
            ).run(quiet=True, overwrite_output=True)
            converted_paths.append(converted_path)
        except ffmpeg.Error as e:
            print(f"ffmpeg 변환 실패: {file_name}")
            return jsonify({"error": f"{file_name} 변환 실패: {e.stderr.decode()}"}), 500

    # 2. 믹싱
    audio_segments = [AudioSegment.from_wav(p) for p in converted_paths]
    min_len = min(len(a) for a in audio_segments)
    audio_segments = [a[:min_len] for a in audio_segments]

    mixed = audio_segments[0]
    for seg in audio_segments[1:]:
        mixed = mixed.overlay(seg)

    # 3. 저장
    merged_path = os.path.join(room_audio_dir, "merged.wav")
    mixed.export(merged_path, format="wav")

    # 3.5 오디오 길이 검사 (1분 미만일 때 종료)
    merged_audio = AudioSegment.from_wav(merged_path)
    duration_ms = len(merged_audio)
    if duration_ms < 60_000:
        # 임시파일 정리
        try:
            shutil.rmtree(converted_dir)
            os.remove(merged_path)
        except Exception as e:
            print(f"임시파일 정리 실패: {e}")

        return jsonify({
            "error": "녹음 시간이 1분 미만입니다. 더 긴 회의를 녹음해 주세요."
        }), 400

    # 4. 파이프라인 실행
    result = recordPipeline.run_pipeline(merged_path, room_id)

    # 5. 임시파일 삭제
    try:
        shutil.rmtree(converted_dir)
        os.remove(merged_path)
    except Exception as e:
        print(f"임시파일 삭제 실패: {e}")

    return jsonify(result)

if __name__ == "__main__":
    port = os.getenv("PYTHON_PORT")
    app.run(port=port, debug=True)

