"""
Vlooo 백엔드 모니터링 GUI 도구 - 단일 윈도우 구조
다크모드 스타일 + 백엔드 제어 + 실시간 로그
"""

import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import subprocess
import threading
import requests
import time
import os
import sys
from datetime import datetime
from pathlib import Path

# 색상 정의 (다크모드)
COLORS = {
    'bg_main': '#1e1e1e',      # 메인 배경 (진검은)
    'bg_panel': '#252526',     # 패널 배경 (조금 밝은 검은)
    'bg_log': '#1e1e1e',       # 로그창 배경
    'text_main': '#e0e0e0',    # 메인 텍스트 (밝은 회색)
    'text_dim': '#808080',     # 어두운 텍스트
    'border': '#3e3e42',       # 테두리
    'success': '#4ec9b0',      # 성공 (청록색)
    'warning': '#dcdcaa',      # 경고 (노란색)
    'error': '#f48771',        # 에러 (빨간색)
    'info': '#569cd6',         # 정보 (파란색)
    'button_bg': '#1c1c1c',    # 버튼 배경
    'button_hover': '#2d2d30', # 버튼 hover
}

# 로그 레벨별 색상
LOG_COLORS = {
    'MAJOR': COLORS['success'],
    'MINOR': COLORS['info'],
    'CRITICAL': COLORS['error'],
    'WARNING': COLORS['warning'],
}

class VlooMonitor:
    def __init__(self, root):
        self.root = root
        self.root.title("🎬 Vlooo 백엔드 모니터")
        self.root.geometry("1000x700")
        self.root.configure(bg=COLORS['bg_main'])
        
        self.backend_process = None
        self.is_running = False
        self.api_url = "http://localhost:8001"
        self.is_local = True
        self.project_id = None
        self.project_monitoring = False
        
        # PyInstaller exe와 일반 python 실행 모두 대응
        if getattr(sys, 'frozen', False):
            base_dir = Path(sys.executable).parent.parent
        else:
            base_dir = Path(__file__).parent.parent
        self.backend_dir = base_dir / "backend"
        
        self.setup_styles()
        self.show_selection_screen()  # 처음에 선택 화면 표시
    
    def setup_styles(self):
        """다크모드 스타일 설정"""
        style = ttk.Style()
        style.theme_use('clam')
        
        # 기본 스타일
        style.configure('TFrame', background=COLORS['bg_main'], relief='flat')
        style.configure('TLabel', background=COLORS['bg_main'], foreground=COLORS['text_main'])
        style.configure('TButton', background=COLORS['button_bg'], foreground=COLORS['text_main'])
        style.map('TButton',
                 background=[('active', COLORS['button_hover']), ('pressed', COLORS['border'])])
        
        # 커스텀 스타일
        style.configure('Title.TLabel', font=('Segoe UI', 16, 'bold'), foreground=COLORS['success'])
        style.configure('Status.TLabel', font=('Segoe UI', 10), foreground=COLORS['text_dim'])
        style.configure('Mono.TLabel', font=('Courier New', 9), foreground=COLORS['text_main'])
        
    def clear_window(self):
        """윈도우 모든 위젯 삭제"""
        for widget in self.root.winfo_children():
            widget.destroy()
        
    def show_selection_screen(self):
        """백엔드 선택 화면"""
        self.project_id = None
        self.project_monitoring = False
        self.clear_window()
        
        # 타이틀
        title = tk.Label(
            self.root,
            text="🎬 Vlooo 백엔드 모니터링 대상 선택",
            fg=COLORS['success'],
            bg=COLORS['bg_main'],
            font=('Segoe UI', 16, 'bold'),
            pady=40
        )
        title.pack()
        
        # 설명
        desc = tk.Label(
            self.root,
            text="어떤 백엔드를 모니터링하시겠습니까?",
            fg=COLORS['text_dim'],
            bg=COLORS['bg_main'],
            font=('Segoe UI', 12),
            pady=20
        )
        desc.pack()
        
        # 버튼 프레임
        button_frame = tk.Frame(self.root, bg=COLORS['bg_main'])
        button_frame.pack(pady=40, fill='both', expand=True, padx=60)
        
        # 로컬 버튼
        local_btn = tk.Button(
            button_frame,
            text="💻 로컬 백엔드\n(c:\\vibe\\Vlooo\\backend)",
            command=self.select_local,
            bg=COLORS['success'],
            fg='black',
            font=('Segoe UI', 12, 'bold'),
            padx=30,
            pady=40,
            relief='flat',
            cursor='hand2'
        )
        local_btn.pack(side='left', fill='both', expand=True, padx=20)
        
        # 원격 버튼
        remote_btn = tk.Button(
            button_frame,
            text="🌐 원격 서버\n(IP/도메인 입력)",
            command=self.show_remote_screen,
            bg=COLORS['info'],
            fg='black',
            font=('Segoe UI', 12, 'bold'),
            padx=30,
            pady=40,
            relief='flat',
            cursor='hand2'
        )
        remote_btn.pack(side='left', fill='both', expand=True, padx=20)
        
        # 하단 설명
        footer = tk.Label(
            self.root,
            text="로컬: 이 컴퓨터에서 백엔드를 제어할 수 있습니다\n원격: 다른 서버의 상태만 모니터링합니다",
            fg=COLORS['text_dim'],
            bg=COLORS['bg_main'],
            font=('Segoe UI', 10),
            justify='center',
            pady=30
        )
        footer.pack(side='bottom', fill='x')

    def show_remote_screen(self):
        """원격 서버 설정 화면"""
        self.clear_window()
        
        # 타이틀
        title = tk.Label(
            self.root,
            text="🌐 원격 서버 설정",
            fg=COLORS['success'],
            bg=COLORS['bg_main'],
            font=('Segoe UI', 16, 'bold'),
            pady=40
        )
        title.pack()
        
        # 설명
        desc = tk.Label(
            self.root,
            text="원격 서버의 주소를 입력하세요",
            fg=COLORS['text_dim'],
            bg=COLORS['bg_main'],
            font=('Segoe UI', 12),
            pady=10
        )
        desc.pack()
        
        example = tk.Label(
            self.root,
            text="예: http://192.168.1.100:8001\nhttp://your-server.com:8001",
            fg=COLORS['text_dim'],
            bg=COLORS['bg_main'],
            font=('Segoe UI', 10),
            justify='center',
            pady=20
        )
        example.pack()
        
        # 입력 프레임
        input_frame = tk.Frame(self.root, bg=COLORS['bg_main'])
        input_frame.pack(pady=30, padx=60, fill='x')
        
        input_label = tk.Label(
            input_frame,
            text="서버 URL:",
            fg=COLORS['text_main'],
            bg=COLORS['bg_main'],
            font=('Segoe UI', 11),
            width=15,
            anchor='e'
        )
        input_label.pack(side='left', padx=10)
        
        url_entry = tk.Entry(
            input_frame,
            font=('Courier New', 11),
            bg=COLORS['button_bg'],
            fg=COLORS['text_main'],
            insertbackground=COLORS['text_main'],
            width=40
        )
        url_entry.pack(side='left', fill='x', expand=True, padx=10)
        url_entry.insert(0, "http://localhost:8001")
        url_entry.select_range(0, tk.END)
        url_entry.focus()
        
        # 버튼 프레임
        button_frame = tk.Frame(self.root, bg=COLORS['bg_main'])
        button_frame.pack(pady=40, fill='x', padx=60)
        
        def apply_remote():
            url = url_entry.get().strip()
            if not url:
                messagebox.showerror("오류", "서버 URL을 입력하세요.")
                url_entry.focus()
                return
            if not url.startswith('http://') and not url.startswith('https://'):
                url = 'http://' + url
            
            self.is_local = False
            self.api_url = url
            self.show_main_screen()
        
        ok_btn = tk.Button(
            button_frame,
            text="✅ 확인",
            command=apply_remote,
            bg=COLORS['success'],
            fg='black',
            font=('Segoe UI', 11, 'bold'),
            padx=30,
            pady=10,
            relief='flat',
            cursor='hand2'
        )
        ok_btn.pack(side='left', padx=10, fill='x', expand=True)
        
        back_btn = tk.Button(
            button_frame,
            text="⬅️  뒤로",
            command=self.show_selection_screen,
            bg=COLORS['warning'],
            fg='black',
            font=('Segoe UI', 11, 'bold'),
            padx=30,
            pady=10,
            relief='flat',
            cursor='hand2'
        )
        back_btn.pack(side='left', padx=10, fill='x', expand=True)
        
        url_entry.bind('<Return>', lambda e: apply_remote())

    def select_local(self):
        """로컬 백엔드 선택"""
        self.is_local = True
        self.api_url = "http://localhost:8001"
        self.show_main_screen()
    
    def show_remote_input(self):
        """원격 서버 URL 입력 화면"""
        self.clear_window()
        
        # 타이틀
        title = tk.Label(
            self.root,
            text="🌐 원격 서버 설정",
            fg=COLORS['success'],
            bg=COLORS['bg_main'],
            font=('Segoe UI', 16, 'bold'),
            pady=40
        )
        title.pack()
        
        # 설명
        desc = tk.Label(
            self.root,
            text="원격 서버의 주소를 입력하세요",
            fg=COLORS['text_dim'],
            bg=COLORS['bg_main'],
            font=('Segoe UI', 12),
            pady=10
        )
        desc.pack()
        
        example = tk.Label(
            self.root,
            text="예: http://192.168.1.100:8001\nhttp://your-server.com:8001",
            fg=COLORS['text_dim'],
            bg=COLORS['bg_main'],
            font=('Segoe UI', 10),
            justify='center',
            pady=20
        )
        example.pack()
        
        # 입력 프레임
        input_frame = tk.Frame(self.root, bg=COLORS['bg_main'])
        input_frame.pack(pady=30, padx=60, fill='x')
        
        input_label = tk.Label(
            input_frame,
            text="서버 URL:",
            fg=COLORS['text_main'],
            bg=COLORS['bg_main'],
            font=('Segoe UI', 11),
            width=15,
            anchor='e'
        )
        input_label.pack(side='left', padx=10)
        
        url_entry = tk.Entry(
            input_frame,
            font=('Courier New', 11),
            bg=COLORS['button_bg'],
            fg=COLORS['text_main'],
            insertbackground=COLORS['text_main'],
            width=40
        )
        url_entry.pack(side='left', fill='x', expand=True, padx=10)
        url_entry.insert(0, "http://localhost:8001")
        url_entry.select_range(0, tk.END)
        url_entry.focus()
        
        # 버튼 프레임
        button_frame = tk.Frame(self.root, bg=COLORS['bg_main'])
        button_frame.pack(pady=40, fill='x', padx=60)
        
        def apply_remote():
            url = url_entry.get().strip()
            if not url:
                messagebox.showerror("오류", "서버 URL을 입력하세요.")
                url_entry.focus()
                return
            if not url.startswith('http://') and not url.startswith('https://'):
                url = 'http://' + url
            
            self.is_local = False
            self.api_url = url
            self.show_main_screen()
        
        ok_btn = tk.Button(
            button_frame,
            text="✅ 확인",
            command=apply_remote,
            bg=COLORS['success'],
            fg='black',
            font=('Segoe UI', 11, 'bold'),
            padx=30,
            pady=10,
            relief='flat',
            cursor='hand2'
        )
        ok_btn.pack(side='left', padx=10, fill='x', expand=True)
        
        back_btn = tk.Button(
            button_frame,
            text="⬅️  뒤로",
            command=self.show_selection_screen,
            bg=COLORS['warning'],
            fg='black',
            font=('Segoe UI', 11, 'bold'),
            padx=30,
            pady=10,
            relief='flat',
            cursor='hand2'
        )
        back_btn.pack(side='left', padx=10, fill='x', expand=True)
        
        url_entry.bind('<Return>', lambda e: apply_remote())
        
    def create_widgets(self):
        """위젯 생성 (메인 UI) - 뒤로 가기 포함"""
        self.clear_window()
        
        # 1. 헤더 패널
        header = ttk.Frame(self.root)
        header.pack(side='top', fill='x', padx=10, pady=10)
        
        # 모드 표시 텍스트
        mode_text = "💻 로컬 백엔드" if self.is_local else f"🌐 원격 서버"
        api_text = "(로컬 제어)" if self.is_local else "(모니터링만 가능)"
        
        title = ttk.Label(
            header,
            text=f"🎬 Vlooo 백엔드 모니터 - {mode_text} {api_text}",
            style='Title.TLabel'
        )
        title.pack(side='left', padx=10)
        
        # 뒤로 가기 버튼
        back_btn = tk.Button(
            header,
            text="⬅️  백엔드 변경",
            command=self.show_selection_screen,
            bg=COLORS['warning'],
            fg='black',
            font=('Segoe UI', 9, 'bold'),
            padx=10,
            pady=5,
            relief='flat',
            cursor='hand2'
        )
        back_btn.pack(side='right', padx=10)
        
        # 2. 상태 표시 줄
        status_frame = ttk.Frame(self.root)
        status_frame.pack(side='top', fill='x', padx=10, pady=5)
        
        ttk.Label(status_frame, text="상태:", style='Status.TLabel').pack(side='left', padx=5)
        self.status_label = ttk.Label(status_frame, text="● 대기 중", style='Status.TLabel', foreground=COLORS['text_dim'])
        self.status_label.pack(side='left', padx=5)
        
        # 3. 버튼 패널
        button_frame = ttk.Frame(self.root)
        button_frame.pack(side='top', fill='x', padx=10, pady=10)
        
        self.start_btn = tk.Button(
            button_frame,
            text="▶ 백엔드 시작",
            command=self.start_backend,
            bg=COLORS['success'],
            fg='black',
            font=('Segoe UI', 10, 'bold'),
            padx=15,
            pady=8,
            relief='flat',
            cursor='hand2',
            state='disabled' if not self.is_local else 'normal'
        )
        self.start_btn.pack(side='left', padx=5)
        
        self.stop_btn = tk.Button(
            button_frame,
            text="⏹ 백엔드 종료",
            command=self.stop_backend,
            bg=COLORS['error'],
            fg='black',
            font=('Segoe UI', 10, 'bold'),
            padx=15,
            pady=8,
            relief='flat',
            cursor='hand2',
            state='disabled'
        )
        self.stop_btn.pack(side='left', padx=5)
        
        self.restart_btn = tk.Button(
            button_frame,
            text="🔄 재시작",
            command=self.restart_backend,
            bg=COLORS['warning'],
            fg='black',
            font=('Segoe UI', 10, 'bold'),
            padx=15,
            pady=8,
            relief='flat',
            cursor='hand2',
            state='disabled'
        )
        self.restart_btn.pack(side='left', padx=5)
        
        # 원격 서버인 경우 설명
        if not self.is_local:
            remote_info = tk.Label(
                button_frame,
                text="⚠️  원격 서버는 모니터링만 가능합니다 (제어 불가)",
                fg=COLORS['warning'],
                bg=COLORS['bg_main'],
                font=('Segoe UI', 9)
            )
            remote_info.pack(side='right', padx=10)
        
        # 4. 로그 창
        log_label = ttk.Label(self.root, text="📋 백엔드 로그", style='Status.TLabel')
        log_label.pack(side='top', fill='x', padx=10, pady=(10, 5))
        
        self.log_text = scrolledtext.ScrolledText(
            self.root,
            height=15,
            width=120,
            bg=COLORS['bg_log'],
            fg=COLORS['text_main'],
            insertbackground=COLORS['text_main'],
            font=('Courier New', 9),
            relief='solid',
            borderwidth=1,
            wrap='word'
        )
        self.log_text.pack(side='top', fill='both', expand=True, padx=10, pady=(0, 10))
        self.log_text.config(state='disabled')
        
        # 로그 태그 설정
        self.log_text.tag_configure('MAJOR', foreground=LOG_COLORS['MAJOR'], font=('Courier New', 9, 'bold'))
        self.log_text.tag_configure('MINOR', foreground=LOG_COLORS['MINOR'])
        self.log_text.tag_configure('CRITICAL', foreground=LOG_COLORS['CRITICAL'], font=('Courier New', 9, 'bold'))
        self.log_text.tag_configure('WARNING', foreground=LOG_COLORS['WARNING'])
        self.log_text.tag_configure('timestamp', foreground=COLORS['text_dim'], font=('Courier New', 8))
        
        # 5. 프로젝트 모니터링 패널
        project_frame = ttk.Frame(self.root)
        project_frame.pack(side='bottom', fill='x', padx=10, pady=10)
        
        ttk.Label(project_frame, text="📦 모니터링 프로젝트:", style='Status.TLabel').pack(side='left', padx=5)
        self.project_label = ttk.Label(project_frame, text="없음", style='Mono.TLabel', foreground=COLORS['text_dim'])
        self.project_label.pack(side='left', padx=5, fill='x', expand=True)

        entry_frame = tk.Frame(project_frame, bg=COLORS['bg_main'])
        entry_frame.pack(side='right')

        self.project_entry = tk.Entry(
            entry_frame,
            width=24,
            font=('Courier New', 9),
            bg=COLORS['button_bg'],
            fg=COLORS['text_main'],
            insertbackground=COLORS['text_main']
        )
        self.project_entry.pack(side='left', padx=6)

        self.project_btn = tk.Button(
            entry_frame,
            text="모니터링",
            command=self.start_project_monitoring,
            bg=COLORS['info'],
            fg='black',
            font=('Segoe UI', 9, 'bold'),
            padx=10,
            pady=4,
            relief='flat',
            cursor='hand2'
        )
        self.project_btn.pack(side='left')

    def show_main_screen(self):
        """메인 모니터 화면 표시"""
        self.create_widgets()
        # self.check_backend_status()  # 헬스 체크 로그 비활성화
        
    def log_message(self, level: str, step: str, message: str):
        """구조화된 로그 출력"""
        timestamp = datetime.now().strftime('%H:%M:%S')
        
        self.log_text.config(state='normal')
        
        # 타임스탐프
        self.log_text.insert(tk.END, f'[{timestamp}] ', 'timestamp')
        
        # 로그 레벨
        if level in LOG_COLORS:
            self.log_text.insert(tk.END, f'[{level}] ', level)
        else:
            self.log_text.insert(tk.END, f'[{level}] ', 'MINOR')
        
        # 단계
        self.log_text.insert(tk.END, f'[{step}] ', 'MINOR')
        
        # 메시지
        self.log_text.insert(tk.END, f'{message}\n')
        
        # 자동 스크롤
        self.log_text.see(tk.END)
        self.log_text.config(state='disabled')
    
    def start_backend(self):
        """백엔드 시작"""
        if not self.is_local:
            messagebox.showerror("오류", "원격 서버는 제어할 수 없습니다.\n로컬 백엔드를 선택해주세요.")
            return
        
        if self.is_running:
            messagebox.showwarning("경고", "백엔드가 이미 실행 중입니다.")
            return
        
        self.log_message('MAJOR', 'BACKEND', '백엔드 시작 중...')
        
        def run_backend():
            try:
                os.chdir(self.backend_dir)

                # exe에서 실행 시 sys.executable은 자기 자신이므로 실제 python을 선택
                if getattr(sys, 'frozen', False):
                    venv_python = self.backend_dir / ".venv" / "Scripts" / "python.exe"
                    python_cmd = str(venv_python) if venv_python.exists() else "python"
                else:
                    python_cmd = sys.executable
                
                # Windows에서 콘솔 창이 안 나타나도록 설정
                startupinfo = None
                creationflags = 0
                if sys.platform == 'win32':
                    startupinfo = subprocess.STARTUPINFO()
                    startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
                    startupinfo.wShowWindow = subprocess.SW_HIDE
                    creationflags = subprocess.CREATE_NO_WINDOW
                
                self.backend_process = subprocess.Popen(
                    [python_cmd, 'main.py'],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    universal_newlines=True,
                    bufsize=1,
                    creationflags=creationflags,
                    startupinfo=startupinfo
                )
                
                self.is_running = True
                self.update_button_states()
                self.status_label.config(text="● 실행 중", foreground=COLORS['success'])
                self.log_message('MAJOR', 'BACKEND', '✅ 백엔드 시작됨 (PID: {})'.format(self.backend_process.pid))
                
                # 로그 출력
                for line in self.backend_process.stdout:
                    line = line.rstrip()
                    if line:
                        # 백엔드 로그 파싱
                        self._parse_and_log(line)
                
                self.backend_process.wait()
                self.is_running = False
                self.update_button_states()
                self.status_label.config(text="● 중지됨", foreground=COLORS['error'])
                self.log_message('CRITICAL', 'BACKEND', '❌ 백엔드 중지됨')
                
            except Exception as e:
                self.log_message('CRITICAL', 'BACKEND', f'❌ 오류: {str(e)}')
                self.is_running = False
                self.update_button_states()
        
        thread = threading.Thread(target=run_backend, daemon=True)
        thread.start()
    
    def stop_backend(self):
        """백엔드 종료"""
        if not self.is_running or not self.backend_process:
            messagebox.showwarning("경고", "실행 중인 백엔드가 없습니다.")
            return
        
        self.log_message('MAJOR', 'BACKEND', '백엔드 종료 중...')
        
        try:
            # Graceful shutdown 시도
            self.backend_process.terminate()
            try:
                self.backend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                # Timeout 시 강제 종료
                self.backend_process.kill()
            
            self.is_running = False
            self.update_button_states()
            self.status_label.config(text="● 중지됨", foreground=COLORS['error'])
            self.log_message('MAJOR', 'BACKEND', '✅ 백엔드 종료됨')
            
        except Exception as e:
            self.log_message('CRITICAL', 'BACKEND', f'❌ 종료 오류: {str(e)}')
    
    def restart_backend(self):
        """백엔드 재시작"""
        self.log_message('MAJOR', 'BACKEND', '백엔드 재시작 중...')
        if self.is_running:
            self.stop_backend()
            time.sleep(2)
        self.start_backend()
    
    def update_button_states(self):
        """버튼 상태 업데이트"""
        self.start_btn.config(state='disabled' if self.is_running else 'normal')
        self.stop_btn.config(state='normal' if self.is_running else 'disabled')
        self.restart_btn.config(state='normal' if self.is_running else 'disabled')
    
    def _parse_and_log(self, line: str):
        """백엔드 로그 파싱"""
        # [timestamp] [LEVEL] [STEP] message 형식
        if '[' in line and ']' in line:
            parts = line.split('] ', 3)
            if len(parts) >= 3:
                timestamp = parts[0].strip('[')
                level = parts[1].strip('[]')
                step = parts[2].strip('[]')
                message = parts[3] if len(parts) > 3 else ""
                
                self.log_message(level, step, message)
            else:
                self.log_message('MINOR', 'LOG', line)
        else:
            self.log_message('MINOR', 'LOG', line)

    def _set_project_label(self, text: str, color: str = None):
        """프로젝트 라벨 업데이트 (UI 스레드 안전)"""
        def apply():
            if color:
                self.project_label.config(text=text, foreground=color)
            else:
                self.project_label.config(text=text)
        self.root.after(0, apply)

    def start_project_monitoring(self):
        """프로젝트 진행 상태 모니터링 시작"""
        project_id = self.project_entry.get().strip()
        if not project_id:
            messagebox.showwarning("경고", "프로젝트 ID를 입력하세요.")
            return

        self.project_id = project_id
        self._set_project_label(f"{project_id} (대기 중)", COLORS['text_dim'])

        if not self.project_monitoring:
            self.project_monitoring = True
            thread = threading.Thread(target=self._poll_project_status, daemon=True)
            thread.start()

    def _poll_project_status(self):
        """프로젝트 상태 주기적 조회"""
        while self.project_monitoring:
            time.sleep(3)
            if not self.project_id:
                continue
            try:
                response = requests.get(
                    f"{self.api_url}/api/project-status/{self.project_id}",
                    timeout=3
                )
                if response.status_code != 200:
                    self._set_project_label(
                        f"{self.project_id} (응답 없음)",
                        COLORS['warning']
                    )
                    continue

                data = response.json()
                stage = data.get("stage", "unknown")
                status = data.get("status", "pending")
                current = data.get("current", 0)
                total = data.get("total", 0)
                details = data.get("details", "")
                progress = f"{current}/{total}" if total else f"{current}"

                label_text = f"{self.project_id} | {status} | {stage} {progress}"
                if details:
                    label_text = f"{label_text} | {details}"

                if status == "completed":
                    color = COLORS['success']
                elif status == "failed":
                    color = COLORS['error']
                else:
                    color = COLORS['text_dim']

                self._set_project_label(label_text, color)
            except Exception:
                self._set_project_label(
                    f"{self.project_id} (오류)",
                    COLORS['warning']
                )
    
    def check_backend_status(self):
        """백엔드 상태 주기적 확인"""
        def check():
            while True:
                time.sleep(5)
                if self.is_running:
                    try:
                        response = requests.get(f'{self.api_url}/api/health', timeout=2)
                        if response.status_code != 200:
                            self.status_label.config(text="● 응답 없음", foreground=COLORS['warning'])
                    except:
                        if self.is_running:
                            self.status_label.config(text="● 응답 없음", foreground=COLORS['warning'])
        
        thread = threading.Thread(target=check, daemon=True)
        thread.start()
    
    def on_closing(self):
        """창 종료 시"""
        self.project_monitoring = False
        if self.is_running:
            keep_running = messagebox.askyesno(
                "종료 확인",
                "백엔드가 실행 중입니다.\n\n모니터만 닫고 백엔드는 계속 실행할까요?"
            )
            if not keep_running:
                self.stop_backend()
        self.root.destroy()

def main():
    root = tk.Tk()
    app = VlooMonitor(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()

if __name__ == "__main__":
    main()
