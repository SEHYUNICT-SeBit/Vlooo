# ⚠️ Windows 환경 - 인코딩 규칙

## 🚫 절대 금지: 이모지 및 유니코드 문자 사용

**Windows CP949 인코딩 환경에서는 이모지 및 특수 유니코드 문자를 사용할 수 없습니다.**

### ❌ 사용 금지

```python
# 절대 사용 금지 - UnicodeEncodeError 발생!
print("✅ 성공")
print("❌ 실패")
print("⚠️ 경고")
print("🔄 재시작")
print("📄 파일")
print("🎬 비디오")
```

### ✅ 올바른 사용법

```python
# ASCII 문자만 사용
print("OK - 성공")
print("ERROR - 실패")
print("WARN - 경고")
print("INFO - 재시작")
print("FILE - 파일")
print("VIDEO - 비디오")
```

## 규칙 적용 대상

### 1. Backend Python 코드 (모든 stdout 출력)

- `backend/main.py`
- `backend/app/routes/*.py`
- `backend/app/services/*.py`

**모든 `print()` 문은 ASCII만 사용해야 함**

예시:
```python
# ❌ 금지
timestamp = time.strftime("%H:%M:%S")
print(f"[{timestamp}] [MAJOR] [OLLAMA] ✅ Ollama started successfully")

# ✅ 허용
timestamp = time.strftime("%H:%M:%S")
print(f"[{timestamp}] [MAJOR] [OLLAMA] OK - Ollama started successfully")
```

### 2. 로그 메시지 포맷

**표준 로그 형식 준수:**
```
[HH:MM:SS] [LEVEL] [STEP] message

예시:
[18:30:15] [MAJOR] [OLLAMA] OK - Ollama is already running
[18:30:16] [MINOR] [PPT] START - filename=presentation.pptx
[18:30:20] [MAJOR] [SCRIPT] DONE - duration=884s
```

**Level 키워드:**
- `MAJOR` - 중요한 성공 이벤트
- `MINOR` - 일반 정보
- `CRITICAL` - 치명적 오류
- `WARNING` - 경고

**Step 키워드 (ASCII만):**
- `OK`, `DONE`, `START`, `ERROR`, `WARN`
- `CACHE_HIT`, `SLIDE_1`, `SLIDE_2`, ...

### 3. 예외 사항

**GUI 프로그램 (`backend/monitor.py`)의 Tkinter 위젯 텍스트는 허용**

```python
# ✅ GUI 창 제목은 OK (화면에 직접 표시)
self.root.title("🎬 Vlooo 백엔드 모니터")

# ✅ 버튼 라벨도 OK
tk.Button(text="🔄 재시작")

# ⚠️ 하지만 로그 메시지는 여전히 ASCII만!
self.log_message('MAJOR', 'BACKEND', 'OK - 백엔드 시작됨')  # ✅
self.log_message('MAJOR', 'BACKEND', '✅ 백엔드 시작됨')  # ❌
```

## 오류 증상

### UnicodeEncodeError

```
UnicodeEncodeError: 'cp949' codec can't encode character '\U0001f504' in position 28: illegal multibyte sequence
```

**발생 원인:** Windows 콘솔이 CP949 인코딩을 사용하므로 이모지를 처리할 수 없음

**해결 방법:** 모든 이모지를 ASCII 문자로 교체

## 점검 체크리스트

새로운 코드를 작성할 때:

- [ ] `print()` 문에 이모지가 없는가?
- [ ] 로그 메시지가 ASCII만 사용하는가?
- [ ] 타임스탬프 포맷이 `[HH:MM:SS] [LEVEL] [STEP]`인가?
- [ ] 에러 메시지가 ASCII만 사용하는가?

## 이모지 → ASCII 변환표

| 이모지 | ASCII 대체 | 설명 |
|--------|-----------|------|
| ✅ | `OK -` | 성공 |
| ❌ | `ERROR -` | 실패 |
| ⚠️ | `WARN -` | 경고 |
| 🔄 | `INFO -` | 재시작/로딩 |
| 📄 | `FILE -` | 파일 |
| 🎬 | `VIDEO -` | 비디오 |
| 🎤 | `AUDIO -` | 오디오 |
| 🚀 | `START -` | 시작 |
| 🛑 | `STOP -` | 중지 |

## 테스트 방법

```powershell
# PowerShell에서 백엔드 직접 실행하여 인코딩 오류 확인
cd C:\vibe\Vlooo\backend
python main.py

# 로그에 UnicodeEncodeError가 없어야 함
```

---

**마지막 업데이트:** 2026-02-11  
**이 규칙을 절대 잊지 마세요!** 🙏
