import os
import shutil
import ffmpeg
from openai import OpenAI
from dotenv import load_dotenv 

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# 1. 음성 파일 인코딩 변환
def convert_to_wav(input_path: str) -> str:
    import uuid
    
    print("[파일 파이프라인 시작]", input_path)
   

    tmp_dir = os.path.join("tmp_audio")
    os.makedirs(tmp_dir, exist_ok=True)

    unique_name = str(uuid.uuid4())[:8] + ".wav"
    output_path = os.path.join(tmp_dir, unique_name)

    print("out:: ", output_path)
    print("[convert_to_wav] input exists:", os.path.exists(input_path))

    try:
        (
            ffmpeg
            .input(input_path)
            .output(output_path, format='wav', acodec='pcm_s16le', ac=1, ar='16000')
            .overwrite_output()
            .run(quiet=True)
        )
        print("ffmeg 실행 완료")
        return output_path
    except ffmpeg.Error as e:
        print("[FFmpeg 변환 오류]", e.stderr.decode())
        raise RuntimeError("오디오 변환 실패")


# 2. Whisper 전사
def transcribe_audio(file_path: str):
    file_path = os.path.normpath(file_path) # 경로 안정화
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"파일 경로가 존재하지 않습니다: {file_path}")
    
    wav_path = convert_to_wav(file_path)
    
    with open(wav_path, "rb") as f:
        response = client.audio.transcriptions.create(
            model="whisper-1",
            file=f,
            language="ko"
        )
        
    os.remove(wav_path)
    return response.text

# 2. 텍스트 chunk 나누기
def chunk_text(text: str, max_chars: int = 3000) -> list:
    import textwrap
    return textwrap.wrap(text, max_chars)

# 3. 1차 요약
def summarize_chunk(chunk: str, index: int) -> str:
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "당신은 전문 요약가입니다."},
            {"role": "user", "content": f"[부분 {index+1}] 아래 내용을 요약해 주세요:\n\n{chunk}"}
        ]
    )
    return response.choices[0].message.content.strip()

# 4. 2차 요약
def summarize_full_text(full_text: str) -> str:
    chunks = chunk_text(full_text)
    print(f"[📚] 텍스트 {len(chunks)} 조각으로 분할됨")

    summaries = []
    for i, chunk in enumerate(chunks):
        print(f"[📝] 1차 요약 중: {i+1}/{len(chunks)}")
        summaries.append(summarize_chunk(chunk, i))

    combined = "\n".join(summaries)

    print("[🧠] 2차 요약 중...")
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "당신은 전문 요약가입니다."},
            {"role": "user", "content": f"다음 내용을 3문단으로 요약해 주세요:\n\n{combined}"}
        ]
    )
    return response.choices[0].message.content.strip()

# 5. 할 일 추출
def extract_tasks(summary: str) -> str:
    prompt = f"""
다음 요약된 회의 내용을 기반으로 해야 할 작업 목록을 항목별로 정리해 주세요.
- 각 항목은 한 문장으로 간결하게 작성
- 출력은 JSON 배열 형식으로 해주세요

회의 3문단 요약:
{summary}
"""
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "당신은 할 일 추출 도우미입니다."},
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content.strip()

# 🎯 파이프라인 실행 함수
def run_pipeline(audio_path: str):
    
    
    full_text = ""
    
    transcript = transcribe_audio(audio_path)
    full_text += transcript + "\n"

    print("[🧠] 3문단 요약 추출 중...")
    summary = summarize_full_text(full_text)

    print("[📝] 할 일 목록 추출 중...")
    tasks = extract_tasks(summary)

    os.remove(audio_path)

    return {
        "transcript": full_text,
        "summary": summary,
        "tasks": tasks
    }
