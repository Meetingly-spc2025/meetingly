import os
import uuid
import shutil
from dotenv import load_dotenv
from openai import OpenAI
from pydub import AudioSegment
import ffmpeg
import tiktoken

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# 음성 → wav 변환
def convert_to_wav(input_path):
    tmp_dir = "tmp_audio"
    os.makedirs(tmp_dir, exist_ok=True)
    output_path = os.path.join(tmp_dir, f"{uuid.uuid4().hex[:8]}.wav")

    try:
        ffmpeg.input(input_path).output(
            output_path, format='wav', acodec='pcm_s16le', ac=1, ar='16000'
        ).overwrite_output().run(quiet=True)
        return output_path
    except ffmpeg.Error as e:
        raise RuntimeError(f"FFmpeg 변환 실패: {e.stderr.decode()}")

# Whisper 변환
def transcribe_audio(wav_path):
    if not os.path.exists(wav_path):
        raise FileNotFoundError(f"파일 없음: {wav_path}")

    with open(wav_path, "rb") as f:
        response = client.audio.transcriptions.create(
            model="whisper-1",
            file=f,
            language="ko"
        )
    return response.text

# 토큰 계산
def get_token_count(text, model="gpt-4"):
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))

# 단일 요약
def summarize_text(full_text):
    prompt = """
다음 {full_text}의 내용은 회의록입니다. 회의 내용을 총 3문단으로 너무 길지 않도록 요약해 주세요. 
- 한 문단마다 두 번씩 줄 바꿈을 해주고, 요약의 내용은 감정을 뺀 정보 위주로 해주세요. 
- 대부분 비즈니스 용어, 일에 대한 내용이 대부분임을 참고해서 요약해주세요.

\n\n
"""

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "당신은 회의록 전문 요약가입니다."},
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content.strip()

# 할 일 추출
def extract_tasks(summary):
    prompt = f"""
    회의 3문단 요약:
    {summary}

    다음 요약된 회의 내용을 기반으로 회의 종료 후, 해야 할 작업 목록을 항목별로 정리해 주세요.
    - 각 항목은 한 문장으로 간결하게 작성.
    - 출력은 JSON 배열 형식으로 해주세요.
    - 만약 추출할 할 일이 없다면 "할 일이 없음"를 반환해주세요.
"""
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "당신은 회의에 대한 할 일 추출 도우미입니다."},
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content.strip()

# 최종 파이프라인
def run_pipeline(audio_path, char_limit=5000):
    print("[🔧] Whisper 처리를 위해 wav 변환 중...")
    wav_path = convert_to_wav(audio_path)

    print("[🎙️] Whisper로 텍스트 변환 중...")
    transcript = transcribe_audio(wav_path)

    total_chars = len(transcript)
    print(f"[📏] 텍스트 길이: {total_chars}자")

    summary = None
    tasks = None

    if total_chars > char_limit:
        print(f"[⚠️] 글자 수 {total_chars}자 > {char_limit}자 → 요약 및 할 일 추출 생략")
    else:
        print("[🧠] 요약 중...")
        summary = summarize_text(transcript)

        print("[📝] 할 일 추출 중...")
        tasks = extract_tasks(summary)

    # 임시 파일 정리
    try:
        os.remove(audio_path)
        os.remove(wav_path)
        print("🧹 임시 파일 정리 완료")
    except Exception as e:
        print(f"[⚠️] 파일 삭제 오류: {e}")

    return {
        "transcript": transcript,
        "summary": summary,
        "tasks": tasks
    }
