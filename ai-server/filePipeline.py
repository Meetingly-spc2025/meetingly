import textwrap
import os
import ffmpeg
from openai import OpenAI
from dotenv import load_dotenv 
from pydub import AudioSegment
import tiktoken
import shutil

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# 1. 음성 파일 인코딩 변환
def convert_to_wav(input_path):
    import uuid
    
    print("[파일 파이프라인 시작]", input_path)
   
    tmp_dir = os.path.join("tmp_audio")
    os.makedirs(tmp_dir, exist_ok=True)

    unique_name = str(uuid.uuid4())[:8] + ".wav"
    output_path = os.path.join(tmp_dir, unique_name)

    print("convert_to_wav:: ", os.path.exists(input_path))

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
    
# 음성 분할
def split_audio(input_path, chunk_length_ms=10 * 60 * 1000):  # 10분 단위로 자를 것
    audio = AudioSegment.from_file(input_path)
    chunks = []
    total_chunks = len(audio) // chunk_length_ms + int(len(audio) % chunk_length_ms != 0) # 분할된 청크 = 총 오디오 길이 / 10분 + (10분 미만의 나머지)
    
    base = os.path.splitext(os.path.basename(input_path))[0]
    output_dir = os.path.join("tmp_audio", base)
    os.makedirs(output_dir, exist_ok=True)

    # 오디오를 총 몇 조각으로 나눌지 계산 후에 각 조각 자르고 저장
    for i in range(total_chunks):
        start = i * chunk_length_ms
        end = start + chunk_length_ms
        chunk = audio[start:end]
        chunk_path = os.path.join(output_dir, f"{base}_part{i+1}.wav")
        chunk.export(chunk_path, format="wav")
        chunks.append(chunk_path)

    return chunks


# 2. Whisper
def transcribe_audio(file_path):
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
        
    # os.remove(wav_path)
    return response.text, wav_path

# 3. 텍스트 chunk 나누기
def chunk_text(text, max_chars=3000):
    return textwrap.wrap(text, max_chars)

# 4. 1차 요약
def summarize_chunk(chunk, index):
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "당신은 전문 요약가입니다."},
            {"role": "user", "content": f"[{index+1}] 아래 내용을 요약해 주세요:\n\n{chunk}"}
        ]
    )
    return response.choices[0].message.content.strip()

# 5. 2차 요약
def summarize_full_text(full_text):
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

# 6. 할 일 추출
def extract_tasks(summary):
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

# 토큰 수 계산 함수
def get_token_count(text, model="gpt-4"):
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))

# 🎯 파이프라인 실행 함수
def run_pipeline(audio_path, token_limit=120000):
    print("[🔧] 오디오 분할 중...")
    chunk_paths = split_audio(audio_path)

    wav_files_to_delete = []

    full_text = ""
    for idx, path in enumerate(chunk_paths):
        print(f"[🎙️] Whisper 변환 중... ({idx+1}/{len(chunk_paths)})")
        transcript, wav_path = transcribe_audio(path)
        full_text += transcript + "\n"
        wav_files_to_delete.append(wav_path)

    
    total_tokens = get_token_count(full_text, model="gpt-4")
    print(f"[📏] 전체 텍스트 토큰 수: {total_tokens} tokens")

    if total_tokens > token_limit:
        raise ValueError(
            f"음성 파일이 너무 깁니다. 현재 {total_tokens} tokens로 제한 {token_limit} tokens을 초과했습니다.\n"
            f"오디오를 더 작은 조각으로 나누거나 일부만 처리해 주세요."
        )

    print("[🧠] 3문단 요약 추출 중...")
    summary = summarize_full_text(full_text)

    print("[📝] 할 일 목록 추출 중...")
    tasks = extract_tasks(summary)

    # 파일 삭제 
    try:
        os.remove(audio_path)  # 업로드된 원본 파일
        for path in wav_files_to_delete:
            os.remove(path)
        shutil.rmtree(os.path.join("tmp_audio", os.path.splitext(os.path.basename(audio_path))[0]))
        print("🧹 모든 임시 파일 정리 완료")
    except Exception as e:
        print(f"[⚠️] 임시 파일 삭제 중 오류: {e}")

    return {
        "transcript": full_text,
        "summary": summary,
        "tasks": tasks
    }
