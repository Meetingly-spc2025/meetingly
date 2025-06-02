import os
import shutil
import ffmpeg
from openai import OpenAI, OpenAIError, BadRequestError
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# segment 디렉토리 경로는 roomId 별로 설정
SEGMENT_BASE_DIR = "segments"

# 1. 오디오 분할
def split_audio(input_path, room_id, segment_length=600):
    segment_dir = os.path.join(SEGMENT_BASE_DIR, room_id)
    os.makedirs(segment_dir, exist_ok=True)
    output_pattern = os.path.join(segment_dir, "part_%03d.mp3")
    try:
        ffmpeg.input(input_path).output(
            output_pattern,
            f="segment",
            segment_time=segment_length,
            c="libmp3lame",
            ar=44100,
            ac=1,
            map="0",
            reset_timestamps=1
        ).run(overwrite_output=True)
        print(f"오디오 분할 완료: {segment_dir}")
    except ffmpeg.Error as e:
        print("오디오 분할 실패:", e.stderr.decode())
    return segment_dir

# 2. Whisper 전사
def transcribe_audio(path):
    try:
        with open(path, "rb") as f:
            response = client.audio.transcriptions.create(
                model="whisper-1",
                file=f,
                language="ko",
                response_format="text",
                temperature=0.0
            )
            return response
    except Exception as e:
        print(f"전사 실패: {path}, 에러: {e}")
        return ""

# 3. 텍스트 chunk 나누기
def chunk_text(text, max_chars = 5000):
    import textwrap
    return textwrap.wrap(text, max_chars)

# 4. 1차 요약
def summarize_chunk(chunk, index):
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "당신은 전문 요약가입니다."},
                {"role": "user", "content": f"[부분 {index+1}] 아래 내용을 요약해 주세요:\n\n{chunk}"}
            ]
        )
        return response.choices[0].message.content.strip()
    except BadRequestError as e:
        print(f"요약 실패 (토큰 초과): {e}")
    except Exception as e:
        print(f"1차 요약 실패: {e}")
    return ""

# 5. 2차 요약 (전체 텍스트 병합 및 요약)
def summarize_full_text(full_text):
    if len(full_text) < 5000:
        print("텍스트가 짧아, 바로 3문단 요약 실행")
        try:
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "당신은 전문 요약가입니다."},
                    {"role": "user", "content": f"다음 내용을 <br>로 나눈3문단으로 요약해 주세요. 요약의 내용은 감정을 뺀 정보 위주로 해주세요. :\n\n{full_text}"}
                ]
            )
            return response.choices[0].message.content.strip()
        except BadRequestError as e:
            print(f"요약 실패 (토큰 초과): {e}")
        except Exception as e:
            print(f"최종 요약 실패: {e}")
        return ""
    else:
        print("텍스트가 길어, chunk 분할 후 2단계 요약 실행")
        chunks = chunk_text(full_text)
        summaries = []
        for i, chunk in enumerate(chunks):
            print(f"1차 요약 중: {i+1}/{len(chunks)}")
            summaries.append(summarize_chunk(chunk, i))
        combined = "\n".join(summaries)

        try:
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "당신은 전문 요약가입니다."},
                    {"role": "user", "content": f"다음 내용을 3문단으로 요약해 주세요:\n\n{combined}"}
                ]
            )
            return response.choices[0].message.content.strip()
        except BadRequestError as e:
            print(f"최종 요약 실패 (토큰 초과): {e}")
        except Exception as e:
            print(f"2차 요약 실패: {e}")
        return ""

# 6. 주요 논의 사항 추출
def summaries_discussion(summary):
    prompt = f"""
다음 요약된 회의 내용을 기반으로 주요 논의 주제에 대해서 20글자 이내로 간결하게 정리해주세요.
논의 주제가 여러가지라면 하나의 논의 주제마다 \n\n 을 넣어서 구분해주세요.

회의 3문단 요약:
{summary}
"""
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "당신은 주요 논의 사항을 정리하는 도우미입니다."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content.strip()
    except BadRequestError as e:
        print(f"논의 사항 추출 실패 (토큰 초과): {e}")
    except Exception as e:
        print(f"논의 주제 추출 실패: {e}")
    return ""

# 7. 할 일 추출
def extract_tasks(summary: str) -> str:
    prompt = f"""
다음 요약된 회의 내용을 기반으로 해야 할 작업 목록을 항목별로 정리해 주세요.
- 각 항목은 한 문장으로 간결하게 작성.
- 출력은 JSON 배열 형식으로 해주세요.
- 만약 추출할 할 일이 없다면 "false"를 반환해주세요.

회의 3문단 요약:
{summary}
"""
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "당신은 할 일 추출 도우미입니다."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content.strip()
    except BadRequestError as e:
        print(f"할 일 추출 실패 (토큰 초과): {e}")
    except Exception as e:
        print(f"할 일 추출 실패: {e}")
    return "false"

# 8. 임시 파일 정리
def cleanup_segments(room_id: str):
    segment_dir = os.path.join(SEGMENT_BASE_DIR, room_id)
    if os.path.exists(segment_dir):
        shutil.rmtree(segment_dir)
        print(f"임시 오디오 조각 삭제 완료: {segment_dir}")

# 파이프라인 실행 함수
def run_pipeline(audio_path: str, room_id: str):
    print("오디오 분할 시작...")
    segment_dir = split_audio(audio_path, room_id)

    full_text = ""
    segments = sorted([os.path.join(segment_dir, f) for f in os.listdir(segment_dir)])
    for i, segment in enumerate(segments):
        print(f"텍스트 전사 중: ({i+1}/{len(segments)})")
        transcript = transcribe_audio(segment)
        full_text += transcript + "\n"

    print("3문단 요약 추출 중...")
    summary = summarize_full_text(full_text)

    print("주요 논의 사항 추출 중...")
    discussion = summaries_discussion(summary)

    print("할 일 목록 추출 중...")
    tasks = extract_tasks(summary)

    cleanup_segments(room_id)

    return {
        "transcript": full_text,
        "summary": summary,
        "tasks": tasks,
        "discussion": discussion,
        "roomId": room_id
    }
